---
title: Adaptive learning system — proposal V3
type: design-proposal
status: review-candidate
updated: 2026-07-31
supersedes: adaptive-learning-system-proposal-v2.md
---

# Adaptive learning system — proposal V3

> **Non-authoritative design proposal.** This document does not change AIdioma's current Specs,
> ADRs, schemas, roadmap, lessons, P-007, dependencies, or application behavior. It incorporates the
> accepted V2 learning model plus explicit runtime allocation, composability/change-isolation rules,
> a durable multi-stage content factory, and a canonical Evidence Bank. Adoption requires founder
> decisions followed by authority-changing work.

## 1. Executive design

AIdioma should be a **knowledge-centered, contract-driven learning system**:

- small, reviewed atomic claims describe schedulable language knowledge;
- lessons and collections organize experiences over shared claims and items;
- bounded sessions select suitable opportunities without limiting lifetime practice;
- observable events feed a rebuildable User Knowledge Profile;
- specialized learning components connect through stable capabilities and ports;
- Next.js and Neon serve the live learning loop;
- Vercel Workflow durably orchestrates lesson/practice content production, not learner sessions;
- every generated batch is source-grounded, independently model-reviewed, auditable, and gated by
  authority-appropriate human review;
- canonical sources and structured assertions—not free web search or copied textbooks—ground quality.

```text
Evidence Bank + reviewed claims
              |
       durable content factory
              |
     reviewed versioned items
              |
   lesson / collection blueprint
              |
     bounded practice session
              |
      observable events
              |
      User Knowledge Profile
              |
 recommendation and next session
```

The architectural rule is **stable contracts, specialized components, one-way dependencies, and
replaceable policies**. Higher layers depend on lower contracts; lower layers never depend on a
specific lesson, collection, screen, model provider, or workflow run.

## 2. Foundational learning model

### Atomic knowledge claim

A facet-neutral, reviewed and schedulable language identity. Examples:

- `lex:es:comer:sense1` — a local lexical sense;
- `chunk:es:tengo-anos` — the age-expression chunk;
- `grammar:ser-estar:trait-state` — the trait/current-state contrast;
- `grammar:preterite-regular-er:first-person` — a bounded form capability.

Recognition or production belongs to the event facet, not the claim ID. A semantic change creates a
new claim ID. Metadata wording may version the same ID only when assessed meaning is unchanged.
Topics, lesson objectives, diagnostic errors, and scores are not claims.

### Lesson objective

A learner-facing outcome that groups atomic claims and owns a small named proof policy. A lesson
normally has 1–3 objectives; that is not a 1–3 vocabulary-claim cap. An objective may use declared
sampling to establish a functional outcome without marking unobserved atomic claims Confirmed.

### Practice item

One addressable teaching, practice, or check opportunity. Every item has a common envelope:

```text
immutable item identity + content version
one primary atomic claim when assessed
supporting prerequisite refs/tags
capabilities: activity, direction, modality, purpose
difficulty, topic, register, grammar/context metadata
reviewed answers or evaluator contract
provenance, source assertions, quality tier, lifecycle
type-specific payload
```

Supporting material guides eligibility and diagnosis but earns no positive evidence in the pilot.
Practice eligibility and evidence eligibility are separate: stretch material can appear in practice,
while proof/check items must make supporting demands known, supplied, or deliberately irrelevant.

### Container

A lesson or collection that selects and sequences content without owning a separate copy of learner
knowledge.

- A **lesson** introduces bounded objectives and owns a curated required path/proof blueprint.
- A **collection** provides ongoing practice within a visible topic, level, grammar, or communicative
  promise.
- A **user-created collection** over reviewed items earns the reviewed items' normal authority.
- A **private generated collection** has private, lower-authority items whose results initially
  schedule only those items.

### Practice session

One finite, resumable block with an exact persisted plan: item/version, order, direction, purpose,
selection reason, controls, candidate-pool hash, profile watermark, policy version, random seed, and
canonical plan hash. Keep practicing creates another block; it never appends forever to one session.

