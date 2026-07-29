import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { admitEvaluation, type EvaluationAdmitter } from "./admission-control";
import { EvaluationRequestSchema } from "./contracts";
import type {
  EvaluationService,
  EvaluationServiceOutcome,
  EvaluationServiceRequest,
} from "./evaluation-service";
import {
  EVALUATION_FIREWALL_RETRY_AFTER_SECONDS,
  admitEvaluationAtPerimeter,
  type EvaluationPerimeterAdmitter,
} from "./firewall-admission";
import {
  EvaluationSourceIntegrityError,
  EvaluationSourceNotFoundError,
  resolveLessonSource,
  type ResolvedLessonSource,
} from "./source-resolver";

export const EVALUATION_BODY_MAX_BYTES = 4_096;

export type EvaluationPrincipal = { userId: string };
export type EvaluationAuthenticator = () => Promise<EvaluationPrincipal | null>;
export type EvaluationSourceResolver = (
  itemRef: string,
  direction: "es-en" | "en-es",
) => Promise<ResolvedLessonSource>;
export type EvaluationServicePort = Pick<EvaluationService, "evaluate">;
export type EvaluationHandlerFailureEvent = {
  event: "evaluation.request_failed";
  requestId: string;
  stage: "authentication" | "request" | "admission" | "source" | "service";
  failure: string;
  status: number;
  latencyMs: number;
};
export type EvaluationHandlerLogger = (event: EvaluationHandlerFailureEvent) => void;

type EvaluateHandlerDependencies = {
  authenticate: EvaluationAuthenticator;
  service: EvaluationServicePort;
  resolveSource?: EvaluationSourceResolver;
  admitAtPerimeter?: EvaluationPerimeterAdmitter;
  admit?: EvaluationAdmitter;
  requestId?: () => string;
  logger?: EvaluationHandlerLogger;
  now?: () => number;
};

class BodyTooLargeError extends Error {}

function json(body: unknown, status: number, headers?: HeadersInit): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

function errorResponse(
  requestId: string,
  status: number,
  code: string,
  message: string,
  headers?: HeadersInit,
): Response {
  return json({ requestId, error: { code, message } }, status, headers);
}

function defaultLogger(event: EvaluationHandlerFailureEvent): void {
  console.warn(JSON.stringify(event));
}

async function readBoundedBody(request: Request): Promise<string> {
  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let body = "";
  let bytes = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > EVALUATION_BODY_MAX_BYTES) {
      await reader.cancel();
      throw new BodyTooLargeError();
    }
    body += decoder.decode(value, { stream: true });
  }

  return body + decoder.decode();
}

function trackingId(userId: string): string {
  return `usr_${createHash("sha256").update(userId).digest("hex").slice(0, 32)}`;
}

function ungradedResponse(
  requestId: string,
  outcome: Extract<EvaluationServiceOutcome, { kind: "ungraded" }>,
): Response {
  const status = outcome.failure === "rate-limit" ? 429 : 503;
  return json(
    {
      requestId,
      status: "ungraded",
      retryable: true,
      reason:
        outcome.failure === "rate-limit"
          ? "evaluation_rate_limited"
          : "evaluation_temporarily_unavailable",
    },
    status,
  );
}

