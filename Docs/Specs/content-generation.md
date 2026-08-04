---
id: CONTENT-GENERATION-001
title: Content generation and review
area: content
status: draft
implementation: mixed
founder_review: required
updated: 2026-08-03
---

# Content generation and review

This migration dossier harvests durable content contracts and research without authorizing new
implementation. It is a founder-approved temporary exception to normal spec creation timing, remains
`status: draft`, and cannot authorize `/feat`. `legacy-accepted` preserves a prior decision pending
migration disposition; `accepted` is reserved for current founder approval.

## Outcome

AIdioma can create, validate, review, version, and promote trustworthy learning material while
keeping authored truth, generated candidates, review evidence, and application serving boundaries
explicit.

## Non-goals

- Do not treat model output as publishable content.
- Do not make the database the authoring source of truth for shared lessons.
- Do not present the operator-only Practice candidate bench as a learner-facing generation system.
- Do not authorize bulk corpus ingestion, private generated sets, or schema widening in this draft.
- Do not reproduce archived research reports or panel transcripts.

## Claim classification

| Class | Meaning in this draft |
|---|---|
| `implemented` | Proven by executable contracts, content, tests, or CI. |
| `legacy-accepted` | Previously accepted policy preserved pending migration disposition. |
| `accepted` | Current founder approval in the new SSOT; none is implied by this draft. |
| `candidate` | Proposed behavior requiring `/plan` and explicit approval. |
| `research` | Evidence that may inform a decision but is not product truth. |
| `conflicting` | Current prose and executable behavior disagree. |

## Implemented foundation

### Authored lesson contract

- `packages/lesson-schema/src/index.ts` is the executable Zod contract for lessons and their item
  kinds: vocabulary, explanation, sentence, passage, conversation seed, multiple choice, and
  reference card.
- Lesson, item, and passage-segment IDs are stable authored identities. `deprecated` supports
  non-destructive retirement, and `contentVersion` is stored with authored content.
- `GrammarTag` is one versioned taxonomy shared by content and evaluation. A1 tags are frozen in
  the current contract; A2 and B1 entries remain provisional until those levels are authored.
- Optional item provenance can identify a source, upstream ID, and license. Absence means original
  content under the current policy.

### Canonical content and gates

- Shared lesson JSON in `content/lessons/` is canonical; `content/README.md` owns that boundary.
- `tooling/content/validate.ts` adds cross-file checks for schema validity, identity, references,
  prerequisite cycles, explanation length, hint leakage, vocabulary use, and immutable-ID history.
- `tooling/content/fixtures/` contains counterexamples for validator behavior.
- `.github/workflows/content.yml` runs the contract, validator, fixtures, and credential-free app
  checks. Prototype-path checks are cleanup residue, not a durable requirement.
- `apps/web/src/lib/content/seed.ts` deterministically transforms valid lesson JSON and hashes its
  complete authored value; the database remains a serving copy.

### Operator candidate bench

- `apps/web/src/lib/practice-sets/candidate-generation.ts` defines strict briefs, provider output,
  resumable run envelopes, human-review manifests, critic artifacts, and content hashes.
- `candidate-validation.ts` applies deterministic quota, uniqueness, answer, focus, grammar, and
  promotion checks.
- `apps/web/scripts/practice-candidates.ts` supports bounded generation, validation, and atomic
  promotion into tracked prototype fixtures.
- Every artifact says `prototypeOnly: true`. This bench is reusable evidence for a future pipeline,
  not canonical curriculum and not production private-set generation.

## Legacy-accepted policy awaiting migration disposition

- ADR-0009 and `content/review/REVIEW-LOG.md` describe a four-layer launch bar: deterministic L1,
  independent-model L2, founder L3, and native-speaker L4 review.
- Canonical target text belongs in its own accepted-answer set; reviewed alternates extend it.
- Published identity is non-destructive: retire authored IDs rather than deleting them.
- Shared scored content should be authored and reviewed; generated behavior is appropriate for
  reactive feedback or dialogue only when its feature contract permits it.
- Curated reviewed Practice Sets belong in the typed MVP; private generated collections remain a
  separate later capability.
- Private generated Practice Sets were assigned to a later authenticated, durable workflow whose
  database state remains product authority; current SDK/runtime details require opening validation.
- A shipping collection contains at least 50 distinct reviewed learning units, with 100 as the
  target. Direction and activity variants do not increase that underlying-content count.

