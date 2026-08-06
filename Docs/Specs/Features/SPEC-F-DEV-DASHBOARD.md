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
built_by:
  - PHASE-005
last_amended: PHASE-005
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
- Rule: Work page shows `WORK.yaml`; Signals shows derived health only

## Boundaries

Does not fire commands or edit artifacts from the UI (V1).

## Dependencies

Rests on SPEC-A-DEVSYSTEM for process files and schemas.
