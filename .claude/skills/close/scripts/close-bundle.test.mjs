import { execFileSync, spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";

const candidateScript = resolve(import.meta.dirname, "candidate-fingerprint.mjs");
const bundleScript = resolve(import.meta.dirname, "close-bundle.mjs");
const checkProofScript = resolve(import.meta.dirname, "check-proof.mjs");
const publishSkill = resolve(import.meta.dirname, "..", "..", "publish", "SKILL.md");

function run(command, args, cwd) {
  return execFileSync(command, args, { cwd, encoding: "utf8" });
}

function runWithEnv(command, args, cwd, environment) {
  return execFileSync(command, args, { cwd, encoding: "utf8", env: { ...process.env, ...environment } });
}

function reject(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  return result.stderr;
}

function withRepository(callback) {
  const repository = mkdtempSync(join(tmpdir(), "aidioma-bundle-test-"));
  try {
    run("git", ["init", "-q"], repository);
    run("git", ["config", "user.email", "bundle@example.invalid"], repository);
    run("git", ["config", "user.name", "Bundle Test"], repository);
    writeFileSync(join(repository, "base.txt"), "base\n");
    run("git", ["add", "base.txt"], repository);
    run("git", ["commit", "-qm", "base"], repository);
    mkdirSync(join(repository, "Docs", "Evidence", "task"), { recursive: true });
    writeFileSync(join(repository, "work.txt"), "reviewed work\n");
    writeFileSync(
      join(repository, "Docs", "Evidence", "task", "target.json"),
      `${JSON.stringify({
        version: 1,
        id: "T-TEST",
        kind: "task",
        evidence_dir: "Docs/Evidence/task",
        risk_tier: 1,
        outcome: "Prove the close receipt",
        proof: ["The immutable receipt verifies."],
        non_goals: [],
        required_lenses: gateNamesForTest().slice(0, 6),
        check_commands: [[process.execPath, "-e", "process.exit(0)"]],
        check_environment: [],
        check_timeout_ms: 10000,
        scopes: ["Docs/Evidence/task/target.json", "work.txt"],
      }, null, 2)}\n`,
    );
    writeFileSync(join(repository, "Docs", "Evidence", "task", "close-audits.md"), "all gates pass\n");
    callback(repository);
  } finally {
    rmSync(repository, { recursive: true, force: true });
  }
}

function createCandidate(repository) {
  const output = "Docs/Evidence/task/candidate.json";
  const manifest = JSON.parse(
    run(
      process.execPath,
      [candidateScript, "--output", output, "--", "work.txt", "Docs/Evidence/task/target.json"],
      repository,
    ),
  );
  return { output, manifest };
}

function createBundle(repository, candidatePath, extras = []) {
  return JSON.parse(run(process.execPath, bundleArguments(candidatePath, extras), repository));
}

function bundleArguments(candidatePath, extras = []) {
  return [
    bundleScript,
    "create",
    "--manifest",
    candidatePath,
    "--target",
    "Docs/Evidence/task/target.json",
    "--close-record",
    "Docs/Evidence/task/close-record.json",
    "--check-results",
    "Docs/Evidence/task/check-results.json",
    "--audit-results",
    "Docs/Evidence/task/audit-results.json",
    "--report",
    "Docs/Evidence/task/close-audits.md",
    "--output",
    "Docs/Evidence/task/close-bundle.json",
    ...extras,
  ];
}

function spawnBundle(repository, candidatePath) {
  return new Promise((resolveProcess) => {
    const child = spawn(process.execPath, bundleArguments(candidatePath), {
      cwd: repository,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", (chunk) => { stderr += chunk; });
    child.on("close", (status) => resolveProcess({ status, stdout, stderr }));
  });
}

function writeCloseRecord(repository, manifest) {
  const target = JSON.parse(readFileSync(join(repository, "Docs", "Evidence", "task", "target.json"), "utf8"));
  const gates = Object.fromEntries(gateNamesForTest().map((lens) => [
    lens,
    target.required_lenses.includes(lens) ? "PASS" : "n/a — no learner behavior changed",
  ]));
  writeFileSync(
    join(repository, "Docs", "Evidence", "task", "close-record.json"),
    `${JSON.stringify({
      version: 1,
      target: "T-TEST",
      candidate: manifest.candidate,
      final_check: "PASS",
      gates,
      accepted_warnings: [],
      authority_comparison: "PASS",
      report: "Docs/Evidence/task/close-audits.md",
      bundle: "Docs/Evidence/task/close-bundle.json",
      publication_at_close: "not_requested",
    }, null, 2)}\n`,
  );
  writeAuditResults(repository, manifest);
  writeCheckResults(repository, manifest);
}

function writeAuditResults(repository, manifest) {
  const directory = join(repository, "Docs", "Evidence", "task", "audits");
  mkdirSync(directory, { recursive: true });
  const target = JSON.parse(readFileSync(join(repository, "Docs", "Evidence", "task", "target.json"), "utf8"));
  const auditors = ["agent-claims", "agent-standards", "agent-claims", "agent-seams", "agent-security", "agent-provider", "agent-claims"];
  const attempts = target.required_lenses.map((lens, attemptIndex) => {
    const index = gateNamesForTest().indexOf(lens);
    const response = [
      "TARGET: Docs/Evidence/task/target.json",
      `LENS: ${lens}`,
      "RESULT: PASS",
      `CANDIDATE: ${manifest.candidate}`,
      "BLOCKERS: none",
      "FINDINGS:",
      "- Inspected the immutable candidate and found no blocker.",
      "REMEDIATION: none",
      "",
    ].join("\n");
    const filename = `${String(index + 1).padStart(2, "0")}.txt`;
    const responsePath = `Docs/Evidence/task/audits/${filename}`;
    writeFileSync(join(directory, filename), response);
    return {
      id: `A${attemptIndex + 1}`,
      at: `2024-02-29T23:59:${String(50 + attemptIndex).padStart(2, "0")}Z`,
      lens,
      auditor: auditors[index],
      verdict: "PASS",
      candidate: manifest.candidate,
      manifest: "Docs/Evidence/task/candidate.json",
      manifest_sha256: createHash("sha256").update(readFileSync(join(repository, "Docs", "Evidence", "task", "candidate.json"))).digest("hex"),
      response: responsePath,
      response_sha256: createHash("sha256").update(response).digest("hex"),
    };
  });
  const results = attempts.map((attempt) => ({ lens: attempt.lens, attempt: attempt.id }));
  writeFileSync(
    join(repository, "Docs", "Evidence", "task", "audit-results.json"),
    `${JSON.stringify({
      version: 1,
      target: "T-TEST",
      candidate: manifest.candidate,
      report: "Docs/Evidence/task/close-audits.md",
      attempts,
      results,
    }, null, 2)}\n`,
  );
  writeFileSync(
    join(repository, "Docs", "Evidence", "task", "close-audits.md"),
    `# Audit history\n\nCandidate: ${manifest.candidate}\n\nAudit results: [structured](Docs/Evidence/task/audit-results.json)\n\n| Attempt | At (UTC) | Lens | Result | Candidate | Brief | Canonical response | Remediation |\n|---|---|---|---|---|---|---|---|\n${attempts.map((attempt) => `| ${attempt.id} | ${attempt.at} | ${attempt.lens} | ${attempt.verdict} | \`${attempt.candidate}\` | Inspected immutable candidate. | [response](${attempt.response}) | None. |`).join("\n")}\n`,
  );
  if (existsSync(join(repository, "Docs", "Evidence", "task", "check-results.json"))) {
    appendTaskCheckIndex(repository, manifest);
  }
}

function writeCheckResults(repository, manifest) {
  const path = "Docs/Evidence/task/check-results.json";
  const proofPath = "Docs/Evidence/task/checks/C1-01.json";
  mkdirSync(join(repository, "Docs", "Evidence", "task", "checks"), { recursive: true });
  const proof = {
    version: 1,
    candidate: manifest.candidate,
    commit: manifest.commit,
    tree: manifest.tree,
    command: [process.execPath, "-e", "process.exit(0)"],
    started_at: "2024-02-29T23:59:59Z",
    finished_at: "2024-02-29T23:59:59Z",
    exit_code: 0,
    signal: null,
    stdout: "",
    stderr: "",
  };
  const proofBytes = `${JSON.stringify(proof, null, 2)}\n`;
  writeFileSync(join(repository, proofPath), proofBytes);
  const attempts = [{
    id: "C1",
    at: "2024-02-29T23:59:59Z",
    candidate: manifest.candidate,
    manifest: "Docs/Evidence/task/candidate.json",
    manifest_sha256: createHash("sha256").update(readFileSync(join(repository, "Docs", "Evidence", "task", "candidate.json"))).digest("hex"),
    verdict: "PASS",
    proofs: [{ path: proofPath, sha256: createHash("sha256").update(proofBytes).digest("hex") }],
    disposition: "Binding final check for this receipt.",
  }];
  writeFileSync(
    join(repository, path),
    `${JSON.stringify({
      version: 1,
      target: "T-TEST",
      candidate: manifest.candidate,
      report: "Docs/Evidence/task/close-audits.md",
      attempts,
      final_attempt: "C1",
    }, null, 2)}\n`,
  );
  appendTaskCheckIndex(repository, manifest);
}

function appendTaskCheckIndex(repository, manifest) {
  const path = "Docs/Evidence/task/check-results.json";
  const reportPath = join(repository, "Docs", "Evidence", "task", "close-audits.md");
  writeFileSync(
    reportPath,
    `${readFileSync(reportPath, "utf8")}\n## Check history\n\nCheck results: [structured](${path})\n\n| Check | At (UTC) | Result | Candidate | Proof | Disposition |\n|---|---|---|---|---|---|\n| C1 | 2024-02-29T23:59:59Z | PASS | \`${manifest.candidate}\` | [proof](Docs/Evidence/task/checks/C1-01.json) | Binding final check. |\n`,
  );
}

function setAuditVerdict(repository, lens, verdict) {
  const path = join(repository, "Docs", "Evidence", "task", "audit-results.json");
  const audits = JSON.parse(readFileSync(path, "utf8"));
  const result = audits.results.find((entry) => entry.lens === lens);
  const attempt = audits.attempts.find((entry) => entry.id === result.attempt);
  attempt.verdict = verdict;
  const response = readFileSync(join(repository, attempt.response), "utf8")
    .replace(/^RESULT: .*$/mu, `RESULT: ${verdict}`);
  writeFileSync(join(repository, attempt.response), response);
  attempt.response_sha256 = createHash("sha256").update(response).digest("hex");
  writeFileSync(path, `${JSON.stringify(audits, null, 2)}\n`);
  const reportPath = join(repository, "Docs", "Evidence", "task", "close-audits.md");
  writeFileSync(
    reportPath,
    readFileSync(reportPath, "utf8").replace(
      `| ${attempt.id} | ${attempt.at} | ${attempt.lens} | PASS |`,
      `| ${attempt.id} | ${attempt.at} | ${attempt.lens} | ${verdict} |`,
    ),
  );
}

function rewriteAuditResponse(repository, index, transform) {
  const auditsPath = join(repository, "Docs", "Evidence", "task", "audit-results.json");
  const audits = JSON.parse(readFileSync(auditsPath, "utf8"));
  const attempt = audits.attempts[index];
  const responsePath = join(repository, attempt.response);
  const response = transform(readFileSync(responsePath, "utf8"));
  writeFileSync(responsePath, response);
  attempt.response_sha256 = createHash("sha256").update(response).digest("hex");
  writeFileSync(auditsPath, `${JSON.stringify(audits, null, 2)}\n`);
}

test("creates and verifies a deterministic immutable receipt", () => {
  withRepository((repository) => {
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    const created = createBundle(repository, output);
    const verified = JSON.parse(
      run(
        process.execPath,
        [bundleScript, "verify", "--bundle", "Docs/Evidence/task/close-bundle.json", "--replay-checks", "yes"],
        repository,
      ),
    );
    assert.equal(created.receipt_commit, verified.receipt_commit);
    assert.equal(created.receipt_ref, verified.receipt_ref);
    assert.equal(run("git", ["rev-parse", `${created.receipt_commit}^`], repository).trim(), manifest.commit);
    assert.equal(
      run("git", ["show", `${created.receipt_commit}:work.txt`], repository),
      "reviewed work\n",
    );
    assert.equal(
      run("git", ["show", `${created.receipt_commit}:Docs/Evidence/task/close-audits.md`], repository),
      readFileSync(join(repository, "Docs", "Evidence", "task", "close-audits.md"), "utf8"),
    );
    assert.equal(
      readFileSync(join(repository, "Docs", "Evidence", "task", "close-bundle.json"), "utf8"),
      run("git", ["show", `${created.receipt_commit}:Docs/Evidence/task/close-bundle.json`], repository),
    );
    const bundle = JSON.parse(readFileSync(join(repository, "Docs", "Evidence", "task", "close-bundle.json"), "utf8"));
    const allowedOverlay = new Set([
      "Docs/Evidence/task/close-bundle.json",
      ...bundle.files.map((record) => record.path),
    ]);
    const actualOverlay = run(
      "git",
      ["diff", "--name-only", manifest.commit, created.receipt_commit],
      repository,
    ).trim().split("\n").sort();
    assert.equal(actualOverlay.every((path) => allowedOverlay.has(path)), true);
    assert.equal(actualOverlay.includes("Docs/Evidence/task/audit-results.json"), true);
    assert.equal(actualOverlay.some((path) => path.startsWith("Docs/Evidence/task/audits/")), true);

    writeFileSync(join(repository, "Docs", "Evidence", "task", "close-audits.md"), "changed later\n");
    assert.match(
      reject(
        process.execPath,
        [bundleScript, "verify", "--bundle", "Docs/Evidence/task/close-bundle.json", "--replay-checks", "yes"],
        repository,
      ),
      /bundle file changed/u,
    );
  });
});

test("captures check proof from the retained candidate and rejects unsafe output", () => {
  withRepository((repository) => {
    const targetPath = join(repository, "Docs", "Evidence", "task", "target.json");
    const target = JSON.parse(readFileSync(targetPath, "utf8"));
    const provedCommand = [process.execPath, "-e", "process.stdout.write('proved')"];
    target.check_commands = [provedCommand];
    writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`);
    const { output, manifest } = createCandidate(repository);
    const proofPath = "Docs/Evidence/task/checks/proof.json";
    const proof = JSON.parse(run(
      process.execPath,
      [checkProofScript, "--manifest", output, "--output", proofPath, "--", ...provedCommand],
      repository,
    ));
    assert.equal(proof.candidate, manifest.candidate);
    assert.equal(proof.exit_code, 0);
    assert.equal(proof.stdout, "proved");

    const marker = join(tmpdir(), `aidioma-undeclared-${process.pid}-${Date.now()}`);
    assert.match(
      reject(
        process.execPath,
        [
          checkProofScript, "--manifest", output,
          "--output", "Docs/Evidence/task/checks/undeclared.json", "--",
          process.execPath, "-e", `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'ran')`,
        ],
        repository,
      ),
      /not declared/u,
    );
    assert.equal(existsSync(marker), false);

    assert.match(
      reject(
        process.execPath,
        [checkProofScript, "--manifest", output, "--output", "../outside-proof.json", "--", process.execPath, "-e", ""],
        repository,
      ),
      /escapes repository|must be under/u,
    );

    const outside = join(repository, "..", `proof-${process.pid}.json`);
    mkdirSync(join(repository, "Docs", "Evidence", "task", "checks"), { recursive: true });
    symlinkSync(outside, join(repository, "Docs", "Evidence", "task", "checks", "linked.json"));
    try {
      assert.match(
        reject(
          process.execPath,
          [checkProofScript, "--manifest", output, "--output", "Docs/Evidence/task/checks/linked.json", "--", process.execPath, "-e", ""],
          repository,
        ),
        /uses a symlink/u,
      );
    } finally {
      rmSync(outside, { force: true });
    }
  });
});

test("passes only allowlisted check environment without retaining secret values", () => {
  withRepository((repository) => {
    const targetPath = join(repository, "Docs", "Evidence", "task", "target.json");
    const target = JSON.parse(readFileSync(targetPath, "utf8"));
    target.check_environment = ["AIDIOMA_TEST_SECRET"];
    const secretCommand = [
      process.execPath,
      "-e",
      "process.stdout.write(process.env.AIDIOMA_TEST_SECRET);process.stderr.write(process.env.AIDIOMA_TEST_SECRET)",
    ];
    target.check_commands = [secretCommand];
    writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`);
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    const secret = "available-only-at-runtime";
    const proofPath = join(repository, "Docs", "Evidence", "task", "checks", "C1-01.json");
    rmSync(proofPath);
    const captured = JSON.parse(runWithEnv(
      process.execPath,
      [
        checkProofScript, "--manifest", output,
        "--output", "Docs/Evidence/task/checks/C1-01.json", "--", ...secretCommand,
      ],
      repository,
      { AIDIOMA_TEST_SECRET: secret },
    ));
    assert.equal(captured.stdout, "[REDACTED]");
    assert.equal(captured.stderr, "[REDACTED]");
    const checksPath = join(repository, "Docs", "Evidence", "task", "check-results.json");
    const checks = JSON.parse(readFileSync(checksPath, "utf8"));
    checks.attempts[0].at = captured.finished_at;
    checks.attempts[0].proofs[0].sha256 = createHash("sha256").update(readFileSync(proofPath)).digest("hex");
    writeFileSync(checksPath, `${JSON.stringify(checks, null, 2)}\n`);
    const reportPath = join(repository, "Docs", "Evidence", "task", "close-audits.md");
    writeFileSync(
      reportPath,
      readFileSync(reportPath, "utf8").replace(
        "| C1 | 2024-02-29T23:59:59Z | PASS |",
        `| C1 | ${captured.finished_at} | PASS |`,
      ),
    );
    const created = createBundle(repository, output);
    assert.equal(created.verified, true);
    const verifyArguments = [
      bundleScript, "verify", "--bundle", "Docs/Evidence/task/close-bundle.json", "--replay-checks", "yes",
    ];
    assert.match(reject(process.execPath, verifyArguments, repository), /environment variable is missing/u);
    const verified = JSON.parse(runWithEnv(process.execPath, verifyArguments, repository, {
      AIDIOMA_TEST_SECRET: secret,
    }));
    assert.equal(verified.verified, true);
    for (const path of [
      "Docs/Evidence/task/checks/C1-01.json",
      "Docs/Evidence/task/check-results.json",
      "Docs/Evidence/task/close-bundle.json",
    ]) {
      assert.equal(readFileSync(join(repository, path), "utf8").includes(secret), false);
    }
  });
});

