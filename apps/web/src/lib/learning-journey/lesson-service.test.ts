import { describe, expect, it } from "vitest";

import type { PracticeSessionEvaluation, PracticeSessionEvaluator } from "@/lib/practice-serving/session-service";

import { InMemoryLessonProgressRepository } from "./in-memory-lesson-repository";
import { LessonJourneyService, type ContextualHelpResult, type LessonContextualAnswerer } from "./lesson-service";

class QueueEvaluator implements PracticeSessionEvaluator {
  private readonly queue: PracticeSessionEvaluation[] = [
    {
      status: "graded",
      evaluation: {
        status: "graded",
        score: 35,
        verdict: "wrong",
        feedback: "Use the active Argentine form.",
        errorTags: [],
        evalSource: "comparison",
        correction: { text: "Vos vivís acá.", highlights: [] },
      },
    },
    {
      status: "graded",
      evaluation: {
        status: "graded",
        score: 100,
        verdict: "correct",
        feedback: "Correct.",
        errorTags: [],
        evalSource: "comparison",
      },
    },
  ];
  async evaluate() {
    return this.queue.shift() ?? this.queue[1];
  }
}

class ContextualAnswerer implements LessonContextualAnswerer {
  readonly requests: Parameters<LessonContextualAnswerer["answer"]>[0][] = [];
  async answer(input: Parameters<LessonContextualAnswerer["answer"]>[0]): Promise<ContextualHelpResult> {
    this.requests.push(input);
    return { status: "answered", answer: "The ending matches the person you address.", kind: "ai-explanation" };
  }
}

