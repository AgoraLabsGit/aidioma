import { describe, expect, it } from "vitest";

import {
  MIGRATION_LOCK_KEYS,
  runMigrations,
  type MigrationClient,
} from "./migration-runner";
import type { Migration } from "./migrations";

const migrations: Migration[] = [
  { name: "0000_first.sql", checksum: "aaa", statements: ["CREATE TABLE first_table ()"] },
  { name: "0001_second.sql", checksum: "bbb", statements: ["ALTER TABLE first_table ADD x int"] },
];

class FakeClient implements MigrationClient {
  readonly calls: Array<{ text: string; values?: unknown[] }> = [];
  ended = false;

  constructor(
    private readonly applied: Array<{ name: string; checksum: string }> = [],
    private readonly failOn?: string,
  ) {}

  async connect(): Promise<void> {
    this.calls.push({ text: "CONNECT" });
  }

  async query(text: string, values?: unknown[]): Promise<{ rows: unknown[] }> {
    const normalized = text.trim().replace(/\s+/g, " ");
    this.calls.push({ text: normalized, values });
    if (this.failOn && normalized.includes(this.failOn)) {
      throw new Error("injected failure");
    }
    if (normalized.startsWith("SELECT name, checksum")) {
      return { rows: this.applied };
    }
    if (normalized.includes("FROM pg_constraint")) {
      return {
        rows: [
          {
            constraintType: "u",
            columns: ["ordinal"],
            isDeferrable: true,
            isInitiallyDeferred: true,
          },
        ],
      };
    }
    return { rows: [] };
  }

  async end(): Promise<void> {
    this.ended = true;
    this.calls.push({ text: "END" });
  }
}

describe("serialized migration runner", () => {
  it("locks before journal planning and commits migrations plus drift assertion together", async () => {
    const client = new FakeClient();
    const result = await runMigrations(client, migrations);
    const texts = client.calls.map((call) => call.text);

    expect(texts.indexOf("SELECT pg_advisory_xact_lock($1, $2)")).toBeLessThan(
      texts.findIndex((text) => text.startsWith("SELECT name, checksum")),
    );
    expect(client.calls.find((call) => call.text.includes("pg_advisory_xact_lock"))?.values).toEqual(
      [...MIGRATION_LOCK_KEYS],
    );
    expect(texts.indexOf("CREATE TABLE first_table ()")).toBeLessThan(
      texts.findIndex((text) => text.includes("FROM pg_constraint")),
    );
    expect(texts.findIndex((text) => text.includes("FROM pg_constraint"))).toBeLessThan(
      texts.indexOf("COMMIT"),
    );
    expect(result).toEqual({ current: 0, applied: migrations });
    expect(client.ended).toBe(true);
  });

  it("checks drift even when all migrations are current", async () => {
    const client = new FakeClient([
      { name: "0000_first.sql", checksum: "aaa" },
      { name: "0001_second.sql", checksum: "bbb" },
    ]);
    const result = await runMigrations(client, migrations);
    const texts = client.calls.map((call) => call.text);

    expect(texts.some((text) => text.includes("FROM pg_constraint"))).toBe(true);
    expect(result).toEqual({ current: 2, applied: [] });
  });

  it("rolls back and closes the client after a failure", async () => {
    const client = new FakeClient([], "ALTER TABLE first_table");

    await expect(runMigrations(client, migrations)).rejects.toThrow("injected failure");
    expect(client.calls.map((call) => call.text)).toContain("ROLLBACK");
    expect(client.calls.map((call) => call.text)).not.toContain("COMMIT");
    expect(client.ended).toBe(true);
  });
});
