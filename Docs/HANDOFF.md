# Current handoff — plan shared evaluation and feedback

**Date:** 2026-08-04
**Branch for the next session:** `main`
**Status:** `PRACTICE-SERVING-001` is complete; its reinforced Saved Restaurant and current-page
pause/resume journey is ready to continue from clean `main`

## Current learner experience

- Restaurant typed Practice uses the reviewed `practice-policy-v1` journey for collection starts and
  personal Saved prompts. A missed prompt deliberately returns after other material when the saved
  pool permits it.
- Saved Restaurant starts use only the learner's valid saved references. Invalid or stale references
  are explained, a short pool remains explicit, and a zero-valid pool offers recovery without quietly
  substituting other Restaurant prompts.
- Non-Restaurant collections, non-Restaurant Saved material, and Flashcards retain their named
  existing behavior. This work did not imply reinforced scheduling for them.
- A learner can pause and resume a reinforced Restaurant visit while remaining on the current page.
  The checkpoint restores the exact source, serving state, transcript, completed count, draft, and
  next prompt after revalidation. It exists only in React memory: refresh, closing the page, or using
  another device loses it.
- Late grading cannot change a paused visit. Resume fails safely if the source or policy is no longer
  compatible.

## Product questions recorded for future planning

- `EVALUATION-001` owns immediate one-or-two-phrase repair after a miss, the boundary between ordinary
  spelling and meaning-changing errors, consistent feedback language and fallbacks, structured
  coaching, and calmer feedback wording. Same-turn repair must not be counted as mastery evidence.
- `PRACTICE-PAGE-001` owns the presentation: an accessible icon-only star for saving the prompt,
  distinct word/phrase save actions, visually separated coaching and reviewed-answer regions, and an
  explicit Answer versus Ask AIdioma interaction that cannot accidentally advance Practice.
- `AI-TUTOR-001` owns contextual follow-up and open Spanish-learning conversation. Current Practice
  sends every composer submission to grading and has no tutor conversation or question intent.
- `PROGRESS-SAVED-001` is now explicitly the Learner Knowledge Profile owner. It must define word and
  phrase identity, recognition versus production evidence, attempts and assistance, delayed evidence,
  review states, saved vocabulary and custom collections, learner-visible views, correction/deletion,
  and the smallest honest durable release.

## Knowledge Profile and persistence truth

- AIdioma does not currently track learner understanding word by word. The database has authored
  `lessons` and `lesson_items` plus its migration journal; it has no learner word or phrase records,
  attempt tables, saved-word tables, mastery states, or durable Practice sessions.
- `Specs/progress-and-saved-material.md` and `Specs/data-and-persistence.md` contain useful draft
  groundwork, but neither is a founder-approved Knowledge Profile or schema plan. The required next
  design step is `/plan PROGRESS-SAVED-001`; only an approved learner promise should determine the
  later `DATA-PERSISTENCE-001` tables.
- A searchable wordbook/list is the preferred first presentation candidate because it can directly
  guide what to practice. A visual knowledge graph remains an option only if real relationships help
  the learner act. Avoid `Mastered` until delayed, varied, unassisted evidence justifies it.
- Secure durable writes also depend on `PLATFORM-SECURITY-001` for authenticated ownership,
  least-privilege database access, retries, deletion, and learner-data containment.
- Current Practice does not use Vercel Workflow. It calls a direct evaluation route, which compares
  reviewed answers first and uses the AI Gateway for uncertain answers. A normal request or streamed
  chat should be considered before durable workflow infrastructure for learner questions.

## Completed proof

- Focused Saved/source/checkpoint/component proof passed 53 tests. The full learner app passed 273
  tests across 32 files, typecheck, zero-warning lint, and a production build.
- Production-route browser proof passed collection and four-item Saved Restaurant A-B-C-D-A
  reinforcement, current-page pause/resume, zero browser-storage writes, evaluator recovery, axe,
  keyboard use, reduced motion, 200% text, and no horizontal overflow at 320px, phone, and desktop in
  both themes, producing 54 reviewed screenshots.
- Work registry validation passed with 17 work items, 3 fixes, 9 specs, 0 errors, and 0 warnings; its
  typecheck and 24 tests passed.
- Lesson contract typecheck and all 13 smoke checks passed. Content typecheck and validation passed
  with 0 errors and 5 known Lesson 1 warnings; all 21 counterexample fixtures and prototype freshness
  passed.
- The close scope is intended to finish on clean local `main` matching `origin/main`, with localhost
  restarted from that exact merged source. The closing PR and merge commit are the durable Git record.

## Next action

Run `/plan EVALUATION-001`. Discuss and approve the learner-facing evaluation contract before
changing product code: immediate phrase repair, spelling treatment, feedback language, coaching
structure and reading budget, verdict wording, reviewed-answer presentation semantics, and the safe
browser/API boundary.

After that foundation, use `/feat PRACTICE-PAGE-001` for its already approved catalog changes and
return to the newly recorded Practice interaction questions. Run `/plan PROGRESS-SAVED-001` before
adding saved words, word-level tracking, knowledge states, durable Practice sessions, or any
knowledge-graph presentation.

## Kickoff message

> Run `/plan EVALUATION-001` in AIdioma. Read the repository instructions and complete current
> handoff first. Plan the shared learner-feedback contract for Practice and Lessons: consistent
> feedback language and safe fallbacks; structured one-or-two-phrase immediate repair after a miss;
> ordinary spelling versus meaning-changing errors; concise coaching and reading budget; and calmer,
> accessible verdict and reviewed-answer semantics. Keep same-turn repair separate from later
> reinforced retrieval and never count it as mastery evidence. Audit the real evaluation path, use an
> independent design panel and fresh adversarial audit, make no product-code changes, and bring the
> material decisions back for founder approval.