test("bounds hung check capture with the candidate timeout", () => {
  withRepository((repository) => {
    const targetPath = join(repository, "Docs", "Evidence", "task", "target.json");
    const target = JSON.parse(readFileSync(targetPath, "utf8"));
    const hungCommand = [process.execPath, "-e", "process.on('SIGTERM',()=>{});setInterval(()=>{},1000)"];
    target.check_commands = [hungCommand];
    target.check_timeout_ms = 1000;
    writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`);
    const { output } = createCandidate(repository);
    const proof = JSON.parse(run(
      process.execPath,
      [
        checkProofScript, "--manifest", output,
        "--output", "Docs/Evidence/task/checks/timeout.json", "--",
        ...hungCommand,
      ],
      repository,
    ));
    assert.equal(proof.exit_code, 1);
    assert.equal(proof.signal, "SIGKILL");
  });
});

test("publish uses the authenticated explicit-replay verifier contract", () => {
  const text = readFileSync(publishSkill, "utf8");
  assert.match(
    text,
    /close-bundle\.mjs verify --bundle <linked bundle> --replay-checks yes/u,
  );
});

test("rejects external, symlinked, and duplicate evidence", () => {
  withRepository((repository) => {
    const { output } = createCandidate(repository);
    const manifest = JSON.parse(readFileSync(join(repository, output), "utf8"));
    writeCloseRecord(repository, manifest);
    const outside = join(repository, "..", `outside-${process.pid}.txt`);
    writeFileSync(outside, "outside\n");
    try {
      assert.match(
        reject(
          process.execPath,
          [
            bundleScript,
            "create",
            "--manifest",
            output,
            "--target",
            "Docs/Evidence/task/target.json",
            "--close-record",
            "Docs/Evidence/task/close-record.json",
            "--check-results",
            "Docs/Evidence/task/check-results.json",
            "--audit-results",
            "Docs/Evidence/task/audit-results.json",
            "--report",
            "Docs/Evidence/task/close-audits.md",
            "--output",
            "Docs/Evidence/task/close-bundle.json",
            "--artifact",
            outside,
          ],
          repository,
        ),
        /escapes repository/u,
      );
    } finally {
      rmSync(outside, { force: true });
    }

    symlinkSync("close-audits.md", join(repository, "Docs", "Evidence", "task", "linked.md"));
    assert.match(
      reject(
        process.execPath,
        [
          bundleScript,
          "create",
          "--manifest",
          output,
          "--target",
          "Docs/Evidence/task/target.json",
          "--close-record",
          "Docs/Evidence/task/close-record.json",
          "--check-results",
          "Docs/Evidence/task/check-results.json",
          "--audit-results",
          "Docs/Evidence/task/audit-results.json",
          "--report",
          "Docs/Evidence/task/close-audits.md",
          "--output",
          "Docs/Evidence/task/close-bundle.json",
          "--artifact",
          "Docs/Evidence/task/linked.md",
        ],
        repository,
      ),
      /uses a symlink/u,
    );
    assert.match(
      reject(
        process.execPath,
        [
          bundleScript,
          "create",
          "--manifest",
          output,
          "--target",
          "Docs/Evidence/task/target.json",
          "--close-record",
          "Docs/Evidence/task/close-record.json",
          "--check-results",
          "Docs/Evidence/task/check-results.json",
          "--audit-results",
          "Docs/Evidence/task/audit-results.json",
          "--report",
          "Docs/Evidence/task/close-audits.md",
          "--output",
          "Docs/Evidence/task/close-bundle.json",
          "--artifact",
          "Docs/Evidence/task/close-audits.md",
        ],
        repository,
      ),
      /duplicate or non-canonical/u,
    );
  });
});

test("verify authenticates the receipt before replaying checks", () => {
  withRepository((repository) => {
    const marker = join(tmpdir(), `aidioma-close-replay-${process.pid}-${Date.now()}`);
    const targetPath = join(repository, "Docs", "Evidence", "task", "target.json");
    const target = JSON.parse(readFileSync(targetPath, "utf8"));
    target.check_commands = [[process.execPath, "-e", `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'ran')`]];
    writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`);
    const { output } = createCandidate(repository);
    const manifest = JSON.parse(readFileSync(join(repository, output), "utf8"));
    writeCloseRecord(repository, manifest);
    const checksPath = join(repository, "Docs", "Evidence", "task", "check-results.json");
    const checks = JSON.parse(readFileSync(checksPath, "utf8"));
    const proofPath = join(repository, checks.attempts[0].proofs[0].path);
    const proof = JSON.parse(readFileSync(proofPath, "utf8"));
    proof.command = target.check_commands[0];
    const proofBytes = `${JSON.stringify(proof, null, 2)}\n`;
    writeFileSync(proofPath, proofBytes);
    checks.attempts[0].proofs[0].sha256 = createHash("sha256").update(proofBytes).digest("hex");
    writeFileSync(checksPath, `${JSON.stringify(checks, null, 2)}\n`);
    const created = createBundle(repository, output);
    rmSync(marker, { force: true });
    run("git", ["update-ref", "-d", created.receipt_ref, created.receipt_commit], repository);
    assert.match(
      reject(
        process.execPath,
        [bundleScript, "verify", "--bundle", "Docs/Evidence/task/close-bundle.json", "--replay-checks", "yes"],
        repository,
      ),
      /receipt ref is missing/u,
    );
    assert.notEqual(
      spawnSync("git", ["rev-parse", "--verify", created.receipt_ref], { cwd: repository }).status,
      0,
    );
    assert.equal(existsSync(marker), false, "untrusted proof command ran before receipt authentication");
  });
});

