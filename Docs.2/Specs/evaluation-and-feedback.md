---
id: EVALUATION-001
title: Evaluation and learner feedback
area: evaluation
status: draft
implementation: mixed
founder_review: required
updated: 2026-08-03
---

# Evaluation and learner feedback

This migration dossier consolidates proven evaluation behavior and feedback candidates. It is a
founder-approved temporary exception to normal spec creation timing, remains `status: draft`, and
does not approve new scoring, mastery, persistence, or AI authority. `legacy-accepted` preserves a
prior decision pending migration disposition; `accepted` is reserved for current founder approval.

## Outcome

Interpret learner answers securely and consistently, then give concise feedback that helps the next
attempt while preserving uncertainty, learner input, and the boundary between a verdict and learning.

## Non-goals

- Using one response, score, or AI judgment as proof of mastery.
- Letting the browser provide answer keys, thresholds, grammar scope, or model choice.
- Grading flashcard reveals or unstructured conversation as if they were authored checks.
- Restoring legacy punitive hint penalties, XP, grades, or dual scoring systems.
- Defining scheduling consequences beyond a normalized result consumed by the serving engine.

## Claim status

### Implemented

- The production `/api/evaluate` backend accepts lesson-translation source identity, direction,
  modality, and learner input; it resolves authority server-side. No current learner UI calls it.
- That backend grades exact reviewed answers by deterministic comparison before any AI call and sends
  meaning-uncertain answers through a structured server-side AI path.
- The Practice prototype reuses `EvaluationService` through a separate fixture-backed local endpoint;
  it is not the production authenticated set-source integration.
- Results use `correct`, `close`, or `wrong`, with score, feedback, optional word diff, and error tags.
- English output may be accepted by a mechanical rule when exactly one insertion or deletion occurs
  in one token of at least four characters and explicit number/negation guards do not fire. This rule
  does not prove that meaning is unchanged.
- Ungraded failures preserve the answer and prompt, do not advance counts, and distinguish retryability.
- Practice presents `Correct`, `Almost`, or `Keep working` and one correction surface.

### Legacy-accepted in earlier records, pending migration disposition

- Feedback should address the learner directly, identify one material improvement, and avoid irrelevant
  punctuation, dialect, optional-article, or style corrections.
- The browser must never receive authored answer sets or evaluator secrets.
- Comparison success stands when the AI provider is unavailable; no failure fabricates a grade.
- A collection evaluation never grants lesson completion or mastery.

### Candidate

- Apply one common learner-facing feedback contract across Practice and Lessons.
- Treat communicative success and demonstration of the requested form as separable evaluation concerns.
- Normalize evaluation facts for serving and progress without forcing unlike activities into one score.
- Record support/reveal/retry facts when persistence exists, without automatically penalizing the learner.
- Allow optional target-specific findings only for targets explicitly allowlisted by the exact
  resolved source/context map and requested skill. A whole-prompt verdict never marks every mapped
  word demonstrated or missed, and a revealed target cannot receive independent-production credit.

### Research

- Durable claims require delayed, varied, unassisted evidence; evaluation creates an observation, not mastery.
- Recognition and production tasks measure different constructs and should not be pooled without validation.
- Accepted-answer breadth is both a learner-fairness and AI-cost control.

### Conflicting or superseded

- The old area spec says character-near answers become `close`; current code accepts a narrowly defined
  English insertion/omission as correct.
- The Lesson prototype always says “Review the model answer,” unlike the refined Practice feedback.
- Legacy documents prescribe severe 1–10 scoring and hint deductions; current product principles reject
  punitive or misleading score systems.
- Current contracts contain internal numeric scores although Practice intentionally hides per-answer numbers.
- The Practice client imports fixture records containing accepted-answer groups, and its response
  contract includes `modelAnswer` and optional `modelUsed`. That prototype therefore conflicts with
  the server-only answer-authority and internal-metadata target.
- The intermediate Lesson pilot performs its own local exact comparison, the A1 preview does not
  grade, and no Lesson UI consumes the production evaluation endpoint.
- `EvaluationServiceSource` currently imports a lesson-resolver type, so the shared service boundary
  is structurally lesson-coupled even though the Practice prototype passes a compatible object.

## Evaluation boundary

