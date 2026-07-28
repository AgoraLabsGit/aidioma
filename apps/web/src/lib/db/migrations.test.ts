import { describe, expect, it } from "vitest";

import { pendingMigrations, type Migration } from "./migrations";

const migrations: Migration[] = [
  { name: "0000_first.sql", checksum: "aaa", statements: ["SELECT 1"] },
  { name: "0001_second.sql", checksum: "bbb", statements: ["SELECT 2"] },
];

describe("migration journal planning", () => {
  it("runs only pending immutable migrations", () => {
    expect(
      pendingMigrations(migrations, [{ name: "0000_first.sql", checksum: "aaa" }]),
    ).toEqual([migrations[1]]);
    expect(
      pendingMigrations(migrations, [
        { name: "0000_first.sql", checksum: "aaa" },
        { name: "0001_second.sql", checksum: "bbb" },
      ]),
    ).toEqual([]);
  });

  it("rejects an edited migration that has already run", () => {
    expect(() =>
      pendingMigrations(migrations, [{ name: "0000_first.sql", checksum: "changed" }]),
    ).toThrow(/modified: 0000_first\.sql/);
  });

  it("rejects removing an applied migration from the repository", () => {
    expect(() =>
      pendingMigrations(migrations.slice(1), [{ name: "0000_first.sql", checksum: "aaa" }]),
    ).toThrow(/missing from the repository: 0000_first\.sql/);
  });
});
