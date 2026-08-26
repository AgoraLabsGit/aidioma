#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  existsSync,
  linkSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

if (process.platform === "win32") {
  throw new Error("close bundles require a POSIX filesystem (macOS or Linux)");
}

const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const realRepositoryRoot = realpathSync(repositoryRoot);

function git(args, options = {}) {
  return execFileSync("git", args, {
    cwd: repositoryRoot,
    encoding: options.encoding ?? "utf8",
    env: options.env ?? process.env,
    input: options.input,
    maxBuffer: 64 * 1024 * 1024,
    stdio: options.stdio,
  });
}

function tryGit(args) {
  try {
    return git(args, { stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

function lstatIfPresent(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function canonicalRepositoryPath(path, label) {
  if (!path) throw new Error(`${label} requires a path`);
  const absolute = resolve(repositoryRoot, path);
  const repositoryRelative = relative(repositoryRoot, absolute);
  if (
    repositoryRelative === ".." ||
    repositoryRelative.startsWith(`..${sep}`) ||
    isAbsolute(repositoryRelative)
  ) {
    throw new Error(`${label} escapes repository: ${path}`);
  }
  return (repositoryRelative || ".").split(sep).join("/");
}

function isInside(parent, child) {
  return parent === "." || child === parent || child.startsWith(`${parent}/`);
}

function assertSafeRegularFile(path, label) {
  const absolute = resolve(repositoryRoot, path);
  let component = repositoryRoot;
  for (const part of path.split("/")) {
    component = join(component, part);
    const entry = lstatIfPresent(component);
    if (entry?.isSymbolicLink()) throw new Error(`${label} uses a symlink: ${path}`);
  }
  const entry = lstatIfPresent(absolute);
  if (!entry?.isFile()) throw new Error(`${label} is not a regular file: ${path}`);
  const realRelative = relative(realRepositoryRoot, realpathSync(absolute));
  if (realRelative === ".." || realRelative.startsWith(`..${sep}`) || isAbsolute(realRelative)) {
    throw new Error(`${label} resolves outside repository: ${path}`);
  }
}

function assertSafeOutput(path) {
  if (!path.startsWith("Docs/Evidence/") || basename(path) !== "close-bundle.json") {
    throw new Error("bundle output must be Docs/Evidence/<target>/close-bundle.json");
  }
  const targetDirectory = dirname(path);
  if (targetDirectory === "Docs/Evidence") {
    throw new Error("bundle output requires a target evidence directory");
  }
  let component = repositoryRoot;
  for (const part of targetDirectory.split("/")) {
    component = join(component, part);
    const entry = lstatIfPresent(component);
    if (entry?.isSymbolicLink()) throw new Error(`bundle output uses a symlink: ${path}`);
  }
  const outputEntry = lstatIfPresent(resolve(repositoryRoot, path));
  if (outputEntry?.isSymbolicLink() || (outputEntry && !outputEntry.isFile())) {
    throw new Error(`bundle output is not a regular file: ${path}`);
  }
  return targetDirectory;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function exactKeys(value, keys, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} keys must be exactly: ${expected.join(", ")}`);
  }
}

function parseJsonFile(path, label) {
  assertSafeRegularFile(path, label);
  try {
    return JSON.parse(readFileSync(resolve(repositoryRoot, path), "utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${path}`, { cause: error });
  }
}

function validateCandidateManifest(manifest, manifestPath) {
  exactKeys(
    manifest,
    ["version", "head", "tree", "scopes", "files", "candidate", "commit", "ref"],
    "candidate manifest",
  );
  if (manifest.version !== 3 || !Array.isArray(manifest.scopes) || !Array.isArray(manifest.files)) {
    throw new Error(`unsupported candidate manifest: ${manifestPath}`);
  }
  const receiptInput = {
    version: 3,
    head: manifest.head,
    tree: manifest.tree,
    scopes: manifest.scopes,
    files: manifest.files,
  };
  if (sha256(JSON.stringify(receiptInput)) !== manifest.candidate) {
    throw new Error(`candidate digest mismatch: ${manifestPath}`);
  }
  if (manifest.ref !== `refs/aidioma/close/${manifest.candidate}`) {
    throw new Error(`candidate ref name mismatch: ${manifestPath}`);
  }
  if (tryGit(["rev-parse", "--verify", manifest.ref]) !== manifest.commit) {
    throw new Error(`candidate ref does not resolve to manifest commit: ${manifestPath}`);
  }
  if (git(["rev-parse", `${manifest.ref}^{tree}`]).trim() !== manifest.tree) {
    throw new Error(`candidate ref does not resolve to manifest tree: ${manifestPath}`);
  }
  if (git(["rev-parse", `${manifest.commit}^`]).trim() !== manifest.head) {
    throw new Error(`candidate commit parent mismatch: ${manifestPath}`);
  }
}

function candidateFile(manifest, path) {
  let bytes;
  try {
    bytes = git(["show", `${manifest.commit}:${path}`], { encoding: "buffer" });
  } catch {
    throw new Error(`candidate does not contain authority: ${path}`);
  }
  const record = git(["ls-tree", manifest.commit, "--", path]).trim();
  const match = record.match(/^(\d+) [^ ]+ [0-9a-f]+\t/u);
  if (!match) throw new Error(`cannot read candidate mode: ${path}`);
  return { bytes, mode: match[1] };
}

function assertLiveMatchesCandidate(manifest, path, label) {
  assertSafeRegularFile(path, label);
  const retained = candidateFile(manifest, path);
  const live = readFileSync(resolve(repositoryRoot, path));
  if (!live.equals(retained.bytes) || modeFor(path) !== retained.mode) {
    throw new Error(`${label} differs from audited candidate: ${path}`);
  }
}

function validateStringArray(value, label) {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== "string" || !item)) {
    throw new Error(`${label} must be a non-empty string array`);
  }
}

function validateTarget(target, targetPath, manifest) {
  const common = [
    "version", "id", "kind", "evidence_dir", "risk_tier", "required_lenses",
    "check_commands", "check_environment", "check_timeout_ms", "scopes",
  ];
  if (["task", "fix"].includes(target.kind)) {
    exactKeys(target, [...common, "outcome", "proof", "non_goals"], "task target");
    if (typeof target.outcome !== "string" || !target.outcome) throw new Error("task target requires outcome");
    validateStringArray(target.proof, "task target proof");
    if (!Array.isArray(target.non_goals)) throw new Error("task target non_goals must be an array");
  } else if (target.kind === "phase") {
    exactKeys(target, [...common, "authority"], "phase target");
    const authority = canonicalRepositoryPath(target.authority, "phase authority");
    if (authority !== target.authority) throw new Error("phase authority path must be canonical");
  } else {
    throw new Error(`unsupported target kind: ${target.kind}`);
  }
  if (target.version !== 1 || typeof target.id !== "string" || !target.id) {
    throw new Error(`unsupported target contract: ${targetPath}`);
  }
  if (!Number.isInteger(target.risk_tier) || target.risk_tier < 0 || target.risk_tier > 3) {
    throw new Error("target risk_tier must be an integer from 0 through 3");
  }
  validateCheckContract(target, "target");
  if (
    !Array.isArray(target.check_commands) || target.check_commands.length === 0 ||
    target.check_commands.some((command) =>
      !Array.isArray(command) || command.length === 0 || command.some((part) => typeof part !== "string" || !part)
    ) || new Set(target.check_commands.map((command) => JSON.stringify(command))).size !== target.check_commands.length
  ) {
    throw new Error("target check_commands must be unique non-empty argv arrays");
  }
  const evidenceDirectory = canonicalRepositoryPath(target.evidence_dir, "target evidence_dir");
  if (
    evidenceDirectory !== target.evidence_dir || evidenceDirectory !== dirname(targetPath) ||
    targetPath !== `${evidenceDirectory}/target.json`
  ) {
    throw new Error(`target path does not match evidence_dir: ${targetPath}`);
  }
  if (!evidenceDirectory.startsWith("Docs/Evidence/")) {
    throw new Error(`target evidence_dir must be under Docs/Evidence: ${evidenceDirectory}`);
  }
  if (!Array.isArray(target.scopes) || target.scopes.length === 0) throw new Error("target requires scopes");
  const scopes = [...new Set(target.scopes.map((scope) => canonicalRepositoryPath(scope, "target scope")))].sort();
  if (JSON.stringify(scopes) !== JSON.stringify(target.scopes)) {
    throw new Error("target scopes must be unique and canonically sorted");
  }
  if (JSON.stringify(target.scopes) !== JSON.stringify(manifest.scopes)) {
    throw new Error("target scopes do not exactly match candidate manifest scopes");
  }
  if (!Array.isArray(target.required_lenses)) throw new Error("target required_lenses must be an array");
  const selected = new Set(target.required_lenses);
  if (
    selected.size !== target.required_lenses.length ||
    target.required_lenses.some((lens) => !gateNames.includes(lens)) ||
    JSON.stringify(target.required_lenses) !== JSON.stringify(gateNames.filter((lens) => selected.has(lens)))
  ) {
    throw new Error("target required_lenses must be unique and in canonical gate order");
  }
  const minimumLenses = ["Claims / Proof evidence", "Code quality / Standards", "MCOO"];
  if (target.risk_tier >= 2) minimumLenses.push("Seams / Integration", "Product / Learner journey");
  if (target.risk_tier >= 3) minimumLenses.push("Security / Privacy");
  if (target.risk_tier === 0 && target.required_lenses.length !== 0) {
    throw new Error("Tier 0 targets cannot select required lenses");
  }
  if (target.risk_tier > 0 && !minimumLenses.every((lens) => selected.has(lens))) {
    throw new Error(`Tier ${target.risk_tier} target is missing a minimum required lens`);
  }
  if (
    target.kind === "phase" &&
    !["Claims / Proof evidence", "MCOO"].every((lens) => target.required_lenses.includes(lens))
  ) {
    throw new Error("phase targets always require Claims / Proof evidence and MCOO");
  }
  if (!target.scopes.some((scope) => isInside(scope, targetPath))) {
    throw new Error(`target contract is outside candidate scopes: ${targetPath}`);
  }
  if (target.kind === "phase" && !target.scopes.some((scope) => isInside(scope, target.authority))) {
    throw new Error(`phase authority is outside candidate scopes: ${target.authority}`);
  }
  assertLiveMatchesCandidate(manifest, targetPath, "target contract");
  return evidenceDirectory;
}

function validateCheckContract(target, label) {
  if (
    !Array.isArray(target.check_environment) ||
    target.check_environment.some((name) => typeof name !== "string" || !/^[A-Z][A-Z0-9_]*$/u.test(name)) ||
    new Set(target.check_environment).size !== target.check_environment.length ||
    target.check_environment.some((name) => ["PATH", "HOME", "CODEX_HOME", "NODE_OPTIONS"].includes(name) || name.startsWith("GIT_"))
  ) {
    throw new Error(`${label} check_environment must be a unique safe environment-name allowlist`);
  }
  if (!Number.isInteger(target.check_timeout_ms) || target.check_timeout_ms < 1000 || target.check_timeout_ms > 1_800_000) {
    throw new Error(`${label} check_timeout_ms must be an integer from 1000 through 1800000`);
  }
}

function validateAttemptManifest(attempt, target, label, requireCheckContract) {
  const manifestPath = canonicalRepositoryPath(attempt.manifest, `${label} manifest`);
  if (!isInside(target.evidence_dir, manifestPath) || !/^[0-9a-f]{64}$/u.test(attempt.manifest_sha256)) {
    throw new Error(`invalid ${label} manifest reference: ${manifestPath}`);
  }
  assertSafeRegularFile(manifestPath, `${label} manifest`);
  const bytes = readFileSync(resolve(repositoryRoot, manifestPath));
  if (sha256(bytes) !== attempt.manifest_sha256) throw new Error(`${label} manifest digest mismatch: ${manifestPath}`);
  const manifest = parseJsonFile(manifestPath, `${label} manifest`);
  validateCandidateManifest(manifest, manifestPath);
  if (attempt.candidate !== manifest.candidate) throw new Error(`${label} candidate does not match its manifest`);
  const targetPath = `${target.evidence_dir}/target.json`;
  const retained = candidateFile(manifest, targetPath);
  let historicalTarget;
  try { historicalTarget = JSON.parse(retained.bytes.toString("utf8")); }
  catch { throw new Error(`${label} candidate target is not valid JSON`); }
  if (
    historicalTarget.version !== 1 || historicalTarget.id !== target.id ||
    historicalTarget.kind !== target.kind || historicalTarget.evidence_dir !== target.evidence_dir ||
    !Array.isArray(historicalTarget.scopes) || !historicalTarget.scopes.includes(targetPath)
  ) {
    throw new Error(`${label} manifest belongs to a different target`);
  }
  if (requireCheckContract) {
    validateCheckContract(historicalTarget, `${label} candidate target`);
    if (
      !Array.isArray(historicalTarget.check_commands) || historicalTarget.check_commands.length === 0 ||
      historicalTarget.check_commands.some((command) =>
        !Array.isArray(command) || command.length === 0 || command.some((part) => typeof part !== "string" || !part)
      )
    ) {
      throw new Error(`${label} candidate target has invalid check_commands`);
    }
  }
  return { manifest, manifestPath, historicalTarget };
}

function normalizePhaseAuthority(bytes) {
  const text = bytes.toString("utf8");
  if (!text.startsWith("---\n")) throw new Error("phase authority must use LF-delimited frontmatter");
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) throw new Error("phase authority frontmatter is not closed");
  const frontmatter = text.slice(4, end);
  const values = new Map();
  const normalized = frontmatter.replace(/^(state|closed|lessons):.*$/gmu, (line, key) => {
    if (values.has(key)) throw new Error(`duplicate phase close field: ${key}`);
    values.set(key, line.slice(line.indexOf(":") + 1).trim());
    return `${key}: <close-receipt>`;
  });
  if (["state", "closed", "lessons"].some((key) => !values.has(key))) {
    throw new Error("phase authority lacks state/closed/lessons fields");
  }
  const idLines = [...frontmatter.matchAll(/^id:\s*(.*?)\s*$/gmu)];
  if (idLines.length !== 1) throw new Error("phase authority requires exactly one id");
  const id = idLines[0][1].trim();
  if (!/^PHASE-\d{3}$/u.test(id)) throw new Error("phase id must use canonical PHASE-000 syntax");
  const riskTierLines = [...text.matchAll(/^\*\*Risk tier:\*\*\s*([1-3])\s*$/gmu)];
  if (riskTierLines.length !== 1) throw new Error("phase authority requires exactly one Risk tier selection");
  return { normalized: `${normalized}${text.slice(end)}`, values, id, riskTier: Number(riskTierLines[0][1]) };
}

