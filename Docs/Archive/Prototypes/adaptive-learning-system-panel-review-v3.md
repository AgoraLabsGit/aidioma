---
title: Adaptive learning system V3 — independent panel review
type: design-review
status: closed
updated: 2026-07-31
---

# Adaptive learning system V3 — independent panel review

> Three independent reviewers read the complete V3 candidate preserved in commit `6cddfa5`, relevant
> AIdioma authorities and runtime code, and primary external sources where required. The panel then
> delta-reviewed the revised candidate at `0398620`; final clarifications are preserved at `34e4f75`.
> No application, schema, dependency, current authority, roadmap, P-007, or lesson was changed.

## Panel

| Lens | Focus |
|---|---|
| Learning/product | claims, lesson anatomy, assessment validity, content QA, dialect, UX, accessibility |
| Architecture/data | composability, runtime fit, Workflow/Neon authority, retries, migration, MCOO |
| External risk/operations | model correlation, source rights, private safety, provenance, privacy, cost |

## Initial verdict

**Unanimous direction approval; changes required before accepting the content-factory charter.**

The learning/profile/session design remained sound. The new composability and Evidence Bank direction
was also strong. The reviewed V3 nevertheless overextended Workflow beyond ADR-0017, allowed novel
private content after model-on-model review without qualified linguistic authority, lacked a
falsifiable content-quality pilot and bilingual answer authority, contradicted itself about private
brief retention, and did not reconcile V3's optional anatomy with the current executable lesson
schema before A1-06.

## Strong consensus retained

- Atomic claims, objectives, items, containers, sessions, events, and profile have distinct jobs.
- Shared envelopes do not erase specialized explanation/card/flashcard/typed/quiz/passage/
  conversation payloads or evidence authority.
- Capability-driven composition plus specialized discriminated payloads is preferable to one
  nullable universal object or a premature plugin framework.
- Delivery depends on application services, engines, domain contracts, then identity/integrity;
  infrastructure adapters attach at volatile external seams.
- Next.js and Neon own the live learner loop; Workflow never owns sessions, spaced-review sleeps,
  grading authority, profile state, or realtime voice.
- Repository content + CI remains published canonical authority; Neon remains product/job authority;
  Workflow history is operational.
- Model agreement is defect-detection evidence, never linguistic or publication authority.
- Web search is discovery, not a source; books/OER/corpora require exact scope and rights review.
- P-007 remains changes requested, and A1-06 should not wait for application/generation machinery.

## Blocker dispositions

### 1. No falsifiable proof that the factory produces high-quality content

**Finding:** generator + critic + human stages were process proxies, not an observed quality bar.

**Closed:** V3 adds **Pilot F** with qualified-human gold content, seeded critical/major defects across
all payloads, blinded curriculum/bilingual/target-variety ratings, generator-only comparison, critic
precision/recall and false-pass/escape metrics, dialect/provider slices, cost/turnaround, and
predeclared publication thresholds. Seeded/observed critical escapes have zero tolerance. “A+” remains
an aspiration until a measurable definition passes.

Gate F-private now explicitly requires applicable Pilot F critical-escape and false-pass thresholds
before the first private R0 auto-release.

### 2. Canonical sources did not establish bilingual accepted answers

**Finding:** CEFR, PCIC, RAE/ASALE, and corpora cannot by themselves establish adequate English–
Spanish translation accept sets.

**Closed:** the Evidence Bank now uses a validator-controlled **source-to-assertion matrix**:

- CEFR for skill/communicative descriptors;
- PCIC for Spanish curricular alignment;
- RAE/ASALE for normative grammar/orthography/form, dialect-qualified;
- corpora for attestation/geography/register/frequency;
- licensed bilingual evidence and/or original qualified bilingual judgment for translation answers;
- qualified region-specific evidence/review for cultural claims;
- AIdioma pilot evidence for product proof/scheduling and empirical difficulty.

Accepted-answer “completeness” is replaced by measurable adequacy, adversarial variants, dialect/
register policy, and false-rejection correction.

