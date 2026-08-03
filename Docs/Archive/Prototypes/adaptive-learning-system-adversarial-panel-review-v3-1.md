---
title: Adaptive learning system V3 — adversarial KPI and simplification review
type: design-review
status: closed
updated: 2026-07-31
reviewed-commit: 6da2857
---

# Adaptive learning system V3 — adversarial KPI and simplification review

> Three independent auditors using GPT-5.6 Sol with high reasoning reviewed the complete committed
> proposal at `6da2857`, its prior panel record, current AIdioma authorities, relevant runtime code,
> and primary external sources where needed. They made no edits. This record consolidates their
> findings; it does not implement or silently accept the proposed corrections.

## Panel mandates

| Auditor | Adversarial mandate |
|---|---|
| Learning/KPI | Challenge construct validity, causal attribution, metric gaming, cold start, fairness, and whether the proposed features support the stated learning goal. |
| Product/MCOO | Design the smallest lovable learning system that could test the central hypothesis; explicitly retain, simplify, defer, or avoid each major capability. |
| Architecture/operations/MCOO | Remove premature data, Workflow, content-factory, provenance, and review complexity without weakening correctness, rights, privacy, replay, or uncapped practice. |

## Executive ruling

**Unanimous: approve V3 as a long-horizon vision, risk register, and hard-guardrail charter; changes
are required before it is a KPI gate specification or implementation blueprint beyond Gate 0-C.**

The optimization direction is strong, but the new north star currently claims more than the adult-A1
text pilot can establish. The capability map also lacks an explicit minimum implementation profile.
Without those corrections, a team could build a large, internally coherent system before proving
that its target mapping, observation authority, simple adaptive rule, measurement instrument, or
content-supply assumptions improve learner outcomes.

The panel supports proceeding with **Gate 0-C only**. Before Gate 0-A/A3, Pilot A/B, or Gate
F-private authorizes implementation or learner release, close the blockers below.

## What the panel unanimously retained

- Linguistic correctness, assessment validity, privacy, rights, accessibility, dialect fairness,
  correction/replay, and recoverability remain hard guardrails.
- Lessons and collections have different learner promises but may share stable learning-target
  identity and observations.
- One assessed item has one primary target in the first proof; supporting demands do not silently
  earn positive credit.
- Recognition and production observations remain separate; unlike activities do not share a
  universal score.
- Sessions are finite blocks. Keep practicing starts another block; lifetime access to blocks is not
  product-capped.
- Same-session retrieval, self-reported flashcards, current best scores, and content completion do
  not prove retained knowledge.
- Grading stays server-owned; observations are idempotent, correctable, invalidatable, and replayable.
- Generated scored content remains source-scoped, versioned, quarantinable, and subject to qualified
  linguistic authority.
- Every run that calls a generation model still receives a second-model review. Cost is reduced by
  making fewer generation calls, not by weakening that rule.
- Repository content remains canonical, Neon remains product authority, and Workflow remains outside
  live study, grading, profile, and progression paths.

## Blocking findings

### B1 — The north star overstates the validated construct

V3 says **verified durable learning gain per active study minute** and refers to useful Spanish, but
the first proposed profile and pilots cover adult A1 `recognize_text` and `produce_text`. Connected
reading, listening, speaking, interaction, mediation, and pragmatic outcomes are not yet validated
or eligible for pooled claim credit.

Required correction:

- scope the first experimental goal to **estimated durable transfer in the declared adult-A1 text
  constructs**;
- report recognition and production separately, with claim-family and direction slices;
- add explicit curriculum/construct coverage floors so an optimizer cannot win by serving only easy
  typed items;
- reserve broader Spanish-learning claims for separately validated listening, speaking, connected
  reading, interaction, and pragmatic instruments;
- use “estimated,” not “verified,” unless the inference, reliability evidence, and uncertainty are
  declared.

### B2 — Learning gain per active minute is not yet an identifiable KPI

The ratio lacks a fixed baseline, comparator, delayed horizon, parallel assessment forms, time
definition, minimum exposure, eligibility cohort, missing-data/attrition treatment, uncertainty, and
causal design. Adaptive difficulty can make its own KPI easier; shortening time can improve a ratio
without increasing useful learning; accommodations can be unfairly penalized.

Required correction before Pilot B:

1. Freeze a qualified-human-reviewed anchor blueprint by construct, direction, and difficulty.
2. Keep anchors and near-duplicate item families out of serving, scheduling, and model training.
3. Use common checks across randomized arms and a simple fixed due/recency comparator.
4. Make delayed transfer difference and total learner effort co-primary; treat efficiency as a
   secondary derived result with uncertainty.
5. Predeclare baseline adjustment, intent-to-treat analysis, attrition/missingness sensitivity,
   minimum sample, horizon, exclusions, and accommodation/subgroup handling.