function parseCanonicalJsonString(raw, label) {
  const value = raw.trim();
  if (!value.startsWith('"')) throw new Error(`${label} must be a canonical JSON-quoted YAML string`);
  let parsed;
  try { parsed = JSON.parse(value); } catch { throw new Error(`${label} is not a valid canonical quoted string`); }
  if (typeof parsed !== "string" || !parsed.trim()) throw new Error(`${label} must be a non-empty string`);
  return parsed;
}

function isCalendarDate(value) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/u);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1];
}

function validatePhaseAuthority(target, manifest) {
  assertSafeRegularFile(target.authority, "phase authority");
  const retained = candidateFile(manifest, target.authority);
  if (modeFor(target.authority) !== retained.mode) throw new Error("phase authority mode changed after audit");
  const before = normalizePhaseAuthority(retained.bytes);
  const after = normalizePhaseAuthority(readFileSync(resolve(repositoryRoot, target.authority)));
  if (before.normalized !== after.normalized) {
    throw new Error("phase authority changed outside state/closed/lessons");
  }
  if (after.values.get("state") !== "closed" || !isCalendarDate(after.values.get("closed"))) {
    throw new Error("phase authority is not closed with an ISO date");
  }
  if (
    before.id !== target.id || after.id !== target.id ||
    basename(target.authority, ".md") !== target.id || !/^PHASE-\d{3}$/u.test(target.id)
  ) {
    throw new Error("phase target id does not match authority id and filename");
  }
  if (before.riskTier !== target.risk_tier || after.riskTier !== target.risk_tier) {
    throw new Error("phase Risk tier selection does not match target risk_tier");
  }
  parseCanonicalJsonString(after.values.get("lessons"), "phase lessons");
}

