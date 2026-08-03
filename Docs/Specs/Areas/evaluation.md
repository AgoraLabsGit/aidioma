---
title: Evaluation — secure comparison-first grading
type: area-spec
status: active
updated: 2026-08-03
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
  inputMode?: 'typed' | 'voice'; // added in A10; provenance only, never answer authority
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

## Voice and conversation boundary

- A10 transcription fills the existing editable composer. It is not an evaluation; only Send
  submits the visible transcript to this contract. `inputMode=voice` supports quality telemetry but
  cannot select a provider, alter thresholds, or claim pronunciation evidence.
- Authored spoken answers use this same gate order and persistence. A transcription/provider failure
  returns retryable voice UI state and never creates a fabricated grade.
- A12 constrained dialogue separates generated conversation from authority. Turns with an authored
  target may call `EvaluationService`; otherwise `ConversationFeedbackService` returns structured,
  non-credit coaching for the recap and cannot advance lesson/set progress.
- A speech or dialogue model's own correction is never authoritative. Phoneme-level pronunciation
  assessment is outside this contract (PM-026).

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
- AI timeout/transient-provider/schema failure after comparison misses → retryable **ungraded**;
  deterministic upstream 4xx is non-retryable except 408/429. Preserve input and never fabricate
  a score, verdict, tags, or feedback. Practice offers retry only for retryable results; an ungraded
  attempt does not advance the queue, completed count, or score. Editing clears the failure, and
  results from superseded attempts or an ended/restarted session are ignored.
- Comparison success stands even if the AI provider is unavailable.
- After authentication and request validation, the app checks the Vercel Firewall SDK with the
  server-derived `usr_` hash, then applies the separate local per-instance burst/concurrency/
  duplicate-work guard before source resolution or AI. The Firewall fixed-window counter is
  per-region, not globally atomic; the local guard remains defense in depth.
- AI grading requires the dedicated evaluation Gateway key and sends the server-derived opaque ID
  as `providerOptions.gateway.user` for reporting and any account-supported per-user policy. The
  current Gateway rejects `quotaEntityId` as an invalid provider option, so it must not be sent.
  Missing/invalid perimeter configuration, key, or ID fails closed without an AI call. Per-user
  Gateway denial is claimed only after an account policy and a rejected over-quota Preview request
  are both evidenced.
- The evaluation key has one aggregate $1 monthly budget across Development, Preview, and
  Production, with 50/75/100% alerts. Gateway checks it at request start: the crossing/in-flight
  request can complete and overshoot, while later calls reject. It is a soft cap, not an absolute
  global ceiling. HTTP 402 budget exhaustion is recorded separately and returned as learner-safe,
  non-retryable ungraded state. The Preview Firewall rule is acceptance proof only. On `SHIP`, a
  Production-conditioned equivalent must be active before the released endpoint is accepted;
  OI-036 closes only after Production 429/event and budget receipts pass.
- Record latency, path (comparison/AI), provider/model, failure class, bounded HTTP status, and
  token/cost metadata; never log provider bodies/codes, secrets, or private conversation history.

## Persistence

A2 is deliberately stateless: it returns a correlation `requestId`, not a fake database ID. A3 adds
`practice_sessions`, session ownership, and one `evaluations` row per graded submission; there is no
evaluation cache table (ADR-0006). Exact future DB fields live in `data-model.md`.