### Practice event

One observed interaction recording source, item/version, primary claim, `teach | practice | check`,
activity, direction, modality, attempt/retry, hint/reveal/support, structured outcome, content/mapping/
evaluator/policy versions, source trust tier, server time, and snapshotted local-day context.

Events store facts rather than permanent evidence weights. They are idempotent, correctable, and can
be invalidated or superseded when content, grading, mapping, ASR, or source evidence is faulty.

### User Knowledge Profile

A rebuildable rollup per learner + atomic claim + initial facet:

- `recognize_text`
- `produce_text`

The profile may derive **New / Needs review / Due / Confirmed** from unassisted performance, distinct
days, varied items/contexts, support, and recent failure. Durable observations remain authoritative;
the profile and scheduling policy are versioned, replaceable views—not one universal mastery score.

`produce_text` is a storage facet, not a claim that spelling, morphology, syntax, and meaning are the
same. Claim/proof policies declare semantic, form, spelling/accent, and `close` tolerances. Response
speed and accommodation use are non-authoritative.

## 3. Learner experience and content anatomy

### First encounter and return

1. Show the objective and visible scope.
2. Provide a concise orientation plus optional claim-linked teaching steps.
3. Keep reference material available without treating lookup as proof.
4. Run a bounded block whose teaching, practice, and independent checks remain distinguishable.
5. Explain what needs review and why the next activity is recommended.
6. Allow stop, review, or Keep practicing without a lifetime practice cap.
7. On return, favor Due/Needs-review claims and unseen or meaningfully transformed checks.

Cold start uses the authored promise's standard band, then adjusts from early unassisted results.
Too easy / Too hard controls adjust context/support or challenge without silently changing the target
or introducing undisclosed grammar.

Three facts stay distinct:

- **Session finished:** a block ended.
- **Lesson Completed:** the authoritative progression rule was met.
- **Claim Confirmed:** delayed, varied evidence changed scheduling for one claim/facet.

Shadow profile data cannot complete, fail, skip, or unlock a lesson.

### Content components

| Component | Learner job | Shared contract plus specialized payload | Initial evidence authority |
|---|---|---|---|
| Explanation | Understand a new idea | objective, claim links, concise text/examples, source assertions | Instruction only |
| Reference card | Look something up | rule/table/examples, claim links, source assertions | Support only |
| Flashcard | Retrieve then reveal | cue, answer, direction, item/claim, Missed/Recalled | Item scheduling only |
| Typed practice | Recognize or produce | prompt, accepted-answer/evaluator contract, direction, tolerances | Strong when valid and unassisted |
| Quiz | Make a constrained choice | options, answer, rationale, primary claim | Task-dependent supported evidence |
| Passage | Build connected meaning | text/segments, questions, claims, source/provenance | Translation may support an atomic claim; comprehension remains task outcome initially |
| Conversation | Accomplish a goal | scenario, authored elicitation, variants/rubric, transcript provenance | Deferred atomic credit; full task outcome separate |
| Evaluation | Interpret a response | comparison first, structured verdict/defects, evaluator version | Creates an observation, not mastery |
| Confirmed/Mastery | Schedule retained knowledge | derived policy over delayed varied qualifying events | Rebuildable state, never permanent truth |

No lesson must contain every component type. The blueprint includes only assets required by its
objective. A conversation model never grades its own dialogue. Same-session repetition is practice,
not independent retention evidence.

## 4. Lessons, collections, and level progression

Lessons and collections reference the same atomic claims and reviewed items but make different
promises:

```text
Lesson: Feelings Basics
  objective: distinguish traits from current states
  claims: ser/estar contrast + individually tracked feeling senses
  required path: small objective proof recipe
  practice pool: larger reviewed item set

Collection: Feelings — Present Tense
  promise: present-tense feeling descriptions
  pool: overlapping and additional reviewed items

Reviewed collection event
  -> same shadow claim state
  -> later recommendation input
  -> no silent lesson completion
```

