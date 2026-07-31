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

AIdioma should organize learning around small, facet-neutral **atomic knowledge claims**, while lessons,
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

### Atomic knowledge claim

A small, reviewed and schedulable language identity. Examples:

- `lex:es:comer:sense1` — the local lexical sense of *comer*;
- `chunk:es:tengo-anos` — the age-expression chunk *tengo … años*;
- `grammar:ser-estar:trait-state` — the trait-versus-current-state contrast.

A claim does not encode recognition or production; the event supplies that facet. A claim is not a
topic, lesson objective, grammatical error, or score. Each lexical sense is normally its own atomic
claim. A semantic change creates a new claim ID; wording or metadata may version the same ID only
when the assessed meaning is unchanged. Claim merge/alias inference is deferred.

### Lesson objective

A learner-facing outcome that groups one or more atomic claims and owns a small proof policy. A
lesson normally has 1–3 objectives; that is not a cap of 1–3 vocabulary claims. The number of new
atomic claims introduced is an empirical authoring budget, not a permanent system invariant.

An objective may use representative sampling to establish a functional lesson outcome without
pretending that every unobserved member claim is Confirmed. Every observed atomic claim still updates
only from evidence about that claim.

### Practice item

One addressable opportunity to teach or test something: a word card, translation prompt,
multiple-choice question, connected passage question, or later a constrained dialogue turn.

Each assessed item has one primary atomic claim, supporting prerequisites/tags, supported directions
and modalities, difficulty/prerequisite metadata, reviewed answers or grading data, immutable
identity, version, provenance, quality tier, and lifecycle state. Supporting material can affect
eligibility and feedback but earns no positive knowledge credit in the pilot.

Practice eligibility and evidence eligibility are different. A stretch practice item may contain
uncertain supporting material. A proof/check item must make supporting demands known, supplied, or
deliberately irrelevant. If a failure is plausibly caused by supporting material, it may schedule
more practice but cannot count as negative evidence against the primary claim. Initial proof items
should use controlled cloze/minimal-pair or short production tasks with familiar support.

### Lesson

A curated introduction and proof path for a bounded objective. A lesson decides:

- which objectives and atomic claims are prerequisites, required core, or optional extension;
- what explanation and reference support the learner receives;
- which small proof requirements demonstrate each core objective;
- which larger item pool may supply practice and proof opportunities.

A lesson does not own a separate copy of learner knowledge. Three facts stay distinct:

- **Session finished:** one bounded block ended.
- **Lesson Completed:** the authoritative progression rule was met.
- **Claim Confirmed:** delayed, varied evidence changed scheduling for one atomic claim/facet.

For the shadow pilot, current lesson completion and unlock behavior remains authoritative. Shadow
claim state cannot complete, fail, skip, or unlock a lesson.

### Collection

A named practice promise over a reviewed candidate pool. A collection may be curated by AIdioma or
private to one learner. It decides the topic/context, visible level or grammar promise, eligible
activities, provenance, and default practice intent.

A collection is not one fixed session and does not own separate mastery. Each session selects a
bounded subset from its pool using the learner's profile and explicit controls.

### User-created and generated collections

A user-created collection that selects reviewed canonical items can earn the same item-level evidence
as another reviewed container. A collection containing private generated items uses a lower trust
tier. Those results initially affect only repetition of that private item; they cannot lower,
confirm, or reschedule the cross-source claim profile and cannot complete curriculum objectives.

Any future shared version is created by a separate canonical generation and review workflow. It is
not a promotion of the learner's private object.

### Practice session

One finite, resumable block with an exact persisted plan: item IDs and versions, order, direction,
reason codes, controls, policy version, random seed, and plan hash. Starting another block is always
allowed; an individual block never grows without bound.

### Practice event

One observable learner interaction. It records the item and primary claim, source, purpose
(`teach | practice | check`), activity, direction, modality, attempt/retry, hint/reveal/support,
structured outcome, evaluator and mapping versions, content version, time/local day, and source
quality.

The durable event stores facts, not an assumed universal evidence weight. Raw typed answers and
raw-equivalent diffs/feedback are not retained by default. Events can be invalidated or superseded
when content, grading, claim mapping, ASR, or evaluation is later found wrong.

### User Knowledge Profile

A rebuildable summary of credible events for one learner and claim. The pilot tracks only:

- `recognize_text`
- `produce_text`

It derives the practical states **New**, **Needs review**, **Due**, and **Confirmed** from observable
facts such as unassisted success, distinct delayed-success days, recent failure, and success across
different items/contexts. It is a scheduling and recommendation tool—not a permanent declaration of
human ability or one numeric mastery score.

