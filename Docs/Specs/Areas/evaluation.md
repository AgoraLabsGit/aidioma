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
  sessionId: string;
  sourceType: 'lesson' | 'set';
  itemRef: string; // stable authored item/segment id
  modality: 'translate' | 'reading' | 'conversation';
  direction: 'es-en' | 'en-es';
  userInput: string;
};
```

The authenticated server resolves the session-owned lesson item or set target, canonical answer + reviewed alternates, tags,
direction, and `contentVersion`. It rejects a missing/inactive item or a session owned by another
user. MC is graded server-side by submitted choice index and persists as modality
`multipleChoice`; it never calls AI. Flashcards never call AI.

## Gate order

1. Normalize input and server-owned expected answers.
2. Exact match → correct, `evalSource=comparison`.
3. Near-match bands → correct/close with deterministic word diff where possible.
4. Poor match or no authored answer → one AI call through EvaluationService.
5. Validate the structured result, persist it, then return learner-safe feedback.

AI judges the submitted answer; it does not generate scored source material at MVP. Curated set
targets are authored/reviewed under ADR-0015. Every result
uses the one GrammarTag/ErrorTag taxonomy from `@aidioma/lesson-schema`.

## Result

```ts
type EvaluationResult = {
  evaluationId: string;
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
```

Any non-empty typed attempt receives the approved credit-for-trying floor. MC uses authored
explanation after the choice; typed modes use mode-smart help from the module spec.

## Failure behavior

- Invalid request/auth/item → explicit 4xx; never grade.
- AI timeout/provider/schema failure after comparison misses → retryable **ungraded** response;
  preserve input for retry and do not fabricate a score, verdict, tags, or feedback.
- Comparison success stands even if the AI provider is unavailable.
- Record latency, path (comparison/AI), provider/model, failure class, and token/cost metadata;
  never log secrets or full private conversation history by default.

## Persistence

Every graded result writes one `evaluations` row linked to `practice_sessions`; no evaluation
cache table (ADR-0006). Exact DB fields live in `data-model.md`.