test("verify rejects a receipt ref moved to the wrong commit", () => {
  withRepository((repository) => {
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    const created = createBundle(repository, output);
    run("git", ["update-ref", created.receipt_ref, manifest.commit, created.receipt_commit], repository);
    assert.match(
      reject(
        process.execPath,
        [bundleScript, "verify", "--bundle", "Docs/Evidence/task/close-bundle.json", "--replay-checks", "yes"],
        repository,
      ),
      /does not resolve to expected commit/u,
    );
    assert.equal(run("git", ["rev-parse", created.receipt_ref], repository).trim(), manifest.commit);
  });
});

test("rejects task authority and scope contracts changed after audit", () => {
  withRepository((repository) => {
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    const targetPath = join(repository, "Docs", "Evidence", "task", "target.json");
    const target = JSON.parse(readFileSync(targetPath, "utf8"));
    target.outcome = "Rewritten after audit";
    writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /differs from audited candidate/u);
  });

  withRepository((repository) => {
    const targetPath = join(repository, "Docs", "Evidence", "task", "target.json");
    const target = JSON.parse(readFileSync(targetPath, "utf8"));
    target.scopes = ["Docs/Evidence/task/target.json"];
    writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`);
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /do not exactly match/u);
  });
});

test("reconciles required gates with independent candidate-bound audit responses", () => {
  withRepository((repository) => {
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    const auditsPath = join(repository, "Docs", "Evidence", "task", "audit-results.json");

    let audits = JSON.parse(readFileSync(auditsPath, "utf8"));
    const reportPath = join(repository, "Docs", "Evidence", "task", "close-audits.md");
    writeFileSync(
      reportPath,
      readFileSync(reportPath, "utf8").replace("Audit results: [structured](Docs/Evidence/task/audit-results.json)\n\n", ""),
    );
    assert.match(reject(process.execPath, bundleArguments(output), repository), /link structured audit results exactly once/u);

    writeAuditResults(repository, manifest);
    audits = JSON.parse(readFileSync(auditsPath, "utf8"));
    audits.results.pop();
    writeFileSync(auditsPath, `${JSON.stringify(audits, null, 2)}\n`);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /exactly one result/u);

    writeAuditResults(repository, manifest);
    audits = JSON.parse(readFileSync(auditsPath, "utf8"));
    audits.candidate = "0".repeat(64);
    writeFileSync(auditsPath, `${JSON.stringify(audits, null, 2)}\n`);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /do not match target\/candidate/u);

    writeAuditResults(repository, manifest);
    audits = JSON.parse(readFileSync(auditsPath, "utf8"));
    audits.results.at(-1).lens = audits.results[0].lens;
    writeFileSync(auditsPath, `${JSON.stringify(audits, null, 2)}\n`);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /invalid.*conflicting/u);

    writeAuditResults(repository, manifest);
    audits = JSON.parse(readFileSync(auditsPath, "utf8"));
    audits.attempts.find((entry) => entry.lens === "API / Provider usage").auditor = "agent-claims";
    writeFileSync(auditsPath, `${JSON.stringify(audits, null, 2)}\n`);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /safety\/provider reviewer/u);

    writeAuditResults(repository, manifest);
    audits = JSON.parse(readFileSync(auditsPath, "utf8"));
    writeFileSync(join(repository, audits.attempts[0].response), "tampered response\n");
    assert.match(reject(process.execPath, bundleArguments(output), repository), /digest mismatch/u);

    writeAuditResults(repository, manifest);
    rewriteAuditResponse(repository, 0, (response) => response.replace(
      "TARGET: Docs/Evidence/task/target.json",
      "TARGET: Docs/Evidence/other/target.json",
    ));
    assert.match(reject(process.execPath, bundleArguments(output), repository), /wrong target/u);

    writeAuditResults(repository, manifest);
    rewriteAuditResponse(repository, 0, (response) => `${response}RESULT: FAIL\n`);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /exactly one RESULT/u);

    writeAuditResults(repository, manifest);
    rewriteAuditResponse(repository, 0, (response) => response.replace("BLOCKERS: none", "BLOCKERS: unresolved defect"));
    assert.match(reject(process.execPath, bundleArguments(output), repository), /must state BLOCKERS: none/u);

    writeAuditResults(repository, manifest);
    rewriteAuditResponse(repository, 0, (response) => response.replace(
      "FINDINGS:\n- Inspected the immutable candidate and found no blocker.",
      "FINDINGS:\nnone",
    ));
    assert.match(reject(process.execPath, bundleArguments(output), repository), /substantive findings/u);

    writeAuditResults(repository, manifest);
    audits = JSON.parse(readFileSync(auditsPath, "utf8"));
    writeFileSync(
      reportPath,
      readFileSync(reportPath, "utf8").replace(audits.attempts[0].response, "missing-response.txt"),
    );
    assert.match(reject(process.execPath, bundleArguments(output), repository), /does not exactly index attempt/u);
  });
});

test("enforces candidate-bound risk tier auditor allocation", () => {
  withRepository((repository) => {
    const targetPath = join(repository, "Docs", "Evidence", "task", "target.json");
    const target = JSON.parse(readFileSync(targetPath, "utf8"));
    target.risk_tier = 2;
    target.required_lenses = gateNamesForTest();
    writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`);
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    const auditsPath = join(repository, "Docs", "Evidence", "task", "audit-results.json");
    const audits = JSON.parse(readFileSync(auditsPath, "utf8"));
    audits.attempts.forEach((attempt) => { attempt.auditor = "agent-one"; });
    writeFileSync(auditsPath, `${JSON.stringify(audits, null, 2)}\n`);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /at least 2 declared auditors/u);
    for (const attempt of audits.attempts) {
      attempt.auditor = ["Claims / Proof evidence", "Product / Learner journey"].includes(attempt.lens)
        ? "agent-product"
        : ["Security / Privacy", "API / Provider usage"].includes(attempt.lens)
          ? "agent-safety"
          : "agent-code";
    }
    writeFileSync(auditsPath, `${JSON.stringify(audits, null, 2)}\n`);
    assert.equal(createBundle(repository, output).verified, true);
  });

  withRepository((repository) => {
    const targetPath = join(repository, "Docs", "Evidence", "task", "target.json");
    const target = JSON.parse(readFileSync(targetPath, "utf8"));
    target.risk_tier = 3;
    target.required_lenses = gateNamesForTest();
    writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`);
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    const auditsPath = join(repository, "Docs", "Evidence", "task", "audit-results.json");
    const audits = JSON.parse(readFileSync(auditsPath, "utf8"));
    audits.attempts.forEach((attempt) => { attempt.auditor = "agent-one"; });
    writeFileSync(auditsPath, `${JSON.stringify(audits, null, 2)}\n`);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /at least 3 declared auditors/u);
    for (const attempt of audits.attempts) {
      attempt.auditor = ["Claims / Proof evidence", "Product / Learner journey"].includes(attempt.lens)
        ? "agent-product"
        : ["Security / Privacy", "API / Provider usage"].includes(attempt.lens)
          ? "agent-safety"
          : "agent-code";
    }
    writeFileSync(auditsPath, `${JSON.stringify(audits, null, 2)}\n`);
    assert.equal(createBundle(repository, output).verified, true);
  });
});

test("requires tier minimums and N/A for every unselected gate", () => {
  withRepository((repository) => {
    const targetPath = join(repository, "Docs", "Evidence", "task", "target.json");
    const target = JSON.parse(readFileSync(targetPath, "utf8"));
    target.risk_tier = 2;
    writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`);
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /missing a minimum required lens/u);
  });

  withRepository((repository) => {
    const targetPath = join(repository, "Docs", "Evidence", "task", "target.json");
    const target = JSON.parse(readFileSync(targetPath, "utf8"));
    target.risk_tier = 0;
    target.required_lenses = [];
    writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`);
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    assert.equal(createBundle(repository, output).verified, true);
  });

  withRepository((repository) => {
    const targetPath = join(repository, "Docs", "Evidence", "task", "target.json");
    const target = JSON.parse(readFileSync(targetPath, "utf8"));
    target.risk_tier = 0;
    target.required_lenses = [];
    writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`);
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    const recordPath = join(repository, "Docs", "Evidence", "task", "close-record.json");
    const record = JSON.parse(readFileSync(recordPath, "utf8"));
    record.gates["Claims / Proof evidence"] = "PASS";
    writeFileSync(recordPath, `${JSON.stringify(record, null, 2)}\n`);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /invalid final gate verdict/u);
  });
});

