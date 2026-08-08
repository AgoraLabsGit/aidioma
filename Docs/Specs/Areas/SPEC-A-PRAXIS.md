---
id: SPEC-A-PRAXIS
kind: area
title: Praxis development system
status: active
superseded_by: null
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
  - PHASE-009
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

# Praxis development system

## Purpose

Process substrate for AIdioma: Docs/System, Work ledger, Praxis dashboard, Roadmap, and agent
commands. Named Praxis so the Area can extract to its own project later without renaming again.

## Behavior

- Rule: Living process SSOT is `Docs/System/system.md` (not Spec bodies)
- Rule: Authored non-phase work lives in `Docs/WORK.yaml`
- Rule: Work (and optionally Phase frontmatter) may declare `context_paths` — repo-relative paths that informed the item (D-024); not an automatic tool-read log
- Rule: When `.worktrees/docs` exists (`docs/ssot`), it is the only writable SSOT for `Docs/**`, `.work/**`, root `AGENTS.md`/`CLAUDE.md`, and `.claude/skills/**` (D-020)
- Rule: Steady-state product `/task`/`/fix` use dedicated `task/*`/`fix/*` worktrees; Docs home is meta-only (D-025). Concurrent Docs-home writers lease paths via active Work `context_paths` (overlap → wait/park)
- Rule: `/close` with an active phase runs full dual-desk publish; with no phase, reduced close inventories D-025 desks and publishes each dirty desk — never delete Docs home (D-021/D-025)
- Rule: At most one phase is `active` today; parallel active phases remain proposal `W-015` (UI contract may ship earlier)
- Rule: Dashboard page Behavior Rules live in `SPEC-F-PRAXIS-*` Features; Shell owns shared chrome
- Rule: Spec titles and Knowledge TOC-facing titles stay ≤60 characters
- Failure mode: If derive/dashboard is down, agents still read Docs/ in the IDE

## Boundaries

Learner product behavior is not this area. `system.md` stays process SSOT — Specs do not paste it.
Dashboard architecture notes may live under `Docs/System/specs/` (D-009) but must not compete with Feature Behavior Rules.

## Vendor

null