6. Hold out learners, sources, items, and near-duplicate families where the claim requires genuine
   cross-source or transfer evidence.

### B3 — Current product scores cannot become pilot ground truth

Current authority uses same/later-calendar-day Completed/Mastered logic, best score/coverage,
credit-for-trying floors, and within-session requeue. V3 requires delayed, varied, unassisted evidence.
Both can coexist temporarily as presentation/product signals, but they cannot be treated as the same
learning construct.

Before Pilot A/B, explicitly prohibit these from serving as outcome truth:

- Today's accuracy and current lesson Completed/Mastered;
- best score or a credit-floor evaluation score;
- a same-session requeued success;
- flashcard self-report;
- content exposure or session completion.

The new profile remains shadow-only until its prediction and the adaptive policy's causal benefit
are separately established.

### B4 — V3 lacks a minimum implementation profile

The proposal inventories the eventual product but does not say which coherent subset is Now, Next,
or Later. That allows claims, objectives, items, containers, adaptive axes, recommendations, profile
states, generation, Evidence Bank, and editorial machinery to accumulate before the central
hypothesis is tested.

Required correction: add the minimum profile in this review as the explicit first proof and label
every larger capability `retain now | simplify now | defer | avoid unless evidence changes`.

### B5 — A3 needs an authority-delta ledger

Current authorities propose `evaluations`, raw `userInput`, separate item/set/lesson rollups, set
isolation from lesson progress, and sampled post-launch review. V3 proposes discriminated practice
observations, raw-input minimization, shared target/facet evidence, and stronger item-level review.
Because learner persistence is not yet established, this is the cheapest point to choose one truth.

Before A3/Gate 0-A, record:

```text
current authority
→ proposed replacement or delta
→ deciding gate
→ compatibility/migration path
→ owner
→ rollback
```

At minimum cover lesson anatomy, evaluation/event authority, raw-response retention, item versus
target rollups, collection evidence, content-review sampling, provenance, and learner terminology.

### B6 — Learner-visible model-authored R0 is not mechanically safe

Changing a cue, cloze, subject, context, tense, or direction can introduce ambiguity or unnatural
Spanish even when source claims and answers were reviewed. A private label limits authority but does
not stop a learner studying the error.

For Gate F-private:

- restrict R0 auto-release to deterministic reviewed-template transformations with mechanically
  provable answer preservation;
- classify all learner-visible model-authored Spanish as R1, requiring qualified review;
- define private as “not visible to other learners,” not “unseen by authorized processors/reviewers”;
- disclose staff/model processing and define access, consent, retention, deletion, and sensitive-topic
  policy before accepting free-text requests;
- start with allowlisted topic/target IDs and reviewed fallback.

### B7 — No-cap practice needs an honest service contract

Uncapped practice cannot mean infinite novel reviewed content. A fallback outside a visible
topic/grammar/level promise also cannot count as fulfillment.

Define:

- **No cap:** no product-imposed limit on requesting successive bounded sessions.
- **Novelty:** best effort, never guaranteed.
- **In-promise fulfillment:** another safe block matching the visible promise.
- **Fallback:** explicitly labeled and measured separately.
- **Exhaustion:** offer repetition, alternate reviewed direction, adjacent reviewed content, queue
  expansion, or honestly state that no new reviewed item is available.

Track in-promise fulfillment, fallback, pool exhaustion, wait time, and repeat diversity. Do not
require private generation to keep the button available.

## Simplest coherent product and system

The panel's minimum lovable learning system is:

> **separate lesson and collection content + one shared target key + one observation history + one
> deterministic bounded planner + one shadow profile + one explainable recommendation**

### Learner surface

The learner initially needs three concepts:

1. **Lessons** teach a bounded skill and advance the curriculum path.
2. **Collections** provide optional practice under a visible topic/level/grammar promise.
3. **Saved** is a list/filter of reviewed references and items to revisit.

Home offers Continue, Review what is due, and Explore collections. Named user-created collections
wait until Saved behavior proves an organization problem. Private generated collections wait until
measured pool starvation proves a content-supply problem.

Collections do not silently mutate with learner level. For example, Restaurant Basics, Ordering and
Requests, and Talking About a Past Meal are distinct reviewed promises grouped under one topic; “At
your level” recommends among them.

### Minimal target and observation contracts

- Keep lesson items and collection targets separately authored initially.
- Add one optional stable `learningTargetKey` from a small version-controlled manifest to the pilot
  subset; do not create a mature runtime ontology or universal item store.
- Use one sparse append-only learning-observation authority containing learner, session, source
  item/version, optional target key/facet, purpose, support, discriminated result, timestamps, and
  evaluator/mapping/policy versions.
