---
id: PHASE-009
title: Praxis Features and Active chrome
type: build
proof_kind: visual
state: closed
order: 7
depends_on:
  - PHASE-008
from_backlog: A-039
owner: founder
outcome: "Praxis Area + page Dashboard Features; ACTIVE-FLUSH Cursor hook; DEVSYSTEM→PRAXIS rename; Active→header badge (tab count) + multi-tab chrome; system.md kept as process SSOT."
proof: "Visual: Active off main nav; badge opens Active and counts tabs (phases + active Work). Specs Praxis live; DEVSYSTEM/DEV-DASHBOARD superseded. Hook Adv on .cursor/hooks*. work:test green."
non_goals:
  - Moving Praxis into a separate git repo
  - Hard parallel active-phase runtime (W-015)
  - Pasting system.md into Spec bodies
  - Learner PRODUCT.md / PHASE-002
  - Rewriting closed phase history ids
  - Shell/MCP/Tab write gates (v1 Agent Write/Delete/StrReplace only)
amends_specs:
  - SPEC-A-PRAXIS
  - SPEC-A-DEVSYSTEM
  - SPEC-F-DEV-DASHBOARD
  - SPEC-F-PRAXIS-SHELL
  - SPEC-F-PRAXIS-ACTIVE
  - SPEC-F-PRAXIS-WORK
  - SPEC-F-PRAXIS-ROADMAP
  - SPEC-F-PRAXIS-ACTIVITY
  - SPEC-F-PRAXIS-KNOWLEDGE
  - SPEC-F-PRAXIS-SIGNALS
  - SPEC-F-PRAXIS-DOCS
  - SPEC-F-PRAXIS-ACTIVE-FLUSH
feature: null
area: SPEC-A-PRAXIS
opened: 2026-08-08
closed: 2026-08-08
lessons: null
---

# PHASE-009 — Praxis Features and Active chrome

## Context

A-039: fat DEVSYSTEM Feature vs thin Area. Split into Praxis-named Area/page Features; demote
Active to a header badge; tab chrome for concurrent actives (runtime later). Keep `system.md`.

## Inputs

- D-004, D-009, D-013, D-020–D-031 · R-003–R-005 · A-038/A-039 · W-015 (deferred)

## Plan

1. Supersede DEVSYSTEM/DEV-DASHBOARD → SPEC-A-PRAXIS + SPEC-F-PRAXIS-* (+ ACTIVE-FLUSH).
2. Thicken Area/page Behavior Rules; Shell owns chrome.
3. Ship `.cursor/hooks*` (ACTIVE-FLUSH); Required Adv.
4. Active off nav; badge = Active-tab count; multi-tab UI (no W-015 runtime).
5. Update `system.md`; Dashboard-spec as architecture note.

**Complexity cost:** Many Features + chrome + hook. Cut: separate repo, parallel runtime, Shell gate.

## Proof

- [x] Praxis Specs live; DEVSYSTEM/DEV-DASHBOARD superseded
- [x] Active-flush hook shipped (T-057; phase branch)
- [x] Active not in main nav; badge + tabs work
- [x] system.md updated
- [x] `work:test` green (51); founder `/close`

## Close record

- Result: Praxis Features + Active chrome + scoped handoffs (D-031) + Active-flush hook.
- Specs: SPEC-A-PRAXIS, SPEC-F-PRAXIS-*; superseded DEVSYSTEM/DEV-DASHBOARD.
- Journal: close(PHASE-009): Praxis Features + Active chrome + Active-flush hook
- Adv: WARN→fixed (badge count SSOT); A-040/Dashboard-spec residue ack
- MCOO: PASS — W-015/Shell gates cut; task-desk hook duplicate discarded
- Check: C-018 PASS
