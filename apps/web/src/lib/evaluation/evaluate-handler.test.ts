import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { EvaluationAdmitter } from "./admission-control";
import type { EvaluationPerimeterAdmitter } from "./firewall-admission";
import {
  EVALUATION_BODY_MAX_BYTES,
  createEvaluateHandler,
  type EvaluationAuthenticator,
  type EvaluationHandlerLogger,
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
  admitAtPerimeter?: EvaluationPerimeterAdmitter;
  admit?: EvaluationAdmitter;
  logger?: EvaluationHandlerLogger;
  now?: () => number;
} = {}) {
  return {
    authenticate: overrides.authenticate ?? (async () => ({ userId: "user_private_123" })),
    resolveSource: overrides.resolveSource ?? (async () => source),
    admitAtPerimeter: overrides.admitAtPerimeter ?? (async () => ({ allowed: true as const })),
    admit:
      overrides.admit ??
      (() => ({ allowed: true as const, release: vi.fn() })),
    logger: overrides.logger ?? vi.fn(),
    now: overrides.now ?? (() => 1_000),
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
    const logger = vi.fn<EvaluationHandlerLogger>();
    const admitAtPerimeter = vi.fn<EvaluationPerimeterAdmitter>();
    const response = await createEvaluateHandler(
      dependencies({ authenticate: async () => null, service, logger, admitAtPerimeter }),
    )(request("not json"));

    expect(response.status).toBe(401);
    expect(service.evaluate).not.toHaveBeenCalled();
    expect(admitAtPerimeter).not.toHaveBeenCalled();
    expect(logger).not.toHaveBeenCalled();
    expect(await response.json()).toEqual({
      requestId: "req_test",
      error: {
        code: "authentication_required",
        message: "Sign in before submitting an answer.",
      },
    });
  });

  it("fails closed when authentication is unavailable", async () => {
    const logger = vi.fn<EvaluationHandlerLogger>();
    let now = 1_000;
    const response = await createEvaluateHandler(
      dependencies({
        logger,
        now: () => (now += 25),
        authenticate: async () => {
          throw new Error("secret auth detail");
        },
      }),
    )(request());

    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("secret auth detail");
    expect(logger).toHaveBeenCalledWith({
      event: "evaluation.request_failed",
      requestId: "req_test",
      stage: "authentication",
      failure: "authentication_unavailable",
      status: 503,
      latencyMs: 25,
    });
    expect(JSON.stringify(logger.mock.calls)).not.toContain("secret auth detail");
  });

  it("requires JSON and rejects malformed, blank, or answer-spoofing bodies", async () => {
    const admitAtPerimeter = vi.fn<EvaluationPerimeterAdmitter>();
    const handler = createEvaluateHandler(dependencies({ admitAtPerimeter }));
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
    expect(admitAtPerimeter).not.toHaveBeenCalled();
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
    const admitAtPerimeter = vi.fn<EvaluationPerimeterAdmitter>();
    const handler = createEvaluateHandler(dependencies({ resolveSource, admitAtPerimeter }));

    expect(await handler(request({ ...validBody, sourceType: "set" }))).toMatchObject({
      status: 422,
    });
    expect(await handler(request({ ...validBody, modality: "reading" }))).toMatchObject({
      status: 422,
    });
    expect(resolveSource).not.toHaveBeenCalled();
    expect(admitAtPerimeter).not.toHaveBeenCalled();
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
    const admitAtPerimeter = vi.fn<EvaluationPerimeterAdmitter>(async () => ({ allowed: true }));
    const response = await createEvaluateHandler(
      dependencies({ service, resolveSource, admitAtPerimeter }),
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
    expect(admitAtPerimeter.mock.calls[0]?.[0]).toBe(
      service.evaluate.mock.calls[0]?.[0]?.userTrackingId,
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

  it("runs the user-keyed perimeter and local guards before source or AI work", async () => {
    const order: string[] = [];
    const admitAtPerimeter = vi.fn<EvaluationPerimeterAdmitter>(async (userKey) => {
      order.push("perimeter");
      expect(userKey).toMatch(/^usr_[a-f0-9]{32}$/u);
      return { allowed: true };
    });
    const admit = vi.fn<EvaluationAdmitter>(() => {
      order.push("local");
      return { allowed: true, release: vi.fn() };
    });
    const resolveSource = vi.fn(async () => {
      order.push("source");
      return source;
    });
    const service = {
      evaluate: vi.fn(async () => {
        order.push("service");
        return {
          kind: "graded" as const,
          result: {
            score: 100,
            verdict: "correct" as const,
            feedback: "Correct.",
            errorTags: [],
            evalSource: "comparison" as const,
          },
        };
      }),
    };

    const response = await createEvaluateHandler(
      dependencies({ admitAtPerimeter, admit, resolveSource, service }),
    )(request());

    expect(response.status).toBe(200);
    expect(order).toEqual(["perimeter", "local", "source", "service"]);
  });

  it("does not run the local guard, database resolver, or AI when the perimeter limits", async () => {
    const admit = vi.fn<EvaluationAdmitter>();
    const resolveSource = vi.fn<EvaluationSourceResolver>();
    const service = { evaluate: vi.fn() } satisfies EvaluationServicePort;
    const response = await createEvaluateHandler(
      dependencies({
        admitAtPerimeter: async () => ({
          allowed: false,
          kind: "rate-limited",
          retryAfterSeconds: 23,
        }),
        admit,
        resolveSource,
        service,
      }),
    )(request());

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("23");
    expect(admit).not.toHaveBeenCalled();
    expect(resolveSource).not.toHaveBeenCalled();
    expect(service.evaluate).not.toHaveBeenCalled();
  });

  it.each([
    { allowed: false as const, kind: "unavailable" as const, failure: "not-found" as const },
    { allowed: false as const, kind: "unavailable" as const, failure: "blocked" as const },
  ])("returns retryable safe unavailability for perimeter failure $failure", async (result) => {
    const admit = vi.fn<EvaluationAdmitter>();
    const resolveSource = vi.fn<EvaluationSourceResolver>();
    const service = { evaluate: vi.fn() } satisfies EvaluationServicePort;
    const logger = vi.fn<EvaluationHandlerLogger>();
    const response = await createEvaluateHandler(
      dependencies({
        admitAtPerimeter: async () => result,
        admit,
        resolveSource,
        service,
        logger,
      }),
    )(request());

    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(await response.json()).toEqual({
      requestId: "req_test",
      status: "ungraded",
      retryable: true,
      reason: "evaluation_temporarily_unavailable",
    });
    expect(admit).not.toHaveBeenCalled();
    expect(resolveSource).not.toHaveBeenCalled();
    expect(service.evaluate).not.toHaveBeenCalled();
    expect(JSON.stringify(logger.mock.calls)).not.toContain("user_private_123");
  });

  it("fails closed when an injected perimeter throws", async () => {
    const service = { evaluate: vi.fn() } satisfies EvaluationServicePort;
    const resolveSource = vi.fn<EvaluationSourceResolver>();
    const response = await createEvaluateHandler(
      dependencies({
        admitAtPerimeter: async () => {
          throw new Error("sensitive perimeter detail");
        },
        resolveSource,
        service,
      }),
    )(request());

    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("sensitive perimeter detail");
    expect(resolveSource).not.toHaveBeenCalled();
    expect(service.evaluate).not.toHaveBeenCalled();
  });

  it("returns retryable ungraded responses without fabricated grading fields", async () => {
    const logger = vi.fn<EvaluationHandlerLogger>();
    const unavailable = await createEvaluateHandler(
      dependencies({
        logger,
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
    expect(logger).toHaveBeenCalledWith({
      event: "evaluation.request_failed",
      requestId: "req_test",
      stage: "service",
      failure: "ai_timeout",
      status: 503,
      latencyMs: 0,
    });

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
    expect(limited.headers.get("Retry-After")).toBe("60");

    const budgeted = await createEvaluateHandler(
      dependencies({
        service: {
          evaluate: async () => ({
            kind: "ungraded",
            retryable: false,
            failure: "budget",
          }),
        },
      }),
    )(request());
    expect(budgeted.status).toBe(503);
    expect(await budgeted.json()).toMatchObject({
      status: "ungraded",
      retryable: false,
      reason: "evaluation_temporarily_unavailable",
    });
  });
});
