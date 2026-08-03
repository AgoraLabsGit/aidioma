---
title: Intermediate learning pilot — lessons and collections
type: prototype-brief
status: active
updated: 2026-08-03
---

# Intermediate learning pilot

## Purpose

Use a working localhost experience to design AIdioma around a real intermediate learner. The pilot
tests product behavior before learner-state contracts, database migrations, generated-content
workflows, or production curriculum commitments are made.

This is a living prototype brief, not application authority. Decisions become Specs or ADRs only
after the experience has been exercised and accepted.

## Working product distinction

- A **lesson** makes a finite teaching promise. It introduces a bounded capability through an
  explanation, examples, guided practice, less-supported use, and a clear completion point.
- A **collection** makes an ongoing practice promise. It organizes practice around a situation,
  topic, or skill; adapts its current scope; and may be revisited as the learner grows.
- Lessons and collections remain distinct learner-facing concepts but share activity rendering,
  hints, feedback, evaluation, reference material, and knowledge evidence.
- Completing a lesson means completing its teaching arc. A collection may report the current scope
  practiced, but a growing collection is not permanently “completed.”

## Shared learning material

Words and phrases do not belong exclusively to a container. The pilot distinguishes:

1. the expression the learner encounters;
2. the capability they are trying to understand or produce;
3. the context in which they use it;
4. the particular exercise that elicits it; and
5. the evidence their response provides.

For example, `acabar de + infinitive` is introduced in a time lesson and may be practiced through
restaurant, travel, and storytelling prompts. Those prompts differ, but they can strengthen the
same underlying capability. Raw strings are not always the right learning unit: `acabar`, `acabar
de`, and `sin embargo` make different promises.

## Pilot lessons

1. **Tell what happened** — completed events, the preterite, and common past-time anchors.
2. **Place actions in time** — habits, recency, duration, and upcoming actions using expressions
   such as `soler`, `acabar de`, `hace`, `dentro de`, and `ir a`.
3. **Locate things and give directions** — position, distance, and movement using `aquí/acá`,
   `ahí/allí/allá`, `hacia`, `hasta`, and relational phrases.
4. **Say what exists and what occurred** — existential `hay`, `había`, `hubo`, and `habrá`;
   auxiliary `haber` remains outside this first scope.
5. **Connect and qualify ideas** — sequence, cause, result, contrast, and concession using a small
   functional set including `después`, `porque`, `por eso`, `sin embargo`, and `aunque`.

## Pilot collections

1. **Restaurant Spanish** — ordering, preferences, mistakes, complaints, previous visits, and
   payment across learner-appropriate scopes.
2. **Getting Around** — locating destinations, understanding directions, correcting a route, and
   explaining where something happened.
3. **Time, Habits, and Plans** — routines, recent actions, duration, deadlines, and near-future plans.
4. **Telling Stories and Explaining Problems** — connected accounts using past events, background,
   time anchors, existence, cause, contrast, and consequence.

## Supporting material

Lessons may own structured explanations, examples, contrasts, guided steps, checkpoints, and
returnable reference cards. Collections may provide a current-scope summary, phrase preview,
situation-specific register or cultural guidance, contextual hints, and links to shared reference
material. Collections do not duplicate a full grammar lesson merely to make a topic usable.

When a collection includes unfamiliar language, AIdioma may provide a short local explanation or
offer the relevant lesson without ejecting the learner from their continuous study visit.

## First executable slice

The first complete slice connects **Tell what happened** with **Restaurant Spanish** through shared
capabilities: completed past events, past-time anchors, explaining a mistake, and polite resolution.

The localhost prototype should make these differences felt:

- the lesson teaches the capability in a deliberate progression;
- the collection starts immediately with a recommended, learner-appropriate practice scope;
- optional focus controls narrow future practice without redefining curriculum position;
- feedback separates communicative success from demonstration of the requested form;
- submitting an answer appends the learner response, feedback, and the next prompt to one continuous
  conversation, without a separate Next gate or an internal-block stopping point;
- End practice is an explicit learner action; and
- representative evidence explains what the system would record without claiming real persistence.

The remaining lessons and collections appear in the pilot catalog early so the first slice is judged
against a varied system rather than mistaken for the whole design.

## Current localhost status

- `/lessons` shows the five intermediate lesson promises beside the preserved canonical A1 path.
- `/lessons/intermediate/tell-what-happened` runs the three-step finite teaching arc.
- `/practice` shows all four collections, optional focus controls, and a continuous practice feed
  with live scoped evaluation and an explicit learner-requested recap.
- Restaurant Spanish now contains 50 distinct reviewed prototype prompts so session depth can be
  exercised realistically. The other four lessons and three collections remain breadth
  outlines/sample prompts; none of this material is launch or canonical curriculum content.

## Practice-screen review decisions

- The collection catalog uses one collection per row. The prototype does not add a card/row
  preference because that would introduce another learner choice before a second layout has shown
  durable value.
- `Practice` uses the same screen-title typography as the other main pages; a collection title in
  an active session remains compact context text.
- The default practice session opens directly on its first prompt. A quiet configuration note appears
  only when the learner has departed from the collection recommendation; detailed focus choices remain
  in Practice settings.
- The exercise card places its learner cue and translation direction on one compact row, then gives
  the sentence the visual emphasis. When direction alone already explains the task, it omits generic
  copy such as “Express the meaning of this Spanish sentence in English.”
- The session header separates the live correctness rate from the completed-practice count. The rate
  follows the learner-facing verdict, not a second raw-score threshold; this is immediate session
  feedback, not a claim of curriculum progress or mastery.
- A one-character insertion or omission in an otherwise exact English translation is accepted
  deterministically when spelling is not the capability being practiced. Substitutions and changes
  to meaning-bearing words still receive normal review, so the rule does not depend on an AI guess.
