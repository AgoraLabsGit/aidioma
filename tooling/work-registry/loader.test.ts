import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { loadRegistry } from "./loader.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

async function createRepositoryFixture(
  options: { docsRootName?: "Docs" | "Docs.next"; missingDependency?: boolean } = {},
) {
  const repositoryRoot = await mkdtemp(path.join(tmpdir(), "aidioma-registry-"));
  temporaryDirectories.push(repositoryRoot);
  const docsRoot = path.join(repositoryRoot, options.docsRootName ?? "Docs");
  await mkdir(path.join(docsRoot, "Specs"), { recursive: true });
  await Promise.all([
    writeFile(path.join(docsRoot, "INDEX.md"), "# Index\n"),
    writeFile(path.join(docsRoot, "HANDOFF.md"), "# Handoff\n"),
    writeFile(
      path.join(docsRoot, "PRODUCT.md"),
      `---
id: PRODUCT-001
title: Product principles
area: product
status: draft
implementation: none
founder_review: required
updated: 2026-08-03
---
# Product
`,
    ),
  ]);
  await writeFile(
    path.join(docsRoot, "WORK.yaml"),
    `version: 1
work:
  - id: PRACTICE-SERVING-001
    title: Adaptive practice serving
    area: practice-serving
    status: planned
    kind: feature
    founder_approval: approved
    summary: Design reinforced practice scheduling.
    spec: Specs/practice-serving.md
    dependencies: ${options.missingDependency ? "[MISSING-WORK-001]" : "[]"}
    blocked_by: []
    reusable_by: [lessons]
    next_slice: Implement the first approved slice.
    evidence: []
`,
  );
  await writeFile(
    path.join(docsRoot, "FIXES.yaml"),
    `version: 1
fixes:
  - id: EVALUATION-FIX-001
    title: Restore local grading
    area: evaluation
    status: open
    summary: Non-exact answers cannot be graded locally.
    related_work: PRACTICE-SERVING-001
    evidence: []
`,
  );
  await writeFile(
    path.join(docsRoot, "Specs", "practice-serving.md"),
    `---
id: PRACTICE-SERVING-001
title: Adaptive practice serving
area: practice-serving
status: planned
implementation: none
founder_review: approved
updated: 2026-08-03
---
# Adaptive practice serving
`,
  );
  return { docsRoot, repositoryRoot };
}

