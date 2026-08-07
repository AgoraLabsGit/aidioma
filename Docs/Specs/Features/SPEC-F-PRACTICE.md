---
id: SPEC-F-PRACTICE
kind: feature
title: Practice
status: active
superseded_by: null
depends_on:
  - SPEC-A-LEARNER
decisions: []
built_by: []
last_amended: null
research: []
paths:
  - apps/web/src/components/practice-workspace.tsx
  - apps/web/app/**/practice/**
---

# Practice

## Purpose

Learner practices target language through the practice workspace.

## Behavior

- Rule: Practice UI is the primary learning surface in the web app

## Boundaries

Lexicon directory and progress systems are separate features.

## Dependencies

Rests on SPEC-A-LEARNER.
