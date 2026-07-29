import { neon } from "@neondatabase/serverless";

import { loadSeedLessons } from "../src/lib/content/seed";
import { runContentSeed } from "../src/lib/content/seed-runner";
import { resolveDatabaseExpectation, type DatabaseIdentityRow } from "../src/lib/db/safety";

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed canonical lesson content.");
  }

  const lessons = await loadSeedLessons();
  if (lessons.length === 0) {
    throw new Error("No canonical lessons were found; refusing to seed an empty corpus.");
  }

  const sql = neon(connectionString);
  const expectation = resolveDatabaseExpectation();
  const changedRowCount = await runContentSeed(
    {
      identity: async () =>
        (await sql`
          SELECT current_database() AS database, current_user AS role
        `) as DatabaseIdentityRow[],
      upsert: async (seedLessons) =>
        sql.transaction((transaction) =>
          seedLessons.flatMap((lesson) => [
            transaction`
        INSERT INTO lessons (
          id, slug, ordinal, level, title, objective, grammar_focus,
          content_version, content_hash, is_active
        ) VALUES (
          ${lesson.id}, ${lesson.slug}, ${lesson.ordinal}, ${lesson.level},
          ${lesson.title}, ${lesson.objective}, ${JSON.stringify(lesson.grammarFocus)}::jsonb,
          ${lesson.contentVersion}, ${lesson.contentHash}, ${lesson.isActive}
        )
        ON CONFLICT (slug) DO UPDATE SET
          ordinal = EXCLUDED.ordinal,
          level = EXCLUDED.level,
          title = EXCLUDED.title,
          objective = EXCLUDED.objective,
          grammar_focus = EXCLUDED.grammar_focus,
          content_version = EXCLUDED.content_version,
          content_hash = EXCLUDED.content_hash,
          is_active = EXCLUDED.is_active,
          updated_at = now()
        WHERE lessons.ordinal IS DISTINCT FROM EXCLUDED.ordinal
           OR lessons.level IS DISTINCT FROM EXCLUDED.level
           OR lessons.title IS DISTINCT FROM EXCLUDED.title
           OR lessons.objective IS DISTINCT FROM EXCLUDED.objective
           OR lessons.grammar_focus IS DISTINCT FROM EXCLUDED.grammar_focus
           OR lessons.content_version IS DISTINCT FROM EXCLUDED.content_version
           OR lessons.content_hash IS DISTINCT FROM EXCLUDED.content_hash
           OR lessons.is_active IS DISTINCT FROM EXCLUDED.is_active
        RETURNING id
      `,
            ...lesson.items.map(
              (item) => transaction`
          INSERT INTO lesson_items (
            id, lesson_id, kind, payload, grammar_tags, difficulty,
            content_version, deprecated
          ) VALUES (
            ${item.id}, ${item.lessonId}, ${item.kind}, ${JSON.stringify(item.payload)}::jsonb,
            ${JSON.stringify(item.grammarTags)}::jsonb, ${item.difficulty},
            ${item.contentVersion}, ${item.deprecated}
          )
          ON CONFLICT (id) DO UPDATE SET
            lesson_id = EXCLUDED.lesson_id,
            kind = EXCLUDED.kind,
            payload = EXCLUDED.payload,
            grammar_tags = EXCLUDED.grammar_tags,
            difficulty = EXCLUDED.difficulty,
            content_version = EXCLUDED.content_version,
            deprecated = lesson_items.deprecated OR EXCLUDED.deprecated,
            updated_at = now()
          WHERE lesson_items.lesson_id IS DISTINCT FROM EXCLUDED.lesson_id
             OR lesson_items.kind IS DISTINCT FROM EXCLUDED.kind
             OR lesson_items.payload IS DISTINCT FROM EXCLUDED.payload
             OR lesson_items.grammar_tags IS DISTINCT FROM EXCLUDED.grammar_tags
             OR lesson_items.difficulty IS DISTINCT FROM EXCLUDED.difficulty
             OR lesson_items.content_version IS DISTINCT FROM EXCLUDED.content_version
             OR lesson_items.deprecated IS DISTINCT FROM (lesson_items.deprecated OR EXCLUDED.deprecated)
          RETURNING id
        `,
            ),
          ]),
        ),
    },
    lessons,
    expectation,
  );

  const authoredItemCount = lessons.reduce((count, lesson) => count + lesson.items.length, 0);
  console.log(
    `[content:seed] Seeded ${lessons.length} lessons and ${authoredItemCount} items; ${changedRowCount} rows changed.`,
  );
}

void main();
