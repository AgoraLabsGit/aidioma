import { describe, expect, it } from "vitest";

import { assertDatabaseIdentity, resolveDatabaseExpectation } from "./safety";

describe("database write target safety", () => {
  it("defaults operator scripts to the isolated Development database", () => {
    expect(resolveDatabaseExpectation({})).toEqual({
      target: "development",
      database: "aidioma_development",
      role: "aidioma_development_owner",
    });
  });

  it("allows Preview explicitly and rejects unknown targets", () => {
    expect(resolveDatabaseExpectation({ AIDIOMA_DB_TARGET: "preview" }).database).toBe(
      "aidioma_preview",
    );
    expect(() => resolveDatabaseExpectation({ AIDIOMA_DB_TARGET: "staging" })).toThrow(
      /Unknown AIDIOMA_DB_TARGET/,
    );
  });

  it("requires a separate explicit Production write acknowledgement", () => {
    expect(() => resolveDatabaseExpectation({ AIDIOMA_DB_TARGET: "production" })).toThrow(
      /Production database writes require/,
    );
    expect(
      resolveDatabaseExpectation({
        AIDIOMA_DB_TARGET: "production",
        AIDIOMA_ALLOW_PRODUCTION_WRITES: "AIDIOMA_PRODUCTION",
      }).database,
    ).toBe("neondb");
  });

  it("rejects the wrong database or role", () => {
    const expectation = resolveDatabaseExpectation({});
    expect(() =>
      assertDatabaseIdentity(
        [{ database: "neondb", role: "neondb_owner" }],
        expectation,
      ),
    ).toThrow(/Database target mismatch/);
    expect(() =>
      assertDatabaseIdentity(
        [{ database: "aidioma_development", role: "neondb_owner" }],
        expectation,
      ),
    ).toThrow(/Database target mismatch/);
  });
});
