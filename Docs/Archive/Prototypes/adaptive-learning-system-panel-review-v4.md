---
title: Adaptive learning system V4 — adversarial stopping review
type: design-review
status: stopping-ruling-withdrawn-historical-review
updated: 2026-08-01
reviewed-commit: 3b8f03a
---

# Adaptive learning system V4 — adversarial stopping review

> **Status notice (2026-08-01):** The unanimous stopping ruling below is withdrawn as product-design
> authority. It reviewed coherence inside V4's inherited frame and failed to detect two foundational
> learner-experience errors: session/block conflation and collection/serving-scope conflation. Retain
> this report as historical evidence about the criteria it actually reviewed. Restart from
> [Handoff 023](../Handoffs/023-2026-08-01-learner-journey-design-reset.md); the process findings are
> recorded in the [design-review retrospective](./adaptive-learning-system-design-review-retrospective.md).

> Three independent auditors running GPT-5.6 Sol with high reasoning reviewed the immutable V4
> proposal at `3b8f03a`, current Specs/ADRs/ROADMAP/runtime schema, and the prior adversarial record.
> Two were explicitly tasked with finding a simpler product/architecture. They made no edits.

## Panel mandates

| Auditor | Mandate |
|---|---|
| Learning/KPI | Test construct validity, anchors, causal inference, content evidence, accessibility, dialect, cold start, and whether Steps 0–3 can produce useful evidence. |
| Product/MCOO | Remove learner concepts, features, controls, KPIs, and validation work that are not needed to test the central hypothesis. |
| Architecture/authority/MCOO | Test migration, one-event authority, data minimization, replay, runtime, content operations, and whether V4 still hides premature infrastructure. |

Every auditor had to choose exactly one stopping decision:

- **A:** create V5 before validation, only for a blocking contradiction, unsafe unassigned authority
  ambiguity, invalid measurement construct, or missing Step 0–3 capability; or
- **B:** stop architecture revisions and execute the sequenced MVP validation.

## Unanimous ruling

**B — Stop architecture revisions and execute the sequenced MVP validation.**

No auditor found a V5-level blocker. V4 is coherent, materially simpler than V3, aligned with the
runtime's pre-A3 state, and sufficient to test target mapping, instrument validity, event/replay
authority, shadow prediction, and one later adaptive rule.

This is approval of V4 as a **non-authoritative validation charter**, not blanket implementation
approval. Current authorities remain binding until their named gates produce reviewed replacement
records.

The next artifact is the **Gate 0-C validation packet**, not V5.

## Why V4 passed the stopping test

V4 now provides:

- a bounded adult-A1 text construct rather than a general-proficiency claim;
- delayed transfer and learner effort as separate outcomes;
- fixed held-out anchors, causal-comparison rules, and a KPI registry contract;
- explicit exclusion of current completion, score floors, same-session retries, and self-report from
  learning ground truth;
- Now/Next/Later scope and an explicit design stopping rule;
- only Lessons, Collections, and Saved on the initial learner surface;
- a repository learning-target manifest instead of a runtime ontology;
- source-owned content plus one-primary target mapping rather than universal item storage;
- one proposed append-only observation authority before A3;
- a compact resolved session plan, sparse shadow state, and deterministic recommendation;
- honest uncapped-session semantics with best-effort novelty;
- an authority-delta ledger assigning every known conflict to a gate;
- repository-first Evidence Packs, offline content production, deterministic-only R0, and deferred
  private Workflow;
- stop conditions after mapping, instrument, event/replay, prediction, and single-rule causal tests.

The actual database still has only authored lesson tables and A3 learner persistence remains pending.
That makes validation and authority choice cheaper and safer now than another speculative system
revision.

## Minimal execution profile

The product/MCOO auditors recommend making Steps 0–3 even smaller without changing V4:

- use one Standard-size block; defer Short until learner-control testing;
- use one overlapping collection fixture, not a catalog;
- keep Confirmed entirely private/shadow;
- instantiate only KPI registry entries needed by the current gate;
- do not add new recommendation UI before Pilot B;
- bound Evidence Packs to the reviewed Step 0 content;
- represent `New` as absence rather than a stored state;
- use a block-level selection reason unless item-level explanation proves necessary;
- fully resolve only authority-ledger rows needed for Steps 0–3; keep later rows visibly open.