Topics organize discovery, while visible promises prevent silent scope drift. A Restaurant umbrella
can contain Restaurant Basics, Ordering and Requests, Talking About a Past Meal, and Problems and
Complaints. “At my level” recommends a promise; adaptation varies content inside it.

Lexical and form knowledge remain related but distinct:

```text
“I eat” -> “como”
  primary: grammar:present-regular-er:first-person
  supporting: lex:es:comer:sense1

“I ate” -> “comí”
  primary: grammar:preterite-regular-er:first-person
  supporting: lex:es:comer:sense1
```

The pilot credits one primary claim. Multi-claim positive inference is deferred until attribution is
validated.

### Dynamic session policy

1. Hard eligibility: supported capability, valid form, safe/active trust tier, requested promise.
2. Evidence eligibility: support demands allow the event to qualify for its intended inference.
3. Soft readiness: prerequisite/level uncertainty lowers rank without false lockout.
4. Readable utility: due state, intent, relevance, novelty, diversity, repetition, user choice.
5. Bounded sampling: varied block without replacement; misses affect the next block.

Default UI exposes Recommended practice, one size/time choice, and optionally Reinforce / Balanced /
Expand. Detailed direction/difficulty/form/activity settings live under Options. Controls may change
practice but cannot silently redefine proof; incompatible configurations are labeled practice-only.

## 5. Lesson blueprint

```yaml
lesson:
  objective_summary: learner-facing outcome
  promise: visible level, topic, grammar, register, and communicative scope

objectives:
  - objective: stable objective key
    role: prerequisite | core | extension
    sequence: integer
    claims: [stable atomic claim keys]
    proof_policy: named small template

instruction:
  orientation: concise entry point
  claim_teaching_steps: optional
  reference_cards: optional

practice:
  initial_block: bounded recipe
  candidate_pool: reviewed eligible items
  extension_pool: optional reviewed items/claims

proof:
  all_core_objectives_required: true
  atomic_claim_credit_is_non_compensatory: true
  items: unseen or meaningfully transformed where practical
  support_and_tolerance_rules: explicit
  delayed_confirmation: separate from same-session completion

continuation:
  keep_practicing: another bounded block
  reasons: closed versioned learner-safe codes
```

This separates objective/claim load, addressable pool capacity, required session size, and sampled
proof. Adding practice material cannot silently lengthen the required lesson path.

## 6. System composability and change isolation

### Layer contract

```text
Identity and integrity
  claims · IDs · versions · provenance · source assertions
                         ↓
Reusable content contracts
  common item envelope + specialized payloads
                         ↓
Core learning engines
  selection · evaluation · event recording · profile derivation
                         ↓
Experience containers
  lessons · collections · generated collections · review queues
                         ↓
Delivery interfaces
  web · future mobile · internal editorial tools
```

Dependencies point down. Domain contracts are pure TypeScript/data definitions and import no React,
Next.js, Neon, Workflow, AI provider, or screen code. Infrastructure implements domain ports.

### Capability-driven assembly

A practice item declares what it supports; the engine does not branch on lesson slug, collection
name, or origin. The small connection surface is:

- `ItemContract`: identity, version, claim, support, provenance, capability, payload discriminator;
- `ContainerContract`: visible promise, objectives, candidate references, default controls;
- `SessionPolicy`: eligibility, ranking, bounded resolution, reason codes;
- `ActivityPresenter`: type-specific learner interaction;
- `EvaluatorPort`: deterministic comparison and optional bounded evaluator;
- `EvidencePolicy`: whether an event qualifies for scheduling or proof;
- `EventSink` and `ProfileReader`: observable state boundaries.

This is not a generic plugin framework. Add a port only after two real implementations need it.
Specialized payloads remain specialized; a passage is not forced into a flashcard schema.

### Adding or changing a component

A new practice type supplies:

1. a versioned payload schema and capability descriptor;
2. a presenter/renderer;
3. an evaluator or an explicit practice-only outcome;
4. an evidence policy, initially no profile authority unless validated;
5. contract fixtures and accessibility acceptance tests.

It must not require unrelated changes to claims, container progress, or provider wiring. Examples of
expected isolation:

- replace a grading model behind `EvaluatorPort` without rewriting lessons/events;
- replace ranking policy and replay history without migrating observations;
- redesign flashcards without changing claim storage;
- add pronunciation as practice-only before adding a speaking facet;
- expand a pool without changing lesson proof length;
- replace Workflow without changing canonical jobs or published content;
- add a mobile client without moving grading/profile authority into the client;
- quarantine a source assertion and locate every dependent item without scanning prose.

### Anti-coupling rules

- No separate lesson, collection, and generated-content knowledge truths.
- No UI component decides mastery or proof authority.
- No model/provider ID in core domain identity.
- No Workflow run is canonical product state.
- No generated artifact bypasses the common content contract.
- No content row count controls learner load.
- No container-specific branch inside the general selector/evaluator.
- No giant universal payload with every component field nullable.
- No new activity gains knowledge credit merely because it can render.

### Composability acceptance test

Every new component or replacement must show:

1. unrelated tables/contracts do not change;
2. the implementation is replaceable behind its stated port;
3. existing compatible content works without rewriting;
4. disablement/failure leaves a safe fallback path;
5. historical events remain interpretable after policy changes;
6. dependency direction remains downward;
7. isolated contract fixtures prove behavior;
8. one end-to-end composition fixture proves it works with the real engine.

## 7. Runtime responsibility map

AIdioma is Vercel-hosted but not Workflow-driven in the live learner loop.

| Responsibility | Runtime and authority |
|---|---|
| UI and local interaction | Browser React/Next.js; never authoritative grading/profile state |
| Authenticated API | Next.js Node runtime on Vercel |
| Item resolution/evaluation | Bounded Next.js request using server-owned content and `EvaluationService` |
| Session selection | Pure SessionPolicy invoked in Next.js; exact plan persisted in Neon |
| Events/profile/progress | Neon Postgres canonical events and derived application state |
| AI routing | AI SDK through Vercel AI Gateway behind ports |
| Rate admission | Vercel Firewall plus application controls |
| Due review | Derived from Neon event times at request/read; no per-learner Workflow sleeps |
| Content generation/review | Vercel Workflow orchestration with idempotent Node-capable steps |
| Generation job/draft authority | Neon canonical job state/artifact/provenance; Workflow history operational |
| Published canonical lessons/shared content | Version-controlled repository content + CI; Neon serving copy |
| Private generated content | Owner-scoped Neon version after private workflow gates |
| Voice/realtime | Direct bounded/realtime ports; not Workflow transport |

Workflow functions coordinate serializable IDs and decisions only. AI calls, DB writes, source
retrieval, validation, dedupe, and artifact creation run in bounded idempotent step functions. Typed
review hooks pause/resume orchestration, but every start/status/review/cancel path checks Clerk
ownership against the Neon job.

Ordinary learning continues if Workflow is unavailable. Keep practicing first uses reviewed content;
when a pool is thin it serves a reviewed fallback and may enqueue generation asynchronously.

## 8. Durable content factory

### Three job types, shared steps, separate authority

| Job | Output | Publication authority |
|---|---|---|
| Canonical lesson | complete lesson blueprint and items | human/native approval → repository PR → content CI → merge |
| Shared practice supply | reviewed items/pools for existing or proposed claims | human/native approval → repository/shared-library publication |
| Private practice supply | owner-visible low-authority items | validation + independent review + learner review → private Neon version |

Private artifacts never promote directly. Sanitized aggregate demand may open a new canonical job,
which generates a new identity from an approved brief and source pack.

### Mandatory stages for every generation run

