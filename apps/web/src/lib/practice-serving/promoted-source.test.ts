import { describe, expect, it } from "vitest";

import promotion from "../../../../../content/promotions/promotion.unit-a1-you-live-here.v1.json";
import placement from "../../../../../content/placements/placement.a1.you-live-here.json";
import unit from "../../../../../content/units/a1/unit.a1.you-live-here.json";

import { resolvePromotedPracticeCollection, resolvePromotedPracticeSource } from "./promoted-source";

describe("promoted Practice source", () => {
  it.each([
    ["es-AR", "Vos vivís acá."],
    ["es-419", "Tú vives aquí."],
    ["es-ES", "Tú vives aquí."],
  ] as const)("renders only the receipt-bound %s profile", (profile, target) => {
    const result = resolvePromotedPracticeSource(profile);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      itemId: "unit.a1.you-live-here",
      contentVersion: 1,
      profile,
      prompt: "You live here.",
      target,
      promotionReceiptId: "promotion.unit-a1-you-live-here.v1",
    });
  });

  it("fails closed on content, identity, version, digest, or promotion drift", () => {
    expect(
      resolvePromotedPracticeSource("es-AR", { ...unit, contentVersion: 2 }, promotion),
    ).toEqual({ status: "unavailable", reason: "promotion_integrity_failed" });
    expect(
      resolvePromotedPracticeSource("es-AR", unit, { ...promotion, status: "draft" }),
    ).toEqual({ status: "unavailable", reason: "promotion_integrity_failed" });
    expect(
      resolvePromotedPracticeSource("es-AR", { ...unit, topicalTags: ["changed"] }, promotion),
    ).toEqual({ status: "unavailable", reason: "promotion_integrity_failed" });
  });

  it("reuses the promoted item for its concept and topic collection placements", () => {
    expect(resolvePromotedPracticeCollection("es-AR", "collection.a1.present-regular-ir")).toMatchObject({
      status: "ready",
      source: { id: "collection.a1.present-regular-ir", title: "Present -ir forms" },
      items: [{ itemId: "unit.a1.you-live-here" }],
    });
    expect(resolvePromotedPracticeCollection("es-AR", "collection.unreviewed")).toEqual({
      status: "unavailable",
      reason: "promotion_integrity_failed",
    });
  });

  it("fails closed when a collection no longer contains the promoted item", () => {
    const changedPlacement = {
      ...placement,
      collections: placement.collections.map((collection) =>
        collection.id === "collection.a1.present-regular-ir"
          ? { ...collection, referenceId: "concept.unrelated" }
          : collection,
      ),
    };
    expect(
      resolvePromotedPracticeCollection(
        "es-AR",
        "collection.a1.present-regular-ir",
        changedPlacement,
      ),
    ).toEqual({ status: "unavailable", reason: "promotion_integrity_failed" });
  });
});
