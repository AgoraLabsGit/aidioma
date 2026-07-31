---
title: Adaptive learning system — proposal V4
type: design-proposal
status: review-candidate
updated: 2026-07-31
supersedes: adaptive-learning-system-proposal-v3.md
based-on-review: adaptive-learning-system-adversarial-panel-review-v3-1.md
---

# Adaptive learning system — proposal V4

> **Non-authoritative design proposal.** V4 does not change current Specs, ADRs, schemas, roadmap,
> lessons, P-007, dependencies, or application behavior. It narrows V3 into an evidence-first product
> sequence while retaining V3's hard learning, content, privacy, rights, correction, and runtime
> guardrails. Adoption still requires founder decisions and the appropriate authority-changing work.

## 1. Decision summary

V4 accepts the adversarial panel's core correction: AIdioma should prove the smallest version of its
knowledge-profile hypothesis before building the full adaptive and generated-content platform.

The minimum coherent system is:

> **separate lesson and collection content + one shared learning-target key + one observation
> history + one deterministic bounded planner + one shadow profile + one explainable recommendation**

V4 therefore:

- narrows the initial measurable goal from general Spanish learning to adult-A1 text constructs;
- makes delayed transfer and learner effort separate experimental outcomes rather than one gameable
  production ratio;
- introduces a Now/Next/Later capability sequence;
- begins target identity as a small repository manifest rather than a runtime ontology;
- chooses one proposed observation authority before A3 instead of parallel evaluation truths;
- reduces the first planner to two block sizes and one due/weak adaptation rule;
- defines uncapped practice honestly without promising infinite novelty;
- keeps Evidence Packs and content production repository-first;
- restricts automatic R0 release to deterministic, mechanically answer-preserving transformations;
- defers private generation and Workflow until measured content starvation and request demand justify
  them;
- requires an authority-delta ledger before implementation can follow V4.

V4 does **not** weaken:

- server-owned grading and specialized activity results;
- separate recognition and production evidence;
- delayed, varied, unassisted confirmation;
- immutable content identity/versioning;
- idempotency, correction, invalidation, replay, quarantine, and rollback;
- qualified linguistic review for learner-visible model-authored language;
- source scope, bilingual-answer authority, dialect policy, licensing, privacy, or accessibility;
- independent second-model review for every run that calls a generation model;
- repository authority for canonical content, Neon authority for product state, or Workflow's exclusion
  from the live learning loop.

## 2. Optimization and measurement contract

### Long-horizon product aspiration

AIdioma aims to help each learner acquire useful, durable Spanish efficiently through reviewed
content, a trustworthy knowledge profile, and understandable next-step recommendations.

The optimization order remains:

1. linguistic and assessment correctness, safety, privacy, rights, accessibility, dialect fairness,
   and recoverability;
2. durable learning and transfer with low false-Confirmed risk;
3. individual fit, learner agency, and visible scope;
4. safe practice breadth without novelty for its own sake;
5. minimal operational and conceptual complexity;
6. sustainable content, model, reviewer, storage, and runtime economics.

An earlier priority cannot be traded for a later one without an explicit founder-approved decision.
Engagement, time in app, streaks, raw score, completion, generated volume, and model agreement remain
diagnostics rather than learning success.

### Initial validated construct

The first experimental goal is:

> **Estimate durable transfer in declared adult-A1 Spanish text recognition and text production
> constructs, reported separately by direction and target family.**

This is not yet a measure of general Spanish proficiency. Connected reading, listening, speaking,
interaction, mediation, pragmatics, and whole-conversation performance require their own validated
instruments before they can join product-learning claims or atomic credit.

### Experimental decision metric

Pilot B has two co-primary results:

1. incremental delayed transfer on fixed, common, held-out anchors versus a simple deterministic
   baseline;
2. total learner effort under a predeclared time and exposure definition.

Learning efficiency is a secondary derived result with uncertainty. Absolute learning, construct
coverage, false-Confirmed risk, attrition, learner agency, dialect, accessibility, accommodation, and
subgroup outcomes are guardrails. Raw time efficiency is never compared across accommodation groups
as a product-ranking objective.

### Anchor and causal-validity rules

