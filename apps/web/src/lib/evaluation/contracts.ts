import { GrammarTag } from "@aidioma/lesson-schema";
import { z } from "zod";

export const EVALUATION_INPUT_MAX_LENGTH = 1_000;
export const EVALUATION_WORD_DIFF_MAX_ENTRIES = 100;
export const EVALUATION_WORD_DIFF_TEXT_MAX_LENGTH = 200;

export const EvaluationSourceSchema = z.enum(["comparison", "ai"]);
export const EvaluationVerdictSchema = z.enum(["correct", "close", "wrong"]);
export const EvaluationDirectionSchema = z.enum(["es-en", "en-es"]);
export const EvaluationModalitySchema = z.enum([
  "translate",
  "reading",
  "conversation",
]);

export const EvaluationRequestSchema = z
  .object({
    sourceType: z.enum(["lesson", "set"]),
    itemRef: z.string().trim().min(1).max(200),
    modality: EvaluationModalitySchema,
    direction: EvaluationDirectionSchema,
    userInput: z
      .string()
      .max(EVALUATION_INPUT_MAX_LENGTH)
      .refine((value) => value.trim().length > 0, "userInput must not be blank"),
  })
  .strict();

// The browser-facing name makes the trust boundary explicit while preserving a
// shorter import for the route and service.
export const BrowserEvaluationRequestSchema = EvaluationRequestSchema;

export const WordDiffEntrySchema = z
  .object({
    text: z.string().min(1).max(EVALUATION_WORD_DIFF_TEXT_MAX_LENGTH),
    mark: z.enum(["correct", "close", "wrong", "missing", "extra"]),
    suggestion: z
      .string()
      .min(1)
      .max(EVALUATION_WORD_DIFF_TEXT_MAX_LENGTH)
      .optional(),
  })
  .strict();

const gradedFields = {
  score: z.number().int().min(10).max(100),
  verdict: EvaluationVerdictSchema,
  feedback: z.string().trim().min(1).max(800),
  wordDiff: z.array(WordDiffEntrySchema).max(EVALUATION_WORD_DIFF_MAX_ENTRIES).optional(),
  errorTags: z.array(GrammarTag).max(53),
};

function addScoreVerdictIssue(
  value: { score: number; verdict: z.infer<typeof EvaluationVerdictSchema> },
  context: z.RefinementCtx,
) {
  const coherent =
    (value.verdict === "correct" && value.score >= 85) ||
    (value.verdict === "close" && value.score >= 60 && value.score <= 84) ||
    (value.verdict === "wrong" && value.score <= 59);

  if (!coherent) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "score does not match verdict band",
      path: ["score"],
    });
  }
}

const AiWordDiffEntrySchema = z
  .object({
    text: z.string().min(1).max(EVALUATION_WORD_DIFF_TEXT_MAX_LENGTH),
    mark: z.enum(["correct", "close", "wrong", "missing", "extra"]),
    suggestion: z
      .string()
      .min(1)
      .max(EVALUATION_WORD_DIFF_TEXT_MAX_LENGTH)
      .nullable(),
  })
  .strict();

// OpenAI strict structured outputs require every property, including nested
// properties, to appear in `required`. The adapter normalizes []/null back to
// the optional learner-facing WordDiff shape after schema validation.
export const AiEvaluationResultSchema = z
  .object({
    score: gradedFields.score,
    verdict: gradedFields.verdict,
    feedback: gradedFields.feedback,
    wordDiff: z.array(AiWordDiffEntrySchema).max(EVALUATION_WORD_DIFF_MAX_ENTRIES),
    errorTags: gradedFields.errorTags,
  })
  .strict()
  .superRefine(addScoreVerdictIssue);

export const EvaluationResultSchema = z
  .object({
    ...gradedFields,
    evalSource: EvaluationSourceSchema,
    modelUsed: z.string().trim().min(1).max(200).optional(),
  })
  .strict()
  .superRefine(addScoreVerdictIssue);

export type EvaluationDirection = z.infer<typeof EvaluationDirectionSchema>;
export type EvaluationModality = z.infer<typeof EvaluationModalitySchema>;
export type EvaluationRequest = z.infer<typeof EvaluationRequestSchema>;
export type BrowserEvaluationRequest = EvaluationRequest;
export type WordDiffEntry = z.infer<typeof WordDiffEntrySchema>;
export type AiStructuredEvaluationResult = z.infer<typeof AiEvaluationResultSchema>;
export type AiEvaluationResult = Omit<EvaluationResult, "evalSource" | "modelUsed">;
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;
