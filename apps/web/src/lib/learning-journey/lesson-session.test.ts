import { describe, expect, it } from "vitest";

import { resolvePromotedLesson } from "./promoted-lesson";
import {
  appendContextualExchange,
  applyLessonEvaluation,
  continueToCheck,
  lessonRecommendation,
  revealNextHint,
  startLessonCheckpoint,
} from "./lesson-session";

function lesson() {
  const resolved = resolvePromotedLesson("es-AR");
  if (resolved.status !== "ready") throw new Error("Expected promoted lesson.");
  return resolved.lesson;
}

describe("finite lesson checkpoint", () => {
  it("keeps teaching, hint, question, miss, correction, and completion in finite order", () => {
    const promoted = lesson();
    let checkpoint = startLessonCheckpoint({ lesson: promoted, sessionId: "lesson-session-1" });
    expect(checkpoint.position).toBe("teaching");
    checkpoint = continueToCheck(checkpoint);
    checkpoint = revealNextHint(checkpoint);
    checkpoint = appendContextualExchange(checkpoint, {
      answer: "The ending changes with the person.",
      answeredAt: "2026-08-25T20:00:00.000Z",
      kind: "ai-explanation",
      question: "Why does the ending change?",
      requestId: "request-1",
    });
    checkpoint = applyLessonEvaluation(checkpoint, "Tú vives aquí.", {
      status: "graded",
      score: 35,
      verdict: "wrong",
      feedback: "Use the active Argentine form.",
      errorTags: [],
      evalSource: "comparison",
      correction: { text: "Vos vivís acá.", highlights: [] },
    }, "2026-08-25T20:01:00.000Z");
    expect(checkpoint).toMatchObject({
      position: "check",
      attempts: [{ assisted: true, verdict: "wrong" }],
    });
    checkpoint = applyLessonEvaluation(checkpoint, "Vos vivís acá.", {
      status: "graded",
      score: 100,
      verdict: "correct",
      feedback: "Correct.",
      errorTags: [],
      evalSource: "comparison",
    }, "2026-08-25T20:02:00.000Z");
    expect(checkpoint).toMatchObject({ position: "complete", completedAt: "2026-08-25T20:02:00.000Z" });
    expect(lessonRecommendation(promoted, checkpoint)).toMatchObject({
      collectionId: "collection.a1.present-regular-ir",
      reason: expect.stringContaining("needed a correction"),
    });
  });

  it("deduplicates contextual requests and never advances the lesson", () => {
    const promoted = lesson();
    const base = continueToCheck(startLessonCheckpoint({ lesson: promoted, sessionId: "session" }));
    const exchange = {
      answer: "A bounded explanation.",
      answeredAt: "2026-08-25T20:00:00.000Z",
      kind: "ai-explanation" as const,
      question: "Why this form?",
      requestId: "same-request",
    };
    const once = appendContextualExchange(base, exchange);
    const twice = appendContextualExchange(once, { ...exchange, answer: "Conflicting answer" });
    expect(twice.exchanges).toEqual([exchange]);
    expect(twice.position).toBe("check");
  });

  it("refuses to construct a checkpoint beyond the retained exchange limit", () => {
    const promoted = lesson();
    let checkpoint = startLessonCheckpoint({ lesson: promoted, sessionId: "session" });
    for (let index = 0; index < 24; index += 1) {
      checkpoint = appendContextualExchange(checkpoint, {
        answer: `Answer ${index + 1}`,
        answeredAt: `2026-08-${String(index + 1).padStart(2, "0")}T20:00:00.000Z`,
        kind: "ai-explanation",
        question: `Question ${index + 1}`,
        requestId: `request-${index + 1}`,
      });
    }

    expect(() => appendContextualExchange(checkpoint, {
      answer: "Answer 25",
      answeredAt: "2026-08-25T20:00:00.000Z",
      kind: "ai-explanation",
      question: "Question 25",
      requestId: "request-25",
    })).toThrow();
  });
});
