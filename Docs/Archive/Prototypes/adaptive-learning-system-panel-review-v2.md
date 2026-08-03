---
title: Adaptive learning system V2 — second independent panel review
type: design-review
status: closed
updated: 2026-07-31
---

# Adaptive learning system V2 — second independent panel review

> Review of the exact V2 revision preserved in commit `830a3d1`. Three independent reviewers read
> the entire proposal and challenged it again from learning/product, architecture/data, and external
> risk/operations perspectives. No application, schema, current authority, proposal register,
> roadmap, or lesson was changed.

## Panel and original verdicts

| Lens | Verdict on reviewed V2 |
|---|---|
| Learning/product | Reject as a pilot charter until five bounded construct/pilot blockers close |
| Architecture/data | Suitable as a shadow-pilot charter after three Gate-0 corrections; not a schema spec |
| External risk/operations | Safe as non-authoritative design, not safe to open a real-learner pilot yet |

## Combined ruling

**Approve the strategic design; changes required before treating V2 as a pilot charter.**

The second panel did not reopen the broad architecture. It agreed on the central system:

- lessons and collections organize experiences rather than own separate knowledge;
- durable observations feed one cross-source profile;
- sessions are bounded and continuation is unlimited;
- instructional assets, practice formats, evaluation, and retained evidence have different jobs;
- one primary claim, two initial text facets, Postgres, and deterministic ranking are appropriate
  MCOO boundaries;
- generation, voice, conversation evidence, numeric mastery, and automatic progression remain out of
  the first pilot;
- P-007 should remain rejected as a raw-cap increase;
- A1-06 should pause only for content-model decisions, not the entire future platform.

The reviewed V2 nevertheless called a lexical sense, a group of six feelings, a grammar contrast,
and a sampled number range “claims” at different granularities. That single ambiguity propagated
into lesson proof, cross-tense tracking, the pilot matrix, and P-007. The other blockers concerned
evidence validity, pilot definition, current-contract compatibility, replay, and pilot privacy.

## Blocker dispositions

### 1. Atomic claims were conflated with lesson objectives and profile facets

**Finding:** V2 encoded direction in some claim examples, limited lessons to 1–3 “claims,” grouped six
feeling words into one claim, and also described lexical identities as one word sense. This could
either hide per-word weakness or make the lesson/pilot impossible to prove in eight items.

**Disposition: incorporated.** The revised V2 now separates:

- facet-neutral atomic claims such as `lex:es:comer:sense1`;
- event facets `recognize_text | produce_text`;
- 1–3 learner-facing lesson objectives that may group atomic claims;
- objective progression proof from per-atomic-claim Confirmed state.

The number of atomic claims is an empirical authoring budget, not a fixed 1–3 cap. Semantic claim
changes create new IDs.

### 2. Cross-level lexical and grammatical identity was underspecified

**Finding:** A single *comer* production state would incorrectly merge *como* and *comí*, while a
claim for every arbitrary cross-product would be unmanageable.

**Disposition: incorporated.** V2 now includes a worked mapping where the lexical sense is a
supporting prerequisite and present/preterite form claims are distinct primary claims. The pilot
still credits exactly one primary claim; multi-claim positive inference remains deferred.

### 3. One primary claim did not guarantee valid evidence

**Finding:** A learner might fail a *ser/estar* item because its feeling word or prompt language was
unknown. Soft readiness is reasonable for practice, but not for proof or negative evidence.

**Disposition: incorporated.** Practice eligibility and evidence eligibility are now separate.
Proof/check items must control, supply, or establish supporting demands. Ambiguous supporting failure
may schedule practice but cannot count negatively against the primary claim.

### 4. The pilot was simultaneously shadow-only and learner-visible adaptive

**Finding:** A shadow model cannot both leave the fixed recipe unchanged and serve an adaptive block.
The reviewed pilot also lacked a declared comparison, delayed-check protocol, outcome, participant
scope, and go/no-go rule.

**Disposition: incorporated.** V2 now has two pilots:

1. **Pilot A — shadow validity:** unchanged UI/progression, exact three-claim/five-cell matrix,
   native-reviewed deterministic gold items, offline collection fixture, replay/prediction tests.