test("binds structured final-check proof and complete audit-file history", () => {
  withRepository((repository) => {
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    const checksPath = join(repository, "Docs", "Evidence", "task", "check-results.json");
    const checks = JSON.parse(readFileSync(checksPath, "utf8"));
    checks.attempts[0].candidate = "0".repeat(64);
    writeFileSync(checksPath, `${JSON.stringify(checks, null, 2)}\n`);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /invalid check attempt|does not match its manifest|last check attempt must be the final PASS/u);
  });

  withRepository((repository) => {
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    const checksPath = join(repository, "Docs", "Evidence", "task", "check-results.json");
    const checks = JSON.parse(readFileSync(checksPath, "utf8"));
    const proofPath = "Docs/Evidence/task/checks/C2-01.json";
    const proof = {
      version: 1, candidate: manifest.candidate, commit: manifest.commit, tree: manifest.tree,
      command: [process.execPath, "-e", "process.exit(1)"],
      started_at: "2024-03-01T00:00:00Z", finished_at: "2024-03-01T00:00:00Z",
      exit_code: 1, signal: null, stdout: "", stderr: "",
    };
    const proofBytes = `${JSON.stringify(proof, null, 2)}\n`;
    writeFileSync(join(repository, proofPath), proofBytes);
    checks.attempts.push({
      id: "C2", at: proof.finished_at, candidate: manifest.candidate, verdict: "FAIL",
      manifest: "Docs/Evidence/task/candidate.json",
      manifest_sha256: createHash("sha256").update(readFileSync(join(repository, "Docs", "Evidence", "task", "candidate.json"))).digest("hex"),
      proofs: [{ path: proofPath, sha256: createHash("sha256").update(proofBytes).digest("hex") }],
      disposition: "Latest deterministic check failed.",
    });
    writeFileSync(checksPath, `${JSON.stringify(checks, null, 2)}\n`);
    const reportPath = join(repository, "Docs", "Evidence", "task", "close-audits.md");
    writeFileSync(
      reportPath,
      `${readFileSync(reportPath, "utf8")}| C2 | ${proof.finished_at} | FAIL | \`${manifest.candidate}\` | [proof](${proofPath}) | Blocks close. |\n`,
    );
    assert.match(reject(process.execPath, bundleArguments(output), repository), /check verdict does not match command exits|last check attempt must be the final PASS/u);
  });

  withRepository((repository) => {
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    const checksPath = join(repository, "Docs", "Evidence", "task", "check-results.json");
    const checks = JSON.parse(readFileSync(checksPath, "utf8"));
    const proofPath = join(repository, checks.attempts[0].proofs[0].path);
    const proof = JSON.parse(readFileSync(proofPath, "utf8"));
    const marker = join(tmpdir(), `aidioma-bundle-undeclared-${process.pid}-${Date.now()}`);
    proof.command = [process.execPath, "-e", `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'ran')`];
    const fabricated = `${JSON.stringify(proof, null, 2)}\n`;
    writeFileSync(proofPath, fabricated);
    checks.attempts[0].proofs[0].sha256 = createHash("sha256").update(fabricated).digest("hex");
    writeFileSync(checksPath, `${JSON.stringify(checks, null, 2)}\n`);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /does not match command exits/u);
    assert.equal(existsSync(marker), false, "bundle replayed an undeclared proof command");
  });

  withRepository((repository) => {
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    const reportPath = join(repository, "Docs", "Evidence", "task", "close-audits.md");
    writeFileSync(
      reportPath,
      readFileSync(reportPath, "utf8").replace("| C1 | 2024-02-29T23:59:59Z | PASS |", "| C1 | 2024-02-29T23:59:59Z | FAIL |"),
    );
    assert.match(reject(process.execPath, bundleArguments(output), repository), /index check attempt exactly once/u);
  });

  withRepository((repository) => {
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    writeFileSync(join(repository, "Docs", "Evidence", "task", "checks", "orphan-fail.json"), "unindexed failed proof\n");
    assert.match(reject(process.execPath, bundleArguments(output), repository), /does not exactly cover the retained checks tree/u);
  });

  withRepository((repository) => {
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    const responsePath = "Docs/Evidence/task/audits/superseded-fail.txt";
    writeFileSync(join(repository, responsePath), "superseded failed audit\n");
    const reportPath = join(repository, "Docs", "Evidence", "task", "close-audits.md");
    writeFileSync(reportPath, `${readFileSync(reportPath, "utf8")}\n- [superseded](${responsePath})\n`);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /does not exactly cover/u);

    const auditsPath = join(repository, "Docs", "Evidence", "task", "audit-results.json");
    const audits = JSON.parse(readFileSync(auditsPath, "utf8"));
    const failResponse = [
      "TARGET: Docs/Evidence/task/target.json",
      "LENS: Claims / Proof evidence",
      "RESULT: FAIL",
      `CANDIDATE: ${manifest.candidate}`,
      "BLOCKERS:",
      "- A material blocker was found in the retained candidate.",
      "FINDINGS:",
      "- The immutable candidate failed this adversarial attempt with concrete evidence.",
      "REMEDIATION: Repair the blocker and rerun the lens.",
      "",
    ].join("\n");
    writeFileSync(join(repository, responsePath), failResponse);
    audits.attempts.push({
      id: "A7", at: "2024-02-29T23:59:56Z", lens: "Claims / Proof evidence",
      auditor: "agent-claims", verdict: "FAIL", candidate: manifest.candidate,
      manifest: "Docs/Evidence/task/candidate.json",
      manifest_sha256: createHash("sha256").update(readFileSync(join(repository, "Docs", "Evidence", "task", "candidate.json"))).digest("hex"),
      response: responsePath, response_sha256: createHash("sha256").update(failResponse).digest("hex"),
    });
    writeFileSync(auditsPath, `${JSON.stringify(audits, null, 2)}\n`);
    writeFileSync(
      reportPath,
      `${readFileSync(reportPath, "utf8").replace(`\n- [superseded](${responsePath})\n`, "\n")}| A7 | 2024-02-29T23:59:56Z | Claims / Proof evidence | FAIL | \`${manifest.candidate}\` | Found blocker. | [response](${responsePath}) | Repair. |\n`,
    );
    assert.match(reject(process.execPath, bundleArguments(output), repository), /non-latest/u);

    const passPath = "Docs/Evidence/task/audits/repaired-pass.txt";
    const passResponse = [
      "TARGET: Docs/Evidence/task/target.json", "LENS: Claims / Proof evidence", "RESULT: PASS",
      `CANDIDATE: ${manifest.candidate}`, "BLOCKERS: none", "FINDINGS:",
      "- Reinspection of the immutable candidate found the prior evidence blocker resolved.",
      "REMEDIATION: none", "",
    ].join("\n");
    writeFileSync(join(repository, passPath), passResponse);
    audits.attempts.push({
      id: "A8", at: "2024-02-29T23:59:57Z", lens: "Claims / Proof evidence",
      auditor: "agent-claims", verdict: "PASS", candidate: manifest.candidate,
      manifest: "Docs/Evidence/task/candidate.json",
      manifest_sha256: createHash("sha256").update(readFileSync(join(repository, "Docs", "Evidence", "task", "candidate.json"))).digest("hex"),
      response: passPath, response_sha256: createHash("sha256").update(passResponse).digest("hex"),
    });
    audits.results.find((result) => result.lens === "Claims / Proof evidence").attempt = "A8";
    writeFileSync(auditsPath, `${JSON.stringify(audits, null, 2)}\n`);
    writeFileSync(
      reportPath,
      `${readFileSync(reportPath, "utf8")}| A8 | 2024-02-29T23:59:57Z | Claims / Proof evidence | PASS | \`${manifest.candidate}\` | Repaired. | [response](${passPath}) | None. |\n`,
    );
    assert.equal(createBundle(repository, output).verified, true);
  });
});

