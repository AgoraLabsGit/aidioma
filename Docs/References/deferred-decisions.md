# Deferred decisions — non-authoritative reference

This file preserves unresolved facts discovered during the 2026-08-03 documentation reset. It is
not a roadmap, implementation plan, or product specification. Revalidate every item against the
current application, dependencies, content, and founder direction before acting on it.

## C2 lesson work and P-007

The last recorded C2 state said `a1-05` was locally clean at L1 but not L2-approved. It contained 15
vocabulary rows, 18 sentences, six passage segments, four quick checks, and one 0–30 reference card.
Independent review had one remaining major blocker: the then-current Style Guide required 31 graded
number members, while representing the full lesson would require 38 raw vocabulary rows against the
frozen 15-row schema ceiling.

P-007 was only proposed: widen the raw vocabulary ceiling while keeping an 8–15 conceptual-load
ceiling in validation and adding boundary fixtures. No schema change was authorized by that record.
Before resuming the lesson, reconcile the current content and executable schema, make a fresh product
decision about whether all numbers need separately graded records, then repeat independent L2 review.
Historical evidence: [C2 handoff](../Archive/Handoffs/020-2026-07-30-c2-a1-05-p007-block.md) and
[C2 wave record](../Archive/Waves/C2-1-draft-launch-lessons.md).

## Operational and future-architecture triggers

- **OI-026 — dependency advisories.** Recheck production and development advisories when patched
  upstream releases become available and before a production release. Do not force incompatible
  overrides, downgrades, or unsupported fixes.
- **OI-034 — Clerk live keys.** Before inviting real users, promote Production from the test-class
  Clerk key pair to a matching live-class pair and repeat the authentication smoke without exposing
  or committing values.
- **OI-038 — Workflow revalidation.** If generated-set work opens, revalidate the dated Workflow
  audit against then-current stable packages, Next.js/Node/compiler behavior, Clerk ownership,
  deployment region, retention, encryption, and cost. Prove a real Preview run; do not infer Eve or
  `@workflow/ai` adoption.
- **OI-039 — generated-set job lifecycle.** If implemented, Neon remains the ownership authority.
  Owner-check start, status, review, and cancel operations, and prove queued, running,
  awaiting-review, approved, failed, cancelled, abandoned, regenerated, and deleted outcomes.
  Workflow history is operational evidence, not application authority.
- **OI-040 — Eve.** Reconsider Eve only if a concrete durable, multi-turn, tool-using tutor requires
  it. Any adoption needs a new ADR covering runtime fit, Clerk ownership, transcript authority,
  retention/deletion, latency, cost, and evaluation evidence. It is excluded from grading, ordinary
  sessions, and real-time audio by the current ADR.

The complete former register, including dated A2R findings, remains at
[open-items.md](../Archive/Registers/open-items.md). Its rows were not promoted wholesale; verify the
live code and current release state before treating any historical status as open work.

## Legacy prototype removal trigger

`apps/prototype/` and `tooling/prototype/` may be removed only after exact-path review proves they are
not required by package scripts, tests, CI, documentation that will remain current, or the localhost
product, and after `apps/web/` demonstrably covers the prototype states still worth preserving. The
old A4-2 milestone name is not itself proof that the trigger fired.

## Page decisions requiring live revalidation

The archived broad module spec contains the following potentially useful decisions. None becomes
current product truth until it has been checked in the live application and then recorded in the
appropriate page or engine spec:

- Home owns Continue, a compact path and useful summary; Lessons owns the level-based catalog.
- Home may expose `Review · N due`; its empty behavior must be deliberate.
- First-run numbers are truthful zeros. Path/catalog status vocabulary is limited to `done`,
  `current`, and `locked`, separate from learning outcomes such as Completed and Mastered.
- Lesson detail is driven by real lesson content rather than a hard-coded showcase.
- Settings may include a goal, Auto/Light/Dark theme, and reset behavior; reminder controls and the
  exact goal interaction need fresh review.
- Help remains activity-aware: multiple choice may explain after an answer; typed word practice may
  offer one useful cue; sentence/story practice may offer Reveal and requeue plus Ask Tutor. The old
  credit-for-trying score floor also needs evaluation against current learner-facing verdicts.
- Ask Tutor and saving eligible individual words or phrases need clear learner jobs and persistence
  boundaries before they enter a current spec.
- A daily-goal marker, first-run path, responsive shell, visual density, and navigation behavior must
  be proved on the current phone and desktop application rather than inherited from the old
  `apps/prototype/` visual baseline.

Historical source: [module spec](../Archive/Specs/Features/module-spec.md). Current Practice behavior
and feedback decisions live in the [intermediate pilot](../Prototypes/intermediate-learning-pilot.md).
