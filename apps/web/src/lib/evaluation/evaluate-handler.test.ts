import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { EvaluationAdmitter } from "./admission-control";
import {
  EVALUATION_BODY_MAX_BYTES,
  createEvaluateHandler,
  type EvaluationAuthenticator,
  type EvaluationServicePort,
  type EvaluationSourceResolver,
} from "./evaluate-handler";
import {
  EvaluationSourceIntegrityError,
  EvaluationSourceNotFoundError,
  type ResolvedLessonSource,
} from "./source-resolver";

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
    acceptedEs: [],
    acceptedEn: [],
    grammarTags: ["verb.ser"],
    vocabRefs: [],
    difficulty: 1,
    hints: ["one", "two", "three"],
    deprecated: false,
  },
  authoritativeAnswers: ["Me llamo Ana."],
  grammarTags: ["verb.ser"],
  contentVersion: 1,
};

const validBody = {
  sourceType: "lesson",
  itemRef: source.itemRef,
  modality: "translate",
  direction: "en-es",
  userInput: "Me llamo Ana.",
};

function request(body: unknown = validBody, headers: HeadersInit = {}): Request {
  return new Request("http://localhost/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function dependencies(overrides: {
  authenticate?: EvaluationAuthenticator;
  resolveSource?: EvaluationSourceResolver;
  service?: EvaluationServicePort;
  admit?: EvaluationAdmitter;
} = {}) {
  return {
    authenticate: overrides.authenticate ?? (async () => ({ userId: "user_private_123" })),
    resolveSource: overrides.resolveSource ?? (async () => source),
    admit:
      overrides.admit ??
      (() => ({ allowed: true as const, release: vi.fn() })),
    service:
      overrides.service ??
      ({
        evaluate: vi.fn(async () => ({
          kind: "graded" as const,
          result: {
            score: 100,
            verdict: "correct" as const,
            feedback: "Correct.",
            errorTags: [],
            evalSource: "comparison" as const,
          },
        })),
      } satisfies EvaluationServicePort),
    requestId: () => "req_test",
  };
}

