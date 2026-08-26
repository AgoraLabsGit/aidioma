---
id: SPEC-A-CONTENT
kind: area
title: "Learning content authority"
status: active
superseded_by: null
vendor: null
decisions:
  - "D-025"
built_by: []
last_amended: 2026-08-26
research: []
paths:
  - "content/**"
  - "tooling/content/**"
  - "packages/lesson-schema/**"
---

# Learning content authority

## Purpose

Own versioned curriculum, practice material, dialect renderings, answer policy, and the promotion receipts that make content safe to serve.

## Behavior

- Rule: The content authority stores reusable concepts and bilingual meaning units separately from lesson and collection placement. A unit can appear in many learning surfaces without duplication. A promoted lesson placement selects and orders items from one versioned rich lesson; it is not a second copy of canonical text. Every learner-visible artifact is traceable to a pipeline version, supported dialect profile, validation results, and promotion decision. Each dialect rendering has one canonical text plus distinct `equivalent` and `regional-alternative` accepted answers. Lesson sentence items include exactly three authored hints. Dialect practice units expose a hint control only when the promoted artifact carries authored hints. Runtime must not invent extra answers or hints. The learner catalog title, objective, exact CEFR, availability, and route come from the promoted lesson registry.
- Failure mode: Missing dialect coverage, ambiguous answers, failed adversarial review, or absent promotion evidence blocks publication instead of degrading silently.

## Boundaries

- "Learner interaction and personal progress belong to SPEC-A-LEARNER"
- "Runtime AI feedback and contextual explanations cannot silently rewrite canonical answers or become promoted curriculum"
- "Provider APIs are replaceable inputs and never the system of record"
