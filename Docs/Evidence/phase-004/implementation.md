# PHASE-004 implementation status

Date: 2026-08-25
State: implemented; real Clerk/Neon/Gateway proof and signed-in browser journey passed

## Learner journey implemented

- Lesson 1 now opens the finite **Living here** journey inside the existing Practice-style
  workspace and current application layout.
- The lesson resolves teaching, the active-dialect example, the typed check, and authored hints
  from one placement over the promoted `unit.a1.you-live-here@1` source.
- Ask AIdioma uses a bounded AI Gateway request and keeps contextual exchanges with the durable
  lesson checkpoint. Direct-answer requests before the first attempt receive an authored hint.
- A miss retains its correction; a correct retry completes idempotently and exposes the concept
  and topic review collections. The deterministic recommendation explains a correction-backed
  choice and starts the existing Practice session contract.
- Assisted attempts are retained but do not update item mastery. Contextual help cannot grade,
  change canonical answers, unlock content, or choose the next item.

## Deterministic proof run

- `npm run contract:smoke` — pass.
- `npm run content:validate` — pass; five pre-existing A1 lesson-authoring warnings, zero errors;
  promoted journey placement validation passed.
- `npm run app:typecheck` — pass, including Next route type generation.
- Full app ESLint with zero warnings — pass.
- Full app Vitest — 42 files / 288 tests passed.
- Integrated PHASE-004 focus — 9 files / 52 tests passed, including contextual safety, finite
  order, persistence, idempotency, unlock gating, recommendation handoff, UI interaction, and
  accessibility.
- Development migration `0003_lesson_journey.sql` — applied; three migrations current and drift
  assertion passed.
- Local runtime — `/lessons/1` returned 200; unsigned `/api/practice/session/lesson` returned 401
  with `authentication_required`, `Cache-Control: no-store`, and `X-Content-Type-Options: nosniff`.
- Development Clerk/Neon/AI Gateway journey proof — pass: two attempts, one bounded contextual
  exchange, two completion-gated collections, and lesson position retained across reload. The
  proof used a dedicated development-only Clerk user and printed neither learner identity nor
  contextual prompt/response text.
- Signed-in browser journey — pass: lesson start, authored hint, scripted contextual question,
  reload-retained exchange and position, miss and correction, corrected completion, two newly
  available collections, and the explainable recommended review all ran against the real local
  Clerk/Neon/Gateway path. Six identity-free captures and their hashes are retained in
  `browser-journey.md`.

## Work still required before close

- Formal candidate-bound `/check` and `/close` audits have not run. The phase remains active and
  no completion or publication claim is made.