function compareRecords(left, right) {
  const pathOrder = Buffer.compare(Buffer.from(left.path, "utf8"), Buffer.from(right.path, "utf8"));
  return pathOrder || Buffer.compare(Buffer.from(left.role, "utf8"), Buffer.from(right.role, "utf8"));
}

const gateNames = [
  "Claims / Proof evidence",
  "Code quality / Standards",
  "MCOO",
  "Seams / Integration",
  "Security / Privacy",
  "API / Provider usage",
  "Product / Learner journey",
];

function validateCloseRecord(record, recordPath, target, manifest, reportPath, bundlePath) {
  exactKeys(
    record,
    [
      "version", "target", "candidate", "final_check", "gates", "accepted_warnings",
      "authority_comparison", "report", "bundle", "publication_at_close",
    ],
    "close record",
  );
  if (
    record.version !== 1 || record.target !== target.id || record.candidate !== manifest.candidate ||
    record.final_check !== "PASS" || record.authority_comparison !== "PASS" ||
    record.publication_at_close !== "not_requested" || record.report !== reportPath || record.bundle !== bundlePath
  ) {
    throw new Error(`close record does not match target/candidate/evidence: ${recordPath}`);
  }
  if (recordPath !== `${target.evidence_dir}/close-record.json`) {
    throw new Error(`close record path does not match target evidence_dir: ${recordPath}`);
  }
  exactKeys(record.gates, gateNames, "close record gates");
  const warnings = [];
  for (const lens of gateNames) {
    const verdict = record.gates[lens];
    const required = target.required_lenses.includes(lens);
    if (required && verdict === "WARN") warnings.push(lens);
    else if (required && verdict !== "PASS") {
      throw new Error(`invalid final gate verdict for ${lens}: ${verdict}`);
    } else if (!required) {
      const prefix = "n/a — ";
      const reason = typeof verdict === "string" && verdict.startsWith(prefix) ? verdict.slice(prefix.length) : "";
      if (reason !== reason.trim() || reason.length < 5) {
        throw new Error(`invalid final gate verdict for ${lens}: ${verdict}`);
      }
    }
  }
  if (!Array.isArray(record.accepted_warnings) || record.accepted_warnings.length !== warnings.length) {
    throw new Error("accepted_warnings must exactly cover WARN gates");
  }
  const accepted = new Set();
  for (const warning of record.accepted_warnings) {
    exactKeys(warning, ["lens", "candidate", "risk", "reason", "acceptance", "accepted_at"], "accepted warning");
    if (
      !warnings.includes(warning.lens) || accepted.has(warning.lens) ||
      warning.candidate !== manifest.candidate ||
      !substantive(warning.risk, 3) || !substantive(warning.reason, 8) ||
      !substantive(warning.acceptance, 8) || !isUtcTimestamp(warning.accepted_at)
    ) {
      throw new Error(`invalid accepted warning: ${warning.lens}`);
    }
    accepted.add(warning.lens);
  }
}

function substantive(value, minimum) {
  return typeof value === "string" && value === value.trim() && value.length >= minimum;
}

function isUtcTimestamp(value) {
  if (typeof value !== "string") return false;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/u);
  return Boolean(
    match && isCalendarDate(match[1]) && Number(match[2]) <= 23 &&
    Number(match[3]) <= 59 && Number(match[4]) <= 59
  );
}

function parseAuditResponse(text, responsePath, attempt, target) {
  const lines = text.replace(/\r\n/gu, "\n").split("\n");
  if (lines.at(-1) === "") lines.pop();
  const headings = ["TARGET", "LENS", "RESULT", "CANDIDATE", "BLOCKERS", "FINDINGS", "REMEDIATION"];
  const positions = new Map();
  for (const heading of headings) {
    const matches = lines
      .map((line, index) => line.startsWith(`${heading}:`) ? index : -1)
      .filter((index) => index >= 0);
    if (matches.length !== 1) {
      throw new Error(`audit response must contain exactly one ${heading} heading: ${responsePath}`);
    }
    positions.set(heading, matches[0]);
  }
  const allowedTargets = new Set([
    `${target.evidence_dir}/target.json`,
    ...(target.kind === "phase" ? [target.authority] : []),
  ]);
  const targetValue = lines[positions.get("TARGET")].slice("TARGET:".length).trim();
  if (
    positions.get("TARGET") !== 0 || positions.get("LENS") !== 1 ||
    positions.get("RESULT") !== 2 || positions.get("CANDIDATE") !== 3 ||
    positions.get("BLOCKERS") !== 4 || positions.get("FINDINGS") <= positions.get("BLOCKERS") ||
    positions.get("REMEDIATION") <= positions.get("FINDINGS") ||
    !allowedTargets.has(targetValue) || lines[0] !== `TARGET: ${targetValue}` ||
    lines[1] !== `LENS: ${attempt.lens}` || lines[2] !== `RESULT: ${attempt.verdict}` ||
    lines[3] !== `CANDIDATE: ${attempt.candidate}` ||
    lines[positions.get("FINDINGS")] !== "FINDINGS:"
  ) {
    throw new Error(`audit response has a wrong target or conflicting ordered headers: ${responsePath}`);
  }
  const blockers = [
    lines[4].slice("BLOCKERS:".length),
    ...lines.slice(5, positions.get("FINDINGS")),
  ].join("\n").trim();
  if (["PASS", "WARN"].includes(attempt.verdict) && (lines[4] !== "BLOCKERS: none" || positions.get("FINDINGS") !== 5)) {
    throw new Error(`final PASS/WARN audit response must state BLOCKERS: none: ${responsePath}`);
  }
  if (attempt.verdict === "FAIL" && blockers.length < 10) {
    throw new Error(`FAIL audit response requires substantive blockers: ${responsePath}`);
  }
  const findings = lines.slice(positions.get("FINDINGS") + 1, positions.get("REMEDIATION")).join("\n").trim();
  if (findings.length < 20) {
    throw new Error(`audit response requires substantive findings: ${responsePath}`);
  }
  const remediationLine = lines[positions.get("REMEDIATION")];
  if (!remediationLine.startsWith("REMEDIATION: ")) {
    throw new Error(`audit response requires a remediation value: ${responsePath}`);
  }
  const remediation = [
    remediationLine.slice("REMEDIATION: ".length),
    ...lines.slice(positions.get("REMEDIATION") + 1),
  ].join("\n").trim();
  if (remediation.length < 4 || (attempt.verdict === "PASS" && remediation !== "none")) {
    throw new Error(`audit response remediation conflicts with ${attempt.verdict}: ${responsePath}`);
  }
}