- A qualified-human-reviewed anchor blueprint declares construct, direction, difficulty, answers,
  dialect/register, and parallel forms.
- Anchor items and near-duplicate item families stay outside serving, adaptation, generation/model
  training, and ordinary review queues.
- Randomized arms receive common anchor forms at predeclared horizons.
- The baseline uses the same reviewed eligibility pool and a simple deterministic due/recency rule.
- Analysis is intent-to-treat and predeclares baseline adjustment, eligibility, minimum exposure,
  missingness, attrition sensitivity, exclusions, minimum sample, and uncertainty.
- Transfer and cross-source claims hold out learners, source containers, items, and near-duplicate
  families as appropriate.
- Delayed-check exposure is recorded because the check itself may teach.

### KPI registry contract

No KPI authorizes a gate until its registry entry declares:

```text
metric class: outcome | leading | diagnostic | guardrail | operational
construct and permitted decision/use
unit of analysis
numerator and denominator
eligible event and permitted exclusions
cohort, horizon, minimum sample
missing-data and attrition rule
instrument/content/evaluator/policy versions
comparator and uncertainty rule
owner, threshold, decision, failure action
```

The measurement/instrument owner is independent of the feature-policy owner. The analysis plan and
content hashes freeze before enrollment; null and negative results remain part of the decision memo.

### KPI families

| Class | Initial measures | Misuse prohibited |
|---|---|---|
| Learning outcome | delayed held-out recognition and production transfer; retention by declared horizon; construct coverage | pooling unvalidated modalities or using easier adaptive items as the instrument |
| Profile validity | fixed-horizon calibration, discrimination, coverage, and false-Confirmed upper bound against simple recency baselines | treating prediction as proof that adaptation caused learning |
| Adaptation | randomized incremental transfer versus the fixed baseline; effort and guardrail comparison | declaring success from recommendation acceptance or profile calibration alone |
| Content quality | seeded critical/major detection; blinded natural-sample audit; accepted-answer false rejection; reports, quarantine, correction, and defect-free utilization | equating reviewer/model agreement or generated volume with correctness |
| Product viability | first valid evaluated block; confusion abandonment; recommendation comprehension; control/trust; voluntary return opportunity; willingness to continue/pay | substituting engagement or payment for learning |
| No-cap service | in-promise next-block fulfillment; fallback; exhaustion; wait time; repeat diversity | counting unrelated fallback as fulfillment or guaranteeing novelty |
| Reliability | duplicate durable observations; replay divergence; learner-path latency/error; stale/orphan state; deletion and rollback proof | hiding retries, invalid states, or unbounded queues inside averages |
| Economics | cost per served valid block; cost and reviewer minutes per used audited asset; reuse; backlog; marginal experimental cost per incremental effect | lowering acceptance/qualification standards to improve unit cost |

Zero missed seeded critical defects is a finite gate rule. Any observed critical production defect
causes immediate quarantine/rollback. Natural-sample escape risk is reported with a confidence bound;
no finite sample proves a statistical zero rate.

### Product scores excluded from learning ground truth

Until separately validated, Pilot A/B ground truth cannot be:

- Today's accuracy, lesson Completed/Mastered, content coverage, or session completion;
- best score or a credit-for-trying floor;
- same-session requeued retrieval;
- flashcard self-report;
- hints, time, or recommendation acceptance.

These may remain product/scheduling facts under current authority while the proposed profile is
shadow-only.

## 3. Capability sequence

### Now — prove semantics and one event truth

- Gate 0-C: target keys, one-primary mapping, supporting-demand rules, objectives/proof policy,
  lesson anatomy compatibility, and one executable A1-06 blueprint.
- One overlapping curated collection fixture using the same target keys.
- An authority-delta ledger covering every current-to-V4 change.
- Anchor/instrument rehearsal for one bounded A1 recognition/production construct.
- One append-only proposed observation authority and replay/correction fixtures before A3.
- Existing learner-facing behavior remains authoritative; new target/profile output stays shadow-only.

### Next — prove useful prediction and one adaptive decision

