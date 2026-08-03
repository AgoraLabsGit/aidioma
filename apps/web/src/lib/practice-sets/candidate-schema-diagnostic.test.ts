import { TypeValidationError } from "ai";
import { describe, expect, it } from "vitest";

import {
  formatPracticeSchemaDiagnostic,
  summarizePracticeSchemaFailure,
} from "./candidate-schema-diagnostic";

describe("practice candidate schema diagnostics", () => {
  it("reports at most eight sanitized issue coordinates without values or messages", () => {
    const secret = "super-secret-provider-value";
    const issues = Array.from({ length: 10 }, (_, index) => ({
      code: index === 1 ? "INVALID CODE WITH SECRET" : "invalid_type",
      path: index === 2
        ? ["candidates", index, "untrusted-secret-key", secret]
        : ["candidates", index, "prompt", "answers", "spanish", "target"],
      message: `full validation message ${secret}`,
      received: secret,
    }));
    const validationError = new TypeValidationError({
      value: { apiKey: secret, generatedText: secret },
      cause: { issues },
    });

    const diagnostic = summarizePracticeSchemaFailure({
      finishReason: "length",
      cause: validationError,
    });
    const formatted = formatPracticeSchemaDiagnostic(diagnostic);

    expect(diagnostic.finishReason).toBe("length");
    expect(diagnostic.issues).toHaveLength(8);
    expect(diagnostic.issues[0]).toEqual({
      path: "candidates.0.prompt.answers.spanish.target",
      code: "invalid_type",
    });
    expect(diagnostic.issues[1].code).toBe("unknown");
    expect(diagnostic.issues[2].path).toBe("candidates.2.?.?");
    expect(formatted).not.toContain(secret);
    expect(formatted).not.toContain("full validation message");
    expect(formatted).not.toContain("apiKey");
    expect(formatted).not.toContain("generatedText");
  });

  it("omits unrecognized finish reasons and non-validation causes", () => {
    const diagnostic = summarizePracticeSchemaFailure({
      finishReason: "provider-raw-secret",
      cause: new Error("provider body must stay private"),
    });
    expect(diagnostic).toEqual({ issues: [] });
    expect(formatPracticeSchemaDiagnostic(diagnostic)).toBe("");
  });
});
