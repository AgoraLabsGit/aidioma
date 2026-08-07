import { execFile } from "node:child_process";
import { readdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { parseFrontmatter } from "./parser.js";
import { phaseSchema, type PhaseFrontmatter } from "./schema.js";

const execFileAsync = promisify(execFile);

export type GitWorktree = {
  path: string;
  head: string | null;
  branch: string | null;
  isPrimary: boolean;
};

export type ActiveOverlay = {
  root: string;
  branch: string | null;
  phaseId: string;
};

async function runGit(cwd: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, {
    cwd,
    maxBuffer: 1024 * 1024,
  });
  return stdout;
}

/** Parse `git worktree list --porcelain` into ordered worktrees (primary first). */
export function parseWorktreePorcelain(stdout: string): GitWorktree[] {
  const blocks = stdout.split(/\n\n/u).map((block) => block.trim()).filter(Boolean);
  const worktrees: GitWorktree[] = [];
  for (const [index, block] of blocks.entries()) {
    const lines = block.split("\n");
    let worktreePath: string | null = null;
    let head: string | null = null;
    let branch: string | null = null;
    for (const line of lines) {
      if (line.startsWith("worktree ")) worktreePath = line.slice("worktree ".length);
      else if (line.startsWith("HEAD ")) head = line.slice("HEAD ".length);
      else if (line.startsWith("branch ")) {
        const ref = line.slice("branch ".length);
        branch = ref.startsWith("refs/heads/") ? ref.slice("refs/heads/".length) : ref;
      } else if (line === "detached") {
        branch = "DETACHED";
      }
    }
    if (!worktreePath) continue;
    worktrees.push({
      path: worktreePath,
      head,
      branch,
      isPrimary: index === 0,
    });
  }
  return worktrees;
}

export async function listGitWorktrees(fromRoot: string): Promise<GitWorktree[]> {
  try {
    const stdout = await runGit(fromRoot, ["worktree", "list", "--porcelain"]);
    const parsed = parseWorktreePorcelain(stdout);
    const resolved: GitWorktree[] = [];
    for (const item of parsed) {
      try {
        resolved.push({ ...item, path: await realpath(item.path) });
      } catch {
        // Skip vanished worktrees.
      }
    }
    return resolved;
  } catch {
    try {
      const root = await realpath(fromRoot);
      return [{ path: root, head: null, branch: null, isPrimary: true }];
    } catch {
      return [];
    }
  }
}

export async function resolvePrimaryWorktreeRoot(fromRoot: string): Promise<string> {
  const worktrees = await listGitWorktrees(fromRoot);
  const primary = worktrees.find((item) => item.isPrimary) ?? worktrees[0];
  if (primary) return primary.path;
  return realpath(fromRoot);
}

/**
 * D-020 Docs home: `.worktrees/docs` (branch `docs/ssot`) when present.
 * Env `AIDIOMA_DOCS_HOME` overrides. Returns null when absent (D-018 overlay interim).
 */
export async function resolveDocsHomeRoot(fromRoot: string): Promise<string | null> {
  const envHome = process.env.AIDIOMA_DOCS_HOME?.trim();
  if (envHome) {
    try {
      return await realpath(envHome);
    } catch {
      return null;
    }
  }
  const primary = await resolvePrimaryWorktreeRoot(fromRoot);
  const candidate = path.join(primary, ".worktrees", "docs");
  try {
    const resolved = await realpath(candidate);
    // Must look like a checkout (has Docs/).
    await readFile(path.join(resolved, "Docs", "START.md"), "utf8");
    return resolved;
  } catch {
    return null;
  }
}

async function listPhaseFiles(docsRoot: string): Promise<string[]> {
  const directory = path.join(docsRoot, "Roadmap", "Phases");
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => path.join(directory, entry.name));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

/** Return active phase ids found under a worktree's Docs/Roadmap/Phases. */
export async function findActivePhaseIds(worktreeRoot: string): Promise<string[]> {
  const docsRoot = path.join(worktreeRoot, "Docs");
  const files = await listPhaseFiles(docsRoot);
  const active: string[] = [];
  for (const filePath of files) {
    try {
      const source = await readFile(filePath, "utf8");
      const relative = path.relative(docsRoot, filePath).split(path.sep).join("/");
      const { data } = parseFrontmatter(
        source,
        relative,
        phaseSchema as import("zod").ZodType<PhaseFrontmatter>,
      );
      if (data.state === "active" || data.state === "blocked") active.push(data.id);
    } catch {
      // Ignore unreadable/malformed phases when probing overlays.
    }
  }
  return active;
}

/**
 * Pick the single non-primary worktree that owns an active/blocked phase.
 * Returns null when none or when more than one linked worktree claims active work.
 */
export async function discoverActiveOverlay(
  primaryRoot: string,
  worktrees?: GitWorktree[],
): Promise<ActiveOverlay | null> {
  const list = worktrees ?? (await listGitWorktrees(primaryRoot));
  const primary = await realpath(primaryRoot);
  const candidates: ActiveOverlay[] = [];

  for (const item of list) {
    let root: string;
    try {
      root = await realpath(item.path);
    } catch {
      continue;
    }
    if (root === primary) continue;
    const phaseIds = await findActivePhaseIds(root);
    if (phaseIds.length === 0) continue;
    candidates.push({
      root,
      branch: item.branch,
      phaseId: phaseIds[0]!,
    });
  }

  if (candidates.length === 1) return candidates[0]!;
  return null;
}
