import { neon } from "@neondatabase/serverless";

import {
  loadMigrations,
  pendingMigrations,
  type AppliedMigration,
} from "../src/lib/db/migrations";

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to migrate the content database.");
  }

  const sql = neon(connectionString);
  const migrationsDirectoryUrl = new URL("../drizzle/", import.meta.url);
  const migrations = await loadMigrations(migrationsDirectoryUrl);

  await sql`
    CREATE TABLE IF NOT EXISTS aidioma_migrations (
      name text PRIMARY KEY NOT NULL,
      checksum text NOT NULL,
      applied_at timestamp with time zone DEFAULT now() NOT NULL
    )
  `;
  const applied = (await sql`
    SELECT name, checksum
    FROM aidioma_migrations
    ORDER BY name
  `) as AppliedMigration[];
  const pending = pendingMigrations(migrations, applied);

  for (const migration of pending) {
    await sql.transaction((transaction) =>
      [
        ...migration.statements.map((statement) => transaction.query(statement)),
        transaction`
          INSERT INTO aidioma_migrations (name, checksum)
          VALUES (${migration.name}, ${migration.checksum})
        `,
      ],
    );

    console.log(
      `[db:migrate] Applied ${migration.name} (${migration.statements.length} statements).`,
    );
  }

  console.log(
    `[db:migrate] ${migrations.length - pending.length} current; ${pending.length} applied.`,
  );
}

void main();