- Save and Practice settings use recognizable icons without persistent text labels. The whole main
  collection row opens practice; the icon actions live at its lower right, while a completed session
  can show a transient `Latest` score at its upper right.
- Active practice behaves as a conversation. A submitted response remains visible, evaluation
  appears beneath it, the next prompt is appended automatically, and the composer stays available.
- Reviewed exact answers are compared locally. Other valid or imperfect phrasings are evaluated by
  the existing server-side AI evaluator against the served prompt, accepted examples, and explicit
  capability goal. The browser never supplies the answer key or evaluation scope.
- Feedback exposes only the learner-facing result label, concise coaching when a material correction
  is needed, and one correction surface. Internal scores and error tags that fall outside the served
  scope are not exposed and do not prevent learner feedback from being returned.
- Learner-facing feedback does not expose internal evidence bookkeeping. The recap remains the place
  to preview what the knowledge profile would or would not record.
- Correct feedback is a compact acknowledgement without a second numeric score. `Almost` and `Keep
  working` give one material, actionable correction of at most 32 words, use a horizontal same-size
  before/after token display, and do not call out punctuation, optional articles, dialect variants,
  or style preferences that do not affect meaning or the requested capability.
- Feedback addresses the learner directly in second person. It never talks about “the learner,” “the
  response,” “the source,” or a “correct translation,” and it never repeats the full correction in
  the explanatory sentence.
- A focused word correction shows only the horizontal before/after pair. A semantic mismatch instead
  shows the complete correct response in larger type, without a `Model answer` label. The two are
  mutually exclusive, so a correction is never shown twice. Correct acknowledgement remains
  intentionally larger than a detail card.
- Prompt selection schedules every distinct underlying prompt before repeating one. With Both
  directions selected, it completes one direction for every prompt before scheduling the other
  direction, so all prompt-direction units are distinct before the cycle repeats. Each fresh varied
  session receives a new shuffle seed and, when more than one prompt matches, does not reuse the
  previous session's first prompt. Turning Vary the order off preserves fixture order; injected
  seeds provide the deterministic test seam and are not a learner setting.
- A shipping collection needs at least 50 reviewed underlying practice units, with 100 as the target.
  Changing direction or activity does not create another unit for this count; it is a presentation
  choice for the same learning material, not additional content. A new session must receive a newly
  shuffled, no-repeat queue rather than begin with a fixed first item. The prototype's 2–4 unit
  collections deliberately do not meet this launch bar.
- The catalog's `Latest` score is retained only for the open visit and disappears on reload. It is
  not a lifetime grade or collection-proficiency claim; durable collection proficiency remains
  deliberately unresolved until evidence and persistence are designed.
- An ungraded response remains attached to the active prompt and never changes the prompt, count, or
  score. Retryable failures offer Try grading again; non-retryable failures explain that retry will
  not help. Editing the response clears the failure, and late results from an abandoned attempt,
  ended session, or newly started session are ignored.
- Practice settings are a draft until Start practice/Start new session. Closing or cancelling the
  dialog discards the draft. Applying settings creates a fresh session with an immutable snapshot of
  activity, direction, focus, shuffle, and order seed; it never mutates an in-flight scoring scope.
  There is no learner-facing support/difficulty control. Numeric difficulty remains authored prompt
  metadata used for content composition and validation.
- Saved has two deliberately separate visit-only jobs: bookmarked collection shortcuts and
  individual prompt references saved from feedback. A prompt reference is collection ID + prompt ID,
  independent of the direction in which it appeared. Personal saved material can start its own
  shuffled, both-direction practice queue; neither kind of save survives reload.

## Operator-only generation bench

Restaurant depth was produced through a local candidate bench that reuses the executable accepted
answer, GrammarTag, prompt, and numeric-difficulty contracts where they fit. Generation
runs are schema-bound, batched, checkpointed, inventory-bound, and deterministically validated.
Promotion requires a decision for every candidate, explicit warning acknowledgement, reviewed
coverage keys, an independent critic bound to both raw and reviewed hashes, a passing post-edit
validation, and explicit prototype-only acknowledgement. The promoted JSON and its review/critic
sidecar are tracked together and hash-bound.
The original-only brief omits provenance instead of inventing a source claim.

This is operator tooling for pressure-testing the fixture. It is not the A9 private learner
generation flow, does not use Workflow or Neon, creates no public or canonical content, and does not
satisfy ADR-0009's founder/native launch review layers.

## Prototype boundaries

- Use original local sample content, actual application components, and real typed interaction.
- Keep learner history, recommendations, and knowledge changes transient; do not imply that they
  were persisted.
- Do not add database tables, production content publication, learner-triggered generated-content
  flows, or mastery thresholds. The operator-only candidate bench above is the bounded exception.
- Do not treat local storage, evaluation output, or a visual progress state as genuine learning
  history.
- Preserve the current canonical A1 lessons and their database serving-copy contract.

## Deferred product questions

- Learners will eventually be able to save individual words and phrases into personal collections.
  The organization model, naming, and relationship to built-in collections remain intentionally
  undecided; no storage or data model follows from this note.
- Durable saved material, cross-device collection bookmarks, and personal-list organization remain
  unresolved; the current visit-only references do not imply a storage or ownership model.

## What localhost review should reveal

- Whether Lessons and Collections make visibly different promises.
- Whether the shared material feels coherent instead of duplicated.
- Whether collection support is sufficient without becoming another lesson.
- Whether automatic recommendations and optional focus controls coexist with low cognitive load.
- Whether continuous practice has natural pauses without artificial caps.
- Which facts actually need persistence and which are only transient presentation state.
