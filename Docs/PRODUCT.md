# AIdioma marketable MVP

## Product promise

AIdioma is a Spanish learning and practice system that continually gives each learner the
right material for their current level, chosen focus, and regional Spanish profile. It feels
like one calm conversation: learn something, type an answer, receive useful feedback, save
what matters, and continue.

The first market is English-speaking adults learning Spanish who want practical production
practice without game mechanics, crowded settings, or an unstructured AI tutor.

## Product principles

1. **The learner chooses the goal; AIdioma chooses the next useful item.** A lesson,
   collection, or saved list defines the eligible material. The serving policy adapts only
   inside that boundary and the learner's current level.
2. **One interaction model.** Lessons, practice, saved review, and translation use the live
   Practice page's message feed, answer composer, feedback, and continuous-session controls.
3. **Production first.** Assessed MVP practice shows an English cue and asks for typed Spanish.
   There is no practice-direction setting and no separate EN → ES / ES → EN mastery model.
4. **Regional Spanish is a product setting, not a prompt hint.** One account-level profile
   controls teaching, examples, expected answers, feedback, and translated output.
5. **AI proposes and explains; governed content remains authoritative.** Generated material
   must pass deterministic checks, independent adversarial review, and promotion before it
   can teach or grade a learner.
6. **MCOO by default.** Every launch feature must complete a core learner journey. Options,
   modes, and infrastructure without a current consumer stay out.

## The core learner journey

### 1. Start and resume

On first use, the learner selects a Spanish profile and either chooses a starting level or
takes a short placement check. The home state offers one recommended continuation, while the
main navigation exposes Lessons, Practice, Saved, Translate, and Settings.

Returning learners resume their current lesson or start a recommended review based on due and
weak material. A recommendation always says why it was chosen and can be ignored.

### 2. Complete lessons from beginner through advanced

The curriculum covers A1 through C1. Each level is a sequence of finite lessons; each lesson
has one practical outcome, a small set of concepts, concise teaching messages, examples in the
active dialect, and typed checks in the same chat workspace used by Practice.

A lesson ends with a clear completion state and contributes its concepts and bilingual items
to the learner's eligible review pool. Unlocking is guided, not punitive: learners can inspect
the course and revisit completed material.

### 3. Practice focused collections

Collections are reviewed sets tied to either a core concept (for example, past completed
actions) or a practical topic (for example, restaurants). The learner chooses a collection
and starts immediately. For MVP, the only scored interaction is:

- AIdioma presents an English word, phrase, or sentence.
- The learner types the Spanish equivalent.
- AIdioma marks it correct, close, or needs work; explains the important difference; and
  continues without changing UI modes.

There are no multiple-choice, flash-card, speech, or game modes in MVP. Prompt variety comes
from words, phrases, sentences, and contextual cues rather than additional interaction types.

### 4. Save and organize useful material

Any reviewed word or phrase can be saved from a lesson, practice feedback, or Translate. Save
is one action and never opens a required organization dialog.

Every item appears in **All saved**. A learner may optionally assign it to one named list,
create or rename lists, move an item, or remove it. Deleting a list does not delete its items;
they remain in All saved. The system also retains source and topic metadata for automatic
filters without asking the learner to tag anything.

The learner can practice All saved or one named list using the same production-first chat
session. Saving or translating an item does not count as knowing it; only later practice
attempts affect its learning state.

### 5. Translate and save

Translate accepts English or Spanish text, auto-detects the input language, and provides a
visible swap control for ambiguous input. Output follows the account's Spanish profile and
briefly identifies a meaningful regional alternative when useful.

The learner may save the resulting bilingual pair to All saved and optionally place it in one
list. Unsaved translation text is not retained as learning history. Saved translations remain
personal material and do not silently become curriculum or canonical answer authority.

## Regional Spanish contract

MVP launches with three structured profiles:

| Profile | Learner-facing label | Required behavior |
|---|---|---|
| `es-AR` | Spanish · Argentina | Rioplatense vocabulary and register, `vos` forms, and accepted regional alternatives |
| `es-419` | Spanish · Latin America | Broadly understood Latin American wording with explicit country-sensitive exceptions |
| `es-ES` | Spanish · Spain | Peninsular vocabulary and grammar, including appropriate plural address forms |

A profile is selected once and can be changed in Settings. Concept identity and progress are
region-neutral, so changing profile changes the rendering and accepted regional answers—not
the learner's completed lessons or underlying knowledge record.

Every publishable lesson, collection, and answer set declares its dialect coverage. Content
stores a shared meaning unit plus explicit regional renderings only where language differs;
it does not duplicate entire curricula per region.

## Adaptive practice contract

Adaptation begins with a transparent deterministic policy rather than an opaque model:

