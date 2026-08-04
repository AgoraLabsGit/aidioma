import { GrammarTag } from "@aidioma/lesson-schema";
import { z } from "zod";

import {
  CorrectionPresentationSchema,
  EvaluationSourceSchema,
} from "@/lib/evaluation/contracts";

export const PracticeEvaluationRequestSchema = z
  .object({
    direction: z.enum(["en-es", "es-en"]),
    itemRef: z.string().trim().min(1).max(200),
    userInput: z.string().max(1_000).refine((value) => value.trim().length > 0),
  })
  .strict();

const PracticeGradedFields = {
  status: z.literal("graded"),
  score: z.number().int().min(10).max(100),
  feedback: z.string().trim().min(1).max(800),
  errorTags: z.array(GrammarTag).max(53),
  evalSource: EvaluationSourceSchema,
  modelUsed: z.string().trim().min(1).max(200).optional(),
};

export const PracticeEvaluationResponseSchema = z.union([
  z
    .object({
      ...PracticeGradedFields,
      verdict: z.literal("correct"),
    })
    .strict(),
  z
    .object({
      ...PracticeGradedFields,
      verdict: z.enum(["close", "wrong"]),
      correction: CorrectionPresentationSchema,
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
