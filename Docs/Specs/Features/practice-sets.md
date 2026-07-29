---
title: Practice Sets — curated and custom practice
type: feature-spec
status: active
updated: 2026-07-29
---

# Practice Sets — curated and custom practice

> ADR-0015 promotes curated sets into MVP. This spec fixes the initial contract while deliberately
> leaving room to revise the interaction after the fixture-backed UI prototype and human testing.

## Product boundary

A Practice Set is a versioned content bundle that uses the same Practice workspace, evaluation
service, session record, feedback, and recap as lesson practice without pretending to be a lesson.
Set activity never unlocks, completes, or masters a lesson. Curated sets ship in MVP; private
custom-topic generation follows in A9 and must use the generation gate below.

## Catalog and facets

Practice opens on the curated collection catalog. Equal **Current lesson** and **Your practice**
shortcuts sit above it: the first starts the learner's active lesson mix and the second opens the
personal subpage. The main Lessons navigation is the curriculum browser and also opens the current
lesson mix. Your practice will contain saved language and private lists/topics when those
capabilities ship.

The prototype sends Lessons directly to the current lesson-mix preview. Its real recipe, session
record, evaluation, and lesson-progress behavior remain the A4 SessionEngine implementation.

Saved is the default view inside **Your practice**, not a fourth top-level Practice destination.
Learners can save any practice source with the same bookmark control; the saved view groups those
references without copying or changing the underlying lesson, collection, or private content.

Collections use **Vocabulary, Verbs, Phrases, Topics, and Situations** as overlapping facets, not
one exclusive enum: a restaurant collection may be mixed content, topic `food`, and situation
`ordering`. Popularity ranking, badges, and filtering are deferred from MVP.

- Vocabulary: words grouped by frequency or theme.
- Verbs: lemmas plus reviewed grammatical forms.
- Phrases: fixed or semi-fixed communicative chunks.
- Topics: mixed material about a domain such as food or health.
- Situations: goal-oriented material such as checking into a hotel.

## Content and capabilities

Each set has an immutable ID, slug, title, description, level range, facets, version, origin,
visibility, provenance, ordered targets, supported activities, and default session configuration.
Targets have immutable IDs, bilingual prompts/answers, reviewed alternates, shared GrammarTags,
difficulty, and optional grammatical features (`mood`, `tense`, `person`, `number`, `form`).

Activities are capability-driven. Lexical targets support Type/Flashcards; reviewed distractors
enable Quiz; contextual sentences enable Sentences; a passage enables Story/Reading; a scenario
enables Conversation. The UI never offers an activity the current set cannot support. Set payloads
reuse shared answer, provenance, and GrammarTag contracts rather than creating a second taxonomy.

## Session configuration

Every set offers only valid intersections of its capabilities:

- activity, direction (EN→ES / ES→EN / Both), session length, difficulty, and shuffle;
- Verbs: tense/mood, person/number, and drill type (meaning, recognize form, produce form, context);
- Phrases: recognition/production, register, and communicative function;
- Topics/Situations: content kinds, subtopic, and—when authored—role or goal.

Selecting a collection starts practice with remembered defaults. A dedicated options control opens
advanced choices before starting or while a session is in progress; it does not add an interstitial
detail screen. Presets may offer Quick practice, Focused drill, and Mixed challenge. Starting a
session persists a configuration snapshot; changing settings starts a new session rather than
mutating scoring scope in flight. Invalid combinations (for example imperative + first-person
singular) are unavailable, not accepted and repaired later.

## MVP delivery

- Current-lesson shortcut, inline collection catalog/category filtering, direct start, and options.
- A small original, reviewed launch pack spanning the five catalog facets; frequency informs
  selection but no third-party ranked table is copied wholesale.
- Type + Flashcards, Both by default, size 10 by default, with direction/size and applicable
  grammatical filters. The contract and UI disclose later activities without simulating them.
- A1-supported verb forms at launch; broader tense data is added only with level-appropriate QA.
- Set session recap and set progress from real evaluations; no lesson-progression credit.

## Progress identity

Evaluations identify exactly one source item: lesson item or set target. Set-target performance may
roll up across sets by a stable knowledge key such as `hablar|indicative|present|1|singular`, while
lesson item stats and lesson Completed/Mastered remain separate. Set progress reports coverage and
retrieval performance only over targets available in that set/version.

## Saved practice identity

Saved practice is a learner-owned reference to one source item, identified by immutable source type
and ID. It may span lesson mixes, curated collections, and private content, but it never duplicates
content, changes ownership, or changes progress identity. Durable creation/removal and cross-device
sync ship with A5 saved/review persistence; the fixture prototype may demonstrate only session-local
interaction.

## Custom generation gate (A9)

Normalize request → check reusable private candidate → generate structured candidate → schema and
policy validation → independent quality check → learner preview/edit/regenerate → save as private,
versioned content. Record request, model, prompt version, time, provenance, and validation evidence.
Generated content is never silently merged into lessons or made public; public promotion requires
the authored-content review bar. Document/URL import remains PM-022.

## Accessibility and change policy

Catalog controls, capability states, and session settings follow the accessibility spec; unavailable
activities have text explanations in options. Prototype feedback may revise labels, layout,
defaults, facets, and presets. Identity, provenance, answer secrecy, immutable history, and
lesson/set progress separation require a new decision before changing.
