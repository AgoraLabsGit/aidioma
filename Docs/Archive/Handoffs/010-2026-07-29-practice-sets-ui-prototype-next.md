---
title: Closeout — Practice Sets fixture-backed UI prototype
type: handoff
status: closed
updated: 2026-07-29
---

# Closeout — Practice Sets fixture-backed UI prototype

**Role:** isolated UI-prototype agent; do not take over A2 planning or C2 content work
**Operator:** Mike
**Boundary:** this remains design proof, not active A6 production implementation.

## Closeout

- Mike approved and locally merged the revised fixture-backed UI to `main` on 2026-07-29.
- The approved IA separates the primary destinations: Home continues the path, Lessons owns lesson
  entry, and Practice opens directly on the collection catalog without a destination-choice screen.
- Saved is a catalog filter rather than a separate Your practice page. Popular remains deferred;
  broader saved/review queues can earn a destination only after the A5 capability exists.
- The preserved lesson-mix preview moved to `/lessons/1`, returns to Lessons, and keeps Lessons
  selected. Collection cards drop repeated facet tags and use labeled Save and Options controls.
- Lesson and set sessions remain fixture previews. Saved state is session-local; A4 owns the real
  session engine and A5 owns durable saved items.
- Production A6 keeps its existing A4/A5 dependencies. The implementation must use the approved
  IA recorded in `practice-sets.md` and ROADMAP A6-2.

## Position

- Mike approved the recommended Practice Sets design and promoted reviewed curated sets into MVP.
- ADR-0015, the active feature spec, and subsystem reconciliations are committed. ROADMAP now has
  A6 curated sets, A7 Ship, A8 Reading, and A9 private custom-topic generation.
- Curated sets are first-class content using the same Practice surface/evaluator/session history;
  they never complete or master lessons. MVP supports Type + Flashcards; later activities appear
  only when a set carries their required reviewed assets.
- Catalog filters are All, Saved, Vocabulary, Verbs, Phrases, Topics, and Situations. Popular is
  deferred. Settings are capability-aware and snapshotted at session start.
- Durable boundaries: immutable IDs/history, provenance, server-owned answers, shared GrammarTags,
  valid grammatical features, and strict lesson/set progress separation. Prototype-responsive:
  labels, layout, defaults, facets, and presets may change after Mike tests them.
- The approved revision is merged to local `main` but not pushed. This closeout does not open or
  implement production A6.

## Next-wave preparation

1. Continue A2-H as the active App wave. Do not pull production Practice Sets forward.
2. When A4/A5 are proven and A6 opens, start from `practice-sets.md`, ADR-0015, and ROADMAP A6-2.
3. Replace fixture session and saved behavior only through the approved SessionEngine and
   `saved_items` paths; preserve strict lesson/set progress separation.
4. Keep actual launch copy and curated targets in the future reviewed content pack, not in the
   fixture module.

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
- Local `main` is clean and ahead of `origin/main` by the approved prototype revision. Do not clean
  other agents' worktrees or push without the repository's separate explicit GO.
