# Handoff 025 — documentation reset, then grounded Practice specs

**Date:** 2026-08-03  
**Worktree:** `/Users/mike/Documents/Coding/Projects/AIdioma/.worktrees/learning-design`  
**Branch:** `design/learning-system-proposal`

## Goal

Create one quiet, current `Docs/` workspace while preserving valuable product, content, evaluation,
and platform knowledge. Then keep refining the live Practice experience and write only the specs
that the implemented application has earned.

The target is not more documentation. It is a small, obvious set of active documents, with useful
technical history available as reference and stale material out of the way.

## Non-negotiable working rule

Specs must stay behind or alongside the live product—not ahead of it. Every new page or engine spec
must describe a behavior that has been tested in the localhost application, or explicitly identify a
small unresolved decision to test next. Do not turn speculative architecture into product truth.

Use this format for future specs:

1. What the learner sees
2. What must be true
3. What it must not do
4. How it is proved in the live prototype

## Immediate cleanup procedure

Start with a **read-only retention map**. Do not delete, reset, or bulk-move any file until the
founder has approved the map.

Classify every document and repository artifact as exactly one of:

- **Active** — current, edited during ongoing design/build work.
- **Technical reference** — valuable, retained, but not allowed to override newer active design.
- **Archive** — historical evidence; move it out of the active path only after approval.
- **Delete candidate** — obvious generated or duplicate noise; list exact paths and why before any
  removal.

When approval arrives, make archival moves in a separate, reversible change. Use Git history as the
record; do not use destructive resets. Keep the content and executable contracts intact.

## Active documentation spine

Keep this working set small and easy to find:

- `Docs/INDEX.md` — simplify it to map only active sources and the technical-reference shelf.
- `Docs/Specs/Features/core-product-criteria.md` — plain-language decision filter for every feature.
- `Docs/Prototypes/intermediate-learning-pilot.md` — living record of accepted Practice design
  decisions and explicit prototype boundaries.
- The current **Practice Page UI/UX spec** — create only after the cleanup map is approved.
- The current **Practice-serving engine spec** — create only after its live behavior is finalized.
- The current handoff — latest numbered handoff only needs to be prominent.

## Keep as technical reference

These are high-value sources for the future design/spec work. Preserve them even if they are not
part of the active daily working set.

### Decision history

Keep every file in `Docs/Specs/ADRs/`. ADRs explain why decisions were made. They are history, not
automatic authority when a newer active design decision conflicts.

Most relevant to the next work:

- `ADR-0004-completed-vs-mastered.md`
- `ADR-0005-direction-both-default.md`
- `ADR-0006-drop-evaluation-cache.md`
- `ADR-0007-provider-model-gateway.md`
- `ADR-0009-content-review-bar.md`
- `ADR-0013-persist-practice-sessions.md`
- `ADR-0014-web-first-sdk-boundaries.md`
- `ADR-0015-curated-practice-sets-in-mvp.md`
- `ADR-0017-workflow-for-generated-sets.md`

Important: ADR-0017 describes **private** generated sets. The founder has raised a possible future
path where reviewed generated material may become shared content for all learners. Do not silently
change or delete ADR-0017; supersede it only after the product decision is made.

### Technical areas

Keep all of `Docs/Specs/Areas/`, especially:

- `evaluation.md` — comparison-first grading, security boundary, AI fallback.
- `session-engine.md` — current session/blend logic; rewrite/reconcile when the Practice-serving
  engine is specified.
- `proficiency.md` — separates session accuracy from confirmed long-term proficiency.
- `platform.md` — Vercel, AI SDK/Gateway, runtime boundaries.
- `content-pipeline.md` — authored/reviewed content boundary and generation context.
- `data-model.md` — persistence reference; do not create new schema work during documentation reset.

### Feature references

Keep:

- `Docs/Specs/Features/practice-sets.md` — important source for collections and custom-content
  boundaries, but needs reconciliation with the newer localhost Practice design.
- `Docs/Specs/Features/progress.md`
- `Docs/Specs/Features/accessibility.md`
- `Docs/Specs/Features/voice-practice.md`