function validateDeclaredAuditorAllocation(target, auditors) {
  const entries = [...auditors.entries()];
  if (target.risk_tier === 0) return;
  const distinct = new Set(auditors.values());
  if (distinct.size < 2) throw new Error("multi-agent close requires at least two declared auditors");

  const requireDifferent = (left, right) => {
    if (auditors.has(left) && auditors.has(right) && auditors.get(left) === auditors.get(right)) {
      throw new Error(`declared auditor allocation requires different agents: ${left} <> ${right}`);
    }
  };
  requireDifferent("Claims / Proof evidence", "Code quality / Standards");
  if (target.risk_tier === 1) requireDifferent("MCOO", "Code quality / Standards");

  for (const sensitive of ["Security / Privacy", "API / Provider usage"]) {
    if (!auditors.has(sensitive)) continue;
    for (const [other, otherAuditor] of entries) {
      if (other !== sensitive && auditors.get(sensitive) === otherAuditor) {
        throw new Error(`declared auditor allocation requires a separate ${sensitive} agent`);
      }
    }
  }

  if (target.risk_tier === 2) {
    const groups = [
      ["Code quality / Standards"],
      ["MCOO", "Seams / Integration"],
      ["Claims / Proof evidence", "Product / Learner journey"],
    ];
    for (let left = 0; left < groups.length; left += 1) {
      for (let right = left + 1; right < groups.length; right += 1) {
        for (const leftLens of groups[left]) for (const rightLens of groups[right]) {
          requireDifferent(leftLens, rightLens);
        }
      }
    }
  }
  if (target.risk_tier === 3 && distinct.size !== entries.length) {
    throw new Error("Tier 3 requires one declared auditor per required lens");
  }
}

function validateAuditResults(audits, auditsPath, target, manifest, closeRecord, reportPath) {
  exactKeys(audits, ["version", "target", "candidate", "report", "attempts", "results"], "audit results");
  if (
    audits.version !== 1 || audits.target !== target.id || audits.candidate !== manifest.candidate ||
    audits.report !== reportPath || !Array.isArray(audits.attempts) || !Array.isArray(audits.results)
  ) {
    throw new Error(`audit results do not match target/candidate: ${auditsPath}`);
  }
  if (auditsPath !== `${target.evidence_dir}/audit-results.json`) {
    throw new Error(`audit results path does not match target evidence_dir: ${auditsPath}`);
  }
  if (audits.results.length !== target.required_lenses.length || (target.required_lenses.length > 0 && audits.attempts.length === 0)) {
    throw new Error("audit results must contain exactly one result per required lens");
  }
  const report = readFileSync(resolve(repositoryRoot, reportPath), "utf8");
  if (report.split(auditsPath).length !== 2) {
    throw new Error("audit report must link structured audit results exactly once");
  }
  const attempts = new Map();
  const responsePaths = [];
  const manifestPaths = [];
  let previousNumber = 0;
  let previousAt = "";
  for (const attempt of audits.attempts) {
    exactKeys(
      attempt,
      ["id", "at", "lens", "auditor", "verdict", "candidate", "manifest", "manifest_sha256", "response", "response_sha256"],
      "audit attempt",
    );
    const number = typeof attempt.id === "string" && /^A([1-9]\d*)$/u.test(attempt.id)
      ? Number(attempt.id.slice(1)) : 0;
    if (
      number <= previousNumber || !isUtcTimestamp(attempt.at) || (previousAt && attempt.at < previousAt) ||
      !target.required_lenses.includes(attempt.lens) || !substantive(attempt.auditor, 3) ||
      !["PASS", "WARN", "FAIL"].includes(attempt.verdict) || !/^[0-9a-f]{64}$/u.test(attempt.candidate) ||
      attempts.has(attempt.id)
    ) {
      throw new Error(`invalid or noncanonical audit attempt: ${attempt.id}`);
    }
    previousNumber = number;
    previousAt = attempt.at;
    const attemptManifest = validateAttemptManifest(attempt, target, `audit attempt ${attempt.id}`, false);
    if (!manifestPaths.includes(attemptManifest.manifestPath)) manifestPaths.push(attemptManifest.manifestPath);
    const responsePath = canonicalRepositoryPath(attempt.response, `audit response ${attempt.lens}`);
    if (!isInside(`${target.evidence_dir}/audits`, responsePath)) {
      throw new Error(`audit response is outside audits: ${responsePath}`);
    }
    assertSafeRegularFile(responsePath, `audit response ${attempt.lens}`);
    const response = readFileSync(resolve(repositoryRoot, responsePath));
    if (sha256(response) !== attempt.response_sha256) {
      throw new Error(`audit response digest mismatch: ${responsePath}`);
    }
    const text = response.toString("utf8");
    parseAuditResponse(text, responsePath, attempt, target);
    if (responsePaths.includes(responsePath)) throw new Error(`duplicate audit response: ${responsePath}`);
    const rowPrefix = `| ${attempt.id} | ${attempt.at} | ${attempt.lens} | ${attempt.verdict} | \`${attempt.candidate}\` |`;
    if (report.split(rowPrefix).length !== 2 || report.split(responsePath).length !== 2) {
      throw new Error(`audit report does not exactly index attempt: ${attempt.id}`);
    }
    responsePaths.push(responsePath);
    attempts.set(attempt.id, attempt);
  }
  const auditFiles = listAuditFiles(target);
  if (JSON.stringify(auditFiles) !== JSON.stringify([...responsePaths].sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right))))) {
    throw new Error("audit attempt history does not exactly cover the retained audits tree");
  }

  const auditors = new Map();
  for (const [index, result] of audits.results.entries()) {
    exactKeys(result, ["lens", "attempt"], `audit result ${index}`);
    const expectedLens = target.required_lenses[index];
    const selected = attempts.get(result.attempt);
    const lensAttempts = audits.attempts.filter((attempt) => attempt.lens === expectedLens);
    const latest = lensAttempts.at(-1);
    if (
      result.lens !== expectedLens || !selected || selected !== latest ||
      selected.candidate !== manifest.candidate || !["PASS", "WARN"].includes(selected.verdict) ||
      closeRecord.gates[expectedLens] !== selected.verdict
    ) {
      throw new Error(`invalid, non-latest, or conflicting audit result for ${expectedLens}`);
    }
    auditors.set(expectedLens, selected.auditor);
  }
  validateDeclaredAuditorAllocation(target, auditors);
  return { responsePaths, manifestPaths };
}

