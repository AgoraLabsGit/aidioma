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
type: build
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
    writeFile(path.join(docsRoot, "WORK.yaml"), "[]\n"),
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

  it("projects Work ledger rows separately from Signals", async () => {
    const repositoryRoot = await createDocsFixture();
    await writeFile(
      path.join(repositoryRoot, "Docs", "WORK.yaml"),
      `- id: W-001
  kind: fix
  summary: "Open defect"
  status: open
  feature: null
  area: null
  phase: null
  promoted_to: null
  blocked_by: null
  note: null
  opened: 2026-08-05
- id: W-002
  kind: task
  summary: "Done chore"
  status: done
  feature: null
  area: null
  phase: null
  promoted_to: null
  blocked_by: null
  note: null
  opened: 2026-08-04
`,
    );

    const index = await derive({
      repositoryRoot,
      writeIndex: false,
      now: () => new Date("2026-08-05T12:00:00.000Z"),
    });

    expect(index.work).toHaveLength(2);
    expect(index.work.find((row) => row.id === "W-001")).toMatchObject({
      kind: "fix",
      status: "open",
    });
    expect(index.issues.some((issue) => issue.ref === "W-001")).toBe(false);
  });
});

