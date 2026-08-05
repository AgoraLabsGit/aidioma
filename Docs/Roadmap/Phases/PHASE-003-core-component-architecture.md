---
schema_version: 1
id: PHASE-003
title: Core Component Architecture
phase_type: design
subtype: architecture
status: proposed
depends_on:
  - PHASE-002
founder_approval: required
updated: 2026-08-05
---

# PHASE-003 — Core Component Architecture

## Outcome

Derive and approve the minimum logical component set required by the Phase 002 target product.

## Why now

Boundaries follow an approved product map, not a feature inventory or frozen architecture draft.

## Inputs

- Approved `Docs/PRODUCT.md` from Phase 002
- Executable app behavior
- Frozen `Docs.2/ARCHITECTURE.md` as evidence only

## In scope

- Component responsibilities, ownership, boundaries, AI use, failure, consumers, first proof
- Keep / merge / split / rename / remove
- Feature-to-component coverage
- Recommended order for later implementation phases

## Out of scope

- Detailed component PRDs
- Implementation / product code
- Scheduling implementation before Mike approves order

## Founder checkpoints

One boundary at a time; ≤3 decisions per checkpoint; show charters before writing.

## Strategic review

Bounded boundary questions only; no delegated whole-architecture design.

## Deliverables

- Concise `Docs/COMPONENTS.md` (or equivalent thin charter file—not an architecture bible)
- Coverage map + first implementation order

## Proof and exit criteria

- Every component has distinct value and one authority
- Every target feature covered; no component without a consumer
- Mike approves the minimal set and first implementation order

## Close audits

Design close: Steward + Publish + Decision Auditor + MCOO.

## Decisions

| ID | Decision | Date |
|---|---|---|
| D-001 | Scheduled after Target Product Design | 2026-08-05 |

## Fresh-session kickoff

Do not start before Phase 002 completes.
