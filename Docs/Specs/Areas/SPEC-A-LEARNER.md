---
id: SPEC-A-LEARNER
kind: area
title: "Learner experience"
status: active
superseded_by: null
vendor: null
decisions:
  - "D-025"
built_by:
  - PHASE-003
last_amended: 2026-08-25
research: []
paths:
  - "apps/web/**"
---

# Learner experience

## Purpose

Own the simple end-to-end learner journey, shared chat interaction pattern, account preferences, and durable personal learning state.

## Behavior

- Rule: Lessons, practice, saved material, and translation share one message-feed and typed-composer interaction. After a scored attempt the feed shows the SPEC-F-LEARNING-LOOP feedback card (verdict, one material issue, canonical Spanish, optional accepted-alternative note, Save), then a separate next cue. Authored hints may appear on the current cue when present. SPEC-F-CONTEXTUAL-QUESTIONS lets the learner ask an open-ended question about current teaching, a cue, or feedback and receive a bounded AI explanation without leaving or advancing the session. The exchange resumes with the session but never becomes independent mastery, recommendation, analytics-text, or curriculum evidence. One account-level Spanish dialect profile controls teaching copy, expected answers, examples, contextual explanations, and translation display. Learner state records concept and item evidence once, without duplicating knowledge by translation direction.
- Failure mode: If personal state or a service is unavailable, the app fails honestly and never fabricates progress, saved material, or grading.

## Boundaries

- "Curriculum artifacts and generation pipelines belong to SPEC-A-CONTENT"
- "Process dashboards and Praxis state are not learner product surfaces"
- "Navigation exposes only Lessons, Practice, Saved, Translate, and Settings for MVP"
