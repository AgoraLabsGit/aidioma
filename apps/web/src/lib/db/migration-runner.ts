import {
  assertDeferredLessonOrdinalConstraint,
  pendingMigrations,
  type AppliedMigration,
  type LessonOrdinalConstraintRow,
  type Migration,
} from "./migrations";
import {
  assertDatabaseIdentity,
  type DatabaseExpectation,
  type DatabaseIdentityRow,
} from "./safety";

// Stable two-int namespace: ASCII "AIDI" + "MIGR".
export const MIGRATION_LOCK_KEYS = [0x41494449, 0x4d494752] as const;

interface QueryResult {
  rows: unknown[];
}

export interface MigrationClient {
  connect(): Promise<void>;
  query(text: string, values?: unknown[]): Promise<QueryResult>;
  end(): Promise<void>;
}

export interface MigrationRunResult {
  current: number;
  applied: Migration[];
}

const journalSql = `
  CREATE TABLE IF NOT EXISTS aidioma_migrations (
    name text PRIMARY KEY NOT NULL,
    checksum text NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
  )
`;

const ordinalConstraintSql = `
  SELECT
    constraint_row.contype AS "constraintType",
    json_agg(attribute.attname ORDER BY key_column.ordinality) AS columns,
    constraint_row.condeferrable AS "isDeferrable",
    constraint_row.condeferred AS "isInitiallyDeferred"
  FROM pg_constraint AS constraint_row
  JOIN LATERAL unnest(constraint_row.conkey) WITH ORDINALITY
    AS key_column(attnum, ordinality) ON true
  JOIN pg_attribute AS attribute
    ON attribute.attrelid = constraint_row.conrelid
    AND attribute.attnum = key_column.attnum
  WHERE constraint_row.conname = 'lessons_ordinal_unique'
    AND constraint_row.conrelid = 'public.lessons'::regclass
  GROUP BY
    constraint_row.contype,
    constraint_row.condeferrable,
    constraint_row.condeferred
`;

export async function runMigrations(
  client: MigrationClient,
  migrations: readonly Migration[],
  expectation: DatabaseExpectation,
): Promise<MigrationRunResult> {
  let transactionStarted = false;
  let hasFailure = false;
  let failure: unknown;
  let result: MigrationRunResult | undefined;

  try {
    await client.connect();
    await client.query("BEGIN");
    transactionStarted = true;
    const identityResult = await client.query(`
      SELECT current_database() AS database, current_user AS role
    `);
    assertDatabaseIdentity(identityResult.rows as DatabaseIdentityRow[], expectation);
    await client.query("SET LOCAL lock_timeout = '30s'");
    await client.query("SELECT pg_advisory_xact_lock($1, $2)", [...MIGRATION_LOCK_KEYS]);
    await client.query(journalSql);

    const appliedResult = await client.query(`
      SELECT name, checksum
      FROM aidioma_migrations
      ORDER BY name
    `);
    const pending = pendingMigrations(migrations, appliedResult.rows as AppliedMigration[]);

    for (const migration of pending) {
      for (const statement of migration.statements) {
        await client.query(statement);
      }
      await client.query(
        `INSERT INTO aidioma_migrations (name, checksum) VALUES ($1, $2)`,
        [migration.name, migration.checksum],
      );
    }

    const constraintResult = await client.query(ordinalConstraintSql);
    assertDeferredLessonOrdinalConstraint(
      constraintResult.rows as LessonOrdinalConstraintRow[],
    );
    await client.query("COMMIT");
    transactionStarted = false;

    result = { current: migrations.length - pending.length, applied: pending };
  } catch (error) {
    hasFailure = true;
    failure = error;
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve the migration/identity failure; the transaction cleanup error is secondary.
      }
    }
  } finally {
    try {
      await client.end();
    } catch (error) {
      if (!hasFailure) {
        hasFailure = true;
        failure = error;
      }
    }
  }

  if (hasFailure) {
    throw failure;
  }
  return result!;
}
