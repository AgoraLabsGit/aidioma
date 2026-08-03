import { describe, expect, it } from "vitest";

import type {
  PracticePrompt,
  PracticeSetConfiguration,
} from "./prototype-fixtures";
import { practiceUnitsForSession } from "./session-order";

function prompt(id: string): PracticePrompt {
  return {
    id,
    level: "intermediate",
    focus: ["time-phrases"],
    difficulty: 3,
    grammarTags: ["adverb"],
    capability: `Practice ${id}`,
    cue: `Use ${id}`,
    english: `${id} in English`,
    spanish: `${id} in Spanish`,
    answers: {
      english: { target: [`${id} in English`], communicative: [] },
      spanish: { target: [`${id} in Spanish`], communicative: [] },
    },
  };
}

function configuration(
  patch: Partial<PracticeSetConfiguration> = {},
): PracticeSetConfiguration {
  return {
    activity: "type",
    direction: "both",
    focus: "recommended",
    shuffle: true,
    ...patch,
  };
}

const prompts = ["one", "two", "three", "four", "five", "six"].map(prompt);

function promptIds(units: ReturnType<typeof practiceUnitsForSession>) {
  return units.map((unit) => unit.prompt.id);
}

describe("practice session ordering", () => {
  it("is deterministic for one seed and varies the full prompt pool across seeds", () => {
    const first = practiceUnitsForSession(prompts, configuration(), 12);
    const repeated = practiceUnitsForSession(prompts, configuration(), 12);
    const differentSeed = practiceUnitsForSession(prompts, configuration(), 987);

    expect(repeated).toEqual(first);
    expect(promptIds(differentSeed).slice(0, prompts.length)).not.toEqual(
      promptIds(first).slice(0, prompts.length),
    );
  });

  it("preserves fixed prompt order and ignores the avoid-first hint", () => {
    const units = practiceUnitsForSession(
      prompts,
      configuration({ direction: "en-es", shuffle: false }),
      987,
      "one",
    );

    expect(promptIds(units)).toEqual(["one", "two", "three", "four", "five", "six"]);
    expect(units.every((unit) => unit.direction === "en-es")).toBe(true);
  });

  it("does not repeat an underlying prompt before exhausting the prompt pool", () => {
    const units = practiceUnitsForSession(prompts, configuration(), 42);
    const firstPass = promptIds(units).slice(0, prompts.length);

    expect(new Set(firstPass).size).toBe(prompts.length);
    expect(firstPass).toEqual(expect.arrayContaining(prompts.map((item) => item.id)));
  });

  it("covers every prompt-direction unit exactly once across both passes", () => {
    const units = practiceUnitsForSession(prompts, configuration(), 42);
    const exactUnits = units.map((unit) => `${unit.prompt.id}:${unit.direction}`);

    expect(units).toHaveLength(prompts.length * 2);
    expect(new Set(exactUnits).size).toBe(prompts.length * 2);
    for (const item of prompts) {
      expect(exactUnits).toContain(`${item.id}:en-es`);
      expect(exactUnits).toContain(`${item.id}:es-en`);
    }
    expect(units[prompts.length - 1]?.prompt.id).not.toBe(
      units[prompts.length]?.prompt.id,
    );
  });

  it("deterministically avoids repeating the prior session's first prompt", () => {
    const original = practiceUnitsForSession(prompts, configuration(), 42);
    const originalFirst = original[0]?.prompt.id;
    const next = practiceUnitsForSession(
      prompts,
      configuration(),
      42,
      originalFirst,
    );

    expect(next[0]?.prompt.id).not.toBe(originalFirst);
    expect(new Set(promptIds(next).slice(0, prompts.length)).size).toBe(prompts.length);
  });

  it("handles empty and singleton pools without inventing units", () => {
    expect(practiceUnitsForSession([], configuration(), 1)).toEqual([]);

    const singleton = practiceUnitsForSession([prompt("only")], configuration(), 1, "only");
    expect(
      singleton.map((unit) => `${unit.prompt.id}:${unit.direction}`),
    ).toEqual(["only:en-es", "only:es-en"]);
  });

  it("serves a two-prompt pool without adjacent prompt repeats", () => {
    const units = practiceUnitsForSession(prompts.slice(0, 2), configuration(), 9);

    for (let index = 1; index < units.length; index += 1) {
      expect(units[index]?.prompt.id).not.toBe(units[index - 1]?.prompt.id);
    }
  });
});
