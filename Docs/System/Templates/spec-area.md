---
id: SPEC-A-XXX
kind: area
title: <Database | Auth | AI | API | ...>
status: active                # active | superseded | contested
superseded_by: null
vendor: <provider name, or null>
decisions: []                 # [D-012]
built_by: []                  # [PHASE-007]
last_amended: null
research: []
paths:
  - <glob>/**            # at least one required — CI rejects an empty list
---

<!-- Validated against System/schemas/spec.schema.json in CI.
     kind: area must NOT declare depends_on — the feature→area edge is one-directional.
     status: superseded requires superseded_by.
     No extra frontmatter keys — additionalProperties is false.
     Mold guidance: D-028 (Rule grammar + stub bar). -->

# <Title>

## Purpose

What this substrate provides to everything built on top of it.

## Behavior

How it behaves from the perspective of the features using it. Interfaces, guarantees, failure
modes.

**Rule grammar (D-028):** present tense, observable, fail-visible (same as Feature). Rules are
rule-oriented checklists (peer alternative to Given/When/Then).

- Rule: <checkable — e.g. "Auth tokens are verified before any `/api/*` handler runs">
- Failure mode: <what features observe when this area is down — required>

## Boundaries

What this area does not cover. Where the seam is with adjacent areas.

## Vendor

Only if `vendor` is set.

- Provider and plan
- Limits that matter: rate, quota, cost shape
- What migration would cost, at a high level
- Decisions: D-XXX

---

**Stub bar (D-028):** Purpose ≤3 sentences; ≥1 Rule meeting the grammar; Failure mode non-empty;
Boundaries non-empty. MOCK fixtures may stay thinner.

**An area exists only if at least one feature declares `depends_on` it.** Do not create area
specs in anticipation. If nothing depends on it, it is a system concern (`System/`) or a decision
(`DECISIONS.md`).

Areas do not list the features that depend on them — that edge is derived.

**Cap: ~1500 words.**
