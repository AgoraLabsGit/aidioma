---
id: SPEC-A-CONTENT
kind: area
title: Content and curriculum
status: active
superseded_by: null
vendor: null
decisions: [D-014]
built_by: []
last_amended: PHASE-005
research: [R-001]
paths:
  - content/**
---

# Content and curriculum

## Purpose

Authored lessons, lexicon material, and content pipelines that feed the learner app.

## Behavior

- Rule: Curriculum source of truth is under `content/`
- Rule: Downloadable Spanish dictionary seed for Lexicon authoring is Kaikki Wiktextract (D-014)
- Failure mode: Missing content → practice/features degrade or empty

## Boundaries

App runtime rendering is SPEC-A-LEARNER. Generation tooling may touch both.

## Vendor

null
