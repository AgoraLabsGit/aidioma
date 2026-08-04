# Current handoff — finish Saved Restaurant Practice serving

**Date:** 2026-08-04
**Branch for the next session:** `main`
**Status:** the first reinforced Restaurant typed-Practice slice and approved feedback polish are
published; `PRACTICE-SERVING-001` remains active for one clearly named follow-up slice

## Current truth

- `Docs/` is the sole canonical documentation root. The application and executable tests remain
  implementation authority.
- Restaurant Spanish typed Practice now uses the deterministic `practice-policy-v1` journey: a
  five-item working set, exact same-direction miss return after three other items when possible,
  independent directions, third-miss parking/refill, reviewed repetition, and explicit narrow-pool
  recovery.
- The Restaurant source is pinned to an exact reviewed 50-prompt prototype payload. It enforces the
  approved 50-prompt collection minimum and the 10-prompt advertised-scope gate, rejects source
  drift, and never silently widens an empty chosen focus.
- Personal Saved typed Practice, non-Restaurant collections, and Flashcards are still on their
  explicitly named existing behavior. They do not yet claim reinforced scheduling.
- Practice evaluation is comparison-first and uses the evaluation-only Gateway key for non-exact
  answers in local development. Permanent configuration and client-request failures do not create
  futile retry loops; the learner may explicitly continue without grading and without learning
  evidence.
- Close and wrong feedback shows one complete closest reviewed answer. Small spelling changes use a
  blue dotted underline; changed or missing words use a rose solid underline. Provider-authored word
  fragments do not control the corrected sentence.
- Feedback cards have neutral interiors with verdict-colored perimeters and headings. Correction
  text is lighter, the repeated color key is removed, and fixed-direction sessions show direction
  once in the session summary. Alternating sessions still label each prompt.
- `PRACTICE-PAGE-001` is a planning draft, not approved implementation authority. Radial score,
  contextual word/phrase help, saved words, verb tables, recap disposition, and catalog/filter
  organization remain candidates for founder discussion.
- `PRACTICE-SETTINGS-001` remains blocked. Its future plan must include a learner choice for feedback
  language after shared evaluation behavior and canonical UI patterns are decided.

## Completed and proved in the closing scope

- Approved and documented Practice serving policy v1 after an independent design panel and fresh
  adversarial audit.
- Implemented the pure serving engine, reviewed Restaurant source resolver, typed verdict adapter,
  explicit unavailable/recovery states, stale-result protection, and the first real Practice-page
  integration.
- Reproduced and fixed the reported local grading failure, wired the existing local Gateway key to
  the evaluation-only setting without tracking a secret, and proved live AI grading through the API
  and browser.
- Replaced correction chips with a complete reviewed correction and added bounded, non-overlapping
  correction highlights generated independently of provider prose.
- Applied and reviewed the approved Practice-page polish described in `WORK.yaml`.
- Three independent final audits approved serving/evaluation behavior, learner journey and
  accessibility, documentation accuracy, scope containment, and privacy after SSOT reconciliation.

## Closing evidence

- App: typecheck, zero-warning lint, production build, and 264 tests across 31 files passed.
- Practice production browser proof: 42 screenshots passed across light/dark, 320px, phone, and
  desktop, including A-B-C-D-A reinforcement, missing-evaluator recovery, axe, keyboard focus,
  reduced motion, 200% text, and no horizontal overflow.
- Current-app browser proof: 16 screen states passed route navigation, theme, axe, keyboard focus,
  reduced motion, 200% text, no overflow, and responsive keyless authentication.
- Work registry: 17 work items, 3 fixes, 9 specs, 0 errors, and 0 warnings; its 24 tests and typecheck
  passed.
- Lesson contract: typecheck and all 13 smoke checks passed.
- Content: typecheck, 0 validation errors with 5 known Lesson 1 warnings, all 21 counterexample
  fixtures, and prototype freshness passed.

## Next action

Run `/feat PRACTICE-SERVING-001` for the remaining approved serving work:

1. Move visit-local personal Saved references that resolve to Restaurant typed prompts onto the same
   reinforced journey.
2. Keep invalid, stale, short, and zero-valid Saved scopes explicit; never replace them with other
   collection material.
3. Add and prove the application-level in-memory checkpoint/restore boundary already anticipated by
   the pure engine. Do not claim browser-refresh, cross-device, or durable resume.
4. Keep non-Restaurant collections and Flashcards unchanged until they are separately migrated or
   hidden.

After that slice, the roadmap order is `/plan EVALUATION-001` for structured coaching points and
feedback language, `/plan UI-SYSTEM-001`, then `/plan PRACTICE-SETTINGS-001`. Resume the remaining
`PRACTICE-PAGE-001` founder decisions only after those foundations are clear. A concrete Lesson slice
is the first reuse target after the Practice foundation is complete.

## Kickoff message

> Run `/feat PRACTICE-SERVING-001` in AIdioma. Read the repository `AGENTS.md`, then the complete
> canonical `Docs/INDEX.md`, `Docs/WORK.yaml`, `Docs/FIXES.yaml`, `Docs/HANDOFF.md`, and
> `Docs/Specs/practice-serving.md`. Inspect the current Practice code and tests before changing it.
> Implement only the next documented learner journey: personal Saved Restaurant typed prompts use
> the same reinforced Practice behavior, invalid or empty saved material gets a clear recovery
> experience, and the application can serialize and restore the current in-memory visit without
> claiming refresh or cross-device persistence. Keep non-Restaurant collections and Flashcards on
> their explicitly named existing behavior. Use independent sub-agents for bounded audits where
> useful, test the real browser journey, preserve unrelated work, and explain progress in plain
> feature and learner-experience language.