### 3. Optional V3 anatomy conflicted with the executable lesson schema

**Finding:** current lessons require explanation, passage, conversation, vocabulary and sentence
bands, while V3 says components depend on objective need. A1-06 could otherwise create placeholders
or deepen the legacy coupling.

**Closed as Gate 0-C:** before A1-06, make a binding legacy-versus-V3 schema/anatomy ruling, prohibit
placeholder assets, preserve existing A1 validity, and prove the complete A1-06 blueprint in its
executable schema representation.

### 4. Workflow exceeded ADR-0017 and proven need

**Finding:** the first candidate assigned private, canonical-lesson, and shared-practice generation
to Workflow even though ADR-0017 authorizes A9 private Practice Sets only.

**Closed:** Workflow is private-A9-first. Canonical/shared production uses the current repository/
agent/CI process while reusing V3 source packs, schemas, critic rubrics, audits, and review roles.
Shared/canonical Workflow requires a proven private path, Pilot F, measured manual/retry/review need,
founder approval, new ADR, and roadmap owner.

### 5. Neon authority lacked start/hook/cancel/reconciliation invariants

**Finding:** crash/race windows could let Workflow state or hook payload become de facto authority.

**Closed:** V3 now requires Neon-first job reservation; job/attempt-only Workflow inputs; canonical
version compare-and-set transitions; attempt-scoped provider calls; recorded ambiguous outcomes;
Neon-first version-bound review decisions with typed hooks only as wake-up; cancel-first checks before/
after side effects; queued-without-run/run-without-reference/stale/terminal divergence reconciliation;
and repository merge + CI for any later shared publication.

### 6. Novel private content could teach incorrect language

**Finding:** low profile authority prevents false mastery but not the learner studying wrong Spanish.

**Closed:** private auto-release is limited to visibly labeled, item-local R0 transformations of
reviewed claims, answers, and assertions. New claims/answers/cultural facts/grammar explanations/
dialect forms/novel scored prompts become R1 and wait for qualified language review. When capacity is
unavailable, reviewed fallback is served and the request stays queued.

### 7. Frozen private brief contradicted audit/privacy rules

**Finding:** the audit said it retained the brief/hash while also excluding private text, and durable
Workflow event history makes inputs/outputs retention-sensitive.

**Closed:** raw requests, if required, live in a separate owner-scoped short-TTL artifact. Audit keeps
only a sanitized allowlisted brief/version/reference and keyed purpose/version HMAC if equality is
needed. Workflow inputs, step arguments/returns, and hooks carry opaque IDs/hashes/status/decisions;
candidate text, learner edits, prompts, excerpts, and raw input stay in governed storage.

## Material major-finding dispositions

| Finding | Final V3 disposition |
|---|---|
| Universal evaluation score risk | Common observation envelope with discriminated translation/choice/reading/self-report/conversation result; result-specific evidence only |
| Dependency diagram ambiguity | Delivery → application → engines → domain/content → identity; infrastructure from side |
| Item envelope leaked grading secrets | Separate authored/editorial, server evaluable, and learner-safe projections |
| Too many mandated ports | Names are responsibility boundaries; explicit ports only at proven volatile seams |
| Material edit after review | Invalidates affected approval, reruns review, binds publication to final hash |
| Generic “human/native” role | Separate pedagogy, qualified bilingual/target-variety linguistic, and source/rights roles |
| One generic critic rubric | Versioned quality profile per explanation/card/flashcard/typed/quiz/passage/conversation |
| Source links too granular | Direct for high-risk/new assertions; routine R0 may inherit reviewed source pack |
| Level/frequency/difficulty conflation | Curricular alignment, usage frequency, complexity, authored challenge, empirical difficulty separated |
| Ordered source hierarchy unsafe | Replaced with assertion-scope matrix; AIdioma cannot self-certify external facts |
| License recorded but not propagated | SPDX/LicenseRef/terms, inherited obligations, consult-only default, publication fail-close |
| Source retrieval injection | Typed assertions + bounded lawful excerpts only; hostile-source fixtures |
| Noncritical/critical source change treated alike | Immediate quarantine for rights/privacy/security/malicious/critical correctness; documented review for routine change |
| Job row overloading | Logical job, immutable attempt/artifact, hash-bound review, publication link separation |
| Evaluation budget reused | Dedicated generation Gateway credential/budget/admission/concurrency/attribution |
| Composability too absolute | Owning unions/registries and justified additive constructs may change; unrelated progress/provider code may not |
| Missing operational query shapes | Bounded relational job/stale/idempotency/review/dedupe/reverse-dependency/quarantine queries |

