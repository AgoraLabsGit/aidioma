import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { lessons } from "./schema";

describe("lessons schema declaration", () => {
  it("leaves deferred ordinal uniqueness to authoritative SQL migrations", () => {
    const indexNames = getTableConfig(lessons).indexes.map((index) => index.config.name);

    expect(indexNames).toContain("lessons_slug_unique");
    expect(indexNames).not.toContain("lessons_ordinal_unique");
  });
});