These are packet-level scope controls, not V5 changes.

## Routed findings — Gate 0-C

Gate 0-C must make the content semantics executable:

1. Define the minimum target-manifest fields: stable key, bounded human-readable meaning, target
   family, scope/variety qualification, lifecycle, and semantic replacement policy.
2. Explicitly distinguish target keys from broad current `GrammarTag`s.
3. Freeze a mapping codebook before independent mapping.
4. Map source items—not merely lesson topics—to one primary target and supporting demands.
5. Record blind pre-adjudication agreement, disagreement categories, adjudication rate, and qualified
   adjudicator by target family/component. Final consensus cannot hide an unusable model.
6. Quarantine target/component families that fail the predeclared mapping threshold.
7. Choose legacy fixed anatomy versus a new versioned schema; preserve existing A1, prohibit
   placeholders, and prove A1-06 in the chosen executable representation.
8. Make component evidence eligibility executable: which activities may update each text facet,
   which schedule only the item, and how supporting demands block positive attribution.
9. Reuse target keys in one collection fixture without shared payload storage or any lesson-progress
   change.
10. Treat A1-06 as a blueprint/fixture until its content prerequisites and review gates are actually
    complete.

The panel also found that V4's P-007 ruling is not itself an authority record. If P-007 does not yet
exist in the binding register, create it through the normal proposal process rather than treating a
non-authoritative design document as the decision.

## Routed findings — instrument and KPI packet

Before Pilot A enrollment:

1. Name the exact assessed construct. Current typed evaluation is translation-mediated; ES→EN also
   requires English response production, while EN→ES combines bilingual mediation, Spanish form, and
   orthography. Do not label these more broadly than the task supports.
2. Build enough qualified-human-reviewed parallel anchor forms for the declared horizons.
3. Define anchor answers, dialect/register scope, form difficulty, near-duplicate exclusion, and
   leakage tests before recruitment.
4. Either scope claims to the taught neutral Latin-American variety or accept/label valid regional
   responses under an explicit policy; track false rejection by response variety.
5. Provide equivalent keyboard/screen-reader administration, 200% text scaling, non-color feedback,
   preserved responses, accommodation logging, and a declaration of whether an accommodation changes
   the measured construct.
6. Define the predicted event, horizon, qualifying support state, corrections, state ordering,
   coverage, and false-Confirmed numerator/denominator with a one-sided uncertainty bound.
7. Add a cold-start/abstention rule and authored-level/no-history baseline. `New` or insufficient
   evidence must not masquerade as a confident prediction.
8. Keep post-randomization minimum exposure out of the primary intent-to-treat exclusion; treat it as
   adherence or sensitivity analysis.
9. Freeze the analysis plan and content/instrument hashes before outcome data.

## Routed findings — Gate 0-A before A3

Gate 0-A must choose one physical event truth and resolve current authority:

1. Map current Practice Set `targetKey`, optional `knowledgeKey`, and proposed
   `learningTargetKey`; shadow evidence cannot mutate current lesson or set progress.
2. Define idempotency as a client-stable opaque key scoped/validated by learner and session plus a
   server metadata fingerprint—not a new server ID on every retry.
3. Version every discriminated result payload and distinguish graded, ungraded, invalid, abandoned,
   self-report, and corrected observations.
4. Separate append/supersede correction from lawful physical deletion or irreversible
   disassociation.
5. Resolve raw answer purpose, access, encryption, TTL, regrading, deletion, and backup expiry.
6. Add requested/resolved size and an exhaustion/shortfall reason only if not derivable from the
   compact plan.
7. Prove concurrency-safe correction/rebuild for one learner-target-facet without prematurely adding
   a hot-state table.
8. Map current evaluator results and session recipes without creating a second permanent truth.

## Routed findings — Pilot A and Pilot B

Pilot A must freeze the smallest shadow rule and compare it with:

- item-only history;
- last unassisted result + elapsed time;
- authored-level/no-history cold start;
- current simple heuristics where comparable.

Report calibration, discrimination, coverage/abstention, false-Confirmed uncertainty, missingness,
and held-out learner/item/source-family performance. Prediction does not authorize adaptive serving.