- Curated collections with distinct visible topic/level/grammar promises.
- Saved items as the initial user-organization surface.
- Short/Standard deterministic blocks and Keep practicing.
- Shadow target state derived from qualifying observations.
- Pilot A prediction against `last unassisted result + elapsed time` and current simple heuristics.
- Pilot B tests only Due/Needs-review or weaker-direction priority against the frozen baseline.
- Deterministic Continue → Review → Next lesson recommendation with one optional relevant collection.
- A practice-supply pilot measures pool exhaustion before any on-demand generation.
- One authored conversation-checkpoint pilot; ordinary dialogue remains coaching/task outcome only.

### Later — only after evidence earns complexity

- named user-created collections beyond Saved;
- additional profile facets or connected/communicative outcome constructs;
- Reinforce/Balanced/Expand controls or more dynamic difficulty/size policies;
- recommendation ranking or ML;
- private model-generated collections and Workflow;
- shared/canonical generation automation;
- runtime-normalized Evidence Bank or target ontology;
- graph, vector, cache, embedding, or semantic-identity infrastructure;
- conversation-wide atomic credit.

Later does not mean rejected. It means the owning hypothesis, KPI, migration need, and failure mode
must be demonstrated before the capability enters an authority or implementation packet.

## 4. Core content and learner concepts

### Learning target key

A stable, facet-neutral identity for one locally schedulable meaning/form capability, initially stored
in a small version-controlled manifest. Examples:

```text
lex:es:comer:sense1
form:es:comer:present:yo
contrast:es:ser-estar:trait-state
chunk:es:tengo-anos
```

Recognition or production belongs to an observation facet, not the target key. A semantic change
creates a new key. Topics, lesson objectives, diagnostic errors, difficulty, and scores are not
target keys.

The manifest is the minimum form of V3's atomic-claim concept. A runtime target table, ontology,
alias-merging system, or normalized graph waits for measured query/editorial need.

### Objective and proof reference

A lesson objective is learner-facing text plus a named proof-policy reference over target keys. It is
authored with the lesson; it is not initially a separate runtime entity. One lesson normally has 1–3
objectives, which does not impose a 1–3 target or vocabulary cap.

### Practice item

An addressable teaching, practice, or check opportunity keeps its source-owned content shape. Scored
pilot items add:

```text
stable source item identity + content version
optional primary learningTargetKey
supporting demand refs/tags
purpose: teach | practice | check
activity + direction + modality
reviewed evaluator/answers and tolerances
provenance/trust/lifecycle
specialized payload
```

Lesson and collection items do not need one universal storage table. They share target identity and
observation contracts first. Supporting demands affect eligibility/diagnosis but earn no positive
pilot evidence.

### Learner-facing containers

- **Lesson:** curated introduction to bounded objectives with a required path and proof conditions;
  it may advance curriculum progression.
- **Collection:** optional ongoing practice under a visible topic, level, grammar, or communicative
  promise; it cannot silently complete a lesson.
- **Saved:** a learner-owned reference/list over reviewed items, not initially another knowledge or
  collection system.

Named user-created collections may later group reviewed item references. Private generated
collections remain a separate later trust tier and never copy or fork learner knowledge identity.

### Level-sensitive collections

One collection does not silently change from present to past tense. Use discrete reviewed promises
such as Restaurant Basics, Ordering and Requests, and Talking About a Past Meal, grouped under a
Restaurant topic. “At your level” recommends among promises; the learner can still choose another
visible scope.

Curricular alignment, usage frequency, linguistic complexity, authored challenge, and empirical
learner difficulty remain separate metadata. Difficulty changes cannot silently introduce an
undeclared grammar target.

## 5. Learner experience and content anatomy

### Minimum learner loop

1. Continue the current lesson, Review due work, or Explore a collection.
2. See the objective or collection promise and the block size.
3. Receive concise instruction/reference only when required.
4. Complete a finite reviewed block with visible target/purpose and appropriate support.
5. See what happened without overstating retention.
6. Stop, save, choose another path, or Keep practicing.
7. On return, receive an understandable recommendation; shadow profile output cannot change
   completion/unlock until Pilot B passes and authority changes.

Three facts remain distinct:

- **Session finished:** the block ended.
- **Lesson Completed:** the current authoritative progression rule was satisfied.
- **Target Confirmed:** a proposed rebuildable scheduling state derived from delayed qualifying
  evidence; shadow-only initially.

### Component anatomy

| Component | Learner job | Specialized data | Initial evidence authority |
|---|---|---|---|
| Explanation | Understand an idea | objective/target links, concise rule/examples, source pack | instruction only |
| Reference card | Look something up | rule/table/examples, target links, source pack | support only |
| Flashcard | Retrieve then reveal | cue, answer, direction, target, Missed/Recalled | item scheduling only; never confirmation |
| Typed practice | Recognize or produce | prompt, accepted answers/evaluator, direction, form/meaning tolerances | qualifying target evidence when valid and unassisted |
| Quiz | Make a constrained choice | options, answer, rationale, target | task-specific supported evidence |
| Passage | Build connected meaning | text/segments, questions, provenance | atomic checks may qualify; connected-reading outcome remains separate |
| Conversation | Accomplish a goal | scenario, dialogue, authored checkpoints, task rubric | checkpoint evidence only; whole-task outcome separate |
| Evaluation | Interpret a response | result-specific comparison/verdict/defects, evaluator version | creates an observation, not mastery |
| Confirmed | Schedule retained knowledge | delayed varied qualifying observations under a versioned policy | rebuildable state, never permanent truth |

No lesson must contain every component unless the binding executable schema version requires it.
Gate 0-C decides the schema/anatomy compatibility before A1-06; placeholder components are forbidden.
A conversation model never grades its own dialogue.

## 6. Minimal session, observation, profile, and recommendation contracts

### Session planner

Input:

```text
scope: lesson | due-review | collection
requestedSize: short | standard
optional direction override
eligible reviewed items
shadow target-state snapshot
policyVersion
```

Output persisted for resume/audit:

```text
session identity
source scope/promise
ordered item identities + content versions
direction and purpose per item
learner-safe selection reason
policyVersion
created/started/completed/ended timestamps
```

Short and Standard begin at 5 and 10 items unless a current authority says otherwise. Cold start
alternates directions. Later selection favors Due/Needs-review and the weaker direction while staying
inside the visible promise. Recent misses/due items precede unseen safe variation. Keep practicing
creates another block and avoids the prior block where the reviewed pool permits.

Candidate-pool hash, profile watermark, random seed, and canonical plan hash are deferred until a
named experiment, replay, or debugging requirement proves the exact resolved plan insufficient.

### Observation authority proposed before A3

One sparse append-only `learning_observation` concept represents learning-relevant interactions:

```text
learner + session + source container
source item identity + content version
optional primary target key + recognize_text | produce_text facet
teach | practice | check
activity + direction + modality
attempt/retry + support/hint/reveal
discriminated result: translation | choice | reading_task | self_report | conversation_checkpoint
evaluator + mapping + policy versions
server time + local-day context
idempotency identity + correction/supersession identity
```

Unlike result types never share a universal score. Events store observable facts rather than fixed
mastery weights. Corrections or invalidations rebuild derived state from valid observations.

Gate 0-A decides raw-response retention: purpose, access, encryption, TTL, deletion, whether corrected
evaluators may regrade prior responses, and how deletion reaches backups/operational artifacts.

### Shadow target state

For learner + target + text facet, derive:

- New
- Needs review
- Due
- Confirmed

Confirmation requires declared delayed, varied, unassisted qualifying evidence. Self-report and
same-session retry affect item scheduling only. Do not prepopulate learner × all-target rows; compute
or sparsely materialize observed targets. A hot state table waits for query/latency evidence.

### Deterministic recommendation

1. If the current lesson is incomplete, recommend Continue.
2. Otherwise, if meaningful work is due, recommend Review.
3. Otherwise, recommend the next lesson.
4. Offer one relevant collection as an optional alternative.

Show one plain-language reason. No ranking service or learned policy is needed initially. Shadow
state cannot complete, fail, unlock, or reorder the curriculum until the relevant pilot and authority
gate pass.

## 7. Honest uncapped practice

V4 defines:

- **No cap:** no product-imposed limit on successive bounded sessions.
- **Novelty:** best effort and never guaranteed.
- **In-promise fulfillment:** another safe block matching the visible topic/grammar/level promise.
- **Fallback:** a separately labeled and measured alternative.
- **Exhaustion:** the reviewed pool cannot create another sufficiently distinct in-promise block.

Practice supply order:

1. unseen reviewed items;
2. reviewed items in the weaker direction;
3. due or missed items;
4. mechanically safe deterministic transformations from reviewed templates;
5. safe repetition;
6. an aggregate starvation signal for editorial expansion;
7. later, a queued generation request only after its trust, privacy, and review gates exist.

At exhaustion, offer repeat, alternate reviewed direction, adjacent reviewed content, queue future
expansion, or honestly state that no new reviewed material is currently available. An unrelated
fallback does not count as fulfillment.

## 8. Composability and change isolation

V4 composes responsibilities, not one universal object:

```text
delivery UI
   ↓
application services: start block, submit observation, recommend
   ↓
deterministic planner/evaluation/profile policies
   ↓
target manifest + source-owned content + evidence contracts
   ↓
identity, integrity, versioning

infrastructure adapters attach from the side
```

Rules:

- lower contracts never import a lesson, collection screen, model provider, or Workflow run;
- content payloads remain specialized while shared scheduling/observation metadata stays small;
- learner-safe projections never contain answer keys or evaluator secrets;
- progress, observation, generation, and provider errors remain separate unions;
- new components declare what they teach/practice/check, their payload, result type, evaluator,
  evidence authority, accessibility path, provenance, and invalidation behavior;
- explicit ports appear only at proven volatile seams; a named responsibility is not automatically a
  framework interface;
- owning unions/registries may change additively, but adding a component must not require unrelated
  progress, profile, or provider rewrites.

Change-isolation test: add a self-reported flashcard or authored conversation checkpoint without
changing lesson progression, typed grading, target identity, provider code, or another component's
stored result. Failure means the boundary is wrong.

## 9. Authority-delta ledger required before implementation

V4 proposals cannot override current authority by implication.

| Current authority | Proposed V4 delta | Deciding gate | Compatibility/migration requirement |
|---|---|---|---|
| Executable lesson schema requires fixed anatomy | objective-dependent components under a versioned schema | Gate 0-C | preserve existing A1; no placeholders; prove A1-06 in chosen executable representation |
| Numeric evaluation/result and planned `evaluations` persistence | discriminated append-only observation authority | Gate 0-A before A3 | choose one truth; map current evaluator result without losing semantics; rollback path |
| Planned raw `userInput` storage | purpose-limited retention or omission | Gate 0-A | access/encryption/TTL/deletion/regrade decision |
| Item/set/lesson rollups and set isolation | derived views plus shared shadow target observations | Gate 0-A/Pilot A | current progression unchanged; no parallel permanent truth |
| Completed/Mastered and Today's accuracy | proposed Confirmed shadow target state | Pilot A/B plus future authority | current learner labels remain until evidence and terminology decision |
| Curated Practice Sets | V4 collection concept | Gate 0-C/product decision | preserve current set behavior; adopt naming only through explicit feature authority |
| Saved targets/items | initial learner organization surface | product decision | do not imply named user collections yet |
| Sampled post-launch native content review | stronger generated/shared scored-item review | Pilot F/publication gate | source-pack rights admission; qualified role/capacity and exception policy |
| ADR-0017 private Workflow generation | demand-gated, deterministic-R0 private path | Gate F-private/new packet | Neon authority, privacy semantics, reconciliation, rollback |
| Repository lesson/content authority | repository-first target and Evidence Packs | Gate 0-C/content authority | CI validation, version/hash links, review ownership |

Every authority-changing packet updates this ledger with owner, exact supersession, migration,
rollback, and validation evidence.

## 10. Evidence Packs and content factory as a dependent subsystem

### Repository-first Evidence Packs

Start with version-controlled source records, typed assertions, license/use scope, dialect/register,
bilingual-answer basis, reviewer qualifications, and direct links for new/high-risk assertions. Do
not normalize a runtime Evidence Bank until editorial/reverse-dependency queries prove the need.

Assertion authority remains scope-specific:

- CEFR for communicative descriptors, not Spanish form or bilingual answer sets;
- PCIC for Spanish curricular alignment;
- RAE/ASALE for normative form/grammar/orthography with dialect qualification;
- corpora for attestation, region, register, and frequency;
- licensed bilingual evidence and/or original qualified bilingual judgment for translation answers;
- qualified regional sources/review for cultural claims;
- AIdioma pilot evidence for product policy and empirical difficulty, not external linguistic facts.

Web search is discovery only. A source enters a pack only after identity, authority scope, terms,
license, allowed use, excerpt/derivation limits, update policy, injection handling, and reviewer are
recorded. Default use is consult-only. Rights obligations propagate to dependent content; uncertainty
fails publication closed.

### Initial offline production path

Canonical/shared generation begins only when there is a demonstrated supply need, using repository
or CI-controlled work:

```text
frozen brief + target manifest + Evidence Pack
→ generator
→ deterministic schema/integrity/source checks
→ independent second model
→ risk classification/adjudication
→ qualified linguistic/pedagogical review
→ source/rights exception review where needed
→ final-hash approval
→ repository PR + CI + merge
```

Every run that calls a generation model receives an independent second-model review. A
schema-invalid attempt is still an audited generation attempt and receives the bounded second-model
failure review required by the current founder rule. Only a transformation that calls no generation
model is outside that rule.

Material semantic, linguistic, pedagogical, answer, source, or rubric edits invalidate affected
approval and rerun the appropriate stages. One qualified bilingual teacher may hold pedagogy and
linguistic roles when qualifications are recorded. Rights review occurs at source-pack admission and
again for quoted, derived, disputed, or exception content rather than as a ritual touch on every
original item.

### Risk tiers

- **R0:** deterministic, reviewed-template transformation with mechanically provable answer
  preservation; it uses no generation model and may follow a separately approved auto-release path.
- **R1:** any learner-visible model-authored Spanish, new prompt/context, scored item, accepted answer,
  grammar explanation, dialect form, or cultural claim; qualified review required.
- **R2:** progression-critical, shared, sensitive, novel assessment, dialect/cultural, rights-unclear,
  or high-impact content; stronger pinned models and individual qualified adjudication required.

Model brand or size never substitutes for a frozen benchmark. Provider routes are pinned and fail
closed for R1/R2. Model agreement is defect-detection evidence, not publication authority.

### Pilot F

Before any generated-content quality or release claim, use qualified-human gold content, seeded and
natural defects across payload/risk/dialect, blinded adjudication, generator-only comparison,
per-severity critic precision/recall/false-pass, accepted-answer tests, human overrides, correction
time, reviewer labor, queue latency, full cost, and provider slices.

Predeclare zero missed seeded critical defects, immediate failure on any observed critical defect,
major/false-pass thresholds, confidence reporting, cost/capacity limits, and rollback. Factory success
does not imply learner efficacy.

### Private generation and Workflow later

Private generation is not required for Keep practicing. It enters only after curated practice and
deterministic transformations show measured in-promise starvation and request volume sufficient to
justify review latency, privacy work, and orchestration.

Before Gate F-private:

- define private as not shared with other learners while disclosing authorized model/staff access;
- prefer allowlisted topic/target IDs; separately gate free-text requests, sensitive topics, consent,
  staff access, raw-request TTL, logging, deletion, and backup expiry;
- retain reviewed fallback while R1 waits for qualified review;
- prove dedicated model budgets, provider policy, reconciliation, cancellation, quarantine, and
  deletion;
- prove the stable Workflow/Next/AI SDK/Node combination in Preview.

Neon creates and owns the canonical job before Workflow starts. Workflow inputs/steps/hooks carry
opaque job/attempt IDs and decisions, not learner text or candidate content. Steps reread canonical
state and use versioned compare-and-set transitions. Review decisions write Neon first; hooks only
wake the run. Cancellation writes Neon first and is checked around side effects. Workflow remains
outside learner sessions, grading, profiles, voice, and canonical publication.

Canonical/shared Workflow automation requires a proven private path, Pilot F, measured manual
volume/retry need, founder approval, a new ADR/roadmap owner, and repository publication design.

