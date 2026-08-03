---
title: Adaptive learning system — independent panel review
type: design-review
status: closed
updated: 2026-07-31
---

# Adaptive learning system — independent panel review

> Review of the non-authoritative [adaptive learning system proposal](adaptive-learning-system-proposal.md). Three independent
> reviewers read the whole proposal and current AIdioma authorities. No application, schema,
> roadmap, proposal-register, or lesson change was made.

## Panel

| Reviewer | Primary lens |
|---|---|
| Learning/product | learning science, assessment validity, curriculum, cognitive load, UX, accessibility |
| Architecture/data | data authority, performance, idempotency, query paths, migration, solo-founder feasibility |
| External risk | privacy, security, generated-content governance, operations, primary research/resources |

All reviewers applied MCOO: minimal complexity for optimal output.

## Verdict

**Unanimous: approve the strategic direction, but revise it before adoption or implementation.**

The knowledge-centered direction is stronger than the current container-centered design. The first
draft nevertheless overreached by implying a generic weighted strength model across vocabulary,
grammar, communicative functions, directions, and modalities.

The panel recommends adopting the proposal only as a **pilot charter** after these corrections:

1. Model explicit learner **claims**, not a universal comparable “knowledge strength.”
2. Give each assessed item exactly one primary claim in the pilot.
3. Persist observable facts; derive scheduling policy and confidence later.
4. Give every lesson a small, non-compensatory claim/proof blueprint.
5. Materialize only text recognition and text production initially.
6. Keep generated content and conversation inference out of the first pilot.

## Strong consensus

- One cross-source learner profile is the correct product seam.
- Lessons and collections should organize experiences, not own separate knowledge truths.
- Instruction, optional practice pool, and required proof must be separate.
- Sessions should be bounded while Keep practicing remains indefinitely available.
- Eligibility should precede a readable, deterministic ranker; no LLM belongs in selection.
- Immutable content identity, versions, provenance, server-owned answers, and comparison-first grading
  remain foundations.
- Flashcard self-report is useful scheduling information but not curriculum proof.
- Dialogue models must not grade themselves.
- Private generated content must not flow directly into the public/shared library.
- P-007 should not be approved as an isolated raw-cap increase.
- A1-06 only needs to wait for the minimal claim and lesson core/pool/proof conventions, not the full
  adaptive platform.

## Adoption blockers

### 1. Claims and lesson proof are missing from the logical model

The first draft described lesson prerequisites, core knowledge, and extensions but gave them no
authoritative data home. Without a versioned lesson blueprint, bounded sampling can skip a required
part or allow strong performance in one area to compensate for failure in another.

Recommended pilot model:

```text
lesson_claim_scope
  lesson + content version
  claim
  role: prerequisite | core | extension
  required_for_completion
  sequence
  proof_policy_key
```

Each lesson gets 1–3 required claims. Completion must satisfy every core claim independently.
Use a few named proof-policy templates; do not build a general rules language.

### 2. Observations must be separate from tunable inference

The first draft proposed storing evidence weights while also calling them tunable. That would freeze
today's assumptions into historical truth.

Persist facts instead:

- activity, direction, input modality, attempt number;
- first attempt versus retry;
- hint, reveal, tutor, or transcript editing;
- observed result and evaluator/version;
- source quality, content version, primary claim, and mapping version;
- item/context identity, timestamp, and learner-local day;
- ASR/evaluator confidence when relevant.

Scheduling rules derive New / Needs review / Due / Confirmed from those facts. A future algorithm can
replay the same history. Do not rerun historical LLM calls to rebuild state.

### 3. Correction and invalidation are required

A past event may become invalid because grading was wrong, content was flawed, accepted answers were
incomplete, a claim mapping changed, ASR failed, or generated content was quarantined.

Events need explicit invalidation/supersession and reason/version data. Profile replay must exclude
invalid evidence. “Immutable events” without correction semantics are not trustworthy.

### 4. Submission idempotency must exist before AI evaluation

A normalized answer hash cannot distinguish a legitimate repeated answer from a network retry. Every
submission needs an opaque client event ID unique per learner. The server reserves a pending event
before any uncertain AI call; duplicate requests return the existing result. Never hold a database
transaction open during the provider call.

### 5. Raw learner text and transcript retention need a pre-A3 decision

The profile can rebuild from narrow structured observations; it does not need permanent raw answers.
Panel recommendation:

- process typed input for immediate grading but do not retain it indefinitely by default;
- if needed for appeals/evaluator QA, use a separate encrypted, access-restricted short-TTL store;
- never log raw answers, prompts, audio, or transcripts in normal telemetry;
- keep raw audio transient;
- make conversation transcript storage explicit and deletable;
- prove account deletion across database, workflow state, storage, analytics, and backup expiry.

