import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { derive, sortPhasesForRoadmap } from "./derive.js";
import { categorizeBranch,
  projectNameFromRemote, githubTreeUrl } from "./git.js";
import { nextCheckId, nextWorkId, type PhaseFrontmatter } from "./schema.js";
import { parseWork } from "./parser.js";
import { parseWorktreePorcelain, resolveGitWorktreesMetaDir } from "./worktrees.js";

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
    writeFile(
      path.join(docsRoot, "Handoffs", "HANDOFF.md"),
      "---\nref: PHASE-001\n---\n\n# Handoff\nNext: /run\n",
    ),
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
    expect(index.handoff.ref).toBe("PHASE-001");
  });

  it("treats handoff without valid ref as unscoped", async () => {
    const repositoryRoot = await createDocsFixture();
    await writeFile(
      path.join(repositoryRoot, "Docs", "Handoffs", "HANDOFF.md"),
      "# Handoff\nNo frontmatter\n",
    );
    const index = await derive({
      repositoryRoot,
      writeIndex: false,
      now: () => new Date("2026-08-05T12:00:00.000Z"),
    });
    expect(index.handoff.ref).toBeNull();
    expect(index.handoff.body).toContain("No frontmatter");
  });

  it("attaches phase.git from matching phase worktree not projection repo", async () => {
    const repositoryRoot = await createDocsFixture();
    const phaseDesk = path.join(repositoryRoot, ".worktrees", "phase-001");
    await mkdir(phaseDesk, { recursive: true });
    const index = await derive({
      repositoryRoot,
      writeIndex: false,
      overlayWorktrees: false,
      worktrees: [
        { path: repositoryRoot, head: "aaa", branch: "docs/ssot", isPrimary: true },
        {
          path: phaseDesk,
          head: "bbb",
          branch: "phase/001-dev-system-dashboard",
          isPrimary: false,
        },
      ],
      now: () => new Date("2026-08-05T12:00:00.000Z"),
    });
    expect(index.phases[0]?.id).toBe("PHASE-001");
    expect(index.phases[0]?.git?.branch).toBe("phase/001-dev-system-dashboard");
    expect(index.phases[0]?.git?.branch).not.toBe("docs/ssot");
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
- id: W-003
  kind: audit
  summary: "Scoped review"
  status: done
  feature: null
  area: null
  phase: null
  promoted_to: null
  blocked_by: null
  note: null
  open_questions: null
  done_summary: "ok"
  opened: 2026-08-05
`,
    );

    const index = await derive({
      repositoryRoot,
      writeIndex: false,
      now: () => new Date("2026-08-05T12:00:00.000Z"),
    });

    expect(index.work).toHaveLength(3);
    expect(index.work.find((row) => row.id === "W-001")).toMatchObject({
      kind: "fix",
      status: "open",
    });
    expect(index.work.find((row) => row.id === "W-003")).toMatchObject({
      kind: "audit",
      status: "done",
    });
    expect(index.issues.some((issue) => issue.kind === "parse_error")).toBe(false);
    expect(index.issues.some((issue) => issue.ref === "W-001")).toBe(false);
  });
});

describe("kind-prefixed work ids", () => {
  it("parses F-/T-/A- ids and allocates next per kind", () => {
    const rows = parseWork(`
- id: F-001
  kind: fix
  summary: "x"
  status: open
  feature: null
  area: null
  phase: null
  promoted_to: null
  blocked_by: null
  note: null
  open_questions: null
  done_summary: null
  opened: 2026-08-07
- id: W-099
  kind: task
  summary: "legacy"
  status: done
  feature: null
  area: null
  phase: null
  promoted_to: null
  blocked_by: null
  note: null
  open_questions: null
  done_summary: null
  opened: 2026-08-07
`);
    expect(rows.map((row) => row.id)).toEqual(["F-001", "W-099"]);
    expect(nextWorkId("fix", rows.map((row) => row.id))).toBe("F-002");
    expect(nextWorkId("task", rows.map((row) => row.id))).toBe("T-001");
    expect(nextWorkId("audit", [])).toBe("A-001");
    expect(nextWorkId("design", [])).toBe("S-001");
    expect(nextWorkId("design", ["S-001"])).toBe("S-002");
  });

  it("accepts UTC ISO opened timestamps (Age precision)", () => {
    const rows = parseWork(`
- id: F-010
  kind: fix
  summary: "iso opened"
  status: active
  feature: null
  area: null
  phase: null
  promoted_to: null
  blocked_by: null
  note: null
  open_questions: null
  done_summary: null
  opened: 2026-08-07T16:34:00Z
`);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.opened).toBe("2026-08-07T16:34:00Z");
  });

  it("accepts context_paths (D-024) and defaults missing to null", () => {
    const withPaths = parseWork(`
- id: T-020
  kind: task
  summary: "paths"
  status: done
  feature: null
  area: null
  phase: null
  promoted_to: null
  blocked_by: null
  note: null
  context_paths:
    - Docs/System/derive/schema.ts
    - Docs/System/dashboard/public/app.js
  open_questions: null
  done_summary: "ok"
  opened: 2026-08-07T18:00:00Z
`);
    expect(withPaths[0]?.context_paths).toEqual([
      "Docs/System/derive/schema.ts",
      "Docs/System/dashboard/public/app.js",
    ]);
    const without = parseWork(`
- id: T-021
  kind: task
  summary: "no paths"
  status: done
  feature: null
  area: null
  phase: null
  promoted_to: null
  blocked_by: null
  note: null
  open_questions: null
  done_summary: "ok"
  opened: 2026-08-07
`);
    expect(without[0]?.context_paths).toBeNull();
  });
});

describe("last_check", () => {
  it("projects latest activity check event", async () => {
    const repositoryRoot = await createDocsFixture();
    await mkdir(path.join(repositoryRoot, ".work", "activity"), { recursive: true });
    await writeFile(
      path.join(repositoryRoot, ".work", "activity", "2026-08.jsonl"),
      `${JSON.stringify({
        ts: "2026-08-07T16:00:00Z",
        type: "check",
        actor: "agent",
        cmd: "/check",
        phase: null,
        ref: "C-003",
        status: "complete",
        summary: "lanes: work — pass",
      })}\n`,
    );
    const index = await derive({
      repositoryRoot,
      writeIndex: false,
      overlayWorktrees: false,
      now: () => new Date("2026-08-07T17:00:00.000Z"),
    });
    expect(index.last_check).toEqual({
      status: "pass",
      ts: "2026-08-07T16:00:00Z",
      ref: "C-003",
    });
    expect(index.next_check_id).toBe("C-004");
  });
});

describe("check ids + worktree categories", () => {
  it("allocates next C-nnn from activity refs", () => {
    expect(nextCheckId([])).toBe("C-001");
    expect(nextCheckId(["C-001", "F-010", "C-003"])).toBe("C-004");
  });

  it("categorizes branches for the worktrees badge", () => {
    expect(categorizeBranch("docs/ssot")).toEqual({ category: "docs", phase_id: null });
    expect(categorizeBranch("main")).toEqual({ category: "main", phase_id: null });
    expect(categorizeBranch("phase/007-command-system-audit")).toEqual({
      category: "phase",
      phase_id: "PHASE-007",
    });
    expect(categorizeBranch("task/t-024-sessions")).toEqual({
      category: "task",
      phase_id: null,
    });
    expect(categorizeBranch("close/pr-27-journal")).toEqual({
      category: "task",
      phase_id: null,
    });
  });

  it("builds GitHub tree URLs from origin remotes", () => {
    expect(
      githubTreeUrl("git@github.com:AgoraLabsGit/aidioma.git", "phase/007-x"),
    ).toBe("https://github.com/AgoraLabsGit/aidioma/tree/phase/007-x");
    expect(githubTreeUrl("https://gitlab.com/x/y.git", "main")).toBeNull();
  });

  it("derives project_name from checkout folder (remote fallback)", () => {
    expect(projectNameFromRemote("https://github.com/AgoraLabsGit/aidioma.git", "/tmp/AIdioma")).toBe("AIdioma");
    expect(projectNameFromRemote(null, "/tmp/CoolProject")).toBe("CoolProject");
    expect(projectNameFromRemote("git@github.com:Org/MyApp.git", "/")).toBe("MyApp");
  });
});

describe("worktree overlay", () => {
  it("parses git worktree porcelain with primary first", () => {
    const parsed = parseWorktreePorcelain(`worktree /repo
HEAD abc
branch refs/heads/main

worktree /repo/.worktrees/phase-007
HEAD def
branch refs/heads/phase/007-command-system-audit
`);
    expect(parsed).toEqual([
      {
        path: "/repo",
        head: "abc",
        branch: "main",
        isPrimary: true,
      },
      {
        path: "/repo/.worktrees/phase-007",
        head: "def",
        branch: "phase/007-command-system-audit",
        isPrimary: false,
      },
    ]);
  });

  it("resolves git worktrees metadata dir from this checkout", async () => {
    const meta = await resolveGitWorktreesMetaDir(process.cwd());
    expect(meta).toMatch(/[/\\]worktrees$/);
  });

  it("overlays active phase from a linked worktree onto primary", async () => {
    const primary = await createDocsFixture();
    const overlay = await mkdtemp(path.join(tmpdir(), "aidioma-overlay-"));
    temporaryDirectories.push(overlay);

    await mkdir(path.join(overlay, "Docs", "Roadmap", "Phases"), { recursive: true });
    await mkdir(path.join(overlay, "Docs", "Research"), { recursive: true });
    await mkdir(path.join(overlay, "Docs", "Handoffs"), { recursive: true });
    await mkdir(path.join(overlay, ".work", "activity"), { recursive: true });

    await writeFile(
      path.join(overlay, "Docs", "Roadmap", "Phases", "PHASE-001-dev-system-dashboard.md"),
      `---
id: PHASE-001
title: Dev System Dashboard
type: build
proof_kind: visual
state: active
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

Live in worktree.

## Proof

- [ ] Overlay proof item
`,
    );
    await writeFile(
      path.join(overlay, "Docs", "Handoffs", "HANDOFF.md"),
      "---\nref: PHASE-001\n---\n\n# Handoff\nActive in overlay\n",
    );
    await writeFile(
      path.join(overlay, "Docs", "Research", "R-003.md"),
      `---
id: R-003
question: "overlay research"
verdict: "yes"
status: fresh
informed: []
affects: []
phase: PHASE-001
date: 2026-08-07
---

# Overlay research
`,
    );
    await writeFile(
      path.join(overlay, "Docs", "WORK.yaml"),
      `- id: T-001
  kind: task
  summary: "From overlay"
  status: open
  feature: null
  area: null
  phase: PHASE-001
  promoted_to: null
  blocked_by: null
  note: null
  open_questions: null
  done_summary: null
  opened: 2026-08-07
`,
    );
    await writeFile(
      path.join(overlay, ".work", "activity", "2026-08.jsonl"),
      `${JSON.stringify({
        ts: "2026-08-07T15:00:00Z",
        type: "build",
        actor: "agent",
        cmd: "/run",
        phase: "PHASE-001",
        ref: "PHASE-001",
        status: "complete",
        summary: "overlay event",
      })}\n`,
    );

    const index = await derive({
      repositoryRoot: primary,
      writeIndex: false,
      overlayWorktrees: true,
      worktrees: [
        { path: primary, head: null, branch: "main", isPrimary: true },
        {
          path: overlay,
          head: null,
          branch: "phase/001",
          isPrimary: false,
        },
      ],
      now: () => new Date("2026-08-07T16:00:00.000Z"),
    });

    expect(index.phases[0]).toMatchObject({ id: "PHASE-001", state: "active" });
    expect(index.handoff).toMatchObject({
      ref: "PHASE-001",
      body: expect.stringContaining("Active in overlay"),
    });
    expect(index.research.some((item) => item.id === "R-003")).toBe(true);
    expect(index.work.some((row) => row.id === "T-001")).toBe(true);
    expect(index.activity.current_month.some((event) => event.summary === "overlay event")).toBe(
      true,
    );
    expect(index.projection_roots).toMatchObject({
      primary: await realpath(primary),
      docs_home: null,
      overlay: await realpath(overlay),
      overlay_phase: "PHASE-001",
      overlay_branch: "phase/001",
    });
    expect(index.overlay_doc_paths).toEqual(
      expect.arrayContaining([
        "Handoffs/HANDOFF.md",
        "Roadmap/Phases/PHASE-001-dev-system-dashboard.md",
        "Research/R-003.md",
        "WORK.yaml",
      ]),
    );
    expect(index.active_proof_checklist.some((item) => item.includes("Overlay proof"))).toBe(true);
    expect(index.next_command).toBe("/run");
  });
});

describe("sortPhasesForRoadmap", () => {
  const base = {
    title: "t",
    type: "build" as const,
    proof_kind: "terminal" as const,
    state: "proposed" as const,
    from_backlog: null,
    owner: "founder",
    outcome: "o",
    proof: "p",
    non_goals: [] as string[],
    amends_specs: [] as string[],
    context_paths: null,
    feature: null,
    area: null,
    opened: "2026-08-07",
    closed: null,
    lessons: null,
  };

  it("orders by depends_on depth before order, so inserts need not renumber", () => {
    const phases: PhaseFrontmatter[] = [
      { ...base, id: "PHASE-002", order: 4, depends_on: ["PHASE-001"] },
      { ...base, id: "PHASE-007", order: 99, depends_on: ["PHASE-001"] },
      { ...base, id: "PHASE-001", order: 1, depends_on: [] },
      { ...base, id: "PHASE-008", order: 0, depends_on: ["PHASE-007"] },
    ];
    expect(sortPhasesForRoadmap(phases).map((phase) => phase.id)).toEqual([
      "PHASE-001",
      "PHASE-002",
      "PHASE-007",
      "PHASE-008",
    ]);
  });
});

