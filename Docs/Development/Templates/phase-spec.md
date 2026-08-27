---
id: PHASE-000
workflow_version: 2
title: Outcome-shaped title
type: build
proof_kind: test
state: proposed
order: 0
depends_on: []
from_backlog: null
owner: founder
outcome: "One observable result"
proof: "The exact learner journey, test, artifact, or state that proves it"
non_goals: []
amends_specs: []
feature: null
area: null
context_paths: null
opened: YYYY-MM-DD
closed: null
lessons: null
---

# PHASE-000 — Outcome-shaped title

## Context

Why this is the next product outcome.

State the one primary learner journey in the form required by `Docs/Development/DELIVERY.md`. If
the phase contains multiple primary journeys or unresolved alternatives, split it before `ready`.

## Inputs

- Decisions: none
- Research: none
- Specs: none
- Claimed work-register entries: none

## Plan

The smallest implementation shape that can produce the outcome.

Name the walking proof, important failure/retry behavior, and changed code owners. Acceptance must
pass before `/close`; close does not finish implementation.

**Complexity cost:** what this adds and why a current learner path needs it.

## Proof

- [ ] One named proof artifact or command.

## Audit

Select the risk tier and lenses from `Docs/CLOSE.md` before implementation.

**Risk tier:** 1

| Lens | Run? | Why / N/A | Sub-agent |
|---|---|---|---|
| Claims / Proof evidence | yes | every phase | assigned at close |
| Code quality / Standards | yes | every phase | assigned at close |
| MCOO | yes | every phase | assigned at close |
| Seams / Integration | n/a | no boundary change in the initial plan | — |
| Security / Privacy | n/a | no trust or personal-data boundary in the initial plan | — |
| API / Provider usage | n/a | no external provider in the initial plan | — |
| Product / Learner journey | n/a | no learner-visible behavior in the initial plan | — |

## Kickoff

```text
/run PHASE-000

Read AGENTS.md, Docs/NOW.md, this phase, its target.json, and the owning specs. Coordinate the
phase in this session and keep all implementation inside the declared outcome and non-goals.
```
