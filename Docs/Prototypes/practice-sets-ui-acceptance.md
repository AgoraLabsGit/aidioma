---
title: Practice Sets UI prototype — acceptance checklist
type: prototype-checklist
status: accepted
updated: 2026-07-29
---

# Practice Sets UI prototype — acceptance checklist

- [x] Practice opens directly on the collection catalog with no destination-choice screen. Lessons
  owns lesson entry; its current Lesson row opens the preserved lesson-mix preview at `/lessons/1`
  and returns to Lessons. Durable saved-item persistence remains deferred to A5.
- [x] Five visibly provisional fixture sets cover overlapping facets and honest activity capability states.
- [x] Collections filter by five facets and start directly with remembered defaults; a per-collection
  options control reuses the original Practice drawer and exposes only valid choices.
- [x] Essential Verbs disables invalid direction, size, tense/person, and drill-type intersections with a text reason.
- [x] Starting creates a frozen preview configuration in the existing Practice feed; Type and Flashcard states are inspectable without grading or persistence.
- [x] Returning and reconfiguring preserves prototype defaults; unsupported activities remain explicit
  in options and no popularity ranking is simulated.
- [x] A Saved catalog filter shows session-local bookmarked collections without adding a separate
  Your practice page. The active practice header retains the same save/remove control.
- [x] Collection cards prioritize level, title, a concise description, and size. Repeated facet tags
  are removed, while Save and Options use labeled 44px footer controls instead of competing icons.
- [x] Focused tests and App typecheck, lint, test, build, smoke, axe, keyboard, reduced-motion, 200% text, and overflow checks pass on phone/desktop in light/dark.

This checklist covers a design-review prototype only. Its fixtures are not reviewed launch content and must never be promoted into `content/practice-sets/`.
