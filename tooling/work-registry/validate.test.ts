import { describe, expect, it } from "vitest";

import { parseValidationOptions } from "./validate.js";

describe("registry validation CLI", () => {
  it("keeps migration readiness opt-in", () => {
    expect(parseValidationOptions([])).toEqual({ requireMigrationReady: false });
    expect(
      parseValidationOptions(["--require-migration-ready", "--docs-root", "Docs.next"]),
    ).toEqual({ docsRoot: "Docs.next", requireMigrationReady: true });
  });

  it("rejects unknown or incomplete options", () => {
    expect(() => parseValidationOptions(["--unknown"])).toThrowError(/Usage/u);
    expect(() => parseValidationOptions(["--docs-root"])).toThrowError(/requires a path/u);
  });
});
