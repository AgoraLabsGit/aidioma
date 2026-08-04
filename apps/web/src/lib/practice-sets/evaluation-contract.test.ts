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

  it("requires one complete reviewed correction for close and wrong answers", () => {
    const response = {
      status: "graded",
      score: 74,
      verdict: "close",
      feedback: "Adjust the highlighted words.",
      errorTags: [],
      evalSource: "comparison",
      correction: {
        text: "Yo soy de Colombia.",
        highlights: [
          { start: 3, end: 6, kind: "spelling" },
          { start: 7, end: 9, kind: "different" },
        ],
      },
    };

    expect(PracticeEvaluationResponseSchema.safeParse(response).success).toBe(true);
    expect(
      PracticeEvaluationResponseSchema.safeParse({
        ...response,
        correction: undefined,
      }).success,
    ).toBe(false);
  });

  it("rejects overlapping or out-of-bounds correction highlights", () => {
    const response = {
      status: "graded",
      score: 35,
      verdict: "wrong",
      feedback: "Use the reviewed sentence.",
      errorTags: [],
      evalSource: "ai",
      correction: {
        text: "Correct answer.",
        highlights: [
          { start: 0, end: 7, kind: "different" },
          { start: 6, end: 40, kind: "spelling" },
        ],
      },
    };

    expect(PracticeEvaluationResponseSchema.safeParse(response).success).toBe(false);
  });
});
