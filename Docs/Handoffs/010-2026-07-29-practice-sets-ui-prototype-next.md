---
title: Handoff — Practice Sets fixture-backed UI prototype
type: handoff
status: active
updated: 2026-07-29
---

# Handoff — Practice Sets fixture-backed UI prototype

**Role:** isolated UI-prototype agent; do not take over A2 planning or C2 content work
**Operator:** Mike; expect design revisions after he uses the prototype
**Hard rule:** this is design proof, not active A6 production implementation; never push

## Position

- Mike approved the recommended Practice Sets design and promoted reviewed curated sets into MVP.
- ADR-0015, the active feature spec, and subsystem reconciliations are committed. ROADMAP now has
  A6 curated sets, A7 Ship, A8 Reading, and A9 private custom-topic generation.
- Curated sets are first-class content using the same Practice surface/evaluator/session history;
  they never complete or master lessons. MVP supports Type + Flashcards; later activities appear
  only when a set carries their required reviewed assets.
- Catalog facets are Vocabulary, Verbs, Phrases, Topics, and Situations. Popular is a badge/filter;
  My Sets is ownership. Settings are capability-aware and snapshotted at session start.
- Durable boundaries: immutable IDs/history, provenance, server-owned answers, shared GrammarTags,
  valid grammatical features, and strict lesson/set progress separation. Prototype-responsive:
  labels, layout, defaults, facets, and presets may change after Mike tests them.
- The feature commit was rebased onto A1-complete `main`. A1 is now published and closed; Handoff
  009 is superseded. This parallel prototype still does not open or implement production A6.
- Continue in `.worktrees/practice-sets` on `prototype/practice-sets-ui`; it was clean and aligned
  with local `main` when this handoff was finalized.

## Prototype scope now

Build a self-contained, fixture-backed React prototype in the existing Next.js shell. Reuse current
tokens, primitives, responsive navigation, themes, and Practice workspace styling. Do not add DB
migrations, API/evaluator behavior, persistence, generated content, or real proficiency writes.

Representative provisional fixtures should exercise the model, not claim launch-grade content:

- Essential Verbs; Everyday Phrases; Core Vocabulary; Food; Ordering at a Restaurant.
- Include overlapping facets, Popular state, supported/unavailable activities, and an empty My Sets.
- Essential Verbs must expose meaningful capability rules for direction, size, tense/form, person,
  and drill type; invalid combinations are disabled rather than silently repaired.

Prototype these flows:

1. Practice entry → browse/filter set catalog.
2. Set detail → Quick practice using a concise configuration summary.
3. Customize → activity, direction, size, difficulty, and applicable grammatical controls.
4. Start → same Practice feed with set title/configuration and representative Type/Flashcard states.
5. Return/reconfigure, remembered defaults, unsupported-activity explanation, and mobile empty states.

## Exact next actions

1. Read `Docs/STATE.md`, `Docs/ROADMAP.yaml`, `Docs/PROCESS.md`, this handoff, ADR-0015,
   `practice-sets.md`, `module-spec.md`, `accessibility.md`, and `session-engine.md`.
2. Confirm the worktree is clean and based on current local `main`; preserve root-checkout changes.
3. Write a tiny prototype acceptance checklist before code. Keep fixtures isolated and visibly
   provisional so they cannot be mistaken for canonical `content/practice-sets/` launch data.
4. Implement the catalog/detail/configuration/session-preview flow with the smallest client islands.
   Prefer existing primitives; add complex control dependencies only with a concrete accessibility need.
5. Add focused interaction/semantic tests. Run App typecheck, lint, tests, build, and smoke.
6. Capture phone + desktop, light + dark screenshots; prove keyboard operation, visible focus,
   200% text, reduced motion, and no horizontal overflow.
7. Present the prototype to Mike as a design review. Record requested UX changes in the feature spec;
   do not promote fixture data or start A6 persistence/engine work.

## Production dependency boundary

- Visual/interaction prototyping can happen now in isolation.
- Production Set recipe/evaluation integration waits for A4 SessionEngine/Practice refactor.
- Production Flashcards and saved/review reuse wait for A5.
- A6 becomes active only through the normal wave-open process after dependencies are satisfied.

## Authorities and repository caution

- Product contract: `Docs/Specs/Features/practice-sets.md`
- Decision: `Docs/Specs/ADRs/ADR-0015-curated-practice-sets-in-mvp.md`
- UI/accessibility: `Docs/Specs/Features/module-spec.md` and `accessibility.md`
- Engine/data boundaries: `Docs/Specs/Areas/session-engine.md`, `evaluation.md`, `data-model.md`
- Root `main` is published and clean. Do not clean other agents' worktrees or push prototype work
  without its own normal verification and explicit GO.
