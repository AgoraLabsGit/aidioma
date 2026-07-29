---
title: Data model — greenfield tables
type: area-spec
status: active
updated: 2026-07-29
---

# Data model — greenfield tables

> A0-4 / OI-020, completed by the legacy/SSOT audit. This is the application data-model SSOT.
> Shared content tables were migrated and proven in A1-2; user/session/evaluation tables follow in A3.

## Confirmed tables

| Table | Job |
|---|---|
| `lessons` | Authored lesson serving copy |
| `lesson_items` | One row per authored item; discriminated JSON payload |
| `practice_sets` | Curated/private set metadata, capabilities, version, and lifecycle |
| `practice_set_targets` | Immutable, versioned set targets and optional knowledge key |
| `practice_sessions` | Authoritative session start/terminal outcome (ADR-0013) |
| `practice_session_turns` | A12+ ordered learner/agent/feedback transcript for live sessions |
| `evaluations` | One row per graded submission, linked to a session |
| `user_item_stats` | Derived item rollup for blend/proficiency |
| `user_practice_target_stats` | Derived set-target/knowledge-key rollup across sets |
| `user_lesson_progress` | Derived lesson state/score |
| `user_set_progress` | Derived coverage/score for one set version; never lesson state |
| `saved_items` | Learner-saved authored references |
| `users` | Clerk-backed learner preferences/current position |

## Required fields

| Table | Fields (in addition to IDs/timestamps) |
|---|---|
| `lessons` | slug unique, ordinal, level, title, objective, grammarFocus, contentVersion, contentHash, isActive |
| `lesson_items` | lessonId FK, kind, payload jsonb, grammarTags jsonb, difficulty nullable, contentVersion, deprecated boolean/default false |
| `practice_sets` | slug, title, description, levelRange, facets, origin, visibility, ownerUserId nullable, supportedActivities, defaults, contentVersion, provenance, isActive |
| `practice_set_targets` | practiceSetId, immutable targetKey, kind, payload, grammarFeatures, grammarTags, difficulty, knowledgeKey nullable, contentVersion, deprecated |
| `practice_sessions` | userId, recipe (`continue\|blend\|review\|set`, plus `conversation` in A12), focusLessonId nullable, focusPracticeSetId nullable, focusConversationItemId nullable in A12, configuration jsonb nullable, plannedSize nullable, startedAt, completedAt nullable, endedAt nullable |
| `practice_session_turns` | sessionId, ordinal, role (`learner\|agent\|feedback`), text, evaluationId nullable, interrupted boolean, modelUsed nullable; A12 migration only |
| `evaluations` | userId, sessionId, sourceType (`lesson\|set`), lessonItemId nullable, setTargetId nullable, lessonId nullable, modality, direction, inputMode nullable/default typed until A10 (`typed\|voice`), userInput, score, verdict, feedback, wordDiff, errorTags, evalSource, modelUsed nullable, contentVersion, normalizedInputHash |
| `user_item_stats` | userId+itemId unique, attempts, bestScore, avgScore, lastAttemptAt, missedTags; nullable SRS fields reserved |
| `user_practice_target_stats` | userId+statKey unique (`knowledgeKey` else target ID), attempts, bestScore, avgScore, lastAttemptAt, missedTags |
| `user_lesson_progress` | userId+lessonId unique, status (`locked\|active\|completed\|mastered`), masteryScore, completedAt, masteredAt |
| `user_set_progress` | userId+practiceSetId+contentVersion unique, coverage, score, lastPracticedAt |
| `saved_items` | userId, refType, refId, createdAt; unique(userId, refType, refId) |
| `users` | Clerk subject unique, email/profile minimum, CEFR/start level, currentLessonId, dailyGoal, IANA timezone |

Store structured fields such as tags/diffs as typed JSON where relational querying is not needed;
never persist provider secrets or hidden answer sets in client-visible session state.

## Explicit deltas vs early consensus text

- Progress statuses include **completed** (same-day unlock) and **mastered** (later-day confirm) — ADR-0004 / ADR-0011.
- **No `evaluationCache` table** — ADR-0006; hashes/source on `evaluations` instead.
- MC / Quiz attempts **persist as `evaluations`** with modality **`multipleChoice`** (A0-H lock; closes P-001 app-track note). Still index-graded / never calls AI.
- Sessions are first-class and evaluations carry `sessionId` — ADR-0013. Streak uses completed session rows.
- A10 voice remains the normal recipe/evaluation: only `inputMode` is additive. Transcription
  provider/latency/cost stays in bounded operational telemetry; raw audio is not a database field.
- A12 adds `practice_session_turns` only when continuous conversation needs ordered history/resume;
  it is not pulled forward for turn-based A10. A linked evaluation remains the sole scored record.
- Every evaluation identifies exactly one server-resolved source target: lesson or set (XOR). Set
  evaluations update set/target stats only and cannot update `user_lesson_progress`.
- MC / modality / recipe phases+pool are first-class in SessionEngine; item kinds come from lesson schema (incl. study cards — ADR-0012), not extra tables.
- Drop legacy `sentences` / derived-analytics tables when migrating from V1 reference (Lesson 0 fixture if needed).
- MVP saved affordances are vocab/sentence. The polymorphic shape may reserve passage/lesson without exposing those controls.

## Not stored as tables

- **SessionRecipe** (scope, lesson/set focus, configuration snapshot, phases/pool) — app runtime / request shape (OI-021 / ADR-0015).
- **Today’s accuracy / confirmed proficiency** — derived (OI-019 Area spec), not denormalized SSOT.
- Streak and session summaries — derived from `practice_sessions` + linked evaluations.

## Integrity and lifecycle

- JSON lessons/items are canonical; database rows are idempotent serving copies keyed by immutable IDs.
- Seed updates content/version/hash, never deletes an authored ID, and excludes `deprecated=true` items from new sessions.
- Applied SQL files are journaled transactionally with checksums; editing or removing an applied migration fails closed.
- Applied journal rows must be an exact name/checksum prefix of repository migrations; gaps and
  unknown names fail closed before DDL runs.
- Lesson ordinals are unique at transaction commit (deferred so valid swaps work), and a database trigger rejects moving an authored item ID between lessons.
- Immutable SQL files are the sole DDL authority; Drizzle schema declarations are typed query maps,
  not a `push`/generation source. The ordinal constraint is intentionally absent from Drizzle because
  it cannot express `DEFERRABLE INITIALLY DEFERRED` safely.
- One transaction-scoped advisory lock serializes journal planning plus every pending migration.
  Every run, including a zero-pending run, asserts the exact live ordinal constraint before commit.
- Write commands default to the dedicated Development database/role. Preview requires an explicit
  target; Production additionally requires an exact opt-in acknowledgement. Every runner verifies
  `current_database()` and `current_user` before taking its migration lock or seeding.
- User-owned tables cascade from user deletion. Authored item deletion is forbidden; historical evaluations remain addressable.
- Server resolves grading inputs from active versioned items; browser requests never supply expected answers.
- Retiring a set/target is non-destructive; historical sessions remain tied to the evaluated version.

## Closes
OI-020.