These policies are not fully executed: L3/L4 remain pending for current lessons, lesson 5 has an
open L2 issue, and no learner report-item workflow exists.

## Candidate capabilities

- The executable package, schema, JSON directory, validator, and seed path needed to deliver the
  legacy-accepted curated Practice-set capability.
- The exact delivery contract for the legacy-accepted private generated-set workflow: authenticated
  ownership, bounded generation, deterministic validation, independent review, learner approval,
  cancellation, retention, deletion, and current SDK compatibility.
- P-007: widen the raw vocabulary array for a closed `setId` group while preserving an 8–15
  conceptual-load limit in validation.
- Facts-only morphology and frequency automation, corpus candidate ingestion, and source-aware
  attribution surfaces.
- A report-item loop that can add reviewed alternates with a version bump and review evidence.

None of these candidates is approved by this draft.

## Research retained

- `content/curriculum/SOURCES.md` is the compact source and license synthesis.
- PCIC and CEFR inform scope and objectives through paraphrased facts, not copied prose.
- Tatoeba is a candidate/alternate reserve requiring attribution; kaikki and wordfreq may provide
  facts-only checks; non-commercial or unclear sources must not enter shipped content.
- Source licenses, availability, and product terms are time-sensitive and must be reverified before
  ingestion. The archived survey is evidence, not current legal advice.

## Conflicts to resolve

- `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/Areas/content-pipeline.md` describes `content/practice-sets/`,
  `@aidioma/practice-set-schema`, and set persistence as though they exist; they do not.
- A content hash can change without validation requiring `contentVersion` to increase.
- The four-layer review bar is policy, while current review state is incomplete.
- P-007 is proposed, not accepted; lesson 5 remains blocked under the executable ceiling.

## Reuse boundaries

- The lesson schema owns shared authored primitives and taxonomies; applications import rather than
  redeclare them.
- Deterministic validation, artifact hashing, review manifests, and promotion checks should be
  reusable by lessons and Practice collections.
- Provider adapters, durable workflow orchestration, persistence, and operator UI remain outside the
  content contract.
- Prototype fixtures may test UI and engines but cannot silently become published curriculum.

## Acceptance evidence for future planning

A planned content pipeline must define and prove:

- one canonical source for each published content class;
- immutable identity, explicit version changes, and non-destructive retirement;
- deterministic validation before any provider or persistence promotion step;
- bounded provider calls and resumable, hash-bound artifacts;
- explicit human decisions and independent review appropriate to content risk;
- provenance and licensing evidence without exposing provider payloads or credentials;
- idempotent promotion and rollback/recovery behavior;
- truthful status showing which review layers actually passed.

## Open questions

1. Should every authored hash change require a larger `contentVersion` in CI?
2. Does the founder retain the four-layer launch bar, including full native review?
3. Retain curated Practice Sets in the typed MVP and the 50-minimum/100-target content-depth rule?
4. Should P-007 be approved, revised, or rejected before lesson 5 continues?
5. Which Practice content, if any, becomes canonical shared content rather than a fixture?
6. What minimum report-item and alternate-promotion loop is required before launch?
7. Which ingestion sources are worth a fresh licensing and quality review?

## Decisions and discovered issues

### Decisions

| ID | Classification | Decision or candidate | Status |
|---|---|---|---|
| CG-D001 | implemented | Shared lesson JSON plus `@aidioma/lesson-schema` is authored truth. | retained |
| CG-D002 | implemented | Model candidates require deterministic validation and explicit promotion. | retained |
| CG-D003 | legacy-accepted | Four-layer launch review policy is preserved for migration disposition. | pending |
| CG-D004 | candidate | P-007 closed-set schema widening. | unresolved |
| CG-D005 | research | Source/license posture is evidence and must be reverified before ingestion. | retained |
| CG-D006 | legacy-accepted | Curated reviewed Practice Sets belong in the typed MVP. | pending |
| CG-D007 | legacy-accepted | Shipping collections use 50 reviewed units minimum and 100 as target. | pending |
| CG-D008 | legacy-accepted | Private generated Practice Sets use durable orchestration while database state remains authority. | pending |

### Canonical work and fix references

- `CONTENT-FIX-001` — enforce a content-version increase when canonical authored content changes.
- `SCHEMA-P007-001` — decide the closed-set raw vocabulary representation.
- `CONTENT-GENERATION-001` — plan the curated/private generation and publication boundary.