2. **Pilot B — adaptive UX/outcome:** only after Pilot A and the real collection/session path pass;
   predeclared learner-level comparison, delayed checks, primary/secondary outcomes, power/attrition,
   and go/no-go thresholds.

The first eight-item block is explicitly practice, not proof.

### 5. Lesson completion and failed-proof UX were undefined

**Finding:** V2 separated lesson completion from claim knowledge but did not say what happens when a
block ends without proof, or how that interacts with current unlock rules.

**Disposition: partially incorporated and explicitly deferred.** V2 now separates Session finished,
Lesson Completed, and Claim Confirmed. Current completion/unlock remains authoritative in Pilot A;
shadow data cannot change it. The future learner UX for unmet objectives is now a founder decision,
not an architectural assumption.

### 6. Canonical mapping authority and current-contract compatibility were missing

**Finding:** Current canonical lesson content is JSON, the lesson schema is frozen, planned
`evaluations` retain raw input, current Continue is a full Mix arc, and the live collection path
arrives later. V2 did not say how its new manifests/events coexist.

**Disposition: incorporated as Gate 0-A.** The shadow slice uses validator-checked canonical manifests
outside the frozen lesson schema, keyed by immutable content IDs. Before A3, one event authority must
be chosen: a `practice_events` envelope with optional graded detail, or an extended evaluation
authority—not both. This is a contract migration because learner tables have not landed.

The production collection path is not pulled forward: an offline fixture tests the mapping seam,
lesson events begin at A3, and live cross-source validation waits for the planned collection path.

### 7. Replay/concurrency requirements were not operationally falsifiable

**Finding:** V2 lacked authoritative ordering time, as-of semantics, tie-breaking, invalidation
repair, time-derived Due behavior, and state-row update rules.

**Disposition: incorporated.** Server receipt time is authoritative; learner-local date, IANA zone,
and offset are snapshotted; ordering is `(occurred_at, event_id)`; replay has explicit as-of time and
policy version; one claim/facet update is serialized; invalidation rebuilds that row; profile rows
record the policy and last processed event.

Plan snapshots now add candidate-pool hash, profile/event watermark, canonical serialization, and
stable sorting. Misses affect the next block rather than mutate the immutable current plan.

### 8. Raw-equivalent data and pilot population were not bounded

**Finding:** Removing raw `userInput` is insufficient if word diffs, feedback, logs, prompts, or
short-domain hashes reconstruct it. The proposal also did not define minors, UI-language fluency, or
whether AI/`close` grades could update the pilot.

**Disposition: incorporated.** Durable events and telemetry exclude raw or reconstructable answers;
use bounded error categories and authored correction references. Normalized hashes are dropped unless
needed; a keyed purpose/version HMAC is required if equality matching is justified. Request IDs bind
to a canonical request fingerprint.

The first learner pilot is consenting-adult, fluent-UI-language, deterministic-grade-only, native-
reviewed, disclosed, resettable/deletable, feature-flagged, and kill-switchable. Exact retention and
backup-restoration deletion are pilot-opening gates. AI evaluator results remain separate analysis.

### 9. Private generated content retained too much cross-source authority

**Finding:** Automated validation cannot establish a private prompt's correctness well enough to
weaken or confirm a canonical claim.

**Disposition: incorporated.** A user-created collection of reviewed items can earn reviewed
evidence. A private generated item's results initially schedule only that item. Cross-source claim
authority requires canonical human/native review or a later measured policy decision.

## Major/minor finding dispositions