## 11. Minimal logical data shape

Before A3, choose physical names only after the authority ledger resolves. The minimum logical needs
are:

| Concept | Minimum responsibility |
|---|---|
| lesson/collection source content | current source-owned authored payload and immutable version |
| target manifest | version-controlled stable keys and meaning metadata |
| item-to-target mapping | primary target, supporting demands, proof/evidence eligibility |
| practice session | owner, scope/promise, exact compact plan, lifecycle, policy version |
| learning observation | append-only discriminated fact, versions, idempotency, correction/supersession |
| derived current progress views | preserve authoritative lesson/collection presentation semantics |
| shadow target state | rebuildable observed learner + target + text-facet scheduling view |

Do not add runtime target/Evidence Bank tables, universal item storage, a learner × target matrix,
physical job/attempt/review/publication table splits, graph/vector storage, embeddings, Redis, or ML
ranking before measured query/lifecycle need.

Integrity requirements:

- server-scoped idempotency identity and canonical metadata fingerprint;
- no database transaction during an AI/Workflow call;
- server receipt time plus snapshotted local-day context;
- exact content/mapping/evaluator/policy versions;
- replay as of explicit time and policy version;
- correction/invalidation rebuilds affected derived state;
- learner-safe payload excludes answer/evaluator secrets;
- raw/reconstructable learner content stays out of ordinary logs/telemetry;
- deletion spans product data, operational artifacts, analytics, and backup expiry.

## 12. Validation sequence and stopping rules

### Step 0 — Gate 0-C mapping and anatomy

- Choose legacy versus new versioned lesson anatomy.
- Prohibit placeholder components and preserve existing A1 validity.
- Map 20–30 targets independently from existing reviewed content and resolve author disagreement.
- Produce one complete A1-06 executable blueprint and one overlapping curated collection fixture.

Stop if authors cannot agree on target granularity, primary/supporting demands, or proof policy.

### Step 1 — Authority and instrument rehearsal

- Complete the current-to-V4 authority ledger before A3.
- Build two parallel held-out anchor forms for one bounded adult-A1 text construct.
- Adjudicate target coverage, accepted answers, dialect/register, and difficulty differences.
- Freeze KPI registry entries and the analysis plan before outcome data.

Stop if the instrument cannot support its intended score interpretation or current/new authorities
would create competing truths.

### Step 2 — Event and replay proof

With test data, prove duplicates, retries, support/hint semantics, corrections, invalidation,
policy-version changes, retention decisions, deletion, and replay equivalence for one observation
authority and exact session plan.

Stop if derived state cannot be reproduced or corrected without ambiguous raw-data use.

### Step 3 — Pilot A shadow prediction

- No adaptive serving or progression change.
- Compare the smallest target-state rule against item-only, last-result + elapsed-time, and current
  heuristic baselines.
- Hold out learners, item/source families, and time as required.
- Measure mapping reliability, calibration, discrimination, coverage, and false-Confirmed risk.

Stop or simplify if the shared target model does not materially beat the simple baseline.

### Step 4 — Single-rule Pilot B

- Randomize fixed baseline versus one Due/Needs-review or weak-direction rule.
- Use the same eligible reviewed pool and common held-out delayed anchors.
- Report delayed transfer and learner effort separately with all declared guardrails.

Do not add more adaptive axes unless this rule produces a credible incremental benefit.

### Step 5 — Product-supply and conversation proofs

- Repeated blocks across three reviewed collection promises measure in-promise fulfillment,
  exhaustion, fallback, diversity, complaints, review cost, and asset reuse.
- One constrained conversation with two authored checkpoints tests checkpoint evidence against a
  later transformed task; ordinary dialogue remains coaching-only.

Only measured starvation can open the generation-demand decision.

### Step 6 — Pilot F and private runtime, independently

Run offline Pilot F only after generated supply has demonstrated value. Adopt private Workflow only
after Gate F-private and a separate operational proof. Neither factory validity nor runtime durability
establishes learning benefit.

### Design stopping rule