- Derive lesson, collection, item, and shadow-target views from that authority.
- Do not prepopulate learner × target state. Materialize a hot target view only after query evidence.
- Keep the exact ordered session plan and policy version. Defer pool hash, profile watermark, random
  seed, and plan hash until a named experiment/debugging need justifies them.

### Minimal planner and recommendation

Planner input:

```text
scope: lesson | due-review | collection
size: short | standard
optional direction override
target-state snapshot
```

Initial policy:

- alternate both directions at cold start;
- later favor Due/Needs-review and the weaker direction;
- remain within the visible level/grammar promise;
- rank recent misses/due targets before unseen variation;
- offer Short and Standard; Keep practicing creates another block;
- avoid the immediately prior block where the reviewed pool permits.

Recommendation requires no service or learned ranker: Continue an incomplete lesson; otherwise
Review if work is due; otherwise recommend the next lesson; show one relevant collection as an
optional alternative. Every recommendation has a plain-language reason and cannot change progression
while the profile is shadow-only.

### Safe practice-supply order

1. unseen reviewed items;
2. reviewed items in the weaker direction;
3. due or missed items;
4. deterministic transformations from reviewed templates;
5. safe repetition;
6. aggregate starvation signal for editorial expansion.

Conversation initially earns target evidence only through explicit authored checkpoints evaluated by
the normal server-owned path. Ordinary dialogue provides coaching and a separate task recap; a
whole-conversation rubric remains separate until it predicts delayed transfer.

## Retain, simplify, defer, or avoid

| Element | Panel ruling |
|---|---|
| Lessons and curated collections | Retain; discrete visible promises |
| Saved items | Retain as initial user organization |
| Named user-created collections | Defer until Saved usage demonstrates need |
| Private/shared generated collections | Defer until starvation/editorial demand plus applicable gates |
| Stable atomic target identity | Simplify to a small version-controlled key manifest first |
| Objective | Retain authored text/proof reference; defer runtime entity |
| Universal canonical item store | Avoid initially; unify target identity and observations first |
| One discriminated observation authority | Retain before A3 |
| Recognize/produce facets | Retain; validate separately |
| More profile facets/universal mastery | Defer/avoid until construct-specific evidence |
| Exact resolved session plan + policy version | Retain |
| Pool/profile/seed/plan hashes | Defer until a named proof needs them |
| Dynamic direction | Simplify to one weaker/due rule |
| Dynamic difficulty | Bound inside the visible promise |
| Dynamic size | Short/Standard plus Keep practicing |
| Reinforce/Balanced/Expand controls | Defer |
| Recommendation ranker/service | Avoid initially; deterministic rule |
| Conversation-wide claim credit | Defer |
| Authored conversation checkpoints | Retain as the first credit path |
| Evidence Bank source registry/packs | Retain repository-first |
| Normalized runtime assertion/link tables | Defer except direct new/high-risk dependencies |
| Content-factory safety gates | Retain whenever generation begins |
| Learner-visible model-authored R0 | Remove from initial design |
| Workflow | Defer to justified private A9; never the live learning loop |
| Graph/vector/cache/ML ranking | Avoid until measured need |

## KPI redesign

### Experimental learning decision

Use two co-primary results:

1. incremental delayed transfer on fixed common held-out anchors versus a simple deterministic
   baseline;
2. total learner effort under the predeclared time definition.

Efficiency is secondary. Absolute learning, construct coverage, false-Confirmed risk, attrition,
agency, accessibility, dialect, and subgroup outcomes are guardrails.

### KPI registry

Every KPI must declare:

```text
metric class: outcome | leading | diagnostic | guardrail | operational
construct and permitted use
unit of analysis
numerator / denominator
eligible event and exclusions
cohort, horizon, minimum sample
missing-data and attrition rule
instrument/content/policy version
comparator and uncertainty rule
owner, threshold, decision, failure action
```

Profile prediction must name a target and horizon—for example, the probability of an unassisted
correct response on a held-out transformed item seven days later—and report calibration,
discrimination, coverage, and uncertainty against a simple recency baseline. Predictive lift does not
prove adaptation caused learning.

### Content, product, and operational measures

- Content: seeded critical-defect detection, blinded natural-sample audit, per-severity critic
  precision/recall, accepted-answer false rejection, reports/quarantine, correction time, defect-free
  utilization, and fully loaded reviewer/model/rights cost.
- Product diagnostics: first valid evaluated block, confusion abandonment, Keep-practicing
  in-promise fulfillment, recommendation comprehension, learner control/trust, and voluntary return
  opportunity. These do not substitute for learning.
- Reliability: duplicate durable observations, replay divergence for the declared snapshot,
  latency/errors, stale/orphan jobs, deletion/rollback proof, and cost per valid block.
