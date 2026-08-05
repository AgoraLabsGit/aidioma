---
id: DATA-PERSISTENCE-001
title: Data and persistence
area: data
status: draft
implementation: mixed
founder_review: required
updated: 2026-08-03
---

# Data and persistence

This migration dossier separates the database that exists from historical schema decisions and
future learner state proposals. It is a founder-approved temporary exception to normal spec creation
timing, remains `status: draft`, is not migration authority, and cannot approve unimplemented tables.
`legacy-accepted` preserves a prior decision pending migration disposition; `accepted` is reserved
for current founder approval.

## Outcome

AIdioma persists authored serving data and future learner state with explicit ownership, immutable
history, least privilege, idempotent writes, and recoverable migrations.

## Non-goals

- Do not call proposed tables current database truth.
- Do not use Drizzle declarations or `push` as DDL authority.
- Do not move shared lesson authoring into the database.
- Do not add speculative analytics, caches, SRS fields, or event infrastructure.
- Do not begin learner-data writes before identity, idempotency, and transaction boundaries exist.

## Current classification

| Class | Meaning |
|---|---|
| `implemented` | Present in SQL, server code, tests, or seed behavior. |
| `legacy-accepted` | Previously accepted decision preserved pending migration disposition. |
| `accepted` | Current founder approval in the new SSOT; none is implied by this draft. |
| `candidate` | Proposed entity or policy requiring `/plan`. |
| `research` | Legacy models or audits that explain risks without defining current schema. |
| `conflicting` | Prose claims more than the executable model supports. |

## Implemented database

### Tables and authority

- `apps/web/drizzle/0000_lessons.sql` creates `lessons` and `lesson_items` only.
- The migration runner also creates its checksum journal, `aidioma_migrations`.
- `apps/web/src/lib/db/schema.ts` is a typed query map for those authored serving tables.
- Immutable SQL files in `apps/web/drizzle/` are the sole DDL authority.
- The deferred unique lesson-ordinal constraint is intentionally represented only in SQL because
  Drizzle cannot safely model its semantics.

### Migration safety

- `apps/web/src/lib/db/migrations.ts` hashes migration files and requires applied migrations to be
  an exact ordered prefix of repository migrations.
- `migration-runner.ts` verifies database and role identity, takes a transaction-scoped advisory
  lock, applies pending statements and journal entries atomically, then asserts live constraint
  shape before commit.
- Wrong identity, edited/removed migration history, journal gaps, DDL failure, or constraint drift
  fail closed. Tests cover rollback and cleanup behavior.
- `apps/web/src/lib/db/safety.ts` defaults operator writes to Development; Preview is explicit and
  Production requires an exact acknowledgement.

### Canonical content serving copy

- `content/lessons/` remains authored truth. The database is a serving copy.
- `apps/web/src/lib/content/seed.ts` parses the shared schema, produces deterministic hashes, and
  maps each top-level authored item to `lesson_items`.
- `apps/web/scripts/content-seed.ts` performs lesson and item upserts in one transaction after an
  identity check.
- Seed behavior is idempotent, never deletes omitted rows, preserves prior deprecation, and rejects
  moving an authored item ID between lessons. SQL also enforces reparenting protection.

## Legacy-accepted but unimplemented decisions awaiting disposition

- Persist each started Practice session and link graded submissions to it (ADR-0013).
- Distinguish completed, deliberately ended, and abandoned/interrupted sessions.
- Derive streaks and summaries rather than storing parallel truth.
- Do not create an MVP cross-user evaluation cache (ADR-0006); retain enough evaluation provenance
  to measure whether one is ever justified.
- Resolve authoritative answers and source versions on the server; never persist grading secrets in
  browser-visible session state.

These are review inputs. No session or evaluation table currently exists.

## Candidate data model

The old `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/Areas/data-model.md` proposes users, practice sets and targets, generation jobs,
sessions, session turns, evaluations, item/target statistics, lesson/set progress, and saved items.
Those entities must be planned in delivery order rather than migrated wholesale.

A minimal first learner-write slice may need:

- an authenticated user identity mapping;
- `practice_sessions` with configuration/policy snapshot and explicit terminal state;
- `evaluations` with one stable client submission ID, source identity/version, verdict, and session;
- zero or more target-specific observation candidates only when `PROGRESS-SAVED-001` and
  `EVALUATION-001` have approved their semantics; each must retain exact semantic target,
  contextual-map/source versions or an equivalent immutable snapshot, requested skill, and
  assistance state; and
