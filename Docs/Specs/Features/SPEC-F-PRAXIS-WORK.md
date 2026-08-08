---
id: SPEC-F-PRAXIS-WORK
kind: feature
title: Praxis Work page
status: active
superseded_by: null
depends_on:
  - SPEC-A-PRAXIS
decisions:
  - D-011
  - D-012
  - D-013
  - D-022
  - D-023
  - D-024
  - D-026
  - D-027
built_by:
  - PHASE-005
  - PHASE-006
  - PHASE-009
last_amended: PHASE-009
research: []
paths:
  - Docs/WORK.yaml
  - Docs/System/dashboard/public/app.js
---

# Praxis Work page

## Purpose

Work page projects the authored outcome ledger `WORK.yaml`.

## Behavior

- Rule: Work page shows outcome ledger `WORK.yaml`
- Rule: Work kinds include `design` (`S-nnn`); UI shows human kind labels (e.g. Design); `D-nnn` remains decisions only (not Work ids); `/design` upserts `status: active` before other edits
- Rule: Work / Roadmap / Activity ID cells include a copy control
- Rule: Work table defaults to Age newest-first; user sort/filter prefs persist until changed or Reset
- Rule: Age columns default to newest-first on first click; second click toggles
- Rule: Work detail surfaces `open_questions`, `done_summary`, and derived Activity trail (`ref === id`, including outcome types)
- Rule: Durable outcome commands appear as Work rows; activity.jsonl remains the append-only journal (D-022)
- Rule: `/check` Activity events use durable `ref: C-nnn` (not a Work kind); index exposes `next_check_id`

## Boundaries

Does not replace Signals (derived health). Activity page is not the full journal (D-023).

## Dependencies

Rests on SPEC-A-PRAXIS.
