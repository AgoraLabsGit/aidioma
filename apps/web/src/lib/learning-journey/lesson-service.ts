import { randomUUID } from "node:crypto";

import type { DialectProfile } from "@aidioma/lesson-schema";

import type { PracticeSessionEvaluator } from "@/lib/practice-serving/session-service";

import {
  appendContextualExchange,
  applyLessonEvaluation,
  continueToCheck,
  LESSON_CONTEXTUAL_EXCHANGE_LIMIT,
  revealNextHint,
  startLessonCheckpoint,
  type ContextualExchange,
  type LessonCheckpoint,
} from "./lesson-session";
import {
  PROMOTED_LESSON_ID,
  resolvePromotedLesson,
  type PromotedLesson,
} from "./promoted-lesson";
import type {
  LessonProgressRepository,
  RetainedLessonProgress,
} from "./lesson-repository";

const QUESTION_LIMIT_PER_MINUTE = 4;

export type ContextualHelpResult =
  | { status: "answered"; answer: string; kind: "ai-explanation" | "topic-redirect" }
  | { status: "unavailable"; message: string; retryable: boolean };

export interface LessonContextualAnswerer {
  answer(input: {
    canRevealAnswer: boolean;
    learnerId: string;
    lesson: PromotedLesson;
    question: string;
    signal?: AbortSignal;
    latestAttempt?: LessonCheckpoint["attempts"][number];
  }): Promise<ContextualHelpResult>;
}

export type LessonJourneyFailure =
  | "contextual_help_unavailable"
  | "lesson_conflict"
  | "lesson_content_changed"
  | "lesson_not_found"
  | "lesson_unavailable"
  | "question_rate_limited"
  | "answer_ungraded";

export type LessonJourneyResult<T> =
  | { ok: true; value: T }
  | { ok: false; failure: LessonJourneyFailure; message: string; retryable?: boolean };

function fail(
  failure: LessonJourneyFailure,
  message: string,
  retryable?: boolean,
): LessonJourneyResult<never> {
  return { ok: false, failure, message, ...(retryable === undefined ? {} : { retryable }) };
}

function directAnswerRequest(question: string): boolean {
  return /(?:\b(?:answer|translation|translate it|give me (?:the )?(?:answer|translation)|how (?:do i|do you|should i) say|what (?:do|should) i (?:say|type|write)|what is the spanish|tell me what to (?:say|type|write))\b|\b(?:respuesta|traducci[oó]n|c[oó]mo se dice)\b)/iu.test(question);
}

export class LessonJourneyService {
  constructor(
    private readonly repository: LessonProgressRepository,
    private readonly evaluator: PracticeSessionEvaluator,
    private readonly contextual: LessonContextualAnswerer,
    private readonly options: { now?: () => Date; randomId?: () => string } = {},
  ) {}

  private now(): Date {
    return this.options.now?.() ?? new Date();
  }

  private lesson(profile: DialectProfile): LessonJourneyResult<PromotedLesson> {
    const resolved = resolvePromotedLesson(profile);
    return resolved.status === "ready"
      ? { ok: true, value: resolved.lesson }
      : fail("lesson_unavailable", "This reviewed lesson is unavailable right now.");
  }

  private retainedLesson(record: RetainedLessonProgress): LessonJourneyResult<PromotedLesson> {
    const promoted = this.lesson(record.checkpoint.profile);
    if (!promoted.ok) return promoted;
    if (
      promoted.value.id !== record.checkpoint.lessonId ||
      promoted.value.contentVersion !== record.checkpoint.contentVersion
    ) {
      return fail(
        "lesson_content_changed",
        "This lesson changed since you started it and cannot be resumed right now.",
      );
    }
    return promoted;
  }

  async current(
    learnerId: string,
  ): Promise<LessonJourneyResult<RetainedLessonProgress | null>> {
    const record = await this.repository.find(learnerId, PROMOTED_LESSON_ID);
    if (!record) return { ok: true, value: null };
    const promoted = this.retainedLesson(record);
    return promoted.ok ? { ok: true, value: record } : promoted;
  }

  async start(input: {
    learnerId: string;
    profile: DialectProfile;
  }): Promise<LessonJourneyResult<RetainedLessonProgress>> {
    const promoted = this.lesson(input.profile);
    if (!promoted.ok) return promoted;
    const existing = await this.repository.find(input.learnerId, promoted.value.id);
    if (existing) {
      return existing.checkpoint.contentVersion === promoted.value.contentVersion
        ? { ok: true, value: existing }
        : fail(
            "lesson_content_changed",
            "This lesson changed since you started it and cannot be resumed right now.",
          );
    }
    const checkpoint = startLessonCheckpoint({
      lesson: promoted.value,
      sessionId: this.options.randomId?.() ?? randomUUID(),
    });
    return {
      ok: true,
      value: await this.repository.create({
        checkpoint,
        learnerId: input.learnerId,
        revision: 1,
        status: "active",
      }),
    };
  }

  private async active(input: {
    expectedRevision: number;
    learnerId: string;
    sessionId: string;
  }): Promise<LessonJourneyResult<RetainedLessonProgress>> {
    const record = await this.repository.find(input.learnerId, PROMOTED_LESSON_ID);
    if (!record || record.checkpoint.sessionId !== input.sessionId) {
      return fail("lesson_not_found", "This lesson session is unavailable.");
    }
    if (record.revision !== input.expectedRevision) {
      return fail("lesson_conflict", "The lesson changed in another request. Refresh and continue.");
    }
    const promoted = this.retainedLesson(record);
    return promoted.ok ? { ok: true, value: record } : promoted;
  }

