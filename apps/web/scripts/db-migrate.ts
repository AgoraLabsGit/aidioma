import { Client } from "@neondatabase/serverless";

import { runMigrations } from "../src/lib/db/migration-runner";
import { loadMigrations } from "../src/lib/db/migrations";

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to migrate the content database.");
  }

  const migrationsDirectoryUrl = new URL("../drizzle/", import.meta.url);
  const migrations = await loadMigrations(migrationsDirectoryUrl);
  const result = await runMigrations(new Client(connectionString), migrations);

  for (const migration of result.applied) {
    console.log(
      `[db:migrate] Applied ${migration.name} (${migration.statements.length} statements).`,
    );
  }

  console.log(
    `[db:migrate] ${result.current} current; ${result.applied.length} applied; drift assertion passed.`,
  );
}

void main();
