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

export const lessons = pgTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    ordinal: integer("ordinal").notNull(),
    level: text("level").notNull(),
    title: text("title").notNull(),
    objective: text("objective").notNull(),
    grammarFocus: jsonb("grammar_focus").$type<readonly string[]>().notNull(),
    contentVersion: integer("content_version").notNull(),
    contentHash: text("content_hash").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("lessons_slug_unique").on(table.slug),
    uniqueIndex("lessons_ordinal_unique").on(table.ordinal),
  ],
);

export const lessonItems = pgTable(
  "lesson_items",
  {
    id: text("id").primaryKey(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "restrict" }),
    kind: text("kind").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    grammarTags: jsonb("grammar_tags").$type<readonly string[]>().notNull(),
    difficulty: integer("difficulty"),
    contentVersion: integer("content_version").notNull(),
    deprecated: boolean("deprecated").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("lesson_items_lesson_id_idx").on(table.lessonId)],
);
