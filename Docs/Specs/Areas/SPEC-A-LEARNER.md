---
id: SPEC-A-LEARNER
kind: area
title: Learner application
status: active
superseded_by: null
vendor: null
decisions: []
built_by: []
last_amended: null
research: []
paths:
  - apps/web/**
---

# Learner application

## Purpose

Runtime substrate for the learner-facing web app (UI, session, client routes).

## Behavior

- Rule: Learner product code lives under `apps/web/`
- Failure mode: App down → practice and related features unavailable

## Boundaries

Authored curriculum content is SPEC-A-CONTENT. Dev dashboard is SPEC-A-DEVSYSTEM.

## Vendor

null