test("retains historical checks without replaying superseded commands", () => {
  withRepository((repository) => {
    const historicalMarker = join(tmpdir(), `aidioma-close-historical-${process.pid}-${Date.now()}`);
    const targetPath = join(repository, "Docs", "Evidence", "task", "target.json");
    const target = JSON.parse(readFileSync(targetPath, "utf8"));
    const oldCommand = [process.execPath, "-e", `require('node:fs').writeFileSync(${JSON.stringify(historicalMarker)}, 'ran')`];
    target.check_commands = [oldCommand];
    writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`);
    const oldOutput = "Docs/Evidence/task/candidate-old.json";
    const oldManifest = JSON.parse(run(
      process.execPath,
      [candidateScript, "--output", oldOutput, "--", "work.txt", "Docs/Evidence/task/target.json"],
      repository,
    ));
    const finalCommand = [process.execPath, "-e", "process.exit(0 /* final contract */)"];
    target.check_commands = [finalCommand];
    writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`);
    writeFileSync(join(repository, "work.txt"), "reviewed work after remediation\n");
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);

    const checksDirectory = join(repository, "Docs", "Evidence", "task", "checks");
    const oldProofPath = "Docs/Evidence/task/checks/C1-01.json";
    const finalProofPath = "Docs/Evidence/task/checks/C2-01.json";
    const oldProof = {
      version: 1, candidate: oldManifest.candidate, commit: oldManifest.commit, tree: oldManifest.tree,
      command: oldCommand,
      started_at: "2024-02-29T23:59:58Z", finished_at: "2024-02-29T23:59:58Z",
      exit_code: 0, signal: null, stdout: "", stderr: "",
    };
    const finalProof = {
      version: 1, candidate: manifest.candidate, commit: manifest.commit, tree: manifest.tree,
      command: finalCommand,
      started_at: "2024-02-29T23:59:59Z", finished_at: "2024-02-29T23:59:59Z",
      exit_code: 0, signal: null, stdout: "", stderr: "",
    };
    const oldBytes = `${JSON.stringify(oldProof, null, 2)}\n`;
    const finalBytes = `${JSON.stringify(finalProof, null, 2)}\n`;
    writeFileSync(join(repository, oldProofPath), oldBytes);
    writeFileSync(join(repository, finalProofPath), finalBytes);
    const attempts = [
      {
        id: "C1", at: oldProof.finished_at, candidate: oldManifest.candidate,
        manifest: oldOutput,
        manifest_sha256: createHash("sha256").update(readFileSync(join(repository, oldOutput))).digest("hex"),
        verdict: "PASS",
        proofs: [{ path: oldProofPath, sha256: createHash("sha256").update(oldBytes).digest("hex") }],
        disposition: "Superseded candidate passed its own declared command contract.",
      },
      {
        id: "C2", at: finalProof.finished_at, candidate: manifest.candidate,
        manifest: output,
        manifest_sha256: createHash("sha256").update(readFileSync(join(repository, output))).digest("hex"),
        verdict: "PASS",
        proofs: [{ path: finalProofPath, sha256: createHash("sha256").update(finalBytes).digest("hex") }],
        disposition: "Binding final candidate check.",
      },
    ];
    writeFileSync(
      join(repository, "Docs", "Evidence", "task", "check-results.json"),
      `${JSON.stringify({
        version: 1, target: "T-TEST", candidate: manifest.candidate,
        report: "Docs/Evidence/task/close-audits.md", attempts, final_attempt: "C2",
      }, null, 2)}\n`,
    );
    const reportPath = join(repository, "Docs", "Evidence", "task", "close-audits.md");
    const report = readFileSync(reportPath, "utf8").split("\n## Check history\n")[0];
    writeFileSync(
      reportPath,
      `${report}\n## Check history\n\nCheck results: [structured](Docs/Evidence/task/check-results.json)\n\n| Check | At (UTC) | Result | Candidate | Proof | Disposition |\n|---|---|---|---|---|---|\n| C1 | ${oldProof.finished_at} | PASS | \`${oldManifest.candidate}\` | [proof](${oldProofPath}) | Superseded. |\n| C2 | ${finalProof.finished_at} | PASS | \`${manifest.candidate}\` | [proof](${finalProofPath}) | Binding final. |\n`,
    );
    const created = createBundle(repository, output);
    assert.equal(created.verified, true);
    assert.equal(existsSync(historicalMarker), false, "bundle creation replayed a superseded command");
    const verified = JSON.parse(run(
      process.execPath,
      [bundleScript, "verify", "--bundle", "Docs/Evidence/task/close-bundle.json", "--replay-checks", "yes"],
      repository,
    ));
    assert.equal(verified.verified, true);
    assert.equal(existsSync(historicalMarker), false, "verification replayed a superseded command");
    const bundle = JSON.parse(readFileSync(join(repository, "Docs", "Evidence", "task", "close-bundle.json"), "utf8"));
    assert.equal(bundle.files.some((record) => record.role === "history_manifest" && record.path === oldOutput), true);
    assert.equal(readFileSync(join(checksDirectory, "C2-01.json"), "utf8"), finalBytes);
    rmSync(historicalMarker, { force: true });
  });
});

