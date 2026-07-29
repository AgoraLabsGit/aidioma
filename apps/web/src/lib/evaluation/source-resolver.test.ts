import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  EVALUATION_ANSWER_MAX_COUNT,
  EVALUATION_ANSWER_MAX_LENGTH,
  EVALUATION_SOURCE_TEXT_MAX_LENGTH,
  EvaluationSourceIntegrityError,
  EvaluationSourceNotFoundError,
  resolveLessonSource,
  type LessonSourceRepository,
  type LessonSourceRow,
} from "./source-resolver";

const vocabPayload = {
  es: "adiós",
  en: "goodbye",
  acceptedEs: ["hasta luego", { text: "chau", region: "AR" }],
  acceptedEn: ["bye"],
  pos: "other",
  exampleEs: "Adiós, señor.",
  exampleEn: "Goodbye, sir.",
};

const sentencePayload = {
  es: "Hola, soy Ana.",
  en: "Hi, I'm Ana.",
  acceptedEs: ["Hola, yo soy Ana."],
  acceptedEn: ["Hello, I'm Ana."],
  vocabRefs: ["a1-01.v.hola"],
  hints: ["one", "two", "three"],
};

function row(overrides: Partial<LessonSourceRow> = {}): LessonSourceRow {
  return {
    id: "a1-01.v.adios",
    lessonId: "a1-01-hola-me-llamo",
    kind: "vocab",
    payload: vocabPayload,
    grammarTags: [],
    difficulty: null,
    contentVersion: 3,
    deprecated: false,
    ...overrides,
  };
}

function repository(found: LessonSourceRow | undefined): LessonSourceRepository & {
  findActiveItem: ReturnType<typeof vi.fn>;
} {
  return {
    findActiveItem: vi.fn().mockResolvedValue(found),
  };
}

describe("lesson evaluation source resolver", () => {
  it("resolves a server-owned vocab answer set in each direction", async () => {
    const sourceRepository = repository(row());

    const spanish = await resolveLessonSource(
      "a1-01.v.adios",
      "en-es",
      sourceRepository,
    );
    const english = await resolveLessonSource(
      "a1-01.v.adios",
      "es-en",
      sourceRepository,
    );

    expect(sourceRepository.findActiveItem).toHaveBeenCalledWith("a1-01.v.adios");
    expect(spanish).toMatchObject({
      sourceType: "lesson",
      itemRef: "a1-01.v.adios",
      lessonId: "a1-01-hola-me-llamo",
      authoritativeAnswers: ["adiós", "hasta luego"],
      grammarTags: [],
      contentVersion: 3,
    });
    expect(english.authoritativeAnswers).toEqual(["goodbye", "bye"]);
  });

  it("reconstructs sentence-only fields from authoritative columns", async () => {
    const sourceRepository = repository(
      row({
        id: "a1-01.s.01",
        kind: "sentence",
        payload: {
          ...sentencePayload,
          id: "spoofed-id",
          kind: "vocab",
          grammarTags: ["verb.estar"],
          difficulty: 5,
        },
        grammarTags: ["verb.ser"],
        difficulty: 1,
      }),
    );

    const result = await resolveLessonSource(
      "a1-01.s.01",
      "en-es",
      sourceRepository,
    );

    expect(result.item).toMatchObject({
      id: "a1-01.s.01",
      kind: "sentence",
      grammarTags: ["verb.ser"],
      difficulty: 1,
    });
    expect(result.grammarTags).toEqual(["verb.ser"]);
    expect(result.authoritativeAnswers).toEqual([
      "Hola, soy Ana.",
      "Hola, yo soy Ana.",
    ]);
  });

  it.each([
    ["missing", undefined],
    ["deprecated", row({ deprecated: true })],
    ["unsupported", row({ kind: "multipleChoice", payload: {} })],
  ])("uses the same not-found error for %s and incompatible sources", async (_case, found) => {
    await expect(
      resolveLessonSource("item-ref", "en-es", repository(found)),
    ).rejects.toBeInstanceOf(EvaluationSourceNotFoundError);
  });

  it.each([
    ["non-object payload", row({ payload: null })],
    ["malformed vocab", row({ payload: { es: "hola" } })],
    [
      "malformed sentence columns",
      row({
        kind: "sentence",
        payload: sentencePayload,
        grammarTags: ["not.a.real.tag"],
        difficulty: null,
      }),
    ],
  ])("rejects %s as a source-integrity failure", async (_case, found) => {
    await expect(
      resolveLessonSource(found.id, "en-es", repository(found)),
    ).rejects.toBeInstanceOf(EvaluationSourceIntegrityError);
  });

  it("rejects an empty authoritative answer set", async () => {
    const emptyAnswers = row({
      payload: {
        ...vocabPayload,
        es: "   ",
        acceptedEs: ["", { text: "   " }],
      },
    });

    await expect(
      resolveLessonSource(emptyAnswers.id, "en-es", repository(emptyAnswers)),
    ).rejects.toBeInstanceOf(EvaluationSourceIntegrityError);
  });

  it("rejects authored grading data that exceeds the bounded AI prompt budget", async () => {
    const tooManyAnswers = row({
      payload: {
        ...vocabPayload,
        acceptedEs: Array.from(
          { length: EVALUATION_ANSWER_MAX_COUNT + 1 },
          (_, index) => `answer ${index}`,
        ),
      },
    });
    const longAnswer = row({
      payload: {
        ...vocabPayload,
        acceptedEs: ["x".repeat(EVALUATION_ANSWER_MAX_LENGTH + 1)],
      },
    });
    const longSource = row({
      payload: {
        ...vocabPayload,
        en: "x".repeat(EVALUATION_SOURCE_TEXT_MAX_LENGTH + 1),
      },
    });

    await expect(
      resolveLessonSource(tooManyAnswers.id, "en-es", repository(tooManyAnswers)),
    ).rejects.toBeInstanceOf(EvaluationSourceIntegrityError);
    await expect(
      resolveLessonSource(longAnswer.id, "en-es", repository(longAnswer)),
    ).rejects.toBeInstanceOf(EvaluationSourceIntegrityError);
    await expect(
      resolveLessonSource(longSource.id, "en-es", repository(longSource)),
    ).rejects.toBeInstanceOf(EvaluationSourceIntegrityError);
  });

  it("expands authored vocab display variants without invoking AI", async () => {
    const variants = row({
      payload: {
        ...vocabPayload,
        en: "hello / hi",
        acceptedEn: [],
      },
    });

    const result = await resolveLessonSource(
      variants.id,
      "es-en",
      repository(variants),
    );

    expect(result.authoritativeAnswers).toEqual(["hello", "hi"]);
  });

  it("does not expose repository rows through resolver errors", async () => {
    const malformed = row({ payload: { secretAnswer: "hidden" } });

    await expect(
      resolveLessonSource(malformed.id, "en-es", repository(malformed)),
    ).rejects.toThrow("The requested evaluation source is not valid for grading.");
  });
});
