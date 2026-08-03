---

## title: Adaptive learning system — design proposal
type: design-proposal
status: draft
updated: 2026-07-31

# Adaptive learning system — design proposal

> **Non-authoritative panel-revised draft.** This document proposes a ground-up learning model for
> AIdioma. It does not change current Specs, ADRs, schemas, roadmap scope, P-007, or application
> behavior. Adoption requires founder review and subsequent ADR/spec work. Independent findings and
> dispositions are recorded in [the panel review](adaptive-learning-system-panel-review.md).

## 1. Executive recommendation

AIdioma should become **knowledge-centered, not container-centered**, using explicit learner claims
rather than one universal mastery score.

Lessons, curated collections, private generated collections, flashcards, passages, quizzes, and
future conversations are different ways to teach or collect evidence about the same underlying
knowledge. A shared **User Knowledge Profile** should summarize the observable evidence for small,
reviewed claims and help determine what the learner is ready for, what needs reinforcement, and what
useful activity should appear next.

```text
Lessons -------------------\
Curated collections --------+--> practice events --> claim evidence
Generated collections ------+                            |
Flashcards -----------------+                            v
Conversations --------------/                  User Knowledge Profile
                                                         |
                                                         v
                                      recommendation + adaptive sessions
```

The system should permit unlimited practice while keeping each session bounded. It should reuse
reviewed content before generating more, preserve source and quality, and grow the shared library
only through validation, deduplication, privacy checks, and an explicit promotion gate.

## 2. Problem with the current model

The current design has strong integrity boundaries, but learning evidence is fragmented:

- Lesson content both teaches and supplies the fixed full-lesson practice arc.
- Lesson completion/mastery is tracked separately from collection progress.
- `user_item_stats` is lesson-item keyed; `user_practice_target_stats` is set-target/knowledge-key
keyed. The same knowledge demonstrated in different sources does not necessarily converge.
- Collections cannot contribute to lesson knowledge even when they test the same ability.
- Flashcards are non-graded and leave no per-card learning evidence.
- Conversations are deliberately non-credit except for explicitly authored targets.
- Static content limits, especially the 15-row lesson vocabulary ceiling, are doing two jobs:
controlling learner load and constraining how much addressable practice material can exist.
- Continue is defined as a full Mix arc. Adding addressable content therefore increases the normal
lesson run and may increase its completion burden.

P-007 exposes the coupling: representing numbers 0–30 as 31 separately addressable vocabulary
records would make them practiceable, but would also expand A1-05's current full session sharply.
Counting 31 records as one authoring concept does not make them one retrieval task for the learner.

## 3. Design principles

1. **One knowledge profile.** Credible evidence from every source converges on the same reviewed
  claims without pretending different claim types are directly comparable.
2. **Containers do not own knowledge.** Lessons and collections organize experiences; they do not
  create separate versions of “knowing *comer*.”
3. **Persist observations, derive policy.** Direction, modality, support, prompt/context, source,
  quality, evaluator, and time remain visible; tunable weights and one opaque mastery number are not
   historical truth.
4. **Instruction, practice pool, and proof are separate.** More optional material must not silently
  make a lesson longer or harder to complete.
5. **Bound sessions, not practice.** Every block is understandable and resumable; Keep practicing can
  start another block indefinitely.
6. **Reuse before generation.** Select reviewed unused material first; generate only when the useful
  eligible pool is genuinely thin.
7. **Generation is not publication.** Private validated material and shared reviewed material have
  different trust levels.
8. **Content quality beats apparent personalization.** Adaptation may choose among valid targets; it
  must not turn low-confidence content or assessment into curriculum authority.
9. **Explainable adaptation.** The system can state why an item was selected: new objective, weak
  production, due review, requested topic, or deliberate stretch.
10. **MCOO: minimal complexity for optimal output.** Add the smallest claim/event/profile seam that
  unlocks cross-source learning. Do not build a general ontology, multi-claim inference graph, full
    Bayesian tutor, or centralized content graph before real behavior requires it.



