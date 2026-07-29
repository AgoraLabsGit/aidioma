import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { EvaluationService, type EvaluationLogEvent } from "./evaluation-service";
import type { AiVerdictGenerator } from "./gateway-evaluator";
import type { EvaluationRequest } from "./contracts";
import type { ResolvedLessonSource } from "./source-resolver";

const source: ResolvedLessonSource = {
  sourceType: "lesson",
  itemRef: "a1-01.s.01",
  lessonId: "a1-01-hola-me-llamo",
  sourceText: "My name is Ana.",
  item: {
    id: "a1-01.s.01",
    kind: "sentence",
    es: "Me llamo Ana.",
    en: "My name is Ana.",
    acceptedEs: ["Mi nombre es Ana."],
    acceptedEn: [],
    grammarTags: ["verb.ser"],
    vocabRefs: [],
    difficulty: 1,
    hints: ["hint one", "hint two", "hint three"],
    deprecated: false,
  },
  authoritativeAnswers: ["Me llamo Ana.", "Mi nombre es Ana."],
  grammarTags: ["verb.ser"],
  contentVersion: 1,
};

const request: EvaluationRequest = {
  sourceType: "lesson",
  itemRef: source.itemRef,
  modality: "translate",
  direction: "en-es",
  userInput: "Me llamo Ana.",
};

function aiGenerator(
  evaluate: AiVerdictGenerator["evaluate"],
): AiVerdictGenerator {
  return { evaluate: vi.fn(evaluate) };
}

describe("EvaluationService", () => {
  it("returns exact and near deterministic results without calling AI", async () => {
    const ai = aiGenerator(async () => {
      throw new Error("AI must not run");
    });
    const service = new EvaluationService(ai, { logger: () => undefined });

    const exact = await service.evaluate({ requestId: "req_exact", request, source });
    const near = await service.evaluate({
      requestId: "req_near",
      request: { ...request, userInput: "Me llamo Ana" },
      source,
    });

    expect(exact).toMatchObject({
      kind: "graded",
      result: { score: 100, verdict: "correct", evalSource: "comparison" },
    });
    expect(near).toMatchObject({ kind: "graded", result: { evalSource: "comparison" } });
    expect(ai.evaluate).not.toHaveBeenCalled();
  });

  it("makes exactly one AI call for a poor match and returns a validated result", async () => {
    const ai = aiGenerator(async () => ({
      kind: "graded",
      result: {
        score: 90,
        verdict: "correct",
        feedback: "That is a natural equivalent.",
        errorTags: [],
      },
      metadata: {
        provider: "gateway",
        requestedModel: "openai/gpt-5-mini",
        responseModel: "openai/gpt-5-mini-2025-08-07",
        latencyMs: 21,
        usage: { inputTokens: 20, outputTokens: 10, totalTokens: 30 },
      },
    }));
    const service = new EvaluationService(ai, { logger: () => undefined });

    const outcome = await service.evaluate({
      requestId: "req_ai",
      request: { ...request, userInput: "Soy Ana." },
      source,
      userTrackingId: "opaque_learner",
    });

    expect(ai.evaluate).toHaveBeenCalledTimes(1);
    expect(ai.evaluate).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceText: "My name is Ana.",
        acceptedAnswers: source.authoritativeAnswers,
        grammarTags: source.grammarTags,
        userTrackingId: "opaque_learner",
      }),
    );
    expect(outcome).toEqual({
      kind: "graded",
      result: {
        score: 90,
        verdict: "correct",
        feedback: "That is a natural equivalent.",
        errorTags: [],
        evalSource: "ai",
        modelUsed: "openai/gpt-5-mini-2025-08-07",
      },
    });
  });

  it("preserves provider failure as retryable ungraded with no fabricated verdict", async () => {
    const ai = aiGenerator(async () => ({
      kind: "ungraded",
      retryable: true,
      failure: "timeout",
      metadata: {
        provider: "gateway",
        requestedModel: "openai/gpt-5-mini",
        latencyMs: 8_000,
      },
    }));
    const service = new EvaluationService(ai, { logger: () => undefined });

    const outcome = await service.evaluate({
      requestId: "req_timeout",
      request: { ...request, userInput: "unrelated response" },
      source,
    });

    expect(outcome).toEqual({
      kind: "ungraded",
      retryable: true,
      failure: "timeout",
    });
    expect(outcome).not.toHaveProperty("result");
  });

  it("logs metadata without learner input or authored answers", async () => {
    const events: EvaluationLogEvent[] = [];
    const ai = aiGenerator(async () => ({
      kind: "ungraded",
      retryable: true,
      failure: "provider",
      metadata: {
        provider: "gateway",
        requestedModel: "openai/gpt-5-mini",
        generationId: "gen_safe",
        latencyMs: 5,
        usage: { totalTokens: 42 },
      },
    }));
    let now = 100;
    const service = new EvaluationService(ai, {
      logger: (event) => events.push(event),
      now: () => (now += 10),
    });

    await service.evaluate({
      requestId: "req_log",
      request: { ...request, userInput: "PRIVATE LEARNER TEXT" },
      source,
    });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      requestId: "req_log",
      path: "ai",
      outcome: "ungraded",
      failure: "provider",
      model: "openai/gpt-5-mini",
      provider: "gateway",
      generationId: "gen_safe",
      usage: { totalTokens: 42 },
    });
    const serialized = JSON.stringify(events);
    expect(serialized).not.toContain("PRIVATE LEARNER TEXT");
    expect(serialized).not.toContain("Me llamo Ana");
    expect(serialized).not.toContain("Mi nombre es Ana");
  });
});
