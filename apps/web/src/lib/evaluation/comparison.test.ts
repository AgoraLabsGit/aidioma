import type {
  PassageSegment,
  SentenceItem,
  VocabItem,
} from "@aidioma/lesson-schema";
import { describe, expect, it } from "vitest";

import {
  AiEvaluationResultSchema,
  EVALUATION_WORD_DIFF_MAX_ENTRIES,
  EVALUATION_WORD_DIFF_TEXT_MAX_LENGTH,
  EvaluationRequestSchema,
  EvaluationResultSchema,
} from "./contracts";
import {
  acceptedAnswersForItem,
  acceptedAnswersForPassageSegment,
  buildAcceptedAnswers,
  compareAnswer,
  comparisonSimilarity,
  createCorrectionPresentation,
  createWordDiff,
  levenshteinDistance,
  normalizeForComparison,
  splitVocabVariants,
} from "./comparison";

const sentence: SentenceItem = {
  id: "a1-01.s.01",
  kind: "sentence",
  es: "Yo soy de Colombia.",
  en: "I am from Colombia.",
  acceptedEs: ["Soy de Colombia.", { text: "Yo soy colombiano.", region: "CO" }],
  acceptedEn: ["I'm from Colombia."],
  grammarTags: ["verb.ser"],
  vocabRefs: [],
  difficulty: 1,
  hints: ["One", "Two", "Three"],
  deprecated: false,
};

const vocab: VocabItem = {
  id: "a1-01.v.senor",
  kind: "vocab",
  es: "señor",
  en: "sir / man / Mr. (title)",
  acceptedEs: [],
  acceptedEn: ["gentleman"],
  pos: "noun",
  gender: "m",
  exampleEs: "Hola, señor.",
  exampleEn: "Hello, sir.",
  deprecated: false,
};

const segment: PassageSegment = {
  id: "a1-01.p.01.01",
  es: "Soy de Colombia.",
  en: ["I am from Colombia.", "I'm from Colombia."],
  vocabRefs: [],
  deprecated: false,
};

describe("evaluation contracts", () => {
  const request = {
    sourceType: "lesson",
    itemRef: "a1-01.s.01",
    modality: "translate",
    direction: "en-es",
    userInput: "Soy de Colombia.",
  } as const;

  it("accepts the strict lesson request and retains set in the source union", () => {
    expect(EvaluationRequestSchema.parse(request)).toEqual(request);
    expect(
      EvaluationRequestSchema.safeParse({ ...request, sourceType: "set" }).success,
    ).toBe(true);
  });

  it("rejects browser-supplied grading data, persistence IDs, and blank input", () => {
    expect(
      EvaluationRequestSchema.safeParse({ ...request, expected: ["secret"] }).success,
    ).toBe(false);
    expect(
      EvaluationRequestSchema.safeParse({ ...request, sessionId: "not-in-a2" }).success,
    ).toBe(false);
    expect(
      EvaluationRequestSchema.safeParse({ ...request, evaluationId: "not-in-a2" }).success,
    ).toBe(false);
    expect(EvaluationRequestSchema.safeParse({ ...request, userInput: "  " }).success).toBe(
      false,
    );
    expect(
      EvaluationRequestSchema.safeParse({ ...request, userInput: "x".repeat(1_001) }).success,
    ).toBe(false);
  });

  it("enforces the score/verdict bands for comparison and AI results", () => {
    const comparison = {
      score: 84,
      verdict: "close",
      feedback: "Almost.",
      errorTags: ["verb.ser"],
      evalSource: "comparison",
    } as const;

    expect(EvaluationResultSchema.safeParse(comparison).success).toBe(true);
    expect(
      EvaluationResultSchema.safeParse({ ...comparison, verdict: "correct" }).success,
    ).toBe(false);
    expect(
      AiEvaluationResultSchema.safeParse({
        score: 10,
        verdict: "wrong",
        feedback: "Try again.",
        wordDiff: [],
        errorTags: ["verb.ser"],
      }).success,
    ).toBe(true);
    expect(
      AiEvaluationResultSchema.safeParse({
        score: 0,
        verdict: "wrong",
        feedback: "No zero scores.",
        wordDiff: [],
        errorTags: [],
      }).success,
    ).toBe(false);
    expect(
      AiEvaluationResultSchema.safeParse({
        score: 50,
        verdict: "wrong",
        feedback: "Unknown tag.",
        wordDiff: [],
        errorTags: ["not.a.grammar.tag"],
      }).success,
    ).toBe(false);
  });
});