The user's requirement remains explicit: **every run that calls a generation model receives a second-
model review**. Only a fully deterministic transformation with no generation-model call is outside
that rule. For R1/R2, actual providers are pinned and fallback fails closed; benchmark results—not
brand or size—define suitable model strength.

## Final delta rulings

All three reviewers re-read the entire revised V3:

- Learning/product: every blocker and material learning/content finding closed; no regression.
- Architecture/data: every blocker and material runtime/composability finding closed; no regression.
- External risk/operations: every safety, privacy, source, licensing, and model-governance blocker
  closed; added the final Pilot F → first-R0-release cross-reference.

**Unanimous final ruling: approve V3 as a non-authoritative, gated design and content-factory
charter.**

This approval authorizes founder decisions, Gate 0 design work, internal Pilot F design, and later
authority proposals only. It does not authorize migrations, dependency installation, Workflow
adoption, generated publication, real-learner enrollment, P-007, or A1-06 authoring.

## Final gates

- **Gate 0-C:** claim/objective/proof plus binding schema/anatomy compatibility; blocks A1-06.
- **Gate 0-A:** event/profile/session persistence and replay; blocks A3 persistence.
- **Gate F-private:** ADR-0017 private Workflow, privacy, reconciliation, sources, model/qualified
  review, dedicated budgets, Preview compatibility, and applicable Pilot F thresholds.
- **Pilot F:** unpublished seeded-defect/human-gold validation of the content factory.
- **Gate F-shared:** later, separate new ADR/roadmap decision after proven need; not part of A9.

## P-007 and A1-06

- **P-007:** changes requested / do not approve as written. Separate objective/claim load, reviewed
  pool capacity, session size, number patterns/anchors, and sampled functional proof. Sampling never
  confirms unobserved numerals.
- **A1-06:** paused only through Gate 0-C, now including the executable schema/anatomy ruling. It does
  not wait for Gate 0-A, Gate F-private, Pilot F, or shared Workflow automation.

## External references used selectively

- [Instituto Cervantes PCIC](https://cvc.cervantes.es/ENSENANZA/biblioteca_ele/plan_curricular/default.htm)
  and [variety policy](https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/norma.htm)
- [CEFR Companion Volume](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions)
- [RAE DPD](https://www.rae.es/dpd/) and
  [Nueva gramática](https://www.rae.es/obras-academicas/gramatica/nueva-gramatica-basica)
- [COERLL language OER](https://coerll.utexas.edu/coerll/)
- [Workflow repository](https://github.com/vercel/workflow) and
  [typed hooks](https://useworkflow.dev/docs/api-reference/workflow/define-hook)
- [Workflow event logging](https://vercel.com/blog/introducing-workflow) and
  [encryption](https://vercel.com/changelog/workflow-encryption)
- [Correlated errors in LLMs](https://proceedings.mlr.press/v267/kim25e.html)
- [Vercel Gateway provider controls](https://vercel.com/docs/ai-gateway/models-and-providers/provider-options)
  and [ZDR](https://vercel.com/changelog/zero-data-retention-no-prompt-training-on-ai-gateway)
- [Creative Commons license types](https://creativecommons.org/share-your-work/cclicenses/) and
  [SPDX expressions](https://spdx.github.io/spdx-spec/v3.0.1/annexes/spdx-license-expressions/)
- [Council of Europe permissions](https://www.coe.int/it/web/portal/copyright-licensing-permissions)
- [OWASP improper output handling](https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/)
- [ICO Children's Code profiling guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/12-profiling/)
