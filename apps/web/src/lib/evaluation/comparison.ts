import type {
  AcceptedEntry,
  PassageSegment,
  SentenceItem,
  VocabItem,
} from "@aidioma/lesson-schema";

import {
  EVALUATION_INPUT_MAX_LENGTH,
  type EvaluationDirection,
  type EvaluationResult,
  type WordDiffEntry,
} from "./contracts";

const CORRECT_SIMILARITY = 0.9;
const CLOSE_SIMILARITY = 0.7;

const NEGATION_WORDS = new Set([
  "no",
  "not",
  "never",
  "cannot",
  "neither",
  "nor",
  "nunca",
  "jamás",
  "nadie",
  "nada",
  "tampoco",
  "ni",
]);

export type AcceptedAnswerOptions = {
  activeRegion?: string;
  splitCanonicalVariants?: boolean;
};

export type ComparisonDecision =
  | {
      kind: "graded";
      matchedAnswer: string;
      similarity: number;
      result: EvaluationResult;
    }
  | {
      kind: "ai-required";
      closestAnswer?: string;
      similarity: number;
      wordDiff?: WordDiffEntry[];
    }
  | {
      kind: "invalid";
      reason: "empty" | "too-long";
    };

function prepareText(text: string, lowercase: boolean): string {
  const prepared = text
    .normalize("NFC")
    .replace(/[\u2018\u2019\u02bc]/gu, "'")
    .replace(/[\u2010-\u2015\u2212]/gu, "-")
    .replace(/[.,!?¿¡:;…"“”«»()[\]{}]/gu, " ")
    // Apostrophes inside words carry meaning in English contractions. Quotes
    // around a word do not, so remove only non-internal apostrophes.
    .replace(/(?<![\p{L}\p{N}])'|'(?![\p{L}\p{N}])/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();

  return lowercase ? prepared.toLowerCase() : prepared;
}

export function normalizeForComparison(text: string): string {
  return prepareText(text, true);
}

function codePoints(text: string): string[] {
  return Array.from(text);
}

export function levenshteinDistance(left: string, right: string): number {
  const a = codePoints(left);
  const b = codePoints(right);
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let row = 1; row <= a.length; row += 1) {
    const current = [row];

    for (let column = 1; column <= b.length; column += 1) {
      const substitutionCost = a[row - 1] === b[column - 1] ? 0 : 1;
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + substitutionCost,
      );
    }

    previous = current;
  }

  return previous[b.length];
}

export function comparisonSimilarity(left: string, right: string): number {
  const a = codePoints(left);
  const b = codePoints(right);
  const longest = Math.max(a.length, b.length);

  if (longest === 0) return 1;
  return Math.max(0, (longest - levenshteinDistance(left, right)) / longest);
}

export function splitVocabVariants(displayText: string): string[] {
  return displayText
    .split(/\s+\/\s+/gu)
    .map((variant) => variant.replace(/\s*\([^)]*\)\s*/gu, " ").trim())
    .filter((variant) => normalizeForComparison(variant).length > 0);
}

function entryIsAvailable(entry: AcceptedEntry, activeRegion?: string): boolean {
  if (typeof entry === "string" || entry.region === undefined) return true;
  return activeRegion !== undefined && entry.region === activeRegion;
}

function entryText(entry: AcceptedEntry): string {
  return typeof entry === "string" ? entry : entry.text;
}

