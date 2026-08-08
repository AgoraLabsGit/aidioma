---
id: SPEC-F-PRAXIS-DOCS
kind: feature
title: Praxis Docs guide page
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
  - Docs/START.md
  - Docs/COMMANDS-OVERVIEW.md
  - Docs/System/dashboard/public/app.js
---

# Praxis Docs guide page

## Purpose

Docs is the beginner Praxis guide page (not Knowledge).

## Behavior

- Rule: Docs is a first-class dashboard page (`docs`, title Docs) — beginner Praxis guide; **not** a main-nav tab (same class as Signals); entry is the sidebar-foot Docs control only (D-026/D-027)
- Rule: Docs projects customer-facing guide pages: `Docs/START.md` (Welcome) + `Docs/COMMANDS-OVERVIEW.md` (Commands) (D-027); does **not** project `System/COMMANDS.md`; does not replace Knowledge
- Rule: Docs TOC shows titles only (no file-path sub-lines; no Guide/Praxis chrome labels)
- Rule: Docs page uses Knowledge reader chrome with fixed ~220px Guide TOC (no collapse control; does not share Knowledge TOC width/collapse prefs); `.page-docs` fills below the topbar like Knowledge; Docs prose is full pane width (no 72ch reading measure)

## Boundaries

Agent command SSOT remains `Docs/System/COMMANDS.md` (Commands panel), not this page.

## Dependencies

Rests on SPEC-A-PRAXIS.
