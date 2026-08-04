// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  practiceSetFixtures,
  type PracticeDirection,
  type PracticeFocus,
  type PrototypeLearnerStage,
} from "../practice-sets/prototype-fixtures";
import {
  RESTAURANT_COLLECTION_ID,
  RESTAURANT_COLLECTION_VERSION,
  RESTAURANT_ITEM_VERSION,
  resolveRestaurantPracticeSource,
  restaurantPromptPayloadHash,
  validateRestaurantSourcePublication,
} from "./restaurant-source";

const exactScopeCounts = {
  foundation: {
    recommended: 25,
    "time-phrases": 10,
    connectors: 14,
  },
  intermediate: {
    recommended: 50,
    "completed-past": 24,
    "time-phrases": 25,
    connectors: 37,
  },
} as const;

function resolve(
  stage: PrototypeLearnerStage,
  focus: PracticeFocus,
  direction: PracticeDirection = "en-es",
) {
  return resolveRestaurantPracticeSource({
    activity: "type",
    collectionId: RESTAURANT_COLLECTION_ID,
    direction,
    focus,
    stage,
  });
}

describe("Restaurant reviewed prototype source", () => {
  it("resolves the exact 50-prompt Restaurant pool with explicit version and authority", () => {
    const result = resolve("intermediate", "recommended", "both");
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;

    expect(result.source.candidates).toHaveLength(50);
    expect(result.source.prompts).toHaveLength(50);
    expect(new Set(result.source.candidates.map((candidate) => candidate.itemId)).size).toBe(50);
    expect(result.source.scope).toMatchObject({
      collectionId: RESTAURANT_COLLECTION_ID,
      collectionVersion: RESTAURANT_COLLECTION_VERSION,
      activity: "type",
      direction: "both",
      focus: "recommended",
      stage: "intermediate",
    });
    expect(result.source.publication).toEqual({
      authority: "reviewed-prototype",
      canonical: false,
      launchApproved: false,
      prototypeOnly: true,
    });
    expect(result.source.candidates.every((candidate) =>
      candidate.collectionVersion === RESTAURANT_COLLECTION_VERSION &&
      candidate.itemVersion === RESTAURANT_ITEM_VERSION &&
      candidate.lifecycle === "active" &&
      candidate.publicationAuthority === "reviewed-prototype" &&
      candidate.allowedDirections.join(",") === "en-es,es-en"
    )).toBe(true);
    expect(result.source.candidates.map((candidate) => candidate.authoredOrdinal)).toEqual(
      Array.from({ length: 50 }, (_, index) => index),
    );
  });

  it("meets ten underlying prompts for every advertised exact stage, focus, and direction", () => {
    for (const [stage, focuses] of Object.entries(exactScopeCounts) as [
      PrototypeLearnerStage,
      Record<string, number>,
    ][]) {
      for (const [focus, expectedCount] of Object.entries(focuses)) {
        for (const direction of ["en-es", "es-en", "both"] as const) {
          const result = resolve(stage, focus as PracticeFocus, direction);
          expect(result.status, `${stage}/${focus}/${direction}`).toBe("ready");
          if (result.status !== "ready") continue;
          expect(result.source.candidates, `${stage}/${focus}/${direction}`).toHaveLength(
            expectedCount,
          );
          expect(new Set(result.source.candidates.map((candidate) => candidate.itemId)).size).toBe(
            expectedCount,
          );
          expect(expectedCount).toBeGreaterThanOrEqual(10);
        }
      }
    }
  });

  it("returns an unavailable exact empty scope instead of broadening to the stage pool", () => {
    expect(resolve("foundation", "completed-past")).toEqual({
      status: "unavailable",
      reason: "no_eligible_reviewed_items",
      request: {
        activity: "type",
        collectionId: RESTAURANT_COLLECTION_ID,
        direction: "en-es",
        focus: "completed-past",
        stage: "foundation",
      },
    });
    expect(resolve("foundation", "haber")).toMatchObject({
      status: "unavailable",
      reason: "no_eligible_reviewed_items",
    });
  });

  it("keeps other fixture collections and unsupported activities outside this integration", () => {
    expect(resolveRestaurantPracticeSource({
      activity: "type",
      collectionId: "intermediate-getting-around",
      direction: "both",
      focus: "recommended",
      stage: "intermediate",
    })).toMatchObject({ status: "unavailable", reason: "unsupported_collection" });
    expect(resolveRestaurantPracticeSource({
      activity: "flashcards",
      collectionId: RESTAURANT_COLLECTION_ID,
      direction: "both",
      focus: "recommended",
      stage: "intermediate",
    })).toMatchObject({ status: "unavailable", reason: "unsupported_activity" });
  });

  it("fails closed when any field in the versioned 50-prompt payload drifts", () => {
    const restaurant = practiceSetFixtures.find((set) => set.id === RESTAURANT_COLLECTION_ID);
    expect(restaurant).toBeDefined();
    if (!restaurant) return;

    const baseline = validateRestaurantSourcePublication(restaurant.prompts);
    expect(baseline.status).toBe("valid");
    const changed = structuredClone(restaurant.prompts);
    changed[0].spanish = "Contenido modificado sin una nueva versión.";
    expect(restaurantPromptPayloadHash(changed)).not.toBe(restaurantPromptPayloadHash(restaurant.prompts));
    expect(validateRestaurantSourcePublication(changed)).toEqual({
      status: "invalid",
      reason: "source_integrity_failed",
    });
  });

  it("fails closed when the reviewed promotion binding or exact membership changes", () => {
    const restaurant = practiceSetFixtures.find((set) => set.id === RESTAURANT_COLLECTION_ID);
    expect(restaurant).toBeDefined();
    if (!restaurant) return;

    expect(validateRestaurantSourcePublication(restaurant.prompts.slice(1))).toEqual({
      status: "invalid",
      reason: "source_integrity_failed",
    });
    expect(validateRestaurantSourcePublication(restaurant.prompts, {})).toEqual({
      status: "invalid",
      reason: "source_integrity_failed",
    });
  });

  it("returns only JSON-serializable learner-safe source data", () => {
    const result = resolve("intermediate", "recommended", "both");
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(JSON.parse(JSON.stringify(result.source))).toEqual(result.source);
    expect(JSON.stringify(result.source)).not.toMatch(/reviewer|critic|model|credential/iu);
  });
});
