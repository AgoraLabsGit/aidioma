---
id: SPEC-F-PRACTICE
kind: feature
title: Practice
status: active
superseded_by: null
depends_on:
  - "SPEC-A-LEARNER"
  - "SPEC-F-LEARNING-LOOP"
  - "SPEC-F-CONTEXTUAL-QUESTIONS"
decisions:
  - "D-016"
  - "D-017"
  - "D-021"
  - "D-025"
built_by:
  - PHASE-003
last_amended: 2026-08-26
research: []
paths:
  - "apps/web/src/app/practice/**"
  - "apps/web/src/app/api/practice/session/**"
  - "apps/web/src/components/practice-workspace.tsx"
  - "apps/web/src/lib/practice-serving/**"
---

# Practice

## Purpose

Run focused collection and saved-list production in the shared chat workspace, using the same cue, composer, feedback card, and serving policy as lessons.

## Behavior

- Rule: A scored Practice attempt is English cue → typed Spanish inside a learner-chosen collection or saved list. The SPEC-F-LEARNING-LOOP feedback card follows (verdict, one material issue, canonical Spanish, Save), then a separate next cue with an explainable reason. Authored hints appear only when the promoted item has them. Ask AIdioma follows SPEC-F-CONTEXTUAL-QUESTIONS. Equivalent and regional-alternative answers still grade as correct unless an assessment goal requires the canonical form.
- Rule: Serving stays inside the chosen source. Unresolved misses retry before the policy moves on. Save and Ask AIdioma do not grant mastery. Assisted pre-answer help cannot raise mastery.

## Boundaries

- "No extra scored modalities, generated hints, suggested replies, speech, or unrestricted tutor"
- "Lesson finite order and catalog placement belong to SPEC-F-LEARNING-LOOP and SPEC-A-CONTENT"
- "Lexicon browse belongs to SPEC-F-LEXICON"

## Dependencies

- "SPEC-A-LEARNER"
- "SPEC-F-LEARNING-LOOP"
- "SPEC-F-CONTEXTUAL-QUESTIONS"
