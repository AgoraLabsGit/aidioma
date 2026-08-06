---
id: SPEC-A-CONTENT
kind: area
title: Content and curriculum
status: active
superseded_by: null
vendor: null
decisions: []
built_by: []
last_amended: null
research: []
paths:
  - content/**
---

# Content and curriculum

## Purpose

Authored lessons, lexicon material, and content pipelines that feed the learner app.

## Behavior

- Rule: Curriculum source of truth is under `content/`
- Failure mode: Missing content → practice/features degrade or empty

## Boundaries

App runtime rendering is SPEC-A-LEARNER. Generation tooling may touch both.

## Vendor

null