describe("loadRegistry", () => {
  it("loads canonical files into stable unified rows", async () => {
    const fixture = await createRepositoryFixture();
    const snapshot = await loadRegistry({
      repositoryRoot: fixture.repositoryRoot,
      now: () => new Date("2026-08-03T12:00:00.000Z"),
    });

    expect(snapshot.generatedAt).toBe("2026-08-03T12:00:00.000Z");
    expect(snapshot.sourceRoot).toBe("Docs");
    expect(snapshot.valid).toBe(true);
    expect(snapshot.counts).toEqual({
      work: 1,
      fixes: 1,
      specs: 1,
      migrations: 0,
      pendingMigrationDecisions: 0,
      errors: 0,
      warnings: 0,
    });
    expect(snapshot.rows.map((row) => [row.entity, row.kind, row.id])).toEqual([
      ["fix", "bug", "EVALUATION-FIX-001"],
      ["spec", "spec", "PRACTICE-SERVING-001"],
      ["work", "feature", "PRACTICE-SERVING-001"],
    ]);
    expect(snapshot.rows.find((row) => row.entity === "spec")?.relatedWork).toBe(
      "PRACTICE-SERVING-001",
    );
  });

  it("reports broken cross-references without hiding valid rows", async () => {
    const fixture = await createRepositoryFixture({ missingDependency: true });
    const snapshot = await loadRegistry({ repositoryRoot: fixture.repositoryRoot });

    expect(snapshot.rows).toHaveLength(3);
    expect(snapshot.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing_dependency",
          severity: "error",
        }),
      ]),
    );
  });

  it("rejects a configurable Docs root outside the repository", async () => {
    const fixture = await createRepositoryFixture();
    const outsideRoot = await mkdtemp(path.join(tmpdir(), "aidioma-outside-"));
    temporaryDirectories.push(outsideRoot);
    await mkdir(path.join(outsideRoot, "Specs"));
    await writeFile(path.join(outsideRoot, "WORK.yaml"), "version: 1\nwork: []\n");
    await writeFile(path.join(outsideRoot, "FIXES.yaml"), "version: 1\nfixes: []\n");

    await expect(
      loadRegistry({ repositoryRoot: fixture.repositoryRoot, docsRoot: outsideRoot }),
    ).rejects.toThrowError(/must remain inside the repository/u);
  });

  it("selects one complete Docs spine atomically and labels its source root", async () => {
    const fixture = await createRepositoryFixture({ docsRootName: "Docs.next" });
    await mkdir(path.join(fixture.repositoryRoot, "Docs"));
    await writeFile(path.join(fixture.repositoryRoot, "Docs", "INDEX.md"), "# Legacy index\n");

    const snapshot = await loadRegistry({ repositoryRoot: fixture.repositoryRoot });

    expect(snapshot.sourceRoot).toBe("Docs.next");
    expect(snapshot.rows.every((row) => row.sourceRoot === "Docs.next")).toBe(true);
    await expect(
      loadRegistry({ repositoryRoot: fixture.repositoryRoot, docsRoot: "Docs" }),
    ).rejects.toThrowError(/Configured Docs root is incomplete/u);
  });

  it("projects pending migration decisions without treating them as schema errors", async () => {
    const fixture = await createRepositoryFixture();
    await writeFile(
      path.join(fixture.docsRoot, "MIGRATION.yaml"),
      `temporary: true
source_commit: b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a
disposition_required: founder-review
classification_note: Legacy decisions require explicit disposition.
entries:
  - id: MIG-001
    domain: practice
    claim: Review the preserved Practice decision.
    source_classification: legacy-accepted
    target_disposition: preserve-for-disposition
    founder_decision_state: pending
    sources: [Docs/INDEX.md]
    target: Specs/practice-serving.md
`,
    );

    const snapshot = await loadRegistry({ repositoryRoot: fixture.repositoryRoot });

    expect(snapshot.valid).toBe(true);
    expect(snapshot.migrationReady).toBe(false);
    expect(snapshot.counts).toMatchObject({ migrations: 1, pendingMigrationDecisions: 1 });
    expect(snapshot.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ entity: "migration", id: "MIG-001", status: "pending" }),
      ]),
    );
  });

  it("rejects the former Settings work to Practice Page spec identity mismatch", async () => {
    const fixture = await createRepositoryFixture();
    await writeFile(
      path.join(fixture.docsRoot, "WORK.yaml"),
      `version: 1
work:
  - id: PRACTICE-SETTINGS-001
    title: Practice settings
    area: practice
    status: planned
    kind: feature
    founder_approval: approved
    summary: Redesign learner settings.
    spec: Specs/practice-page.md
    dependencies: []
    blocked_by: []
    reusable_by: [practice]
    next_slice: Implement the approved slice.
    evidence: []
`,
    );
    await writeFile(
      path.join(fixture.docsRoot, "Specs", "practice-page.md"),
      `---
id: PRACTICE-PAGE-001
title: Practice page
area: practice
status: planned
implementation: none
founder_review: approved
updated: 2026-08-03
---
# Practice page
`,
    );

    const snapshot = await loadRegistry({ repositoryRoot: fixture.repositoryRoot });

    expect(snapshot.valid).toBe(false);
    expect(snapshot.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "spec_id_mismatch", severity: "error" }),
      ]),
    );
  });

  it("enforces founder approval, lifecycle, and evidence gates", async () => {
    const fixture = await createRepositoryFixture();
    await writeFile(
      path.join(fixture.docsRoot, "WORK.yaml"),
      `version: 1
work:
  - id: PRACTICE-SERVING-001
    title: Adaptive practice serving
    area: practice-serving
    status: active
    kind: feature
    founder_approval: required
    summary: Implement reinforced scheduling.
    spec: Specs/practice-serving.md
    dependencies: []
    blocked_by: []
    reusable_by: [lessons]
    next_slice: Implement the first slice.
    evidence: []
`,
    );
    await writeFile(
      path.join(fixture.docsRoot, "Specs", "practice-serving.md"),
      `---
id: PRACTICE-SERVING-001
title: Adaptive practice serving
area: practice-serving
status: draft
implementation: none
founder_review: required
updated: 2026-08-03
---
# Adaptive practice serving
`,
    );

    const snapshot = await loadRegistry({ repositoryRoot: fixture.repositoryRoot });
    const codes = snapshot.warnings.map((item) => item.code);

    expect(codes).toEqual(
      expect.arrayContaining([
        "work_requires_founder_approval",
        "work_requires_evidence",
        "work_spec_lifecycle_mismatch",
      ]),
    );
  });

  it("allows only process work to advance without a spec", async () => {
    const fixture = await createRepositoryFixture();
    await writeFile(
      path.join(fixture.docsRoot, "WORK.yaml"),
      `version: 1
work:
  - id: DEV-SYSTEM-001
    title: Development system
    area: development-system
    status: active
    kind: process
    founder_approval: approved
    summary: Improve the development system.
    spec: null
    dependencies: []
    blocked_by: []
    reusable_by: [all-surfaces]
    next_slice: Review the process.
    evidence: [Process approval recorded.]
  - id: REPO-CLEANUP-001
    title: Repository cleanup
    area: repository
    status: active
    kind: system
    founder_approval: approved
    summary: Remove obsolete files.
    spec: null
    dependencies: []
    blocked_by: []
    reusable_by: [repository]
    next_slice: Review the deletion.
    evidence: [Cleanup approval recorded.]
`,
    );
    await writeFile(path.join(fixture.docsRoot, "FIXES.yaml"), "version: 1\nfixes: []\n");
    const snapshot = await loadRegistry({ repositoryRoot: fixture.repositoryRoot });

    expect(snapshot.warnings.filter((item) => item.code === "missing_required_spec")).toEqual([
      expect.objectContaining({ message: expect.stringContaining("REPO-CLEANUP-001") }),
    ]);
  });

  it("rejects self references, blocked_by cycles, and completed blockers", async () => {
    const fixture = await createRepositoryFixture();
    await writeFile(
      path.join(fixture.docsRoot, "WORK.yaml"),
      `version: 1
work:
  - id: PROCESS-A-001
    title: Process A
    area: process-a
    status: blocked
    kind: process
    founder_approval: required
    summary: First process.
    spec: null
    dependencies: [PROCESS-A-001]
    blocked_by: [PROCESS-B-001, PROCESS-C-001]
    reusable_by: [all-surfaces]
    next_slice: Resolve blockers.
    evidence: []
  - id: PROCESS-B-001
    title: Process B
    area: process-b
    status: blocked
    kind: process
    founder_approval: required
    summary: Second process.
    spec: null
    dependencies: []
    blocked_by: [PROCESS-A-001]
    reusable_by: [all-surfaces]
    next_slice: Resolve blockers.
    evidence: []
  - id: PROCESS-C-001
    title: Process C
    area: process-c
    status: complete
    kind: process
    founder_approval: approved
    summary: Completed process.
    spec: null
    dependencies: []
    blocked_by: []
    reusable_by: [all-surfaces]
    next_slice: No further work.
    evidence: [Completed with proof.]
`,
    );
    await writeFile(path.join(fixture.docsRoot, "FIXES.yaml"), "version: 1\nfixes: []\n");
    const snapshot = await loadRegistry({ repositoryRoot: fixture.repositoryRoot });
    const codes = snapshot.warnings.map((item) => item.code);

    expect(codes).toEqual(
      expect.arrayContaining(["self_dependency", "blocked_by_cycle", "completed_blocker"]),
    );
  });
});