| Finding | Disposition in revised V2 |
|---|---|
| Controls may make productive proof impossible | Practice-only label plus separate required check |
| Cold start undefined | Authored standard band, rapid local adjustment, Too easy/Too hard |
| Passage comprehension lacked a profile destination | Remains a task outcome outside atomic profile initially |
| Full conversation success lacked a data home | Separate rubric/task outcome; constrained atomic credit deferred |
| `produce_text` conflated semantics/form/spelling | Proof policy declares tolerances; speed/accommodation non-authoritative |
| Teaching and proof events were mixed | Event purpose `teach | practice | check`; first block is practice |
| Exactly one explanation was inherited constraint | One orientation plus optional claim-linked teaching steps |
| Profile states had no pilot policy | Facts-only allowed; optional explicit deterministic `policy_v0` |
| Session/query/index paths absent | Bounded batch hot paths and minimal keys added |
| Shadow rollback/observability absent | Flag, computed-versus-served record, kill switch, bounded metrics |
| Provider exactly-once was overclaimed | Guarantee one durable event; ambiguous external-call outcome is measured |
| Low-authority evidence could be collapsed | Trust tier snapshotted; proof rebuilt from qualifying events |
| Aggregate private demand could identify a learner | Allowlisted IDs/coarse counts/minimum cohort only |
| Generated output/ownership/review capacity | Plain-text schema, authorization, quarantine, human-review throttle |
| Voice fairness/accessibility | Subgroup/device/disability release tests and typed fallback |
| AI/provider transparency and retention | Processor/data-routing gate and clear AI disclosure |
| Child profiling treated as voice-only risk | Adult pilot; separate child/age/profile gate before minors |
| Learner correction/profile control absent | Report item/grade plus notice, reset, and deletion in pilot gate |

Reason codes are now closed/versioned with localized templates; source quality and local-day context
are snapshotted; cold storage remains retention; exact thresholds and candidate-pool bounds remain
phase-specific implementation decisions.

## Revised P-007 ruling

**Unanimous: CHANGES REQUESTED / reject as written.**

The replacement must distinguish:

- individual addressable numeral items;
- compositional pattern claims and irregular anchors;
- the functional objective of understanding/giving an age;
- lesson objective/atomic-claim load;
- practice-pool capacity and bounded session size;
- stratified representative proof versus complete member confirmation.

A sampled proof may complete a declared functional objective. It must not mark every unobserved
number Confirmed. This avoids reproducing false mastery after removing the raw row cap.

## Revised A1-06 ruling

**Keep paused only through Gate 0-C.** Resume after approving one worked A1-06 blueprint that resolves
facet-neutral lexical claims, *-er/-ir* form claims, primary/supporting mappings, failure attribution,
and objective/core/pool/proof representation.

A1-06 does not wait for Gate 0-A persistence/concurrency/privacy implementation, generation,
conversation, automatic cross-source completion, or final scheduling thresholds.

## External resources retained by the panel

Borrow vocabulary and bounded techniques, not wholesale platforms:

- [QTI](https://www.1edtech.org/standards/qti/index) and
  [Caliper](https://www.1edtech.org/standards/caliper) for item/result/event terms;
- [UniMorph](https://unimorph.github.io/schema/) for a small form vocabulary;
- [W3C PROV](https://www.w3.org/TR/prov-overview/) and
  [SPDX](https://spdx.org/licenses/) for provenance/licensing concepts;
- [NIST AI RMF](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) as a validity and subgroup
  checklist;
- [ICO pseudonymisation guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/anonymisation/pseudonymisation/)
  for small-domain hash and re-identification risk;
- [OWASP LLM output handling](https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/)
  and [OWASP API authorization](https://owasp.org/API-Security/editions/2023/en/0x11-t10/) for later
  generation fixtures;
- [FTC COPPA guidance](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business),
  [European Commission child-data guidance](https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en),
  and the [ICO Children's Code](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/)
  for the pre-minor product gate;
- [W3C accessibility guidance](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) for
  alternate input and accessible practice controls.

## Delta review

All three reviewers re-read the full panel-revised proposal. The revised V2 is preserved in commit
`e63a77b`.

| Lens | Delta ruling |
|---|---|
| Learning/product | All construct, evidence, completion, control, content-type, P-007, and A1-06 findings closed for a shadow charter; caught and corrected *feliz* → current A1-05 *contento* |
| Architecture/data | All three blockers and material architecture findings closed; collection prediction was moved to the real fixed A6 path and the pre-A6 fixture kept offline |
| External risk/operations | All pilot-opening blockers closed at charter level; keyboard/screen-reader acceptance was added to Pilot B's opening gate |

No reviewer found a new critical regression. The final panel ruling is:

**Approve V2 as a non-authoritative, gated design and shadow-pilot charter.**

This approval authorizes the next founder design decisions and Gate 0 specification work only. It
does not approve a schema migration, application implementation, real-learner enrollment, P-007, or
A1-06 authoring. Each stated gate must still be decided and validated in its own authority-changing
work item.
