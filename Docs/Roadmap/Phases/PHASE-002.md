---
id: PHASE-002
title: "Dialect-aware learning contract"
type: build
proof_kind: test
state: closed
order: 2
depends_on:
  []
from_backlog: null
owner: founder
outcome: "One vertical content unit has stable concept and meaning IDs, CEFR placement, structured es-AR, es-419, and es-ES renderings, answer policy, validation fixtures, adversarial review results, and a promotion receipt."
proof: "The same promoted unit validates, renders, and grades correctly in all three dialect profiles with retained deterministic and adversarial evidence."
evidence_log: 1
non_goals:
  - "Bulk lesson generation"
  - "New learner-facing UI"
  - "Additional practice modes"
  - "Free-text dialect prompting"
amends_specs:
  - "SPEC-F-CONTENT-PIPELINE"
  - "SPEC-A-CONTENT"
feature: SPEC-F-CONTENT-PIPELINE
area: SPEC-A-CONTENT
context_paths:
  - "content/**"
  - "tooling/content/**"
  - "packages/lesson-schema/**"
opened: 2026-08-24
closed: "2026-08-25T16:05:48.590Z"
lessons: "A phase is not complete when its product proof merely exists; terminal close must retain ordered triage, exact-head formal check, every selected and mandatory audit, executable consumer proof, merged publication, and a lifecycle receipt before successor work resumes."
---

# PHASE-002 — Dialect-aware learning contract

## Context

Every later learner surface depends on shared content identity, dialect structure, answer policy, and promotion gates. Prove that contract with one representative unit before multiplying content.

## Inputs

- Decisions this depends on: None
- Research consulted: None
- Specs this touches: SPEC-F-CONTENT-PIPELINE, SPEC-A-CONTENT

## Plan

Execute the governed phase outcome through the shared `/plan` and `/run` authority.

**Complexity cost:** one durable Phase object and its explicit Work relationships.

## Proof

- [ ] The same promoted unit validates, renders, and grades correctly in all three dialect profiles with retained deterministic and adversarial evidence.

## Audit

| Lens | Run? | Why / N/A | Sub-agent |
|---|---|---|---|
| Adv (phase claims) | yes | selected at /plan | Adv |
| MCOO | yes | selected at /plan | MCOO |

### Audit history

| Attempt | At (UTC) | Lens | Result | Candidate | Brief | Remediation |
|---|---|---|---|---|---|---|
| A11 | 2026-08-25T15:39:57.833Z | Adv (phase claims) | PASS | product=aa8587bdb8ec611081f22c94ee500df23cd28c30 | Independent adversarial audit verified stable dialect-aware content identities, answer policy, digest-bound evidence, fail-closed counter-examples, exact-head check evidence, and no Phase 3 scope. | — |
| A12 | 2026-08-25T15:39:58.554Z | MCOO | PASS | product=aa8587bdb8ec611081f22c94ee500df23cd28c30 | Independent minimal-change audit verified one coherent promoted unit and its shared schema/verifier/evidence chain, with every abstraction consumed and no learner UI, practice-mode, or Phase 3 expansion. | — |
| A13 | 2026-08-25T15:48:56.799Z | Code quality / Standards | PASS | product=aa8587bdb8ec611081f22c94ee500df23cd28c30 | Independent standards audit verified strict identity, dialect, answer-policy, receipt, canonical-hash, temporal, and fail-closed contracts; all exact-head checks passed, git diff was clean, no generated residue or Phase 3 scope remained. | — |

### Check history

| Check | At (UTC) | Result | Candidate | Proof | Disposition |
|---|---|---|---|---|---|
| C-012 | 2026-08-25T15:33:56.444Z | PASS | aidioma=aa8587bdb8ec611081f22c94ee500df23cd28c30 | Clean recovery candidate passed content typecheck, validation with zero errors and five pre-existing warnings, 22/22 canonical fixtures including 35/35 dialect counter-examples, lesson-schema smoke, and exact promoted-package verification for digest ced27924b07023b7161ce84b54376c1c592f3f85b60b890f4200e033af42da1a. | Proceed to the selected Adv and MCOO close-time audits on exact head aa8587bdb8ec611081f22c94ee500df23cd28c30. |

## Close record

- Result: Recovered and governed PHASE-002 through exact-head checks, independent audits, protected publication, and terminal lifecycle close while PHASE-003 remained safely parked.
- Lifecycle receipt: PLC-002-000154
- Publication: PUB-001
- Exact head: aa8587bdb8ec611081f22c94ee500df23cd28c30
- Specs amended:
- Journal line:

## Kickoff

```text
/run PHASE-002

PHASE-002 is closed. Read this canonical phase file and its retained evidence for history.
```
