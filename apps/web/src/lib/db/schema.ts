import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { GrammarTag, ItemKind } from "@aidioma/lesson-schema";
import type { LessonCheckpoint } from "@/lib/learning-journey/lesson-session";

export const lessons = pgTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    ordinal: integer("ordinal").notNull(),
    level: text("level").notNull(),
    title: text("title").notNull(),
    objective: text("objective").notNull(),
    grammarFocus: jsonb("grammar_focus").$type<GrammarTag[]>().notNull(),
    contentVersion: integer("content_version").notNull(),
    contentHash: text("content_hash").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("lessons_slug_unique").on(table.slug)],
);

// SQL migrations are authoritative for lessons_ordinal_unique. Drizzle cannot model its
// DEFERRABLE INITIALLY DEFERRED semantics, so declaring it here would create unsafe drift.

export const lessonItems = pgTable(
  "lesson_items",
  {
    id: text("id").primaryKey(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "restrict" }),
    kind: text("kind").$type<ItemKind>().notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    grammarTags: jsonb("grammar_tags").$type<GrammarTag[]>().notNull(),
    difficulty: integer("difficulty"),
    contentVersion: integer("content_version").notNull(),
    deprecated: boolean("deprecated").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("lesson_items_lesson_id_idx").on(table.lessonId)],
);

export type PracticeSessionStatus = "active" | "paused" | "ended";

export const practiceSessions = pgTable(
  "practice_sessions",
  {
    id: text("id").primaryKey(),
    learnerId: text("learner_id").notNull(),
    sourceKind: text("source_kind").$type<"collection" | "lesson" | "saved">().notNull(),
    sourceId: text("source_id").notNull(),
    sourceVersion: text("source_version").notNull(),
    profile: text("profile").$type<"es-AR" | "es-419" | "es-ES">().notNull(),
    policyVersion: text("policy_version").notNull(),
    status: text("status").$type<PracticeSessionStatus>().notNull(),
    revision: integer("revision").notNull().default(1),
    checkpoint: jsonb("checkpoint").$type<Record<string, unknown>>().notNull(),
    pausedAt: timestamp("paused_at", { withTimezone: true }),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("practice_sessions_learner_status_idx").on(table.learnerId, table.status),
  ],
);

export const practiceAttempts = pgTable(
  "practice_attempts",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => practiceSessions.id, { onDelete: "restrict" }),
    learnerId: text("learner_id").notNull(),
    offerOrdinal: integer("offer_ordinal").notNull(),
    itemId: text("item_id").notNull(),
    contentVersion: integer("content_version").notNull(),
    conceptIds: jsonb("concept_ids").$type<string[]>().notNull(),
    activity: text("activity").$type<"typed-production">().notNull(),
    answer: text("answer").notNull(),
    verdict: text("verdict").$type<"correct" | "close" | "wrong">().notNull(),
    score: integer("score").notNull(),
    feedback: text("feedback").notNull(),
    evalSource: text("eval_source").$type<"comparison" | "ai">().notNull(),
    modelUsed: text("model_used"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("practice_attempts_session_offer_unique").on(
      table.sessionId,
      table.offerOrdinal,
    ),
    index("practice_attempts_learner_item_idx").on(table.learnerId, table.itemId),
  ],
);

export const learnerItemStates = pgTable(
  "learner_item_states",
  {
    learnerId: text("learner_id").notNull(),
    itemId: text("item_id").notNull(),
    confidence: integer("confidence").notNull().default(0),
    unresolvedMisses: integer("unresolved_misses").notNull().default(0),
    seenCount: integer("seen_count").notNull().default(0),
    dueAt: timestamp("due_at", { withTimezone: true }),
    lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("learner_item_states_identity_unique").on(table.learnerId, table.itemId),
    index("learner_item_states_due_idx").on(table.learnerId, table.dueAt),
  ],
);

export const savedPracticeItems = pgTable(
  "saved_practice_items",
  {
    learnerId: text("learner_id").notNull(),
    itemId: text("item_id").notNull(),
    contentVersion: integer("content_version").notNull(),
    meaningId: text("meaning_id").notNull(),
    sourceKind: text("source_kind").$type<"collection" | "lesson" | "saved">().notNull(),
    sourceId: text("source_id").notNull(),
    savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("saved_practice_items_identity_unique").on(table.learnerId, table.itemId),
  ],
);

export type LessonProgressStatus = "active" | "completed";

export const learnerLessonProgress = pgTable(
  "learner_lesson_progress",
  {
    learnerId: text("learner_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    profile: text("profile").$type<"es-AR" | "es-419" | "es-ES">().notNull(),
    status: text("status").$type<LessonProgressStatus>().notNull(),
    revision: integer("revision").notNull().default(1),
    checkpoint: jsonb("checkpoint").$type<LessonCheckpoint>().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("learner_lesson_progress_identity_unique").on(
      table.learnerId,
      table.lessonId,
    ),
    index("learner_lesson_progress_learner_status_idx").on(
      table.learnerId,
      table.status,
    ),
  ],
);