## 4. Minimal shared vocabulary



### Claim

A small, reviewed statement about what the learner can demonstrate. Initial kinds:

- **Lexical:** recognize or produce *comer* with the intended local sense.
- **Chunk/phrase:** recognize or produce *tengo … años*.
- **Grammar:** choose ser/estar correctly in a trait-versus-current-state context.

Communicative functions such as ordering a drink begin as separate task objectives, not claims on the
same numeric scale. Topics such as Restaurant or Family are discovery/context labels, not knowledge
claims. Do not pre-create every tense/person/modality combination. A lexical identity uses language,
lemma, part of speech, and a local sense only when ambiguity matters; grammatical form stays on the
item/event until a scheduling use case justifies another claim.

### Practice Item

One addressable prompt/response experience: word translation, sentence translation, MC question,
passage segment, constrained dialogue turn, or flashcard presentation. In the pilot it references:

- exactly one **primary claim** deliberately assessed;
- supporting vocabulary/tags used only for eligibility and diagnostics;
- topic and communicative context;
- base level/difficulty and prerequisites;
- supported directions/modalities;
- reviewed answers or deterministic grading data;
- version, provenance, quality tier, and lifecycle state.

Only the primary claim receives positive profile evidence in the pilot. Supporting-claim evidence and
multi-claim inference are deferred until attribution accuracy and storage value are measured.

### Container

A lesson or collection that selects and sequences instruction/practice. Containers reference items
or a versioned candidate pool; they do not duplicate learner knowledge.

### Practice Event

One learner interaction with an item. It records source, activity, direction, modality, attempt,
support used, prompt/context identity, observed outcome, evaluator/mapping versions, content version,
time/local day, and source quality. Typed/MC results and flashcard self-report share this event
envelope even when their result payloads differ. Conversation joins only after its narrower contract
is proven.

Every client submission carries a new opaque `clientEventId`. The server reserves a pending event
before any uncertain AI call so retries cannot duplicate the event or provider cost. Events support
explicit invalidation/supersession when grading, content, mappings, or transcripts are later found bad.

### User Knowledge State

A rebuildable rollup for one learner + Claim + observed facet. The pilot materializes only
`recognize_text` and `produce_text`, with observable aggregates such as first/last unassisted success,
distinct delayed-success days, recent failure, contexts/items succeeded, and due signal. The derived
recommendation state is **New / Needs review / Due / Confirmed**.

Do not begin with a generic numeric strength or confidence score. The durable event history remains
the evidence; the profile is a derived, versioned, replaceable view that must match a full replay.

## 5. Review chunk 1 — User Knowledge Profile and evidence



### What counts as evidence

Do not translate activities into universal weights. Persist the task and observable performance:


| Activity                     | Permitted initial inference                                              |
| ---------------------------- | ------------------------------------------------------------------------ |
| Flashcard self-report        | Scheduling preference only; never completion/retention proof             |
| Multiple choice              | Supported recognition evidence for its one primary claim                 |
| Typed recognition (ES→EN)    | Text-recognition evidence, qualified by support/retry/context            |
| Typed production (EN→ES)     | Text-production evidence, qualified by support/retry/context             |
| Later-day unseen retrieval   | Independent retention/transfer evidence for the same claim/facet         |
| Authored conversation target | Deferred until elicitation, transcript, rubric, and evaluator are proven |
| Spontaneous dialogue         | Review suggestion only in the initial conversation release               |


Learner-facing scores remain useful feedback, but credit-for-trying, hints, reveal, retries, MC, and
AI-mediated grading are not interchangeable knowledge evidence.

### Profile dimensions

- Recognition and production are the only materialized pilot facets.
- Reading, listening, typing, speaking, grammatical form, and accessibility context remain on events
and may earn a profile facet only when a concrete scheduling decision needs one.
- Absence is not failure. A learner who did not use a word in open conversation did not demonstrate
that they do not know it.
- Same-session repetitions and the same prompt do not masquerade as independent retention evidence.
- ASR failure, slower response, disabled modality, or accommodation use must not become inferred
language weakness.



