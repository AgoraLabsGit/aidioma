import type {
  AcceptedEntry,
  PassageSegment,
  SentenceItem,
  VocabItem,
} from "@aidioma/lesson-schema";

import {
  EVALUATION_INPUT_MAX_LENGTH,
  EVALUATION_WORD_DIFF_MAX_ENTRIES,
  EVALUATION_WORD_DIFF_TEXT_MAX_LENGTH,
  type EvaluationDirection,
  type EvaluationResult,
  type WordDiffEntry,
} from "./contracts";

const CLOSE_SIMILARITY = 0.7;

const NEGATION_WORDS = new Set([
  "no",
  "not",
  "never",
  "cannot",
  "neither",
  "nor",
  "without",
  "nobody",
  "nothing",
  "nowhere",
  "nunca",
  "jamás",
  "nadie",
  "nada",
  "tampoco",
  "ni",
  "sin",
  "ningún",
  "ninguno",
  "ninguna",
  "ningunos",
  "ningunas",
]);

const NUMBER_WORDS = new Set([
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
  "hundred",
  "cero",
  "un",
  "uno",
  "una",
  "dos",
  "tres",
  "cuatro",
  "cinco",
  "seis",
  "siete",
  "ocho",
  "nueve",
  "diez",
  "once",
  "doce",
  "trece",
  "catorce",
  "quince",
  "dieciséis",
  "diecisiete",
  "dieciocho",
  "diecinueve",
  "veinte",
  "veintiún",
  "veintiuno",
  "veintiuna",
  "veintidós",
  "veintitrés",
  "veinticuatro",
  "veinticinco",
  "veintiséis",
  "veintisiete",
  "veintiocho",
  "veintinueve",
  "treinta",
  "cuarenta",
  "cincuenta",
  "sesenta",
  "setenta",
  "ochenta",
  "noventa",
  "cien",
  "ciento",
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
  let prepared = text
    .normalize("NFC")
    .replace(/[\u2018\u2019\u02bc]/gu, "'")
    .replace(/[\u2010-\u2015\u2212]/gu, "-")
    .replace(/[.,!?¿¡:;…"“”«»()[\]{}]/gu, " ")
    // Apostrophes inside words carry meaning in English contractions. Quotes
    // around a word do not, so remove only non-internal apostrophes.
    .replace(/(?<![\p{L}\p{N}])'|'(?![\p{L}\p{N}])/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();

  if (!lowercase) return prepared;

  prepared = prepared.toLowerCase();
  return prepared.replace(/\bcannot\b/gu, "can not")
    .replace(/\b(can)'t\b/gu, "$1 not")
    .replace(/\bwon't\b/gu, "will not")
    .replace(/\bshan't\b/gu, "shall not")
    .replace(/\b([\p{L}]+)n't\b/gu, "$1 not");
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
  const steps = diffTokens(userInput, expected);

  return createBoundedWordDiff(userDisplay, expectedDisplay, steps);
}

function boundText(value: string): string {
  if (value.length <= EVALUATION_WORD_DIFF_TEXT_MAX_LENGTH) return value;

  const codePoints = Array.from(value);
  let head = "";
  let tail = "";
  for (const codePoint of codePoints) {
    if (head.length + codePoint.length > 99) break;
    head += codePoint;
  }
  for (let index = codePoints.length - 1; index >= 0; index -= 1) {
    const codePoint = codePoints[index];
    if (tail.length + codePoint.length > 100) break;
    tail = codePoint + tail;
  }
  return `${head}…${tail}`;
}

function boundTextAround(value: string, focusIndex: number): string {
  if (value.length <= EVALUATION_WORD_DIFF_TEXT_MAX_LENGTH) return value;

  const codePoints = Array.from(value);
  const start = Math.max(0, Math.min(focusIndex - 40, codePoints.length - 1));
  const prefix = start > 0 ? "…" : "";
  let body = "";
  let index = start;
  const bodyBudget = EVALUATION_WORD_DIFF_TEXT_MAX_LENGTH - prefix.length - 1;

  while (index < codePoints.length && body.length + codePoints[index].length <= bodyBudget) {
    body += codePoints[index];
    index += 1;
  }

  return `${prefix}${body}${index < codePoints.length ? "…" : ""}`;
}

function firstDifferenceIndex(left: string, right: string): number {
  const leftCodePoints = Array.from(left);
  const rightCodePoints = Array.from(right);
  const sharedLength = Math.min(leftCodePoints.length, rightCodePoints.length);
  for (let index = 0; index < sharedLength; index += 1) {
    if (leftCodePoints[index] !== rightCodePoints[index]) return index;
  }
  return sharedLength;
}

function selectLearnerDiffSteps(steps: readonly DiffStep[]): DiffStep[] {
  if (steps.length <= EVALUATION_WORD_DIFF_MAX_ENTRIES) return [...steps];

  const changedIndexes = steps
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => step.type !== "same")
    .map(({ index }) => index);
  const selected = new Set(changedIndexes.slice(0, EVALUATION_WORD_DIFF_MAX_ENTRIES));

  for (let index = 0; selected.size < EVALUATION_WORD_DIFF_MAX_ENTRIES; index += 1) {
    if (!selected.has(index)) selected.add(index);
  }

  return [...selected]
    .sort((left, right) => left - right)
    .map((index) => steps[index]);
}

function createBoundedWordDiff(
  userDisplay: readonly string[],
  expectedDisplay: readonly string[],
  steps: readonly DiffStep[],
): WordDiffEntry[] {
  return selectLearnerDiffSteps(steps)
    .map((step) => {
      if (step.type === "same") {
        return { text: boundText(userDisplay[step.userIndex]), mark: "correct" };
      }

      if (step.type === "extra") {
        return { text: boundText(userDisplay[step.userIndex]), mark: "extra" };
      }

      if (step.type === "missing") {
        const expectedText = boundText(expectedDisplay[step.expectedIndex]);
        return { text: expectedText, mark: "missing", suggestion: expectedText };
      }

      const userText = userDisplay[step.userIndex];
      const expectedText = expectedDisplay[step.expectedIndex];
      const differenceIndex = firstDifferenceIndex(userText, expectedText);
      const wordSimilarity = comparisonSimilarity(
        normalizeForComparison(userText),
        normalizeForComparison(expectedText),
      );
      const wordDistance = levenshteinDistance(
        normalizeForComparison(userText),
        normalizeForComparison(expectedText),
      );

      return {
        text: boundTextAround(userText, differenceIndex),
        mark:
          wordDistance === 1 || wordSimilarity >= CLOSE_SIMILARITY ? "close" : "wrong",
        suggestion: boundTextAround(expectedText, differenceIndex),
      };
    });
}

function negationTokens(text: string): string[] {
  return normalizeForComparison(text)
    .split(" ")
    .filter((token) => NEGATION_WORDS.has(token));
}

function numberTokens(text: string): string[] {
  return normalizeForComparison(text)
    .split(" ")
    .filter((token) => {
      if (/\d/u.test(token)) return true;
      const wordCandidate = token.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
      return (
        NUMBER_WORDS.has(wordCandidate) ||
        (wordCandidate.includes("-") &&
          wordCandidate.split("-").every((part) => NUMBER_WORDS.has(part)))
      );
    });
}

function sequencesEqual(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function hasMeaningRisk(userInput: string, expected: string): boolean {
  return (
    !sequencesEqual(negationTokens(userInput), negationTokens(expected)) ||
    !sequencesEqual(numberTokens(userInput), numberTokens(expected))
  );
}

function diffNeedsSemanticReview(
  userDisplay: readonly string[],
  expectedDisplay: readonly string[],
  steps: readonly DiffStep[],
): boolean {
  return steps.some((step) => {
    if (step.type === "missing" || step.type === "extra") return true;
    if (step.type === "same") return false;

    const userToken = normalizeForComparison(userDisplay[step.userIndex]);
    const expectedToken = normalizeForComparison(expectedDisplay[step.expectedIndex]);
    return (
      levenshteinDistance(userToken, expectedToken) !== 1 &&
      comparisonSimilarity(userToken, expectedToken) < CLOSE_SIMILARITY
    );
  });
}

function closeScore(similarity: number): number {
  return Math.min(84, 60 + Math.round(((similarity - CLOSE_SIMILARITY) / 0.3) * 24));
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

  const userDisplay = prepareText(userInput, false).split(" ").filter(Boolean);
  const expectedDisplay = prepareText(matchedAnswer, false).split(" ").filter(Boolean);
  const steps = diffTokens(userInput, matchedAnswer);
  const wordDiff = createBoundedWordDiff(userDisplay, expectedDisplay, steps);
  if (
    hasMeaningRisk(userInput, matchedAnswer) ||
    diffNeedsSemanticReview(userDisplay, expectedDisplay, steps) ||
    bestSimilarity < CLOSE_SIMILARITY
  ) {
    return {
      kind: "ai-required",
      closestAnswer: matchedAnswer,
      similarity: bestSimilarity,
      wordDiff,
    };
  }

  return {
    kind: "graded",
    matchedAnswer,
    similarity: bestSimilarity,
    result: {
      score: closeScore(bestSimilarity),
      verdict: "close",
      feedback: "Almost — check the highlighted spelling or word form.",
      wordDiff,
      errorTags: [],
      evalSource: "comparison",
    },
  };
}
