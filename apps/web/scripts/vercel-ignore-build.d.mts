export function deploymentDecisionForPaths(changedPaths: readonly string[]): {
  build: boolean;
  exitCode: 0 | 1;
};

export function deploymentDecisionForCommit(commit: {
  changedPaths: readonly string[];
  parentCount: number;
}): {
  build: boolean;
  exitCode: 0 | 1;
};

export function deploymentDecisionForGitDiff(
  readDiff?: () => { changedPaths: readonly string[]; parentCount: number },
): {
  build: boolean;
  exitCode: 0 | 1;
};