`produce_text` is deliberately broad only as a storage facet. Each claim/proof policy still declares
semantic acceptability, required form, spelling/accent tolerance, and whether a `close` result is
practice-only. Response speed and accommodation use never become proficiency evidence.

## 3. The learner experience

### First encounter

1. The learner sees the lesson's plain-language objective and visible scope.
2. A concise orientation and any claim-linked teaching steps introduce the core objectives.
3. Reference material remains available without becoming a test.
4. A bounded Recommended block keeps teaching, practice, and independent checks distinguishable.
5. Results explain what is ready, what needs review, and why the next activity is recommended.
6. The learner may stop, review, or choose Keep practicing for another bounded block.

### Returning later

1. The profile identifies claims that are Due or need a different direction/context.
2. A lesson, collection, or home recommendation can offer a suitable reviewed session.
3. Later checks prefer unseen parallel items, not the exact prompt already memorized.
4. Credible evidence updates the same claim state regardless of the reviewed container that supplied
   it.

Cold start uses the chosen lesson/collection promise's authored standard band, then adjusts locally
from the first unassisted results. Accessible **Too easy / Too hard** controls refine the next block.
Easier means more familiar context or support, not a different target; Stretch never introduces
undisclosed grammar.

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

Lexical identity and grammatical form remain related but distinct. For example:

```text
lex:es:comer:sense1
grammar:present-regular-er:first-person
grammar:preterite-regular-er:first-person

“I eat” -> “como”
  primary: present-form claim
  supporting prerequisite: lexical comer claim

“I ate” -> “comí”
  primary: preterite-form claim
  supporting prerequisite: lexical comer claim
```

The pilot credits only the primary claim. It does not infer positive evidence for both vocabulary and
form from one answer. That limitation is preferable to false precision until multi-claim attribution
is validated.

## 4. Content anatomy and evidence authority

| Component | Learner job | Data anatomy | Knowledge authority |
|---|---|---|---|
| **Explanation** | Understand a new idea | objective, concise teaching text/examples, linked atomic claims, version | Instruction only; no evidence |
| **Reference card** | Look something up | title, rule/table/examples, linked claims/tags, version | Support only; no evidence |
| **Flashcard** | Retrieve, reveal, self-assess | cue, answer, direction, item/claim, reveal, Missed/Recalled | Scheduling signal only in pilot |
| **Typed practice** | Produce or recognize an answer | prompt, accepted answer/evaluator, primary claim, direction, support/attempt facts | Strong text evidence when unassisted and valid |
| **Quiz** | Make a constrained choice | prompt, options, answer/rationale, primary claim | Supported recognition evidence; authority depends on the claim and task |
| **Passage** | Build connected meaning | text/segments, linked claims, connected meaning questions | Segment translation may support an atomic claim; connected reading remains a separate task outcome initially |
| **Conversation** | Accomplish a communicative goal | scenario, authored elicitation, accepted variants/rubric, transcript provenance, primary claim | Atomic claim credit is deferred; full task success remains a separate performance outcome |
| **Evaluation** | Interpret a response | deterministic comparison first, evaluator result/version, outcome, error feedback, invalidation path | Creates an observation; does not itself define mastery |
| **Mastery/Confirmed** | Know what is retained enough to schedule differently | derived policy over delayed, varied, credible evidence | Rebuildable state, not permanent truth |

Important distinctions:

- Explanations and reference cards teach; they do not assess.
- Flashcard self-report changes scheduling but cannot complete a claim.
- Multiple choice and typed production are not interchangeable evidence; neither has a universal
  authority ordering outside a specific claim/task.
- A passage is a content context; the question determines whether translation, vocabulary, or
  connected comprehension was assessed.
- A conversation model cannot grade its own dialogue.
- A learner-facing activity score is feedback, not automatically curriculum proof.
- Same-session repetition is practice, not independent retention evidence.
- Required asset types depend on the lesson's need. A reference card, passage, flashcard set, or
  conversation is not universal lesson anatomy.

## 5. How lessons and collections work together

Both reference the same claims and reviewed items, but they make different promises:

- A **lesson** introduces bounded core objectives/claims and owns a curated required path.
- A **collection** offers ongoing practice within a visible topic/level/grammar promise.
- The **profile** owns neither container; it summarizes credible evidence about shared claims.

Example:

```text
Lesson: Feelings Basics
  core objective: distinguish traits from current states
  atomic claims: ser/estar contrast + individually tracked feeling-word senses
  required proof: objective policy plus observed per-claim evidence without compensation
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
4. **Bounded sampling:** select a varied block without replacement. A miss affects the next block;
   the pilot does not mutate the persisted plan by requeueing inside the current block.

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

Learner controls change practice, not the meaning of lesson proof. If Recognition, Easier, size, or
an activity filter cannot satisfy a productive objective, the block is labeled practice-only and a
separate required check remains available. A versioned recipe defines how Both divides the bounded
block; the UI does not silently improvise it.

## 7. Lesson blueprint

Every lesson version should eventually declare this small, explicit blueprint:

```yaml
lesson:
  objective: learner-facing outcome
  promise: visible level, topic, grammar, and communicative scope

objectives:
  - objective: learner-facing outcome key
    role: prerequisite | core | extension
    sequence: integer
    proof_policy: named small template
    claims: [stable atomic claim keys]

instruction:
  orientation: one concise entry point
  claim_teaching_steps: optional just-in-time explanations/examples
  reference_cards: optional lookup support

practice:
  initial_block: bounded recipe
  candidate_pool: reviewed eligible items
  extension_pool: optional reviewed items/claims

proof:
  all_core_objectives_required: true
  atomic_claim_credit_is_non_compensatory: true
  sampled_items: unseen or meaningfully transformed
  support_rules: explicit
  semantic_form_and_orthographic_tolerance: explicit
  delayed_confirmation: separate from same-session completion

continuation:
  keep_practicing: another bounded block
  review_reasons: fixed explainable templates
```

The blueprint separates three quantities that are currently coupled:

- how many objectives and new atomic claims the learner is asked to understand;
- how many addressable reviewed items can exist in the practice pool;
- how many items the learner sees in a required session or proof sample.

Strong performance on one required objective cannot compensate for another, and success on one
observed atomic claim cannot mark its siblings Confirmed. A lesson objective may use a declared
coverage/generalization rule for progression without asserting unobserved member knowledge. Use a
few named proof templates, not a general rule language.

## 8. Generated content and library growth

Generation is an asynchronous supply process, not the session engine and not publication.

```text
learner request -> private candidate -> deterministic validation -> independent quality check
                -> approved private version for that learner

allowlisted aggregate demand -> separate canonical generation -> deterministic QA
                            -> human/native review -> new shared reviewed identity