function listAuditFiles(target) {
  const root = `${target.evidence_dir}/audits`;
  const absoluteRoot = resolve(repositoryRoot, root);
  const rootEntry = lstatIfPresent(absoluteRoot);
  if (!rootEntry) return [];
  if (!rootEntry.isDirectory() || rootEntry.isSymbolicLink()) {
    throw new Error(`audit evidence root must be a real directory: ${root}`);
  }
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(resolve(repositoryRoot, directory), { withFileTypes: true })) {
      const path = `${directory}/${entry.name}`;
      const status = lstatSync(resolve(repositoryRoot, path));
      if (status.isSymbolicLink()) throw new Error(`audit evidence uses a symlink: ${path}`);
      if (status.isDirectory()) visit(path);
      else if (status.isFile()) {
        assertSafeRegularFile(path, "audit evidence");
        files.push(path);
      } else {
        throw new Error(`audit evidence is not a regular file: ${path}`);
      }
    }
  };
  visit(root);
  return files.sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)));
}

function listCheckFiles(target) {
  const root = `${target.evidence_dir}/checks`;
  const absoluteRoot = resolve(repositoryRoot, root);
  const rootEntry = lstatIfPresent(absoluteRoot);
  if (!rootEntry) return [];
  if (!rootEntry.isDirectory() || rootEntry.isSymbolicLink()) {
    throw new Error(`check evidence root must be a real directory: ${root}`);
  }
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(resolve(repositoryRoot, directory), { withFileTypes: true })) {
      const path = `${directory}/${entry.name}`;
      const status = lstatSync(resolve(repositoryRoot, path));
      if (status.isSymbolicLink()) throw new Error(`check evidence uses a symlink: ${path}`);
      if (status.isDirectory()) visit(path);
      else if (status.isFile()) {
        assertSafeRegularFile(path, "check evidence");
        files.push(path);
      } else {
        throw new Error(`check evidence is not a regular file: ${path}`);
      }
    }
  };
  visit(root);
  return files.sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)));
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

function validateCheckProof(reference, target, manifest, checkContract) {
  exactKeys(reference, ["path", "sha256"], "check proof reference");
  const path = canonicalRepositoryPath(reference.path, "check proof");
  if (!isInside(`${target.evidence_dir}/checks`, path) || !/^[0-9a-f]{64}$/u.test(reference.sha256)) {
    throw new Error(`invalid check proof reference: ${path}`);
  }
  assertSafeRegularFile(path, "check proof");
  const bytes = readFileSync(resolve(repositoryRoot, path));
  if (sha256(bytes) !== reference.sha256) throw new Error(`check proof digest mismatch: ${path}`);
  let proof;
  try { proof = JSON.parse(bytes.toString("utf8")); } catch { throw new Error(`check proof is not JSON: ${path}`); }
  exactKeys(
    proof,
    [
      "version", "candidate", "commit", "tree", "command", "started_at", "finished_at",
      "exit_code", "signal", "stdout", "stderr",
    ],
    "check proof",
  );
  if (
    proof.version !== 1 || proof.candidate !== manifest.candidate || proof.commit !== manifest.commit ||
    proof.tree !== manifest.tree || !Array.isArray(proof.command) || proof.command.length === 0 ||
    proof.command.some((part) => typeof part !== "string" || !part) ||
    !isUtcTimestamp(proof.started_at) || !isUtcTimestamp(proof.finished_at) ||
    proof.finished_at < proof.started_at || !Number.isInteger(proof.exit_code) ||
    ![null, "SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGKILL", "SIGPIPE", "SIGQUIT", "SIGSEGV", "SIGTERM"].includes(proof.signal) ||
    typeof proof.stdout !== "string" || typeof proof.stderr !== "string"
  ) {
    throw new Error(`invalid candidate-bound check proof: ${path}`);
  }
  for (const name of checkContract.check_environment) {
    const secret = process.env[name];
    if (typeof secret === "string" && secret !== "" && (proof.stdout.includes(secret) || proof.stderr.includes(secret))) {
      throw new Error(`check proof contains an allowlisted environment value: ${path}`);
    }
  }

  return {
    path,
    command: proof.command,
    exitCode: proof.exit_code,
    signal: proof.signal,
    finishedAt: proof.finished_at,
  };
}

function replayFinalCheckAttempt(attemptId, proofs, manifest, checkContract) {
  const worktree = mkdtempSync(join(tmpdir(), "aidioma-check-verify-"));
  try {
    git(["worktree", "add", "--detach", worktree, manifest.commit], { stdio: ["ignore", "ignore", "pipe"] });
    const environment = checkEnvironment(checkContract.check_environment);
    if (existsSync(join(worktree, "package-lock.json"))) {
      execFileSync("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"], {
        cwd: worktree,
        env: environment,
        stdio: ["ignore", "ignore", "pipe"],
        timeout: checkContract.check_timeout_ms,
      });
    }
    for (const proof of proofs) {
      const rerun = spawnSync(proof.command[0], proof.command.slice(1), {
        cwd: worktree,
        encoding: "utf8",
        env: environment,
        timeout: checkContract.check_timeout_ms,
        killSignal: "SIGKILL",
        maxBuffer: 64 * 1024 * 1024,
      });
      const rerunExit = Number.isInteger(rerun.status) ? rerun.status : 1;
      const rerunSignal = rerun.signal ?? null;
      if (rerunExit !== proof.exitCode || rerunSignal !== proof.signal) {
        throw new Error(`final check proof exit does not reproduce for ${attemptId}: ${proof.path}`);
      }
    }
  } finally {
    try { git(["worktree", "remove", "--force", worktree], { stdio: "ignore" }); }
    catch { rmSync(worktree, { recursive: true, force: true }); }
  }
}