1. Build the eligible pool from the selected lesson, collection, saved list, or recommended
   review; current CEFR level; unlocked concepts; and active dialect profile.
2. Prioritize unresolved misses, due items, and low-confidence concepts.
3. Include a controlled amount of unseen or recently introduced material so practice moves
   forward rather than becoming an error loop.
4. Avoid immediate repetition unless retrying a miss; vary word, phrase, and sentence context.
5. Record evidence against the dialect-neutral concept and item. Attempt metadata may record
   activity type for diagnostics, but mastery is not split by translation direction.

The learner can see the session focus, pause or end at any time, and change focus without
changing curriculum position or claiming mastery.

## Content supply and quality

Lessons and collections use reusable concepts and bilingual meaning units. Generation may use
models and translation APIs, but the publish path is fail-closed:

1. A structured brief declares level, objective, concepts, topic, register, and dialects.
2. Generation emits schema-valid teaching steps, prompts, answer sets, explanations, and
   regional renderings.
3. Deterministic gates check schema, IDs, coverage, duplicates, level limits, answer presence,
   dialect completeness, and prohibited content.
4. Independent adversarial reviews check linguistic accuracy, ambiguity, pedagogy, level fit,
   dialect consistency, cultural quality, and unsafe or misleading material.
5. A promotion receipt versions the approved artifact. Only promoted versions can serve or
   grade learners.
6. Human sampling and learner reports feed corrections back through the same pipeline.

Runtime AI may explain an unexpected answer or translate personal text, but it cannot rewrite
canonical content or award progress without the evaluation policy's retained evidence.

## Minimal product components

| Component | Owns | Does not own |
|---|---|---|
| Learning content authority | Concepts, bilingual units, lessons, collections, dialect renderings, answer policy, promotion receipts | Personal progress or session UI |
| Learner state | Current level, lesson position, attempts, concept confidence, due state, saved items, named-list assignment, dialect preference | Curriculum wording |
| Serving policy | Choosing the next eligible item and retry timing | Generating canonical content or inventing mastery |
| Evaluation policy | Correct/close/needs-work outcome and feedback grounded in promoted answers | Scheduling or publishing content |
| Chat learning workspace | Rendering teaching, prompts, answers, feedback, pause/end, and save actions across all learning sources | Separate modality-specific products |
| Translation service | Bidirectional personal translation, dialect-aware display, and saveable bilingual result | Curriculum publication or mastery credit |
| Content pipeline | Generation, deterministic validation, adversarial review, versioning, and promotion | Serving unreviewed drafts |

These are logical authorities, not a mandate for separate services or packages. They should
remain together until scale or ownership creates a measured reason to split them.

## Marketable-MVP essentials

- Account-backed progress, saved material, dialect preference, and resume state are durable.
- Evaluation fails honestly and offers a report action when AIdioma cannot judge safely.
- The product measures onboarding completion, first lesson completion, first practice session,
  seven-day return, saved-item practice, translation-to-save, and content reports.
- Learner-facing AI behavior is disclosed in plain language, and unsaved translation input is
  not treated as curriculum or progress.
- Accessibility, mobile keyboard behavior, latency, and empty/error states are launch criteria,
  not post-launch polish.
- Payments, social features, streak pressure, leaderboards, and referrals wait until the core
  learning loop demonstrates retention.

## Launch bar

The MVP is marketable when:

- the A1–C1 lesson path is complete for the promised profiles and every level has concept and
  topical collections;
- a learner can complete the full lesson → practice → save → saved practice journey without
  leaving the shared chat interaction;
- Translate works in both language directions and saves into the same personal library;
- the scheduler reliably keeps recommendations inside level and chosen focus while giving
  weak and due material more attention;
- content and evaluation have retained quality receipts, dialect coverage, and correction
  paths; and
- retention and failure metrics can distinguish a learning problem from a content or service
  problem.

## Explicitly later

- Multiple-choice, flash-card, listening, pronunciation, speaking, and free conversation modes
- Separate receptive and productive mastery models
- Multiple simultaneous dialect profiles or per-session dialect switching
- Shared/public lists, collaborative courses, teacher tools, and social mechanics
- Fully generative lessons assembled live for one learner
- Native mobile applications, offline mode, and broad language-pair expansion
- Subscription optimization before learning-loop retention is proven

## What AIdioma will never do

- Present unreviewed model output as authoritative teaching material
- Inflate engagement by hiding the learner's goal behind game mechanics
- Claim that a lookup, save, or easy recognition event proves productive knowledge
- Let regional Spanish become an inconsistent set of prompt instructions or cosmetic labels
- Overwhelm learners with modes and settings that do not improve the core learning outcome