Pilot B must test one behaviorally distinct increment. V4's general baseline is due/recency while one
candidate treatment is Due/Needs-review, so the packet must either:

- define the baseline as item-level recency/current heuristic and treatment as target-level
  Due/Needs-review; or
- keep due/recency constant and test weaker-direction priority only.

The eligible reviewed pool and delayed anchors stay common. Predeclare multiplicity, attrition,
effort, dialect, accessibility, accommodation, subgroup, and failure rules.

## Routed findings — practice supply and later content work

- Operationally define “sufficiently distinct” in-promise blocks and exhaustion.
- V4's planner says recent misses/due precede unseen variation, while its supply list puts unseen and
  weaker-direction inventory first. The Step 5 packet must distinguish **pedagogical selection
  priority** from **inventory/fallback availability order** and choose each explicitly.
- Enumerate deterministic R0 transformation families and mechanically prove answer preservation.
- Measure the mandatory second-model failure review for schema-invalid generation attempts separately;
  its cost does not create an inferred exemption from the founder rule.
- Content-factory and Workflow proofs remain later and demand-gated. They do not block Steps 0–3.

## Retain / defer / avoid after V4

| Element | Final audit disposition |
|---|---|
| Lessons, Collections, Saved | Retain |
| Visible discrete collection promises | Retain |
| Repository target manifest and one-primary mapping | Retain and validate |
| One observation authority | Retain; resolve before A3 |
| Recognition/production separation | Retain; define exact task constructs |
| Compact exact plan and policy version | Retain |
| Shadow state | Retain; no learner-facing Confirmed initially |
| Deterministic planner/recommendation | Retain; minimize execution surface |
| KPI registry and held-out anchors | Retain; instantiate only current-step entries |
| No-cap bounded blocks and honest exhaustion | Retain |
| Short block, collection catalog, new recommendation UX | Defer until relevant product test |
| Named user collections | Defer |
| Whole-conversation credit | Defer |
| Private/shared generation and Workflow | Defer until demand and gates |
| Runtime ontology/Evidence Bank/hot profile tables | Defer until query evidence |
| Universal item storage, universal activity score, graph/vector/cache/ML | Avoid until measured need |

## Approved validation sequence

1. **Gate 0-C packet:** mapping codebook/rehearsal, target manifest, evidence policy, schema/anatomy
   ruling, A1-06 fixture, and one overlapping collection fixture.
2. **Authority/instrument packet:** complete Steps 0–3 authority-ledger rows and exact anchor/KPI
   definitions.
3. **Gate 0-A event/replay proof:** one event truth, idempotency, result versions, correction,
   invalidation, retention/deletion, and replay fixtures before A3.
4. **Pilot A:** shadow prediction only; stop or simplify if target state does not beat simple
   baselines.
5. **Pilot B:** one distinct randomized adaptive rule only after Pilot A.
6. **Supply and conversation proofs:** after the core survives.
7. **Pilot F/private Workflow:** independently and only after measured generation demand.

Each packet contains its own acceptance metrics, owner, evidence, failure action, and authority effect.
Passing one step does not imply approval of the next.

## Conditions that reopen V5

Create V5 only if evidence from Steps 0–3 reveals one of these:

- qualified authors cannot map targets reliably at useful granularity;
- no defensible anchor instrument can measure the intended construct;
- current and proposed event/progress authorities cannot be reconciled into one truth;
- correction, deletion, and replay requirements are mutually incompatible;
- the minimal target profile cannot outperform simple item/recency baselines and a different system
  model is required;
- a capability missing from V4 is necessary to run a valid Step 0–3 proof safely.

Do not create V5 for copy edits, speculative Later detail, threshold selection, physical table names,
provider choice, or packet-owned decisions.

## Final decision record

- **V4:** approved as a non-authoritative sequenced-validation charter.
- **V5:** do not create now.
- **Next artifact:** Gate 0-C validation packet.
- **A1-06:** remains paused through Gate 0-C and is initially a fixture/blueprint, not claimed
  launch-reviewed content.
- **A3:** do not begin until Gate 0-A chooses the one event authority and retention policy.
- **P-007:** remains changes requested in design; create/resolve the actual authority record through
  the repository process.
- **Product/application changes:** none authorized by this review.
