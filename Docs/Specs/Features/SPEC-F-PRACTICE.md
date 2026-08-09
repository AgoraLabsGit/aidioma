---
id: SPEC-F-PRACTICE
kind: feature
title: Practice
status: active
superseded_by: null
depends_on:
  - SPEC-A-LEARNER
decisions: []
built_by: []
last_amended: PHASE-008
research: []
paths:
  - apps/web/src/components/practice-workspace.tsx
  - apps/web/app/**/practice/**
---

# Practice

## Purpose

Lets a learner run scored practice attempts in the web app’s practice workspace.

## Behavior

- Rule: A scored practice attempt starts only from a route under `apps/web/app/**/practice/**`

## Boundaries

Does not own lexicon browse (SPEC-F-LEXICON) or durable progress storage (SPEC-F-PROGRESS).
This stub demonstrates the Feature mold (D-028); fuller product map is later product-design work.

## Dependencies

Needs SPEC-A-LEARNER for UI, session, and client routes.
