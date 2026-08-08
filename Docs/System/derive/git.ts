import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

import { listGitWorktrees, type GitWorktree } from "./worktrees.js";

const execFileAsync = promisify(execFile);

export type WorktreeCategory = "docs" | "main" | "phase" | "task" | "other";

export type RepoWorktree = {
  path: string;
  branch: string | null;
  head: string | null;
  short_head: string | null;
  is_primary: boolean;
  is_docs_home: boolean;
  category: WorktreeCategory;
  phase_id: string | null;
  clean: boolean;
  ahead: number;
  behind: number;
  web_url: string | null;
};

export type GitStatus = {
  /** Display name from origin repo (fallback: checkout folder name). */
  project_name: string;
  branch: string;
  clean: boolean;
  ahead: number;
  behind: number;
  /** Open git worktrees, categorized for the dashboard badge. */
  worktrees: RepoWorktree[];
  worktree_count: number;
  /** @deprecated Use worktrees — kept for stale dashboard processes. */
  sessions: RepoWorktree[];
  session_count: number;
};

async function runGit(repositoryRoot: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, {
    cwd: repositoryRoot,
    maxBuffer: 1024 * 1024,
  });
  return stdout.trim();
}

/** Map branch name → worktree category (repo conventions). */
export function categorizeBranch(branch: string | null): {
  category: WorktreeCategory;
  phase_id: string | null;
} {
  if (!branch || branch === "DETACHED") return { category: "other", phase_id: null };
  if (branch === "docs/ssot" || branch.startsWith("docs/")) {
    return { category: "docs", phase_id: null };
  }
  if (branch === "main" || branch === "master") {
    return { category: "main", phase_id: null };
  }
  const phase = /^(?:phase\/)?(?:PHASE-)?0*([0-9]{3})\b/i.exec(branch)
    ?? /^phase\/0*([0-9]{3})\b/i.exec(branch);
  if (phase || branch.startsWith("phase/")) {
    const num = phase?.[1] ?? (/phase\/(\d+)/i.exec(branch)?.[1] ?? null);
    const phase_id = num ? `PHASE-${String(num).padStart(3, "0")}` : null;
    return { category: "phase", phase_id };
  }
  if (
    /^(task|fix|close|plan)\//i.test(branch)
    || /^(T|F)-\d{3}/i.test(branch)
  ) {
    return { category: "task", phase_id: null };
  }
  return { category: "other", phase_id: null };
}

/** Normalize common git remote URL shapes to a path-like string. */
function normalizeRemoteUrl(remoteUrl: string): string {
  let normalized = remoteUrl.trim();
  if (normalized.startsWith("git@github.com:")) {
    normalized = `https://github.com/${normalized.slice("git@github.com:".length)}`;
  } else if (normalized.startsWith("ssh://git@github.com/")) {
    normalized = `https://github.com/${normalized.slice("ssh://git@github.com/".length)}`;
  }
  return normalized.replace(/\.git$/u, "");
}

/** github.com HTTPS tree URL when remote is GitHub; else null. */
export function githubTreeUrl(remoteUrl: string | null, branch: string | null): string | null {
  if (!remoteUrl || !branch || branch === "DETACHED") return null;
  const normalized = normalizeRemoteUrl(remoteUrl);
  const match = /^https:\/\/github\.com\/([^/]+\/[^/]+)/u.exec(normalized);
  if (!match) return null;
  return `https://github.com/${match[1]}/tree/${encodeURIComponent(branch).replace(/%2F/g, "/")}`;
}

/**
 * Project display name for the dashboard brand.
 * Prefer the checkout folder name (what the operator sees); fall back to origin repo slug.
 */
export function projectNameFromRemote(
  remoteUrl: string | null,
  repositoryRoot: string,
): string {
  const fromDir = path.basename(path.resolve(repositoryRoot));
  if (fromDir && fromDir !== "." && fromDir !== ".." && fromDir !== path.sep) {
    return fromDir;
  }
  if (remoteUrl) {
    const normalized = normalizeRemoteUrl(remoteUrl);
    const github = /^https:\/\/github\.com\/[^/]+\/([^/]+)/u.exec(normalized);
    if (github?.[1]) return github[1];
    const slash = normalized.replace(/\/+$/u, "").split("/").filter(Boolean);
    const last = slash[slash.length - 1];
    if (last) return last;
  }
  return "Project";
}

