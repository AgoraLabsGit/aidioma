---
title: Data model — greenfield tables
type: area-spec
status: active
updated: 2026-07-28
---

# Data model — greenfield tables

> A0-4 / OI-020, completed by the legacy/SSOT audit. This is the application data-model SSOT.
> Shared content tables were migrated and proven in A1-2; user/session/evaluation tables follow in A3.

## Confirmed tables

| Table | Job |
|---|---|
| `lessons` | Authored lesson serving copy |
| `lesson_items` | One row per authored item; discriminated JSON payload |
| `practice_sessions` | Authoritative session start/terminal outcome (ADR-0013) |
| `evaluations` | One row per graded submission, linked to a session |
| `user_item_stats` | Derived item rollup for blend/proficiency |
| `user_lesson_progress` | Derived lesson state/score |
| `saved_items` | Learner-saved authored references |
| `users` | Clerk-backed learner preferences/current position |

## Required fields

| Table | Fields (in addition to IDs/timestamps) |
|---|---|
| `lessons` | slug unique, ordinal, level, title, objective, grammarFocus, contentVersion, contentHash, isActive |
| `lesson_items` | lessonId FK, kind, payload jsonb, grammarTags jsonb, difficulty nullable, contentVersion, deprecated boolean/default false |
| `practice_sessions` | userId, recipe (`continue\|blend\|review`), focusLessonId nullable, plannedSize nullable, startedAt, completedAt nullable, endedAt nullable |
| `evaluations` | userId, sessionId, itemId, lessonId, modality, direction, userInput, score, verdict, feedback, wordDiff, errorTags, evalSource, modelUsed nullable, contentVersion, normalizedInputHash |
| `user_item_stats` | userId+itemId unique, attempts, bestScore, avgScore, lastAttemptAt, missedTags; nullable SRS fields reserved |
| `user_lesson_progress` | userId+lessonId unique, status (`locked\|active\|completed\|mastered`), masteryScore, completedAt, masteredAt |
| `saved_items` | userId, refType, refId, createdAt; unique(userId, refType, refId) |
| `users` | Clerk subject unique, email/profile minimum, CEFR/start level, currentLessonId, dailyGoal, IANA timezone |

Store structured fields such as tags/diffs as typed JSON where relational querying is not needed;
never persist provider secrets or hidden answer sets in client-visible session state.

## Explicit deltas vs early consensus text

- Progress statuses include **completed** (same-day unlock) and **mastered** (later-day confirm) — ADR-0004 / ADR-0011.
- **No `evaluationCache` table** — ADR-0006; hashes/source on `evaluations` instead.
- MC / Quiz attempts **persist as `evaluations`** with modality **`multipleChoice`** (A0-H lock; closes P-001 app-track note). Still index-graded / never calls AI.
- Sessions are first-class and evaluations carry `sessionId` — ADR-0013. Streak uses completed session rows.
- MC / modality / recipe phases+pool are first-class in SessionEngine; item kinds come from lesson schema (incl. study cards — ADR-0012), not extra tables.
- Drop legacy `sentences` / derived-analytics tables when migrating from V1 reference (Lesson 0 fixture if needed).
- MVP saved affordances are vocab/sentence. The polymorphic shape may reserve passage/lesson without exposing those controls.

## Not stored as tables

- **SessionRecipe** (scope, focusLessonId, size, phases/pool) — app runtime / request shape (OI-021).
- **Today’s accuracy / confirmed proficiency** — derived (OI-019 Area spec), not denormalized SSOT.
- Streak and session summaries — derived from `practice_sessions` + linked evaluations.

## Integrity and lifecycle

- JSON lessons/items are canonical; database rows are idempotent serving copies keyed by immutable IDs.
- Seed updates content/version/hash, never deletes an authored ID, and excludes `deprecated=true` items from new sessions.
- Applied SQL files are journaled transactionally with checksums; editing or removing an applied migration fails closed.
- Lesson ordinals are unique at transaction commit (deferred so valid swaps work), and a database trigger rejects moving an authored item ID between lessons.
- Immutable SQL files are the sole DDL authority; Drizzle schema declarations are typed query maps,
  not a `push`/generation source. The ordinal constraint is intentionally absent from Drizzle because
  it cannot express `DEFERRABLE INITIALLY DEFERRED` safely.
- One transaction-scoped advisory lock serializes journal planning plus every pending migration.
  Every run, including a zero-pending run, asserts the exact live ordinal constraint before commit.
- User-owned tables cascade from user deletion. Authored item deletion is forbidden; historical evaluations remain addressable.
- Server resolves grading inputs from active versioned items; browser requests never supply expected answers.

## Closes
OI-020.