function validateCheckResults(checks, checksPath, target, manifest, reportPath, replay = false) {
  exactKeys(
    checks,
    ["version", "target", "candidate", "report", "attempts", "final_attempt"],
    "check results",
  );
  if (
    checks.version !== 1 || checks.target !== target.id || checks.candidate !== manifest.candidate ||
    checks.report !== reportPath || !Array.isArray(checks.attempts) || checks.attempts.length === 0 ||
    checksPath !== `${target.evidence_dir}/check-results.json`
  ) {
    throw new Error(`check results do not match target/candidate/evidence: ${checksPath}`);
  }
  const attempts = new Map();
  const validatedAttempts = new Map();
  const proofPaths = [];
  const manifestPaths = [];
  let previousNumber = 0;
  let previousAt = "";
  for (const attempt of checks.attempts) {
    exactKeys(
      attempt,
      ["id", "at", "candidate", "manifest", "manifest_sha256", "verdict", "proofs", "disposition"],
      "check attempt",
    );
    const number = typeof attempt.id === "string" && /^C([1-9]\d*)$/u.test(attempt.id)
      ? Number(attempt.id.slice(1)) : 0;
    if (
      number <= previousNumber || attempts.has(attempt.id) ||
      !isUtcTimestamp(attempt.at) || (previousAt && attempt.at < previousAt) ||
      !/^[0-9a-f]{64}$/u.test(attempt.candidate) || !/^[0-9a-f]{64}$/u.test(attempt.manifest_sha256) ||
      !["PASS", "WARN", "FAIL"].includes(attempt.verdict) ||
      !Array.isArray(attempt.proofs) || attempt.proofs.length === 0 ||
      !substantive(attempt.disposition, 5)
    ) {
      throw new Error(`invalid check attempt: ${attempt.id}`);
    }
    previousNumber = number;
    previousAt = attempt.at;
    const retained = validateAttemptManifest(attempt, target, `check attempt ${attempt.id}`, true);
    const attemptManifestPath = retained.manifestPath;
    const attemptManifest = retained.manifest;
    if (!manifestPaths.includes(attemptManifestPath)) manifestPaths.push(attemptManifestPath);
    const proofs = attempt.proofs.map((proof) =>
      validateCheckProof(proof, target, attemptManifest, retained.historicalTarget)
    );
    if (
      proofs.some((proof) => proofPaths.includes(proof.path)) ||
      proofs.some((proof, index) => index > 0 && proof.finishedAt < proofs[index - 1].finishedAt) ||
      attempt.at !== proofs.at(-1).finishedAt
    ) {
      throw new Error(`invalid ordered check proof set: ${attempt.id}`);
    }
    proofPaths.push(...proofs.map((proof) => proof.path));
    const hasFailure = proofs.some((proof) => proof.exitCode !== 0);
    const expectedCommands = retained.historicalTarget.check_commands.slice(0, proofs.length);
    const actualCommands = proofs.map((proof) => proof.command);
    const fullSuccess = proofs.length === retained.historicalTarget.check_commands.length && !hasFailure;
    const stoppedFailure = proofs.length <= retained.historicalTarget.check_commands.length && proofs.at(-1).exitCode !== 0 &&
      proofs.slice(0, -1).every((proof) => proof.exitCode === 0);
    if (
      JSON.stringify(actualCommands) !== JSON.stringify(expectedCommands) ||
      (attempt.verdict === "FAIL" ? !stoppedFailure : !fullSuccess)
    ) {
      throw new Error(`check verdict does not match command exits: ${attempt.id}`);
    }
    validatedAttempts.set(attempt.id, {
      checkContract: retained.historicalTarget,
      manifest: attemptManifest,
      proofs,
    });
    attempts.set(attempt.id, attempt);
  }
  const finalAttempt = attempts.get(checks.final_attempt);
  if (
    !finalAttempt || finalAttempt !== checks.attempts.at(-1) ||
    finalAttempt.verdict !== "PASS" || finalAttempt.candidate !== manifest.candidate
  ) {
    throw new Error("last check attempt must be the final PASS on the bundled candidate");
  }
  if (replay) {
    const selected = validatedAttempts.get(finalAttempt.id);
    replayFinalCheckAttempt(finalAttempt.id, selected.proofs, selected.manifest, selected.checkContract);
  }
  assertSafeRegularFile(reportPath, "audit report");
  const report = readFileSync(resolve(repositoryRoot, reportPath), "utf8");
  if (report.split(checksPath).length !== 2) {
    throw new Error("audit report must link structured check results exactly once");
  }
  for (const id of attempts.keys()) {
    const attempt = attempts.get(id);
    const rowPrefix = `| ${id} | ${attempt.at} | ${attempt.verdict} | \`${attempt.candidate}\` |`;
    if (report.split(rowPrefix).length !== 2) {
      throw new Error(`audit report must index check attempt exactly once: ${id}`);
    }
    for (const proof of attempt.proofs) {
      if (report.split(proof.path).length !== 2) {
        throw new Error(`audit report must link check proof exactly once: ${proof.path}`);
      }
    }
  }
  const checkFiles = listCheckFiles(target);
  const sortedProofPaths = [...proofPaths].sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)));
  if (JSON.stringify(checkFiles) !== JSON.stringify(sortedProofPaths)) {
    throw new Error("check attempt history does not exactly cover the retained checks tree");
  }
  return { proofPaths, manifestPaths };
}

function fileRecord(role, path) {
  assertSafeRegularFile(path, role);
  if (/(^|\/)(?:\.env(?:\..*)?|id_(?:rsa|dsa|ecdsa|ed25519)|credentials?|secrets?)(?:$|\.)/iu.test(path)) {
    throw new Error(`${role} uses a secret-bearing filename: ${path}`);
  }
  const bytes = readFileSync(resolve(repositoryRoot, path));
  if (/-----BEGIN (?:[A-Z0-9]+ )?PRIVATE KEY-----/u.test(bytes.toString("utf8"))) {
    throw new Error(`${role} contains private-key material: ${path}`);
  }
  return { role, path, bytes: bytes.length, sha256: sha256(bytes) };
}

function validateBundle(bundle, bundlePath) {
  exactKeys(bundle, ["version", "target", "candidate", "candidate_manifest", "files"], "bundle");
  if (bundle.version !== 1 || typeof bundle.target !== "string" || !bundle.target) {
    throw new Error(`unsupported close bundle: ${bundlePath}`);
  }
  if (!/^[0-9a-f]{64}$/u.test(bundle.candidate) || !Array.isArray(bundle.files)) {
    throw new Error(`invalid close bundle identity: ${bundlePath}`);
  }
  const targetDirectory = dirname(bundlePath);
  if (bundle.target !== targetDirectory.slice("Docs/Evidence/".length)) {
    throw new Error(`bundle target does not match its evidence directory: ${bundlePath}`);
  }
  const roles = new Map();
  const paths = new Set();
  for (const [index, record] of bundle.files.entries()) {
    exactKeys(record, ["role", "path", "bytes", "sha256"], `bundle file ${index}`);
    if (!["target_contract", "phase_authority", "close_record", "check_results", "history_manifest", "check_proof", "audit_results", "audit_response", "candidate_manifest", "audit_report", "artifact"].includes(record.role)) {
      throw new Error(`invalid bundle role: ${record.role}`);
    }
    if (!Number.isSafeInteger(record.bytes) || record.bytes < 0 || !/^[0-9a-f]{64}$/u.test(record.sha256)) {
      throw new Error(`invalid bundle file metadata: ${record.path}`);
    }
    const canonicalPath = canonicalRepositoryPath(record.path, `bundle file ${index}`);
    if (canonicalPath !== record.path || paths.has(record.path)) {
      throw new Error(`duplicate or non-canonical bundle path: ${record.path}`);
    }
    paths.add(record.path);
    roles.set(record.role, (roles.get(record.role) ?? 0) + 1);
    if (record.role !== "phase_authority" && !isInside(targetDirectory, record.path)) {
      throw new Error(`bundle evidence must stay under ${targetDirectory}: ${record.path}`);
    }
  }
  for (const role of ["target_contract", "close_record", "check_results", "audit_results", "candidate_manifest", "audit_report"]) {
    if (roles.get(role) !== 1) throw new Error(`bundle requires exactly one ${role}`);
  }
  if ((roles.get("phase_authority") ?? 0) > 1) throw new Error("bundle permits at most one phase_authority");
  const sorted = [...bundle.files].sort(compareRecords);
  if (JSON.stringify(sorted) !== JSON.stringify(bundle.files)) {
    throw new Error("bundle files are not canonically sorted");
  }
  const manifestRecord = bundle.files.find((record) => record.role === "candidate_manifest");
  if (manifestRecord.path !== bundle.candidate_manifest) {
    throw new Error("candidate_manifest does not match its bundle file record");
  }
}

function modeFor(path) {
  return statSync(resolve(repositoryRoot, path)).mode & 0o111 ? "100755" : "100644";
}

const fixedCommitEnvironment = {
  ...process.env,
  GIT_AUTHOR_NAME: "AIdioma Close",
  GIT_AUTHOR_EMAIL: "close@aidioma.invalid",
  GIT_AUTHOR_DATE: "2000-01-01T00:00:00Z",
  GIT_COMMITTER_NAME: "AIdioma Close",
  GIT_COMMITTER_EMAIL: "close@aidioma.invalid",
  GIT_COMMITTER_DATE: "2000-01-01T00:00:00Z",
};

