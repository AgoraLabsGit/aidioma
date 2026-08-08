---
id: SPEC-A-LEARNER
kind: area
title: Learner application
status: active
superseded_by: null
vendor: null
decisions: []
built_by: []
last_amended: PHASE-008
research:
  - R-004
paths:
  - apps/web/**
---

# Learner application

## Purpose

Runtime substrate for the learner-facing web app: UI, session, and client routes that features compose.

## Behavior

- Rule: Learner product code that ships to end users lives under `apps/web/` (not under `Docs/System/dashboard`)
- Failure mode: When the web app is down or cannot boot, Practice and other learner features are unavailable

## Boundaries

Authored curriculum content is SPEC-A-CONTENT. Praxis dashboard / process tooling is SPEC-A-PRAXIS.
This stub demonstrates the Area mold (D-028).

## Vendor

null