- Critical quality: zero missed seeded critical defects is a finite gate rule; any observed critical
  production defect triggers quarantine/rollback. Natural escape risk is reported with a confidence
  bound rather than claiming statistical zero.

## Smallest proof sequence

1. **Authority ledger:** resolve current-to-V3 deltas before A3.
2. **Gate 0-C mapping rehearsal:** one complete A1-06 executable blueprint plus 20–30 independently
   mapped targets and one overlapping collection fixture; resolve mapping disagreement.
3. **Instrument rehearsal:** two parallel held-out anchor forms for a bounded A1 text construct;
   adjudicate construct coverage, answers, dialect, and form difficulty.
4. **Event/replay proof:** duplicate, correction, invalidation, support, policy-version, raw-retention,
   and replay fixtures against one observation authority.
5. **Shadow prediction:** compare target state with `last unassisted result + elapsed time` using
   learner/item/source-family holdouts; no adaptive serving.
6. **Single-rule randomized pilot:** fixed baseline versus Due/weak-first using the same eligible
   reviewed content and common delayed anchors.
7. **Practice-supply pilot:** repeated blocks from three curated collection promises; measure
   starvation, fallback, complaints, diversity, and review cost before A9.
8. **Conversation checkpoint pilot:** one constrained scenario with two authored checkpoints; keep
   other dialogue coaching-only.
9. **Pilot F, independently:** repository/CI generator → deterministic validation → second model →
   qualified review; test seeded and natural defects, labor, latency, cost, and capacity only when
   generated supply has demonstrated demand.
10. **Private Workflow proof, later:** only after private demand and Gate F-private justify it.

## Other material audit findings

- Raw-response retention conflicts with current plans. Gate 0-A must choose purpose, access,
  encryption, TTL, deletion, and whether corrected evaluators can regrade old responses.
- Human review, not model calls, is likely the main capacity constraint. One qualified bilingual
  teacher may hold pedagogy and linguistic roles when qualifications are recorded. Rights review can
  occur at source-pack admission and on exceptions rather than ritual per-item review of original
  material.
- Factory metrics are gate-specific; they should not have equal status with product learning KPIs.
- Profile calibration validates prediction, not causal learning benefit.
- Cold-start should first use an authored-level/elapsed-time baseline and conservative exploration.
- Low override rates are not inherently good; overrides may express healthy agency.
- Delayed checks themselves teach, and follow-up missingness selects motivated returners; exposure and
  attrition must be analyzed.
- A measurement/instrument owner should be independent of the feature-policy owner. Freeze the
  analysis plan/hash before enrollment and publish null or negative results.
- A learning-efficient product nobody chooses is not viable. Track activation, voluntary return
  opportunity, reported usefulness/trust, and willingness to continue or pay as secondary viability
  constraints, never replacements for learning.
- The current “every generation-model run gets a second-model review” language is ambiguous for a
  schema-invalid output rejected before critique. The existing absolute rule remains unless the
  founder explicitly changes it; do not infer an exemption from cost concerns.

## External evidence used selectively

- [CEFR Companion Volume](https://book.coe.int/en/education-and-modern-languages/8152-common-european-framework-of-reference-for-languages-learning-teaching-assessment-companion-volume.html)
  distinguishes communicative modes and supports construct-specific reporting.
- [What Works Clearinghouse review resources](https://ies.ed.gov/ncee/wwc/reviewresources2) and
  [standards briefs](https://ies.ed.gov/ncee/wwc/standardsbriefs) identify attrition, baseline
  equivalence, and confounding as central causal-design concerns.
- [Standards for Educational and Psychological Testing](https://www.aera.net/Publications/Books/Standards-for-Educational-Psychological-Testing)
  frames validity as evidence supporting an intended score interpretation and use.

## Final decision record

- **Reviewer charter:** direction approved; KPI and construct changes required.
- **V3 vision/guardrails:** retained.
- **Gate 0-C:** proceed.
- **Gate 0-A/A3:** blocked by authority ledger, one-event decision, retention policy, and event/replay
  proof.
- **Pilot A:** blocked by anchor/instrument definition and ground-truth isolation.
- **Pilot B:** blocked by causal KPI protocol, comparator, attrition/missingness, and single-rule scope.
- **Gate F-private:** blocked by deterministic-only R0, private/access semantics, demand, Pilot F, and
  existing runtime gates.
- **A1-06:** remains paused only through Gate 0-C.
- **P-007:** remains changes requested.

The next design revision should be V3.1: a narrower construct/KPI contract, explicit minimum
implementation profile, authority-delta ledger, honest no-cap service definition, and
deterministic-only R0. It should preserve the hard guardrails and defer rather than delete the
long-horizon capabilities that evidence may later justify.
