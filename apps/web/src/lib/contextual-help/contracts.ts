import { z } from "zod";

export const CONTEXTUAL_HELP_QUESTION_MAX_LENGTH = 500;
export const CONTEXTUAL_HELP_MESSAGE_MAX_LENGTH = 500;
export const CONTEXTUAL_HELP_MESSAGE_MAX_WORDS = 60;
export const CONTEXTUAL_HELP_MAX_CONTEXT_CHARACTERS = 8_000;

const BoundedIdentitySchema = z.string().trim().min(1).max(200);
const BoundedContentSchema = z.string().trim().min(1).max(1_000);

export const ContextualHelpPayloadSchema = z
  .object({
    question: z
      .string()
      .max(CONTEXTUAL_HELP_QUESTION_MAX_LENGTH)
      .refine((value) => value.trim().length > 0, "question must not be blank"),
    promotedSource: z
      .object({
        id: BoundedIdentitySchema,
        version: z.union([
          z.string().trim().min(1).max(100),
          z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
        ]),
      })
      .strict(),
    objective: BoundedContentSchema,
    currentItem: z
      .object({
        id: BoundedIdentitySchema,
        prompt: BoundedContentSchema,
        target: z.string().trim().min(1).max(500),
        acceptedAnswers: z.array(z.string().trim().min(1).max(500)).max(12),
        authoredHints: z.array(z.string().trim().min(1).max(500)).max(6),
      })
      .strict(),
    learnerLevel: z.enum(["A1", "A2", "B1", "B2", "C1"]),
    spanishProfile: z.enum(["es-AR", "es-419", "es-ES"]),
    latestAttempt: z
      .object({
        answer: z.string().trim().min(1).max(500),
        feedback: z.string().trim().min(1).max(1_000).optional(),
        verdict: z.enum(["correct", "close", "wrong"]).optional(),
      })
      .strict()
      .optional(),
    mayRevealAnswer: z.boolean(),
    userTrackingId: z.string(),
  })
  .strict()
  .superRefine((value, context) => {
    if (JSON.stringify(value).length > CONTEXTUAL_HELP_MAX_CONTEXT_CHARACTERS) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "context exceeds the bounded request size",
      });
    }
  });

export const ContextualHelpResponseKindSchema = z.enum([
  "ai-explanation",
  "topic-redirect",
]);

export const ContextualHelpStructuredOutputSchema = z
  .object({
    kind: ContextualHelpResponseKindSchema,
    message: z
      .string()
      .trim()
      .min(1)
      .max(CONTEXTUAL_HELP_MESSAGE_MAX_LENGTH)
      .refine(
        (value) => value.split(/\s+/u).filter(Boolean).length <= CONTEXTUAL_HELP_MESSAGE_MAX_WORDS,
        `message must contain no more than ${CONTEXTUAL_HELP_MESSAGE_MAX_WORDS} words`,
      ),
  })
  .strict();

export type ContextualHelpPayload = z.infer<typeof ContextualHelpPayloadSchema>;
export type ContextualHelpResponseKind = z.infer<typeof ContextualHelpResponseKindSchema>;
export type ContextualHelpStructuredOutput = z.infer<
  typeof ContextualHelpStructuredOutputSchema
>;

export type ContextualHelpRequest = ContextualHelpPayload & {
  signal?: AbortSignal;
};

export type ContextualHelpGeneration =
  | {
      kind: ContextualHelpResponseKind;
      message: string;
    }
  | {
      kind: "unavailable";
      retryable: boolean;
    };

export interface ContextualHelpProvider {
  ask(request: ContextualHelpRequest): Promise<ContextualHelpGeneration>;
}
