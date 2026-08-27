import { execFileSync, spawn, spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const script = resolve(import.meta.dirname, "candidate-fingerprint.mjs");

function run(command, args, cwd) {
  return execFileSync(command, args, { cwd, encoding: "utf8" });
}

function closeRefs(repository) {
  return run(
    "git",
    ["for-each-ref", "--format=%(refname)", "refs/aidioma/close"],
    repository,
  ).trim().split("\n").filter(Boolean);
}

function fingerprint(cwd, scopes, outputPath) {
  const args = [script];
  if (outputPath) {
    args.push("--output", outputPath);
  }
  args.push("--", ...scopes);
  return JSON.parse(run(process.execPath, args, cwd));
}

function rejectedFingerprint(cwd, scopes, outputPath) {
  const args = [script];
  if (outputPath) {
    args.push("--output", outputPath);
  }
  args.push("--", ...scopes);
  const result = spawnSync(process.execPath, args, { cwd, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  return result.stderr;
}

function fingerprintProcess(cwd, scopes, outputPath) {
  return new Promise((resolveProcess) => {
    const child = spawn(process.execPath, [script, "--output", outputPath, "--", ...scopes], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.setEncoding("utf8").on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (status) => resolveProcess({ status, stdout, stderr }));
  });
}

function withRepository(callback) {
  const repository = mkdtempSync(join(tmpdir(), "aidioma-candidate-test-"));
  try {
    run("git", ["init", "-q"], repository);
    run("git", ["config", "user.email", "candidate@example.invalid"], repository);
    run("git", ["config", "user.name", "Candidate Test"], repository);
    mkdirSync(join(repository, "Docs", "Evidence"), { recursive: true });
    writeFileSync(join(repository, "a.txt"), "base\n");
    writeFileSync(join(repository, "b.txt"), "delete me\n");
    run("git", ["add", "a.txt", "b.txt"], repository);
    run("git", ["commit", "-qm", "base"], repository);
    callback(repository);
  } finally {
    rmSync(repository, { recursive: true, force: true });
  }
}

test("pins canonical modes, untracked files, deletions, and a GC-reachable commit", () => {
  withRepository((repository) => {
    writeFileSync(join(repository, "a.txt"), "reviewed\n");
    unlinkSync(join(repository, "b.txt"));
    writeFileSync(join(repository, "c.sh"), "#!/bin/sh\nexit 0\n");
    chmodSync(join(repository, "c.sh"), 0o755);

    const first = fingerprint(repository, ["a.txt", "b.txt", "c.sh"]);
    const equivalent = fingerprint(repository, ["./c.sh", "a.txt", "a.txt", "./b.txt"]);
    assert.equal(first.candidate, equivalent.candidate);
    assert.equal(first.commit, equivalent.commit);
    assert.deepEqual(first.scopes, ["a.txt", "b.txt", "c.sh"]);
    assert.equal(first.files.find((file) => file.path === "b.txt")?.state, "deleted");
    assert.equal(first.files.find((file) => file.path === "c.sh")?.mode, "100755");
    assert.equal(run("git", ["show", `${first.commit}:a.txt`], repository), "reviewed\n");
    assert.equal(run("git", ["rev-parse", first.ref], repository).trim(), first.commit);
    assert.equal(run("git", ["rev-parse", `${first.ref}^{tree}`], repository).trim(), first.tree);

    writeFileSync(join(repository, "a.txt"), "changed after pin\n");
    assert.equal(run("git", ["show", `${first.commit}:a.txt`], repository), "reviewed\n");
  });
});

test("retains an intentionally absent scope without failing Git pathspec validation", () => {
  withRepository((repository) => {
    const manifest = fingerprint(repository, ["removed-development-system"]);
    assert.deepEqual(manifest.scopes, ["removed-development-system"]);
    assert.deepEqual(manifest.files, []);
    assert.equal(run("git", ["rev-parse", `${manifest.ref}^{tree}`], repository).trim(), manifest.tree);
  });
});

test("retained evidence outside scope is stable across unchanged runs", () => {
  withRepository((repository) => {
    writeFileSync(join(repository, "a.txt"), "reviewed\n");
    const output = "Docs/Evidence/target/candidate.json";
    const first = fingerprint(repository, ["a.txt"], output);
    const second = fingerprint(repository, ["a.txt"], output);
    assert.equal(first.candidate, second.candidate);
    assert.equal(JSON.parse(readFileSync(join(repository, output), "utf8")).candidate, first.candidate);

    const retained = readFileSync(join(repository, output), "utf8");
    writeFileSync(join(repository, "a.txt"), "changed after retention\n");
    assert.match(
      rejectedFingerprint(repository, ["a.txt"], output),
      /refusing to overwrite candidate/u,
    );
    assert.equal(readFileSync(join(repository, output), "utf8"), retained);
    assert.deepEqual(closeRefs(repository), [first.ref]);
  });
});

test("treats Git pathspec-like scope names as literal repository paths", () => {
  withRepository((repository) => {
    const hostileNames = [
      ":",
      ":(top)",
      "*.txt",
      ":(exclude)a.txt",
      "name:colon.txt",
      "--output",
      "--",
    ];
    for (const path of hostileNames) {
      writeFileSync(join(repository, path), `${path}\n`);
      const manifest = fingerprint(repository, [path]);
      assert.deepEqual(manifest.scopes, [path]);
      assert.deepEqual(manifest.files.map((file) => file.path), [path]);
    }
  });
});

test("rejects repository attributes and isolates candidate-affecting Git config", () => {
  withRepository((repository) => {
    writeFileSync(join(repository, "a.txt"), "scoped\r\n");
    writeFileSync(join(repository, ".gitignore"), ".gitattributes\n");
    writeFileSync(join(repository, ".gitattributes"), "*.txt text eol=lf\n");
    assert.match(
      rejectedFingerprint(repository, ["a.txt"], null),
      /does not support repository .gitattributes/u,
    );
    assert.deepEqual(closeRefs(repository), []);
    assert.match(
      rejectedFingerprint(repository, [".gitattributes", "a.txt"], null),
      /does not support repository .gitattributes/u,
    );
    unlinkSync(join(repository, ".gitattributes"));

    writeFileSync(join(repository, ".gitattributes"), "*.txt text eol=lf\n");
    run("git", ["add", "-f", ".gitattributes"], repository);
    run("git", ["commit", "-qm", "track attributes"], repository);
    unlinkSync(join(repository, ".gitattributes"));
    run("git", ["add", "-u", ".gitattributes"], repository);
    assert.match(
      rejectedFingerprint(repository, ["a.txt"], null),
      /does not support repository .gitattributes/u,
    );
    assert.deepEqual(closeRefs(repository), []);
    run("git", ["commit", "-qm", "remove attributes"], repository);

    writeFileSync(join(repository, ".git", "info", "attributes"), "*.txt -text\n");
    assert.match(
      rejectedFingerprint(repository, ["a.txt"], null),
      /info\/attributes must be empty/u,
    );
    unlinkSync(join(repository, ".git", "info", "attributes"));

    chmodSync(join(repository, "a.txt"), 0o755);
    const globalAttributes = join(repository, "global-attributes");
    writeFileSync(globalAttributes, "*.txt filter=demo\n");
    run("git", ["config", "core.attributesFile", globalAttributes], repository);
    run("git", ["config", "core.autocrlf", "true"], repository);
    run("git", ["config", "core.safecrlf", "true"], repository);
    run("git", ["config", "core.filemode", "false"], repository);
    run("git", ["config", "filter.demo.clean", "sed s/scoped/ONE/"], repository);
    run("git", ["config", "i18n.commitEncoding", "ISO-8859-1"], repository);
    const first = fingerprint(repository, ["a.txt"]);

    run("git", ["config", "core.autocrlf", "false"], repository);
    run("git", ["config", "core.safecrlf", "false"], repository);
    run("git", ["config", "core.filemode", "true"], repository);
    run("git", ["config", "filter.demo.clean", "sed s/scoped/TWO/"], repository);
    run("git", ["config", "i18n.commitEncoding", "UTF-16"], repository);
    const second = fingerprint(repository, ["a.txt"]);
    assert.equal(first.candidate, second.candidate);
    assert.equal(first.commit, second.commit);
    assert.equal(first.ref, second.ref);
    assert.equal(first.files.find((file) => file.path === "a.txt")?.mode, "100755");
  });
});

test("rejects external, broad-scope, and deliverable-overwrite outputs", () => {
  withRepository((repository) => {
    const external = join(repository, "..", `outside-${Date.now()}.json`);
    assert.match(rejectedFingerprint(repository, ["a.txt"], external), /output escapes repository/u);
    assert.equal(existsSync(external), false);

    const broadOutput = "Docs/Evidence/broad/candidate.json";
    assert.match(rejectedFingerprint(repository, ["."], broadOutput), /output overlaps candidate scope/u);
    assert.equal(existsSync(join(repository, broadOutput)), false);

    const protectedOutput = "Docs/Evidence/protected.json";
    writeFileSync(join(repository, protectedOutput), "do not replace\n");
    assert.match(
      rejectedFingerprint(repository, [protectedOutput], protectedOutput),
      /output overlaps candidate scope/u,
    );
    assert.equal(readFileSync(join(repository, protectedOutput), "utf8"), "do not replace\n");

    const danglingOutput = "Docs/Evidence/dangling.json";
    const danglingTarget = join(repository, "..", `dangling-target-${Date.now()}.json`);
    symlinkSync(danglingTarget, join(repository, danglingOutput));
    assert.match(
      rejectedFingerprint(repository, ["a.txt"], danglingOutput),
      /refusing symlinked output/u,
    );
    assert.equal(existsSync(danglingTarget), false);
    rmSync(danglingTarget, { force: true });

    mkdirSync(join(repository, "deliverable"));
    symlinkSync("../../deliverable", join(repository, "Docs", "Evidence", "alias"));
    assert.match(
      rejectedFingerprint(repository, ["deliverable"], "Docs/Evidence/alias/candidate.json"),
      /symlinked output ancestor/u,
    );
    assert.equal(existsSync(join(repository, "deliverable", "candidate.json")), false);
  });
});

test("atomically retains only one of two competing candidates", async () => {
  const repository = mkdtempSync(join(tmpdir(), "aidioma-candidate-race-test-"));
  try {
    run("git", ["init", "-q"], repository);
    run("git", ["config", "user.email", "candidate@example.invalid"], repository);
    run("git", ["config", "user.name", "Candidate Test"], repository);
    mkdirSync(join(repository, "Docs", "Evidence"), { recursive: true });
    writeFileSync(join(repository, "a.txt"), "base a\n");
    writeFileSync(join(repository, "b.txt"), "base b\n");
    run("git", ["add", "a.txt", "b.txt"], repository);
    run("git", ["commit", "-qm", "base"], repository);
    writeFileSync(join(repository, "a.txt"), "candidate a\n");
    writeFileSync(join(repository, "b.txt"), "candidate b\n");

    const output = "Docs/Evidence/race/candidate.json";
    const results = await Promise.all([
      fingerprintProcess(repository, ["a.txt"], output),
      fingerprintProcess(repository, ["b.txt"], output),
    ]);
    assert.deepEqual(results.map((result) => result.status).sort(), [0, 1]);
    const winner = results.find((result) => result.status === 0);
    const loser = results.find((result) => result.status === 1);
    assert.match(loser.stderr, /another candidate already retained/u);
    assert.equal(
      JSON.parse(readFileSync(join(repository, output), "utf8")).candidate,
      JSON.parse(winner.stdout).candidate,
    );
    assert.deepEqual(closeRefs(repository), [JSON.parse(winner.stdout).ref]);
  } finally {
    rmSync(repository, { recursive: true, force: true });
  }
});

test("requires explicit scopes and evidence-only JSON output", () => {
  withRepository((repository) => {
    assert.match(rejectedFingerprint(repository, [], null), /explicit candidate scope/u);
    assert.match(rejectedFingerprint(repository, ["a.txt"], "candidate.json"), /under Docs\/Evidence/u);
    assert.match(
      rejectedFingerprint(repository, ["a.txt"], "Docs/Evidence/candidate.txt"),
      /.json file/u,
    );
  });
});
