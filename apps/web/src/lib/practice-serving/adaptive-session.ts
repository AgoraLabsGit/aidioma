import { z } from "zod";

import { CorrectionPresentationSchema } from "@/lib/evaluation/contracts";
import type { PracticeGradedEvaluation } from "@/lib/practice-sets/evaluation-contract";

import type { PromotedPracticeItem } from "./promoted-source";

export const ADAPTIVE_PRACTICE_POLICY_VERSION = "adaptive-production-v1" as const;
export const ADAPTIVE_PRACTICE_CHECKPOINT_VERSION = 1 as const;

export type PracticeSourceScope = {
  id: string;
  kind: "collection" | "saved";
  title: string;
  version: string;
};

export type LearnerItemEvidence = {
  confidence: number;
  dueAt: string | null;
  lastAttemptAt: string | null;
  seenCount: number;
  unresolvedMisses: number;
};

export type AdaptiveOfferReason =
  | "retry_after_miss"
  | "due_for_review"
  | "strengthen_weak_item"
  | "new_in_scope"
  | "continue_review";

export type PracticeAttemptEvidence = {
  activity: "typed-production";
  answer: string;
  attemptedAt: string;
  conceptIds: string[];
  contentVersion: number;
  correction?: Extract<PracticeGradedEvaluation, { verdict: "close" | "wrong" }>["correction"];
  evalSource: PracticeGradedEvaluation["evalSource"];
  feedback: string;
  itemId: string;
  modelUsed?: string;
  score: number;
  verdict: PracticeGradedEvaluation["verdict"];
};

export type AdaptivePracticeOffer = {
  itemId: string;
  ordinal: number;
  policyVersion: typeof ADAPTIVE_PRACTICE_POLICY_VERSION;
  reason: AdaptiveOfferReason;
};

export type AdaptivePracticeSession = {
  attempts: PracticeAttemptEvidence[];
  currentOffer: AdaptivePracticeOffer;
  evidenceByItemId: Record<string, LearnerItemEvidence>;
  items: PromotedPracticeItem[];
  lastOfferedItemId: string | null;
  nextOrdinal: number;
  policyVersion: typeof ADAPTIVE_PRACTICE_POLICY_VERSION;
  profile: PromotedPracticeItem["profile"];
  seed: string;
  sessionId: string;
  source: PracticeSourceScope;
};

const LearnerItemEvidenceSchema = z
  .object({
    confidence: z.number().min(0).max(1),
    dueAt: z.string().datetime({ offset: true }).nullable(),
    lastAttemptAt: z.string().datetime({ offset: true }).nullable(),
    seenCount: z.number().int().nonnegative(),
    unresolvedMisses: z.number().int().nonnegative(),
  })
  .strict();

const PracticeAttemptEvidenceSchema = z
  .object({
    activity: z.literal("typed-production"),
    answer: z.string().min(1).max(1_000),
    attemptedAt: z.string().datetime({ offset: true }),
    conceptIds: z.array(z.string().min(1)).min(1),
    contentVersion: z.number().int().positive(),
    evalSource: z.enum(["comparison", "ai"]),
    feedback: z.string().min(1).max(800),
    itemId: z.string().min(1),
    correction: CorrectionPresentationSchema.optional(),
    modelUsed: z.string().min(1).max(200).optional(),
    score: z.number().int().min(10).max(100),
    verdict: z.enum(["correct", "close", "wrong"]),
  })
  .strict();

const PromotedPracticeItemSchema = z
  .object({
    acceptedAnswers: z.array(z.string().min(1)).min(1),
    cefr: z.string().min(1),
    conceptIds: z.array(z.string().min(1)).min(1),
    contentVersion: z.number().int().positive(),
    cue: z.string().min(1),
    itemId: z.string().min(1),
    meaningId: z.string().min(1),
    profile: z.enum(["es-AR", "es-419", "es-ES"]),
    prompt: z.string().min(1),
    promotionReceiptId: z.string().min(1),
    target: z.string().min(1),
    topicIds: z.array(z.string().min(1)).min(1),
  })
  .strict();