describe("durable finite lesson service", () => {
  it("retains position and question, marks assistance, completes idempotently, and unlocks review", async () => {
    const repository = new InMemoryLessonProgressRepository();
    const contextual = new ContextualAnswerer();
    let minute = 0;
    const service = new LessonJourneyService(repository, new QueueEvaluator(), contextual, {
      randomId: () => "lesson-session-1",
      now: () => new Date(`2026-08-25T20:0${minute++}:00.000Z`),
    });
    const started = await service.start({ learnerId: "learner-1", profile: "es-AR" });
    expect(started).toMatchObject({ ok: true, value: { checkpoint: { position: "teaching" } } });
    if (!started.ok) return;
    const continued = await service.continue({ learnerId: "learner-1", sessionId: "lesson-session-1", expectedRevision: 1 });
    expect(continued).toMatchObject({ ok: true, value: { checkpoint: { position: "check" }, revision: 2 } });
    if (!continued.ok) return;
    const asked = await service.question({
      learnerId: "learner-1",
      sessionId: "lesson-session-1",
      expectedRevision: 2,
      requestId: "00000000-0000-4000-8000-000000000001",
      question: "Why does the ending change?",
    });
    expect(asked).toMatchObject({ ok: true, value: { checkpoint: { assistedCurrentAttempt: true, exchanges: [{ kind: "ai-explanation" }] } } });
    if (!asked.ok) return;
    expect(await service.question({
      learnerId: "learner-1",
      sessionId: "lesson-session-1",
      expectedRevision: 2,
      requestId: "00000000-0000-4000-8000-000000000001",
      question: "Conflicting duplicate",
    })).toEqual(asked);
    const missed = await service.answer({ learnerId: "learner-1", sessionId: "lesson-session-1", expectedRevision: 3, answer: "Tú vives aquí." });
    expect(missed).toMatchObject({ ok: true, value: { checkpoint: { position: "check", attempts: [{ assisted: true, verdict: "wrong" }] } } });
    const corrected = await service.answer({ learnerId: "learner-1", sessionId: "lesson-session-1", expectedRevision: 4, answer: "Vos vivís acá." });
    expect(corrected).toMatchObject({ ok: true, value: { status: "completed", checkpoint: { position: "complete" } } });
    expect(await service.answer({ learnerId: "learner-1", sessionId: "lesson-session-1", expectedRevision: 4, answer: "duplicate completion" })).toEqual(corrected);
    expect(await repository.unlockedCollectionIds("learner-1")).toEqual([
      "collection.a1.home-location",
      "collection.a1.present-regular-ir",
    ]);
  });

  it("uses an authored hint instead of AI for a direct-answer request before the first attempt", async () => {
    const repository = new InMemoryLessonProgressRepository();
    const contextual = new ContextualAnswerer();
    const service = new LessonJourneyService(repository, new QueueEvaluator(), contextual, { randomId: () => "session" });
    await service.start({ learnerId: "learner", profile: "es-AR" });
    await service.continue({ learnerId: "learner", sessionId: "session", expectedRevision: 1 });
    const result = await service.question({
      learnerId: "learner",
      sessionId: "session",
      expectedRevision: 2,
      requestId: "00000000-0000-4000-8000-000000000002",
      question: "What should I type as the answer?",
    });
    expect(result).toMatchObject({ ok: true, value: { checkpoint: { revealedHints: 1, exchanges: [{ kind: "authored-hint" }] } } });
    expect(contextual.requests).toHaveLength(0);
  });

  it("allows the 24th retained exchange and rejects the 25th before provider generation", async () => {
    const repository = new InMemoryLessonProgressRepository();
    const contextual = new ContextualAnswerer();
    const service = new LessonJourneyService(repository, new QueueEvaluator(), contextual, {
      randomId: () => "session",
      now: () => new Date("2026-08-26T20:00:00.000Z"),
    });
    const started = await service.start({ learnerId: "learner", profile: "es-AR" });
    if (!started.ok) throw new Error("Expected a lesson session.");
    repository.records.set(`learner\u001f${started.value.checkpoint.lessonId}`, {
      ...started.value,
      checkpoint: {
        ...started.value.checkpoint,
        exchanges: Array.from({ length: 23 }, (_, index) => ({
          answer: `Retained answer ${index + 1}`,
          answeredAt: `2026-08-${String(index + 1).padStart(2, "0")}T18:00:00.000Z`,
          kind: "ai-explanation" as const,
          question: `Retained question ${index + 1}`,
          requestId: `retained-${index + 1}`,
        })),
      },
    });

    const twentyFourth = await service.question({
      learnerId: "learner",
      sessionId: "session",
      expectedRevision: 1,
      requestId: "00000000-0000-4000-8000-000000000024",
      question: "Why does this form change?",
    });
    expect(twentyFourth).toMatchObject({
      ok: true,
      value: { checkpoint: { exchanges: expect.arrayContaining([
        expect.objectContaining({ requestId: "00000000-0000-4000-8000-000000000024" }),
      ]) } },
    });

    const twentyFifth = await service.question({
      learnerId: "learner",
      sessionId: "session",
      expectedRevision: 2,
      requestId: "00000000-0000-4000-8000-000000000025",
      question: "Can I ask one more question?",
    });
    expect(twentyFifth).toEqual({
      ok: false,
      failure: "question_rate_limited",
      message: "This lesson has reached its Ask AIdioma limit. Continue the lesson without another question.",
      retryable: false,
    });
    expect(contextual.requests).toHaveLength(1);
  });

  it("fails closed when retained progress belongs to another content version", async () => {
    const repository = new InMemoryLessonProgressRepository();
    const contextual = new ContextualAnswerer();
    const service = new LessonJourneyService(repository, new QueueEvaluator(), contextual, {
      randomId: () => "session",
    });
    const started = await service.start({ learnerId: "learner", profile: "es-AR" });
    if (!started.ok) throw new Error("Expected a lesson session.");
    repository.records.set(`learner\u001f${started.value.checkpoint.lessonId}`, {
      ...started.value,
      checkpoint: {
        ...started.value.checkpoint,
        contentVersion: started.value.checkpoint.contentVersion + 1,
      },
    });

    await expect(service.current("learner")).resolves.toMatchObject({
      ok: false,
      failure: "lesson_content_changed",
    });
    await expect(service.start({ learnerId: "learner", profile: "es-AR" })).resolves.toMatchObject({
      ok: false,
      failure: "lesson_content_changed",
    });
    await expect(service.continue({
      learnerId: "learner",
      sessionId: "session",
      expectedRevision: 1,
    })).resolves.toMatchObject({ ok: false, failure: "lesson_content_changed" });
    await expect(service.question({
      learnerId: "learner",
      sessionId: "session",
      expectedRevision: 1,
      requestId: "00000000-0000-4000-8000-000000000026",
      question: "Why does this form change?",
    })).resolves.toMatchObject({ ok: false, failure: "lesson_content_changed" });
    await expect(service.answer({
      learnerId: "learner",
      sessionId: "session",
      expectedRevision: 1,
      answer: "Vos vivís acá.",
    })).resolves.toMatchObject({ ok: false, failure: "lesson_content_changed" });
    expect(contextual.requests).toHaveLength(0);
  });
});
