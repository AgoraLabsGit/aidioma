import { describe, expect, it } from "vitest";

import placementJson from "../../../../../content/placements/placement.a1.you-live-here.json";
import unitJson from "../../../../../content/units/a1/unit.a1.you-live-here.json";

import { resolvePromotedLesson } from "./promoted-lesson";

describe("promoted finite lesson placement", () => {
  it.each([
    ["es-AR", "Vos vivís acá."],
    ["es-419", "Tú vives aquí."],
    ["es-ES", "Tú vives aquí."],
  ] as const)("resolves teaching, hints, and collections for %s", (profile, example) => {
    const resolved = resolvePromotedLesson(profile);
    expect(resolved).toMatchObject({
      status: "ready",
      lesson: {
        teaching: { example },
        item: { profile, target: example },
        collections: [
          { kind: "concept", referenceId: "concept.present.regular-ir.second-person" },
          { kind: "topic", referenceId: "home" },
        ],
      },
    });
    if (resolved.status === "ready") expect(resolved.lesson.hints).toHaveLength(3);
  });

  it("fails closed when placement points outside promoted concepts or topics", () => {
    const tampered = structuredClone(placementJson);
    tampered.collections[0].referenceId = "concept.unreviewed";
    expect(resolvePromotedLesson("es-AR", tampered)).toEqual({
      status: "unavailable",
      reason: "promotion_integrity_failed",
    });
  });

  it("fails closed when the promoted unit changes", () => {
    const tampered = structuredClone(unitJson);
    tampered.renderings["es-AR"].text = "Contenido sin revisar";
    expect(resolvePromotedLesson("es-AR", placementJson, tampered)).toEqual({
      status: "unavailable",
      reason: "promotion_integrity_failed",
    });
  });
});
