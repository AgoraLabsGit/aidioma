export type DatabaseTarget = "development" | "preview" | "production";

export interface DatabaseExpectation {
  target: DatabaseTarget;
  database: string;
  role: string;
}

export interface DatabaseIdentityRow {
  database: string;
  role: string;
}

const expectations: Record<DatabaseTarget, Omit<DatabaseExpectation, "target">> = {
  development: {
    database: "aidioma_development",
    role: "aidioma_development_owner",
  },
  preview: {
    database: "aidioma_preview",
    role: "aidioma_preview_owner",
  },
  production: {
    database: "neondb",
    role: "neondb_owner",
  },
};

export function resolveDatabaseExpectation(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): DatabaseExpectation {
  const target = (environment.AIDIOMA_DB_TARGET?.trim() || "development") as DatabaseTarget;
  if (!Object.hasOwn(expectations, target)) {
    throw new Error(`Unknown AIDIOMA_DB_TARGET: ${target}`);
  }
  if (
    target === "production" &&
    environment.AIDIOMA_ALLOW_PRODUCTION_WRITES !== "AIDIOMA_PRODUCTION"
  ) {
    throw new Error(
      "Production database writes require AIDIOMA_ALLOW_PRODUCTION_WRITES=AIDIOMA_PRODUCTION.",
    );
  }
  return { target, ...expectations[target] };
}

export function assertDatabaseIdentity(
  rows: readonly DatabaseIdentityRow[],
  expectation: DatabaseExpectation,
): void {
  const identity = rows[0];
  if (
    rows.length !== 1 ||
    identity.database !== expectation.database ||
    identity.role !== expectation.role
  ) {
    throw new Error(
      `Database target mismatch: ${expectation.target} requires ${expectation.database} as ${expectation.role}.`,
    );
  }
}
