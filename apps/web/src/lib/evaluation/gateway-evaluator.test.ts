import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  AI_EVALUATION_MAX_OUTPUT_TOKENS,
  AI_EVALUATION_FEEDBACK_MAX_WORDS,
  AI_EVALUATION_TIMEOUT_MS,
  DEFAULT_AI_EVALUATION_MODEL,
  GatewayAiVerdictGenerator,
  type AiVerdictRequest,
  type GatewayGenerateText,
} from "./gateway-evaluator";

const request: AiVerdictRequest = {
  sourceText: "I am from Colombia.",
  userInput: "Soy colombiano.",
  acceptedAnswers: ["Soy de Colombia."],
  direction: "en-es",
  modality: "translate",
  grammarTags: ["verb.ser"],
  userTrackingId: "usr_0123456789abcdef0123456789abcdef",
};

const gatewayApiKey = "test_evaluation_gateway_key";

function successResult(output: unknown) {
  return {
    output,
    usage: { inputTokens: 31, outputTokens: 22, totalTokens: 53 },
    finalStep: {
      response: { modelId: "openai/gpt-5-mini-2025-08-07" },
      providerMetadata: { gateway: { generationId: "gen_01ABC" } },
    },
  };
}

describe("GatewayAiVerdictGenerator", () => {
  it("makes one schema-bound Gateway request with supported opaque reporting fields", async () => {
    const generate = vi.fn<GatewayGenerateText>().mockResolvedValue(
      successResult({
        score: 90,
        verdict: "correct",
        feedback: "That is a natural equivalent.",
        wordDiff: [],
        errorTags: [],
      }),
    );
    let now = 1_000;
    const generator = new GatewayAiVerdictGenerator({
      gatewayApiKey,
      generate,
      now: () => (now += 25),
    });

    const outcome = await generator.evaluate(request);

    expect(generate).toHaveBeenCalledTimes(1);
    const options = generate.mock.calls[0][0];
    expect(options.model).toBe(DEFAULT_AI_EVALUATION_MODEL);
    expect(options.maxRetries).toBe(0);
    expect(options.maxOutputTokens).toBe(AI_EVALUATION_MAX_OUTPUT_TOKENS);
    expect(options.reasoning).toBe("minimal");
    expect(options.timeout).toEqual({ totalMs: AI_EVALUATION_TIMEOUT_MS });
    expect(options.abortSignal).toBeUndefined();
    expect(options).not.toHaveProperty("tools");
    expect(options.providerOptions.gateway).not.toHaveProperty("models");
    expect(options.providerOptions.gateway).not.toHaveProperty("quotaEntityId");
    expect(options.providerOptions.gateway).toEqual({
      tags: ["scope:evaluation-only", "feature:evaluation", "prompt:v2"],
      user: "usr_0123456789abcdef0123456789abcdef",
    });
    expect(JSON.parse(options.prompt)).toEqual({
      sourceText: request.sourceText,
      userInput: request.userInput,
      acceptedAnswers: request.acceptedAnswers,
      direction: request.direction,
      modality: request.modality,
      grammarTags: request.grammarTags,
    });
    expect(options.prompt).not.toContain("itemRef");
    expect(options.prompt).not.toContain("gpt-5-mini");
    expect(outcome).toEqual({
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
        generationId: "gen_01ABC",
        latencyMs: 25,
        usage: { inputTokens: 31, outputTokens: 22, totalTokens: 53 },
      },
    });
  });

  it("includes a server-owned assessment goal when the exercise has one", async () => {
    const generate = vi.fn<GatewayGenerateText>().mockResolvedValue(
      successResult({
        score: 72,
        verdict: "close",
        feedback: "Your meaning is clear; use soler followed by an infinitive.",
        wordDiff: [],
        errorTags: [],
      }),
    );
    const generator = new GatewayAiVerdictGenerator({ gatewayApiKey, generate });

    await generator.evaluate({
      ...request,
      assessmentGoal: "Express a customary action with soler.",
    });

    expect(JSON.parse(generate.mock.calls[0][0].prompt)).toMatchObject({
      assessmentGoal: "Express a customary action with soler.",
    });
  });

  it("caps AI feedback at the learner-facing word limit", async () => {
    const generate = vi.fn<GatewayGenerateText>().mockResolvedValue(
      successResult({
        score: 72,
        verdict: "close",
        feedback:
          "Use the plural article before days of the week in Spanish because it makes habitual actions sound natural and is the form requested by this practice prompt for your answer here today with confidence.",
        wordDiff: [],
        errorTags: [],
      }),
    );
    const generator = new GatewayAiVerdictGenerator({ gatewayApiKey, generate });

    const outcome = await generator.evaluate(request);

    expect(outcome).toMatchObject({ kind: "graded" });
    if (outcome.kind === "graded") {
      expect(outcome.result.feedback.split(/\s+/u)).toHaveLength(AI_EVALUATION_FEEDBACK_MAX_WORDS);
      expect(outcome.result.feedback).toMatch(/…$/u);
    }
  });

  it("replaces impersonal evaluator language with a direct learner message", async () => {
    const generate = vi.fn<GatewayGenerateText>().mockResolvedValue(
      successResult({
        score: 35,
        verdict: "wrong",
        feedback:
          "The learner response contradicts the source meaning, but the reply says something different. Correct translation: use the supplied answer.",
        wordDiff: [],
        errorTags: [],
      }),
    );
    const generator = new GatewayAiVerdictGenerator({ gatewayApiKey, generate });

    const outcome = await generator.evaluate(request);

    expect(outcome).toMatchObject({
      kind: "graded",
      result: { feedback: "You changed the intended meaning. Use the correction below." },
    });
  });

  it("does not let AI feedback repeat a complete accepted answer", async () => {
    const generate = vi.fn<GatewayGenerateText>().mockResolvedValue(
      successResult({
        score: 35,
        verdict: "wrong",
        feedback: "You changed the meaning; say Soy de Colombia.",
        wordDiff: [],
        errorTags: [],
      }),
    );
    const generator = new GatewayAiVerdictGenerator({ gatewayApiKey, generate });

    const outcome = await generator.evaluate(request);

    expect(outcome).toMatchObject({
      kind: "graded",
      result: { feedback: "You changed the intended meaning. Use the correction below." },
    });
  });

  it("uses only the allowlisted Haiku alternative and propagates caller abort", async () => {
    const generate = vi.fn<GatewayGenerateText>().mockResolvedValue(
      successResult({
        score: 65,
        verdict: "close",
        feedback: "The idea is clear, but revise the phrasing.",
        wordDiff: [],
        errorTags: ["verb.ser"],
      }),
    );
    const controller = new AbortController();
    const generator = new GatewayAiVerdictGenerator({
      model: "anthropic/claude-haiku-4.5",
      gatewayApiKey,
      generate,
    });

    await generator.evaluate({ ...request, signal: controller.signal });

    expect(generate).toHaveBeenCalledTimes(1);
    expect(generate.mock.calls[0][0]).toMatchObject({
      model: "anthropic/claude-haiku-4.5",
      abortSignal: controller.signal,
    });
  });

  it("fails closed before generation for a model outside the server allowlist", async () => {
    const generate = vi.fn<GatewayGenerateText>();
    const generator = new GatewayAiVerdictGenerator({
      model: "attacker/expensive-model",
      gatewayApiKey,
      generate,
    });

    const outcome = await generator.evaluate(request);

    expect(generate).not.toHaveBeenCalled();
    expect(outcome).toMatchObject({
      kind: "ungraded",
      retryable: true,
      failure: "configuration",
      metadata: { provider: "gateway" },
    });
    expect(outcome.metadata).not.toHaveProperty("requestedModel");
  });

  it("returns ungraded on invalid structured output and exposes no partial verdict", async () => {
    const generate = vi.fn<GatewayGenerateText>().mockResolvedValue(
      successResult({
        score: 90,
        verdict: "wrong",
        feedback: "Contradictory band.",
        wordDiff: [],
        errorTags: [],
      }),
    );
    const generator = new GatewayAiVerdictGenerator({ gatewayApiKey, generate });

    const outcome = await generator.evaluate(request);

    expect(outcome).toMatchObject({
      kind: "ungraded",
      retryable: true,
      failure: "schema",
    });
    expect(outcome).not.toHaveProperty("result");
  });

  it("removes taxonomy tags that are outside the resolved item's grammar scope", async () => {
    const generate = vi.fn<GatewayGenerateText>().mockResolvedValue(
      successResult({
        score: 50,
        verdict: "wrong",
        feedback: "Review the verb form.",
        wordDiff: [],
        errorTags: ["verb.estar"],
      }),
    );
    const generator = new GatewayAiVerdictGenerator({ gatewayApiKey, generate });

    const outcome = await generator.evaluate(request);

    expect(outcome).toMatchObject({
      kind: "graded",
      result: {
        score: 50,
        verdict: "wrong",
        feedback: "Review the verb form.",
        errorTags: [],
      },
    });
  });

  it.each([
    ["TimeoutError", "timeout"],
    ["GatewayAuthenticationError", "authentication"],
    ["GatewayError", "authentication"],
    ["GatewayRateLimitError", "rate-limit"],
    ["UnexpectedFailure", "unknown"],
  ] as const)("categorizes %s without leaking the error", async (name, failure) => {
    const error = Object.assign(new Error("sensitive upstream detail"), { name });
    const generate = vi.fn<GatewayGenerateText>().mockRejectedValue(error);
    const generator = new GatewayAiVerdictGenerator({ gatewayApiKey, generate });

    const outcome = await generator.evaluate(request);

    expect(outcome).toMatchObject({ kind: "ungraded", retryable: true, failure });
    expect(JSON.stringify(outcome)).not.toContain("sensitive upstream detail");
  });

  it("classifies an exhausted Gateway key budget as non-retryable", async () => {
    const error = Object.assign(new Error("sensitive budget detail"), {
      name: "GatewayRateLimitError",
      statusCode: 402,
    });
    const generate = vi.fn<GatewayGenerateText>().mockRejectedValue(error);
    const generator = new GatewayAiVerdictGenerator({ gatewayApiKey, generate });

    const outcome = await generator.evaluate(request);

    expect(outcome).toMatchObject({
      kind: "ungraded",
      retryable: false,
      failure: "budget",
    });
    expect(JSON.stringify(outcome)).not.toContain("sensitive budget detail");
  });

  it("retains only safe upstream diagnostics for a provider rejection", async () => {
    const error = Object.assign(new Error("sensitive provider detail"), {
      name: "APICallError",
      statusCode: 400,
      responseBody: JSON.stringify({
        error: {
          code: "invalid_gateway_request",
          message: "sensitive response detail",
        },
      }),
    });
    const generate = vi.fn<GatewayGenerateText>().mockRejectedValue(error);
    const generator = new GatewayAiVerdictGenerator({ gatewayApiKey, generate });

    const outcome = await generator.evaluate(request);

    expect(outcome).toMatchObject({
      kind: "ungraded",
      retryable: false,
      failure: "provider",
      metadata: {
        providerStatus: 400,
      },
    });
    expect(JSON.stringify(outcome)).not.toContain("sensitive provider detail");
    expect(JSON.stringify(outcome)).not.toContain("sensitive response detail");
    expect(JSON.stringify(outcome)).not.toContain("invalid_gateway_request");
  });

  it("bounds safe status traversal for cyclic provider errors", async () => {
    const error = Object.assign(new Error("sensitive cyclic detail"), {
      name: "UnexpectedFailure",
    });
    const second = Object.assign(new Error("second sensitive cyclic detail"), {
      name: "UnexpectedFailure",
      cause: error,
    });
    Object.assign(error, { cause: second });
    const generate = vi.fn<GatewayGenerateText>().mockRejectedValue(error);
    const generator = new GatewayAiVerdictGenerator({ gatewayApiKey, generate });

    const outcome = await generator.evaluate(request);

    expect(outcome).toMatchObject({
      kind: "ungraded",
      retryable: true,
      failure: "unknown",
    });
    expect(JSON.stringify(outcome)).not.toContain("sensitive cyclic detail");
    expect(JSON.stringify(outcome)).not.toContain("second sensitive cyclic detail");
  });

  it("classifies caller cancellation separately", async () => {
    const controller = new AbortController();
    controller.abort();
    const generate = vi.fn<GatewayGenerateText>().mockRejectedValue(
      new DOMException("cancelled", "AbortError"),
    );
    const generator = new GatewayAiVerdictGenerator({ gatewayApiKey, generate });

    const outcome = await generator.evaluate({
      ...request,
      signal: controller.signal,
    });

    expect(generate.mock.calls[0]?.[0].providerOptions.gateway.user).toBe(
      request.userTrackingId,
    );
    expect(outcome).toMatchObject({ failure: "aborted", retryable: true });
  });

  it("fails closed before generation without a safe opaque user identifier", async () => {
    const generate = vi.fn<GatewayGenerateText>();
    const generator = new GatewayAiVerdictGenerator({ gatewayApiKey, generate });

    const outcome = await generator.evaluate({
      ...request,
      userTrackingId: "user_private_123",
    });

    expect(generate).not.toHaveBeenCalled();
    expect(outcome).toMatchObject({
      kind: "ungraded",
      retryable: true,
      failure: "configuration",
    });
  });

  it("fails closed before generation without the evaluation-only Gateway credential", async () => {
    const generate = vi.fn<GatewayGenerateText>();
    const generator = new GatewayAiVerdictGenerator({ gatewayApiKey: "   ", generate });

    const outcome = await generator.evaluate(request);

    expect(generate).not.toHaveBeenCalled();
    expect(outcome).toMatchObject({
      kind: "ungraded",
      retryable: true,
      failure: "configuration",
    });
    expect(JSON.stringify(outcome)).not.toContain("gatewayApiKey");
  });

  it("does not fall back to the legacy or ambient Gateway credential", async () => {
    vi.stubEnv("EVALUATION_AI_GATEWAY_API_KEY", "");
    vi.stubEnv("AI_GATEWAY_API_KEY", "legacy_key_must_not_be_used");
    vi.stubEnv("VERCEL_OIDC_TOKEN", "ambient_oidc_must_not_be_used");
    const generate = vi.fn<GatewayGenerateText>();
    const generator = new GatewayAiVerdictGenerator({ generate });

    const outcome = await generator.evaluate(request);

    expect(generate).not.toHaveBeenCalled();
    expect(outcome).toMatchObject({
      kind: "ungraded",
      retryable: true,
      failure: "configuration",
    });
    vi.unstubAllEnvs();
  });
});
