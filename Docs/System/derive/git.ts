import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type GitStatus = {
  branch: string;
  clean: boolean;
  ahead: number;
  behind: number;
};

async function runGit(repositoryRoot: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, {
    cwd: repositoryRoot,
    maxBuffer: 1024 * 1024,
  });
  return stdout.trim();
}

export async function readGitStatus(repositoryRoot: string): Promise<GitStatus> {
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
    return {
      branch: branch || "HEAD",
      clean: porcelain.length === 0,
      ahead,
      behind,
    };
  } catch {
    return { branch: "unknown", clean: false, ahead: 0, behind: 0 };
  }
}
