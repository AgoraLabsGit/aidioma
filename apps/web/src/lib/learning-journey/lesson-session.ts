import { z } from "zod";

import { CorrectionPresentationSchema } from "@/lib/evaluation/contracts";
import type { PracticeGradedEvaluation } from "@/lib/practice-sets/evaluation-contract";

import type { PromotedLesson } from "./promoted-lesson";

export const LESSON_SESSION_VERSION = 1 as const;
export const LESSON_CONTEXTUAL_EXCHANGE_LIMIT = 24 as const;

export type ContextualExchange = {
  answer: string;
  answeredAt: string;
  kind: "ai-explanation" | "authored-hint" | "topic-redirect";
  question: string;
  requestId: string;
};

export type LessonAttempt = {
  answer: string;
  assisted: boolean;
  attemptedAt: string;
  correction?: Extract<PracticeGradedEvaluation, { verdict: "close" | "wrong" }>["correction"];
  evalSource: PracticeGradedEvaluation["evalSource"];
  feedback: string;
  score: number;
  verdict: PracticeGradedEvaluation["verdict"];
};

export type LessonCheckpoint = {
  assistedCurrentAttempt: boolean;
  attempts: LessonAttempt[];
  completedAt: string | null;
  contentVersion: number;
  exchanges: ContextualExchange[];
  lessonId: string;
  position: "teaching" | "check" | "complete";
  profile: PromotedLesson["profile"];
  revealedHints: number;
  sessionId: string;
  version: typeof LESSON_SESSION_VERSION;
};

const ContextualExchangeSchema = z.object({
  answer: z.string().min(1).max(1_200),
  answeredAt: z.string().datetime({ offset: true }),
  kind: z.enum(["ai-explanation", "authored-hint", "topic-redirect"]),
  question: z.string().min(1).max(500),
  requestId: z.string().min(1).max(200),
}).strict();

const LessonAttemptSchema = z.object({
  answer: z.string().min(1).max(1_000),
  assisted: z.boolean(),
  attemptedAt: z.string().datetime({ offset: true }),
  correction: CorrectionPresentationSchema.optional(),
  evalSource: z.enum(["comparison", "ai"]),
  feedback: z.string().min(1).max(800),
  score: z.number().int().min(10).max(100),
  verdict: z.enum(["correct", "close", "wrong"]),
}).strict();

export const LessonCheckpointSchema = z.object({
  assistedCurrentAttempt: z.boolean(),
  attempts: z.array(LessonAttemptSchema),
  completedAt: z.string().datetime({ offset: true }).nullable(),
  contentVersion: z.number().int().positive(),
  exchanges: z.array(ContextualExchangeSchema).max(LESSON_CONTEXTUAL_EXCHANGE_LIMIT),
  lessonId: z.string().min(1),
  position: z.enum(["teaching", "check", "complete"]),
  profile: z.enum(["es-AR", "es-419", "es-ES"]),
  revealedHints: z.number().int().min(0).max(3),
  sessionId: z.string().min(1),
  version: z.literal(LESSON_SESSION_VERSION),
}).strict();

export function startLessonCheckpoint(input: {
  lesson: PromotedLesson;
  sessionId: string;
}): LessonCheckpoint {
  return {
    assistedCurrentAttempt: false,
    attempts: [],
    completedAt: null,
    contentVersion: input.lesson.contentVersion,
    exchanges: [],
    lessonId: input.lesson.id,
    position: "teaching",
    profile: input.lesson.profile,
    revealedHints: 0,
    sessionId: input.sessionId,
    version: LESSON_SESSION_VERSION,
  };
}

export function continueToCheck(checkpoint: LessonCheckpoint): LessonCheckpoint {
  const parsed = LessonCheckpointSchema.parse(checkpoint);
  if (parsed.position !== "teaching") return parsed;
  return { ...parsed, position: "check" };
}

export function revealNextHint(checkpoint: LessonCheckpoint): LessonCheckpoint {
  const parsed = LessonCheckpointSchema.parse(checkpoint);
  if (parsed.position !== "check" || parsed.revealedHints >= 3) return parsed;
  return {
    ...parsed,
    assistedCurrentAttempt: true,
    revealedHints: parsed.revealedHints + 1,
  };
}

export function appendContextualExchange(
  checkpoint: LessonCheckpoint,
  exchange: ContextualExchange,
): LessonCheckpoint {
  const parsed = LessonCheckpointSchema.parse(checkpoint);
  if (parsed.position === "complete") return parsed;
  if (parsed.exchanges.some((existing) => existing.requestId === exchange.requestId)) return parsed;
  return LessonCheckpointSchema.parse({
    ...parsed,
    assistedCurrentAttempt: true,
    exchanges: [...parsed.exchanges, exchange],
  });
}

export function applyLessonEvaluation(
  checkpoint: LessonCheckpoint,
  answer: string,
  evaluation: PracticeGradedEvaluation,
  attemptedAt: string,
): LessonCheckpoint {
  const parsed = LessonCheckpointSchema.parse(checkpoint);
  if (parsed.position !== "check") throw new Error("The lesson check is not active.");
  const attempt: LessonAttempt = {
    answer: answer.trim(),
    assisted: parsed.assistedCurrentAttempt,
    attemptedAt,
    evalSource: evaluation.evalSource,
    feedback: evaluation.feedback,
    score: evaluation.score,
    verdict: evaluation.verdict,
    ...(evaluation.verdict !== "correct" ? { correction: evaluation.correction } : {}),
  };
  const completed = evaluation.verdict === "correct";
  return {
    ...parsed,
    assistedCurrentAttempt: false,
    attempts: [...parsed.attempts, attempt],
    completedAt: completed ? attemptedAt : null,
    position: completed ? "complete" : "check",
  };
}

export function lessonRecommendation(lesson: PromotedLesson, checkpoint: LessonCheckpoint) {
  const hadMiss = checkpoint.attempts.some((attempt) => attempt.verdict !== "correct");
  const preferredKind = hadMiss ? "concept" : "topic";
  const collection =
    lesson.collections.find((candidate) => candidate.kind === preferredKind) ?? lesson.collections[0];
  return {
    collectionId: collection.id,
    title: collection.title,
    reason: hadMiss
      ? "Recommended because this form needed a correction in your lesson."
      : "Recommended to strengthen the language you just completed.",
  };
}
