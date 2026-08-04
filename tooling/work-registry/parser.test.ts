import { describe, expect, it } from "vitest";

import {
  RegistryParseError,
  parseFixRegistry,
  parseMigrationRegistry,
  parseProductFrontmatter,
  parseSpecFrontmatter,
  parseWorkRegistry,
} from "./parser.js";

const validWork = `
version: 1
work:
  - id: PRACTICE-SERVING-001
    title: Adaptive practice serving
    area: practice-serving
    status: planning
    kind: feature
    founder_approval: required
    summary: Design reinforced practice scheduling.
    spec: Specs/practice-serving.md
    dependencies: []
    blocked_by: []
    reusable_by:
      - lessons
    next_slice: Complete founder review.
    evidence: []
`;

const validFixes = `
version: 1
fixes:
  - id: EVALUATION-FIX-001
    title: Restore local grading
    area: evaluation
    status: open
    summary: Non-exact answers cannot be graded locally.
    related_work: PRACTICE-SERVING-001
    reproduction: Submit a reasonable non-exact answer.
    expected: A verdict is returned.
    actual: Evaluation is unavailable.
    evidence: []
`;

describe("registry YAML parsers", () => {
  it("parses the canonical strict registries", () => {
    expect(parseWorkRegistry(validWork).work[0]?.status).toBe("planning");
    expect(parseFixRegistry(validFixes).fixes[0]?.status).toBe("open");
  });

  it("rejects unknown fields", () => {
    expect(() =>
      parseWorkRegistry(validWork.replace("    evidence: []", "    evidence: []\n    surprise: true")),
    ).toThrowError(/Unrecognized key/u);
  });

  it("rejects duplicate YAML keys before schema validation", () => {
    expect(() => parseWorkRegistry(validWork.replace("version: 1", "version: 1\nversion: 1"))).toThrowError(
      RegistryParseError,
    );
  });

  it("rejects paths outside the flat Specs directory", () => {
    expect(() =>
      parseWorkRegistry(validWork.replace("Specs/practice-serving.md", "Specs/../private.md")),
    ).toThrowError(/Specs\/\*\.md path/u);
  });
});

describe("spec frontmatter parser", () => {
  it("parses strict spec metadata", () => {
    const result = parseSpecFrontmatter(
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
      "Specs/practice-serving.md",
    );

    expect(result).toEqual({
      id: "PRACTICE-SERVING-001",
      title: "Adaptive practice serving",
      area: "practice-serving",
      status: "draft",
      implementation: "none",
      founder_review: "required",
      updated: "2026-08-03",
    });
  });

  it("rejects missing frontmatter and invalid calendar dates", () => {
    expect(() => parseSpecFrontmatter("# No metadata", "Specs/no-metadata.md")).toThrowError(
      /must begin with YAML frontmatter/u,
    );
    expect(() =>
      parseSpecFrontmatter(
        `---
id: TEST-SPEC-001
title: Invalid date
area: testing
status: draft
implementation: none
founder_review: required
updated: 2026-02-30
---
body
`,
        "Specs/invalid.md",
      ),
    ).toThrowError(/valid calendar date/u);
  });
});

describe("product and migration parsers", () => {
  it("requires canonical product identity", () => {
    expect(() =>
      parseProductFrontmatter(`---
id: OTHER-PRODUCT-001
title: Product
area: product
status: draft
implementation: none
founder_review: required
updated: 2026-08-03
---
# Product
`),
    ).toThrowError(/PRODUCT-001/u);
  });

  it("parses strict migration metadata and full git sources", () => {
    const migration = parseMigrationRegistry(`temporary: true
source_commit: b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a
disposition_required: founder-review
classification_note: Accepted is reserved for current approval.
entries:
  - id: MIG-001
    domain: practice
    claim: Preserve a reviewed decision.
    source_classification: rejected
    target_disposition: record-current-rejection
    founder_decision_state: approved
    sources: [git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/source.md]
    target: Specs/practice-page.md
`);

    expect(migration.entries[0]?.founder_decision_state).toBe("approved");
    expect(() =>
      parseMigrationRegistry(
        `temporary: true
source_commit: b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a
disposition_required: founder-review
classification_note: Strict sources.
entries:
  - id: MIG-001
    domain: practice
    claim: Invalid short source.
    source_classification: rejected
    target_disposition: record-current-rejection
    founder_decision_state: approved
    sources: [git:b0fd03f:Docs/source.md]
    target: Specs/practice-page.md
`,
      ),
    ).toThrowError(/40sha/u);
  });
});
