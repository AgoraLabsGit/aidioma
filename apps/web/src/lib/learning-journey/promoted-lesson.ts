import {
  DialectContentUnit,
  DialectProfile,
  DialectPromotionReceipt,
  PromotedLessonPlacement,
  type LessonCollectionMembership,
} from "@aidioma/lesson-schema";

import placementJson from "../../../../../content/placements/placement.a1.you-live-here.json";
import promotionJson from "../../../../../content/promotions/promotion.unit-a1-you-live-here.v1.json";
import unitJson from "../../../../../content/units/a1/unit.a1.you-live-here.json";
import { promotedContentDigest, type PromotedPracticeItem } from "@/lib/practice-serving/promoted-source";

export type PromotedLesson = {
  cefr: string;
  collections: LessonCollectionMembership[];
  contentVersion: number;
  hints: [string, string, string];
  id: string;
  item: PromotedPracticeItem;
  objective: string;
  profile: DialectProfile;
  teaching: {
    body: string;
    example: string;
    note?: string;
    title: string;
  };
  title: string;
};

export type PromotedLessonResult =
  | { status: "ready"; lesson: PromotedLesson }
  | { status: "unavailable"; reason: "promotion_integrity_failed" };

export function resolvePromotedLesson(
  profile: DialectProfile,
  rawPlacement: unknown = placementJson,
  rawUnit: unknown = unitJson,
  rawPromotion: unknown = promotionJson,
): PromotedLessonResult {
  const parsedProfile = DialectProfile.safeParse(profile);
  const parsedPlacement = PromotedLessonPlacement.safeParse(rawPlacement);
  const parsedUnit = DialectContentUnit.safeParse(rawUnit);
  const parsedPromotion = DialectPromotionReceipt.safeParse(rawPromotion);
  if (
    !parsedProfile.success ||
    !parsedPlacement.success ||
    !parsedUnit.success ||
    !parsedPromotion.success
  ) {
    return { status: "unavailable", reason: "promotion_integrity_failed" };
  }

  const placement = parsedPlacement.data;
  const unit = parsedUnit.data;
  const promotion = parsedPromotion.data;
  const conceptIds = new Set(unit.concepts.map((concept) => concept.id));
  const topicIds = new Set(unit.topicalTags);
  const invalidCollection = placement.collections.some((collection) =>
    collection.kind === "concept"
      ? !conceptIds.has(collection.referenceId)
      : !topicIds.has(collection.referenceId),
  );
  if (
    placement.source.unitId !== unit.id ||
    placement.source.contentVersion !== unit.contentVersion ||
    placement.source.promotionReceiptId !== promotion.receiptId ||
    promotion.unitId !== unit.id ||
    promotion.contentVersion !== unit.contentVersion ||
    promotion.contentDigest !== promotedContentDigest(rawUnit) ||
    !promotion.requiredProfiles.includes(parsedProfile.data) ||
    invalidCollection
  ) {
    return { status: "unavailable", reason: "promotion_integrity_failed" };
  }

  const rendering = unit.renderings[parsedProfile.data];
  return {
    status: "ready",
    lesson: {
      cefr: placement.cefr,
      collections: placement.collections.map((collection) => ({ ...collection })),
      contentVersion: placement.contentVersion,
      hints: [...placement.check.hints[parsedProfile.data]],
      id: placement.id,
      item: {
        acceptedAnswers: [
          rendering.text,
          ...rendering.acceptedAnswers.map((answer) => answer.text),
        ],
        cefr: unit.cefr,
        conceptIds: unit.concepts.map((concept) => concept.id),
        contentVersion: unit.contentVersion,
        cue: "Translate into Spanish.",
        itemId: unit.id,
        meaningId: unit.meaning.id,
        profile: parsedProfile.data,
        prompt: unit.meaning.source.text,
        promotionReceiptId: promotion.receiptId,
        target: rendering.text,
        topicIds: [...unit.topicalTags],
      },
      objective: placement.objective,
      profile: parsedProfile.data,
      teaching: {
        body: placement.teaching.body,
        example: rendering.text,
        ...(rendering.note ? { note: rendering.note } : {}),
        title: placement.teaching.title,
      },
      title: placement.title,
    },
  };
}

export const PROMOTED_LESSON_ID = "placement.a1.you-live-here" as const;
