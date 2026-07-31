---
title: Adaptive learning system — proposal V2
type: design-proposal
status: proposed-pilot-charter
updated: 2026-07-31
supersedes: adaptive-learning-system-proposal.md
---

# Adaptive learning system — proposal V2

> **Non-authoritative design proposal.** This document does not change AIdioma's current Specs,
> ADRs, schemas, roadmap, lessons, P-007, or application behavior. It consolidates the first
> proposal and its [independent panel review](adaptive-learning-system-panel-review.md) into a clean
> model for founder review and a small shadow pilot.

## 1. The design in one sentence

AIdioma should organize learning around small, reviewed **knowledge claims**, while lessons,
collections, flashcards, quizzes, passages, and conversations provide different teaching experiences
and different-quality evidence about those same claims.

```text
reviewed claims + reviewed items
             |
     lesson / collection promise
             |
      bounded practice session
             |
      observable learner events
             |
       User Knowledge Profile
             |
 recommendation, review timing, and next session
```

This creates one learning system without forcing every activity to mean the same thing.

## 2. What each core component is

### Knowledge claim

A small, reviewed statement of what a learner can demonstrate. Examples:

- recognize the local meaning of *comer* in text;
- produce *tengo … años* to state an age;
- choose *ser* or *estar* in a trait-versus-current-state contrast.

A claim is not a topic, lesson, vocabulary row, grammatical error, or score. In the initial system,
each assessed item deliberately tests exactly one primary claim.

### Practice item

One addressable opportunity to teach or test something: a word card, translation prompt,
multiple-choice question, connected passage question, or later a constrained dialogue turn.

Each reviewed item has one primary claim, supporting vocabulary/tags, supported directions and
modalities, difficulty/prerequisite metadata, reviewed answers or grading data, immutable identity,
version, provenance, quality tier, and lifecycle state. Supporting material can affect eligibility
and feedback but earns no positive knowledge credit in the pilot.

### Lesson

A curated introduction and proof path for a bounded objective. A lesson decides:

- which claims are prerequisites, required core, or optional extension;
- what explanation and reference support the learner receives;
- which small proof requirements demonstrate each core claim;
- which larger item pool may supply practice and proof opportunities.

A lesson does not own a separate copy of learner knowledge. Completing a lesson and knowing its
claims are related but distinct facts.

### Collection

A named practice promise over a reviewed candidate pool. A collection may be curated by AIdioma or
private to one learner. It decides the topic/context, visible level or grammar promise, eligible
activities, provenance, and default practice intent.

A collection is not one fixed session and does not own separate mastery. Each session selects a
bounded subset from its pool using the learner's profile and explicit controls.

### User-generated collection

The same practice-container shape with private ownership and a lower trust tier. Its reviewed or
validated items can update private scheduling data against existing claims, but private generated
content cannot complete curriculum claims or silently enter the shared library.

Any future shared version is created by a separate canonical generation and review workflow. It is
not a promotion of the learner's private object.

### Practice session

One finite, resumable block with an exact persisted plan: item IDs and versions, order, direction,
reason codes, controls, policy version, random seed, and plan hash. Starting another block is always
allowed; an individual block never grows without bound.

### Practice event

One observable learner interaction. It records the item and primary claim, source, activity,
direction, modality, attempt/retry, hint/reveal/support, structured outcome, evaluator and mapping
versions, content version, time/local day, and source quality.

The durable event stores facts, not an assumed universal evidence weight. Raw typed answers are not
retained by default. Events can be invalidated or superseded when content, grading, claim mapping,
ASR, or evaluation is later found wrong.

### User Knowledge Profile

A rebuildable summary of credible events for one learner and claim. The pilot tracks only:

- `recognize_text`
- `produce_text`

It derives the practical states **New**, **Needs review**, **Due**, and **Confirmed** from observable
facts such as unassisted success, distinct delayed-success days, recent failure, and success across
different items/contexts. It is a scheduling and recommendation tool—not a permanent declaration of
human ability or one numeric mastery score.

## 3. The learner experience

### First encounter

1. The learner sees the lesson's plain-language objective and visible scope.
2. A concise explanation introduces the 1–3 core claims.
3. Reference material remains available without becoming a test.
4. A bounded Recommended block mixes suitable teaching checks and retrieval opportunities.
5. Results explain what is ready, what needs review, and why the next activity is recommended.
6. The learner may stop, review, or choose Keep practicing for another bounded block.

### Returning later

1. The profile identifies claims that are Due or need a different direction/context.
2. A lesson, collection, or home recommendation can offer a suitable reviewed session.
3. Later checks prefer unseen parallel items, not the exact prompt already memorized.
4. Credible evidence updates the same claim state regardless of the reviewed container that supplied
   it.

### Topic progression across levels

