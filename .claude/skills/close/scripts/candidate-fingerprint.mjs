#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  existsSync,
  linkSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const realRepositoryRoot = realpathSync(repositoryRoot);

if (process.platform === "win32") {
  throw new Error("candidate pinning requires a POSIX filesystem (macOS or Linux)");
}

function git(args, options = {}) {
  return execFileSync("git", args, {
    cwd: repositoryRoot,
    encoding: options.encoding ?? "utf8",
    env: options.env ?? process.env,
    input: options.input,
    maxBuffer: 64 * 1024 * 1024,
  });
}

function tryGit(args) {
  try {
    return execFileSync("git", args, {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function nulPaths(buffer) {
  return buffer.toString("utf8").split("\0").filter(Boolean);
}

function canonicalRepositoryPath(path, label) {
  const absolutePath = resolve(repositoryRoot, path);
  const repositoryRelative = relative(repositoryRoot, absolutePath);
  if (
    repositoryRelative.startsWith(`..${sep}`) ||
    repositoryRelative === ".." ||
    isAbsolute(repositoryRelative)
  ) {
    throw new Error(`${label} escapes repository: ${path}`);
  }
  return (repositoryRelative || ".").split(sep).join("/");
}

function isInside(parent, child) {
  return parent === "." || child === parent || child.startsWith(`${parent}/`);
}

function lstatIfPresent(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function assertSafeOutput(output) {
  if (!isInside("Docs/Evidence", output) || !output.endsWith(".json")) {
    throw new Error("--output must be a .json file under Docs/Evidence/");
  }

  const absoluteOutput = resolve(repositoryRoot, output);
  let lexicalComponent = repositoryRoot;
  for (const component of output.split("/").slice(0, -1)) {
    lexicalComponent = join(lexicalComponent, component);
    if (lstatIfPresent(lexicalComponent)?.isSymbolicLink()) {
      throw new Error(`refusing symlinked output ancestor: ${output}`);
    }
  }
  if (lstatIfPresent(absoluteOutput)?.isSymbolicLink()) {
    throw new Error(`refusing symlinked output: ${output}`);
  }
  let existingAncestor = absoluteOutput;
  while (!existsSync(existingAncestor)) {
    const parent = dirname(existingAncestor);
    if (parent === existingAncestor) {
      throw new Error(`could not resolve output ancestor: ${output}`);
    }
    existingAncestor = parent;
  }

  const realAncestor = realpathSync(existingAncestor);
  const realRelative = relative(realRepositoryRoot, realAncestor);
  if (realRelative === ".." || realRelative.startsWith(`..${sep}`) || isAbsolute(realRelative)) {
    throw new Error(`output resolves outside repository: ${output}`);
  }
}

let rawOutputPath = null;
const rawScopes = [];
let parsingOptions = true;

for (let index = 2; index < process.argv.length; index += 1) {
  const argument = process.argv[index];
  if (parsingOptions && argument === "--") {
    parsingOptions = false;
  } else if (parsingOptions && argument === "--output") {
    rawOutputPath = process.argv[index + 1];
    if (!rawOutputPath) {
      throw new Error("--output requires a path");
    }
    index += 1;
  } else {
    rawScopes.push(argument);
  }
}

if (rawScopes.length === 0) {
  throw new Error("at least one explicit candidate scope is required");
}

const scopes = [...new Set(rawScopes.map((scope) => canonicalRepositoryPath(scope, "scope")))].sort();
const output = rawOutputPath ? canonicalRepositoryPath(rawOutputPath, "output") : null;
const head = git(["rev-parse", "HEAD"]).trim();
const attributePathspecs = [".gitattributes", ":(glob)**/.gitattributes"];
const attributeInputs = new Set([
  ...nulPaths(git(["ls-tree", "-r", "-z", "--name-only", head], { encoding: "buffer" })),
  ...nulPaths(
    git(["ls-files", "-z", "--cached", "--", ...attributePathspecs], { encoding: "buffer" }),
  ),
  ...nulPaths(
    git(["ls-files", "-z", "--others", "--exclude-standard", "--", ...attributePathspecs], {
      encoding: "buffer",
    }),
  ),
  ...nulPaths(
    git(
      [
        "ls-files",
        "-z",
        "--others",
        "--ignored",
        "--exclude-standard",
        "--",
        ...attributePathspecs,
      ],
      { encoding: "buffer" },
    ),
  ),
]);
const repositoryAttributes = [...attributeInputs]
  .filter((path) => path.split("/").at(-1) === ".gitattributes")
  .filter((path) => {
    const attributeDirectory = dirname(path).split(sep).join("/") || ".";
    return scopes.some(
      (scope) => isInside(attributeDirectory, scope) || isInside(scope, attributeDirectory),
    );
  })
  .sort();
if (repositoryAttributes.length > 0) {
  throw new Error(
    `candidate pinning does not support repository .gitattributes: ${repositoryAttributes.join(", ")}`,
  );
}

const repositoryAttributesPath = resolve(
  repositoryRoot,
  git(["rev-parse", "--git-path", "info/attributes"]).trim(),
);
if (existsSync(repositoryAttributesPath)) {
  const activeRepositoryAttributes = readFileSync(repositoryAttributesPath, "utf8")
    .split(/\r?\n/u)
    .some((line) => line.trim() && !line.trim().startsWith("#"));
  if (activeRepositoryAttributes) {
    throw new Error("repository-local .git/info/attributes must be empty for candidate pinning");
  }
}

if (output) {
  assertSafeOutput(output);
  const overlap = scopes.find((scope) => isInside(scope, output) || isInside(output, scope));
  if (overlap) {
    throw new Error(`output overlaps candidate scope: ${output} <> ${overlap}`);
  }
}

const temporaryDirectory = mkdtempSync(join(tmpdir(), "aidioma-close-index-"));
const temporaryIndex = join(temporaryDirectory, "index");
const temporaryGlobalAttributes = join(temporaryDirectory, "global-attributes");
writeFileSync(temporaryGlobalAttributes, "", { mode: 0o600 });
const literalPathEnvironment = { ...process.env, GIT_LITERAL_PATHSPECS: "1" };
const temporaryEnvironment = {
  ...literalPathEnvironment,
  GIT_INDEX_FILE: temporaryIndex,
};
let tree;

try {
  git(["read-tree", head], { env: temporaryEnvironment });
  const addScopes = scopes.filter((scope) =>
    existsSync(resolve(repositoryRoot, scope)) ||
    git(["ls-files", "--", scope], { env: literalPathEnvironment }).trim(),
  );
  if (addScopes.length > 0) {
    git(
      [
        "-c",
        `core.attributesFile=${temporaryGlobalAttributes}`,
        "-c",
        "core.autocrlf=false",
        "-c",
        "core.safecrlf=false",
        "-c",
        "core.filemode=true",
        "-c",
        "core.symlinks=true",
        "add",
        "-A",
        "--",
        ...addScopes,
      ],
      { env: { ...temporaryEnvironment, GIT_ATTR_NOSYSTEM: "1" } },
    );
  }
  tree = git(["write-tree"], { env: temporaryEnvironment }).trim();
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}

const paths = nulPaths(
  git(["diff", "--name-only", "-z", head, tree, "--", ...scopes], {
    encoding: "buffer",
    env: literalPathEnvironment,
  }),
).sort();

const files = paths.map((path) => {
  const record = nulPaths(
    git(["ls-tree", "-z", tree, "--", path], {
      encoding: "buffer",
      env: literalPathEnvironment,
    }),
  )[0];
  if (!record) {
    return { path, state: "deleted", mode: null, object: null };
  }

  const match = record.match(/^(\d+) ([^ ]+) ([0-9a-f]+)\t([\s\S]*)$/u);
  if (!match) {
    throw new Error(`could not parse git tree entry for ${path}`);
  }
  return { path: match[4], state: "present", mode: match[1], type: match[2], object: match[3] };
});

const receiptInput = { version: 3, head, tree, scopes, files };
const candidate = createHash("sha256").update(JSON.stringify(receiptInput)).digest("hex");
const ref = `refs/aidioma/close/${candidate}`;
const fixedCommitEnvironment = {
  ...process.env,
  GIT_AUTHOR_NAME: "AIdioma Close",
  GIT_AUTHOR_EMAIL: "close@aidioma.invalid",
  GIT_AUTHOR_DATE: "2000-01-01T00:00:00Z",
  GIT_COMMITTER_NAME: "AIdioma Close",
  GIT_COMMITTER_EMAIL: "close@aidioma.invalid",
  GIT_COMMITTER_DATE: "2000-01-01T00:00:00Z",
};
const commit = git(["-c", "i18n.commitEncoding=UTF-8", "commit-tree", tree, "-p", head], {
  env: fixedCommitEnvironment,
  input: `AIdioma close candidate ${candidate}\n`,
}).trim();
const manifest = { ...receiptInput, candidate, commit, ref };
const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
const absoluteOutput = output ? resolve(repositoryRoot, output) : null;
let outputAlreadyRetained = false;

if (output) {
  const existingEntry = lstatIfPresent(absoluteOutput);
  if (existingEntry) {
    if (existingEntry.isSymbolicLink() || !existingEntry.isFile()) {
      throw new Error(`refusing non-file output: ${output}`);
    }
    const retained = readFileSync(absoluteOutput, "utf8");
    let retainedCandidate;
    try {
      retainedCandidate = JSON.parse(retained).candidate;
    } catch {
      throw new Error(`refusing to replace invalid retained manifest: ${output}`);
    }
    if (retainedCandidate !== candidate) {
      throw new Error(`refusing to overwrite candidate ${retainedCandidate} with ${candidate}: ${output}`);
    }
    if (retained !== serialized) {
      throw new Error(`retained manifest differs for candidate ${candidate}: ${output}`);
    }
    outputAlreadyRetained = true;
  } else {
    const outputDirectory = dirname(absoluteOutput);
    mkdirSync(outputDirectory, { recursive: true });
    let createdComponent = repositoryRoot;
    for (const component of output.split("/").slice(0, -1)) {
      createdComponent = join(createdComponent, component);
      if (lstatIfPresent(createdComponent)?.isSymbolicLink()) {
        throw new Error(`refusing symlinked output ancestor: ${output}`);
      }
    }
    const realOutputDirectory = realpathSync(outputDirectory);
    const realRelative = relative(realRepositoryRoot, realOutputDirectory);
    if (realRelative === ".." || realRelative.startsWith(`..${sep}`) || isAbsolute(realRelative)) {
      throw new Error(`output directory resolves outside repository: ${output}`);
    }
  }
}

let createdRef = false;
let createdOutput = false;

try {
  const existingRef = tryGit(["rev-parse", "--verify", ref]);
  if (existingRef && existingRef !== commit) {
    throw new Error(`candidate ref collision: ${ref}`);
  }
  if (!existingRef) {
    try {
      git(["update-ref", ref, commit, ""]);
      createdRef = true;
    } catch (error) {
      if (tryGit(["rev-parse", "--verify", ref]) !== commit) {
        throw error;
      }
    }
  }
  if (git(["rev-parse", ref]).trim() !== commit) {
    throw new Error(`retained candidate ref does not resolve to commit: ${ref}`);
  }
  if (git(["rev-parse", `${ref}^{tree}`]).trim() !== tree) {
    throw new Error(`retained candidate ref does not resolve to tree: ${ref}`);
  }

  if (output && !outputAlreadyRetained) {
    const outputDirectory = dirname(absoluteOutput);
    const temporaryOutput = join(
      outputDirectory,
      `.${basename(absoluteOutput)}.${process.pid}.${randomUUID()}.tmp`,
    );
    try {
      writeFileSync(temporaryOutput, serialized, { encoding: "utf8", flag: "wx", mode: 0o644 });
      try {
        linkSync(temporaryOutput, absoluteOutput);
        createdOutput = true;
      } catch (error) {
        if (error?.code === "EEXIST") {
          const competing = lstatIfPresent(absoluteOutput);
          let identical = false;
          if (competing?.isFile() && !competing.isSymbolicLink()) {
            const competingManifest = readFileSync(absoluteOutput, "utf8");
            if (competingManifest === serialized) {
              identical = true;
            }
          }
          if (!identical) {
            throw new Error(`another candidate already retained at output: ${output}`);
          }
        } else {
          throw error;
        }
      }
    } finally {
      rmSync(temporaryOutput, { force: true });
    }
  }

  if (output && readFileSync(absoluteOutput, "utf8") !== serialized) {
    throw new Error(`could not verify retained manifest: ${output}`);
  }
  if (git(["rev-parse", ref]).trim() !== commit) {
    throw new Error(`retained candidate ref changed before completion: ${ref}`);
  }
  if (git(["rev-parse", `${ref}^{tree}`]).trim() !== tree) {
    throw new Error(`retained candidate tree changed before completion: ${ref}`);
  }
} catch (error) {
  if (
    createdOutput &&
    lstatIfPresent(absoluteOutput)?.isFile() &&
    !lstatIfPresent(absoluteOutput)?.isSymbolicLink() &&
    readFileSync(absoluteOutput, "utf8") === serialized
  ) {
    unlinkSync(absoluteOutput);
  }
  if (createdRef) {
    try {
      git(["update-ref", "-d", ref, commit]);
    } catch {
      // Never delete a ref another process changed.
    }
  }
  throw error;
}

process.stdout.write(serialized);
