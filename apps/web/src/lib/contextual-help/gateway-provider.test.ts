import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  CONTEXTUAL_HELP_MAX_OUTPUT_TOKENS,
  CONTEXTUAL_HELP_TIMEOUT_MS,
  DEFAULT_CONTEXTUAL_HELP_MODEL,
  GatewayContextualHelpProvider,
  type ContextualHelpGatewayGenerateText,
} from "./gateway-provider";
import type { ContextualHelpRequest } from "./contracts";

const gatewayApiKey = "test_evaluation_gateway_key";

const request: ContextualHelpRequest = {
  question: "Why do we use vos here?",
  promotedSource: { id: "lesson.a1.you-live-here", version: 1 },
  objective: "Say where someone lives using the active Spanish profile.",
  currentItem: {
    id: "item.live-here.1",
    prompt: "You live here.",
    target: "Vos vivís acá.",
    acceptedAnswers: ["Vos vivís aquí."],
    authoredHints: ["Use the familiar singular form preferred in Argentina."],
  },
  learnerLevel: "A1",
  spanishProfile: "es-AR",
  mayRevealAnswer: false,
  userTrackingId: "usr_0123456789abcdef0123456789abcdef",
};

function successResult(output: unknown) {
  return { output };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("GatewayContextualHelpProvider", () => {
  it("sends one schema-bound, promoted-only request with the active learner profile", async () => {
    const generate = vi.fn<ContextualHelpGatewayGenerateText>().mockResolvedValue(
      successResult({
        kind: "ai-explanation",
        message: "Vos is the familiar singular pronoun used in Argentina, so the verb takes the matching voseo form.",
      }),
    );
    const provider = new GatewayContextualHelpProvider({
      gatewayApiKey,
      generate,
    });

    const outcome = await provider.ask(request);

    expect(generate).toHaveBeenCalledTimes(1);
    const options = generate.mock.calls[0][0];
    expect(options.model).toBe(DEFAULT_CONTEXTUAL_HELP_MODEL);
    expect(options.maxRetries).toBe(0);
    expect(options.maxOutputTokens).toBe(CONTEXTUAL_HELP_MAX_OUTPUT_TOKENS);
    expect(options.timeout).toEqual({ totalMs: CONTEXTUAL_HELP_TIMEOUT_MS });
    expect(options.reasoning).toBe("minimal");
    expect(options).not.toHaveProperty("tools");
    expect(options.providerOptions.gateway).toEqual({
      tags: ["scope:contextual-help-only", "feature:ask-aidioma", "prompt:v1"],
      user: request.userTrackingId,
    });
    expect(JSON.parse(options.prompt)).toEqual({
      promotedSourceFacts: {
        source: request.promotedSource,
        objective: request.objective,
        currentItem: {
          id: request.currentItem.id,
          prompt: request.currentItem.prompt,
          authoredHints: request.currentItem.authoredHints,
        },
      },
      learnerContext: { level: "A1", spanishProfile: "es-AR" },
      answerBoundary: { mayRevealAnswer: false },
      question: request.question,
    });
    expect(options.prompt).not.toContain(request.currentItem.target);
    expect(options.prompt).not.toContain(request.currentItem.acceptedAnswers[0]);
    expect(outcome).toEqual({
      kind: "ai-explanation",
      message: "Vos is the familiar singular pronoun used in Argentina, so the verb takes the matching voseo form.",
    });
  });

  it("includes the promoted answers and latest feedback only when the answer may be discussed", async () => {
    const generate = vi.fn<ContextualHelpGatewayGenerateText>().mockResolvedValue(
      successResult({
        kind: "ai-explanation",
        message: "The accent in vivís marks the stressed final syllable in this voseo form.",
      }),
    );
    const provider = new GatewayContextualHelpProvider({ gatewayApiKey, generate });

    await provider.ask({
      ...request,
      mayRevealAnswer: true,
      latestAttempt: {
        answer: "Vos vives acá.",
        feedback: "Use the matching voseo verb form.",
        verdict: "close",
      },
    });

    const payload = JSON.parse(generate.mock.calls[0][0].prompt);
    expect(payload.promotedSourceFacts.currentItem).toMatchObject({
      target: request.currentItem.target,
      acceptedAnswers: request.currentItem.acceptedAnswers,
    });
    expect(payload.latestAttempt).toEqual({
      answer: "Vos vives acá.",
      feedback: "Use the matching voseo verb form.",
      verdict: "close",
    });
  });

  it("keeps an off-topic result visibly distinct from an AI explanation", async () => {
    const generate = vi.fn<ContextualHelpGatewayGenerateText>().mockResolvedValue(
      successResult({
        kind: "topic-redirect",
        message: "I can help with how to say where someone lives in this activity.",
      }),
    );
    const provider = new GatewayContextualHelpProvider({ gatewayApiKey, generate });

    await expect(provider.ask(request)).resolves.toMatchObject({
      kind: "topic-redirect",
      message: "I can help with how to say where someone lives in this activity.",
    });
  });

  it.each([
    ["blank question", { ...request, question: "   " }],
    ["question over 500 characters", { ...request, question: "q".repeat(501) }],
    [
      "oversized promoted context",
      {
        ...request,
        currentItem: {
          ...request.currentItem,
          acceptedAnswers: Array.from({ length: 12 }, (_, index) => `${index}${"a".repeat(499)}`),
          authoredHints: Array.from({ length: 6 }, (_, index) => `${index}${"h".repeat(499)}`),
        },
      },
    ],
  ])("fails closed before generation for %s", async (_label, invalidRequest) => {
    const generate = vi.fn<ContextualHelpGatewayGenerateText>();
    const provider = new GatewayContextualHelpProvider({ gatewayApiKey, generate });

    const outcome = await provider.ask(invalidRequest as ContextualHelpRequest);

    expect(generate).not.toHaveBeenCalled();
    expect(outcome).toMatchObject({
      kind: "unavailable",
      retryable: false,
    });
  });

  it("rejects generated text that exposes a pre-answer canonical or accepted answer", async () => {
    const generate = vi.fn<ContextualHelpGatewayGenerateText>().mockResolvedValue(
      successResult({ kind: "ai-explanation", message: "The answer is: Vos vivís acá." }),
    );
    const provider = new GatewayContextualHelpProvider({ gatewayApiKey, generate });

    const outcome = await provider.ask(request);

    expect(outcome).toMatchObject({
      kind: "unavailable",
      retryable: false,
    });
    expect(outcome).not.toHaveProperty("message");
  });

  it.each([
    [{ kind: "free-chat", message: "Anything goes." }, "unknown response kind"],
    [
      { kind: "ai-explanation", message: Array.from({ length: 61 }, () => "word").join(" ") },
      "long response",
    ],
  ])("exposes no partial response for %s", async (output) => {
    const generate = vi.fn<ContextualHelpGatewayGenerateText>().mockResolvedValue(
      successResult(output),
    );
    const provider = new GatewayContextualHelpProvider({ gatewayApiKey, generate });

    const outcome = await provider.ask(request);

    expect(outcome).toMatchObject({
      kind: "unavailable",
      retryable: true,
    });
    expect(outcome).not.toHaveProperty("message");
  });

  it("uses only an allowlisted model and propagates caller cancellation", async () => {
    const generate = vi.fn<ContextualHelpGatewayGenerateText>().mockResolvedValue(
      successResult({ kind: "topic-redirect", message: "Let's return to this activity." }),
    );
    const controller = new AbortController();
    const provider = new GatewayContextualHelpProvider({
      model: "anthropic/claude-haiku-4.5",
      gatewayApiKey,
      generate,
    });

    await provider.ask({ ...request, signal: controller.signal });

    expect(generate.mock.calls[0][0]).toMatchObject({
      model: "anthropic/claude-haiku-4.5",
      abortSignal: controller.signal,
      timeout: { totalMs: CONTEXTUAL_HELP_TIMEOUT_MS },
    });
  });

  it("fails before generation for a model outside the server allowlist", async () => {
    const generate = vi.fn<ContextualHelpGatewayGenerateText>();
    const provider = new GatewayContextualHelpProvider({
      model: "attacker/expensive-model",
      gatewayApiKey,
      generate,
    });

    const outcome = await provider.ask(request);

    expect(generate).not.toHaveBeenCalled();
    expect(outcome).toMatchObject({
      kind: "unavailable",
      retryable: false,
    });
  });

  it.each([
    ["TimeoutError", undefined, true],
    ["GatewayAuthenticationError", 401, false],
    ["GatewayRateLimitError", 429, true],
    ["GatewayRateLimitError", 402, false],
    ["UnexpectedFailure", 500, true],
  ] as const)(
    "maps %s/%s to a safe retry decision",
    async (name, statusCode, retryable) => {
      const error = Object.assign(new Error("private question and provider response"), {
        name,
        ...(statusCode !== undefined && { statusCode }),
      });
      const generate = vi.fn<ContextualHelpGatewayGenerateText>().mockRejectedValue(error);
      const provider = new GatewayContextualHelpProvider({ gatewayApiKey, generate });

      const outcome = await provider.ask(request);

      expect(outcome).toEqual({ kind: "unavailable", retryable });
      expect(JSON.stringify(outcome)).not.toContain("private question");
      expect(JSON.stringify(outcome)).not.toContain("provider response");
    },
  );

  it("classifies caller abort without exposing the cancellation detail", async () => {
    const controller = new AbortController();
    controller.abort();
    const generate = vi.fn<ContextualHelpGatewayGenerateText>().mockRejectedValue(
      new DOMException("private cancellation detail", "AbortError"),
    );
    const provider = new GatewayContextualHelpProvider({ gatewayApiKey, generate });

    const outcome = await provider.ask({ ...request, signal: controller.signal });

    expect(outcome).toMatchObject({
      kind: "unavailable",
      retryable: true,
    });
    expect(JSON.stringify(outcome)).not.toContain("private cancellation detail");
  });

  it("requires a safe opaque tracking id and never sends a raw account id", async () => {
    const generate = vi.fn<ContextualHelpGatewayGenerateText>();
    const provider = new GatewayContextualHelpProvider({ gatewayApiKey, generate });

    const outcome = await provider.ask({ ...request, userTrackingId: "user@example.com" });

    expect(generate).not.toHaveBeenCalled();
    expect(outcome).toEqual({ kind: "unavailable", retryable: false });
    expect(JSON.stringify(outcome)).not.toContain("user@example.com");
  });

  it("uses only EVALUATION_AI_GATEWAY_API_KEY and never ambient Gateway credentials", async () => {
    vi.stubEnv("EVALUATION_AI_GATEWAY_API_KEY", "");
    vi.stubEnv("AI_GATEWAY_API_KEY", "ambient_key_must_not_be_used");
    vi.stubEnv("VERCEL_OIDC_TOKEN", "ambient_oidc_must_not_be_used");
    const generate = vi.fn<ContextualHelpGatewayGenerateText>();
    const provider = new GatewayContextualHelpProvider({ generate });

    const outcome = await provider.ask(request);

    expect(generate).not.toHaveBeenCalled();
    expect(outcome).toMatchObject({
      kind: "unavailable",
      retryable: false,
    });
    expect(JSON.stringify(outcome)).not.toContain("ambient_key");
    expect(JSON.stringify(outcome)).not.toContain("ambient_oidc");
  });

  it("does not log raw question, answer, or provider errors", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const generate = vi
      .fn<ContextualHelpGatewayGenerateText>()
      .mockRejectedValue(new Error("raw upstream answer"));
    const provider = new GatewayContextualHelpProvider({ gatewayApiKey, generate });

    await provider.ask({ ...request, question: "raw learner question" });

    expect(log).not.toHaveBeenCalled();
    expect(errorLog).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });
});