describe("POST /api/evaluate handler", () => {
  it("requires authentication before reading or grading the request", async () => {
    const service = { evaluate: vi.fn() } satisfies EvaluationServicePort;
    const response = await createEvaluateHandler(
      dependencies({ authenticate: async () => null, service }),
    )(request("not json"));

    expect(response.status).toBe(401);
    expect(service.evaluate).not.toHaveBeenCalled();
    expect(await response.json()).toEqual({
      requestId: "req_test",
      error: {
        code: "authentication_required",
        message: "Sign in before submitting an answer.",
      },
    });
  });

  it("fails closed when authentication is unavailable", async () => {
    const response = await createEvaluateHandler(
      dependencies({
        authenticate: async () => {
          throw new Error("secret auth detail");
        },
      }),
    )(request());

    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("secret auth detail");
  });

  it("requires JSON and rejects malformed, blank, or answer-spoofing bodies", async () => {
    const handler = createEvaluateHandler(dependencies());
    const wrongMedia = await handler(
      new Request("http://localhost/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "hello",
      }),
    );
    expect(wrongMedia.status).toBe(415);

    await expect(handler(request("{"))).resolves.toMatchObject({ status: 400 });
    await expect(handler(request({ ...validBody, userInput: "   " }))).resolves.toMatchObject({
      status: 400,
    });
    await expect(
      handler(request({ ...validBody, expectedAnswers: ["attacker answer"] })),
    ).resolves.toMatchObject({ status: 400 });
    await expect(
      handler(request({ ...validBody, model: "attacker/expensive" })),
    ).resolves.toMatchObject({ status: 400 });
    await expect(
      handler(request({ ...validBody, sessionId: "unchecked-session" })),
    ).resolves.toMatchObject({ status: 400 });
  });

  it("rejects declared and streamed oversized bodies", async () => {
    const handler = createEvaluateHandler(dependencies());
    const declared = await handler(request(validBody, { "Content-Length": "99999" }));
    expect(declared.status).toBe(413);

    const streamed = await handler(
      request({ ...validBody, userInput: "x".repeat(EVALUATION_BODY_MAX_BYTES) }),
    );
    expect(streamed.status).toBe(413);
  });

  it("rejects not-yet-supported source types and modalities before resolution", async () => {
    const resolveSource = vi.fn<EvaluationSourceResolver>();
    const handler = createEvaluateHandler(dependencies({ resolveSource }));

    expect(await handler(request({ ...validBody, sourceType: "set" }))).toMatchObject({
      status: 422,
    });
    expect(await handler(request({ ...validBody, modality: "reading" }))).toMatchObject({
      status: 422,
    });
    expect(resolveSource).not.toHaveBeenCalled();
  });

  it("keeps missing and invalid stored sources learner-safe", async () => {
    const missing = await createEvaluateHandler(
      dependencies({
        resolveSource: async () => {
          throw new EvaluationSourceNotFoundError();
        },
      }),
    )(request());
    expect(missing.status).toBe(404);

    const invalid = await createEvaluateHandler(
      dependencies({
        resolveSource: async () => {
          throw new EvaluationSourceIntegrityError({ cause: new Error("hidden answer") });
        },
      }),
    )(request());
    expect(invalid.status).toBe(503);
    expect(JSON.stringify(await invalid.json())).not.toContain("hidden answer");
  });

  it("returns a cache-free graded result and passes only an opaque learner identifier", async () => {
    const service = { evaluate: vi.fn(dependencies().service.evaluate) };
    const resolveSource = vi.fn(async () => source);
    const response = await createEvaluateHandler(
      dependencies({ service, resolveSource }),
    )(request());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(resolveSource).toHaveBeenCalledWith(source.itemRef, "en-es");
    expect(service.evaluate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: "req_test",
        source,
        userTrackingId: expect.stringMatching(/^usr_[a-f0-9]{32}$/u),
      }),
    );
    expect(JSON.stringify(service.evaluate.mock.calls[0][0])).not.toContain("user_private_123");
    expect(await response.json()).toEqual({
      requestId: "req_test",
      score: 100,
      verdict: "correct",
      feedback: "Correct.",
      errorTags: [],
      evalSource: "comparison",
    });
  });

  it("rejects over-limit work before service evaluation and returns Retry-After", async () => {
    const service = { evaluate: vi.fn() } satisfies EvaluationServicePort;
    const resolveSource = vi.fn<EvaluationSourceResolver>();
    const response = await createEvaluateHandler(
      dependencies({
        service,
        resolveSource,
        admit: () => ({ allowed: false, retryAfterSeconds: 17 }),
      }),
    )(request());

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("17");
    expect(resolveSource).not.toHaveBeenCalled();
    expect(service.evaluate).not.toHaveBeenCalled();
    expect(await response.json()).toMatchObject({
      error: { code: "evaluation_rate_limited" },
    });
  });

  it("returns retryable ungraded responses without fabricated grading fields", async () => {
    const unavailable = await createEvaluateHandler(
      dependencies({
        service: {
          evaluate: async () => ({
            kind: "ungraded",
            retryable: true,
            failure: "timeout",
          }),
        },
      }),
    )(request());
    expect(unavailable.status).toBe(503);
    const unavailableBody = await unavailable.json();
    expect(unavailableBody).toEqual({
      requestId: "req_test",
      status: "ungraded",
      retryable: true,
      reason: "evaluation_temporarily_unavailable",
    });
    expect(unavailableBody).not.toHaveProperty("score");
    expect(unavailableBody).not.toHaveProperty("verdict");

    const limited = await createEvaluateHandler(
      dependencies({
        service: {
          evaluate: async () => ({
            kind: "ungraded",
            retryable: true,
            failure: "rate-limit",
          }),
        },
      }),
    )(request());
    expect(limited.status).toBe(429);
  });
});
