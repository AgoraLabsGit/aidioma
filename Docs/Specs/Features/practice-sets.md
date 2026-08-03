---
title: Practice Sets — curated and custom practice
type: feature-spec
status: active
updated: 2026-08-03
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

Practice opens directly on the curated collection catalog. It does not repeat lesson entry or add a
destination-choice screen: Home continues the learner's path, Lessons owns the curriculum browser
and lesson entry, and Practice owns focused collection drills. The current Lesson row opens the
preserved lesson-mix preview under `/lessons/1`; its real recipe, session record, evaluation, and
lesson-progress behavior remain the A4 SessionEngine implementation.

Saved is a catalog filter, not a separate page. In the current fixture it contains two distinct
visit-only sections: bookmarked collection shortcuts and individual prompt references saved after
feedback. A prompt reference is collection ID + prompt ID, independent of practice direction, and
the resulting personal-material queue can be practiced in both directions. Neither save kind copies
content, changes progress identity, survives reload, or claims persistence.

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
difficulty, and optional grammatical features (`mood`, `tense`, `person`, `number`, `form`). Numeric
difficulty is authored metadata, not the removed learner-facing support/difficulty setting.

Activities are capability-driven. Lexical targets support Type/Flashcards; reviewed distractors
enable Quiz; contextual sentences enable Sentences; a passage enables Story/Reading; a scenario
enables Conversation. The UI never offers an activity the current set cannot support. Set payloads
reuse shared answer, provenance, and GrammarTag contracts rather than creating a second taxonomy.

## Session configuration

The current prototype offers only valid intersections of its capabilities:

- activity, direction (EN→ES / ES→EN / Both), focus, and shuffle;
- Verbs: tense/mood, person/number, and drill type (meaning, recognize form, produce form, context);
- Phrases: recognition/production, register, and communicative function;
- Topics/Situations: content kinds, subtopic, and—when authored—role or goal.

Selecting a collection starts with remembered defaults. Settings edit a draft: cancel discards it;
Start practice/Start new session commits it to a fresh immutable snapshot of activity, direction,
focus, shuffle, and order seed. Varied sessions schedule each prompt before repeating, avoid the
prior first prompt when possible, and exhaust Both-direction units before repeating. Shuffle off
preserves fixture order as the test seam. Invalid combinations are unavailable rather than repaired.

## MVP delivery

- Direct collection catalog, category/Saved filtering, direct start, and options; lesson entry stays
  under Lessons.
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
and ID. It may span sources but never duplicates content or changes progress identity. Durable
creation/removal and cross-device sync remain future; the fixture is visit-local only.

## Custom generation gate (A9)

The checked-in Restaurant corpus came from a separate operator-only prototype bench with strict
schemas, bounded resumable checkpoints, deterministic validation, a complete human decision
manifest, and an independent critic bound to reviewed content. Promotion requires clean post-edit
validation, acknowledged warnings, and explicit prototype-only acknowledgement; it writes hash-bound
JSON plus a tracked review sidecar. The bench provides no learner generation, persistence, or A9.

Per ADR-0017, stable Workflow core orchestrates normalize/cache → structured candidate → schema and
policy validation → independent quality check → private draft → typed learner review → approve,
edit, or bounded regenerate → private version. AI, database, and validation work executes in
retryable, idempotent steps; the workflow function only coordinates them.

Neon owns the user-scoped generation job, status, request, model, prompt version, provenance,
validation evidence, draft, and final version. Workflow history is operational, never canonical.
Every start/status/review/cancel operation checks Clerk ownership. Generated content is never
silently merged into lessons or made public; promotion requires authored-content review. Document
or URL import remains PM-022.

## Accessibility and change policy

Catalog controls, capability states, and session settings follow the accessibility spec; unavailable
activities have text explanations in options. Prototype feedback may revise labels, layout,
defaults, facets, and presets. Identity, provenance, answer secrecy, immutable history, and
lesson/set progress separation require a new decision before changing.