export const AdaptivePracticeSessionSchema = z
  .object({
    attempts: z.array(PracticeAttemptEvidenceSchema),
    currentOffer: z
      .object({
        itemId: z.string().min(1),
        ordinal: z.number().int().positive(),
        policyVersion: z.literal(ADAPTIVE_PRACTICE_POLICY_VERSION),
        reason: z.enum([
          "retry_after_miss",
          "due_for_review",
          "strengthen_weak_item",
          "new_in_scope",
          "continue_review",
        ]),
      })
      .strict(),
    evidenceByItemId: z.record(LearnerItemEvidenceSchema),
    items: z.array(PromotedPracticeItemSchema).min(1),
    lastOfferedItemId: z.string().nullable(),
    nextOrdinal: z.number().int().positive(),
    policyVersion: z.literal(ADAPTIVE_PRACTICE_POLICY_VERSION),
    profile: z.enum(["es-AR", "es-419", "es-ES"]),
    seed: z.string().min(1),
    sessionId: z.string().min(1),
    source: z
      .object({
        id: z.string().min(1),
        kind: z.enum(["collection", "saved"]),
        title: z.string().min(1),
        version: z.string().min(1),
      })
      .strict(),
  })
  .strict();

type RankedItem = {
  item: PromotedPracticeItem;
  priority: number;
  reason: AdaptiveOfferReason;
  tieBreak: number;
};

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function emptyEvidence(): LearnerItemEvidence {
  return {
    confidence: 0,
    dueAt: null,
    lastAttemptAt: null,
    seenCount: 0,
    unresolvedMisses: 0,
  };
}

function rankItem(
  item: PromotedPracticeItem,
  evidence: LearnerItemEvidence,
  now: string,
  seed: string,
  ordinal: number,
): RankedItem {
  let priority: number;
  let reason: AdaptiveOfferReason;
  if (evidence.unresolvedMisses > 0) {
    priority = 0;
    reason = "retry_after_miss";
  } else if (evidence.dueAt !== null && evidence.dueAt <= now) {
    priority = 1;
    reason = "due_for_review";
  } else if (evidence.seenCount > 0 && evidence.confidence < 0.6) {
    priority = 2;
    reason = "strengthen_weak_item";
  } else if (evidence.seenCount === 0) {
    priority = 3;
    reason = "new_in_scope";
  } else {
    priority = 4;
    reason = "continue_review";
  }
  return {
    item,
    priority,
    reason,
    tieBreak: hash(`${ADAPTIVE_PRACTICE_POLICY_VERSION}\u001f${seed}\u001f${ordinal}\u001f${item.itemId}`),
  };
}

function nextOffer(
  items: readonly PromotedPracticeItem[],
  evidenceByItemId: Record<string, LearnerItemEvidence>,
  now: string,
  seed: string,
  ordinal: number,
  lastOfferedItemId: string | null,
): AdaptivePracticeOffer {
  const ranked = items
    .map((item) =>
      rankItem(item, evidenceByItemId[item.itemId] ?? emptyEvidence(), now, seed, ordinal),
    )
    .sort(
      (left, right) =>
        left.priority - right.priority ||
        left.tieBreak - right.tieBreak ||
        left.item.itemId.localeCompare(right.item.itemId),
    );
  const first = ranked[0];
  const choice =
    first.reason === "retry_after_miss" || first.item.itemId !== lastOfferedItemId
      ? first
      : ranked.find((candidate) => candidate.item.itemId !== lastOfferedItemId) ?? first;
  return {
    itemId: choice.item.itemId,
    ordinal,
    policyVersion: ADAPTIVE_PRACTICE_POLICY_VERSION,
    reason: choice.reason,
  };
}

