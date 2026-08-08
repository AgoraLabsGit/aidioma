---
id: SPEC-F-PRAXIS-SIGNALS
kind: feature
title: Praxis Signals page
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
  - Docs/System/dashboard/public/app.js
  - Docs/System/derive/**
---

# Praxis Signals page

## Purpose

Signals shows derived health only; entry is the sidebar-foot control.

## Behavior

- Rule: Signals shows derived health only (drift, unspecified code, dead specs, stale research, contested specs, parse errors, blocked phases)
- Rule: Signals entry is the sidebar-foot status control (not a main-nav item)
- Rule: Do not mix Signals with Work triage — authored Work vs derived health stay separate

## Boundaries

Does not author Work rows. Most signals exist only because specs carry `paths`.

## Dependencies

Rests on SPEC-A-PRAXIS.