export function createEvaluateHandler({
  authenticate,
  service,
  resolveSource = resolveLessonSource,
  admitAtPerimeter = admitEvaluationAtPerimeter,
  admit = admitEvaluation,
  requestId: createRequestId = randomUUID,
  logger = defaultLogger,
  now = Date.now,
}: EvaluateHandlerDependencies): (request: Request) => Promise<Response> {
  return async function handleEvaluate(request: Request): Promise<Response> {
    const requestId = createRequestId();
    const startedAt = now();
    const recordFailure = (
      status: number,
      failure: string,
      stage: EvaluationHandlerFailureEvent["stage"],
    ): void => {
      // Routine public 4xx input/auth failures are intentionally not emitted
      // one-by-one; doing so would make logs an unauthenticated amplification path.
      if (status < 500 && stage !== "admission" && stage !== "source") return;
      try {
        logger({
          event: "evaluation.request_failed",
          requestId,
          stage,
          failure,
          status,
          latencyMs: Math.max(0, now() - startedAt),
        });
      } catch {
        // Observability must never change the endpoint failure response.
      }
    };
    const fail = (
      status: number,
      code: string,
      message: string,
      stage: EvaluationHandlerFailureEvent["stage"],
      headers?: HeadersInit,
    ): Response => {
      recordFailure(status, code, stage);
      return errorResponse(requestId, status, code, message, headers);
    };
    let principal: EvaluationPrincipal | null;

    try {
      principal = await authenticate();
    } catch {
      return fail(
        503,
        "authentication_unavailable",
        "Authentication is temporarily unavailable.",
        "authentication",
      );
    }

    if (!principal) {
      return fail(
        401,
        "authentication_required",
        "Sign in before submitting an answer.",
        "authentication",
      );
    }

    const mediaType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
    if (mediaType !== "application/json") {
      return fail(
        415,
        "json_required",
        "Send the evaluation request as JSON.",
        "request",
      );
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength !== null) {
      const declaredBytes = Number(contentLength);
      if (!Number.isSafeInteger(declaredBytes) || declaredBytes < 0) {
        return fail(400, "invalid_request", "The request is not valid.", "request");
      }
      if (declaredBytes > EVALUATION_BODY_MAX_BYTES) {
        return fail(413, "request_too_large", "The answer is too long.", "request");
      }
    }

    let rawBody: string;
    try {
      rawBody = await readBoundedBody(request);
    } catch (error) {
      if (error instanceof BodyTooLargeError) {
        return fail(413, "request_too_large", "The answer is too long.", "request");
      }
      return fail(400, "invalid_request", "The request is not valid.", "request");
    }

    let untrustedBody: unknown;
    try {
      untrustedBody = JSON.parse(rawBody) as unknown;
    } catch {
      return fail(400, "invalid_request", "The request is not valid.", "request");
    }

    const parsed = EvaluationRequestSchema.safeParse(untrustedBody);
    if (!parsed.success) {
      return fail(400, "invalid_request", "The request is not valid.", "request");
    }

    if (parsed.data.sourceType !== "lesson" || parsed.data.modality !== "translate") {
      return fail(
        422,
        "unsupported_evaluation",
        "That evaluation type is not available yet.",
        "request",
      );
    }

    const userKey = trackingId(principal.userId);
    const requestFingerprint = createHash("sha256")
      .update(JSON.stringify(parsed.data))
      .digest("hex");

    let perimeterAdmission;
    try {
      perimeterAdmission = await admitAtPerimeter(userKey, request.headers);
    } catch {
      perimeterAdmission = {
        allowed: false as const,
        kind: "unavailable" as const,
        failure: "sdk-error" as const,
      };
    }
    if (!perimeterAdmission.allowed) {
      if (perimeterAdmission.kind === "rate-limited") {
        return fail(
          429,
          "evaluation_rate_limited",
          "Too many evaluation requests. Try again shortly.",
          "admission",
          { "Retry-After": String(perimeterAdmission.retryAfterSeconds) },
        );
      }
      recordFailure(503, `firewall_${perimeterAdmission.failure}`, "admission");
      return json(
        {
          requestId,
          status: "ungraded",
          retryable: true,
          reason: "evaluation_temporarily_unavailable",
        },
        503,
        { "Retry-After": String(EVALUATION_FIREWALL_RETRY_AFTER_SECONDS) },
      );
    }

    const admission = admit(userKey, requestFingerprint);
    if (!admission.allowed) {
      return fail(
        429,
        "evaluation_rate_limited",
        "Too many evaluation requests. Try again shortly.",
        "admission",
        {
          "Retry-After": String(admission.retryAfterSeconds),
        },
      );
    }

    try {
      let source: ResolvedLessonSource;
      try {
        source = await resolveSource(parsed.data.itemRef, parsed.data.direction);
      } catch (error) {
        if (error instanceof EvaluationSourceNotFoundError) {
          return fail(
            404,
            "source_not_found",
            "That practice item is not available.",
            "source",
          );
        }
        if (error instanceof EvaluationSourceIntegrityError) {
          return fail(
            503,
            "source_unavailable",
            "That practice item cannot be graded right now.",
            "source",
          );
        }
        return fail(
          503,
          "evaluation_unavailable",
          "Evaluation is temporarily unavailable.",
          "source",
        );
      }

      const serviceRequest: EvaluationServiceRequest = {
        requestId,
        request: parsed.data,
        source,
        userTrackingId: userKey,
        signal: request.signal,
      };
      const outcome: EvaluationServiceOutcome = await service.evaluate(serviceRequest);

      if (outcome.kind === "invalid") {
        return fail(400, "invalid_request", "The request is not valid.", "service");
      }
      if (outcome.kind === "ungraded") {
        recordFailure(
          outcome.failure === "rate-limit" ? 429 : 503,
          `ai_${outcome.failure}`,
          "service",
        );
        return ungradedResponse(requestId, outcome);
      }

      return json({ requestId, ...outcome.result }, 200);
    } catch {
      return fail(
        503,
        "evaluation_unavailable",
        "Evaluation is temporarily unavailable.",
        "service",
      );
    } finally {
      admission.release();
    }

  };
}
