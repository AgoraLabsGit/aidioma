---
id: PHASE-002
title: "Dialect-aware learning contract"
type: build
proof_kind: test
state: ready
order: 2
depends_on: []
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
closed: null
lessons: null
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
| Adv (phase claims) | yes | always | Adv |
| MCOO | yes | always | MCOO |
| Seams | yes | phase, spec, and runner boundaries | seams |
| Security | n/a | no security-sensitive surface declared | — |
| UI/UX | yes | `/plan` and `/run` are user-facing actions | UI/UX |
| Agent-context | yes | native-chat skills and runner context change | agent-context |

### Audit history

| Attempt | At (UTC) | Lens | Result | Candidate | Brief | Remediation |
|---|---|---|---|---|---|---|

### Check history

| Check | At (UTC) | Result | Candidate | Proof | Disposition |
|---|---|---|---|---|---|

## Close record

- Result: 
- Specs amended:
- Journal line:

## Kickoff

```text
/run PHASE-002

Read .work/context.json. Continue PHASE-002 from its durable phase plan.
```
