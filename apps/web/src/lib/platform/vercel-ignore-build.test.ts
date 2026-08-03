import { describe, expect, it } from "vitest";

import {
  deploymentDecisionForCommit,
  deploymentDecisionForGitDiff,
  deploymentDecisionForPaths,
} from "../../../scripts/vercel-ignore-build.mjs";

describe("Vercel ignored-build decision", () => {
  it("skips documentation-only and workflow-only commits", () => {
    expect(
      deploymentDecisionForPaths([
        "Docs/STATE.md",
        "Docs/Handoffs/020-audit.md",
        ".github/workflows/content.yml",
      ]),
    ).toEqual({ build: false, exitCode: 0 });
  });

  it.each([
    "apps/web/src/app/page.tsx",
    "packages/lesson-schema/src/index.ts",
    "package.json",
    "package-lock.json",
  ])("builds when %s changes", (changedPath) => {
    expect(deploymentDecisionForPaths([changedPath])).toEqual({
      build: true,
      exitCode: 1,
    });
  });

  it("fails open to a build when the Git diff cannot be inspected", () => {
    expect(
      deploymentDecisionForGitDiff(() => {
        throw new Error("missing parent history");
      }),
    ).toEqual({ build: true, exitCode: 1 });
  });

  it("builds ambiguous single-parent commits instead of skipping their final diff", () => {
    expect(
      deploymentDecisionForCommit({
        changedPaths: ["Docs/STATE.md"],
        parentCount: 1,
      }),
    ).toEqual({ build: true, exitCode: 1 });
  });

  it("allows a documentation-only two-parent merge to skip", () => {
    expect(
      deploymentDecisionForCommit({
        changedPaths: ["Docs/STATE.md"],
        parentCount: 2,
      }),
    ).toEqual({ build: false, exitCode: 0 });
  });
});
