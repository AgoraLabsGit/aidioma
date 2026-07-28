import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export interface Migration {
  name: string;
  checksum: string;
  statements: string[];
}

export interface AppliedMigration {
  name: string;
  checksum: string;
}

export async function loadMigrations(directoryUrl: URL): Promise<Migration[]> {
  const directory = fileURLToPath(directoryUrl);
  const names = (await readdir(directory))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  return Promise.all(
    names.map(async (name) => {
      const source = await readFile(new URL(name, directoryUrl), "utf8");
      return {
        name,
        checksum: createHash("sha256").update(source).digest("hex"),
        statements: source
          .split("--> statement-breakpoint")
          .map((statement) => statement.trim())
          .filter(Boolean),
      };
    }),
  );
}

export function pendingMigrations(
  migrations: readonly Migration[],
  applied: readonly AppliedMigration[],
): Migration[] {
  if (migrations.length === 0) {
    throw new Error("No database migrations were found.");
  }

  const available = new Map(migrations.map((migration) => [migration.name, migration]));
  const completed = new Map(applied.map((migration) => [migration.name, migration.checksum]));

  for (const migration of applied) {
    const current = available.get(migration.name);
    if (!current) {
      throw new Error(`Applied migration is missing from the repository: ${migration.name}`);
    }
    if (current.checksum !== migration.checksum) {
      throw new Error(`Applied migration was modified: ${migration.name}`);
    }
  }

  return migrations.filter((migration) => !completed.has(migration.name));
}
