#!/usr/bin/env node
/**
 * SPEC-F-PRAXIS-ACTIVE-FLUSH — deny Write|Delete|StrReplace when Docs-home
 * WORK.yaml has zero status:active rows. Always allow WORK.yaml + .work/activity/**.
 * Hooks themselves are not allowlisted; failClosed recovery is human-only.
 */
import { createRequire } from "node:module";
import {
  existsSync,
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import {
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";

const GATED_TOOLS = new Set(["Write", "Delete", "StrReplace"]);
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const HOOK_REPO_ROOT = resolve(SCRIPT_DIR, "../..");

function respond(payload) {
  process.stdout.write(JSON.stringify(payload));
}

function deny(agentMessage, userMessage = agentMessage) {
  respond({
    permission: "deny",
    agent_message: agentMessage,
    user_message: userMessage,
  });
}

function allow() {
  respond({ permission: "allow" });
}

function readStdin() {
  return new Promise((resolvePromise, reject) => {
    const chunks = [];
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => chunks.push(chunk));
    process.stdin.on("end", () => resolvePromise(chunks.join("")));
    process.stdin.on("error", reject);
  });
}

function resolveWorkspaceRoot(input) {
  const roots = Array.isArray(input.workspace_roots)
    ? input.workspace_roots.filter((r) => typeof r === "string" && r.length > 0)
    : [];
  if (roots.length > 0) return resolve(roots[0]);
  if (typeof input.cwd === "string" && input.cwd.length > 0) return resolve(input.cwd);
  return process.cwd();
}

function looksLikeDocsHome(dir) {
  return existsSync(join(dir, "Docs", "WORK.yaml"));
}

/**
 * Resolve Docs-home once per run:
 * 1) AIDIOMA_DOCS_HOME
 * 2) {workspace}/.worktrees/docs when present
 * 3) climb ancestors for .worktrees/docs (D-025 task/fix desks)
 * 4) workspace root when it already is Docs-home (WORK.yaml present)
 * 5) else workspace root (fail-closed ledger path still applies)
 */
function resolveDocsHome(workspaceRoot) {
  const envHome = process.env.AIDIOMA_DOCS_HOME;
  if (typeof envHome === "string" && envHome.trim().length > 0) {
    return resolve(envHome.trim());
  }

  const nested = join(workspaceRoot, ".worktrees", "docs");
  if (existsSync(nested)) return resolve(nested);

  let climb = resolve(workspaceRoot);
  for (let i = 0; i < 6; i += 1) {
    const parent = dirname(climb);
    if (parent === climb) break;
    const candidate = join(parent, ".worktrees", "docs");
    if (existsSync(candidate)) return resolve(candidate);
    climb = parent;
  }

  if (looksLikeDocsHome(workspaceRoot)) return resolve(workspaceRoot);
  return resolve(workspaceRoot);
}

function loadYamlParse(workspaceRoot) {
  const candidates = [workspaceRoot, HOOK_REPO_ROOT];
  // Worktree desks often lack node_modules; climb toward a root that has yaml installed.
  let climb = HOOK_REPO_ROOT;
  for (let i = 0; i < 4; i += 1) {
    const parent = dirname(climb);
    if (parent === climb) break;
    candidates.push(parent);
    climb = parent;
  }
  const seen = new Set();
  const errors = [];
  for (const root of candidates) {
    const key = resolve(root);
    if (seen.has(key)) continue;
    seen.add(key);
    const pkg = join(key, "package.json");
    if (!existsSync(pkg)) continue;
    try {
      return createRequire(pkg)("yaml").parse;
    } catch (err) {
      errors.push(`${key}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  throw new Error(
    errors.length > 0
      ? `yaml package not resolvable (${errors.join("; ")})`
      : "yaml package not resolvable from workspace or hook roots",
  );
}

function extractTargetPath(toolInput) {
  if (!toolInput || typeof toolInput !== "object") return null;
  for (const key of ["path", "file_path", "filePath"]) {
    const value = toolInput[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

function toAbsolutePath(targetPath, workspaceRoot) {
  return isAbsolute(targetPath)
    ? resolve(targetPath)
    : resolve(workspaceRoot, targetPath);
}

function safeRealpath(path) {
  try {
    return realpathSync(path);
  } catch {
    return resolve(path);
  }
}

function isPathInside(parentDir, candidatePath) {
  const parent = safeRealpath(parentDir);
  const candidate = safeRealpath(candidatePath);
  if (parent === candidate) return true;
  const rel = relative(parent, candidate);
  return rel !== "" && !rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel);
}

function isAlwaysAllowed(absTarget, docsHome) {
  const workYaml = resolve(docsHome, "Docs", "WORK.yaml");
  const activityDir = resolve(docsHome, ".work", "activity");
  if (safeRealpath(absTarget) === safeRealpath(workYaml)) return true;
  // Allow creates under activity even when the file does not exist yet.
  const activityPrefix = activityDir.endsWith(sep) ? activityDir : `${activityDir}${sep}`;
  const resolvedTarget = resolve(absTarget);
  if (resolvedTarget === activityDir || resolvedTarget.startsWith(activityPrefix)) {
    return true;
  }
  try {
    if (existsSync(activityDir) && statSync(activityDir).isDirectory()) {
      return isPathInside(activityDir, absTarget);
    }
  } catch {
    // fall through
  }
  return false;
}

function hasActiveWork(items) {
  if (!Array.isArray(items)) return false;
  return items.some(
    (item) =>
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      item.status === "active",
  );
}

async function main() {
  let input;
  try {
    const raw = await readStdin();
    input = raw.trim().length === 0 ? {} : JSON.parse(raw);
  } catch {
    deny(
      "Active-flush gate: invalid hook input JSON. Human recovery: fix or unload project hooks in Cursor IDE.",
    );
    return;
  }

  const toolName = typeof input.tool_name === "string" ? input.tool_name : "";
  if (!GATED_TOOLS.has(toolName)) {
    allow();
    return;
  }

  const workspaceRoot = resolveWorkspaceRoot(input);
  const docsHome = resolveDocsHome(workspaceRoot);
  const workPath = join(docsHome, "Docs", "WORK.yaml");

  const targetRaw = extractTargetPath(input.tool_input);
  if (!targetRaw) {
    deny(
      `Active-flush gate: ${toolName} missing path. Set Docs/WORK.yaml status:active + activity, then retry with a path.`,
    );
    return;
  }

  const absTarget = toAbsolutePath(targetRaw, workspaceRoot);
  if (isAlwaysAllowed(absTarget, docsHome)) {
    allow();
    return;
  }

  if (!existsSync(workPath)) {
    deny(
      `Active-flush gate: WORK.yaml missing at ${workPath}. Upsert a Work row with status: active and append .work/activity before file mutations. Human recovery if the gate is broken: edit/unload hooks in Cursor IDE.`,
    );
    return;
  }

  let parse;
  try {
    parse = loadYamlParse(workspaceRoot);
  } catch (err) {
    deny(
      `Active-flush gate: cannot load yaml parser (${err instanceof Error ? err.message : String(err)}). Human recovery: edit/unload project hooks in Cursor IDE.`,
    );
    return;
  }

  let items;
  try {
    items = parse(readFileSync(workPath, "utf8"));
  } catch (err) {
    deny(
      `Active-flush gate: WORK.yaml unreadable or YAML-parse failed at ${workPath} (${err instanceof Error ? err.message : String(err)}). Fix the ledger or set status: active via allowed paths, then retry.`,
    );
    return;
  }

  if (!Array.isArray(items)) {
    deny(
      `Active-flush gate: WORK.yaml at ${workPath} is not a list. Fix the ledger, then retry.`,
    );
    return;
  }

  if (hasActiveWork(items)) {
    allow();
    return;
  }

  deny(
    `Active-flush gate: Docs-home WORK.yaml has zero status:active rows (checked ${workPath}). Upsert a Work row with status: active and append a .work/activity event before retrying Write/Delete/StrReplace. Human recovery if hooks are broken: edit/unload project hooks in Cursor IDE (no agent self-allowlist).`,
  );
}

main().catch((err) => {
  deny(
    `Active-flush gate crashed: ${err instanceof Error ? err.message : String(err)}. Human recovery: edit/unload project hooks in Cursor IDE.`,
  );
  process.exitCode = 0;
});
