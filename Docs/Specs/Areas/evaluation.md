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
3. Character-near substitutions → deterministic `close` with a bounded word diff; comparison
   returns `correct` only for a normalized exact authored match.
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
- After authentication and request validation, the app checks the Vercel Firewall SDK with the
  server-derived `usr_` hash, then applies the separate local per-instance burst/concurrency/
  duplicate-work guard before source resolution or AI. The Firewall fixed-window counter is
  per-region, not globally atomic; the local guard remains defense in depth.
- AI grading requires the dedicated evaluation Gateway key and the same opaque user attribution.
  Missing/invalid perimeter configuration, key, or user fails closed without an AI call. This
  account exposes no enforceable per-user Gateway budget, so `providerOptions.gateway.user` is
  attribution, not a per-user denial control.
- The evaluation key has one aggregate $1 monthly budget across Development, Preview, and
  Production, with 50/75/100% alerts. Gateway checks it at request start: the crossing/in-flight
  request can complete and overshoot, while later calls reject. It is a soft cap, not an absolute
  global ceiling. The Preview Firewall draft must be published and proven before OI-036 closes.
- Record latency, path (comparison/AI), provider/model, failure class, and token/cost metadata;
  never log secrets or full private conversation history by default.

## Persistence

A2 is deliberately stateless: it returns a correlation `requestId`, not a fake database ID. A3 adds
`practice_sessions`, session ownership, and one `evaluations` row per graded submission; there is no
evaluation cache table (ADR-0006). Exact future DB fields live in `data-model.md`.