  private async commit(
    record: RetainedLessonProgress,
    checkpoint: LessonCheckpoint,
  ): Promise<LessonJourneyResult<RetainedLessonProgress>> {
    const committed = await this.repository.commit({
      checkpoint,
      expectedRevision: record.revision,
      learnerId: record.learnerId,
      lessonId: checkpoint.lessonId,
      status: checkpoint.position === "complete" ? "completed" : "active",
    });
    return committed === "conflict"
      ? fail("lesson_conflict", "The lesson changed in another request. Refresh and continue.")
      : { ok: true, value: committed };
  }

  async continue(input: {
    expectedRevision: number;
    learnerId: string;
    sessionId: string;
  }): Promise<LessonJourneyResult<RetainedLessonProgress>> {
    const active = await this.active(input);
    if (!active.ok) return active;
    return this.commit(active.value, continueToCheck(active.value.checkpoint));
  }

  async hint(input: {
    expectedRevision: number;
    learnerId: string;
    sessionId: string;
  }): Promise<LessonJourneyResult<RetainedLessonProgress>> {
    const active = await this.active(input);
    if (!active.ok) return active;
    return this.commit(active.value, revealNextHint(active.value.checkpoint));
  }

  async question(input: {
    expectedRevision: number;
    learnerId: string;
    question: string;
    requestId: string;
    sessionId: string;
    signal?: AbortSignal;
  }): Promise<LessonJourneyResult<RetainedLessonProgress>> {
    const existing = await this.repository.find(input.learnerId, PROMOTED_LESSON_ID);
    if (!existing || existing.checkpoint.sessionId !== input.sessionId) {
      return fail("lesson_not_found", "This lesson session is unavailable.");
    }
    const promoted = this.retainedLesson(existing);
    if (!promoted.ok) return promoted;
    if (existing.checkpoint.exchanges.some((exchange) => exchange.requestId === input.requestId)) {
      return { ok: true, value: existing };
    }
    if (existing.revision !== input.expectedRevision) {
      return fail("lesson_conflict", "The lesson changed in another request. Refresh and continue.");
    }
    if (existing.checkpoint.position === "complete") {
      return fail("lesson_conflict", "This lesson is already complete.");
    }
    if (existing.checkpoint.exchanges.length >= LESSON_CONTEXTUAL_EXCHANGE_LIMIT) {
      return fail(
        "question_rate_limited",
        "This lesson has reached its Ask AIdioma limit. Continue the lesson without another question.",
        false,
      );
    }

    const now = this.now();
    const recentQuestions = existing.checkpoint.exchanges.filter(
      (exchange) => now.getTime() - Date.parse(exchange.answeredAt) < 60_000,
    ).length;
    if (recentQuestions >= QUESTION_LIMIT_PER_MINUTE) {
      return fail(
        "question_rate_limited",
        "Ask AIdioma is taking a short pause. Continue the lesson or try again in a minute.",
        true,
      );
    }
    let checkpoint = existing.checkpoint;
    let exchange: ContextualExchange;
    if (
      checkpoint.position === "check" &&
      checkpoint.attempts.length === 0 &&
      directAnswerRequest(input.question)
    ) {
      checkpoint = revealNextHint(checkpoint);
      const hintIndex = Math.max(0, checkpoint.revealedHints - 1);
      exchange = {
        answer: promoted.value.hints[hintIndex] ?? "No additional authored hint is available.",
        answeredAt: now.toISOString(),
        kind: "authored-hint",
        question: input.question.trim(),
        requestId: input.requestId,
      };
    } else {
      const generated = await this.contextual.answer({
        canRevealAnswer: checkpoint.attempts.length > 0,
        learnerId: input.learnerId,
        lesson: promoted.value,
        question: input.question.trim(),
        signal: input.signal,
        ...(checkpoint.attempts.at(-1)
          ? { latestAttempt: checkpoint.attempts.at(-1) }
          : {}),
      });
      if (generated.status === "unavailable") {
        return fail(
          "contextual_help_unavailable",
          generated.message,
          generated.retryable,
        );
      }
      exchange = {
        answer: generated.answer,
        answeredAt: now.toISOString(),
        kind: generated.kind,
        question: input.question.trim(),
        requestId: input.requestId,
      };
    }
    return this.commit(existing, appendContextualExchange(checkpoint, exchange));
  }

  async answer(input: {
    answer: string;
    expectedRevision: number;
    learnerId: string;
    sessionId: string;
    signal?: AbortSignal;
  }): Promise<LessonJourneyResult<RetainedLessonProgress>> {
    const completed = await this.repository.find(input.learnerId, PROMOTED_LESSON_ID);
    if (completed?.checkpoint.sessionId === input.sessionId) {
      const promoted = this.retainedLesson(completed);
      if (!promoted.ok) return promoted;
      if (completed.checkpoint.position === "complete") {
        return { ok: true, value: completed };
      }
    }
    const active = await this.active(input);
    if (!active.ok) return active;
    if (active.value.checkpoint.position !== "check") {
      return fail("lesson_conflict", "Continue to the lesson check before answering.");
    }
    const promoted = this.retainedLesson(active.value);
    if (!promoted.ok) return promoted;
    const evaluation = await this.evaluator.evaluate({
      answer: input.answer,
      item: promoted.value.item,
      learnerId: input.learnerId,
      signal: input.signal,
    });
    if (evaluation.status === "ungraded") {
      return fail("answer_ungraded", evaluation.message, evaluation.retryable);
    }
    return this.commit(
      active.value,
      applyLessonEvaluation(
        active.value.checkpoint,
        input.answer,
        evaluation.evaluation,
        this.now().toISOString(),
      ),
    );
  }
}
