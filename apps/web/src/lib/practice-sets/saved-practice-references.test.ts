import { describe, expect, it } from "vitest";

import {
  addSavedPracticeReference,
  hasSavedPracticeReference,
  removeSavedPracticeReference,
  savedPracticeReference,
  savedPracticeReferenceKey,
} from "./saved-practice-references";

describe("saved practice references", () => {
  it("uses the same immutable identity in either practice direction", () => {
    const savedFromEnglishToSpanish = savedPracticeReference(
      "intermediate-restaurant",
      "restaurant-foundation-bill",
    );
    const foundFromSpanishToEnglish = savedPracticeReference(
      "intermediate-restaurant",
      "restaurant-foundation-bill",
    );

    expect(savedPracticeReferenceKey(savedFromEnglishToSpanish)).toBe(
      savedPracticeReferenceKey(foundFromSpanishToEnglish),
    );
    expect(savedFromEnglishToSpanish).toEqual(foundFromSpanishToEnglish);
    expect(Object.isFrozen(savedFromEnglishToSpanish)).toBe(true);
  });

  it("deduplicates a reference and removes only its exact collection-prompt pair", () => {
    const restaurant = savedPracticeReference("restaurant", "shared-prompt");
    const travel = savedPracticeReference("travel", "shared-prompt");
    const references = addSavedPracticeReference(
      addSavedPracticeReference([travel], restaurant),
      restaurant,
    );

    expect(references).toEqual([travel, restaurant]);
    expect(hasSavedPracticeReference(references, restaurant)).toBe(true);
    expect(removeSavedPracticeReference(references, restaurant)).toEqual([travel]);
  });

  it("rejects incomplete identities", () => {
    expect(() => savedPracticeReference("", "prompt")).toThrow();
    expect(() => savedPracticeReference("collection", "")).toThrow();
  });
});
