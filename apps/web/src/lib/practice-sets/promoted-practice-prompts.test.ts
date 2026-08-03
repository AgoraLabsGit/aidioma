import { describe, expect, it } from "vitest";

import { practiceSetFixtures } from "./prototype-fixtures";
import restaurantPlaceholder from "./prototype-content/restaurant-prompts.json";
import {
  assertReplaceablePromotionPlaceholder,
  loadPromotedPrototypePrompts,
  mergePromotedPracticePrompts,
  promotionContentHash,
} from "./promoted-practice-prompts";

const hash = "a".repeat(64);

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
  it("loads the tracked client-safe empty Restaurant placeholder", () => {
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

  it("produces exactly 50 globally distinct Restaurant prompt IDs once populated", () => {
    const restaurant = practiceSetFixtures.find((set) => set.id === "intermediate-restaurant");
    expect(restaurant?.prompts).toHaveLength(4);
    const artifact = loadPromotedPrototypePrompts(promotedArtifact(
      Array.from({ length: 46 }, (_, index) => generatedPrompt(index + 1)),
    ));
    const merged = mergePromotedPracticePrompts(restaurant?.prompts ?? [], artifact, 50);
    expect(merged).toHaveLength(50);
    expect(new Set(merged.map((prompt) => prompt.id)).size).toBe(50);
    expect(() =>
      assertReplaceablePromotionPlaceholder(artifact, "intermediate-restaurant"),
    ).toThrow();
  });

  it("rejects duplicate IDs and an incorrect populated total", () => {
    const prompts = [generatedPrompt(1), generatedPrompt(1)];
    expect(() => loadPromotedPrototypePrompts(promotedArtifact(prompts))).toThrow();
  });

  it("rejects manual promoted-content drift against the embedded review hash", () => {
    const artifact = promotedArtifact([generatedPrompt(1)]);
    const drifted = structuredClone(artifact);
    drifted.prompts[0].spanish = "Contenido cambiado manualmente.";
    expect(() => loadPromotedPrototypePrompts(drifted)).toThrow(/content hash/u);
  });
});