### Progress semantics

Keep lesson experience and knowledge outcomes separate:

- **Lesson state:** not started / active / completed (the learner finished its required path or a
permitted readiness check).
- **Claim status:** New / Needs review / Due / Confirmed, derived from observable evidence.
- Existing learner-facing **Completed / Mastered** can remain if Completed means required objective
demonstrated and Mastered is narrowly defined as a decaying app threshold. The panel recommends
testing **Confirmed** or **Retained** because one later-day success is not permanent mastery.

Reviewed collection evidence should update claim readiness. Whether it
automatically completes a lesson or offers a visible “test out / already know this” path is a founder
UX decision; silently skipping instruction is not recommended.

### Cold start

Use the chosen A1 starting point, optional local readiness checks, broad uncertainty, and rapid
calibration from the first tasks. A general placement system is premature before higher-level content
exists. Never interpret lack of history as weakness in every claim.

## 6. Review chunk 2 — Lessons and the shared content library



### Lesson job

A lesson is a curated introduction and proof path for a bounded objective. It contains:

1. objective and prerequisite claims;
2. 1–3 core claims introduced;
3. concise instruction and optional reference material;
4. a small required practice/proof recipe;
5. a larger eligible practice pool;
6. optional extension claims/material;
7. completion and later-retention criteria.

The versioned lesson blueprint gives each claim a `prerequisite | core | extension` role and a small
named proof policy. Completion requires every core claim gate; strong performance on one claim cannot
compensate for failure on another. Do not build a general proof-rule language.

Example for A1-05:

```text
Claim: choose ser/estar in trait-vs-current-state contexts
Proof: unassisted successes across multiple unseen contrast items

Claim: understand and give an age within 0–30
Proof: sampled recognition and production across representative values
```

Instructional assets are not assessments:

- **Explanation:** short required teaching orientation.
- **Reference card:** optional lookup/table; no direct credit.
- **Flashcard:** a practice presentation over an item; can collect scheduling self-report.
- **Quiz, typed item, passage segment, constrained target:** assessment opportunities with explicit
claims. Translating a segment supports translation/lexical claims; it must not be interpreted as
general reading comprehension. Connected meaning questions assess reading comprehension.
- **Conversation seed:** a future scenario definition, not proof by itself.



### Required core versus practice pool

Adding 100 useful restaurant sentences to the library must not make the Restaurant Basics lesson 100
prompts longer. The lesson declares a bounded proof recipe; the SessionEngine chooses a sufficient,
diverse subset and may offer more afterward.

A fixed content-record cap should not be used as the learner-load control. Use separate limits:

- authored lesson objective/core-claim budget;
- maximum new claims introduced in one lesson;
- bounded initial session size/time;
- unlimited follow-on practice blocks;
- library and generation lifecycle controls.



### Topic progression

The same topic can span levels without creating unrelated silos. For Restaurant:

- early lesson/targets: small food lexicon, present-tense chunks, basic ordering;
- later lesson/targets: expanded lexicon, past forms, complaints, narration;
- one umbrella topic with visible layers such as Restaurant Basics, Ordering and Requests, and
Talking About a Past Meal;
- the profile recommends a layer; adaptation varies practice inside its visible promise.

Target prerequisites and primary-claim metadata—not a single collection-level label—guide level-safe
selection. Grammar must not change invisibly because the profile decided the learner was ready.

### Minimal migration strategy

Do not normalize the whole authored corpus immediately. First add one stable primary Claim reference
to a small pilot slice of existing lesson items and collection targets, plus the versioned lesson
claim blueprint. Keep canonical JSON and immutable item IDs; snapshot the resolved claim and mapping
version on every event so later edits do not reinterpret history. Build a centralized reusable
practice-item library only when cross-container reuse and generated promotion need it.

## 7. Review chunk 3 — Collections and adaptive sessions



