---
id: SPEC-A-LEARNER
kind: area
title: "Learner experience"
status: active
superseded_by: null
vendor: null
decisions: []
built_by: []
last_amended: null
research: []
paths:
  - "apps/web/**"
---

# Learner experience

## Purpose

Own the simple end-to-end learner journey, shared chat interaction pattern, account preferences, and durable personal learning state.

## Behavior

- Rule: Lessons, practice, saved material, and translation share one message-feed and typed-composer interaction. One account-level Spanish dialect profile controls teaching copy, expected answers, examples, and translation display. Learner state records concept and item evidence once, without duplicating knowledge by translation direction.
- Failure mode: If personal state or a service is unavailable, the app fails honestly and never fabricates progress, saved material, or grading.

## Boundaries

- "Curriculum artifacts and generation pipelines belong to SPEC-A-CONTENT"
- "Process dashboards and Praxis state are not learner product surfaces"
- "Navigation exposes only Lessons, Practice, Saved, Translate, and Settings for MVP"

