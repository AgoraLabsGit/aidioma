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
last_amended: 2026-08-25
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

## Boundaries

- "AI may propose and critique content but cannot publish directly"
- "Dialect profiles are structured content dimensions rather than free-text prompt instructions"
- "A runtime contextual answer is session help, not promoted content, an accepted answer, or a reusable curriculum artifact"
- "Runtime translation lookups remain personal records until separately promoted as curriculum content"

## Dependencies

- "SPEC-A-CONTENT"