test("rejects a historical manifest retained for another target", () => {
  withRepository((repository) => {
    const targetPath = join(repository, "Docs", "Evidence", "task", "target.json");
    const target = JSON.parse(readFileSync(targetPath, "utf8"));
    target.id = "T-OTHER";
    writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`);
    const otherOutput = "Docs/Evidence/task/candidate-other.json";
    const other = JSON.parse(run(
      process.execPath,
      [candidateScript, "--output", otherOutput, "--", "work.txt", "Docs/Evidence/task/target.json"],
      repository,
    ));
    target.id = "T-TEST";
    writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`);
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    const checksPath = join(repository, "Docs", "Evidence", "task", "check-results.json");
    const checks = JSON.parse(readFileSync(checksPath, "utf8"));
    const attempt = checks.attempts[0];
    attempt.candidate = other.candidate;
    attempt.manifest = otherOutput;
    attempt.manifest_sha256 = createHash("sha256").update(readFileSync(join(repository, otherOutput))).digest("hex");
    const proofPath = join(repository, attempt.proofs[0].path);
    const proof = JSON.parse(readFileSync(proofPath, "utf8"));
    proof.candidate = other.candidate;
    proof.commit = other.commit;
    proof.tree = other.tree;
    const proofBytes = `${JSON.stringify(proof, null, 2)}\n`;
    writeFileSync(proofPath, proofBytes);
    attempt.proofs[0].sha256 = createHash("sha256").update(proofBytes).digest("hex");
    writeFileSync(checksPath, `${JSON.stringify(checks, null, 2)}\n`);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /belongs to a different target/u);
  });
});

test("rejects failing close records and secret-bearing evidence", () => {
  withRepository((repository) => {
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    const closeRecordPath = join(repository, "Docs", "Evidence", "task", "close-record.json");
    const closeRecord = JSON.parse(readFileSync(closeRecordPath, "utf8"));
    closeRecord.gates.MCOO = "FAIL";
    writeFileSync(closeRecordPath, `${JSON.stringify(closeRecord, null, 2)}\n`);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /invalid final gate verdict/u);

    closeRecord.gates.MCOO = "PASS";
    closeRecord.gates["Security / Privacy"] = "n/a — no security surface changed";
    writeFileSync(closeRecordPath, `${JSON.stringify(closeRecord, null, 2)}\n`);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /invalid final gate verdict/u);

    closeRecord.gates["Security / Privacy"] = "PASS";
    closeRecord.gates["Product / Learner journey"] = "n/a —    ";
    writeFileSync(closeRecordPath, `${JSON.stringify(closeRecord, null, 2)}\n`);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /invalid final gate verdict/u);

    closeRecord.gates["Product / Learner journey"] = "n/a — no learner behavior changed";
    closeRecord.gates["Security / Privacy"] = "WARN";
    closeRecord.accepted_warnings = [{
      lens: "Security / Privacy",
      candidate: manifest.candidate,
      risk: " ",
      reason: " ",
      acceptance: " ",
      accepted_at: "2026-99-99T99:99:99Z",
    }];
    writeFileSync(closeRecordPath, `${JSON.stringify(closeRecord, null, 2)}\n`);
    assert.match(reject(process.execPath, bundleArguments(output), repository), /invalid accepted warning/u);

    closeRecord.accepted_warnings = [{
      lens: "Security / Privacy",
      candidate: manifest.candidate,
      risk: "Low residual exposure",
      reason: "The founder accepts this bounded residual risk.",
      acceptance: "Founder explicitly accepts the retained warning.",
      accepted_at: "2024-02-29T23:59:59Z",
    }];
    writeFileSync(closeRecordPath, `${JSON.stringify(closeRecord, null, 2)}\n`);
    setAuditVerdict(repository, "Security / Privacy", "WARN");
    assert.equal(createBundle(repository, output).verified, true);
  });

  withRepository((repository) => {
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    writeFileSync(join(repository, "Docs", "Evidence", "task", "secret.txt"), "not actually secret\n");
    assert.match(
      reject(
        process.execPath,
        bundleArguments(output, ["--artifact", "Docs/Evidence/task/secret.txt"]),
        repository,
      ),
      /secret-bearing filename/u,
    );
  });
});