### One collection model

Curated and private generated collections use the same versioned shape:

- identity, title, description, facets/topics, owner/visibility, provenance, quality tier;
- candidate practice targets;
- supported activity capabilities;
- default session intent and controls.

Origin and quality differ; the practice contract does not.

Collections provide a candidate pool, not one fixed difficulty. Each resolved session records the
exact selected item IDs/versions and configuration so results are reproducible.

An umbrella topic may contain several visible level/grammar promises. “At my level” recommends one;
the learner can choose another. Adaptation happens within that promise rather than silently turning a
beginner collection into a later-tense course.

### Eligibility before ranking

1. **Hard eligibility:** supported activity/direction, safe/active quality tier, requested promise,
  and no invalid form combinations.
2. **Soft readiness:** unknown prerequisites and level distance lower rank but do not create false
  lockouts; reviewed fallback and explicit Stretch remain available.
3. **Utility ranking:** need, due state, relevance, novelty budget, diversity, saved status,
  recent repetition, and user-requested challenge.
4. **Bounded sampling:** choose a varied block without replacement; requeue misses deliberately.

The initial ranking should be a readable weighted formula, not machine learning. Log selection reasons
so it can be debugged and tuned.

### Dynamic controls


| Control    | Recommended default                              | User ownership                                        |
| ---------- | ------------------------------------------------ | ----------------------------------------------------- |
| Direction  | Favor the Due/Needs-review facet; otherwise Both | Detailed override under Options                       |
| Difficulty | Recommended profile-relative challenge           | Easier / Recommended / Stretch under Options          |
| Size       | Standard bounded block                           | One visible Quick / Standard / Focused or time choice |
| Intent     | Balanced                                         | Reinforce / Balanced / Expand                         |


Capability defines what is possible, the profile recommends a default, and the learner may override
within valid bounds. Snapshot settings at session start; changing them starts another block.
The default surface has one dominant **Recommended practice** action rather than a control panel.

### Keep practicing

Keep practicing resolves another block with recent-item exclusion and the same intent. It does not
append indefinitely to one session. Prefer, in order:

1. due/weak and unseen reviewed items;
2. reviewed variations already in the eligible library;
3. a reviewed fallback block when the preferred pool is thin;
4. asynchronous generation only in its later gated phase.

No learner-facing lifetime practice cap is required.

## 8. Review chunk 4 — Generated content and library growth



### Two distinct learner intents

- **More practice:** generate new contexts/items using claims the learner is already learning.
- **Expand knowledge:** deliberately introduce new eligible vocabulary/phrases.

Never interpret Keep practicing as permission to flood the learner with new concepts.

### Lifecycle

```text
request -> normalized/deduplicated job -> structured candidate -> deterministic validation
        -> independent quality check -> private learner review -> approved private version

aggregate sanitized demand -> separate canonical generation job -> deterministic QA
                            -> human/native review -> new shared canonical identity
```

Generated targets initially reference existing reviewed Claims and create the same event facts. Do not
create arbitrary private claims or directly promote private output. Expand knowledge selects from a
reviewed lexical catalog until a later governance decision proves another route safe.

### Trust tiers

1. **Reviewed canonical:** eligible for curriculum/shared scored use.
2. **Validated private:** usable by its owner with clear provenance and low profile authority; not
  curriculum proof and never silently shared.
3. **Candidate/quarantined:** retained for review or diagnostics; not served as authoritative content.

Learner approval is a preference signal, not linguistic validation. Popularity, successful use, or a
low report rate never automatically publishes scored content.

### Growth controls