```

Rules:

- Reuse eligible reviewed items before generating.
- More practice uses existing reviewed claims; Expand knowledge selects from a reviewed catalog.
- Never directly share, promote, or cross-user cache private output.
- Learner approval and popularity are preference signals, not linguistic validation.
- Aggregate only allowlisted topic/claim IDs and coarse counts above a minimum cohort; never forward
  raw or paraphrased private requests into shared generation.
- Preserve provenance, model/prompt version, source/parent identity, review actions, license, and
  lifecycle.
- Validate all generated structure and every learner edit; treat request text as untrusted.
- Begin with length-bounded plain text. Reject HTML, executable content, embedded instructions, and
  URLs; require per-object ownership checks, escaped output, moderation/reporting, and quarantine.
- Use exact hashes for dedupe first. Semantic similarity may aid a reviewer but cannot merge identity.
- Apply per-user generation/spend limits, candidate TTLs, quarantine, hot/cold separation, and
  deletion policies. These do not cap practice using reviewed content.

No global item ceiling should be invented before measuring bytes, query latency, duplication, review
throughput, reuse, and value per item.

Human/native review capacity is the shared-generation throttle. Queue caps and fail-closed
publication prevent generation from outrunning linguistic review. URLs and imported documents are a
separate future feature with their own rights and privacy review.

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

Future voice release gates must test transcription failures across target Spanish varieties,
common learner accents, devices/noise, and speech disabilities where lawful and feasible. Typed
fallback remains available, and ASR failure never becomes evidence of language weakness.

### Conversation

Conversation can contribute later through authored goal opportunities:

1. the system defines a communicative goal and elicitation without leaking the answer;
2. one primary claim and accepted semantic/form variants are declared;
3. a reliable transcript and support facts are captured;
4. an independent evaluator—not the dialogue model—applies the rubric;
5. the resulting atomic-claim observation remains correctable and versioned.

Open conversation initially produces coaching and review suggestions only. It gains profile authority
only after measured agreement with human/native raters. Failure to use a word spontaneously is not
evidence that the learner does not know it.

Full communicative task success is stored as a rubric/task outcome outside the atomic claim profile.
A constrained turn may later update one lexical or grammar claim; successfully ordering a drink
across turns is not reduced to that atomic language fact.

## 10. Minimal logical data model

| Record | Purpose |
|---|---|
| `knowledge_claims` | Stable reviewed lexical/chunk/grammar identities |
| `lesson_claim_scope` | Versioned objectives, atomic claim membership/roles, and named proof policy |
| existing items/targets | Authored payload plus one primary claim, supporting metadata, mapping version |
| `practice_sessions` | Exact bounded resolved plan and selection-policy identity |
| `practice_events` | Idempotent, correctable observed learner facts; raw input absent by default |
| `user_claim_state` | Rebuildable hot rollup for claim + recognize/produce text facet |
| existing container progress | Lesson/collection participation and presentation history |
| generation jobs/versions | Private/shared lifecycle, provenance, QA, retention, and cost |

Critical integrity rules:

- Use an opaque learner-scoped `clientEventId` bound to a canonical request fingerprint. The
  fingerprint includes item/direction/version metadata; if input equality must be checked, add only
  the purpose/version-specific keyed HMAC described below, never raw input or an unkeyed short-domain
  hash. Reuse with conflicting metadata/fingerprint is rejected. Reserve a pending event before
  uncertain AI work; ordinary retries return pending or the finalized event instead of starting
  another app call.
- Never hold a database transaction open during an AI call.
- Snapshot claim mapping, content, evaluator, profile-policy, and session-policy versions.
- Use server-received event time as authority; client time is telemetry. Snapshot learner-local date,
  IANA timezone and offset. Order by `(occurred_at, event_id)` and replay as of an explicit timestamp
  and policy version.
- Keep pilot aggregates order-independent where possible; serialize one `(learner, claim, facet)`
  update with an atomic upsert/row lock. Invalidation rebuilds that one row from valid events and
  records `policy_version` plus `last_processed_event`.
- Prove incremental profile state equals that full replay, including concurrent/out-of-order events,
  time-derived Due state, and invalidation.
- Keep large payloads, raw answers, audio, and transcripts out of the hot profile path.
- Normal telemetry, feedback, diffs, logs, and traces contain no raw or reconstructable learner
  answers, prompts, audio, or transcripts. Persist bounded error categories and authored correction
  references instead.
- Drop a normalized answer hash unless an immediate use is proven. If equality matching is required,
  use a purpose/version-specific keyed HMAC and still treat it as personal data.
- Account deletion covers database, workflow state, object storage, analytics, and documented backup
  expiry.
- One durable event is guaranteed; exactly one external provider call is not. If a provider succeeds
  and the app fails before finalization, stale-pending recovery records the ambiguous outcome and
  does not blindly repeat the call unless duplicate cost/risk is explicitly accepted.
- Source trust tier is snapshotted and versioned. The rollup never irreversibly collapses low-
  authority private evidence into curriculum-proof aggregates; proof is rebuilt from qualifying
  events.

The shadow pilot's canonical content lives in validator-checked manifests outside the frozen lesson
schema, keyed by immutable content IDs and seeded to serving tables:

```text
content/learning-claims.json
content/pilot-claim-mappings.json
content/pilot-lesson-blueprints.json
```

Before A3, choose one persistence authority: preferably a `practice_events` envelope with optional
1:1 graded detail, or extend planned `evaluations` to become that envelope. Do not implement both the
old lesson/set learning rollups and the new claim profile. This is initially a contract migration,
not a learner-data migration.

The persisted plan also snapshots a canonical candidate-pool/version hash, profile/event watermark,
policy version, reason codes, and canonical JSON hash. Sort candidates by immutable ID before
tie-breaking or seeded sampling.

Hot paths remain simple: batch-fetch one bounded candidate pool and its claim states, rank in
application memory, and persist one JSON plan; on submission reserve/finalize one event and update one
claim row. Minimum keys are unique `(user_id, client_event_id)`, event indexes for claim/facet/time and
session/time, primary `(user_id, claim_id, facet)` state, session status/time, and active
container/version items. No N+1 profile fetches or unbounded full-library ranking.

Reason codes are closed, versioned enums with separately localized learner-safe templates. A
`shadow_profile` flag, separate computed-versus-served decision fields, and a kill switch allow an
immediate return to the fixed recipe while valid event collection continues. Track stale pending
events, duplicate suppression, replay divergence, candidate/fallback counts, resolution latency,
repetition/diversity, invalidations/rebuilds, delayed outcomes, storage growth, and deletion proof.

Pilot grading is deterministic. Before any later AI grading or dialogue transmits learner content,
document each processor, training/retention setting, region, deletion path, and failure behavior;
privacy-required routing fails closed. Learners are clearly told when content, feedback, grading, or
conversation is AI-generated. Institutional/school deployment and service to minors require separate
legal, child-best-interests, and profiling gates.

Start with Postgres and a deterministic ranker. Do not initially add a graph/vector database, Redis,
embeddings, machine-learning ranker, prerequisite graph, multi-claim inference, or a production
FSRS/BKT/HLR model.

## 11. Two falsifiable pilots, not one ambiguous pilot

### Pilot A — shadow validity

Use a native-reviewed subset of A1-05 and an offline reviewed Feelings collection fixture. Before A6,
the fixture tests mapping, selection, and replay with test data only; it does not claim human cross-
source prediction. The current UI, fixed lesson recipe, completion, and unlock behavior remain
unchanged. The system records and replays shadow lesson facts; it does not serve adaptive
recommendations.

Exact initial matrix:

| Atomic claim | Facet/cell | First-block role | Later-check role |
|---|---|---|---|
| `grammar:ser-estar:trait-state` | `produce_text` | controlled cloze/minimal-pair practice | unseen transformed deterministic check |
| `lex:es:contento:sense1` | `recognize_text` | practice | unseen deterministic check |
| `lex:es:contento:sense1` | `produce_text` | practice | unseen deterministic check |
| `lex:es:cansado:sense1` | `recognize_text` | practice | unseen deterministic check |
| `lex:es:cansado:sense1` | `produce_text` | practice | unseen deterministic check |

The one eight-item fixture block is **practice, not proof**. A separate small later-day set supplies
unseen or meaningfully transformed checks. The remaining feeling words, ages, and numbers are outside
the first matrix. The fixture tests the event/profile seam, not all of A1-05.

Only deterministic authored-answer outcomes update the shadow state. AI/`close` results may be logged
as bounded evaluator categories for separate native-review analysis, but cannot drive the profile.
Connected-reading and full communicative-task results remain task outcomes outside this pilot profile.

The first real-learner run is limited to consenting adults fluent in the UI language, so English
translation ability is not mistaken for Spanish ability. Conclusions are scoped to English–Spanish
text tasks. The complete gold set is native-reviewed before data collection. Participants receive a
plain notice describing the shadow profile, purpose, retention, reset/deletion path, and report-grade
or report-item route. Pilot retention and backup-restoration deletion procedures are approved before
opening enrollment.

A server-side feature flag controls shadow writes/reads. Computed and actually served recommendations
are recorded separately. A kill switch stops profile reads and returns to the current fixed recipe
without rewriting valid events.

Pilot A fails if:

- two independent authors cannot map atomic primary claims consistently;
- native review finds the gold set or supporting-prerequisite mapping unreliable;
- incremental state differs from replay as of the same policy/time watermark;
- ordinary retries duplicate durable events or application-initiated evaluator calls;
- ambiguous provider outcomes or stale pending events cannot be detected and bounded;
- raw or reconstructable learner content appears in telemetry or durable event fields.

When the real fixed collection path arrives at A6, extend Pilot A without adaptive serving: reviewed
collection events should predict later lesson checks for the same atomic claim/facet. Failure of that
relationship is the live cross-source falsifier; no production collection subsystem is pulled
forward to manufacture it.

The shadow profile may initially expose observable facts only. If discrete states are tested, use an
explicitly provisional deterministic `policy_v0`, sensitivity-test it, and never show it as learner
mastery.

### Pilot B — adaptive UX and outcome

Begin only after Pilot A passes and the real session/collection path exists. This is the learner-
visible eight-item Recommended block, fixed-template reason codes, simple controls, Keep practicing,
and later unseen checks described elsewhere in V2.

Before enrollment, predeclare:

- randomized or within-learner comparison against the fixed sampler;
- participant criteria, learner-level analysis, sample/power approach, and attrition handling;
- delayed-check schedule and unseen/meaningfully transformed gold items;
- primary outcome: first-attempt unassisted success on unseen parallel items per minute practiced;
- secondary outcomes: completion, confusion, overrides, repetition/diversity, and continuation use;
- keyboard-only and screen-reader acceptance checks plus accessible Too easy / Too hard, report, and
  continuation controls;
- numeric go/no-go and safety thresholds.

Generation, conversation evidence, automatic cross-source lesson completion, numeric mastery,
complex controls, and corpus-wide claim migration remain excluded from both pilots. Flashcard self-
report may be observed only as a scheduling signal after the corresponding live path exists.

## 12. Phased adoption

1. **Gate 0-C — content seam, blocking A1-06.** Define facet-neutral atomic claim keys, one-primary
   mapping, objective/core/pool/proof blueprint, supporting-prerequisite evidence rules, and closed-
   set/form-family conventions. Approve one complete A1-06 worked example.
2. **Gate 0-A — application seam, blocking A3 persistence.** Decide canonical manifests and event
   authority, idempotency/correction/versioning, profile concurrency/replay, session snapshot,
   retention/deletion, provider-data policy, feature flag, and rollback.
3. **Offline and lesson-only shadow evidence.** Before A3, validate fixture mappings/replay offline;
   at A3, record lesson events and derive an internal profile while the existing experience remains
   the control. Do not pull the production collection path forward.
4. **Shadow ranking and live collection validation.** Exercise ranking/flashcard observations at the
   planned session stages; validate the real cross-source collection path when it arrives at A6.
5. **Adaptive bounded sessions.** Run Pilot B with deterministic ranking, reason codes, simple
   controls, and Keep practicing; compare delayed unseen outcomes with the fixed recipe.
6. **Cross-source learner UX.** Let reviewed collection evidence affect recommendations; test an
   explicit readiness-check/test-out path; add flashcard self-report.
7. **Generated supply.** Add private generation only after reuse, QA, privacy, deletion, cost, and
   rollback are proven; keep shared canonical production separate.
8. **Conversation evidence.** Begin only with authored opportunities and independently measured
   evaluator/transcript agreement.

Every phase must prove itself with real UI behavior and learner events before the next gains
authority.

## 13. Decisions still requiring founder input

These are product choices, not facts the architecture should silently decide:

1. Should qualifying cross-source evidence offer a visible readiness check/test-out, or only improve
   recommendations?
2. Should the learner-facing retained state be called Mastered, Confirmed, or Retained?
3. Which visible promises/layers should the first collections expose?
4. Does future lesson completion require path participation, same-day objective proof, or both—and
   what happens when the learner finishes a block without meeting one objective?
5. Which atomic vocabulary claims are individually required, sampled for an objective, or extension?
6. When do learner-selected controls make a session practice-only, and what do Easier/Stretch mean
   inside a visible promise?
7. How should semantic correctness, required grammatical form, spelling/accent tolerance, and
   accessibility accommodations affect production evidence?
8. Is any short-TTL raw typed-answer retention acceptable for appeals and evaluator QA?
9. What human/native review bar is required before generated content becomes shared and scored?
10. When, if ever, may validated private generated practice affect curriculum progress?
11. What agreement threshold is required before authored conversation observations affect the
   profile?
12. Where should connected-reading and full communicative-task outcomes live if later scheduling
   needs them?
13. What age range will AIdioma serve, and what age assurance, child privacy, and profiling defaults
   are required before minors participate?

Exact evidence thresholds, weights, novelty ratios, database ceilings, and ranking models should wait
for pilot data.

## 14. Ruling on P-007 and A1-06

### P-007

**Changes requested; do not approve as written.** Widening the raw lesson vocabulary cap solves the
wrong coupling. Numbers 0–30 may all be addressable in a reviewed practice pool without all 31
becoming new lesson concepts or appearing in one required run.

Replace P-007 with a decision that separately governs:

- lesson objective and atomic-claim load;
- addressable practice-pool capacity;
- bounded initial/session size;
- individual numeral items, compositional pattern claims, irregular anchor groups, and the functional
  age-expression objective;
- stratified sampled proof across anchors, compositional ranges, and age use.

Sampling may complete a declared functional lesson objective; it must not mark every unobserved
numeral claim Confirmed. This is the replacement convention P-007 lacked.

### A1-06

**Remain paused only through Gate 0-C.** Before authoring A1-06, approve one worked blueprint that
shows facet-neutral atomic lexical claims, *-er/-ir* form claims, one-primary item mappings,
supporting-prerequisite failure rules, and objective/core/pool/proof representation. A1-06 does not
need to wait for Gate 0-A concurrency or retention implementation, generation, conversation, cross-
source auto-completion, or a final mastery algorithm.

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

The first proposal and both review rounds remain historical evidence. V2 is panel-revised but remains
a non-authoritative pilot charter, not a migration/schema specification or permission to open a
real-learner pilot without the stated gates.
