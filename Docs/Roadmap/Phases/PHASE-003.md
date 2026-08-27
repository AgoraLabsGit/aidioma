---
id: PHASE-003
title: "Shared adaptive chat loop"
type: build
proof_kind: test
state: closed
order: 3
depends_on:
  - "PHASE-002"
from_backlog: null
owner: founder
outcome: "The live Practice interaction becomes a reusable session contract for lesson, collection, and saved sources. A deterministic policy serves eligible weak, due, and new promoted material, while evaluation retains evidence without directional mastery."
proof: "A learner completes, misses, retries, pauses, resumes, saves, and receives an explainable next item in one collection using promoted content, with retained automated evidence for serving and evaluation behavior."
evidence_log: 1
non_goals:
  - "Additional practice modalities"
  - "A learned recommendation model"
  - "Complete lesson and collection journeys"
  - "Saved-library or Translate expansion"
amends_specs:
  - "SPEC-F-LEARNING-LOOP"
  - "SPEC-A-LEARNER"
feature: SPEC-F-LEARNING-LOOP
area: SPEC-A-LEARNER
context_paths:
  - "apps/web/src/app/practice/**"
  - "apps/web/src/app/api/practice/**"
  - "apps/web/src/components/practice-workspace.tsx"
  - "apps/web/src/components/practice-set-options-panel.tsx"
  - "apps/web/src/lib/practice-serving/**"
  - "apps/web/src/lib/practice-sets/**"
  - "apps/web/src/lib/evaluation/**"
  - "apps/web/src/lib/db/**"
  - "content/**"
  - "packages/lesson-schema/**"
opened: 2026-08-24
closed: "2026-08-25T16:35:51Z"
lessons: null
---

# PHASE-003 — Shared adaptive chat loop

## Context

Phase 2 established trustworthy dialect-aware content identity and grading inputs. Prove one reusable, durable learner loop before expanding lessons, saved review, Translate, or content volume.

## Inputs

- Decisions this depends on: None
- Research consulted: None
- Specs this touches: SPEC-F-LEARNING-LOOP, SPEC-A-LEARNER

## Plan

Implement the phase outcome in `apps/web/` against promoted content. Track leftover work in `Docs/NOW.md`.

## Proof

- [x] A learner completes, misses, retries, pauses, resumes, saves, and receives an explainable next item in one collection using promoted content, with retained automated evidence for serving and evaluation behavior.

## Audit

| Lens | Run? | Why / N/A | Sub-agent |
|---|---|---|---|
| Claims / Proof evidence | no | Historical close used retained browser and automated product proof. | — |
| MCOO | no | Historical proof stayed within the promoted one-item Practice outcome. | — |

### Audit history

| Attempt | At (UTC) | Lens | Result | Candidate | Brief | Remediation |
|---|---|---|---|---|---|---|


### Check history

| Check | At (UTC) | Result | Candidate | Proof | Disposition |
|---|---|---|---|---|---|
| C-003 | 2026-08-25T16:35:51Z | PASS | working tree on `50e53dae9a09e65c03e11cdff79aa3a3b82feb1f` | Signed-in Clerk browser journey completed the promoted Everyday location collection: miss → `retry_after_miss` cue → correct retry → save → pause → reload → resume → `strengthen_weak_item` cue → session recap. Focused Vitest: 9 files / 48 tests passed. Neon proof: 2 attempts, saved item, reasons `new_in_scope,retry_after_miss,strengthen_weak_item`. Screenshots retained in `Docs/Evidence/phase-003/`. | Phase proof complete; publication remains founder-controlled. |


## Close record

- Result: The real Clerk, Neon, and AI Gateway path now proves the shared adaptive Practice loop end to end on promoted content, including durable pause/resume, saved state, correction evidence, and explainable retry/weak-item serving.
- Lifecycle receipt: N/A — this phase predates the current receipt contract.
- Publication: Not requested; changes remain in the founder's dirty working tree.
- Exact head: Working tree on `50e53dae9a09e65c03e11cdff79aa3a3b82feb1f`.
- Specs amended: `SPEC-F-LEARNING-LOOP`, `SPEC-A-LEARNER`.
- Journal line: PHASE-003 closed with signed-in browser proof and retained automated/provider evidence.

## Kickoff

```text
Read AGENTS.md and Docs/NOW.md. PHASE-003 is closed; choose the next roadmap outcome with the founder.
```