- Exact content hashes first; semantic similarity is a reviewer aid, not automatic identity merging.
- Reuse before generation; normalized request reuse remains owner-scoped initially.
- Per-user generation/spend limits, not practice limits.
- Candidate caps per knowledge/facet/topic and expiration of unused private drafts.
- Usage, report, and quality signals for promotion/retirement.
- Treat request text as untrusted data; validate structure and revalidate every learner edit.
- Do not reuse private output across users. Strip/block personal data before even considering a later
explicit contribution flow.
- Version provenance with the content: origin, creator/owner, source/parent IDs, model/prompt and
review activity, exact allowlisted license expression, attribution, promotion, and quarantine.
- Archive/cold-store rather than retain every failed or superseded candidate in hot serving tables;
archive remains retention and still has an explicit TTL/deletion policy.

Do not choose an arbitrary global maximum now. Review capacity and linguistic quality will constrain
growth before database capacity. Size retention from measured bytes, query latency, duplication,
review throughput, and value per item.

## 9. Review chunk 5 — Flashcards, voice, and conversation



### Flashcards

Permit self-report after covert retrieval: **Cue → Reveal → Missed / Recalled**. Store direction,
response, attempt/support facts, and item identity. Use it immediately for card scheduling, but never
let it complete a claim or establish retention until its predictive value against later unaided typed
retrieval is measured. Response time remains accessibility-sensitive telemetry, not proficiency.

### Voice

Transcribed, learner-confirmed answers use the same authored target and evaluator as typing while
retaining voice provenance. Transcript uncertainty lowers or blocks evidence; a materially edited
transcript is typed-correction evidence, not clean speaking evidence. Pronunciation remains separate.

### Conversation

Conversation contributes through:

- **Authored goal opportunities:** specify an elicitation that does not leak the answer, accepted
semantic/form variants, support level, one primary claim, and a task-success rubric; independently
evaluate a reliable transcript.
- **Structured observations:** initially create review suggestions only. Profile authority waits for
measured agreement with human/native raters.
- **Recap-to-practice:** convert errors and weak retrieval into reviewed or generated follow-up items.

The dialogue model never grades itself. A separate evaluator owns evidence. Communicative success
across turns—not mere occurrence of a target phrase—is the intended future construct. Transcript
retention, deletion, consent, age strategy, and personal-data handling require an explicit privacy
decision before build.

## 10. Proposed minimal data architecture

This is a logical model, not a migration prescription.


| Record                       | Purpose                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| `knowledge_claims`           | Stable lexical/chunk/grammar identities and minimal reviewed metadata                        |
| `lesson_claim_scope`         | Versioned prerequisite/core/extension claims and small proof-policy keys                     |
| existing lesson/set items    | Authored payloads; gain one primary claim plus supporting metadata/mapping version           |
| `practice_sessions`          | One bounded block with resolved-plan JSON, engine/policy version, seed, reasons, and hash    |
| `practice_events`            | Unified observed facts for graded attempts and flashcard self-report; idempotent/correctable |
| `user_claim_state`           | Rebuildable hot rollup per learner/claim for recognize_text or produce_text                  |
| existing lesson/set progress | Container participation/presentation history, not another knowledge truth                    |
| generation jobs/versions     | Private generation lifecycle, provenance, QA, retention, promotion                           |


In the pilot, snapshot the primary claim and mapping version directly on each event; do not add a
multi-claim event junction. Before A3 persistence lands, decide whether graded evaluation fields live
as optional detail on `practice_events` or in the existing planned `evaluations` 1:1 detail. Do not
build both old lesson/set learning truths and the new claim profile.

Raw typed input is absent from the durable profile/event row by default. If appeals/evaluator QA need
it, use a separate encrypted, access-restricted short-TTL store with an explicit purpose. Raw audio is
transient; saved conversation transcripts must be optional and deletable. Account deletion covers
database, workflow state, object storage, analytics destinations, and documented backup expiry.

### Indexing and scale

