---
id: PRODUCT-001
title: AIdioma product principles
area: product
status: draft
implementation: mixed
founder_review: required
updated: 2026-08-03
---

# AIdioma product principles

This migration dossier is not product authority. `legacy-accepted` means a decision was accepted in
the pre-reset documentation and remains preserved pending an explicit migration disposition.
`accepted` is reserved for a decision the founder approves in the new SSOT; this draft contains no
such approval by implication.

## Product promise

AIdioma helps learners build usable Spanish through clear teaching, repeated meaningful retrieval,
honest feedback, and understandable progress. The application should feel simple even when its
learning and serving systems are sophisticated.

## Durable principles proposed for approval

- Teach before expecting unsupported performance.
- Prefer useful retrieval and communication over content volume or engagement theater.
- Give concise, direct feedback about the material difference that matters.
- Never present a score, streak, completion state, or visual meter as mastery without supporting
  evidence.
- Lessons make a finite teaching promise; Practice collections make an ongoing retrieval promise.
- Reuse executable contracts, services, and proven interaction patterns across surfaces while
  preserving the distinct progression semantics of Lessons and Practice. Do not require a shared
  abstraction until a real second consumer proves it.
- Keep learner choices meaningful. Engine policies and internal content metadata are not Settings.
- Keep learner-visible interactions clear, accessible, responsive, and recoverable after failure.
- Treat authored/reviewed content and server-resolved answers as authority. Runtime AI may judge an
  uncertain response but must not invent scoring authority.
- Prefer a small composable system with explicit boundaries over page-specific implementations.

## Legacy-accepted decisions awaiting migration disposition

These decisions are preserved; listing them here does not freshly approve, reject, or implement them.

- Launch scope is A1-first, with twelve A1 lessons once content and application gates pass; A2/B1
  authoring follows proof of the A1 loop.
- Curated reviewed Practice Sets are part of the typed MVP and remain distinct from private generated
  collections.
- Useful lesson reference cards are an MVP capability outside the graded lesson Mix arc.
- The Practice input may support asking AI questions as a distinct interaction from a graded answer.
- A shipping collection has at least 50 distinct reviewed learning units, with 100 as the target;
  direction and activity variants do not inflate that count.
- Typed Practice defaults to Both directions while permitting a learner override.
- Completed/Mastered, persisted sessions, streak semantics, and their prior lifecycle rules remain
  preserved but are explicitly reopened where the continuous-visit model conflicts with them.

## Claims requiring fresh founder disposition

- Which legacy-accepted decisions above are retained unchanged, revised, deferred, or rejected.
- Whether `Completed` and `Mastered` remain the learner-facing progression vocabulary.
- Which evidence may update durable knowledge without unlocking or completing a lesson.
- Whether Both remains the default learner-visible direction control.
- What explicit or implicit event completes a continuous Practice visit.
- Which research-backed scheduling and measurement guardrails become requirements now.

## Non-goals

- Punitive hint costs, XP manipulation, severe numeric grades, or fake automatic difficulty.
- Treating same-session correction, self-report, engagement, or streak as durable learning proof.
- Migrating historical proposals, panels, or ADR delivery plans as current implementation authority.

## Durable sources

- `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/Features/core-product-criteria.md`
- `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Prototypes/intermediate-learning-pilot.md`
- `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/ADRs/ADR-0003-lesson-load-lean-vocab-more-practice.md`
- `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/ADRs/ADR-0004-completed-vs-mastered.md`
- `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/ADRs/ADR-0005-direction-both-default.md`
- `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/ADRs/ADR-0008-a1-first-then-expand.md`
- `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/ADRs/ADR-0009-content-review-bar.md`
- `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/ADRs/ADR-0012-reference-cards-mvp.md`
- `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/ADRs/ADR-0015-curated-practice-sets-in-mvp.md`
- `apps/web/src/components/practice-workspace.tsx`
- `apps/web/src/components/intermediate-lesson-pilot.tsx`

## Canonical work references

- Serving-policy disposition: `PRACTICE-SERVING-001`
- Practice controls and learner journey: `PRACTICE-PAGE-001` / `PRACTICE-SETTINGS-001`
- Evaluation and feedback: `EVALUATION-001`
- Progress and evidence semantics: `PROGRESS-SAVED-001`
- Lessons and launch journey: `LESSONS-001`
- Curated/generated content boundary: `CONTENT-GENERATION-001`