function buildReceipt(bundlePath, bundle, manifest) {
  const bundleBytes = readFileSync(resolve(repositoryRoot, bundlePath));
  const bundleDigest = sha256(bundleBytes);
  const receiptRef = `refs/aidioma/close-receipts/${manifest.candidate}/${bundleDigest}`;
  const overlayPaths = [bundlePath, ...bundle.files.map((record) => record.path)];
  const temporaryDirectory = mkdtempSync(join(tmpdir(), "aidioma-close-receipt-"));
  const environment = { ...process.env, GIT_INDEX_FILE: join(temporaryDirectory, "index") };
  let receiptTree;
  try {
    git(["read-tree", manifest.commit], { env: environment });
    for (const path of overlayPaths) {
      assertSafeRegularFile(path, "receipt file");
      const object = git(["hash-object", "-w", "--stdin"], {
        env: environment,
        input: readFileSync(resolve(repositoryRoot, path)),
      }).trim();
      git(["update-index", "--add", "--cacheinfo", modeFor(path), object, path], {
        env: environment,
      });
    }
    receiptTree = git(["write-tree"], { env: environment }).trim();
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
  const receiptCommit = git(
    ["-c", "i18n.commitEncoding=UTF-8", "commit-tree", receiptTree, "-p", manifest.commit],
    {
      env: fixedCommitEnvironment,
      input: `AIdioma close receipt ${manifest.candidate} ${bundleDigest}\n`,
    },
  ).trim();
  return { bundleDigest, receiptRef, receiptCommit, receiptTree };
}

function retainRef(receipt) {
  const existing = tryGit(["rev-parse", "--verify", receipt.receiptRef]);
  if (existing && existing !== receipt.receiptCommit) {
    throw new Error(`receipt ref collision: ${receipt.receiptRef}`);
  }
  let created = false;
  if (!existing) {
    try {
      git(["update-ref", receipt.receiptRef, receipt.receiptCommit, ""]);
      created = true;
    } catch (error) {
      if (tryGit(["rev-parse", "--verify", receipt.receiptRef]) !== receipt.receiptCommit) throw error;
    }
  }
  if (git(["rev-parse", receipt.receiptRef]).trim() !== receipt.receiptCommit) {
    throw new Error(`receipt ref does not resolve to expected commit: ${receipt.receiptRef}`);
  }
  if (git(["rev-parse", `${receipt.receiptRef}^{tree}`]).trim() !== receipt.receiptTree) {
    throw new Error(`receipt ref does not resolve to expected tree: ${receipt.receiptRef}`);
  }
  return created;
}

function verifyRetainedRef(receipt) {
  const existing = tryGit(["rev-parse", "--verify", receipt.receiptRef]);
  if (!existing) throw new Error(`receipt ref is missing: ${receipt.receiptRef}`);
  if (existing !== receipt.receiptCommit) {
    throw new Error(`receipt ref does not resolve to expected commit: ${receipt.receiptRef}`);
  }
  if (git(["rev-parse", `${receipt.receiptRef}^{tree}`]).trim() !== receipt.receiptTree) {
    throw new Error(`receipt ref does not resolve to expected tree: ${receipt.receiptRef}`);
  }
}

function verifyFiles(bundle) {
  for (const record of bundle.files) {
    const actual = fileRecord(record.role, record.path);
    if (actual.bytes !== record.bytes || actual.sha256 !== record.sha256) {
      throw new Error(`bundle file changed: ${record.path}`);
    }
  }
}

function summary(bundlePath, bundle, receipt, verified) {
  return {
    version: 1,
    bundle: bundlePath,
    bundle_sha256: receipt.bundleDigest,
    candidate: bundle.candidate,
    receipt_ref: receipt.receiptRef,
    receipt_commit: receipt.receiptCommit,
    receipt_tree: receipt.receiptTree,
    verified,
  };
}

const [command, ...argumentsList] = process.argv.slice(2);
if (!["create", "verify"].includes(command)) {
  throw new Error("usage: close-bundle.mjs create ... | verify --bundle <path> --replay-checks yes");
}

const options = new Map();
const artifacts = [];
for (let index = 0; index < argumentsList.length; index += 1) {
  const option = argumentsList[index];
  const value = argumentsList[index + 1];
  if (!["--manifest", "--target", "--close-record", "--check-results", "--audit-results", "--report", "--output", "--artifact", "--bundle", "--replay-checks"].includes(option) || !value) {
    throw new Error(`invalid or incomplete option: ${option}`);
  }
  if (option === "--artifact") artifacts.push(value);
  else if (options.has(option)) throw new Error(`duplicate option: ${option}`);
  else options.set(option, value);
  index += 1;
}

if (command === "create") {
  for (const required of ["--manifest", "--target", "--close-record", "--check-results", "--audit-results", "--report", "--output"]) {
    if (!options.has(required)) throw new Error(`create requires ${required}`);
  }
  if (options.has("--bundle") || options.has("--replay-checks")) {
    throw new Error("create does not accept --bundle or --replay-checks");
  }
  const output = canonicalRepositoryPath(options.get("--output"), "output");
  const targetDirectory = assertSafeOutput(output);
  const manifestPath = canonicalRepositoryPath(options.get("--manifest"), "manifest");
  const targetPath = canonicalRepositoryPath(options.get("--target"), "target");
  const closeRecordPath = canonicalRepositoryPath(options.get("--close-record"), "close record");
  const checkResultsPath = canonicalRepositoryPath(options.get("--check-results"), "check results");
  const auditResultsPath = canonicalRepositoryPath(options.get("--audit-results"), "audit results");
  const reportPath = canonicalRepositoryPath(options.get("--report"), "report");
  const artifactPaths = artifacts.map((path) => canonicalRepositoryPath(path, "artifact"));
  for (const path of [manifestPath, targetPath, closeRecordPath, checkResultsPath, auditResultsPath, reportPath, ...artifactPaths]) {
    if (!isInside(targetDirectory, path)) {
      throw new Error(`bundle evidence must stay under ${targetDirectory}: ${path}`);
    }
  }
  const manifest = parseJsonFile(manifestPath, "candidate manifest");
  validateCandidateManifest(manifest, manifestPath);
  const target = parseJsonFile(targetPath, "target contract");
  if (validateTarget(target, targetPath, manifest) !== targetDirectory) throw new Error("target evidence directory mismatch");
  if (manifest.scopes.some((scope) => isInside(scope, output))) {
    throw new Error(`bundle output overlaps candidate scope: ${output}`);
  }
  if (target.kind === "phase") validatePhaseAuthority(target, manifest);
  const closeRecord = parseJsonFile(closeRecordPath, "close record");
  validateCloseRecord(closeRecord, closeRecordPath, target, manifest, reportPath, output);
  const checkResults = parseJsonFile(checkResultsPath, "check results");
  const { proofPaths: checkProofs, manifestPaths: checkManifests } = validateCheckResults(
    checkResults, checkResultsPath, target, manifest, reportPath, false,
  );
  const auditResults = parseJsonFile(auditResultsPath, "audit results");
  const { responsePaths: auditResponses, manifestPaths: auditManifests } = validateAuditResults(
    auditResults, auditResultsPath, target, manifest, closeRecord, reportPath,
  );
  const historyManifests = [...new Set([...checkManifests, ...auditManifests])];
  const files = [
    fileRecord("candidate_manifest", manifestPath),
    fileRecord("target_contract", targetPath),
    ...(target.kind === "phase" ? [fileRecord("phase_authority", target.authority)] : []),
    fileRecord("close_record", closeRecordPath),
    fileRecord("check_results", checkResultsPath),
    ...historyManifests
      .filter((path) => path !== manifestPath)
      .map((path) => fileRecord("history_manifest", path)),
    ...checkProofs.map((path) => fileRecord("check_proof", path)),
    fileRecord("audit_results", auditResultsPath),
    ...auditResponses.map((path) => fileRecord("audit_response", path)),
    fileRecord("audit_report", reportPath),
    ...artifactPaths.map((path) => fileRecord("artifact", path)),
  ].sort(compareRecords);
  const bundle = {
    version: 1,
    target: target.evidence_dir.slice("Docs/Evidence/".length),
    candidate: manifest.candidate,
    candidate_manifest: manifestPath,
    files,
  };
  validateBundle(bundle, output);
  const serialized = `${JSON.stringify(bundle, null, 2)}\n`;
  const absoluteOutput = resolve(repositoryRoot, output);
  const existing = lstatIfPresent(absoluteOutput);
  let createdOutput = false;
  if (existing) {
    if (!existing.isFile() || existing.isSymbolicLink() || readFileSync(absoluteOutput, "utf8") !== serialized) {
      throw new Error(`refusing to replace differing bundle: ${output}`);
    }
  } else {
    mkdirSync(dirname(absoluteOutput), { recursive: true });
    const temporaryOutput = join(dirname(absoluteOutput), `.${basename(output)}.${process.pid}.${randomUUID()}.tmp`);
    try {
      writeFileSync(temporaryOutput, serialized, { flag: "wx", mode: 0o644 });
      try {
        linkSync(temporaryOutput, absoluteOutput);
        createdOutput = true;
      } catch (error) {
        const competing = lstatIfPresent(absoluteOutput);
        if (
          error?.code !== "EEXIST" || !competing?.isFile() || competing.isSymbolicLink() ||
          readFileSync(absoluteOutput, "utf8") !== serialized
        ) {
          throw error;
        }
      }
    } finally {
      rmSync(temporaryOutput, { force: true });
    }
  }
  let receipt;
  let createdRef = false;
  try {
    verifyFiles(bundle);
    receipt = buildReceipt(output, bundle, manifest);
    createdRef = retainRef(receipt);
  } catch (error) {
    if (createdRef && receipt && tryGit(["rev-parse", "--verify", receipt.receiptRef]) === receipt.receiptCommit) {
      git(["update-ref", "-d", receipt.receiptRef, receipt.receiptCommit]);
    }
    if (createdOutput && readFileSync(absoluteOutput, "utf8") === serialized) unlinkSync(absoluteOutput);
    throw error;
  }
  process.stdout.write(`${JSON.stringify(summary(output, bundle, receipt, true), null, 2)}\n`);
} else {
  if (
    options.size !== 2 || !options.has("--bundle") ||
    options.get("--replay-checks") !== "yes" || artifacts.length > 0
  ) {
    throw new Error("verify requires --bundle <path> --replay-checks yes");
  }
  const bundlePath = canonicalRepositoryPath(options.get("--bundle"), "bundle");
  assertSafeOutput(bundlePath);
  const bundleBytes = readFileSync(resolve(repositoryRoot, bundlePath));
  const bundle = parseJsonFile(bundlePath, "bundle");
  validateBundle(bundle, bundlePath);
  const canonical = `${JSON.stringify(bundle, null, 2)}\n`;
  if (!bundleBytes.equals(Buffer.from(canonical))) throw new Error("bundle serialization is not canonical");
  verifyFiles(bundle);
  const manifest = parseJsonFile(bundle.candidate_manifest, "candidate manifest");
  validateCandidateManifest(manifest, bundle.candidate_manifest);
  if (manifest.candidate !== bundle.candidate) throw new Error("bundle candidate does not match manifest");
  const targetPath = bundle.files.find((record) => record.role === "target_contract").path;
  const target = parseJsonFile(targetPath, "target contract");
  if (validateTarget(target, targetPath, manifest) !== dirname(bundlePath)) throw new Error("target evidence directory mismatch");
  const phaseRecord = bundle.files.find((record) => record.role === "phase_authority");
  if ((target.kind === "phase") !== Boolean(phaseRecord) || (phaseRecord && phaseRecord.path !== target.authority)) {
    throw new Error("phase authority bundle role does not match target contract");
  }
  if (target.kind === "phase") validatePhaseAuthority(target, manifest);
  const reportPath = bundle.files.find((record) => record.role === "audit_report").path;
  const closeRecordPath = bundle.files.find((record) => record.role === "close_record").path;
  const closeRecord = parseJsonFile(closeRecordPath, "close record");
  validateCloseRecord(closeRecord, closeRecordPath, target, manifest, reportPath, bundlePath);
  const checkResultsPath = bundle.files.find((record) => record.role === "check_results").path;
  const checkResults = parseJsonFile(checkResultsPath, "check results");
  const { proofPaths: checkProofs, manifestPaths: checkManifests } = validateCheckResults(
    checkResults, checkResultsPath, target, manifest, reportPath, false,
  );
  const bundledCheckProofs = bundle.files
    .filter((record) => record.role === "check_proof")
    .map((record) => record.path)
    .sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)));
  const expectedCheckProofs = [...checkProofs]
    .sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)));
  if (JSON.stringify(bundledCheckProofs) !== JSON.stringify(expectedCheckProofs)) {
    throw new Error("bundled check proofs do not exactly match check results");
  }
  const bundledHistoryManifests = bundle.files
    .filter((record) => record.role === "history_manifest")
    .map((record) => record.path)
    .sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)));
  const auditResultsPath = bundle.files.find((record) => record.role === "audit_results").path;
  const auditResults = parseJsonFile(auditResultsPath, "audit results");
  const { responsePaths: auditResponses, manifestPaths: auditManifests } = validateAuditResults(
    auditResults, auditResultsPath, target, manifest, closeRecord, reportPath,
  );
  const expectedHistoryManifests = [...new Set([...checkManifests, ...auditManifests])]
    .filter((path) => path !== bundle.candidate_manifest)
    .sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)));
  if (JSON.stringify(bundledHistoryManifests) !== JSON.stringify(expectedHistoryManifests)) {
    throw new Error("bundled history manifests do not exactly match structured results");
  }
  const bundledResponses = bundle.files
    .filter((record) => record.role === "audit_response")
    .map((record) => record.path)
    .sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)));
  const expectedResponses = [...auditResponses]
    .sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)));
  if (JSON.stringify(bundledResponses) !== JSON.stringify(expectedResponses)) {
    throw new Error("bundled audit responses do not exactly match audit results");
  }
  if (manifest.scopes.some((scope) => isInside(scope, bundlePath))) {
    throw new Error(`bundle output overlaps candidate scope: ${bundlePath}`);
  }
  const receipt = buildReceipt(bundlePath, bundle, manifest);
  verifyRetainedRef(receipt);
  validateCheckResults(checkResults, checkResultsPath, target, manifest, reportPath, true);
  process.stdout.write(`${JSON.stringify(summary(bundlePath, bundle, receipt, true), null, 2)}\n`);
}