If AIdioma may serve children under 13, decide the age strategy before voice; the FTC treats a
child's voice recording as personal information, with only narrow prompt-deletion guidance for brief
voice-as-input use. See [FTC voice-recording guidance](https://www.ftc.gov/news-events/news/press-releases/2017/10/ftc-provides-additional-guidance-coppa-and-voice-recordings).

### 6. Facets must be deliberately bounded

Direction × modality × tense × person × number × register creates an uncontrolled sparse cross-product.
The pilot should materialize only:

- `recognize_text`
- `produce_text`

Keep grammatical form and modality on events. Add another profile facet only when a concrete
scheduling decision requires it.

## Major design corrections

### Claims, not a universal score

Lexical recall, a grammar contrast, and communicative task success are not psychometrically
interchangeable. Use a claim–task–evidence discipline:

- **Claim:** what the learner is expected to demonstrate.
- **Task:** the reviewed opportunity that elicits it.
- **Evidence rule:** which observable response supports it.

Initially, each item has one primary assessed claim. Supporting vocabulary/tags guide eligibility and
diagnostics but do not earn positive profile credit.

### Practice success is not retention

The existing learner-facing score includes credit-for-trying, hints/reveal, retry, multiple choice,
and AI-assisted grading. Preserve feedback scores, but do not equate them with knowledge.

Delayed, unassisted success on a different but parallel item provides better retention/transfer
evidence than repeating the same prompt. “Mastered” should either be renamed or narrowly defined as an
app threshold that can decay—not a permanent ability claim.

### Collections need visible promises

A single hidden adaptive Restaurant pool from A1 present tense to later past narration is too opaque.
Use an umbrella topic with visible layers, for example:

- Restaurant Basics
- Ordering and requests
- Talking about a past meal
- Complaints and problem solving

The profile recommends a layer; adaptation varies items, direction, spacing, and challenge inside the
chosen promise. Grammar should not silently change.

### Keep the learner controls small

The default UI should offer:

- one dominant Recommended practice action;
- one visible size/time choice;
- one optional intent: Reinforce / Balanced / Expand;
- detailed direction, difficulty, tense/person, and activity overrides under Options.

### Hard versus soft eligibility

Hard-exclude invalid forms, unsupported modalities, unsafe content, and disallowed quality tiers.
Treat uncertain level/prerequisite distance as a soft penalty with a reviewed fallback and explicit
Stretch override. Lack of evidence is uncertainty, not failure.

### Session reproducibility

Store the bounded resolved plan as JSON on the session initially: exact source IDs/versions, order,
direction, reason code, engine version, random seed, and plan hash. Normalize later only if measured
query needs justify another table.

### Generated content authority

For the initial system:

- More practice generation uses existing reviewed claims only.
- Expand knowledge selects from a reviewed lexical catalog.
- Private validated material may affect private scheduling only at low authority.
- It cannot complete/master curriculum objectives.
- Popularity or learner approval never automatically publishes it.
- Aggregate sanitized demand starts a separate canonical generation job; deterministic QA plus
  human/native review creates a new shared identity.

Do not directly promote, cross-user cache, or semantically merge private learner output.

### Conversation authority

Initial credit requires an authored opportunity, reliable transcript, independent evaluator, primary
claim, accepted variants/rubric, and recorded support. A materially edited voice transcript is typed
correction evidence, not clean speaking evidence. Open-dialogue observations initially create review
suggestions only; they gain profile authority only after human agreement is measured.

### Content and diagnosis taxonomy

The current one-enum `GrammarTag = ErrorTag` design conflates a taught claim such as ser/estar contrast
with a diagnostic error such as wrong copula choice, agreement, word choice, spelling, or register.
Keep assessed claims and diagnostic error codes conceptually separate, even if the pilot temporarily
maps some existing tags.

## Recommended MCOO pilot architecture

```text
Claim
  stable reviewed capability identity

Reviewed item
  one primary claim; supporting metadata only

Lesson claim blueprint
  prerequisite/core/extension roles + small proof template

Practice session
  bounded, immutable resolved plan

Practice event
  observed facts + correction/idempotency/version data

Derived recommendation state
  New / Needs review / Due / Confirmed for recognize_text or produce_text
```

Do not initially add:

- a generic numeric strength;
- multi-claim positive evidence;
- a prerequisite graph;
- communicative-function rollups;
- placement testing;
- embeddings or semantic identity merging;
- FSRS/BKT/HLR production models;
- generated public promotion;
- spontaneous conversation evidence.

## Minimal logical data shape

```text
knowledge_claims
  stable key, type (lexical | chunk | grammar), language, lifecycle, metadata

lesson_claim_scope
  lesson/version, claim, role, required flag, order, proof-policy key

reviewed item payload
  primary claim key + supporting refs/tags + mapping version

practice_sessions
  current fields + resolved plan JSON + engine/policy version + plan hash

practice_events
  user/session/clientEventId, source/version, primary claim, facet,
  kind/status/outcome, attempt/support/context facts, evaluator/mapping versions,
  local day, invalidation/supersession; raw input absent by default

user_claim_state
  user + claim + facet, observable aggregates, state, due signal, policy version

container progress
  lesson/set participation and presentation history; not a second knowledge truth
```

Supporting claim links remain content metadata in the pilot; they do not multiply event/profile rows.
The profile row is a cache/materialized view and must match a full replay.

## Smallest falsifiable pilot

Use A1-05's ser/estar contrast plus six feelings and one overlapping curated Feelings collection.
Treat ages/numbers as a separate claim; do not expand P-007 for the pilot.

### Experience

- Short explanation.
- Eight-item Recommended block.
- Results and Keep practicing.
- Fixed-template selection reasons.
- Collection practice updating the same shadow claim state.
- Flashcards using Cue → Reveal → Missed / Recalled.
- No generation, conversation, automatic lesson completion, or complex controls.

### Evidence

- One primary claim per assessed item.
- First attempt/retry and support recorded.
- Later-day checks use unseen parallel items.
- Profile runs in shadow mode; the current experience remains control.

### Falsifiers

- Two independent authors cannot map primary claims consistently.
- Incremental state differs from replay.
- Duplicate retries produce duplicate events or evaluator calls.
- Adaptive ranking improves repeated-item scores but not delayed unseen performance.
- Collection evidence does not predict lesson-check performance.
- Learners cannot explain why they received an item.
- Bounded blocks become repetitive, level-unsafe, or worse than the fixed recipe.

## Missing founder decisions after pilot evidence

1. Does qualifying cross-source evidence offer a visible test-out path or only improve recommendations?
2. Should the learner-facing label remain Mastered, or become Confirmed/Retained?
3. What narrow raw-answer retention, if any, is acceptable for appeals and evaluator QA?
4. What stable promises/layers should initial collections expose?
5. What human/native review bar is required for shared generated scored content?
6. When, if ever, may private generated practice affect curriculum progress?
7. What human-agreement bar is required before conversation observations update the profile?

Exact mastery thresholds, evidence weights, novelty ratios, database ceilings, and model choice should
not be founder decisions before real pilot data exists.

## Revision delta review

All three reviewers re-read the panel-revised proposal:

- Learning/product: all four critical findings closed; no critical regression. Passage translation
  was then clarified not to prove general reading comprehension.
- Architecture/data: all five critical findings closed; no critical regression. Atomic/concurrent
  profile-update semantics remain a required Gate-0 implementation decision.
- External risk: all three critical findings closed; no critical regression. Cold storage was then
  clarified as retention subject to TTL/deletion, and under-13 voice guidance was added here.

The result is an appropriate **pilot charter**, not yet an accepted product authority or migration-
ready schema.

## Panel ruling on current gates

- **P-007:** unanimous **CHANGES REQUESTED / reject as written**. Replace the raw cap widening with a
  decision separating lesson claim scope, addressable practice-pool capacity, bounded session size,
  and sampled proof. All numbers may exist in a larger library without appearing in one lesson run.
- **A1-06:** keep paused only until claim identity, one-primary-claim mapping, and lesson
  core/pool/proof conventions are decided. Do not wait for generation, conversation, or final mastery
  algorithms.

## External references worth borrowing selectively

| Resource | Borrow | Avoid |
|---|---|---|
| [Evidence-Centered Design](https://doi.org/10.1002/j.2333-8504.2003.tb01908.x) | claim–task–evidence discipline | a heavyweight assessment framework |
| [Retrieval practice](https://doi.org/10.1126/science.1152408) and [successive relearning](https://doi.org/10.1037/a0023956) | delayed, repeated, unassisted retrieval | treating same-session repetitions as independent mastery proof |
| [Spacing review](https://doi.org/10.1111/j.1467-9280.2008.02209.x) | retention interval matters | one universal next-day mastery rule |
| [Transfer after testing](https://doi.org/10.1037/a0019902) | unseen parallel contexts | repeated prompt accuracy as transfer |
| [Duolingo HLR](https://github.com/duolingo/halflife-regression) | identity/features and offline comparison methods | shipping its old model/weights directly |
| [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) | later benchmark for explicit recall cards | applying it to composite lessons/conversation before valid logs |
| [pyBKT](https://github.com/CAHLR/pyBKT) | later offline benchmark | a Python production service or binary-skill assumptions now |
| [UniMorph](https://unimorph.github.io/schema/) | small compatible form vocabulary | importing the full ontology |
| [QTI](https://www.1edtech.org/standards/qti/index) / [Caliper](https://www.1edtech.org/standards/caliper) | item/result/event vocabulary | XML/LRS/compliance machinery |
| [W3C PROV](https://www.w3.org/TR/prov-overview/) / [SPDX](https://spdx.org/licenses/) | compact provenance concepts and exact licenses | a graph system or free-form “SPDX-ish” strings |
| [OWASP GenAI risks](https://genai.owasp.org/llm-top-10/) / [NIST GenAI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf) | generation threat fixtures and controls | a heavyweight security platform |
| [OpenTelemetry](https://opentelemetry.io/docs/specs/otel/overview/) | bounded correlation/metrics | raw learner content in traces |

Additional privacy authorities: [EU GDPR principles](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en), [EU data-subject rights](https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en), and [California CPPA guidance](https://cppa.ca.gov/faq).
