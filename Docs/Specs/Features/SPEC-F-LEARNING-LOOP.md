---
id: SPEC-F-LEARNING-LOOP
kind: feature
title: "Adaptive learning loop"
status: active
superseded_by: null
depends_on:
  - "SPEC-A-LEARNER"
  - "SPEC-A-CONTENT"
decisions:
  - "D-016"
  - "D-017"
  - "D-021"
  - "D-025"
built_by:
  - PHASE-003
last_amended: 2026-08-25
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
- Rule: After each scored attempt the same feed shows one feedback card, then a separate next cue. The card is: verdict (`correct`, `close`, or `needs work`); at most one English sentence naming the material issue; the canonical Spanish for the active dialect, with inline correction when the attempt missed that form; and a one-click Save. Feedback never appends the next prompt.
- Rule: Canonical rendering is the preferred form. `equivalent` and `regional-alternative` accepted answers still grade as correct unless an assessment goal requires the canonical form. When the attempt matched an accepted non-canonical form, the card says so and may show the more common canonical line. Runtime AI may explain an unexpected answer; it cannot invent extra accepted answers or replace the promoted canonical text.
- Rule: Hint is an optional control on the current cue, before submit. It reveals the next unused authored hint for that item. Hints may be a starter fragment; the first hint must not dump the canonical answer. Using a hint does not count as knowing the item. If the item has no authored hints, the control is absent — never generate a hint.
- Rule: SPEC-F-CONTEXTUAL-QUESTIONS adds Ask AIdioma to the same feed and composer. Questions stay bounded to the active learning context, do not advance or grade the session, and are retained only for session continuity. Asking before a scored answer marks the eventual attempt assisted so it cannot increase mastery; direct-answer requests receive only the next authored hint.

## Boundaries

- "No practice direction selector or separate mastery score by direction"
- "No multiple choice, flashcards, speech grading, games, unrestricted free conversation, or standalone tutor mode in MVP"
- "No generated lesson or translation becomes learner-visible before pipeline validation and adversarial review"
- "No runtime-generated hints, suggested replies, word-tap translation, or spoken playback in MVP"
- "No session control to skip or defer a concept in MVP; serving stays inside the chosen source and deterministic policy"

## Dependencies

- "SPEC-A-LEARNER"
- "SPEC-A-CONTENT"
