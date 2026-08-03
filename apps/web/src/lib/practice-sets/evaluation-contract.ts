import { GrammarTag } from "@aidioma/lesson-schema";
import { z } from "zod";

import {
  EvaluationSourceSchema,
  EvaluationVerdictSchema,
  WordDiffEntrySchema,
} from "@/lib/evaluation/contracts";

export const PracticeEvaluationRequestSchema = z
  .object({
    direction: z.enum(["en-es", "es-en"]),
    itemRef: z.string().trim().min(1).max(200),
    userInput: z.string().max(1_000).refine((value) => value.trim().length > 0),
  })
  .strict();

export const PracticeEvaluationResponseSchema = z.union([
  z
    .object({
      status: z.literal("graded"),
      score: z.number().int().min(10).max(100),
      verdict: EvaluationVerdictSchema,
      feedback: z.string().trim().min(1).max(800),
      wordDiff: z.array(WordDiffEntrySchema).max(100).optional(),
      errorTags: z.array(GrammarTag).max(53),
      evalSource: EvaluationSourceSchema,
      modelUsed: z.string().trim().min(1).max(200).optional(),
      modelAnswer: z.string().trim().min(1).max(1_000),
    })
    .strict(),
  z
    .object({
      status: z.literal("ungraded"),
      message: z.string().trim().min(1).max(300),
      retryable: z.boolean(),
    })
    .strict(),
]);

export type PracticeEvaluationResponse = z.infer<typeof PracticeEvaluationResponseSchema>;
export type PracticeGradedEvaluation = Extract<
  PracticeEvaluationResponse,
  { status: "graded" }
>;
