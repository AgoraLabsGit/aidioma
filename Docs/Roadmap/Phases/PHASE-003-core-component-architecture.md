---
id: PHASE-003
title: Core Component Architecture
type: design
proof_kind: spec
state: proposed
order: 5
depends_on:
  - PHASE-002
from_backlog: null
owner: founder
outcome: "Mike approves the minimum logical component/area set required by the Phase 002 product map."
proof: "Approved thin area/feature boundary records (Specs/ and/or DECISIONS) with coverage and first implementation order."
non_goals:
  - Detailed component PRDs
  - Implementation / product code
  - Scheduling implementation before Mike approves order
  - A living Architecture/ folder or architecture bible
amends_specs: []
feature: null
area: SPEC-A-LEARNER
opened: 2026-08-05
closed: null
lessons: null
---

# PHASE-003 — Core Component Architecture

## Context

Boundaries follow an approved product map, not a feature inventory or frozen architecture draft.

## Inputs

- Approved `Docs/PRODUCT.md` from PHASE-002
- Executable app behavior
- Frozen `Docs.2/ARCHITECTURE.md` as evidence only

## Plan

One boundary at a time; ≤3 decisions per checkpoint. Keep / merge / split / rename / remove.
Deliverables live in Specs (Features/Areas) and DECISIONS — not a parallel Architecture root.

**Complexity cost:** minimum set with a real consumer each. No unconsumed foundations.

## Proof

- [ ] Every unit has distinct value and one authority
- [ ] Every target capability covered; no unit without a consumer
- [ ] Mike approves the minimal set and first implementation order

## Close record

Filled at `/close`.

## Kickoff

Do not start before PHASE-002 completes.