1. Validate authentication, request shape, source identity, and admitted modality.
2. Resolve the active content version, authoritative answers, direction, and assessment goal server-side.
3. Normalize and compare against reviewed answers.
4. Return deterministic correct/close only where the rule is semantically safe.
5. Send uncertain cases to one structured AI evaluator.
6. Validate and project the result into learner-safe feedback.
7. Return explicit ungraded failure when authority or grading is unavailable.

## Feedback contract

- Correct feedback is a compact acknowledgement without a redundant numeric score.
- Almost/Keep working gives at most one concise, actionable coaching point.
- A focused correction uses a before/after token pair; a semantic mismatch uses one complete reference answer.
- The two correction surfaces are mutually exclusive.
- Feedback never repeats the full correction in explanatory copy.
- Error tags, model metadata, score thresholds, and evidence bookkeeping remain internal.
- Learner input remains visible in the conversation.

## Reuse boundaries

- A source-neutral resolved-authority contract should sit between evaluation and source adapters.
- Lesson and Practice adapters may reuse one service/result family only after both real source paths
  satisfy that contract; current Lesson UI does not yet do so.
- Activity adapters may have specialized results; multiple choice and flashcards do not need AI translation grading.
- UI feedback components consume learner-safe projections, never answer authority.
- Serving consumes verdict/support facts; Progress consumes persisted evidence only after its policy is approved.
- Assistance arrives as trusted application context separate from learner text. It may change the
  normalized scheduling command without changing the immediate whole-answer feedback verdict.

## Migrated evidence

| Evidence | Use in this draft |
|---|---|
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/Areas/evaluation.md` | Trust boundary, comparison-first pipeline, failure behavior |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Prototypes/intermediate-learning-pilot.md` | Refined learner-feedback observations |
| `apps/web/src/lib/evaluation/comparison.ts` | Current deterministic rules |
| `apps/web/src/lib/evaluation/evaluation-service.ts` | Current comparison/AI orchestration |
| `apps/web/src/components/practice-workspace.tsx` | Current feedback and failure UI |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Archive/Legacy/Aidioma-docs-v1/04-learning-system/scoring-system.md` | Superseded scoring evidence only |

## Draft acceptance criteria

- Tests prove the browser cannot submit or receive answer authority or evaluator configuration.
- Exact, close, semantic-review, AI-graded, invalid, retryable-ungraded, and nonretryable-ungraded paths are explicit.
- Meaning-bearing negation, number, omission, and substitution changes cannot pass through typo tolerance.
- Feedback renders one correction, preserves learner input, and remains understandable without color.
- Stale results cannot update an abandoned answer, ended visit, or restarted configuration.
- Lesson and Practice use the approved feedback vocabulary without forcing identical page composition.
- No evaluation result alone is labeled mastery or durable proficiency.
- Any target-specific finding identifies the exact allowlisted occurrence and requested skill;
  revealed targets and overall correctness cannot fabricate word-level evidence.

## Open questions

1. Retain the current English-only insertion/omission tolerance as `correct`?
2. Should communicative success and requested-form success be two internal fields or one structured rationale?
3. Which per-answer numeric scores, if any, should remain in domain contracts versus provider adapters?
4. Should a close/wrong response allow an immediate retry before the serving engine requeues it?
5. What support facts must be persisted for fair later interpretation?
6. Which Lesson activity types share this contract, and which require specialized evaluators?

## Decisions and discovered issues

### Decisions

| ID | Classification | Decision | Migration disposition |
|---|---|---|---|
| EVALUATION-D001 | implemented | Production lesson translation is comparison-first and server-authoritative. | retain current truth |
| EVALUATION-D002 | legacy-accepted | Use one concise learner-facing correction surface. | pending founder disposition |
| EVALUATION-D003 | legacy-accepted | Treat evaluation as an observation, never mastery by itself. | pending founder disposition |

### Canonical work and fix references

- `EVALUATION-FIX-001` — diagnose local non-exact-answer grading availability.
- `EVALUATION-001` — plan the source-neutral authority contract, production Practice source path,
  safe browser projection, and cross-surface feedback semantics.
- `LESSON-REVIEW-SURFACE-001` — connect the canonical Lesson surface to approved evaluation and feedback.
