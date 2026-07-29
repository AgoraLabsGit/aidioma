import { describe, expect, it, vi } from "vitest";

import type { SeedLesson } from "./seed";
import { runContentSeed, type ContentSeedClient } from "./seed-runner";

const expectation = {
  target: "development" as const,
  database: "aidioma_development",
  role: "aidioma_development_owner",
};

function client(
  identity = { database: expectation.database, role: expectation.role },
): ContentSeedClient & { upsert: ReturnType<typeof vi.fn> } {
  return {
    identity: vi.fn().mockResolvedValue([identity]),
    upsert: vi.fn().mockResolvedValue([[{ id: "lesson" }], [{ id: "item" }]]),
  };
}

describe("content seed target guard", () => {
  it("checks the database identity before upserting", async () => {
    const database = client();
    await expect(runContentSeed(database, [{} as SeedLesson], expectation)).resolves.toBe(2);
    expect(database.upsert).toHaveBeenCalledOnce();
  });

  it("does not start an upsert when the database identity is wrong", async () => {
    const database = client({ database: "neondb", role: "neondb_owner" });
    await expect(runContentSeed(database, [{} as SeedLesson], expectation)).rejects.toThrow(
      /Database target mismatch/,
    );
    expect(database.upsert).not.toHaveBeenCalled();
  });
});