describe("normalization and similarity", () => {
  it("normalizes harmless typography while preserving Spanish spelling", () => {
    expect(normalizeForComparison("  ¿HÓLA,   SEÑOR!  ")).toBe("hóla señor");
    expect(normalizeForComparison("si")).not.toBe(normalizeForComparison("sí"));
    expect(normalizeForComparison("man\u0303ana")).toBe("mañana");
  });

  it("keeps internal apostrophes and normalizes smart apostrophes", () => {
    expect(normalizeForComparison("We’re here.")).toBe("we're here");
    expect(normalizeForComparison("were")).not.toBe(normalizeForComparison("we're"));
    expect(normalizeForComparison("'Hello'")).toBe("hello");
  });

  it("normalizes equivalent English negative contractions", () => {
    expect(normalizeForComparison("I don't know")).toBe(
      normalizeForComparison("I do not know"),
    );
    expect(normalizeForComparison("I can't go")).toBe(
      normalizeForComparison("I cannot go"),
    );
  });

  it("treats punctuation-only input as empty", () => {
    expect(normalizeForComparison("¿...? ¡!")).toBe("");
  });

  it("computes Levenshtein distance over Unicode code points", () => {
    expect(levenshteinDistance("casa", "cosa")).toBe(1);
    expect(comparisonSimilarity("abc", "axc")).toBeCloseTo(2 / 3);
    expect(levenshteinDistance("🙂", "")).toBe(1);
  });
});

describe("accepted answer composition", () => {
  it("includes canonical answers, filters regions, and deduplicates after normalization", () => {
    const entries = [
      "Soy de Colombia.",
      " soy de colombia ",
      { text: "Vos sos de Colombia.", region: "AR" },
      { text: "Tú eres de Colombia.", region: "MX" },
      { text: "Yo soy de Colombia." },
    ];

    expect(buildAcceptedAnswers("Soy de Colombia", entries)).toEqual([
      "Soy de Colombia",
      "Yo soy de Colombia.",
    ]);
    expect(buildAcceptedAnswers("Soy de Colombia", entries, { activeRegion: "AR" })).toEqual([
      "Soy de Colombia",
      "Vos sos de Colombia.",
      "Yo soy de Colombia.",
    ]);
  });

  it("selects sentence accept sets by target direction", () => {
    expect(acceptedAnswersForItem(sentence, "en-es")).toEqual([
      "Yo soy de Colombia.",
      "Soy de Colombia.",
    ]);
    expect(acceptedAnswersForItem(sentence, "en-es", "CO")).toContain(
      "Yo soy colombiano.",
    );
    expect(acceptedAnswersForItem(sentence, "es-en")).toEqual([
      "I am from Colombia.",
      "I'm from Colombia.",
    ]);
  });

  it("splits vocab display variants and strips disambiguating parentheticals", () => {
    expect(splitVocabVariants("sir / man / Mr. (title)")).toEqual(["sir", "man", "Mr."]);
    expect(acceptedAnswersForItem(vocab, "es-en")).toEqual([
      "sir",
      "man",
      "Mr.",
      "gentleman",
    ]);
  });

  it("uses all authored English passage translations and rejects the reverse direction", () => {
    expect(acceptedAnswersForPassageSegment(segment, "es-en")).toEqual(segment.en);
    expect(() => acceptedAnswersForPassageSegment(segment, "en-es")).toThrow(
      "Passage segments support es-en reading only",
    );
  });
});

