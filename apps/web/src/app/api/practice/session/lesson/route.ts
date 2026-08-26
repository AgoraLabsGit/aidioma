import { auth } from "@clerk/nextjs/server";
import { DialectProfile } from "@aidioma/lesson-schema";

import { isClerkConfigured } from "@/lib/auth/config";
import { ProductionLessonContextualAnswerer } from "@/lib/learning-journey/contextual-answerer";
import {
  LessonJourneyActionSchema,
  LessonJourneyResponseSchema,
  type LessonJourneyView,
} from "@/lib/learning-journey/lesson-api-contract";
import { lessonRecommendation } from "@/lib/learning-journey/lesson-session";
import { DatabaseLessonProgressRepository } from "@/lib/learning-journey/lesson-repository";
import { LessonJourneyService } from "@/lib/learning-journey/lesson-service";
import { resolvePromotedLesson } from "@/lib/learning-journey/promoted-lesson";
import { ProductionPracticeSessionEvaluator } from "@/lib/practice-serving/session-evaluator";
import type { RetainedLessonProgress } from "@/lib/learning-journey/lesson-repository";

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
  if (!isClerkConfigured()) return null;
  return (await auth()).userId;
}

function learnerProfile() {
  const configured = DialectProfile.safeParse(process.env.AIDIOMA_DEFAULT_DIALECT_PROFILE);
  return configured.success ? configured.data : ("es-AR" as const);
}

function service() {
  return new LessonJourneyService(
    new DatabaseLessonProgressRepository(),
    new ProductionPracticeSessionEvaluator(),
    new ProductionLessonContextualAnswerer(),
  );
}

function view(record: RetainedLessonProgress): LessonJourneyView {
  const resolved = resolvePromotedLesson(record.checkpoint.profile);
  if (
    resolved.status !== "ready" ||
    resolved.lesson.id !== record.checkpoint.lessonId ||
    resolved.lesson.contentVersion !== record.checkpoint.contentVersion
  ) {
    throw new Error("Promoted lesson content is unavailable.");
  }
  const lesson = resolved.lesson;
  const complete = record.checkpoint.position === "complete";
  return {
    attempts: record.checkpoint.attempts.map((attempt) => ({
      answer: attempt.answer,
      assisted: attempt.assisted,
      attemptedAt: attempt.attemptedAt,
      feedback: attempt.feedback,
      score: attempt.score,
      target: attempt.correction?.text ?? lesson.item.target,
      verdict: attempt.verdict,
      ...(attempt.correction ? { correction: attempt.correction } : {}),
    })),
    availableCollections: complete
      ? lesson.collections.map((collection) => ({
          description: collection.description,
          id: collection.id,
          kind: collection.kind,
          title: collection.title,
        }))
      : [],
    cefr: lesson.cefr,
    current: {
      cue: lesson.item.cue,
      itemId: lesson.item.itemId,
      prompt: lesson.item.prompt,
    },
    exchanges: record.checkpoint.exchanges.map((exchange) => ({ ...exchange })),
    hints: lesson.hints.slice(0, record.checkpoint.revealedHints),
    objective: lesson.objective,
    position: record.checkpoint.position,
    profile: lesson.profile,
    recommendation: complete ? lessonRecommendation(lesson, record.checkpoint) : null,
    revision: record.revision,
    sessionId: record.checkpoint.sessionId,
    teaching: { ...lesson.teaching },
    title: lesson.title,
  };
}

async function response(record: RetainedLessonProgress | null): Promise<Response> {
  return json(
    LessonJourneyResponseSchema.parse({ lesson: record ? view(record) : null }),
    200,
  );
}

function unavailable(): Response {
  console.error("Lesson journey command failed.");
  return json(
    { error: "lesson_unavailable", message: "The lesson is temporarily unavailable." },
    503,
  );
}

function journeyError(result: {
  failure: string;
  message: string;
  retryable?: boolean;
}): Response {
  const status = result.failure === "answer_ungraded" || result.failure === "contextual_help_unavailable" || result.failure === "lesson_unavailable"
    ? 503
    : result.failure === "question_rate_limited"
      ? 429
      : 409;
  return json(
    {
      error: result.failure,
      message: result.message,
      ...(result.retryable === undefined ? {} : { retryable: result.retryable }),
    },
    status,
  );
}

export async function GET(): Promise<Response> {
  const userId = await learnerId();
  if (!userId) return json({ error: "authentication_required", message: "Sign in to learn." }, 401);
  try {
    const result = await service().current(userId);
    return result.ok ? response(result.value) : journeyError(result);
  } catch {
    return unavailable();
  }
}

export async function POST(request: Request): Promise<Response> {
  const userId = await learnerId();
  if (!userId) return json({ error: "authentication_required", message: "Sign in to learn." }, 401);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_request", message: "The lesson request is not valid." }, 400);
  }
  const parsed = LessonJourneyActionSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "invalid_request", message: "The lesson request is not valid." }, 400);
  }

  try {
    const journey = service();
    const input = parsed.data;
    const result = input.action === "lesson-start"
      ? await journey.start({ learnerId: userId, profile: learnerProfile() })
      : input.action === "lesson-continue"
        ? await journey.continue({ ...input, learnerId: userId })
        : input.action === "lesson-hint"
          ? await journey.hint({ ...input, learnerId: userId })
          : input.action === "lesson-question"
            ? await journey.question({ ...input, learnerId: userId, signal: request.signal })
            : await journey.answer({ ...input, learnerId: userId, signal: request.signal });
    if (!result.ok) {
      return journeyError(result);
    }
    return response(result.value);
  } catch {
    return unavailable();
  }
}