export function buildAcceptedAnswers(
  canonical: string | readonly string[],
  accepted: readonly AcceptedEntry[] = [],
  options: AcceptedAnswerOptions = {},
): string[] {
  const canonicalValues = typeof canonical === "string" ? [canonical] : [...canonical];
  const candidates = [
    ...canonicalValues.flatMap((value) =>
      options.splitCanonicalVariants ? splitVocabVariants(value) : [value],
    ),
    ...accepted
      .filter((entry) => entryIsAvailable(entry, options.activeRegion))
      .map(entryText),
  ];
  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    const normalized = normalizeForComparison(candidate);
    if (normalized.length === 0 || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

export function acceptedAnswersForItem(
  item: SentenceItem | VocabItem,
  direction: EvaluationDirection,
  activeRegion?: string,
): string[] {
  const targetsSpanish = direction === "en-es";
  const canonical = targetsSpanish ? item.es : item.en;
  const accepted = targetsSpanish ? item.acceptedEs : item.acceptedEn;

  return buildAcceptedAnswers(canonical, accepted, {
    activeRegion,
    splitCanonicalVariants: item.kind === "vocab",
  });
}

export function acceptedAnswersForPassageSegment(
  segment: PassageSegment,
  direction: EvaluationDirection,
): string[] {
  if (direction !== "es-en") {
    throw new Error("Passage segments support es-en reading only");
  }

  return buildAcceptedAnswers(segment.en);
}

type DiffStep =
  | { type: "same" | "substitute"; userIndex: number; expectedIndex: number }
  | { type: "extra"; userIndex: number }
  | { type: "missing"; expectedIndex: number };

function diffTokens(userInput: string, expected: string): DiffStep[] {
  const userDisplay = prepareText(userInput, false).split(" ").filter(Boolean);
  const expectedDisplay = prepareText(expected, false).split(" ").filter(Boolean);
  const user = userDisplay.map(normalizeForComparison);
  const expectedTokens = expectedDisplay.map(normalizeForComparison);
  const matrix = Array.from({ length: user.length + 1 }, () =>
    Array<number>(expectedTokens.length + 1).fill(0),
  );

  for (let row = 0; row <= user.length; row += 1) matrix[row][0] = row;
  for (let column = 0; column <= expectedTokens.length; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row <= user.length; row += 1) {
    for (let column = 1; column <= expectedTokens.length; column += 1) {
      const substitutionCost =
        user[row - 1] === expectedTokens[column - 1]
          ? 0
          : comparisonSimilarity(user[row - 1], expectedTokens[column - 1]) >= 0.5
            ? 1
            : 2;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost,
      );
    }
  }

  const reversed: DiffStep[] = [];
  let row = user.length;
  let column = expectedTokens.length;

  while (row > 0 || column > 0) {
    const substitutionCost =
      row > 0 && column > 0
        ? user[row - 1] === expectedTokens[column - 1]
          ? 0
          : comparisonSimilarity(user[row - 1], expectedTokens[column - 1]) >= 0.5
            ? 1
            : 2
        : Number.POSITIVE_INFINITY;
    const canAlign =
      row > 0 &&
      column > 0 &&
      matrix[row][column] === matrix[row - 1][column - 1] + substitutionCost;

    if (canAlign) {
      reversed.push({
        type: user[row - 1] === expectedTokens[column - 1] ? "same" : "substitute",
        userIndex: row - 1,
        expectedIndex: column - 1,
      });
      row -= 1;
      column -= 1;
    } else if (row > 0 && matrix[row][column] === matrix[row - 1][column] + 1) {
      reversed.push({ type: "extra", userIndex: row - 1 });
      row -= 1;
    } else {
      reversed.push({ type: "missing", expectedIndex: column - 1 });
      column -= 1;
    }
  }

  return reversed.reverse();
}

export function createWordDiff(userInput: string, expected: string): WordDiffEntry[] {
  const userDisplay = prepareText(userInput, false).split(" ").filter(Boolean);
  const expectedDisplay = prepareText(expected, false).split(" ").filter(Boolean);

  return diffTokens(userInput, expected).map((step) => {
    if (step.type === "same") {
      return { text: userDisplay[step.userIndex], mark: "correct" };
    }

    if (step.type === "extra") {
      return { text: userDisplay[step.userIndex], mark: "extra" };
    }

    if (step.type === "missing") {
      const expectedText = expectedDisplay[step.expectedIndex];
      return { text: expectedText, mark: "missing", suggestion: expectedText };
    }

    const userText = userDisplay[step.userIndex];
    const expectedText = expectedDisplay[step.expectedIndex];
    const wordSimilarity = comparisonSimilarity(
      normalizeForComparison(userText),
      normalizeForComparison(expectedText),
    );
    const wordDistance = levenshteinDistance(
      normalizeForComparison(userText),
      normalizeForComparison(expectedText),
    );

    return {
      text: userText,
      mark: wordDistance === 1 || wordSimilarity >= CLOSE_SIMILARITY ? "close" : "wrong",
      suggestion: expectedText,
    };
  });
}

function negationTokens(text: string): Set<string> {
  return new Set(
    normalizeForComparison(text)
      .split(" ")
      .filter((token) => NEGATION_WORDS.has(token) || token.endsWith("n't")),
  );
}

function numberTokens(text: string): Set<string> {
  return new Set(normalizeForComparison(text).split(" ").filter((token) => /^\d+$/u.test(token)));
}

function setsEqual(left: Set<string>, right: Set<string>): boolean {
  return left.size === right.size && [...left].every((value) => right.has(value));
}

function hasMeaningRisk(userInput: string, expected: string): boolean {
  return (
    !setsEqual(negationTokens(userInput), negationTokens(expected)) ||
    !setsEqual(numberTokens(userInput), numberTokens(expected))
  );
}

function correctScore(similarity: number): number {
  return Math.min(99, 85 + Math.round(((similarity - CORRECT_SIMILARITY) / 0.1) * 14));
}

function closeScore(similarity: number): number {
  return Math.min(84, 60 + Math.round(((similarity - CLOSE_SIMILARITY) / 0.2) * 24));
}

export function compareAnswer(
  userInput: string,
  acceptedAnswers: readonly string[],
): ComparisonDecision {
  if (userInput.length > EVALUATION_INPUT_MAX_LENGTH) {
    return { kind: "invalid", reason: "too-long" };
  }

  const normalizedInput = normalizeForComparison(userInput);
  if (normalizedInput.length === 0) return { kind: "invalid", reason: "empty" };

  const candidates = buildAcceptedAnswers(acceptedAnswers);
  if (candidates.length === 0) return { kind: "ai-required", similarity: 0 };

  let matchedAnswer = candidates[0];
  let bestSimilarity = -1;

  for (const candidate of candidates) {
    const similarity = comparisonSimilarity(
      normalizedInput,
      normalizeForComparison(candidate),
    );
    // Strict comparison preserves authored order as the deterministic tie-break.
    if (similarity > bestSimilarity) {
      matchedAnswer = candidate;
      bestSimilarity = similarity;
    }
  }

  if (bestSimilarity === 1) {
    return {
      kind: "graded",
      matchedAnswer,
      similarity: 1,
      result: {
        score: 100,
        verdict: "correct",
        feedback: "Correct.",
        errorTags: [],
        evalSource: "comparison",
      },
    };
  }

  const wordDiff = createWordDiff(userInput, matchedAnswer);
  if (hasMeaningRisk(userInput, matchedAnswer) || bestSimilarity < CLOSE_SIMILARITY) {
    return {
      kind: "ai-required",
      closestAnswer: matchedAnswer,
      similarity: bestSimilarity,
      wordDiff,
    };
  }

  if (bestSimilarity >= CORRECT_SIMILARITY) {
    return {
      kind: "graded",
      matchedAnswer,
      similarity: bestSimilarity,
      result: {
        score: correctScore(bestSimilarity),
        verdict: "correct",
        feedback: "Correct — check the highlighted spelling detail.",
        wordDiff,
        errorTags: [],
        evalSource: "comparison",
      },
    };
  }

  return {
    kind: "graded",
    matchedAnswer,
    similarity: bestSimilarity,
    result: {
      score: closeScore(bestSimilarity),
      verdict: "close",
      feedback: "Almost — check the highlighted words.",
      wordDiff,
      errorTags: [],
      evalSource: "comparison",
    },
  };
}