- Unique `(userId, claimId, facet)` on hot claim state.
- Unique `(userId, clientEventId)` before evaluation; time/session/source indexes on events.
- Compact facet enum `recognize_text | produce_text`; keep other dimensions on events.
- Idempotency key per submitted event and generation step; stale-pending recovery is explicit.
- Content/version references remain immutable; derived rollups can be rebuilt.
- Keep large generated payloads/transcripts out of hot rollup rows.
- Store the exact bounded resolved session plan rather than recomputing it.
- Update the one just-practiced claim row in a short transaction; never hold a transaction open for AI.
- Gate 0 chooses atomic/order-independent aggregate updates or row locking and deterministic ordering;
concurrent events must replay to the same state without lost updates.
- No partitioning, graph/vector database, Redis, embeddings, or semantic merging before measurement.



## 11. Selection and profile update sketch

```text
resolveSession(intent, controls, profile):
  candidates = eligibleTargets(intent, controls)
  scored = candidates.map(target => utility(target, profile))
  plan = diverseBoundedSample(scored, requestedSize)
  persist exact plan + reason codes + policy version + seed
  return plan

recordEvent(event):
  reserve pending event by learner + clientEventId
  return existing result on retry
  resolve immutable source/version + snapshotted primary claim
  compare/evaluate without an open database transaction
  finalize observed facts and the one affected claim row
  derive lesson/set presentation state
```

Do not call an LLM in the selection loop. AI may generate missing content asynchronously or evaluate
meaning-uncertain answers behind the existing comparison-first boundary.

## 12. Failure modes and safeguards

- **False precision:** a universal strength/confidence number looks authoritative across unlike
claims. Pilot observable claim facts and discrete recommendation states instead.
- **Self-confirming sampler:** serving only weak items can trap the learner. Reserve diversity and
occasional confirmation/exploration.
- **Difficulty oscillation:** smooth adjustments across sessions and honor explicit user intent.
- **Cross-source double counting:** repeated copies of the same prompt must not masquerade as diverse
evidence; use knowledge and content identity.
- **Incidental-credit inflation:** exactly one primary assessed claim; supporting context earns no
positive profile credit in the pilot.
- **Generated-content poisoning:** trust tiers, validation, provenance, reports, and promotion gates.
- **Profile corruption from AI/ASR/content defects:** structured schemas, versioned evaluators and
mappings, invalidation/supersession, transcript gates, and replayable rollups.
- **Gaming self-report:** self-report schedules cards but cannot complete claims.
- **Cold-start frustration:** chosen start, local optional checks, uncertainty, rapid updates, easy
too-easy/too-hard override.
- **Opaque recommendations:** expose plain-language selection reasons and allow controls.
- **Privacy leakage:** no direct promotion/cross-user cache of private content; raw input/transcript
minimized, purpose-limited, TTL-bound where retained, and deletable.
- **Runaway cost:** comparison first, reuse before generation, asynchronous bounded jobs, budgets.
- **Database growth:** dedupe, TTL/quarantine, hot/cold separation, and usage-based promotion.
- **Invalid mastery claims:** completion is non-compensatory across core lesson claims; delayed unseen
retrieval is distinguished from same-item practice success.
- **Taxonomy conflation:** assessed Claims and diagnostic ErrorTags are conceptually separate even if
the pilot temporarily maps some existing tags.



### Observability and learning validity

Separate operational, content-quality, and learning metrics. Initial measures:

- first-attempt unassisted performance on later unseen items per minute practiced;
- predicted Due/Needs-review state versus later observed recall and transfer;
- fixed-recipe control versus shadow/adaptive recommendation outcomes;
- reason-code distribution, learner overrides, fallback/no-pool rate, repetition, and starvation;
- comparison/AI latency, calls, cost, duplicate suppression, stale pending events, and profile replay
divergence;
- content reports, grading corrections, invalidated events, generated validation/native-review
rejection, reuse, deletion, and quarantine impact;
- database rows/index bytes and raw-input/transcript deletion proof.

Persist session-policy and experiment assignment. Engagement alone is not learning success. Normal
telemetry never includes raw answers, prompts, audio, or transcripts.

## 13. Feasibility and phased delivery



### Gate 0 — authority decisions before A3 persistence