describe("word diff", () => {
  it("marks substitutions, missing words, and learner extras in sequence", () => {
    expect(createWordDiff("Yo soi Colombia hoy", "Yo soy de Colombia")).toEqual([
      { text: "Yo", mark: "correct" },
      { text: "soi", mark: "close", suggestion: "soy" },
      { text: "de", mark: "missing", suggestion: "de" },
      { text: "Colombia", mark: "correct" },
      { text: "hoy", mark: "extra" },
    ]);
  });

  it("marks a reordered phrase deterministically", () => {
    expect(createWordDiff("aquí estoy", "estoy aquí")).toEqual([
      { text: "estoy", mark: "missing", suggestion: "estoy" },
      { text: "aquí", mark: "correct" },
      { text: "estoy", mark: "extra" },
    ]);
  });

  it("preserves one full reviewed sentence and marks small and material changes", () => {
    expect(
      createCorrectionPresentation("Yo soi Colombia hoy", [
        "Yo soy de Colombia.",
        "Soy de Colombia.",
      ]),
    ).toEqual({
      text: "Yo soy de Colombia.",
      highlights: [
        { start: 3, end: 6, kind: "spelling" },
        { start: 7, end: 9, kind: "different" },
      ],
    });
  });

  it("bounds entry count and text lengths to the response contract", () => {
    const manyTokens = Array.from({ length: 150 }, (_, index) => `token${index}`).join(" ");
    const longToken = "a".repeat(250);
    const diff = createWordDiff(`${longToken} ${manyTokens}`, `b${longToken} ${manyTokens}`);

    expect(diff.length).toBeLessThanOrEqual(EVALUATION_WORD_DIFF_MAX_ENTRIES);
    expect(diff.every((entry) => entry.text.length <= EVALUATION_WORD_DIFF_TEXT_MAX_LENGTH)).toBe(
      true,
    );
    expect(
      diff.every(
        (entry) =>
          entry.suggestion === undefined ||
          entry.suggestion.length <= EVALUATION_WORD_DIFF_TEXT_MAX_LENGTH,
      ),
    ).toBe(true);
  });

  it("bounds Unicode text by the schema's UTF-16 length without splitting code points", () => {
    const userInput = `${"🙂".repeat(200)}a`;
    const expected = `${"🙂".repeat(200)}b`;
    const decision = compareAnswer(userInput, [expected]);

    expect(decision.kind).toBe("graded");
    if (decision.kind !== "graded") return;
    expect(EvaluationResultSchema.safeParse(decision.result).success).toBe(true);
    expect(decision.result.wordDiff?.[0]?.text.length).toBeLessThanOrEqual(
      EVALUATION_WORD_DIFF_TEXT_MAX_LENGTH,
    );
  });

  it("keeps a long-token correction visible after bounding", () => {
    const sharedPrefix = "a".repeat(400);
    const decision = compareAnswer(`${sharedPrefix}x`, [`${sharedPrefix}y`]);

    expect(decision.kind).toBe("graded");
    if (decision.kind !== "graded") return;
    const changed = decision.result.wordDiff?.find((entry) => entry.mark !== "correct");
    expect(changed?.text).not.toBe(changed?.suggestion);
    expect(EvaluationResultSchema.safeParse(decision.result).success).toBe(true);
  });
});

