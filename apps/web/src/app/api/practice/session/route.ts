import { auth } from "@clerk/nextjs/server";
import { DialectProfile } from "@aidioma/lesson-schema";

import { isClerkConfigured } from "@/lib/auth/config";
import { DatabasePracticeSessionRepository } from "@/lib/practice-serving/database-session-repository";
import {
  PracticeSessionActionSchema,
  PracticeSessionResponseSchema,
  type PracticeSessionView,
} from "@/lib/practice-serving/session-api-contract";
import { ProductionPracticeSessionEvaluator } from "@/lib/practice-serving/session-evaluator";
import {
  PracticeSessionService,
  type PracticeSessionCommandResult,
  type RetainedAdaptiveSession,
} from "@/lib/practice-serving/session-service";

export const runtime = "nodejs";

function json(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function learnerId(): Promise<string | null> {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.AIDIOMA_ENABLE_LOCAL_PRACTICE_SESSION === "true"
  ) {
    return "local-practice-learner";
  }
  if (!isClerkConfigured()) {
    return null;
  }
  const session = await auth();
  return session.userId;
}

function learnerProfile() {
  const configured = DialectProfile.safeParse(process.env.AIDIOMA_DEFAULT_DIALECT_PROFILE);
  return configured.success ? configured.data : ("es-AR" as const);
}

function view(record: RetainedAdaptiveSession): PracticeSessionView {
  const currentItem = record.session.items.find(
    (item) => item.itemId === record.session.currentOffer.itemId,
  );
  if (!currentItem) throw new Error("The current promoted item is unavailable.");
  return {
    attempts: record.session.attempts.map((attempt) => {
      const item = record.session.items.find((candidate) => candidate.itemId === attempt.itemId);
      if (!item) throw new Error("Retained practice evidence references unavailable content.");
      return {
        answer: attempt.answer,
        attemptedAt: attempt.attemptedAt,
        evalSource: attempt.evalSource,
        feedback: attempt.feedback,
        itemId: attempt.itemId,
        prompt: item.prompt,
        score: attempt.score,
        target: attempt.correction?.text ?? item.target,
        verdict: attempt.verdict,
        ...(attempt.correction ? { correction: attempt.correction } : {}),
      };
    }),
    current: {
      cefr: currentItem.cefr,
      cue: currentItem.cue,
      itemId: currentItem.itemId,
      ordinal: record.session.currentOffer.ordinal,
      prompt: currentItem.prompt,
      reason: record.session.currentOffer.reason,
    },
    profile: record.session.profile,
    revision: record.revision,
    sessionId: record.session.sessionId,
    source: record.session.source,
    status: record.status,
  };
}

function service() {
  return new PracticeSessionService(
    new DatabasePracticeSessionRepository(),
    new ProductionPracticeSessionEvaluator(),
  );
}

function unavailable(error: unknown): Response {
  console.error("Practice session command failed.", error);
  return json({ error: "practice_unavailable", message: "Practice is temporarily unavailable." }, 503);
}

function commandFailure(result: Extract<PracticeSessionCommandResult<unknown>, { ok: false }>): Response {
  const status = result.failure === "answer_ungraded" ? 503 : 409;
  return json(
    {
      error: result.failure,
      message: result.message,
      ...(result.retryable === undefined ? {} : { retryable: result.retryable }),
    },
    status,
  );
}

async function responseFor(
  practice: PracticeSessionService,
  userId: string,
  record: RetainedAdaptiveSession | null,
  evaluation?: unknown,
): Promise<Response> {
  return json(
    PracticeSessionResponseSchema.parse({
      availableCollectionIds: await practice.unlockedCollectionIds(userId),
      ...(evaluation ? { evaluation } : {}),
      savedItemIds: await practice.savedItemIds(userId),
      session: record ? view(record) : null,
    }),
    200,
  );
}

export async function GET(): Promise<Response> {
  const userId = await learnerId();
  if (!userId) return json({ error: "authentication_required", message: "Sign in to practice." }, 401);
  try {
    const practice = service();
    const result = await practice.current(userId);
    if (!result.ok) return commandFailure(result);
    return responseFor(practice, userId, result.value);
  } catch (error) {
    return unavailable(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  const userId = await learnerId();
  if (!userId) return json({ error: "authentication_required", message: "Sign in to practice." }, 401);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_request", message: "The practice request is not valid." }, 400);
  }
  const parsed = PracticeSessionActionSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "invalid_request", message: "The practice request is not valid." }, 400);
  }

  try {
    const practice = service();
    if (parsed.data.action === "start") {
      const result = await practice.start({
        learnerId: userId,
        profile: learnerProfile(),
        ...(parsed.data.sourceId ? { sourceId: parsed.data.sourceId } : {}),
        sourceKind: parsed.data.sourceKind,
      });
      if (!result.ok) return commandFailure(result);
      return responseFor(practice, userId, result.value);
    }
    if (parsed.data.action === "answer") {
      const result = await practice.answer({
        answer: parsed.data.answer,
        learnerId: userId,
        offerOrdinal: parsed.data.offerOrdinal,
        sessionId: parsed.data.sessionId,
        signal: request.signal,
      });
      if (!result.ok) {
        return commandFailure(result);
      }
      return responseFor(practice, userId, result.value.record, result.value.evaluation);
    }
    if (parsed.data.action === "save") {
      const result = await practice.setSaved({
        itemId: parsed.data.itemId,
        learnerId: userId,
        saved: parsed.data.saved,
        sessionId: parsed.data.sessionId,
      });
      if (!result.ok) return commandFailure(result);
      const current = await practice.current(userId);
      if (!current.ok) return commandFailure(current);
      return responseFor(practice, userId, current.value);
    }
    const status = parsed.data.action === "pause"
      ? "paused"
      : parsed.data.action === "resume"
        ? "active"
        : "ended";
    const result = await practice.changeStatus({
      learnerId: userId,
      sessionId: parsed.data.sessionId,
      status,
    });
    if (!result.ok) return commandFailure(result);
    return responseFor(practice, userId, status === "ended" ? null : result.value);
  } catch (error) {
    return unavailable(error);
  }
}
