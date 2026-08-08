---
id: SPEC-A-DEVSYSTEM
kind: area
title: Development system
status: superseded
superseded_by: SPEC-A-PRAXIS
vendor: null
decisions:
  - D-013
  - D-020
  - D-021
  - D-022
  - D-023
  - D-024
  - D-025
  - D-026
  - D-027
  - D-028
  - D-029
  - D-030
built_by:
  - PHASE-005
  - PHASE-008
last_amended: PHASE-009
research:
  - R-004
  - R-005
paths:
  - Docs/System/**
  - Docs/WORK.yaml
  - Docs/Roadmap/**
  - .work/**
---

# Development system

## Purpose

Process substrate: Docs/System, Work ledger, dashboard, Roadmap, and agent commands.

## Behavior

- Rule: Living process SSOT is `Docs/System/system.md`
- Rule: Authored non-phase work lives in `Docs/WORK.yaml`
- Rule: Work (and optionally Phase frontmatter) may declare `context_paths` — repo-relative paths that informed the item (D-024); not an automatic tool-read log
- Rule: Steady-state product `/task`/`/fix` use dedicated `task/*`/`fix/*` worktrees for product code; Docs home is meta-only (D-020/D-025). Concurrent Docs-home writers lease paths via active Work `context_paths` (overlap → wait/park)
- Rule: `/close` (reduced) inventories D-025 desks and publishes each dirty session desk — product PR + meta `close/*` when both dirty; never delete Docs home
- Failure mode: If derive/dashboard is down, agents still read Docs/ in the IDE

## Boundaries

Learner product behavior is not this area. Dashboard-spec stays under System/ (D-009).

## Vendor

null

## Successor

Superseded by **SPEC-A-PRAXIS** (PHASE-009 rename for later extract).