describe("comparison gate", () => {
  it("returns an exact accepted alternate without AI or a redundant diff", () => {
    const decision = compareAnswer("  SOY DE COLOMBIA! ", [
      "Yo soy de Colombia.",
      "Soy de Colombia.",
    ]);

    expect(decision.kind).toBe("graded");
    if (decision.kind !== "graded") return;
    expect(decision.matchedAnswer).toBe("Soy de Colombia.");
    expect(decision.result).toEqual({
      score: 100,
      verdict: "correct",
      feedback: "Correct.",
      errorTags: [],
      evalSource: "comparison",
    });
  });

  it("never marks a non-exact character match correct", () => {
    const decision = compareAnswer("abcdefghix", ["abcdefghij"]);
    expect(decision.kind).toBe("graded");
    if (decision.kind !== "graded") return;
    expect(decision.similarity).toBe(0.9);
    expect(decision.result.score).toBe(76);
    expect(decision.result.verdict).toBe("close");
  });

  it("accepts one inserted or omitted English output character only when explicitly enabled", () => {
    expect(compareAnswer("I just finished, the check pelease.", ["I just finished. The check, please."])).toMatchObject({
      kind: "graded",
      result: { verdict: "close" },
    });
    expect(
      compareAnswer(
        "I just finished, the check pelease.",
        ["I just finished. The check, please."],
        { tolerateSingleCharacterTypo: true },
      ),
    ).toMatchObject({ kind: "graded", result: { score: 100, verdict: "correct" } });
    expect(
      compareAnswer("I just finished, the chick please.", ["I just finished. The check, please."], {
        tolerateSingleCharacterTypo: true,
      }),
    ).toMatchObject({ kind: "graded", result: { verdict: "close" } });
  });

  it("returns deterministic close at the 0.70 boundary", () => {
    const decision = compareAnswer("abcdefgxxx", ["abcdefghij"]);
    expect(decision.kind).toBe("graded");
    if (decision.kind !== "graded") return;
    expect(decision.similarity).toBe(0.7);
    expect(decision.result.score).toBe(60);
    expect(decision.result.verdict).toBe("close");
    expect(decision.result.errorTags).toEqual([]);
  });

  it("routes a poor match or absent authored answer to AI exactly once at the service boundary", () => {
    expect(compareAnswer("xxx", ["abcdefghij"]).kind).toBe("ai-required");
    expect(compareAnswer("A reasonable answer", []).kind).toBe("ai-required");
  });

  it("routes negation and numeric mismatches to AI even when character similarity is high", () => {
    expect(
      compareAnswer("I am tall and very friendly today", [
        "I am not tall and very friendly today",
      ]).kind,
    ).toBe("ai-required");
    expect(compareAnswer("Tengo 20 años y vivo aquí", ["Tengo 21 años y vivo aquí"]).kind).toBe(
      "ai-required",
    );
    expect(
      compareAnswer("Quiero café con azúcar por favor", [
        "Quiero café sin azúcar por favor",
      ]).kind,
    ).toBe("ai-required");
    expect(
      compareAnswer("Tomo 4 pastillas cada 2 horas", [
        "Tomo 2 pastillas cada 4 horas",
      ]).kind,
    ).toBe("ai-required");
    expect(
      compareAnswer("Tengo dos gatos en mi casa hoy", [
        "Tengo tres gatos en mi casa hoy",
      ]).kind,
    ).toBe("ai-required");
    expect(
      compareAnswer("Tengo setenta años y vivo aquí", [
        "Tengo sesenta años y vivo aquí",
      ]).kind,
    ).toBe("ai-required");
    expect(
      compareAnswer("I have twenty-one books at home", [
        "I have thirty-one books at home",
      ]).kind,
    ).toBe("ai-required");
    expect(
      compareAnswer("Tengo 21% de descuento en esta tienda", [
        "Tengo 20% de descuento en esta tienda",
      ]).kind,
    ).toBe("ai-required");
    expect(
      compareAnswer("La temperatura es 21°C esta mañana", [
        "La temperatura es 20°C esta mañana",
      ]).kind,
    ).toBe("ai-required");
    expect(
      compareAnswer("Cuesta $21 en esta tienda hoy", [
        "Cuesta $20 en esta tienda hoy",
      ]).kind,
    ).toBe("ai-required");
  });

  it("routes semantically uncertain missing, extra, and wrong words to AI", () => {
    expect(
      compareAnswer("Quiero azúcar en mi café por favor", [
        "Quiero poco azúcar en mi café por favor",
      ]).kind,
    ).toBe("ai-required");
    expect(
      compareAnswer("Quiero muchísimo azúcar en mi café por favor", [
        "Quiero poco azúcar en mi café por favor",
      ]).kind,
    ).toBe("ai-required");
  });

  it.each([
    ["Yo habla español", "Yo hablo español"],
    ["Ella está cansado", "Ella está cansada"],
    ["Él tiene perro", "Él tiene perros"],
    ["Quiero una cosa grande", "Quiero una casa grande"],
  ])("does not mark a one-character word change correct: %s", (userInput, expected) => {
    const decision = compareAnswer(userInput, [expected]);

    expect(decision.kind).toBe("graded");
    if (decision.kind !== "graded") return;
    expect(decision.result.verdict).toBe("close");
    expect(decision.result.score).toBeLessThan(85);
  });

  it("reviews semantic edits after the learner-facing diff cap", () => {
    const prefix = Array.from({ length: EVALUATION_WORD_DIFF_MAX_ENTRIES + 1 }, () =>
      "hola",
    ).join(" ");

    const decision = compareAnswer(`${prefix} rojo`, [`${prefix} verde`]);

    expect(decision.kind).toBe("ai-required");
    if (decision.kind !== "ai-required") return;
    expect(decision.wordDiff).toHaveLength(EVALUATION_WORD_DIFF_MAX_ENTRIES);
  });

  it("keeps a post-cap spelling correction in the bounded learner diff", () => {
    const prefix = Array.from({ length: EVALUATION_WORD_DIFF_MAX_ENTRIES + 1 }, () =>
      "hola",
    ).join(" ");
    const decision = compareAnswer(`${prefix} holx`, [`${prefix} hola`]);

    expect(decision.kind).toBe("graded");
    if (decision.kind !== "graded") return;
    expect(decision.result.wordDiff).toHaveLength(EVALUATION_WORD_DIFF_MAX_ENTRIES);
    expect(decision.result.wordDiff).toContainEqual({
      text: "holx",
      mark: "close",
      suggestion: "hola",
    });
  });

  it("uses authored order to break equal-similarity ties", () => {
    const decision = compareAnswer("cat", ["bat", "hat"]);
    expect(decision.kind).toBe("ai-required");
    if (decision.kind !== "ai-required") return;
    expect(decision.closestAnswer).toBe("bat");
  });

  it("rejects normalized-empty and oversized input before comparison", () => {
    expect(compareAnswer("¿...?!", ["hola"])).toEqual({
      kind: "invalid",
      reason: "empty",
    });
    expect(compareAnswer("x".repeat(1_001), ["hola"])).toEqual({
      kind: "invalid",
      reason: "too-long",
    });
  });
});
