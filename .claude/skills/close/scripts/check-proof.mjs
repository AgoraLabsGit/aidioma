#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, linkSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { tmpdir } from "node:os";

if (process.platform === "win32") throw new Error("check proof requires macOS or Linux");
const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const realRepositoryRoot = realpathSync(repositoryRoot);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalPath(path, label) {
  const absolute = resolve(repositoryRoot, path);
  const repositoryRelative = relative(repositoryRoot, absolute);
  if (!path || repositoryRelative === ".." || repositoryRelative.startsWith(`..${sep}`) || isAbsolute(repositoryRelative)) {
    throw new Error(`${label} escapes repository: ${path}`);
  }
  return repositoryRelative.split(sep).join("/");
}

function lstatIfPresent(path) {
  try { return lstatSync(path); }
  catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function rejectSymlinkComponents(path, label) {
  let component = repositoryRoot;
  for (const part of path.split("/")) {
    component = join(component, part);
    if (lstatIfPresent(component)?.isSymbolicLink()) throw new Error(`${label} uses a symlink: ${path}`);
  }
}

function git(args) {
  return execFileSync("git", args, { cwd: repositoryRoot, encoding: "utf8" }).trim();
}

function validateManifest(manifest) {
  const input = {
    version: manifest.version,
    head: manifest.head,
    tree: manifest.tree,
    scopes: manifest.scopes,
    files: manifest.files,
  };
  if (
    manifest.version !== 3 || sha256(JSON.stringify(input)) !== manifest.candidate ||
    manifest.ref !== `refs/aidioma/close/${manifest.candidate}` ||
    git(["rev-parse", "--verify", manifest.ref]) !== manifest.commit ||
    git(["rev-parse", `${manifest.ref}^{tree}`]) !== manifest.tree ||
    git(["rev-parse", `${manifest.commit}^`]) !== manifest.head
  ) {
    throw new Error("candidate manifest identity does not verify");
  }
}

function utcNow() {
  return new Date().toISOString().replace(/\.\d{3}Z$/u, "Z");
}

function checkEnvironment(names) {
  const environment = {
    PATH: process.env.PATH ?? "",
    LANG: "C",
    LC_ALL: "C",
    TZ: "UTC",
    CI: "1",
    NO_COLOR: "1",
    TERM: "dumb",
  };
  for (const name of names) {
    if (typeof process.env[name] !== "string" || process.env[name] === "") {
      throw new Error(`required check environment variable is missing: ${name}`);
    }
    environment[name] = process.env[name];
  }
  return environment;
}

function redactEnvironmentValues(value, names) {
  let redacted = value ?? "";
  for (const name of names) {
    const secret = process.env[name];
    if (typeof secret === "string" && secret !== "") redacted = redacted.split(secret).join("[REDACTED]");
  }
  return redacted;
}

const separator = process.argv.indexOf("--");
if (separator < 0 || separator === process.argv.length - 1) {
  throw new Error("usage: check-proof.mjs --manifest <path> --output <path> -- <command> [args...]");
}
const options = process.argv.slice(2, separator);
if (options.length !== 4 || options[0] !== "--manifest" || options[2] !== "--output") {
  throw new Error("check-proof requires --manifest and --output exactly once");
}
const manifestPath = canonicalPath(options[1], "manifest");
const outputPath = canonicalPath(options[3], "output");
if (!outputPath.startsWith("Docs/Evidence/") || !outputPath.includes("/checks/") || basename(outputPath) === "") {
  throw new Error("proof output must be under Docs/Evidence/<target>/checks/");
}
rejectSymlinkComponents(manifestPath, "manifest");
rejectSymlinkComponents(outputPath, "proof output");
const manifestReal = relative(realRepositoryRoot, realpathSync(resolve(repositoryRoot, manifestPath)));
if (manifestReal === ".." || manifestReal.startsWith(`..${sep}`) || isAbsolute(manifestReal)) {
  throw new Error("manifest resolves outside repository");
}
const manifest = JSON.parse(readFileSync(resolve(repositoryRoot, manifestPath), "utf8"));
validateManifest(manifest);
const evidenceDirectory = outputPath.slice(0, outputPath.indexOf("/checks/"));
const targetPath = `${evidenceDirectory}/target.json`;
let target;
try { target = JSON.parse(execFileSync("git", ["show", `${manifest.commit}:${targetPath}`], { cwd: repositoryRoot, encoding: "utf8" })); }
catch { throw new Error("candidate target contract is missing or invalid"); }
if (
  target.version !== 1 || target.evidence_dir !== evidenceDirectory ||
  !Array.isArray(target.scopes) || !target.scopes.includes(targetPath) ||
  !Array.isArray(target.check_commands) || target.check_commands.length === 0 ||
  target.check_commands.some((declared) =>
    !Array.isArray(declared) || declared.length === 0 || declared.some((part) => typeof part !== "string" || !part)
  ) ||
  !Array.isArray(target.check_environment) ||
  target.check_environment.some((name) => typeof name !== "string" || !/^[A-Z][A-Z0-9_]*$/u.test(name)) ||
  new Set(target.check_environment).size !== target.check_environment.length ||
  target.check_environment.some((name) => ["PATH", "HOME", "CODEX_HOME", "NODE_OPTIONS"].includes(name) || name.startsWith("GIT_")) ||
  !Number.isInteger(target.check_timeout_ms) || target.check_timeout_ms < 1000 || target.check_timeout_ms > 1_800_000
) {
  throw new Error("candidate target check contract is invalid");
}
if (manifest.scopes.some((scope) => outputPath === scope || outputPath.startsWith(`${scope}/`))) {
  throw new Error("proof output overlaps candidate scope");
}
const command = process.argv.slice(separator + 1);
if (!target.check_commands.some((declared) => JSON.stringify(declared) === JSON.stringify(command))) {
  throw new Error("check command is not declared by the candidate target");
}
const worktree = mkdtempSync(join(tmpdir(), "aidioma-check-proof-"));
let result;
const startedAt = utcNow();
try {
  execFileSync("git", ["worktree", "add", "--detach", worktree, manifest.commit], {
    cwd: repositoryRoot,
    stdio: ["ignore", "ignore", "pipe"],
  });
  const environment = checkEnvironment(target.check_environment);
  if (existsSync(join(worktree, "package-lock.json"))) {
    execFileSync("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"], {
      cwd: worktree,
      env: environment,
      stdio: ["ignore", "ignore", "pipe"],
      timeout: target.check_timeout_ms,
    });
  }
  result = spawnSync(command[0], command.slice(1), {
    cwd: worktree,
    encoding: "utf8",
    env: environment,
    timeout: target.check_timeout_ms,
    killSignal: "SIGKILL",
    maxBuffer: 64 * 1024 * 1024,
  });
} finally {
  try {
    execFileSync("git", ["worktree", "remove", "--force", worktree], { cwd: repositoryRoot, stdio: "ignore" });
  } catch {
    rmSync(worktree, { recursive: true, force: true });
  }
}
const proof = {
  version: 1,
  candidate: manifest.candidate,
  commit: manifest.commit,
  tree: manifest.tree,
  command,
  started_at: startedAt,
  finished_at: utcNow(),
  exit_code: Number.isInteger(result.status) ? result.status : 1,
  signal: result.signal ?? null,
  stdout: redactEnvironmentValues(result.stdout ?? "", target.check_environment),
  stderr: redactEnvironmentValues(result.stderr ?? (result.error ? String(result.error) : ""), target.check_environment),
};
const serialized = `${JSON.stringify(proof, null, 2)}\n`;
const absoluteOutput = resolve(repositoryRoot, outputPath);
if (existsSync(absoluteOutput) && readFileSync(absoluteOutput, "utf8") !== serialized) {
  throw new Error(`refusing to replace differing proof: ${outputPath}`);
}
mkdirSync(dirname(absoluteOutput), { recursive: true });
if (!existsSync(absoluteOutput)) {
  const temporary = `${absoluteOutput}.${process.pid}.${randomUUID()}.tmp`;
  writeFileSync(temporary, serialized, { flag: "wx", mode: 0o644 });
  try {
    try { linkSync(temporary, absoluteOutput); }
    catch (error) {
      if (error?.code !== "EEXIST" || readFileSync(absoluteOutput, "utf8") !== serialized) throw error;
    }
  } finally {
    rmSync(temporary, { force: true });
  }
}
process.stdout.write(JSON.stringify({ path: outputPath, sha256: sha256(serialized), ...proof }, null, 2));
