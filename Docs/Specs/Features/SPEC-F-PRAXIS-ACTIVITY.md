---
id: SPEC-F-PRAXIS-ACTIVITY
kind: feature
title: Praxis Activity page
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
  - .work/activity/**
---

# Praxis Activity page

## Purpose

Activity page lists process/ops journal events only (D-023).

## Behavior

- Rule: Activity page lists process/ops allowlist only (D-023): default `handoff`/`close`/`check`/`ship`; optional chips `launch`/`dashboard`/`status`/`triage`/`system`; no outcome-type rows or chips
- Rule: Activity Status / Feature / Area join `WORK.yaml` when `ref` is a Work id (ledger SSOT); when `ref` or `phase` is a Phase id and that phase is `closed`/`canceled`, Status shows `done` (stale mid-close `active` with `ref: null` must not stick); phase-linked Feature/Area still use phase tags
- Rule: Activity copies `ts type ref` (no durable event id)
- Rule: Age (and Activity time) columns default to newest-first on first click; second click toggles

## Boundaries

Does not list outcome-type events (`fix`/`task`/`build`/…). Full journal remains on disk.

## Dependencies

Rests on SPEC-A-PRAXIS.
