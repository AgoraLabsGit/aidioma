---
id: SPEC-F-PRAXIS-ACTIVE
kind: feature
title: Praxis Active page
status: active
superseded_by: null
depends_on:
  - SPEC-A-PRAXIS
decisions:
  - D-023
  - D-024
  - D-031
built_by:
  - PHASE-005
  - PHASE-006
  - PHASE-009
last_amended: PHASE-009
research: []
paths:
  - Docs/System/dashboard/public/app.js
  - Docs/Handoffs/HANDOFF.md
  - Docs/WORK.yaml
---

# Praxis Active page

## Purpose

Active page shows what is in flight now — phases and `status: active` Work — plus a handoff
only when it is attached to the selected tab; entered from the header Active badge.

## Behavior

- Rule: Active page is routable but not a main-nav tab — entry is the topbar Active badge (SPEC-F-PRAXIS-SHELL)
- Rule: Header badge count equals Active **tabs** — in-flight phases (`active` + `blocked`) plus Work rows with `status: active` (same set as the tab strip)
- Rule: Active **tabs** include (1) in-flight phases and (2) Work rows with `status: active` (any kind); tab label is the id (`PHASE-009`, `T-058`); works with N=1
- Rule: Selecting a phase tab shows that phase’s phase view (same as before)
- Rule: Phase Status **Git** is the matching `phase/*` worktree (`phase.git` / `phase_id`); never the Docs-home or dashboard `repo.branch` alone. No desk → `no phase worktree`
- Rule: Selecting an active Work tab shows that row with the **same phase-style detail chrome** as the Work detail rail (Status glance, Brief, Context, Files including linked Feature/Area Spec paths, Activity) — not a separate ticket file
- Rule: Outcome Work stays on the Work page for the full ledger; Active only surfaces `status: active` rows (D-023 — not Activity-page chips)
- Rule: `HANDOFF.md` is one overwritten file with required YAML frontmatter `ref` set to exactly one `PHASE-nnn` (active/blocked) or `status: active` Work id (D-031)
- Rule: Active shows the Handoff block **only** when the selected tab id equals `handoff.ref`; otherwise omit the section (no global footer under every tab)
- Rule: Missing or invalid `ref` → unscoped — do not project the handoff on any Active tab (v1; no Signals required)
- Rule: Empty state (no in-flight phase **and** no active Work) prompts the next ready phase / `/run` or `/plan`; no handoff section unless a lone matching tab would apply (normally none)
- Rule: Phase detail keeps projecting `plan`/`build`/`close`/`check` and other phase-matched journal events
- Rule: Does not enable hard parallel active-phase runtime (W-015) — multi-phase tabs remain a UI contract only
- Rule: Handoff is **not** its own dashboard page

## Boundaries

Does not own Shell chrome. Does not list `done`/`open` Work or Activity process chips. Does not archive handoff history per phase/Work. Parallel-phase runtime is out of scope.

## Dependencies

Rests on SPEC-A-PRAXIS. Work chrome shared with SPEC-F-PRAXIS-WORK / Shell detail patterns.
