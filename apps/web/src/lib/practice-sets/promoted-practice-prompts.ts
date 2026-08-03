import { hash as sha256 } from "fast-sha256";
import { z } from "zod";

import { PracticePromptSchema, type PracticePrompt } from "./practice-prompt-contract";

const SafeIdSchema = z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);
const HashSchema = z.string().regex(/^[a-f0-9]{64}$/u);

const EmptyPromotedPracticePromptsSchema = z
  .object({
    schemaVersion: z.literal(1),
    state: z.literal("placeholder"),
    prototypeOnly: z.literal(true),
    collectionId: SafeIdSchema,
    prompts: z.array(PracticePromptSchema).length(0),
  })
  .strict();

const PopulatedPromotedPracticePromptsSchema = z
  .object({
    schemaVersion: z.literal(1),
    state: z.literal("promoted"),
    prototypeOnly: z.literal(true),
    collectionId: SafeIdSchema,
    sourceRunId: SafeIdSchema,
    sourceCandidateHash: HashSchema,
    reviewedContentHash: HashSchema,
    promotedContentHash: HashSchema,
    prompts: z.array(PracticePromptSchema).min(1).max(100),
  })
  .strict();

type PopulatedPromotedPracticePrompts = z.infer<typeof PopulatedPromotedPracticePromptsSchema>;
type PromotionContentPayload = Omit<PopulatedPromotedPracticePrompts, "promotedContentHash">;

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Browser-safe hash of every promoted field except the embedded hash itself. */
export function promotionContentHash(
  artifact: PromotionContentPayload | PopulatedPromotedPracticePrompts,
): string {
  const payload = { ...artifact } as Record<string, unknown>;
  delete payload.promotedContentHash;
  return bytesToHex(sha256(new TextEncoder().encode(stableJson(payload))));
}

export const PromotedPrototypePromptsSchema = z
  .discriminatedUnion("state", [
    EmptyPromotedPracticePromptsSchema,
    PopulatedPromotedPracticePromptsSchema,
  ])
  .superRefine((artifact, context) => {
    const ids = artifact.prompts.map((prompt) => prompt.id);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "promoted prompt IDs must be unique" });
    }
    if (artifact.state === "promoted") {
      const { promotedContentHash, ...payload } = artifact;
      if (promotedContentHash !== promotionContentHash(payload)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "promoted content hash does not match the embedded review binding",
          path: ["promotedContentHash"],
        });
      }
    }
  });

export type PromotedPrototypePrompts = z.infer<typeof PromotedPrototypePromptsSchema>;

export function loadPromotedPrototypePrompts(value: unknown): PromotedPrototypePrompts {
  return PromotedPrototypePromptsSchema.parse(value);
}

export function assertReplaceablePromotionPlaceholder(
  value: unknown,
  collectionId: string,
) {
  const artifact = loadPromotedPrototypePrompts(value);
  if (
    artifact.state !== "placeholder" ||
    artifact.collectionId !== collectionId ||
    artifact.prompts.length !== 0
  ) {
    throw new Error("promotion target is not the known empty collection placeholder");
  }
  return artifact;
}

export function mergePromotedPracticePrompts(
  existing: readonly PracticePrompt[],
  artifact: PromotedPrototypePrompts,
  targetTotal?: number,
): PracticePrompt[] {
  const prompts = [...existing, ...artifact.prompts];
  if (new Set(prompts.map((prompt) => prompt.id)).size !== prompts.length) {
    throw new Error("combined prototype prompt IDs must be unique");
  }
  if (artifact.state === "promoted" && targetTotal !== undefined && prompts.length !== targetTotal) {
    throw new Error(`promoted collection must contain ${targetTotal} prompts`);
  }
  return prompts;
}