- Define minimal Claim keys, one-primary-claim mapping, and versioned lesson proof blueprints.
- Decide client-event idempotency, pending/final event states, correction/invalidation, and mapping,
evaluator, session-policy, and profile-policy versioning.
- Define atomic profile-update/concurrency semantics and prove out-of-order replay equivalence.
- Decide raw-input/transcript retention and deletion; do not bake permanent `userInput` in by default.
- Define the exact bounded session-plan snapshot and the two text profile facets.



### Phase A — shadow evidence seam before personalization

- Map a small A1 pilot slice plus one overlapping collection; do not backfill the corpus.
- Record observable cross-source facts and expose an internal diagnostic profile.
- Keep current learner recommendations, completion, and deterministic evaluation as the control.
- Prove incremental state equals full replay and two independent authors can map claims consistently.



### Phase B — adaptive bounded sessions

- Resolve direction/difficulty/size from the shadow claim state with small user controls.
- Add selection reasons, Keep practicing, recent-item exclusion, and cold-start behavior.
- Compare against the fixed recipe with scripted profiles, then delayed unseen learner checks.



### Phase C — cross-source progress

- Let reviewed collection evidence affect claim readiness and recommendations.
- Decide explicit test-out/completion behavior through UI testing.
- Add self-reported flashcard evidence.



### Phase D — generation and promotion

- Generate asynchronously only when reviewed pools are thin; never block Keep practicing.
- Keep private output and the separate canonical shared-production lifecycle isolated.
- Prove privacy, dedupe, costs, quality, deletion, and rollback.



### Phase E — conversation evidence

- Add authored elicitation/rubric/opportunity evaluation first.
- Add grounded observations only after transcript/evaluator agreement is measured.

Each phase should be testable in the UI with real events before the next layer gains authority.

## 14. What not to decide prematurely

- Exact mastery thresholds or evidence weights.
- A generic numeric strength/confidence model.
- A fixed percentage of new versus review material.
- A global database item ceiling.
- Machine-learning ranking.
- Full knowledge ontology or every CEFR mapping.
- Automatic public promotion of generated content.
- Permanent retention of raw typed answers or transcripts.
- General placement testing before A2+ content exists.

These require real learner behavior, content-error data, latency/cost evidence, or explicit privacy
choices.

## 15. Immediate consequences if adopted

- P-007 should not be approved as a raw-cap widening in isolation. Complete number knowledge can be
addressable in the library without requiring every member in A1-05's initial proof session. A
replacement decision should separate lesson claim scope, addressable practice-pool capacity,
bounded session size, and sampled proof.
- A1-06 should wait only until Claim identity, one-primary-claim mapping, and lesson
core/pool/proof conventions are decided; it need not wait for generation, conversation, or a final
personalization algorithm.
- Existing A1 content remains valuable. The proposal adds references and delivery rules rather than
discarding authored explanations, vocabulary, sentences, passages, quizzes, or review evidence.
- Current integrity rules—immutable IDs, versioning, server-owned answers, content validation,
provenance, and comparison-first evaluation—remain foundations.



## 16. Panel outcome and smallest falsifiable pilot

The independent panel unanimously approved the direction but required the MCOO corrections now
incorporated above. Full findings, external references, and dispositions live in
[the panel review](adaptive-learning-system-panel-review.md).

Pilot A1-05's ser/estar contrast plus six feelings and one overlapping Feelings collection. Treat
ages/numbers as a separate claim; do not expand P-007 for the pilot.

- Short explanation and one eight-item Recommended block.
- Results, fixed-template selection reasons, and Keep practicing.
- Collection practice updates the same shadow claim state.
- Flashcards use Cue → Reveal → Missed / Recalled.
- Later-day checks use unseen parallel items.
- No generation, conversation, automatic lesson completion, complex controls, or numeric mastery.

The pilot fails if authors cannot map primary claims consistently, incremental state differs from
replay, retries duplicate events/AI calls, adaptive selection improves repeated prompts but not
delayed unseen performance, collection evidence does not predict lesson-check performance, or
learners cannot explain why they received the material.