test("concurrent identical creators retain one stable bundle and receipt", async () => {
  const repository = mkdtempSync(join(tmpdir(), "aidioma-bundle-race-test-"));
  try {
    run("git", ["init", "-q"], repository);
    run("git", ["config", "user.email", "bundle@example.invalid"], repository);
    run("git", ["config", "user.name", "Bundle Test"], repository);
    writeFileSync(join(repository, "base.txt"), "base\n");
    run("git", ["add", "base.txt"], repository);
    run("git", ["commit", "-qm", "base"], repository);
    mkdirSync(join(repository, "Docs", "Evidence", "task"), { recursive: true });
    writeFileSync(join(repository, "work.txt"), "reviewed work\n");
    writeFileSync(
      join(repository, "Docs", "Evidence", "task", "target.json"),
      `${JSON.stringify({
        version: 1, id: "T-TEST", kind: "task", evidence_dir: "Docs/Evidence/task",
        outcome: "Race safely", proof: ["Both creators agree."], non_goals: [],
        risk_tier: 1, required_lenses: gateNamesForTest().slice(0, 6),
        check_commands: [[process.execPath, "-e", "process.exit(0)"]],
        check_environment: [], check_timeout_ms: 10000,
        scopes: ["Docs/Evidence/task/target.json", "work.txt"],
      }, null, 2)}\n`,
    );
    writeFileSync(join(repository, "Docs", "Evidence", "task", "close-audits.md"), "pass\n");
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    const results = await Promise.all([spawnBundle(repository, output), spawnBundle(repository, output)]);
    assert.deepEqual(results.map((result) => result.status), [0, 0], results.map((result) => result.stderr).join("\n"));
    const receipts = results.map((result) => JSON.parse(result.stdout));
    assert.equal(receipts[0].receipt_commit, receipts[1].receipt_commit);
    assert.equal(receipts[0].receipt_ref, receipts[1].receipt_ref);
    assert.equal(run("git", ["rev-parse", receipts[0].receipt_ref], repository).trim(), receipts[0].receipt_commit);
  } finally {
    rmSync(repository, { recursive: true, force: true });
  }
});

test("Unicode evidence ordering and receipt identity do not depend on locale", () => {
  withRepository((repository) => {
    const { output, manifest } = createCandidate(repository);
    writeCloseRecord(repository, manifest);
    writeFileSync(join(repository, "Docs", "Evidence", "task", "z.txt"), "z\n");
    writeFileSync(join(repository, "Docs", "Evidence", "task", "ä.txt"), "a umlaut\n");
    const extras = [
      "--artifact", "Docs/Evidence/task/ä.txt",
      "--artifact", "Docs/Evidence/task/z.txt",
    ];
    const first = JSON.parse(
      runWithEnv(process.execPath, bundleArguments(output, extras), repository, {
        LANG: "en_US.UTF-8", LC_ALL: "en_US.UTF-8",
      }),
    );
    run("git", ["update-ref", "-d", first.receipt_ref, first.receipt_commit], repository);
    rmSync(join(repository, "Docs", "Evidence", "task", "close-bundle.json"));
    const second = JSON.parse(
      runWithEnv(process.execPath, bundleArguments(output, extras), repository, {
        LANG: "sv_SE.UTF-8", LC_ALL: "sv_SE.UTF-8",
      }),
    );
    assert.equal(first.bundle_sha256, second.bundle_sha256);
    assert.equal(first.receipt_commit, second.receipt_commit);
    assert.equal(first.receipt_ref, second.receipt_ref);
  });
});

test("phase receipts allow only state, closed date, and lessons after audit", () => {
  const repository = mkdtempSync(join(tmpdir(), "aidioma-phase-bundle-test-"));
  try {
    run("git", ["init", "-q"], repository);
    run("git", ["config", "user.email", "bundle@example.invalid"], repository);
    run("git", ["config", "user.name", "Bundle Test"], repository);
    writeFileSync(join(repository, "base.txt"), "base\n");
    run("git", ["add", "base.txt"], repository);
    run("git", ["commit", "-qm", "base"], repository);
    mkdirSync(join(repository, "Docs", "Evidence", "phase-001"), { recursive: true });
    mkdirSync(join(repository, "Docs", "Roadmap", "Phases"), { recursive: true });
    const targetPath = "Docs/Evidence/phase-001/target.json";
    const authorityPath = "Docs/Roadmap/Phases/PHASE-001.md";
    const reportPath = "Docs/Evidence/phase-001/close-audits.md";
    const closeRecordPath = "Docs/Evidence/phase-001/close-record.json";
    const bundlePath = "Docs/Evidence/phase-001/close-bundle.json";
    writeFileSync(join(repository, "work.txt"), "phase work\n");
    writeFileSync(
      join(repository, targetPath),
      `${JSON.stringify({
        version: 1,
        id: "PHASE-001",
        kind: "phase",
        evidence_dir: "Docs/Evidence/phase-001",
        risk_tier: 1,
        authority: authorityPath,
        required_lenses: gateNamesForTest().slice(0, 6),
        check_commands: [[process.execPath, "-e", "process.exit(0)"]],
        check_environment: [],
        check_timeout_ms: 10000,
        scopes: [targetPath, authorityPath, "work.txt"],
      }, null, 2)}\n`,
    );
    const openPhase = "---\nid: PHASE-001\nstate: active\nclosed: null\nlessons: null\n---\n\n# Phase\n\n**Risk tier:** 1\n\nAudited body.\n";
    const closedPhase = "---\nid: PHASE-001\nstate: closed\nclosed: 2024-02-29\nlessons: \"Close receipts need one authority.\"\n---\n\n# Phase\n\n**Risk tier:** 1\n\nAudited body.\n";
    writeFileSync(join(repository, authorityPath), openPhase);
    writeFileSync(join(repository, reportPath), "all phase gates pass\n");
    const manifestPath = "Docs/Evidence/phase-001/candidate.json";
    const manifest = JSON.parse(
      run(
        process.execPath,
        [candidateScript, "--output", manifestPath, "--", targetPath, authorityPath, "work.txt"],
        repository,
      ),
    );
    const gates = Object.fromEntries(gateNamesForTest().map((lens) => [
      lens,
      gateNamesForTest().slice(0, 6).includes(lens) ? "PASS" : "n/a — no learner behavior changed",
    ]));
    writeFileSync(
      join(repository, closeRecordPath),
      `${JSON.stringify({
        version: 1, target: "PHASE-001", candidate: manifest.candidate, final_check: "PASS", gates,
        accepted_warnings: [], authority_comparison: "PASS", report: reportPath, bundle: bundlePath,
        publication_at_close: "not_requested",
      }, null, 2)}\n`,
    );
    writePhaseAuditResults(repository, "Docs/Evidence/phase-001", "PHASE-001", manifest.candidate);
    writePhaseCheckResults(repository, "Docs/Evidence/phase-001", "PHASE-001", manifest);
    const args = [
      bundleScript, "create", "--manifest", manifestPath, "--target", targetPath,
      "--close-record", closeRecordPath, "--check-results", "Docs/Evidence/phase-001/check-results.json",
      "--audit-results", "Docs/Evidence/phase-001/audit-results.json",
      "--report", reportPath, "--output", bundlePath,
    ];
    writeFileSync(join(repository, authorityPath), closedPhase.replace("Audited body.", "Changed body."));
    assert.match(reject(process.execPath, args, repository), /changed outside state\/closed\/lessons/u);
    for (const emptyLessons of ['""', "[]", "~", "false", "123", "null # comment", "true # comment", '["not a scalar"]']) {
      writeFileSync(
        join(repository, authorityPath),
        closedPhase.replace('lessons: "Close receipts need one authority."', `lessons: ${emptyLessons}`),
      );
      assert.match(reject(process.execPath, args, repository), /canonical|non-empty string/u);
    }
    for (const invalidDate of ["2023-02-29", "2026-04-31", "2026-99-99"]) {
      writeFileSync(
        join(repository, authorityPath),
        closedPhase.replace("closed: 2024-02-29", `closed: ${invalidDate}`),
      );
      assert.match(reject(process.execPath, args, repository), /not closed with an ISO date/u);
    }
    writeFileSync(join(repository, authorityPath), closedPhase);
    const created = JSON.parse(run(process.execPath, args, repository));
    const verified = JSON.parse(run(process.execPath, [bundleScript, "verify", "--bundle", bundlePath, "--replay-checks", "yes"], repository));
    assert.equal(created.receipt_commit, verified.receipt_commit);
    assert.equal(run("git", ["rev-parse", `${created.receipt_commit}^`], repository).trim(), manifest.commit);

    const crossedDirectory = "Docs/Evidence/phase-002";
    mkdirSync(join(repository, crossedDirectory), { recursive: true });
    const crossedTarget = `${crossedDirectory}/target.json`;
    const crossedManifest = `${crossedDirectory}/candidate.json`;
    const crossedReport = `${crossedDirectory}/close-audits.md`;
    const crossedRecord = `${crossedDirectory}/close-record.json`;
    const crossedBundle = `${crossedDirectory}/close-bundle.json`;
    writeFileSync(
      join(repository, crossedTarget),
      `${JSON.stringify({
        version: 1, id: "PHASE-002", kind: "phase", evidence_dir: crossedDirectory,
        risk_tier: 1,
        required_lenses: gateNamesForTest().slice(0, 6),
        check_commands: [[process.execPath, "-e", "process.exit(0)"]],
        check_environment: [], check_timeout_ms: 10000,
        authority: authorityPath, scopes: [crossedTarget, authorityPath, "work.txt"],
      }, null, 2)}\n`,
    );
    writeFileSync(join(repository, crossedReport), "crossed phase must fail\n");
    const crossedCandidate = JSON.parse(
      run(
        process.execPath,
        [candidateScript, "--output", crossedManifest, "--", crossedTarget, authorityPath, "work.txt"],
        repository,
      ),
    );
    writeFileSync(
      join(repository, crossedRecord),
      `${JSON.stringify({
        version: 1, target: "PHASE-002", candidate: crossedCandidate.candidate, final_check: "PASS",
        gates, accepted_warnings: [], authority_comparison: "PASS", report: crossedReport,
        bundle: crossedBundle, publication_at_close: "not_requested",
      }, null, 2)}\n`,
    );
    writePhaseAuditResults(repository, crossedDirectory, "PHASE-002", crossedCandidate.candidate);
    writePhaseCheckResults(repository, crossedDirectory, "PHASE-002", crossedCandidate);
    assert.match(
      reject(
        process.execPath,
        [
          bundleScript, "create", "--manifest", crossedManifest, "--target", crossedTarget,
          "--close-record", crossedRecord, "--check-results", `${crossedDirectory}/check-results.json`,
          "--audit-results", `${crossedDirectory}/audit-results.json`,
          "--report", crossedReport, "--output", crossedBundle,
        ],
        repository,
      ),
      /phase target id does not match/u,
    );
  } finally {
    rmSync(repository, { recursive: true, force: true });
  }
});