Topics organize discovery; claims and visible promises control learning scope. A Restaurant umbrella
can contain:

- Restaurant Basics — limited vocabulary and present-tense chunks;
- Ordering and Requests — broader vocabulary and request forms;
- Talking About a Past Meal — past-tense narration;
- Problems and Complaints — more complex communicative tasks.

“At my level” recommends a promise. The learner may choose another. Adaptation can vary items,
direction, review timing, and challenge inside the selected promise; it must not silently introduce a
new tense or change what the collection says it teaches.

## 4. Content anatomy and evidence authority

| Component | Learner job | Data anatomy | Knowledge authority |
|---|---|---|---|
| **Explanation** | Understand a new idea | objective, concise teaching text/examples, linked core claims, version | Instruction only; no evidence |
| **Reference card** | Look something up | title, rule/table/examples, linked claims/tags, version | Support only; no evidence |
| **Flashcard** | Retrieve, reveal, self-assess | cue, answer, direction, item/claim, reveal, Missed/Recalled | Scheduling signal only in pilot |
| **Typed practice** | Produce or recognize an answer | prompt, accepted answer/evaluator, primary claim, direction, support/attempt facts | Strong text evidence when unassisted and valid |
| **Quiz** | Make a constrained choice | prompt, options, answer/rationale, primary claim | Supported recognition evidence; weaker than unaided production |
| **Passage** | Build connected meaning | text/segments, linked claims, connected meaning questions | Segment translation supports translation/lexical claims; connected questions support reading meaning |
| **Conversation** | Accomplish a communicative goal | scenario, authored elicitation, accepted variants/rubric, transcript provenance, primary claim | Deferred; later only with reliable transcript and independent evaluator |
| **Evaluation** | Interpret a response | deterministic comparison first, evaluator result/version, outcome, error feedback, invalidation path | Creates an observation; does not itself define mastery |
| **Mastery/Confirmed** | Know what is retained enough to schedule differently | derived policy over delayed, varied, credible evidence | Rebuildable state, not permanent truth |

Important distinctions:

- Explanations and reference cards teach; they do not assess.
- Flashcard self-report changes scheduling but cannot complete a claim.
- Multiple choice and typed production are not interchangeable evidence.
- A passage is a content context; the question determines whether translation, vocabulary, or
  connected comprehension was assessed.
- A conversation model cannot grade its own dialogue.
- A learner-facing activity score is feedback, not automatically curriculum proof.
- Same-session repetition is practice, not independent retention evidence.

## 5. How lessons and collections work together

Both reference the same claims and reviewed items, but they make different promises:

- A **lesson** introduces bounded core claims and owns a curated required path.
- A **collection** offers ongoing practice within a visible topic/level/grammar promise.
- The **profile** owns neither container; it summarizes credible evidence about shared claims.

Example:

```text
Lesson: Feelings Basics
  core claim: choose ser/estar for trait vs current state
  core claim: recognize six feeling words
  required proof: small sampled checks for each core claim
  practice pool: many reviewed sentences and questions

Collection: Feelings — Present Tense
  promise: present-tense feeling descriptions
  candidate pool: overlapping and additional reviewed items

Collection result
  -> updates the same shadow claim state
  -> improves review recommendations
  -> does not silently mark the lesson complete in the pilot
```

The first pilot keeps cross-source evidence in shadow mode. After evidence and UX testing, AIdioma
can decide whether qualifying collection evidence should offer a visible readiness check/test-out or
only improve recommendations. Silent auto-completion is not proposed.

## 6. Dynamic practice without uncontrolled complexity

Session selection follows four stages:

1. **Hard eligibility:** valid form, supported activity/direction, active and safe quality tier, and
   the collection or lesson's visible promise.
2. **Soft readiness:** uncertain prerequisite or level distance lowers rank but does not falsely lock
   the learner out; reviewed fallback and explicit Stretch remain available.
3. **Readable utility:** rank by Due/Needs-review state, requested intent, relevance, diversity,
   novelty budget, saved status, and recent repetition.
4. **Bounded sampling:** select a varied block without replacement and intentionally requeue misses.

The default interface should expose one primary **Recommended practice** action, one simple size/time
choice, and optionally **Reinforce / Balanced / Expand**. Detailed direction, difficulty, tense,
person, and activity controls belong under Options.

- **Direction** defaults toward the weak/due facet, otherwise Both.
- **Difficulty** is profile-relative but may be overridden Easier/Recommended/Stretch.
- **Session size** is finite and snapshotted when the block begins.
- **Keep practicing** creates another block with recent-item exclusion.
- **More practice** varies contexts for existing claims.
- **Expand knowledge** deliberately introduces reviewed eligible claims.

There is no learner-facing lifetime practice cap. Resource limits constrain generation and storage,
not access to reviewed practice.

