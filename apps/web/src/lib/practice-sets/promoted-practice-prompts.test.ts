// @vitest-environment node

import { describe, expect, it } from "vitest";

import { verifyPromotionPair } from "./candidate-validation";
import { practiceSetFixtures } from "./prototype-fixtures";
import restaurantPromotedJson from "./prototype-content/restaurant-prompts.json";
import restaurantReviewJson from "./prototype-content/restaurant-prompts.review.json";
import {
  assertReplaceablePromotionPlaceholder,
  loadPromotedPrototypePrompts,
  mergePromotedPracticePrompts,
  promotionContentHash,
} from "./promoted-practice-prompts";

const hash = "a".repeat(64);
const restaurantPlaceholder = {
  schemaVersion: 1 as const,
  state: "placeholder" as const,
  prototypeOnly: true as const,
  collectionId: "intermediate-restaurant",
  prompts: [],
};

function generatedPrompt(index: number) {
  const suffix = String(index).padStart(3, "0");
  return {
    id: `restaurant-generated-${suffix}`,
    level: index % 2 === 0 ? "foundation" as const : "intermediate" as const,
    focus: ["time-phrases" as const],
    capability: `Use restaurant unit ${suffix}`,
    cue: `Respond to distinct restaurant situation ${suffix}.`,
    english: `Distinct restaurant prompt ${suffix}.`,
    spanish: `Frase distinta de restaurante ${suffix}.`,
    answers: {
      english: { target: [], communicative: [] },
      spanish: { target: [], communicative: [] },
    },
    difficulty: 2,
    grammarTags: ["formula.courtesy" as const],
  };
}

function promotedArtifact(prompts: ReturnType<typeof generatedPrompt>[]) {
  const payload = {
    schemaVersion: 1 as const,
    state: "promoted" as const,
    prototypeOnly: true as const,
    collectionId: "intermediate-restaurant",
    sourceRunId: "run-test",
    sourceCandidateHash: hash,
    reviewedContentHash: "b".repeat(64),
    prompts,
  };
  return { ...payload, promotedContentHash: promotionContentHash(payload) };
}

describe("promoted Practice prompt loader", () => {
  it("retains synthetic empty-placeholder replacement behavior", () => {
    const loaded = loadPromotedPrototypePrompts(restaurantPlaceholder);
    expect(loaded).toEqual({
      schemaVersion: 1,
      state: "placeholder",
      prototypeOnly: true,
      collectionId: "intermediate-restaurant",
      prompts: [],
    });
    expect(JSON.stringify(loaded)).not.toMatch(/review|critic|model|credential/iu);
    expect(
      assertReplaceablePromotionPlaceholder(restaurantPlaceholder, "intermediate-restaurant"),
    ).toEqual(loaded);
    expect(() =>
      assertReplaceablePromotionPlaceholder(restaurantPlaceholder, "another-collection"),
    ).toThrow();
  });

  it("loads 46 tracked client-safe promoted prompts into 50 globally distinct Restaurant units", () => {
    const tracked = loadPromotedPrototypePrompts(restaurantPromotedJson);
    expect(tracked.state).toBe("promoted");
    expect(tracked.prompts).toHaveLength(46);
    expect(Object.keys(tracked).sort()).toEqual([
      "collectionId",
      "promotedContentHash",
      "prompts",
      "prototypeOnly",
      "reviewedContentHash",
      "schemaVersion",
      "sourceCandidateHash",
      "sourceRunId",
      "state",
    ]);
    expect(JSON.stringify(tracked)).not.toMatch(/reviewer|critic|model|credential/iu);

    const restaurant = practiceSetFixtures.find((set) => set.id === "intermediate-restaurant");
    expect(restaurant?.prompts).toHaveLength(50);
    expect(new Set(restaurant?.prompts.map((prompt) => prompt.id))).toHaveProperty("size", 50);
    const allPromptIds = practiceSetFixtures.flatMap((set) =>
      set.prompts.map((prompt) => prompt.id),
    );
    expect(new Set(allPromptIds).size).toBe(allPromptIds.length);
  });

  it("verifies the tracked promoted content against its passing critic sidecar", () => {
    const pair = verifyPromotionPair(restaurantPromotedJson, restaurantReviewJson);
    expect(pair.sidecar.critic).toMatchObject({
      verdict: "pass",
      candidateHash: pair.promoted.sourceCandidateHash,
      reviewedContentHash: pair.promoted.reviewedContentHash,
    });
    expect(pair.sidecar.promotedContentHash).toBe(pair.promoted.promotedContentHash);
  });

  it("merges a synthetic populated artifact to exactly 50 prompts", () => {
    const existing = Array.from({ length: 4 }, (_, index) => generatedPrompt(index + 101));
    const artifact = loadPromotedPrototypePrompts(promotedArtifact(
      Array.from({ length: 46 }, (_, index) => generatedPrompt(index + 1)),
    ));
    const merged = mergePromotedPracticePrompts(existing, artifact, 50);
    expect(merged).toHaveLength(50);
    expect(new Set(merged.map((prompt) => prompt.id)).size).toBe(50);
    expect(() =>
      assertReplaceablePromotionPlaceholder(artifact, "intermediate-restaurant"),
    ).toThrow();
  });

  it("rejects duplicate IDs and an incorrect populated total", () => {
    const prompts = [generatedPrompt(1), generatedPrompt(1)];
    expect(() => loadPromotedPrototypePrompts(promotedArtifact(prompts))).toThrow();
    const artifact = loadPromotedPrototypePrompts(promotedArtifact([generatedPrompt(1)]));
    expect(() => mergePromotedPracticePrompts([generatedPrompt(101)], artifact, 50)).toThrow(
      /must contain 50/u,
    );
  });

  it("rejects manual promoted-content drift against the embedded review hash", () => {
    const artifact = promotedArtifact([generatedPrompt(1)]);
    const drifted = structuredClone(artifact);
    drifted.prompts[0].spanish = "Contenido cambiado manualmente.";
    expect(() => loadPromotedPrototypePrompts(drifted)).toThrow(/content hash/u);
  });
});
