import { describe, expect, it } from "vitest";

import {
  assertDeferredLessonOrdinalConstraint,
  pendingMigrations,
  type Migration,
} from "./migrations";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

  it("rejects a journal gap that is not a repository prefix", () => {
    expect(() => pendingMigrations(migrations, [{ name: "0001_second.sql", checksum: "bbb" }])).toThrow(
      /ordered prefix/,
    );
  });
});

describe("lesson ordinal drift assertion", () => {
  const correct = {
    constraintType: "u",
    columns: ["ordinal"],
    isDeferrable: true,
    isInitiallyDeferred: true,
  };

  it("accepts the authoritative deferred unique constraint", () => {
    expect(() => assertDeferredLessonOrdinalConstraint([correct])).not.toThrow();
  });

  it.each([
    { ...correct, constraintType: "p" },
    { ...correct, columns: ["slug"] },
    { ...correct, isDeferrable: false },
    { ...correct, isInitiallyDeferred: false },
  ])("rejects a drifted constraint", (constraint) => {
    expect(() => assertDeferredLessonOrdinalConstraint([constraint])).toThrow(/Database drift/);
  });

  it("rejects a missing or duplicated constraint", () => {
    expect(() => assertDeferredLessonOrdinalConstraint([])).toThrow(/Database drift/);
    expect(() => assertDeferredLessonOrdinalConstraint([correct, correct])).toThrow(
      /Database drift/,
    );
  });
});

describe("Practice state migration", () => {
  it("makes answer evidence idempotent and keeps mastery undirected", () => {
    const sql = readFileSync(resolve(process.cwd(), "drizzle/0002_practice_state.sql"), "utf8");
    expect(sql).toContain('"practice_attempts_session_offer_unique"');
    expect(sql).toContain('"learner_item_states_identity_unique"');
    expect(sql).toContain('"saved_practice_items_identity_unique"');
    expect(sql).not.toMatch(/"direction"/i);
  });
});