## 7. Lesson blueprint

Every lesson version should eventually declare this small, explicit blueprint:

```yaml
lesson:
  objective: learner-facing outcome
  promise: visible level, topic, grammar, and communicative scope

claims:
  - claim: stable reviewed claim key
    role: prerequisite | core | extension
    sequence: integer
    proof_policy: named small template

instruction:
  explanation: exactly one concise required orientation
  reference_cards: optional lookup support

practice:
  initial_block: bounded recipe
  candidate_pool: reviewed eligible items
  extension_pool: optional reviewed items/claims

proof:
  all_core_claims_required: true
  sampled_items: varied and preferably unseen
  support_rules: explicit
  delayed_confirmation: separate from same-session completion

continuation:
  keep_practicing: another bounded block
  review_reasons: fixed explainable templates
```

The blueprint separates three quantities that are currently coupled:

- how many new claims the learner is asked to understand;
- how many addressable reviewed items can exist in the practice pool;
- how many items the learner sees in a required session or proof sample.

Strong performance on one core claim cannot compensate for failure on another. Use a few named proof
templates, not a general rule language.

## 8. Generated content and library growth

Generation is an asynchronous supply process, not the session engine and not publication.

```text
learner request -> private candidate -> deterministic validation -> independent quality check
                -> approved private version for that learner

sanitized aggregate demand -> separate canonical generation -> deterministic QA
                            -> human/native review -> new shared reviewed identity
```

Rules:

- Reuse eligible reviewed items before generating.
- More practice uses existing reviewed claims; Expand knowledge selects from a reviewed catalog.
- Never directly share, promote, or cross-user cache private output.
- Learner approval and popularity are preference signals, not linguistic validation.
- Preserve provenance, model/prompt version, source/parent identity, review actions, license, and
  lifecycle.
- Validate all generated structure and every learner edit; treat request text as untrusted.
- Use exact hashes for dedupe first. Semantic similarity may aid a reviewer but cannot merge identity.
- Apply per-user generation/spend limits, candidate TTLs, quarantine, hot/cold separation, and
  deletion policies. These do not cap practice using reviewed content.

No global item ceiling should be invented before measuring bytes, query latency, duplication, review
throughput, reuse, and value per item.

## 9. Flashcards, voice, and future conversation

### Flashcards

Use **Cue → Reveal → Missed / Recalled**. Record the item, claim, direction, and self-report. The
signal schedules the card but cannot complete a curriculum claim. Measure whether it predicts later
unaided retrieval before granting it more authority.

### Voice

A reliable learner-confirmed transcript can use the authored target's evaluator while retaining voice
provenance. Low transcript confidence blocks or lowers evidence. A materially edited transcript is
typed-correction evidence, not clean speaking evidence. Pronunciation remains a separate construct.

Raw audio should be transient. Optional saved transcripts must have explicit purpose, consent,
access, retention, deletion, and age rules.

### Conversation

Conversation can contribute later through authored goal opportunities:

1. the system defines a communicative goal and elicitation without leaking the answer;
2. one primary claim and accepted semantic/form variants are declared;
3. a reliable transcript and support facts are captured;
4. an independent evaluator—not the dialogue model—applies the rubric;
5. the resulting observation remains correctable and versioned.

Open conversation initially produces coaching and review suggestions only. It gains profile authority
only after measured agreement with human/native raters. Failure to use a word spontaneously is not
evidence that the learner does not know it.

## 10. Minimal logical data model

| Record | Purpose |
|---|---|
| `knowledge_claims` | Stable reviewed lexical/chunk/grammar identities |
| `lesson_claim_scope` | Versioned prerequisite/core/extension roles and named proof policy |
| existing items/targets | Authored payload plus one primary claim, supporting metadata, mapping version |
| `practice_sessions` | Exact bounded resolved plan and selection-policy identity |
| `practice_events` | Idempotent, correctable observed learner facts; raw input absent by default |
| `user_claim_state` | Rebuildable hot rollup for claim + recognize/produce text facet |
| existing container progress | Lesson/collection participation and presentation history |
| generation jobs/versions | Private/shared lifecycle, provenance, QA, retention, and cost |

Critical integrity rules:

- Use an opaque learner-scoped `clientEventId`; reserve a pending event before uncertain AI work and
  return the same event/result on retry.
- Never hold a database transaction open during an AI call.
- Snapshot claim mapping, content, evaluator, profile-policy, and session-policy versions.
- Prove incremental profile state equals a full valid-event replay, including concurrent/out-of-order
  events and invalidation.
- Keep large payloads, raw answers, audio, and transcripts out of the hot profile path.
- Normal telemetry contains no raw learner answers, prompts, audio, or transcripts.
- Account deletion covers database, workflow state, object storage, analytics, and documented backup
  expiry.

