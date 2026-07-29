---
title: Evaluation — secure comparison-first grading
type: area-spec
status: active
updated: 2026-07-29
---

# Evaluation — secure comparison-first grading

## Trust boundary

The browser never sends or receives authored answer sets, `correctIndex`, source text that reveals
the answer, or server grading thresholds. It sends only:

```ts
type BrowserEvaluationRequest = {
  sourceType: 'lesson' | 'set';
  itemRef: string; // stable authored item/segment id
  modality: 'translate' | 'reading' | 'conversation';
  direction: 'es-en' | 'en-es';
  userInput: string;
};
```

In A2 the authenticated server accepts only `sourceType=lesson` + `modality=translate`, resolves an
active, non-deprecated vocab/sentence item, and owns its canonical answer, reviewed alternates,
tags, direction, and `contentVersion`. Set, reading, and conversation requests fail explicitly until
their roadmap waves. A3 adds the persisted practice-session reference and ownership check when that
table exists; A2 never accepts an unchecked session identifier. MC is graded server-side by submitted
choice index starting with the session/persistence loop; it never calls AI. Flashcards never call AI.

## Gate order

1. Normalize input and server-owned expected answers.
2. Exact match → correct, `evalSource=comparison`.
3. Risk-free typo-only near-match bands → correct/close with a bounded deterministic word diff.
4. Poor or meaning-uncertain match → one AI call through EvaluationService. A missing authored
   target is source-integrity failure for A2 lesson items, not permission to invent authority.
5. Validate the structured result, then return learner-safe feedback. A3 persists it.

AI judges the submitted answer; it does not generate scored source material at MVP. Curated set
targets are authored/reviewed under ADR-0015. Every result
uses the one GrammarTag/ErrorTag taxonomy from `@aidioma/lesson-schema`.

## Result

```ts
type EvaluationResult = {
  score: number;
  verdict: 'correct' | 'close' | 'wrong';
  feedback: string;
  wordDiff?: Array<{
    text: string;
    mark: 'correct' | 'close' | 'wrong' | 'missing' | 'extra';
    suggestion?: string;
  }>;
  errorTags: GrammarTag[];
  evalSource: 'comparison' | 'ai';
  modelUsed?: string;
};

type EvaluationResponse = EvaluationResult & {
  requestId: string; // HTTP correlation only; A3 adds the persisted evaluationId
};
```

Any non-empty typed attempt receives the approved credit-for-trying floor. MC uses authored
explanation after the choice; typed modes use mode-smart help from the module spec.

## Failure behavior

- Invalid request/auth/item → explicit 4xx; never grade. Unknown request fields are rejected so a
  browser cannot smuggle answers, thresholds, tags, model choices, or `correctIndex` across the boundary.
- AI timeout/provider/schema failure after comparison misses → retryable **ungraded** response;
  preserve input for retry and do not fabricate a score, verdict, tags, or feedback.
- Comparison success stands even if the AI provider is unavailable.
- The app applies a bounded per-user, per-instance request/concurrency/duplicate-work guard. A
  distributed Gateway user quota or staged WAF rule is still required before production promotion;
  an in-memory serverless guard is defense in depth, not the perimeter control.
- Record latency, path (comparison/AI), provider/model, failure class, and token/cost metadata;
  never log secrets or full private conversation history by default.

## Persistence

A2 is deliberately stateless: it returns a correlation `requestId`, not a fake database ID. A3 adds
`practice_sessions`, session ownership, and one `evaluations` row per graded submission; there is no
evaluation cache table (ADR-0006). Exact future DB fields live in `data-model.md`.
