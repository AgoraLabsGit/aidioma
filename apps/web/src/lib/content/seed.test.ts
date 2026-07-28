import { describe, expect, it } from "vitest";

import { applySeed, emptySeedState, loadSeedLessons, type SeedLesson } from "./seed";

describe("canonical lesson seed transformation", () => {
  it("is deterministic and uses the shared lesson contract", async () => {
    const first = await loadSeedLessons();
    const second = await loadSeedLessons();

    expect(first).toEqual(second);
    expect(first.map((lesson) => lesson.slug)).toEqual([
      "a1-01-hola-me-llamo",
      "a1-02-soy-asi",
      "a1-03-que-haces",
      "a1-04-donde-esta",
    ]);
    expect(first.every((lesson) => /^[a-f0-9]{64}$/.test(lesson.contentHash))).toBe(true);
    expect(first.every((lesson) => lesson.items.every((item) => item.lessonId === lesson.id))).toBe(
      true,
    );
  });

  it("is idempotent and does not delete rows omitted by a later corpus", async () => {
    const corpus = await loadSeedLessons();
    const once = applySeed(emptySeedState(), corpus);
    const twice = applySeed(once, corpus);

    expect(twice).toEqual(once);

    const withoutFirstLesson = applySeed(twice, corpus.slice(1));
    expect(withoutFirstLesson.lessons.get(corpus[0].slug)).toEqual(
      twice.lessons.get(corpus[0].slug),
    );
    expect(withoutFirstLesson.items.get(corpus[0].items[0].id)).toEqual(
      twice.items.get(corpus[0].items[0].id),
    );

    const itemOmitted = structuredClone(corpus[0]);
    const omittedItem = itemOmitted.items.pop();
    const afterItemOmission = applySeed(twice, [itemOmitted]);
    expect(afterItemOmission.items.get(omittedItem!.id)).toEqual(twice.items.get(omittedItem!.id));
  });

  it("preserves deprecation and rejects moving an immutable item id", async () => {
    const [source] = await loadSeedLessons();
    const retired = structuredClone(source);
    retired.items[0].deprecated = true;
    const retiredState = applySeed(emptySeedState(), [retired]);

    const reseeded = applySeed(retiredState, [source]);
    expect(reseeded.items.get(retired.items[0].id)?.deprecated).toBe(true);

    const moved: SeedLesson = structuredClone(source);
    moved.id = "a1-99-impossible-move";
    moved.slug = moved.id;
    moved.ordinal = 99;
    moved.items[0].lessonId = moved.id;
    expect(() => applySeed(retiredState, [moved])).toThrow(/cannot move/);
  });
});