export function startAdaptivePracticeSession(input: {
  evidenceByItemId?: Record<string, LearnerItemEvidence>;
  items: readonly PromotedPracticeItem[];
  now: string;
  profile: PromotedPracticeItem["profile"];
  seed: string;
  sessionId: string;
  source: PracticeSourceScope;
}): AdaptivePracticeSession {
  if (input.items.length === 0) throw new Error("Practice requires promoted items.");
  if (input.items.some((item) => item.profile !== input.profile)) {
    throw new Error("Practice items must match the active Spanish profile.");
  }
  const evidenceByItemId = Object.fromEntries(
    input.items.map((item) => [
      item.itemId,
      { ...(input.evidenceByItemId?.[item.itemId] ?? emptyEvidence()) },
    ]),
  );
  const items = input.items.map((item) => ({
    ...item,
    acceptedAnswers: [...item.acceptedAnswers],
    conceptIds: [...item.conceptIds],
    topicIds: [...item.topicIds],
  }));
  return {
    attempts: [],
    currentOffer: nextOffer(items, evidenceByItemId, input.now, input.seed, 1, null),
    evidenceByItemId,
    items,
    lastOfferedItemId: null,
    nextOrdinal: 2,
    policyVersion: ADAPTIVE_PRACTICE_POLICY_VERSION,
    profile: input.profile,
    seed: input.seed,
    sessionId: input.sessionId,
    source: { ...input.source },
  };
}

export function advanceAdaptivePracticeSession(
  checkpoint: AdaptivePracticeSession,
  offerOrdinal: number,
  answer: string,
  evaluation: PracticeGradedEvaluation,
  attemptedAt: string,
): AdaptivePracticeSession {
  const parsed = AdaptivePracticeSessionSchema.parse(checkpoint);
  if (parsed.currentOffer.ordinal !== offerOrdinal) {
    throw new Error("The practice offer changed before this answer was applied.");
  }
  const item = parsed.items.find((candidate) => candidate.itemId === parsed.currentOffer.itemId);
  if (!item) throw new Error("The promoted practice item is unavailable.");
  const previous = parsed.evidenceByItemId[item.itemId] ?? emptyEvidence();
  const successful = evaluation.verdict === "correct";
  const confidence = successful
    ? Math.min(1, previous.confidence + (previous.unresolvedMisses > 0 ? 0.35 : 0.25))
    : Math.max(0, previous.confidence - (evaluation.verdict === "wrong" ? 0.3 : 0.15));
  const dueDelayMs = Math.max(1, Math.round(1 + confidence * 6)) * 24 * 60 * 60 * 1_000;
  const nextEvidence: LearnerItemEvidence = {
    confidence,
    dueAt: successful ? new Date(Date.parse(attemptedAt) + dueDelayMs).toISOString() : attemptedAt,
    lastAttemptAt: attemptedAt,
    seenCount: previous.seenCount + 1,
    unresolvedMisses: successful ? 0 : previous.unresolvedMisses + 1,
  };
  const evidenceByItemId = {
    ...parsed.evidenceByItemId,
    [item.itemId]: nextEvidence,
  };
  const attempt: PracticeAttemptEvidence = {
    activity: "typed-production",
    answer: answer.trim(),
    attemptedAt,
    conceptIds: [...item.conceptIds],
    contentVersion: item.contentVersion,
    evalSource: evaluation.evalSource,
    feedback: evaluation.feedback,
    itemId: item.itemId,
    ...(evaluation.modelUsed ? { modelUsed: evaluation.modelUsed } : {}),
    score: evaluation.score,
    verdict: evaluation.verdict,
    ...(evaluation.verdict !== "correct" ? { correction: evaluation.correction } : {}),
  };
  return {
    ...parsed,
    attempts: [...parsed.attempts, attempt],
    currentOffer: nextOffer(
      parsed.items,
      evidenceByItemId,
      attemptedAt,
      parsed.seed,
      parsed.nextOrdinal,
      item.itemId,
    ),
    evidenceByItemId,
    lastOfferedItemId: item.itemId,
    nextOrdinal: parsed.nextOrdinal + 1,
  };
}

export function adaptiveOfferExplanation(reason: AdaptiveOfferReason): string {
  switch (reason) {
    case "retry_after_miss":
      return "Worth another try — this was your most recent miss.";
    case "due_for_review":
      return "Due now — this item is ready for review.";
    case "strengthen_weak_item":
      return "Needs strengthening — recent evidence is still uncertain.";
    case "new_in_scope":
      return "New in this collection — it moves your practice forward.";
    case "continue_review":
      return "Continuing this exact collection with reviewed material.";
  }
}
