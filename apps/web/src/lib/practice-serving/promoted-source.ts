import { DialectContentUnit, DialectProfile, DialectPromotionReceipt, PromotedLessonPlacement } from "@aidioma/lesson-schema";
import { hash as sha256 } from "fast-sha256";

import promotionJson from "../../../../../content/promotions/promotion.unit-a1-you-live-here.v1.json";
import placementJson from "../../../../../content/placements/placement.a1.you-live-here.json";
import unitJson from "../../../../../content/units/a1/unit.a1.you-live-here.json";

export const DEFAULT_PROMOTED_COLLECTION_ID = "collection.a1.everyday-location" as const;

export type PromotedPracticeItem = {
  acceptedAnswers: string[];
  cefr: string;
  conceptIds: string[];
  contentVersion: number;
  cue: string;
  itemId: string;
  meaningId: string;
  profile: DialectProfile;
  prompt: string;
  promotionReceiptId: string;
  target: string;
  topicIds: string[];
};

export type PromotedPracticeSourceResult =
  | {
      status: "ready";
      items: PromotedPracticeItem[];
      source: {
        id: string;
        kind: "collection";
        title: string;
        version: string;
      };
    }
  | {
      status: "unavailable";
      reason: "promotion_integrity_failed";
    };

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function promotedContentDigest(value: unknown): string {
  const bytes = new TextEncoder().encode(canonicalJson(value));
  return `sha256:${bytesToHex(sha256(bytes))}`;
}

/**
 * Loads learner-visible material only when the structured unit and its promotion receipt still
 * describe the exact same reviewed version. Drafts and partially reviewed artifacts have no
 * fallback path into Practice.
 */
export function resolvePromotedPracticeSource(
  profile: DialectProfile,
  rawUnit: unknown = unitJson,
  rawPromotion: unknown = promotionJson,
): PromotedPracticeSourceResult {
  const parsedProfile = DialectProfile.safeParse(profile);
  const parsedUnit = DialectContentUnit.safeParse(rawUnit);
  const parsedPromotion = DialectPromotionReceipt.safeParse(rawPromotion);
  if (!parsedProfile.success || !parsedUnit.success || !parsedPromotion.success) {
    return { status: "unavailable", reason: "promotion_integrity_failed" };
  }

  const unit = parsedUnit.data;
  const promotion = parsedPromotion.data;
  const conceptIds = unit.concepts.map((concept) => concept.id);
  if (
    promotion.status !== "promoted" ||
    promotion.unitId !== unit.id ||
    promotion.contentVersion !== unit.contentVersion ||
    promotion.meaningId !== unit.meaning.id ||
    promotion.contentDigest !== promotedContentDigest(rawUnit) ||
    promotion.conceptIds.length !== conceptIds.length ||
    promotion.conceptIds.some((conceptId, index) => conceptId !== conceptIds[index]) ||
    !promotion.requiredProfiles.includes(parsedProfile.data)
  ) {
    return { status: "unavailable", reason: "promotion_integrity_failed" };
  }

  const rendering = unit.renderings[parsedProfile.data];
  return {
    status: "ready",
    source: {
      id: DEFAULT_PROMOTED_COLLECTION_ID,
      kind: "collection",
      title: "Everyday location",
      version: `${unit.id}@${unit.contentVersion}`,
    },
    items: [
      {
        acceptedAnswers: [
          rendering.text,
          ...rendering.acceptedAnswers.map((answer) => answer.text),
        ],
        cefr: unit.cefr,
        conceptIds,
        contentVersion: unit.contentVersion,
        cue: "Translate into Spanish.",
        itemId: unit.id,
        meaningId: unit.meaning.id,
        profile: parsedProfile.data,
        prompt: unit.meaning.source.text,
        promotionReceiptId: promotion.receiptId,
        target: rendering.text,
        topicIds: unit.topicalTags,
      },
    ],
  };
}

export function resolvePromotedPracticeCollection(
  profile: DialectProfile,
  collectionId?: string,
  rawPlacement: unknown = placementJson,
): PromotedPracticeSourceResult {
  const base = resolvePromotedPracticeSource(profile);
  if (base.status !== "ready" || !collectionId || collectionId === base.source.id) return base;
  const placement = PromotedLessonPlacement.safeParse(rawPlacement);
  if (!placement.success) return { status: "unavailable", reason: "promotion_integrity_failed" };
  const placementData = placement.data;
  const collection = placementData.collections.find((candidate) => candidate.id === collectionId);
  const item = base.items[0];
  const collectionContainsItem = collection?.kind === "concept"
    ? item.conceptIds.includes(collection.referenceId)
    : collection?.kind === "topic"
      ? item.topicIds.includes(collection.referenceId)
      : false;
  if (
    !collection ||
    !collectionContainsItem ||
    placementData.source.unitId !== item.itemId ||
    placementData.source.contentVersion !== item.contentVersion ||
    placementData.source.promotionReceiptId !== item.promotionReceiptId ||
    placementData.cefr !== item.cefr
  ) {
    return { status: "unavailable", reason: "promotion_integrity_failed" };
  }
  return {
    ...base,
    source: {
      ...base.source,
      id: collection.id,
      title: collection.title,
      version: `${base.source.version}:${placementData.id}@${placementData.contentVersion}`,
    },
  };
}
