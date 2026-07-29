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

export interface LessonOrdinalConstraintRow {
  constraintType: string;
  columns: string[];
  isDeferrable: boolean;
  isInitiallyDeferred: boolean;
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

  for (const [index, recorded] of applied.entries()) {
    if (!available.has(recorded.name)) {
      throw new Error(`Applied migration is missing from the repository: ${recorded.name}`);
    }
    const expected = migrations[index];
    if (!expected || expected.name !== recorded.name) {
      throw new Error(
        `Applied migrations must be an ordered prefix; expected ${expected?.name ?? "no additional migration"} at position ${index + 1}, found ${recorded.name}.`,
      );
    }
    if (expected.checksum !== recorded.checksum) {
      throw new Error(`Applied migration was modified: ${recorded.name}`);
    }
  }

  return migrations.slice(applied.length);
}

export function assertDeferredLessonOrdinalConstraint(
  rows: readonly LessonOrdinalConstraintRow[],
): void {
  const constraint = rows[0];
  if (
    rows.length !== 1 ||
    constraint.constraintType !== "u" ||
    constraint.columns.length !== 1 ||
    constraint.columns[0] !== "ordinal" ||
    !constraint.isDeferrable ||
    !constraint.isInitiallyDeferred
  ) {
    throw new Error(
      "Database drift: lessons_ordinal_unique must be UNIQUE (ordinal) DEFERRABLE INITIALLY DEFERRED.",
    );
  }
}