Create V5 only if review finds a blocking internal contradiction, unsafe authority ambiguity, invalid
measurement construct, or missing capability needed for Steps 0–3. Do **not** create V5 merely for
more polish, speculative completeness, or Later-stage detail. If V4 is coherent enough to run Steps
0–3 safely, stop revising the architecture and gather evidence through the sequence above.

## 13. Core assumptions and open decisions

### Assumptions tested first

1. Independent authors can map reviewed items to stable target keys consistently.
2. Parallel anchors can measure the declared adult-A1 text constructs without treatment leakage.
3. One observation authority can reproduce, correct, and invalidate derived state.
4. A target-based shadow state predicts delayed outcomes better than simple item/recency baselines.
5. One deterministic adaptive rule improves delayed transfer without worse effort or guardrails.
6. Reviewed pools and deterministic variation satisfy most repeated-practice demand.
7. Generated content plus required human review is safe and economically sustainable when demand
   eventually justifies it.

### Founder decisions still required

1. Binding lesson anatomy/schema version for A1-06 and existing-content compatibility.
2. Exact target-key granularity, form-family/sampling conventions, and proof policies.
3. Observation authority and current evaluation compatibility before A3.
4. Raw-response purpose, retention, regrade, access, encryption, and deletion policy.
5. Pilot population, anchor horizon, KPI thresholds, minimum sample, and failure actions.
6. Learner-facing Completed/Mastered/Confirmed terminology after evidence.
7. Initial visible collection promises, Saved behavior, and level recommendation semantics.
8. Pan-Hispanic baseline, regional labeling/acceptance, bilingual answer sources, and reviewer
   qualifications.
9. Initial Evidence Pack allowlist, licenses, commercial-source policy, and rights ownership.
10. Age range, voice, profiling, consent, and child-safety strategy.
11. Content-starvation and request thresholds that would justify generation/A9.
12. Reviewer capacity, unit-economics limits, model routes, and Pilot F thresholds.
13. Whether/when private content, connected reading, or conversation outcomes may gain profile or
    progression authority; initially they do not beyond authored checkpoints.

## 14. P-007 and A1-06 ruling

### P-007

**Changes requested; do not approve as written.** Separate lesson objective/target load, reviewed pool
capacity, bounded session size, numeral/pattern/irregular-anchor modeling, and representative proof.
Sampling may prove a bounded functional objective but cannot confirm unobserved atomic members.

### A1-06

**Remain paused only through Gate 0-C.** Resume after the binding anatomy/schema ruling and a complete
executable blueprint maps targets, objectives, core/pool/proof, supporting demands, failure
attribution, and the overlapping collection fixture. A1-06 does not wait for A3 persistence, Pilot
A/B/F, generated content, or Workflow.

## 15. V3 to V4 disposition

| V3 concept | V4 disposition |
|---|---|
| Atomic claims | retain semantics; simplify initial implementation to repository target-key manifest |
| Lessons and curated collections | retain with distinct promises and shared target observations |
| User-created collections | defer named collections; start with Saved references |
| Private generated collections | defer until measured starvation/demand and Gate F-private |
| Unlimited practice | clarify as uncapped bounded blocks with best-effort novelty |
| Dynamic session axes | reduce first proof to Short/Standard and due/weak direction |
| Full session hashes/watermarks/seeds | defer; retain exact plan and policy version |
| User Knowledge Profile | retain as shadow derived target/facet state first |
| Recommendation engine | simplify to deterministic explainable rule |
| Conversation curriculum credit | authored checkpoints only; whole task separate |
| Evidence Bank | retain authority model; implement repository Evidence Packs first |
| Content factory | separate dependent subsystem; offline repository/CI first |
| R0 model transformations | remove; R0 is deterministic/no-model only |
| Mandatory second-model review | retain for every generation-model run |
| Workflow | retain private-A9-only design, deferred until demand and Gate F-private |
| Runtime claim/source/job normalization | defer until measured query/lifecycle need |
| KPI families | retain but add construct scope, causal anchors, registry, and metric classes |
| North star ratio | replace as gate with co-primary delayed transfer and learner effort |

V4 is deliberately smaller than V3 as an implementation path and equally strict where errors could
teach bad Spanish, misstate learning, violate rights/privacy, or create irreconcilable learner state.
