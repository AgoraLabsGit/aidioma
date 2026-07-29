---
title: Content pipeline — app-facing contract
type: area-spec
status: active
updated: 2026-07-28
---

# Content pipeline — app-facing contract

## Boundaries

- `content/` owns authored lessons, curriculum, style, review evidence, and authoring history.
- `tooling/content/` owns validation, fixtures, immutable-ID snapshot, and allowlist.
- `packages/lesson-schema/` owns the executable shared contract and GrammarTag/ErrorTag taxonomy.
- `Docs/Registers/schema-proposals.md` owns additive schema proposals and rulings.
- The app imports `@aidioma/lesson-schema`; it never redeclares content types or tags.

## Invariants

- Scored/model input is authored and CI-validated; reactive feedback/dialogue may be generated.
- Lesson/item/segment IDs are immutable. Edits bump `contentVersion`; deprecated items remain in
  content with `deprecated: true` so user history never dangles.
- The seed is idempotent by lesson slug + item ID, records `contentHash`, and never silently
  deletes an item missing from a later export.
- Canonical text always joins its accept set; reviewed alternates extend it.
- Direction lives on evaluations. Optional `audioUrl` and provenance remain reserved in content.

## Gate

Schema parse → cross-file validator → immutable-ID snapshot → adversarial L2 QA → founder L3 →
paid native L4 for launch lessons. Current commands live in root `package.json` and ROADMAP.
GitHub Content CI runs the deterministic contract, validator, fixture, prototype-current, and seed
transformation tests whenever their direct inputs change; it requires no database credentials.

## App consumption

`npm run content:seed` validates the corpus, applies only pending checksum-protected SQL migrations,
then reads the shared schema and upserts `lessons` by slug plus `lesson_items` by immutable ID. It
stores `contentVersion` + deterministic content hash, never deletes missing rows, never revives a
deprecated item, and rejects item reparenting. Future serving queries must select only active
non-deprecated items. The DB is a serving copy; JSON in `content/lessons/` is canonical.
Migration planning/application is serialized under one database advisory lock. SQL migrations—not
Drizzle generation/push—own DDL, and each run fails closed if the deferred ordinal constraint drifts.

## Deferred pipeline work

OI-025 owns C2 contract prep. Corpus ingestion, morphology/frequency automation, and user-content
import remain registered post-MVP; nothing ingested bypasses provenance, validation, or review.
