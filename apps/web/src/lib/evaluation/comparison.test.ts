import type {
  PassageSegment,
  SentenceItem,
  VocabItem,
} from "@aidioma/lesson-schema";
import { describe, expect, it } from "vitest";

import {
  AiEvaluationResultSchema,
  EvaluationRequestSchema,
  EvaluationResultSchema,
} from "./contracts";
import {
  acceptedAnswersForItem,
  acceptedAnswersForPassageSegment,
  buildAcceptedAnswers,
  compareAnswer,
  comparisonSimilarity,
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
        errorTags: ["verb.ser"],
      }).success,
    ).toBe(true);
    expect(
      AiEvaluationResultSchema.safeParse({
        score: 0,
        verdict: "wrong",
        feedback: "No zero scores.",
        errorTags: [],
      }).success,
    ).toBe(false);
    expect(
      AiEvaluationResultSchema.safeParse({
        score: 50,
        verdict: "wrong",
        feedback: "Unknown tag.",
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

  it("returns deterministic correct at the 0.90 boundary", () => {
    const decision = compareAnswer("abcdefghix", ["abcdefghij"]);
    expect(decision.kind).toBe("graded");
    if (decision.kind !== "graded") return;
    expect(decision.similarity).toBe(0.9);
    expect(decision.result.score).toBe(85);
    expect(decision.result.verdict).toBe("correct");
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