async function readWorktreeStatus(worktreePath: string): Promise<{
  clean: boolean;
  ahead: number;
  behind: number;
  head: string | null;
  short_head: string | null;
  remote_url: string | null;
}> {
  try {
    const porcelain = await runGit(worktreePath, ["status", "--porcelain"]);
    let ahead = 0;
    let behind = 0;
    try {
      const counts = await runGit(worktreePath, [
        "rev-list",
        "--left-right",
        "--count",
        "@{upstream}...HEAD",
      ]);
      const [behindText, aheadText] = counts.split(/\s+/u);
      behind = Number(behindText ?? 0) || 0;
      ahead = Number(aheadText ?? 0) || 0;
    } catch {
      // No upstream.
    }
    let head: string | null = null;
    let short_head: string | null = null;
    try {
      head = await runGit(worktreePath, ["rev-parse", "HEAD"]);
      short_head = head.slice(0, 7);
    } catch {
      // ignore
    }
    let remote_url: string | null = null;
    try {
      remote_url = await runGit(worktreePath, ["remote", "get-url", "origin"]);
    } catch {
      remote_url = null;
    }
    return {
      clean: porcelain.length === 0,
      ahead,
      behind,
      head,
      short_head,
      remote_url,
    };
  } catch {
    return {
      clean: false,
      ahead: 0,
      behind: 0,
      head: null,
      short_head: null,
      remote_url: null,
    };
  }
}

export async function projectRepoWorktrees(
  repositoryRoot: string,
  listed?: GitWorktree[],
): Promise<RepoWorktree[]> {
  const trees = listed ?? (await listGitWorktrees(repositoryRoot));
  const docsHomeSuffix = `${path.sep}.worktrees${path.sep}docs`;
  const projected: RepoWorktree[] = [];
  for (const tree of trees) {
    const status = await readWorktreeStatus(tree.path);
    const { category: byBranch, phase_id } = categorizeBranch(tree.branch);
    const is_docs_home =
      tree.path.endsWith(docsHomeSuffix)
      || tree.path.endsWith(`${path.sep}.worktrees${path.sep}docs`)
      || tree.branch === "docs/ssot";
    const category: WorktreeCategory = is_docs_home
      ? "docs"
      : tree.isPrimary && (tree.branch === "main" || tree.branch === "master")
        ? "main"
        : byBranch === "other" && tree.isPrimary
          ? "main"
          : byBranch;
    projected.push({
      path: tree.path,
      branch: tree.branch,
      head: status.head ?? tree.head,
      short_head: status.short_head ?? (tree.head ? tree.head.slice(0, 7) : null),
      is_primary: tree.isPrimary,
      is_docs_home,
      category,
      phase_id,
      clean: status.clean,
      ahead: status.ahead,
      behind: status.behind,
      web_url: githubTreeUrl(status.remote_url, tree.branch),
    });
  }
  const rank: Record<WorktreeCategory, number> = {
    docs: 0,
    main: 1,
    phase: 2,
    task: 3,
    other: 4,
  };
  projected.sort(
    (left, right) =>
      rank[left.category] - rank[right.category]
      || String(left.branch ?? "").localeCompare(String(right.branch ?? "")),
  );
  return projected;
}

export async function readGitStatus(
  repositoryRoot: string,
  options?: { worktrees?: GitWorktree[] },
): Promise<GitStatus> {
  try {
    const branch = await runGit(repositoryRoot, ["rev-parse", "--abbrev-ref", "HEAD"]);
    const porcelain = await runGit(repositoryRoot, ["status", "--porcelain"]);
    let ahead = 0;
    let behind = 0;
    try {
      const counts = await runGit(repositoryRoot, [
        "rev-list",
        "--left-right",
        "--count",
        "@{upstream}...HEAD",
      ]);
      const [behindText, aheadText] = counts.split(/\s+/u);
      behind = Number(behindText ?? 0) || 0;
      ahead = Number(aheadText ?? 0) || 0;
    } catch {
      // No upstream — leave ahead/behind at 0.
    }
    let remoteUrl: string | null = null;
    try {
      remoteUrl = await runGit(repositoryRoot, ["remote", "get-url", "origin"]);
    } catch {
      remoteUrl = null;
    }
    const listed = options?.worktrees ?? (await listGitWorktrees(repositoryRoot));
    const primaryPath =
      listed.find((item) => item.isPrimary)?.path
      ?? listed[0]?.path
      ?? repositoryRoot;
    const projected = await projectRepoWorktrees(repositoryRoot, listed);
    return {
      project_name: projectNameFromRemote(remoteUrl, primaryPath),
      branch: branch || "HEAD",
      clean: porcelain.length === 0,
      ahead,
      behind,
      worktrees: projected,
      worktree_count: projected.length,
      sessions: projected,
      session_count: projected.length,
    };
  } catch {
    // Non-git fixtures still accept injected worktrees (tests / edge).
    let projected: RepoWorktree[] = [];
    if (options?.worktrees?.length) {
      try {
        projected = await projectRepoWorktrees(repositoryRoot, options.worktrees);
      } catch {
        projected = [];
      }
    }
    return {
      project_name: projectNameFromRemote(null, repositoryRoot),
      branch: "unknown",
      clean: false,
      ahead: 0,
      behind: 0,
      worktrees: projected,
      worktree_count: projected.length,
      sessions: projected,
      session_count: projected.length,
    };
  }
}
