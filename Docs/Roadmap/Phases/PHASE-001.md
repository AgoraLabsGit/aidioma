---
id: PHASE-001
title: "Marketable MVP product contract"
type: design
proof_kind: spec
state: closed
order: 1
depends_on: []
from_backlog: null
owner: founder
outcome: "Produce one actionable MCOO marketable-MVP contract, its minimal component boundaries, and an adversarial verdict ready for founder approval."
proof: "PRODUCT and decision records cover every core journey, projected specs define one authority per component, and an adversarial audit identifies unresolved launch risks and explicit non-goals."
evidence_log: 1
non_goals:
  - "Implement learner-facing product code"
  - "Generate the full A1 through C1 curriculum"
  - "Add more than typed translation practice"
  - "Import the V1 roadmap wholesale"
amends_specs:
  - "SPEC-F-LEARNING-LOOP"
  - "SPEC-A-LEARNER"
  - "SPEC-A-CONTENT"
feature: SPEC-F-LEARNING-LOOP
area: SPEC-A-LEARNER
context_paths:
  - "Docs/PRODUCT.md"
  - "Docs/DECISIONS.md"
  - "Docs/Research/**"
  - "Docs/Specs/**"
  - "Docs/Roadmap/**"
opened: 2026-08-24
closed: "2026-08-24T16:24:46.940Z"
lessons: null
---

# PHASE-001 — Marketable MVP product contract

## Context

The running practice page already proves the chat interaction and part of the practice pipeline. This phase converts the approved product direction into the smallest coherent contract before implementation sequencing.

## Inputs

- Decisions this depends on: None
- Research consulted: None
- Specs this touches: SPEC-F-LEARNING-LOOP, SPEC-A-LEARNER, SPEC-A-CONTENT

## Plan

Execute the governed phase outcome through the shared `/plan` and `/run` authority.

**Complexity cost:** one durable Phase object and its explicit Work relationships.

## Proof

- [ ] PRODUCT and decision records cover every core journey, projected specs define one authority per component, and an adversarial audit identifies unresolved launch risks and explicit non-goals.

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

- Result: Founder approved the marketable MVP contract, MCOO boundaries, dialect-first content pipeline, and sequenced implementation direction.
- Specs amended:
- Journal line:

## Kickoff

```text
/run PHASE-001

Read .work/context.json. Continue PHASE-001 from its durable phase plan.
```
