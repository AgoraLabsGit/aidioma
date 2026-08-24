---
id: SPEC-F-LEARNING-LOOP
kind: feature
title: "Adaptive learning loop"
status: active
superseded_by: null
depends_on:
  - "SPEC-A-LEARNER"
  - "SPEC-A-CONTENT"
decisions: []
built_by: []
last_amended: null
research: []
paths:
  - "apps/web/src/app/**"
  - "apps/web/src/components/**"
  - "apps/web/src/lib/**"
---

# Adaptive learning loop

## Purpose

Give learners one calm chat-based path through lessons, focused practice, saved material, and translation while practice adapts within the learner selected level and focus.

## Behavior

- Rule: All assessed MVP practice uses an English cue and a typed Spanish response. The learner chooses a lesson, collection, saved list, or recommended review; the serving policy prioritizes weak, due, and not-yet-seen material only inside that eligible scope. Lessons are finite teaching arcs from A1 through C1. Collections group core concepts or practical topics. Translation accepts English or Spanish, returns the other language in the active dialect profile, and can save the bilingual pair without treating a lookup as mastery. Every learning surface uses the existing practice chat pattern.

## Boundaries

- "No practice direction selector or separate mastery score by direction"
- "No multiple choice, flashcards, speech grading, games, or open-ended AI tutor in MVP"
- "No generated lesson or translation becomes learner-visible before pipeline validation and adversarial review"

## Dependencies

- "SPEC-A-LEARNER"
- "SPEC-A-CONTENT"
