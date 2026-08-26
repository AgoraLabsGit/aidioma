import { z } from "zod";

import { CorrectionPresentationSchema } from "@/lib/evaluation/contracts";
import { PracticeEvaluationResponseSchema } from "@/lib/practice-sets/evaluation-contract";

export const PracticeSessionActionSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("start"),
      sourceKind: z.enum(["collection", "saved"]),
      sourceId: z.string().min(1).max(200).optional(),
    })
    .strict(),
  z
    .object({
      action: z.literal("answer"),
      answer: z.string().max(1_000).refine((value) => value.trim().length > 0),
      offerOrdinal: z.number().int().positive(),
      sessionId: z.string().min(1).max(200),
    })
    .strict(),
  z
    .object({
      action: z.enum(["pause", "resume", "end"]),
      sessionId: z.string().min(1).max(200),
    })
    .strict(),
  z
    .object({
      action: z.literal("save"),
      itemId: z.string().min(1).max(200),
      saved: z.boolean(),
      sessionId: z.string().min(1).max(200),
    })
    .strict(),
]);

const PracticeSessionViewSchema = z
  .object({
    attempts: z.array(
      z
        .object({
          answer: z.string(),
          attemptedAt: z.string().datetime({ offset: true }),
          evalSource: z.enum(["comparison", "ai"]),
          feedback: z.string(),
          itemId: z.string(),
          prompt: z.string(),
          score: z.number().int(),
          target: z.string(),
          verdict: z.enum(["correct", "close", "wrong"]),
          correction: CorrectionPresentationSchema.optional(),
        })
        .strict(),
    ),
    current: z
      .object({
        cefr: z.string(),
        cue: z.string(),
        itemId: z.string(),
        ordinal: z.number().int().positive(),
        prompt: z.string(),
        reason: z.enum([
          "retry_after_miss",
          "due_for_review",
          "strengthen_weak_item",
          "new_in_scope",
          "continue_review",
        ]),
      })
      .strict(),
    profile: z.enum(["es-AR", "es-419", "es-ES"]),
    revision: z.number().int().positive(),
    sessionId: z.string(),
    source: z
      .object({
        id: z.string(),
        kind: z.enum(["collection", "saved"]),
        title: z.string(),
        version: z.string(),
      })
      .strict(),
    status: z.enum(["active", "paused", "ended"]),
  })
  .strict();

export const PracticeSessionResponseSchema = z
  .object({
    availableCollectionIds: z.array(z.string()).optional(),
    evaluation: PracticeEvaluationResponseSchema.optional(),
    savedItemIds: z.array(z.string()),
    session: PracticeSessionViewSchema.nullable(),
  })
  .strict();

export const PracticeSessionErrorSchema = z
  .object({
    error: z.string(),
    message: z.string(),
    retryable: z.boolean().optional(),
  })
  .strict();

export type PracticeSessionAction = z.infer<typeof PracticeSessionActionSchema>;
export type PracticeSessionResponse = z.infer<typeof PracticeSessionResponseSchema>;
export type PracticeSessionView = z.infer<typeof PracticeSessionViewSchema>;
