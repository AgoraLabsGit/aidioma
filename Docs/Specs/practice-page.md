---
id: PRACTICE-PAGE-001
title: Practice page and learner controls
area: practice
status: draft
implementation: mixed
founder_review: required
updated: 2026-08-03
---

# Practice page and learner controls

This migration dossier preserves evidence from the current application and prior documents. It is a
founder-approved temporary exception to normal spec creation timing, remains `status: draft`, and is
not approval to retain the current Settings design or implement candidate behavior.
`legacy-accepted` preserves a prior decision pending migration disposition; `accepted` is reserved
for current founder approval.

The founder rejected the Settings design rendered on 2026-08-03 as the target experience. That
product ruling is separate from the implemented draft/apply transaction, which remains useful
evidence rather than approval of the current controls or visual design.

## Outcome

Give learners a calm place to choose a useful collection, begin immediately, practice continuously,
understand feedback, save useful material, and stop deliberately without turning practice into a
configuration task.

## Learner jobs

- Find a collection that matches a topic, situation, or skill I care about.
- Start useful practice without completing a setup form.
- Understand what I am being asked to do and how my answer went.
- Adjust a small number of meaningful choices when I want a narrower experience.
- Save material worth returning to and end or continue practice deliberately.

## Non-goals

- Defining scheduling, batching, reinforcement, or mastery policy; see `practice-serving.md`.
- Treating prototype focus labels, shuffle, or static defaults as approved product controls.
- Claiming durable recommendations, saved state, scores, or learner history before persistence exists.
- Combining Lessons and Practice into one learner-facing container.

## Claim status

### Implemented

- `/practice` shows a filterable collection catalog; the main collection row starts practice.
- Active typed practice is a continuous prompt, answer, feedback, next-prompt feed.
- The learner explicitly ends practice; there is no per-answer Next gate.
- Settings changes are drafted and cancellable; applying them starts a fresh immutable configuration.
- Bookmarked collections and direction-independent saved prompt references are separate visit-only jobs.
- Current controls expose activity, direction, focus, and shuffle, but implementation is not approval.

### Legacy-accepted in earlier records, pending migration disposition

- Lessons make a finite teaching promise; collections make an ongoing practice promise.
- A topical collection may span levels and grammar while serving a learner-appropriate current scope.
- Practice should start directly from a useful default; Options should not be a required interstitial.
- Collections do not complete or master lessons.
- The Practice input may support asking AI questions, but that interaction is distinct from submitting
  a graded answer and has no implemented learner contract today.

### Candidate

- Retain only controls that express a genuine learner intention supported by the serving engine.
- Explain a real recommendation in plain language when learner-aware recommendation exists.
- Keep automatic next-prompt flow while missed material is reintroduced later by the engine.
- Decide whether collection bookmarks and personal saved material remain under one Saved surface.

### Research

- The archived code audit separates durable preferences, session requests, engine policy, per-item
  support, and account/data actions; these should not become one settings object or one panel.
- Per-item hints or reveal actions are clearer than a vague global difficulty/support setting.

### Conflicting or rejected

- The current Settings panel exposes internal curriculum labels and an implementation-level shuffle
  switch; the founder has rejected the panel as the intended experience.
- “Recommended mix” currently means static fixture defaults, not learner-aware selection.
- One available activity creates a false choice under “How to practice.”
- The withdrawn V4 model split topic collections by tense; the later learner journey rejected that.

## Desired experience boundary

1. The catalog owns collection discovery and Saved access.
2. Activating the main collection surface starts with a truthful default configuration.
3. Optional controls describe their effect before starting a fresh session configuration.
4. The active surface prioritizes prompt, learner answer, concise feedback, and the composer.
5. Internal engine policy stays hidden unless an explanation materially helps the learner.
6. End practice produces a truthful recap without implying durable proficiency.

## Settings design requirements

