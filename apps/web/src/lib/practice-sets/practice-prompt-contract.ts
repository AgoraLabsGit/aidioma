import {
  AcceptedEntry,
  GRAMMAR_TAGS,
  GrammarTag,
  Provenance,
  acceptedText,
  type AcceptedEntry as AcceptedEntryType,
} from "@aidioma/lesson-schema";
import { z } from "zod";

import { buildAcceptedAnswers } from "@/lib/evaluation/comparison";

export const PRACTICE_PROMPT_TEXT_MAX_LENGTH = 1_000;
export const PRACTICE_PROMPT_ID_MAX_LENGTH = 200;
export const PRACTICE_PROMPT_ANSWER_MAX_ENTRIES = 20;

function uniqueValues<T>(values: readonly T[], context: z.RefinementCtx, label: string) {
  if (new Set(values).size !== values.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: `${label} must be unique` });
  }
}

export const practicePromptFocuses = [
  "completed-past",
  "time-phrases",
  "spatial-language",
  "haber",
  "connectors",
] as const;

export const PracticePromptFocusSchema = z.enum(practicePromptFocuses);
export const PrototypeLearnerStageSchema = z.enum(["foundation", "intermediate"]);

function boundedAcceptedEntries(label: string) {
  return z
    .array(AcceptedEntry)
    .max(PRACTICE_PROMPT_ANSWER_MAX_ENTRIES)
    .superRefine((entries, context) => {
      entries.forEach((entry, index) => {
        const text = acceptedText(entry);
        if (text.trim().length === 0) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${label} answer must not be blank`,
            path: [index],
          });
        }
        if (text.length > PRACTICE_PROMPT_TEXT_MAX_LENGTH) {
          context.addIssue({
            code: z.ZodIssueCode.too_big,
            maximum: PRACTICE_PROMPT_TEXT_MAX_LENGTH,
            inclusive: true,
            type: "string",
            message: `${label} answer is too long`,
            path: [index],
          });
        }
      });
    });
}

export const PracticeAnswerGroupSchema = z
  .object({
    target: boundedAcceptedEntries("target"),
    communicative: boundedAcceptedEntries("communicative"),
  })
  .strict();

export const PracticePromptObjectSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1)
      .max(PRACTICE_PROMPT_ID_MAX_LENGTH)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
    level: PrototypeLearnerStageSchema,
    focus: z.array(PracticePromptFocusSchema).max(practicePromptFocuses.length),
    capability: z.string().trim().min(1).max(300),
    cue: z.string().trim().min(1).max(500),
    english: z.string().trim().min(1).max(PRACTICE_PROMPT_TEXT_MAX_LENGTH),
    spanish: z.string().trim().min(1).max(PRACTICE_PROMPT_TEXT_MAX_LENGTH),
    answers: z
      .object({
        english: PracticeAnswerGroupSchema,
        spanish: PracticeAnswerGroupSchema,
      })
      .strict(),
    /** Authored content difficulty; unrelated to guided/standard/stretch UI support. */
    difficulty: z.number().int().min(1).max(5),
    grammarTags: z.array(GrammarTag).min(1).max(GRAMMAR_TAGS.length),
    provenance: Provenance.optional(),
  })
  .strict();

export const PracticePromptSchema = PracticePromptObjectSchema
  .superRefine((prompt, context) => {
    uniqueValues(prompt.focus, context, "focus values");
    uniqueValues(prompt.grammarTags, context, "grammar tags");
  });

export type PracticePromptFocus = z.infer<typeof PracticePromptFocusSchema>;
export type PrototypeLearnerStage = z.infer<typeof PrototypeLearnerStageSchema>;
export type PracticeAnswerGroup = z.infer<typeof PracticeAnswerGroupSchema>;
export type PracticePrompt = z.infer<typeof PracticePromptSchema>;

export function acceptedPracticeAnswerTexts(
  canonical: string,
  entries: readonly AcceptedEntryType[],
  activeRegion?: string,
): string[] {
  return buildAcceptedAnswers(canonical, entries, { activeRegion });
}
