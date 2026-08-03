---
title: Content pipeline — app-facing contract
type: area-spec
status: active
updated: 2026-08-03
---

# Content pipeline — app-facing contract

## Boundaries

- `content/` owns authored lessons, curriculum, style, review evidence, and authoring history.
- `content/practice-sets/` owns curated set payloads and their review/provenance evidence.
- `tooling/content/` owns validation, fixtures, immutable-ID snapshot, and allowlist.
- `packages/lesson-schema/` owns the executable shared contract and GrammarTag/ErrorTag taxonomy.
- `Docs/Registers/schema-proposals.md` owns additive schema proposals and rulings.
- The app imports `@aidioma/lesson-schema`; it never redeclares content types or tags.
- A6 adds `@aidioma/practice-set-schema`, importing shared answer/provenance/GrammarTag contracts
  rather than redefining them.

## Invariants

- Scored/model input is authored and CI-validated; reactive feedback/dialogue may be generated.
- Lesson/item/segment IDs are immutable. Edits bump `contentVersion`; deprecated items remain in
  content with `deprecated: true` so user history never dangles.
- The seed is idempotent by lesson slug + item ID, records `contentHash`, and never silently
  deletes an item missing from a later export.
- Canonical text always joins its accept set; reviewed alternates extend it.
- Direction lives on evaluations. Optional `audioUrl` and provenance remain reserved in content.
- Curated set IDs/target IDs are immutable; edits bump the set content version. Frequency sources
  inform original selection but ranked third-party tables are not copied wholesale.

## Gate

Schema parse → cross-file validator → immutable-ID snapshot → adversarial L2 QA → founder L3 →
paid native L4 for launch lessons. Current commands live in root `package.json` and ROADMAP.
GitHub Content CI runs the deterministic contract, validator, fixture, prototype-current, and seed
transformation tests plus the full credential-free app typecheck/test suites whenever their direct
inputs change; it requires no database credentials.
The A6 set validator adds capability/filter consistency, accepted-answer coverage, grammatical-form
validity, duplicate target, provenance, and supported-activity asset checks. Launch sets receive the
same L2/founder/native-review bar as scored lesson content.

## App consumption

`npm run content:seed` validates the corpus, applies only pending checksum-protected SQL migrations,
then reads the shared schema and upserts `lessons` by slug plus `lesson_items` by immutable ID. It
stores `contentVersion` + deterministic content hash, never deletes missing rows, never revives a
deprecated item, and rejects item reparenting. Future serving queries must select only active
non-deprecated items. The DB is a serving copy; JSON in `content/lessons/` is canonical.
Migration planning/application is serialized under one database advisory lock. SQL migrations—not
Drizzle generation/push—own DDL, and each run fails closed if the deferred ordinal constraint drifts.
The local write target defaults to Development and is verified by database plus role identity before
any mutation. Preview is explicit; Production also requires the documented exact acknowledgement.

Curated sets use the same validate-then-idempotent-seed boundary into `practice_sets` and
`practice_set_targets`; JSON remains canonical. Private generated sets do not enter `content/` and
must pass the generation gate in the Practice Sets spec before persistence.

## Prototype candidate bench

The local Restaurant candidate bench is operator-only pressure-test tooling, not the A9 private-set
pipeline. It reuses shared accepted-answer, GrammarTag, prompt, and numeric-difficulty contracts;
uses strict provider/run schemas, bounded batches, inventory hashes, and resumable checkpoints; and
stops on schema or semantic checkpoint failure before another model call. Promotion requires
deterministic validation, one human decision per candidate, warning acknowledgement, reviewed
coverage claims, and a different-model independent critic bound to the raw and reviewed hashes.
Promoted prototype JSON and its tracked review/critic sidecar are hash-bound. They remain fixture
input: not `content/`, not canonical curriculum, not public content, and not an ADR-0009 launch pass.
The original-only brief forbids generated provenance rather than asserting an external source.

## Deferred pipeline work

OI-025 owns C2 contract prep. Corpus ingestion, morphology/frequency automation, and user-content
import remain registered post-MVP; nothing ingested bypasses provenance, validation, or review.