`Docs/Specs/Features/module-spec.md` is valuable evidence but is a likely rewrite/archive candidate:
it is broad, older, and overlaps with the page-specific specs now being planned. Do not delete it
until its still-valid decisions have been migrated.

## Preserve outside Docs

Never treat these as documentation noise:

- `content/` — curriculum research, original lesson content, style guide, and review material.
- `packages/lesson-schema/` — executable content contract.
- `apps/web/` — the actual product and validation source.
- `tooling/content/` — content validation and fixtures.

Research is not a ready-made, shippable intermediate phrase bank. It guides original, reviewed
content; do not bulk-copy external lists into collections.

## Archive and delete candidates to audit

Likely archive candidates, pending read-only mapping and founder approval:

- Old numbered `Docs/Waves/` packets.
- Superseded `Docs/Handoffs/` except the current handoff chain needed for continuity.
- Versioned prototype proposals and panel-review documents in `Docs/Prototypes/`.
- Historical audits and registers that no longer inform an active decision.

Likely repository-noise candidates, requiring separate exact-path review before action:

- `apps/prototype/` — old test/prototype application.
- Old generated screenshot/artifact directories under `apps/web/artifacts/`.
- Any legacy app directories, duplicate fixtures, or generated outputs not used by tests/builds.

Before moving or removing any app/artifact, prove whether it is referenced by package scripts, tests,
CI, documentation, or the current localhost product. Never remove a broad directory by pattern.

## Current Practice design decisions

The source of truth is `Docs/Prototypes/intermediate-learning-pilot.md`. Key accepted decisions:

- Prompt cue and direction share one compact row; generic direction-only instructional copy is
  omitted.
- Session score and count are separate; score follows learner-facing verdict, not raw numeric score.
- Catalog `Latest` is visit-only and is **not** durable collection proficiency.
- A one-character added/omitted character in an otherwise exact English response can be accepted
  deterministically when spelling is not the capability being tested.
- Feedback is direct, concise, and correction-first. It must not dwell on punctuation, optional
  articles, dialect, or style when those do not affect the goal.
- A focused word/phrase correction shows the before/after pair only. A meaning-level miss shows one
  full corrected response only. Never show the same correction twice.
- Current prototype inventory is too small. A shipping collection needs **at least 50 distinct
  underlying learning units**, with 100 as the target. A direction or activity variant does **not**
  count as another underlying unit.
- The current first-item-pinned shuffle is inadequate. A fresh session needs a genuinely varied,
  no-repeat queue; work this out through live prototype behavior before finalizing the serving spec.

## What not to do yet

- Do not implement database tables, a persistence design, or generated-content workflows merely
  because the documents mention them.
- Do not auto-publish a learner-requested generated collection to all learners. The product boundary
  is: personal/draft material first; shared content only after a future reviewed publication decision.
- Do not begin Lessons redesign until Practice Page interaction, feedback, and serving behavior are
  solid enough to reuse.
- Do not run a panel or let historical proposal documents override founder feedback from the live app.

## Suggested next sequence

1. Produce the read-only retention map and founder-approved archive/delete plan.
2. Perform the approved, reversible Docs/repository cleanup.
3. Return to localhost Practice and finish its remaining live design questions: collection depth and
   fresh queue behavior, feedback edge cases, saved individual material, then settings.
4. Write the Practice Page UI/UX spec from the tested experience.
5. Write separate specs for the Practice-serving, evaluation, feedback, and progress engines.
6. Reuse the proven activity/feedback/progress surfaces in a Lessons Page spec, while keeping lesson
   sequencing distinct from collection serving.

## Localhost status

At this handoff, a single local production server is intended to run at
`http://127.0.0.1:3217/practice` from this worktree. Verify it before use and restart only if needed
with:

```bash
CLERK_SECRET_KEY='' NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY='' DATABASE_URL='' DATABASE_URL_UNPOOLED='' VERCEL_OIDC_TOKEN='' AIDIOMA_ENABLE_LOCAL_PRACTICE_EVALUATION='true' npm run start --workspace @aidioma/web -- --hostname 127.0.0.1 --port 3217
```

Before ending a design/build turn, keep the living Practice document current, run the smallest
relevant validation, and use a production build before restarting this `next start` server.
