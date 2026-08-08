---
id: SPEC-F-PRAXIS-ROADMAP
kind: feature
title: Praxis Roadmap page
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
  - Docs/Roadmap/**
  - Docs/System/dashboard/public/app.js
---

# Praxis Roadmap page

## Purpose

Roadmap page projects scheduled phases from phase frontmatter.

## Behavior

- Rule: Roadmap reads `Phases/*.md` frontmatter (incl. feature/area), ordered by schedule
- Rule: Roadmap schedule sort pins active phase(s) first, then Order; user sort/filter prefs persist until changed or Reset
- Rule: Roadmap ID cells include a copy control
- Rule: Phase detail uses shared Shell detail chrome and D-024 Brief/Context/Files labels

## Boundaries

Phase files are schedule SSOT; generated `Roadmap.md` is derived.

## Dependencies

Rests on SPEC-A-PRAXIS.