function gateNamesForTest() {
  return [
    "Claims / Proof evidence",
    "Code quality / Standards",
    "MCOO",
    "Seams / Integration",
    "Security / Privacy",
    "API / Provider usage",
    "Product / Learner journey",
  ];
}

function writePhaseAuditResults(repository, evidenceDirectory, target, candidate) {
  const responseDirectory = join(repository, evidenceDirectory, "audits");
  mkdirSync(responseDirectory, { recursive: true });
  const auditors = ["agent-claims", "agent-standards", "agent-claims", "agent-seams", "agent-security", "agent-provider"];
  const attempts = gateNamesForTest().slice(0, 6).map((lens, index) => {
    const response = [
      `TARGET: ${evidenceDirectory}/target.json`,
      `LENS: ${lens}`,
      "RESULT: PASS",
      `CANDIDATE: ${candidate}`,
      "BLOCKERS: none",
      "FINDINGS:",
      "- Inspected the immutable phase candidate and found no blocker.",
      "REMEDIATION: none",
      "",
    ].join("\n");
    const filename = `${String(index + 1).padStart(2, "0")}.txt`;
    const responsePath = `${evidenceDirectory}/audits/${filename}`;
    writeFileSync(join(responseDirectory, filename), response);
    return {
      id: `A${index + 1}`,
      at: `2024-02-29T23:59:${String(50 + index).padStart(2, "0")}Z`,
      lens,
      auditor: auditors[index],
      verdict: "PASS",
      candidate,
      manifest: `${evidenceDirectory}/candidate.json`,
      manifest_sha256: createHash("sha256").update(readFileSync(join(repository, evidenceDirectory, "candidate.json"))).digest("hex"),
      response: responsePath,
      response_sha256: createHash("sha256").update(response).digest("hex"),
    };
  });
  const results = attempts.map((attempt) => ({ lens: attempt.lens, attempt: attempt.id }));
  writeFileSync(
    join(repository, evidenceDirectory, "audit-results.json"),
    `${JSON.stringify({
      version: 1,
      target,
      candidate,
      report: `${evidenceDirectory}/close-audits.md`,
      attempts,
      results,
    }, null, 2)}\n`,
  );
  writeFileSync(
    join(repository, evidenceDirectory, "close-audits.md"),
    `# Audit history\n\nCandidate: ${candidate}\n\nAudit results: [structured](${evidenceDirectory}/audit-results.json)\n\n| Attempt | At (UTC) | Lens | Result | Candidate | Brief | Canonical response | Remediation |\n|---|---|---|---|---|---|---|---|\n${attempts.map((attempt) => `| ${attempt.id} | ${attempt.at} | ${attempt.lens} | ${attempt.verdict} | \`${attempt.candidate}\` | Inspected immutable phase. | [response](${attempt.response}) | None. |`).join("\n")}\n`,
  );
}

function writePhaseCheckResults(repository, evidenceDirectory, target, manifest) {
  const candidate = manifest.candidate;
  const path = `${evidenceDirectory}/check-results.json`;
  const reportPath = `${evidenceDirectory}/close-audits.md`;
  const proofPath = `${evidenceDirectory}/checks/C1-01.json`;
  mkdirSync(join(repository, evidenceDirectory, "checks"), { recursive: true });
  const proof = {
    version: 1, candidate, commit: manifest.commit, tree: manifest.tree,
    command: [process.execPath, "-e", "process.exit(0)"],
    started_at: "2024-02-29T23:59:59Z", finished_at: "2024-02-29T23:59:59Z",
    exit_code: 0, signal: null, stdout: "", stderr: "",
  };
  const proofBytes = `${JSON.stringify(proof, null, 2)}\n`;
  writeFileSync(join(repository, proofPath), proofBytes);
  const attempts = [{
    id: "C1",
    at: "2024-02-29T23:59:59Z",
    candidate,
    manifest: `${evidenceDirectory}/candidate.json`,
    manifest_sha256: createHash("sha256").update(readFileSync(join(repository, evidenceDirectory, "candidate.json"))).digest("hex"),
    verdict: "PASS",
    proofs: [{ path: proofPath, sha256: createHash("sha256").update(proofBytes).digest("hex") }],
    disposition: "Binding final phase check.",
  }];
  writeFileSync(
    join(repository, path),
    `${JSON.stringify({ version: 1, target, candidate, report: reportPath, attempts, final_attempt: "C1" }, null, 2)}\n`,
  );
  const report = join(repository, reportPath);
  writeFileSync(
    report,
    `${readFileSync(report, "utf8")}\nCheck results: [structured](${path})\n\n| Check | At (UTC) | Result | Candidate | Proof | Disposition |\n|---|---|---|---|---|---|\n| C1 | 2024-02-29T23:59:59Z | PASS | \`${candidate}\` | [proof](${proofPath}) | Binding final check. |\n`,
  );
}