```text
1. reserve canonical Neon job + idempotency key
2. freeze brief, risk tier, claims, dialect/register, and source pack
3. retrieve only approved assertions/material permitted for this use
4. generate structured candidate
5. deterministic contract and policy validation
6. independent critic model review
7. stronger-model adjudication when risk or disagreement requires it
8. human/native or learner review according to authority tier
9. rerun deterministic validation after every edit
10. publish through the tier's authority boundary
11. retain audit/provenance; monitor, quarantine, correct, or delete
```

No stage treats a model's self-evaluation as independent review. A failed required gate stops
publication. Retryable infrastructure failures may retry within hard attempt/time/spend budgets;
content defects return to regeneration/review with a new attempt identity.

### Independent critic contract

Every run receives a second model review. For canonical/shared content, prefer a different model
family/provider to reduce correlated errors. The critic receives the candidate, frozen brief,
rubric, and relevant source assertions—but not the generator's hidden reasoning or confidence.

The critic returns structured findings per item and batch:

- Spanish correctness, naturalness, accepted-answer completeness, ambiguity;
- objective/claim mapping and whether the task actually elicits the primary claim;
- prerequisite, level, vocabulary, tense, register, and dialect fit;
- distractor quality, answer leakage, passage/conversation coherence;
- pedagogical sequence, cognitive load, accessibility, cultural/safety concerns;
- source support and any unsupported or conflicting assertion;
- verdict `pass | revise | reject`, severity, evidence, and proposed correction.

Batch approval never hides an item-level critical defect. Critic agreement is evidence, not truth.

### Risk-based model routing

| Risk tier | Examples | Generator/reviewer policy |
|---|---|---|
| R0 bounded variation | new context for an existing reviewed item/claim | capable economical generator + independent critic + deterministic gates; private/item-local unless canonical review promotes a newly generated identity |
| R1 shared practice | new scored prompts, distractors, short passages for reviewed claims | strong generator + independent strong critic + full human/native publication review |
| R2 canonical/high impact | lesson, new explanation/claim, grammar rule, proof item, answer key, longer passage, conversation rubric | strongest suitable generator + different strong critic; adjudicator on disagreement; full human/native sign-off |

Escalate regardless of tier when sources conflict, the critic reports ambiguity, dialect/register is
sensitive, an answer set is incomplete, a new claim/source is proposed, or content can influence
lesson completion. Model choices are configuration plus run metadata, not architecture truth.

### Human authority

Canonical lessons and shared scored content require a named human/native reviewer. Review covers the
rendered learner experience as well as JSON. The reviewer may approve, request changes, reject, or
quarantine, and every override records reason and identity. Learner approval of private material is
preference/ownership confirmation, not linguistic validation.

### Generation audit

Each job retains:

- job/attempt/run IDs and Workflow run reference;
- frozen brief, claims, risk tier, dialect/register, source-pack versions;
- generator, critic, adjudicator model/provider and prompt/rubric versions;
- structured outputs, validation results, findings, disagreements, corrections, overrides;
- input/output hashes, parent/candidate/final content identity;
- token/call/cost/latency and retry/failure classification;
- human/learner review actions, approval authority, publication commit/version;
- quarantine, correction, regeneration, retention, and deletion events.

Raw copyrighted source material and private learner text do not enter normal traces or audit fields.

## 9. Canonical Evidence Bank and source policy

The Evidence Bank is a curated source registry plus structured assertions. It is not a bulk copy of
books, a vector dump of the public web, or an unreviewed RAG corpus.

### Source hierarchy

