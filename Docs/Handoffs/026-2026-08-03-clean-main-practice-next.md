# Handoff 026 — clean repository, continue grounded Practice design

**Date:** 2026-08-03
**Integration branch:** `integration/repo-cleanup-2026-08-03`
**Expected resting branch:** clean `main` matching `origin/main`

## Current product truth

The current application is `apps/web/`. Practice and the intermediate lesson pilot are working,
fixture-backed design surfaces with real comparison-first evaluation and an opt-in local AI fallback.
The accepted learner-facing decisions live in
`Docs/Prototypes/intermediate-learning-pilot.md`; product-wide criteria live in
`Docs/Specs/Features/core-product-criteria.md`.

Do not restart from archived proposals, panels, waves, registers, or status documents. They are
historical evidence only. Start with `Docs/INDEX.md`, this handoff, and the live application.

## Repository reset completed in this change

- Preserved and combined the learner-design branch, A2R audit, C2/a1-05 content work, and the proven
  BUG-002 deployment guard before removing any branch.
- Reduced current `Docs/` to the active spine and an explicitly non-authoritative technical shelf.
- Moved historical handoffs, plans, prototypes, audits, registers, waves, the broad module spec, and
  the imported process kit into `Docs/Archive/` with catalog entries.
- Preserved remaining maintenance/product questions in `Docs/References/deferred-decisions.md`.
- Removed 75 generated screenshots/JSON files from Git. Browser proof now writes only to ignored
  `apps/web/artifacts/` paths and does not require stored screenshots or the old prototype visual
  contract.
- Kept `apps/prototype/` and `tooling/prototype/` as technical references because Content CI still
  verifies the generated lesson export. Remove them only after that executable dependency is replaced.
- Updated root onboarding and command skills so they no longer recreate the old roadmap/wave/register
  workflow.

## Preserved content state

The C2 branch added the draft `a1-05-ser-y-estar` lesson and its QA evidence. It validates cleanly but
is not L2-approved. P-007 was proposed, not approved; do not widen the lesson-schema vocabulary limit
without a fresh content/product decision. See `Docs/References/deferred-decisions.md`.

## Validation evidence

- App typecheck — passed.
- App lint — passed with zero warnings.
- App tests — 20 files and 159 tests passed.
- Production build — passed.
- Current-app browser smoke — 16 responsive/theme states passed.
- Practice/Lessons browser smoke — 24 states passed, including automatic progression to a fresh
  prompt, feedback, recap, settings, accessibility, keyboard use, reduced motion, and 200% text.
- Content typecheck and validation — passed for five lessons; the five existing documented a1-01
  alternate warnings remain.
- Lesson-schema smoke — 13 checks passed.
- Content counter-example fixtures — 21 checks passed.
- Static prototype export check — passed.
- `git diff --check` — passed.

## Next product work

Continue through the live Practice experience at `http://127.0.0.1:3217/practice`.

1. Replace the current first-item-pinned ordering with genuinely varied, no-repeat fresh sessions.
2. Pressure-test collection depth with at least 50 distinct underlying learning units; 100 remains
   the target. Direction/activity variants do not count as new units.
3. Finish feedback edge cases, then saved individual material, then Practice settings.
4. Write the Practice Page UI/UX and serving-engine specs only after those behaviors are exercised
   and accepted in the application.

Do not start persistence, generated-content publication, or Lessons redesign merely because archived
documents describe them.
