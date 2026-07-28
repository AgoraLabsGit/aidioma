import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { isClerkConfigured, shouldUseClerk } from "./config";

describe("isClerkConfigured", () => {
  it("requires both Clerk keys", () => {
    expect(isClerkConfigured({})).toBe(false);
    expect(
      isClerkConfigured({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_only" }),
    ).toBe(false);
    expect(isClerkConfigured({ CLERK_SECRET_KEY: "sk_test_only" })).toBe(false);
  });

  it("accepts a complete non-empty configuration", () => {
    expect(
      isClerkConfigured({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_example",
        CLERK_SECRET_KEY: "sk_test_example",
      }),
    ).toBe(true);
  });

  it("rejects whitespace-only values", () => {
    expect(
      isClerkConfigured({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: " ",
        CLERK_SECRET_KEY: "\t",
      }),
    ).toBe(false);
  });

  it("allows Clerk keyless mode only in development", () => {
    expect(shouldUseClerk({}, "development")).toBe(true);
    expect(shouldUseClerk({}, "production")).toBe(false);
    expect(shouldUseClerk({}, "test")).toBe(false);
  });

  it("does not enter keyless mode with a partial configuration", () => {
    expect(
      shouldUseClerk(
        { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_only" },
        "development",
      ),
    ).toBe(false);
  });

  it("keeps the Next.js 16 proxy beside the src app directory", () => {
    const sourceProxy = path.resolve(process.cwd(), "src/proxy.ts");
    const misplacedRootProxy = path.resolve(process.cwd(), "proxy.ts");

    expect(existsSync(sourceProxy)).toBe(true);
    expect(existsSync(misplacedRootProxy)).toBe(false);
  });
});
