---
id: SPEC-F-DEV-DASHBOARD
kind: feature
title: Development dashboard and Work ledger
status: active
superseded_by: null
depends_on:
  - SPEC-A-DEVSYSTEM
decisions:
  - D-011
  - D-012
  - D-013
  - D-022
  - D-023
  - D-024
built_by:
  - PHASE-005
last_amended: PHASE-007
research: []

paths:
  - Docs/System/dashboard/**
  - Docs/System/derive/**
  - Docs/WORK.yaml
---

# Development dashboard and Work ledger

## Purpose

Lets the founder see phases, Work, Signals, and Knowledge projected from Docs/.

## Behavior

- Rule: Dashboard is read-only projection of Docs/ and `.work/`
- Rule: `work:dashboard` / `tooling/run-dashboard.sh` serves UI from Docs home when present (D-020), even if invoked from a phase/task cwd
- Rule: Missing static UI assets return 404 (no Error stack spam); launcher refuses to start when `public/index.html` is absent
- Rule: Work page shows outcome ledger `WORK.yaml`; Signals shows derived health only
- Rule: Activity **page** lists process/ops allowlist only (D-023): default `handoff`/`close`/`check`/`ship`; optional chips `launch`/`dashboard`/`status`/`triage`/`system`; no outcome-type rows or chips
- Rule: Activity Status / Feature / Area join `WORK.yaml` when `ref` is a Work id (ledger SSOT); phase-linked events still use phase tags
- Rule: Work kinds include `design` (`S-nnn`); UI shows human kind labels (e.g. Design); `D-nnn` remains decisions only (not Work ids); `/design` upserts `status: active` before other edits
- Rule: Work / Roadmap / Activity ID cells include a copy control; Activity copies `ts type ref` (no durable event id)
- Rule: `/check` Activity events use durable `ref: C-nnn` (not a Work kind); index exposes `next_check_id`
- Rule: Topbar git badge shows open worktree count; panel lists worktrees by category (docs/main/phase/task/other) with dirty/ahead and optional GitHub branch link
- Rule: Sidebar brand and document title use `repo.project_name` (primary checkout folder name; origin slug fallback) — not a hard-coded product string
- Rule: Work/Phase detail section labels (D-024): **Brief** = authored intent (Work `note`; Phase `## Brief` if present else `## Context`); **Context** = declared `context_paths` (honest empty if none); **Files** = ownership trees (ledger/spec homes + spec `paths` / phase `amends_specs`)
- Rule: Work detail also surfaces `open_questions`, `done_summary`, and derived **Activity** trail (`ref === id`, including outcome types)
- Rule: `context_paths` are declared (nullable); never presented as a complete automatic read set; do not invent paths from tool traces
- Rule: Phase detail keeps projecting `plan`/`build`/`close`/`check` and other phase-matched journal events
- Rule: Durable outcome commands appear as Work rows; activity.jsonl remains the append-only journal (D-022); Activity page is not the full journal (D-023)

- Rule: Table summaries truncate at 80 chars (full text in tooltip); column headers own sort
- Rule: Work table defaults to Age newest-first; Roadmap schedule sort pins active phase(s) first, then Order; user sort/filter prefs persist until changed or Reset
- Rule: Age (and Activity time) columns default to newest-first on first click; second click toggles
- Rule: No page subtitles under the topbar title; no table “Showing N of M / columns…” meta bylines
- Rule: Feature/Area filters live in a Filters pop-up panel (not primary chip row); Reset clears filters/sort/search per table page; Filters badge is a small count chip
- Rule: Detail panels (Phase / Work / Signal) share Phase chrome: `phase-view` header, Status `phase-block` + `glance-grid`, optional `phase-card` sections
- Rule: Detail topbar shows the id once — no path byline (`Docs/…`) and no duplicate id under the title
- Rule: Detail topbar ID (`#detail-title`) is large mono next to collapse; copy control sits immediately right of the ID (all pages using `#detail`)
- Rule: Detail collapse control is top-left (larger chevron in the collapsed rail); Close is top-right when expanded and hidden when collapsed; chevron flips (`›` / `‹`)
- Rule: Detail starts closed on load; `.detail[hidden]` must stay `display: none` (flex must not override `hidden`)
- Rule: Detail overlays when expanded; while open, workspace keeps a fixed ~52px right gutter for the collapsed rail (no reflow on expand/collapse)
- Rule: Detail/Knowledge resize gutters are invisible until hover (no persistent thick divider)
- Rule: Signals entry is the sidebar-foot status pill (not a main-nav item)

## Boundaries

Does not fire commands or edit artifacts from the UI (V1).


## Dependencies

Rests on SPEC-A-DEVSYSTEM for process files and schemas.
