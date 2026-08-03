import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const deployablePrefixes = ["apps/web/", "packages/lesson-schema/"];
const deployableRootFiles = new Set(["package.json", "package-lock.json"]);

export function deploymentDecisionForPaths(changedPaths) {
  const build = changedPaths.some((changedPath) => {
    const normalizedPath = changedPath.replaceAll("\\", "/").replace(/^\.\//u, "");
    return (
      deployableRootFiles.has(normalizedPath) ||
      deployablePrefixes.some((prefix) => normalizedPath.startsWith(prefix))
    );
  });

  // Vercel's Ignored Build Step contract is intentionally inverted:
  // exit 0 skips the deployment, while exit 1 continues the build.
  return { build, exitCode: build ? 1 : 0 };
}

export function deploymentDecisionForCommit({ changedPaths, parentCount }) {
  if (parentCount !== 2) {
    return { build: true, exitCode: 1 };
  }

  return deploymentDecisionForPaths(changedPaths);
}

function readCommitDiff() {
  const revision = execFileSync("git", ["rev-list", "--parents", "-n", "1", "HEAD"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
  const parentCount = revision ? revision.split(/\s+/u).length - 1 : 0;
  const changedPaths = execFileSync("git", ["diff", "--name-only", "HEAD^1", "HEAD"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })
    .split("\n")
    .map((changedPath) => changedPath.trim())
    .filter(Boolean);

  return { changedPaths, parentCount };
}

export function deploymentDecisionForGitDiff(readDiff = readCommitDiff) {
  try {
    return deploymentDecisionForCommit(readDiff());
  } catch {
    // Missing history or an unexpected Git failure must fail open to a build.
    return { build: true, exitCode: 1 };
  }
}

function run() {
  const decision = deploymentDecisionForGitDiff();

  console.log(
    decision.build
      ? "Deployable application inputs changed; continuing Vercel build."
      : "No deployable application inputs changed; skipping Vercel build.",
  );
  process.exitCode = decision.exitCode;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run();
}
