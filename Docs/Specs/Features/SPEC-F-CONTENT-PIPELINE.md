---
id: SPEC-F-CONTENT-PIPELINE
kind: feature
title: "Dialect-aware content pipeline"
status: active
superseded_by: null
depends_on:
  - "SPEC-A-CONTENT"
decisions: []
built_by: []
last_amended: 2026-08-26
research: []
paths:
  - "content/**"
  - "tooling/content/**"
  - "packages/lesson-schema/**"
---

# Dialect-aware content pipeline

## Purpose

Turn structured learning objectives into publishable lessons, practice collections, answer sets, and translation support with repeatable quality gates.

## Behavior

- Rule: Every content unit declares CEFR level, concepts, topical tags, canonical meaning, source language, target language, and supported Spanish dialect profiles. The generation pipeline produces a shared semantic unit plus explicit es-AR, es-419, and es-ES renderings where wording or grammar differs; identical renderings may reference the shared form. Each rendering has one canonical line and accepted alternatives that are not duplicates of that line. Lesson sentence items include exactly three authored hints that can start a production attempt without revealing the full canonical answer on first use. Deterministic schema, coverage, duplicate, and answer checks run before independent AI adversarial reviews for linguistic accuracy, level fit, dialect consistency, ambiguity, and unsafe content. Only versioned promoted artifacts can serve learners.
- Rule: A promoted lesson names one versioned rich lesson artifact and an ordered finite flow of references to its teaching, support, examples, passage material, and typed sentence checks. Placement does not copy canonical Spanish, accepted answers, hints, concepts, or dialect renderings. Missing references, stale versions, unsupported dialects, missing reviews, or absent promotion evidence fail publication and serving. Multiple-choice items may exist in the artifact but are not a promoted scored step.
- Rule: Each promoted lesson artifact includes a practice-ready typed-sentence pool of at least 25 unique prompts, scaled by CEFR (A1 ≥25, A2 ≥35, B1 ≥50). The finite lesson flow still scores only a short authored subset. Practice collections assembled from those items must also meet the same unique-prompt floor for their CEFR. A Practice session may continue past that floor by re-serving weak, due, or unseen items in scope, and ends no later than 100 offers. Do not author 100 unique items just to fill the session cap.

## Boundaries

- "AI may propose and critique content but cannot publish directly"
- "Dialect profiles are structured content dimensions rather than free-text prompt instructions"
- "A runtime contextual answer is session help, not promoted content, an accepted answer, or a reusable curriculum artifact"
- "Runtime translation lookups remain personal records until separately promoted as curriculum content"

## Dependencies

- "SPEC-A-CONTENT"