Start with Postgres and a deterministic ranker. Do not initially add a graph/vector database, Redis,
embeddings, machine-learning ranker, prerequisite graph, multi-claim inference, or a production
FSRS/BKT/HLR model.

## 11. Smallest falsifiable pilot

Use A1-05's *ser/estar* contrast plus six feelings and one overlapping reviewed Feelings collection.
Treat ages/numbers as a separate claim and exclude P-007 expansion from this pilot.

Pilot experience:

- concise explanation and reference support;
- one eight-item Recommended block;
- fixed-template result and selection reasons;
- Keep practicing for another bounded block;
- collection activity updates the same shadow claim state;
- flashcards use Cue → Reveal → Missed / Recalled;
- later-day checks use unseen parallel items.

Pilot exclusions:

- no generated content;
- no conversation evidence;
- no automatic lesson completion from collection evidence;
- no numeric mastery/confidence;
- no complex learner controls;
- no corpus-wide claim migration.

The pilot fails if:

- two independent authors cannot map primary claims consistently;
- incremental state differs from valid-event replay;
- retries duplicate events or evaluator calls;
- adaptation improves repeated prompts but not delayed unseen performance;
- collection evidence does not predict lesson-check performance;
- blocks become repetitive, level-unsafe, or worse than the fixed recipe;
- learners cannot explain why an item was selected.

## 12. Phased adoption

1. **Gate 0 — decide the seam.** Define minimal claim identity, one-primary-claim mapping, lesson
   blueprint/proof templates, event idempotency/correction/versioning, profile concurrency/replay,
   session snapshot, and raw-input retention.
2. **Shadow evidence pilot.** Map only the pilot slice; record cross-source events and derive an
   internal profile while the existing experience remains the control.
3. **Adaptive bounded sessions.** Add deterministic ranking, reason codes, simple controls, and Keep
   practicing; compare delayed unseen outcomes with the fixed recipe.
4. **Cross-source learner UX.** Let reviewed collection evidence affect recommendations; test an
   explicit readiness-check/test-out path; add flashcard self-report.
5. **Generated supply.** Add private generation only after reuse, QA, privacy, deletion, cost, and
   rollback are proven; keep shared canonical production separate.
6. **Conversation evidence.** Begin only with authored opportunities and independently measured
   evaluator/transcript agreement.

Every phase must prove itself with real UI behavior and learner events before the next gains
authority.

## 13. Decisions still requiring founder input

These are product choices, not facts the architecture should silently decide:

1. Should qualifying cross-source evidence offer a visible readiness check/test-out, or only improve
   recommendations?
2. Should the learner-facing retained state be called Mastered, Confirmed, or Retained?
3. Which visible promises/layers should the first collections expose?
4. Is any short-TTL raw typed-answer retention acceptable for appeals and evaluator QA?
5. What human/native review bar is required before generated content becomes shared and scored?
6. When, if ever, may validated private generated practice affect curriculum progress?
7. What agreement threshold is required before authored conversation observations affect the
   profile?

Exact evidence thresholds, weights, novelty ratios, database ceilings, and ranking models should wait
for pilot data.

## 14. Ruling on P-007 and A1-06

### P-007

**Changes requested; do not approve as written.** Widening the raw lesson vocabulary cap solves the
wrong coupling. Numbers 0–30 may all be addressable in a reviewed practice pool without all 31
becoming new lesson concepts or appearing in one required run.

Replace P-007 with a decision that separately governs:

- lesson claim/concept load;
- addressable practice-pool capacity;
- bounded initial/session size;
- representative sampled proof for a claim such as ages/numbers.

### A1-06

**Remain paused only through Gate 0's content conventions.** Before authoring A1-06, decide minimal
claim identity, one-primary-claim item mapping, and the lesson core/pool/proof blueprint. A1-06 does
not need to wait for generation, conversation, cross-source auto-completion, or a final mastery
algorithm.

## 15. V1 to V2 change summary

V2 makes the first panel's corrections the main design instead of review annotations:

- replaces generic knowledge strength with Claim → Task → Evidence;
- separates lesson participation from cross-source claim state;
- makes one primary assessed claim and non-compensatory lesson proof explicit;
- distinguishes teaching assets, practice formats, evaluation, and retained knowledge authority;
- reduces the initial profile to text recognition and production with discrete states;
- makes sessions finite and reproducible while allowing unlimited continuation;
- gives collections visible level/grammar promises rather than hidden adaptive scope;
- limits flashcards, generated content, and open dialogue to evidence authority they can justify;
- adds event idempotency, correction, replay, privacy, provenance, and deletion requirements;
- narrows implementation to a small shadow pilot with explicit falsifiers.

The first proposal and its panel review remain historical evidence. V2 is the candidate for the next
review; it is not yet an implementation authority.
