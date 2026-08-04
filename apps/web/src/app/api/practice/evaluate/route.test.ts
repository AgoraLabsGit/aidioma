import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { practiceSetFixtures } from "@/lib/practice-sets/prototype-fixtures";

const { evaluateMock } = vi.hoisted(() => ({ evaluateMock: vi.fn() }));

vi.mock("@/lib/evaluation/evaluation-service", () => ({
  EvaluationService: class {
    evaluate = evaluateMock;
  },
}));

vi.mock("@/lib/evaluation/gateway-evaluator", () => ({
  GatewayAiVerdictGenerator: class {},
}));

import { POST } from "./route";

function requestForKnownPrompt() {
  return new Request("http://localhost/api/practice/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      itemRef: practiceSetFixtures[0].prompts[0].id,
      direction: "en-es",
      userInput: "Quiero sopa.",
    }),
  });
}

describe("POST /api/practice/evaluate", () => {
  beforeEach(() => {
    process.env.AIDIOMA_ENABLE_LOCAL_PRACTICE_EVALUATION = "true";
    evaluateMock.mockReset();
  });

  afterEach(() => {
    delete process.env.AIDIOMA_ENABLE_LOCAL_PRACTICE_EVALUATION;
  });

  it("returns actionable retry copy for a retryable ungraded outcome", async () => {
    evaluateMock.mockResolvedValueOnce({
      kind: "ungraded",
      retryable: true,
      failure: "provider",
    });

    const response = await POST(requestForKnownPrompt());

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      status: "ungraded",
      retryable: true,
      message: "I couldn’t grade that answer right now. Your response is still here—try again.",
    });
  });

  it("does not invite a futile retry for a non-retryable ungraded outcome", async () => {
    evaluateMock.mockResolvedValueOnce({
      kind: "ungraded",
      retryable: false,
      failure: "configuration",
    });

    const response = await POST(requestForKnownPrompt());

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      status: "ungraded",
      retryable: false,
      message:
        "Automatic grading isn’t available for this answer. Your response is still here, but retrying won’t help right now.",
    });
  });

  it("builds the full correction from reviewed answers instead of provider diff text", async () => {
    evaluateMock.mockResolvedValueOnce({
      kind: "graded",
      result: {
        score: 74,
        verdict: "close",
        feedback: "Adjust the highlighted words.",
        wordDiff: [
          { text: "provider text", mark: "wrong", suggestion: "do not display this" },
        ],
        errorTags: [],
        evalSource: "ai",
      },
    });

    const response = await POST(requestForKnownPrompt());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.correction.text).toBe(practiceSetFixtures[0].prompts[0].spanish);
    expect(body.correction.highlights.length).toBeGreaterThan(0);
    expect(JSON.stringify(body)).not.toContain("provider text");
    expect(JSON.stringify(body)).not.toContain("do not display this");
  });
});