1. **Curriculum/level:** the [Instituto Cervantes Plan Curricular](https://cvc.cervantes.es/ENSENANZA/biblioteca_ele/plan_curricular/default.htm)
   for Spanish-specific inventories and the [CEFR Companion Volume](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions)
   for broader proficiency/communicative descriptors.
2. **Language authority:** RAE/ASALE resources such as the
   [Diccionario panhispánico de dudas](https://www.rae.es/dpd/) and
   [Nueva gramática](https://www.rae.es/obras-academicas/gramatica/nueva-gramatica-basica).
3. **Usage evidence:** approved corpora such as RAE CORPES/CREA for attestation, geography, register,
   and contemporary usage, subject to access/use terms.
4. **Pedagogical evidence:** explicitly licensed textbooks, research, and OER. COERLL offers
   [language-learning OER](https://coerll.utexas.edu/coerll/), but every asset's exact license is
   reviewed; open access alone is not permission to copy, adapt, commercialize, or ingest.
5. **AIdioma authority:** approved claims, lesson blueprints, evidence/proof rules, style, dialect,
   accessibility, cultural, accepted-answer, and content-review standards.

The Cervantes plan informs progression but does not alone define universal Spanish: its
[variety policy](https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/norma.htm)
acknowledges multiple educated norms while centering one Peninsular reference variety. AIdioma needs
an explicit pan-Hispanic/dialect policy and native review appropriate to the intended audience.

### Canonical records

```text
SourceRecord
  stable source ID and version
  authority tier, title, author/publisher, edition/date
  canonical URL/ISBN/API and exact license/terms snapshot
  allowed uses: consult | quote | derive | retrieve | redistribute | commercial
  geography, dialect, register, skill/subject scope
  admission reviewer, review date, expiry/recheck date, lifecycle

SourceAssertion
  stable assertion ID and version
  source ID + exact locator
  structured claim: curriculum level, grammar, usage, dialect, form, pedagogy, culture
  related atomic claims/objectives
  qualifications, conflicts, human verification

ContentSourceLink
  content ID/version + assertion IDs/versions
  purpose: explanation | answer | level | accepted variant | example | cultural fact
```

Canonical registry/assertion manifests should be version-controlled and validator-checked, with a
runtime serving copy only if measured retrieval needs it. Store bounded structured facts, citations,
and legally permitted excerpts—not full copyrighted books by default.

### Source admission and web-search rules

- A purchased book is not automatically licensed for database ingestion, copying, adaptation, or
  redistribution.
- OER is admitted only after exact license compatibility and attribution/share-alike/noncommercial/
  no-derivatives obligations are recorded. A commercial product cannot assume `NC` is compatible.
- Web search is discovery and edge-case research, never validation authority by itself.
- Search snippets, model citations, anonymous blogs, and popularity do not become source assertions.
- The underlying primary/qualified source must be opened, scoped, licensed, admitted, and cited.
- A new source or changed assertion requires human source review before a generation run may rely on
  it.
- Conflicting sources remain explicit; a qualified resolution records dialect, date, register, and
  reviewer rather than overwriting disagreement.

### Impact and invalidation

Every published item links to the exact assertion versions supporting its explanations, answers,
level, and accepted variants. When a source is withdrawn or an assertion changes, an impact query
finds dependent content. Affected content can remain, re-review, deprecate, or quarantine through a
recorded decision; qualifying learner evidence can be invalidated and profiles replayed.

## 10. Minimal logical data architecture

This is a logical model, not permission to migrate.

| Record | Purpose |
|---|---|
| `knowledge_claims` | Stable atomic lexical/chunk/grammar identities |
| `lesson_claim_scope` | Objectives, atomic membership/roles, named proof policy |
| existing items/targets | Common envelope, specialized payload, primary claim, mapping/provenance |
| `practice_sessions` | Exact bounded plan and policy/profile/content watermarks |
| `practice_events` | Idempotent, correctable observed facts; raw input absent by default |
| `user_claim_state` | Rebuildable hot rollup for claim + text facet |
| container progress | Participation/presentation state, not another knowledge truth |
| `content_generation_jobs` | Canonical/private job ownership, status, budgets, audit, artifact identity |
| `content_review_runs` | Deterministic/model/human findings and dispositions per candidate/version |
| source/assertion manifests | Version-controlled Evidence Bank authority |
| `content_source_links` | Exact content dependency on assertion versions |

For the shadow learning pilot, canonical claim/mapping/blueprint manifests remain outside the frozen
lesson schema and seed serving tables. Before A3, choose one graded-event authority rather than
building old item/set rollups plus a new profile in parallel.

Integrity rules:

- learner-scoped opaque `clientEventId` plus canonical metadata fingerprint;
- reserve pending before uncertain work; ordinary retry returns pending/final result;
- one durable event is guaranteed, not exactly one external provider charge;
- no transaction remains open during AI or Workflow calls;
- server receipt time orders events; local day/timezone/offset are snapshotted;
- serialize one learner/claim/facet update; invalidation rebuilds that row from valid events;
- derived state equals replay as of explicit time and policy version;
- source trust, content, mapping, evaluator, and policy versions are snapshotted;
- raw/reconstructable learner answers, source books, prompts, audio, and transcripts stay out of
  normal telemetry;
- deletion spans Neon, Workflow reconciliation, artifact storage, analytics, and backup expiry.

Start with Postgres, version-controlled manifests, deterministic ranking, and bounded JSON plans.
Do not add graph/vector databases, embeddings, Redis, ML ranking, generic ontology, or semantic
identity merging before a measured need.

## 11. Safety, operations, and quality controls

- **Generation poisoning/abuse:** allowlisted inputs/IDs, plain structured output, length/schema
  limits, ownership checks, moderation/reporting, quarantine, no HTML/scripts/URLs initially.
- **Cost:** reuse before generation, hard per-job attempts/time/tokens/spend, bounded concurrency,
  human-review queue as shared-publication throttle.
- **Model/provider failure:** ports, explicit retry/fatal classes, no blind duplicate uncertain call,
  safe fallback and resumable canonical job.
- **Source failure:** versioned assertions, impact graph through relational links, quarantine/review.
- **Private leakage:** private artifacts never cross-user cache/promote; aggregate only allowlisted
  claim/topic counters above a cohort threshold.
- **Bad grading/content:** learner report item/grade, correction/invalidation, affected-profile replay.
- **Accessibility/fairness:** keyboard/screen-reader paths, accommodation-neutral evidence, dialect and
  subgroup review; ASR failure never language weakness.
- **Privacy/children:** adult deterministic pilot; separate child profiling/voice/age/legal gates;
  documented AI processor retention/training/region/deletion and clear AI disclosure.
- **Rollback:** feature flags separate computed from served recommendation; disable profile reads or
  generation serving without rewriting valid events/content.

Operational metrics separate learning, content quality, and infrastructure: delayed unseen outcomes,
mapping/reviewer agreement, critic defect/rejection/escape rates, human overrides, source conflicts,
reports/quarantines, replay divergence, duplicate suppression, latency/cost/retries, review backlog,
reuse, storage growth, and deletion proof.

## 12. Falsifiable pilots and gates

### Gate 0-C — content/learning seam; blocks A1-06

- facet-neutral claim keys and objective grouping;
- one-primary item mapping and supporting-failure rules;
- lesson core/pool/proof blueprint;
- closed-set/form-family convention;
- one complete A1-06 worked blueprint.

### Gate 0-A — application seam; blocks A3 persistence

- event authority, idempotency/correction/versioning;
- replay/concurrency/time semantics;
- exact session snapshot and provisional facts/policy;
- retention/deletion/provider policy, feature flag, rollback.

### Gate 0-F — content factory and sources; blocks automated generation publication

- runtime map and `content_generation_jobs` authority;
- three job types and separate trust/publication paths;
- generator/critic independence contract and risk routing;
- deterministic and human/native gates;
- Evidence Bank schema, initial approved source pack, dialect and license policies;
- budgets, retries, hooks, ownership, audit, quarantine, correction, deletion;
- current stable Workflow/Next/AI SDK/Node compatibility proven in Preview before dependency adoption.

### Pilot A — shadow validity

Use a native-reviewed A1-05 subset:

| Claim | Facet | First block | Later check |
|---|---|---|---|
| `grammar:ser-estar:trait-state` | `produce_text` | controlled practice | unseen transformed deterministic check |
| `lex:es:contento:sense1` | recognize + produce text | practice | unseen deterministic checks |
| `lex:es:cansado:sense1` | recognize + produce text | practice | unseen deterministic checks |

The eight-item block is practice, not proof. UI/completion/unlock remain current. Before A6, a
collection fixture tests mappings/replay with test data only. At A6, fixed reviewed collection events
may test cross-source prediction without adaptive serving.

Pilot A fails on inconsistent author mapping, unreliable gold/support mapping, replay divergence,
duplicate durable events/app calls, uncontrolled stale pending, raw-content leakage, or absent live
cross-source predictive relationship once that path exists.

### Pilot B — adaptive UX/outcome

Only after Pilot A and the real session/collection path pass. Predeclare learner-level control,
sample/power/attrition, delayed unseen checks, primary learning-per-minute outcome, secondary UX/
diversity outcomes, accessibility acceptance, and numeric go/no-go/safety thresholds.

Generation, conversation evidence, automatic cross-source completion, numeric mastery, and corpus-
wide migration remain outside these learning pilots. Content-factory pilots use internal/test jobs
until Gate 0-F authorizes a publication path.

## 13. P-007 and A1-06 ruling

### P-007

**Changes requested; do not approve as written.** Replace raw lesson-vocabulary-cap widening with
separate conventions for:

- lesson objective and atomic-claim load;
- addressable reviewed practice-pool capacity;
- bounded initial/session size;
- individual numerals, compositional patterns, irregular anchors, and age-expression objectives;
- stratified representative proof versus complete member confirmation.

Sampling may complete a functional objective but cannot mark unobserved numerals Confirmed.

### A1-06

**Remain paused only through Gate 0-C.** Resume after an approved worked blueprint maps lexical and
`-er/-ir` form claims, primary/supporting demands, objective/core/pool/proof, and failure attribution.
A1-06 does not wait for Gate 0-A persistence or Gate 0-F generation infrastructure.

## 14. Founder decisions still required

1. Future lesson completion/failure/defer-to-review behavior.
2. Readiness check/test-out versus recommendation-only cross-source effect.
3. Learner-facing Mastered / Confirmed / Retained terminology.
4. First visible collection promises and Easier/Stretch semantics.
5. Semantic/form/spelling tolerance and accessibility policy per claim family.
6. Pan-Hispanic baseline and how regional variants are taught, accepted, and labeled.
7. Initial Evidence Bank source/license allowlist and whether any commercial works are directly
   licensed for structured retrieval.
8. Required human/native reviewer qualifications and whether every shared practice item or a risk-
   bounded subset receives individual human review. V3 recommends every shared scored item.
9. Model-risk routing budget and provider-diversity requirement for canonical lessons.
10. Canonical generated draft storage and editorial PR workflow details.
11. When private content may gain claim authority; initially never.
12. When connected-reading or communicative-task outcomes deserve new profile constructs.
13. Age range and child profiling/voice strategy.

Exact evidence thresholds, novelty ratios, database ceilings, model names, source excerpt sizes, and
ranking weights wait for gated experiments and legal/operational evidence.

## 15. V2 to V3 change summary

V3 preserves V2's reviewed claims, evidence, session, pilot, privacy, P-007, and A1-06 conclusions.
It adds:

- a one-way layered system and explicit composability/change-isolation contract;
- common item/container/session/evaluator/evidence ports with specialized payloads;
- runtime allocation across browser, Next.js, Neon, AI Gateway, Firewall, Workflow, and repository;
- Vercel Workflow for canonical lesson, shared practice, and private practice supply—not live study;
- mandatory deterministic, independent-model, adjudication, and human/native review stages;
- risk-based model routing so expensive models protect high-impact content;
- a canonical Evidence Bank with sources, assertions, license/use scope, and impact links;
- a strict web-search/source-admission policy and dialect caveat;
- complete generation audit, quarantine, correction, rollback, cost, and review-capacity controls;
- Gate 0-F so automated publication cannot arrive by implication.

V3 remains a design/review candidate, not an implementation authority.