- Begin from learner goals, not the existing component fields.
- Do not show a control with only one meaningful choice.
- Do not expose authored metadata or ordering mechanics as preferences by default.
- Do not use “recommended” or “adaptive” unless the system can explain and execute the claim.
- Separate session requests from global preferences, support actions, account actions, and data actions.
- Applying a change must never alter the scoring scope of an in-flight answer.
- Unsupported combinations must be unavailable with an accessible explanation.

## Reuse boundaries

- Practice may expose prompt, composer, answer, feedback, recap, and accessibility patterns for
  Lesson reuse after a canonical Lesson slice proves the same interaction job.
- Keep collection discovery, optional focus, and ongoing-practice semantics specific to Practice.
- Consume a serving plan and evaluation result; do not implement selection or grading in page code.
- Saved references point to source identity rather than copying authored content.

## Migrated evidence

| Evidence | Use in this draft |
|---|---|
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/Features/core-product-criteria.md` | Simplicity, honest progress, meaningful practice |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Prototypes/intermediate-learning-pilot.md` | Implemented Practice observations; not authority wholesale |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Archive/Handoffs/023-2026-08-01-learner-journey-design-reset.md` | Continuous session and collection-scope corrections |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Archive/Prototypes/user-settings-and-controls-audit-v1.md` | Control taxonomy research only |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/ADRs/ADR-0012-reference-cards-mvp.md` | Legacy-accepted Ask-AI-in-Practice decision |
| `apps/web/src/components/practice-workspace.tsx` | Current catalog, feed, recap, and visit state |
| `apps/web/src/components/practice-set-options-panel.tsx` | Current rejected Settings surface |

## Draft acceptance criteria

- Founder approves the learner jobs and the boundary between direct start and optional controls.
- Every proposed control maps to an approved serving capability and has an observable effect.
- The design distinguishes global preference, session request, engine policy, support action, and data action.
- Catalog, active practice, failure, recap, Saved, empty, and unavailable states are specified.
- Phone, desktop, keyboard, screen-reader, reduced-motion, and 200% text behavior are testable.
- Copy never implies persistence, mastery, recommendation intelligence, or content review that does not exist.

## Open questions

1. Which learner intentions belong in the minimum panel: activity, direction, time, or manual focus?
2. Should direction remain explicit with Both default, or become a recommendation with an override?
3. Should the active session expose its current scope, and if so at what level of detail?
4. Should an incorrect answer offer an immediate retry, only a later retrieval, or both?
5. What exactly ends, pauses, resumes, and recaps a continuous study visit?
6. How should Saved bookmarks and saved material be organized once persistence exists?
7. Retain, revise, defer, or reject Ask AI in the Practice input, and how is it separated from grading?

## Decisions and discovered issues

### Decisions

| ID | Classification | Decision | Migration disposition |
|---|---|---|---|
| PRACTICE-PAGE-D001 | legacy-accepted | Keep Lessons and collections as distinct learner concepts. | pending founder disposition |
| PRACTICE-PAGE-D002 | legacy-accepted | Direct start remains the primary collection action. | pending founder disposition |
| PRACTICE-PAGE-D003 | implemented | Applying options starts a fresh immutable configuration. | retain current prototype truth |
| PRACTICE-PAGE-D004 | legacy-accepted | Practice input may support an AI-question interaction distinct from grading. | pending founder disposition |
| PRACTICE-PAGE-D005 | accepted | The current rendered Practice Settings design is not the target experience. | current founder ruling; replan after serving and UI-system work |

### Canonical work references

- `PRACTICE-PAGE-001` — own the learner journey and page-level dispositions in this dossier.
- `PRACTICE-SETTINGS-001` — redesign controls after `PRACTICE-SERVING-001` defines real capabilities.
- `PROGRESS-SAVED-001` — own durable Saved information architecture and ownership.
- `EVALUATION-001` — own any future Ask-AI versus graded-answer contract.
