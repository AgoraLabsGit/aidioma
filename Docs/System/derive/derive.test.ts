import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { derive } from "./derive.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

async function createDocsFixture(options: { malformedPhase?: boolean } = {}) {
  const repositoryRoot = await mkdtemp(path.join(tmpdir(), "aidioma-derive-"));
  temporaryDirectories.push(repositoryRoot);
  const docsRoot = path.join(repositoryRoot, "Docs");
  await mkdir(path.join(docsRoot, "Roadmap", "Phases"), { recursive: true });
  await mkdir(path.join(docsRoot, "Specs", "Features"), { recursive: true });
  await mkdir(path.join(docsRoot, "Specs", "Areas"), { recursive: true });
  await mkdir(path.join(docsRoot, "Research"), { recursive: true });
  await mkdir(path.join(docsRoot, "Handoffs"), { recursive: true });
  await mkdir(path.join(repositoryRoot, ".git"), { recursive: true });

  const goodPhase = `---
id: PHASE-001
title: Dev System Dashboard
type: implementation
proof_kind: visual
state: ready
order: 1
depends_on: []
from_backlog: null
owner: founder
outcome: "Dashboard projects live Docs."
proof: "Running /dashboard"
non_goals:
  - Production hosting
amends_specs: []
opened: 2026-08-05
closed: null
lessons: null
---

# PHASE-001

## Context

Test phase.
`;

  const badPhase = `---
id: PHASE-BAD
title: Broken
---
# Broken
`;

  await Promise.all([
    writeFile(
      path.join(docsRoot, "Roadmap", "Phases", "PHASE-001-dev-system-dashboard.md"),
      goodPhase,
    ),
    options.malformedPhase
      ? writeFile(path.join(docsRoot, "Roadmap", "Phases", "PHASE-BAD.md"), badPhase)
      : Promise.resolve(),
    writeFile(path.join(docsRoot, "FIXES.yaml"), "[]\n"),
    writeFile(path.join(docsRoot, "DECISIONS.md"), "# Decisions\n"),
    writeFile(path.join(docsRoot, "RELEASES.md"), "# Releases\n"),
    writeFile(path.join(docsRoot, "PRODUCT.md"), "# Product\n"),
    writeFile(path.join(docsRoot, "Handoffs", "HANDOFF.md"), "# Handoff\nNext: /run\n"),
    writeFile(path.join(docsRoot, "Roadmap", "Roadmap.md"), "# Roadmap\n"),
  ]);

  return repositoryRoot;
}

describe("derive", () => {
  it("projects ready phase and suggests /run", async () => {
    const repositoryRoot = await createDocsFixture();
    const index = await derive({
      repositoryRoot,
      writeIndex: false,
      now: () => new Date("2026-08-05T12:00:00.000Z"),
    });

    expect(index.phases).toHaveLength(1);
    expect(index.phases[0]?.id).toBe("PHASE-001");
    expect(index.next_command).toBe("/run");
    expect(index.handoff.body).toContain("Next: /run");
  });

  it("records parse_error without crashing", async () => {
    const repositoryRoot = await createDocsFixture({ malformedPhase: true });
    const index = await derive({
      repositoryRoot,
      writeIndex: false,
      now: () => new Date("2026-08-05T12:00:00.000Z"),
    });

    expect(index.phases.some((phase) => phase.id === "PHASE-001")).toBe(true);
    expect(index.issues.some((issue) => issue.kind === "parse_error")).toBe(true);
  });

  it("projects open and fixed FIX rows on Issues", async () => {
    const repositoryRoot = await createDocsFixture();
    await writeFile(
      path.join(repositoryRoot, "Docs", "FIXES.yaml"),
      `- id: FIX-001
  summary: "Open defect"
  status: open
  spec: null
  opened: 2026-08-05
- id: FIX-002
  summary: "Closed defect"
  status: fixed
  spec: null
  opened: 2026-08-04
`,
    );

    const index = await derive({
      repositoryRoot,
      writeIndex: false,
      now: () => new Date("2026-08-05T12:00:00.000Z"),
    });

    const openFix = index.issues.find((issue) => issue.ref === "FIX-001");
    const fixedFix = index.issues.find((issue) => issue.ref === "FIX-002");
    expect(openFix).toMatchObject({ kind: "fix", status: "open", severity: "high" });
    expect(fixedFix).toMatchObject({ kind: "fix", status: "fixed", severity: "low" });
    expect(index.fixes).toHaveLength(2);
  });
});
