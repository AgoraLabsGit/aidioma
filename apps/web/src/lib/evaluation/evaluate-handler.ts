import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { EvaluationRequestSchema } from "./contracts";
import type {
  EvaluationService,
  EvaluationServiceOutcome,
  EvaluationServiceRequest,
} from "./evaluation-service";
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

type EvaluateHandlerDependencies = {
  authenticate: EvaluationAuthenticator;
  service: EvaluationServicePort;
  resolveSource?: EvaluationSourceResolver;
  requestId?: () => string;
};

class BodyTooLargeError extends Error {}

function json(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function errorResponse(
  requestId: string,
  status: number,
  code: string,
  message: string,
): Response {
  return json({ requestId, error: { code, message } }, status);
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
  requestId: createRequestId = randomUUID,
}: EvaluateHandlerDependencies): (request: Request) => Promise<Response> {
  return async function handleEvaluate(request: Request): Promise<Response> {
    const requestId = createRequestId();
    let principal: EvaluationPrincipal | null;

    try {
      principal = await authenticate();
    } catch {
      return errorResponse(
        requestId,
        503,
        "authentication_unavailable",
        "Authentication is temporarily unavailable.",
      );
    }

    if (!principal) {
      return errorResponse(
        requestId,
        401,
        "authentication_required",
        "Sign in before submitting an answer.",
      );
    }

    const mediaType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
    if (mediaType !== "application/json") {
      return errorResponse(
        requestId,
        415,
        "json_required",
        "Send the evaluation request as JSON.",
      );
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength !== null) {
      const declaredBytes = Number(contentLength);
      if (!Number.isSafeInteger(declaredBytes) || declaredBytes < 0) {
        return errorResponse(requestId, 400, "invalid_request", "The request is not valid.");
      }
      if (declaredBytes > EVALUATION_BODY_MAX_BYTES) {
        return errorResponse(requestId, 413, "request_too_large", "The answer is too long.");
      }
    }

    let rawBody: string;
    try {
      rawBody = await readBoundedBody(request);
    } catch (error) {
      if (error instanceof BodyTooLargeError) {
        return errorResponse(requestId, 413, "request_too_large", "The answer is too long.");
      }
      return errorResponse(requestId, 400, "invalid_request", "The request is not valid.");
    }

    let untrustedBody: unknown;
    try {
      untrustedBody = JSON.parse(rawBody) as unknown;
    } catch {
      return errorResponse(requestId, 400, "invalid_request", "The request is not valid.");
    }

    const parsed = EvaluationRequestSchema.safeParse(untrustedBody);
    if (!parsed.success) {
      return errorResponse(requestId, 400, "invalid_request", "The request is not valid.");
    }

    if (parsed.data.sourceType !== "lesson" || parsed.data.modality !== "translate") {
      return errorResponse(
        requestId,
        422,
        "unsupported_evaluation",
        "That evaluation type is not available yet.",
      );
    }

    let source: ResolvedLessonSource;
    try {
      source = await resolveSource(parsed.data.itemRef, parsed.data.direction);
    } catch (error) {
      if (error instanceof EvaluationSourceNotFoundError) {
        return errorResponse(
          requestId,
          404,
          "source_not_found",
          "That practice item is not available.",
        );
      }
      if (error instanceof EvaluationSourceIntegrityError) {
        return errorResponse(
          requestId,
          503,
          "source_unavailable",
          "That practice item cannot be graded right now.",
        );
      }
      return errorResponse(
        requestId,
        503,
        "evaluation_unavailable",
        "Evaluation is temporarily unavailable.",
      );
    }

    let outcome: EvaluationServiceOutcome;
    try {
      const serviceRequest: EvaluationServiceRequest = {
        requestId,
        request: parsed.data,
        source,
        userTrackingId: trackingId(principal.userId),
        signal: request.signal,
      };
      outcome = await service.evaluate(serviceRequest);
    } catch {
      return errorResponse(
        requestId,
        503,
        "evaluation_unavailable",
        "Evaluation is temporarily unavailable.",
      );
    }

    if (outcome.kind === "invalid") {
      return errorResponse(requestId, 400, "invalid_request", "The request is not valid.");
    }
    if (outcome.kind === "ungraded") {
      return ungradedResponse(requestId, outcome);
    }

    return json({ requestId, ...outcome.result }, 200);
  };
}
