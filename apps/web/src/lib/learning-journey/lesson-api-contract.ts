import { z } from "zod";

import { CorrectionPresentationSchema } from "@/lib/evaluation/contracts";

const sessionCommand = {
  expectedRevision: z.number().int().positive(),
  sessionId: z.string().min(1).max(200),
};

export const LessonJourneyActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("lesson-start") }).strict(),
  z.object({ action: z.literal("lesson-continue"), ...sessionCommand }).strict(),
  z.object({ action: z.literal("lesson-hint"), ...sessionCommand }).strict(),
  z.object({
    action: z.literal("lesson-question"),
    ...sessionCommand,
    question: z.string().max(500).refine((value) => value.trim().length > 0),
    requestId: z.string().uuid(),
  }).strict(),
  z.object({
    action: z.literal("lesson-answer"),
    ...sessionCommand,
    answer: z.string().max(1_000).refine((value) => value.trim().length > 0),
  }).strict(),
]);

const LessonAttemptViewSchema = z.object({
  answer: z.string(),
  assisted: z.boolean(),
  attemptedAt: z.string().datetime({ offset: true }),
  correction: CorrectionPresentationSchema.optional(),
  feedback: z.string(),
  score: z.number().int(),
  target: z.string(),
  verdict: z.enum(["correct", "close", "wrong"]),
}).strict();

const ContextualExchangeViewSchema = z.object({
  answer: z.string(),
  answeredAt: z.string().datetime({ offset: true }),
  kind: z.enum(["ai-explanation", "authored-hint", "topic-redirect"]),
  question: z.string(),
  requestId: z.string(),
}).strict();

const CollectionViewSchema = z.object({
  description: z.string(),
  id: z.string(),
  kind: z.enum(["concept", "topic"]),
  title: z.string(),
}).strict();

export const LessonJourneyViewSchema = z.object({
  attempts: z.array(LessonAttemptViewSchema),
  availableCollections: z.array(CollectionViewSchema),
  cefr: z.string(),
  current: z.object({
    cue: z.string(),
    itemId: z.string(),
    prompt: z.string(),
  }).strict(),
  exchanges: z.array(ContextualExchangeViewSchema),
  hints: z.array(z.string()).max(3),
  objective: z.string(),
  position: z.enum(["teaching", "check", "complete"]),
  profile: z.enum(["es-AR", "es-419", "es-ES"]),
  recommendation: z.object({
    collectionId: z.string(),
    reason: z.string(),
    title: z.string(),
  }).strict().nullable(),
  revision: z.number().int().positive(),
  sessionId: z.string(),
  teaching: z.object({
    body: z.string(),
    example: z.string(),
    note: z.string().optional(),
    title: z.string(),
  }).strict(),
  title: z.string(),
}).strict();

export const LessonJourneyResponseSchema = z.object({
  lesson: LessonJourneyViewSchema.nullable(),
}).strict();

export const LessonJourneyErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  retryable: z.boolean().optional(),
}).strict();

export type LessonJourneyAction = z.infer<typeof LessonJourneyActionSchema>;
export type LessonJourneyResponse = z.infer<typeof LessonJourneyResponseSchema>;
export type LessonJourneyView = z.infer<typeof LessonJourneyViewSchema>;
