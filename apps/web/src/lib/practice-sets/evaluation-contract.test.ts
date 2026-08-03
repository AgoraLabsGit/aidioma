import { describe, expect, it } from "vitest";

import { PracticeEvaluationResponseSchema } from "./evaluation-contract";

describe("PracticeEvaluationResponseSchema", () => {
  it.each([true, false])("preserves retryability for an ungraded response (%s)", (retryable) => {
    expect(
      PracticeEvaluationResponseSchema.parse({
        status: "ungraded",
        retryable,
        message: "The answer was not graded.",
      }),
    ).toEqual({
      status: "ungraded",
      retryable,
      message: "The answer was not graded.",
    });
  });

  it("rejects a malformed response instead of fabricating a grading outcome", () => {
    expect(
      PracticeEvaluationResponseSchema.safeParse({
        status: "graded",
        verdict: "wrong",
      }).success,
    ).toBe(false);
  });
});