- only the rollup or progress state required by the accepted product behavior.

Stats, saved material, generated sets, conversation transcripts, preferences, and richer progress
remain separate candidates until their owning features are planned.

## Research retained

Archived V1/V2 schemas and the A2R audit are archaeological evidence for identity, retry,
authorization, and recovery risks. Their table designs and completion claims are not migration input.

## Conflicts and integrity gaps

- The active data-model document labels many absent tables “confirmed.” Executable migrations prove
  only authored lesson serving data.
- `Lesson.prerequisites` exists in canonical JSON but is dropped by the seed and has no DB column.
- Passage segments have stable canonical IDs but are nested inside the passage payload, not seeded as
  independently addressable rows. The production source resolver grades only vocab and sentence.
- Content hashes and versions are stored, but validation does not require a version increase when a
  hash changes.
- `getDatabase()` in `apps/web/src/lib/db/index.ts` trusts any configured `DATABASE_URL`; operator
  identity guards do not protect runtime application writes.
- No stable submission key or atomic evaluation-plus-rollup transaction exists because learner
  persistence has not been implemented.

## Ownership and lifecycle rules

- Authored IDs are durable; deprecation is non-destructive and historical evaluations must remain
  addressable.
- User-owned records should be deletable under an explicit account/data policy without deleting
  shared authored content.
- Every evaluation must identify exactly one server-resolved assessed source unit and its content
  version. Optional word/form/grammar findings are separate allowlisted target-specific facts; the
  word “target” must not ambiguously refer to both the complete prompt and a lexical meaning.
- A session snapshot records what was actually served; later setting or policy changes cannot rewrite
  historical evidence.
- Derived rollups must be rebuildable from canonical observations or have explicit reconciliation.
- Provider secrets, hidden answers, and raw auth credentials are never database fields.

## Pre-write platform prerequisite

The first learner write is blocked on the platform-owned minimum security baseline: a least-privilege
runtime role, verified environment/database binding, bounded dependency waits, safe browser and log
containment, and authorization evidence. Feature-owned data planning determines the tables and exact
privileges, but `PLATFORM-SECURITY-001` must deliver the pre-write boundary before
`DATA-PERSISTENCE-001` can implement a durable learner mutation.

## Reuse boundaries

- SQL migrations and database identity checks are platform infrastructure.
- Pure session, evaluation, and progress contracts should be reusable by Practice and Lessons.
- Application services own atomic writes; UI components never write tables directly.
- Generated-content orchestration may reference canonical job rows but cannot replace database
  ownership with provider/workflow history.

## Acceptance evidence for the first learner write

- A restricted runtime role and verified environment binding.
- A reviewed SQL migration with checksum/journal/rollback tests.
- One stable idempotency key enforced by a database uniqueness constraint.
- One atomic transaction for the evaluation, session update, and required rollup.
- Duplicate, retry, timeout, cancellation, and partial-failure tests.
- Authorization tests proving one learner cannot read or mutate another learner's state.
- Preview proof with before/after database receipts and no secrets or learner text in logs.
- An explicit retention, deletion, and recovery contract for each written entity.

## Open questions

1. Which minimum entities are required for the first production Practice slice?
2. Must prerequisites be queryable from the serving database, or remain canonical JSON only?
3. Should passage segments become rows, or use a typed nested-source resolver and separate identity?
4. Which progress facts are canonical observations versus rebuildable rollups?
5. What stable submission identifier and retry window should the API use?
6. Which runtime role privileges are necessary for each deployed environment?

## Decisions and discovered issues

### Decisions

| ID | Classification | Decision or candidate | Status |
|---|---|---|---|
| DP-D001 | implemented | Immutable SQL plus the checksum journal is DDL authority. | retained |
| DP-D002 | implemented | Lesson JSON is canonical; DB rows are an idempotent serving copy. | retained |
| DP-D003 | legacy-accepted | Sessions and evaluations should be first-class persisted facts. | pending |
| DP-D004 | legacy-accepted | No cross-user evaluation cache at MVP. | pending |
| DP-D005 | candidate | Start learner persistence with the smallest feature-owned schema slice. | unresolved |

### Canonical work and fix references

- `DATA-PERSISTENCE-001` — plan and implement the minimum feature-owned learner data slice.
- `PLATFORM-SECURITY-001` — deliver the pre-write runtime role, environment, timeout, and containment baseline.
- `EVALUATION-001` — own stable submission and evaluation-service semantics before persistence.
- `CONTENT-FIX-001` — enforce authored content-version changes when the canonical hash changes.
