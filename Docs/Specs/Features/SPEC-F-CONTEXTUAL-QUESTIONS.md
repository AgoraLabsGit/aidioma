---
id: SPEC-F-CONTEXTUAL-QUESTIONS
kind: feature
title: "Contextual learner questions"
status: active
superseded_by: null
depends_on:
  - "SPEC-F-LEARNING-LOOP"
  - "SPEC-A-LEARNER"
  - "SPEC-A-CONTENT"
  - "SPEC-A-PLATFORM"
decisions:
  - "D-025"
built_by: []
last_amended: 2026-08-25
research: []
paths:
  - "apps/web/src/app/api/practice/session/**"
  - "apps/web/src/components/learning-workspace.tsx"
  - "apps/web/src/components/practice-workspace.tsx"
  - "apps/web/src/lib/contextual-help/**"
  - "apps/web/src/lib/learning-journey/**"
  - "apps/web/src/lib/practice-serving/**"
---

# Contextual learner questions

## Purpose

Let a learner ask the question that is blocking understanding at the moment it occurs, without
leaving the finite lesson or practice session and without turning AIdioma into an unrestricted
tutor or giving runtime AI authority over curriculum, grading, or progress.

## Learner experience

- Rule: An authenticated learner can choose **Ask AIdioma** from a teaching step, current cue,
  or feedback card. The shared composer clearly switches from answer intent to question intent;
  canceling or completing the question returns to the same lesson position and unanswered cue.
- Rule: The learner may ask a natural-language question about the current concept, wording,
  grammar, dialect difference, example, attempted answer, verdict, or correction. The response
  appears in the same message feed, is visibly identified as an AI explanation, stays concise for
  the learner's level, and uses the active Spanish profile for Spanish forms and examples.
- Rule: A contextual response may explain why a form is used, compare relevant forms, unpack a
  correction, or provide an additional example. It cannot submit or grade an attempt, add an
  accepted answer, change canonical text, unlock content, move lesson position, alter the next
  served item, or become promoted curriculum.
- Rule: Before the current scored cue has an attempt, Ask AIdioma does not reveal its canonical or
  accepted answers. A direct request for the answer returns the next unused authored hint. Any
  pre-answer contextual question marks the eventual attempt `assisted`; the learner may continue
  and complete the activity, but that attempt cannot increase mastery or satisfy independent
  recall. After feedback is visible, Ask AIdioma may discuss the canonical answer and correction.
- Rule: The contextual exchange is retained in display order with the learner's durable session so
  pause, reload, and resume restore it. It is not attempt evidence, a recommendation signal,
  analytics text, a content-pipeline input, or a promotion candidate.

## Context and model boundary

- Rule: The model request contains only the active promoted source identity and version, lesson or
  collection objective, current promoted item, active-profile rendering, relevant authored hints,
  current attempt and feedback when present, learner level, and Spanish profile. It does not send
  unrelated saved material, other sessions, account metadata, or broader learner history.
- Rule: The request explicitly distinguishes promoted source facts from runtime explanation. The
  response cannot mutate or extend promoted answers, content identity, evaluation policy, serving
  policy, lesson completion, or unlock state.
- Rule: Questions outside the active learning context receive a short redirect to the current
  topic. Unsafe requests and requests that cannot be answered reliably fail honestly rather than
  improvising course authority.

## Privacy, safety, and reliability

- Rule: Clerk identity is required. Requests are length-bounded, rate-bounded per learner,
  time-limited, abortable, and sent through the explicit AI Gateway credential required by D-024.
- Rule: Raw question and response text is stored only in the learner's session record needed for
  continuity. It must not appear in application logs, analytics payloads, error reports, retained
  proof, model telemetry configured by AIdioma, or content review artifacts. Retained browser proof
  may show only a scripted non-personal fixture exchange; it never captures a learner-authored
  production exchange or learner identifier.
- Failure mode: Missing auth, promoted context, session ownership, database, or Gateway access
  leaves the current lesson and cue unchanged and shows an honest retryable or unavailable state.
  No placeholder answer, progress mutation, or fabricated continuity is allowed.
- Failure mode: A stale or duplicate question request is idempotent and cannot append conflicting
  messages or consume the current answer action.

## Boundaries

- "No unrestricted free conversation, off-topic assistant, standalone tutor page, or background tutor agent"
- "No generated hints; direct-answer requests before an attempt use only the next promoted authored hint"
- "No mastery credit from asking, reading, or resuming a contextual answer"
- "No contextual response becomes canonical content, an accepted answer, or shared curriculum without the normal review and promotion pipeline"
- "No production learner question or response text in logs, analytics, close evidence, or screenshots; proof uses only a scripted non-personal fixture exchange"

## Dependencies

- "SPEC-F-LEARNING-LOOP"
- "SPEC-A-LEARNER"
- "SPEC-A-CONTENT"
- "SPEC-A-PLATFORM"
