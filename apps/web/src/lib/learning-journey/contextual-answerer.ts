import "server-only";

import { createHash } from "node:crypto";

import {
  GatewayContextualHelpProvider,
  type ContextualHelpProvider,
} from "@/lib/contextual-help";

import type {
  ContextualHelpResult,
  LessonContextualAnswerer,
} from "./lesson-service";

export class ProductionLessonContextualAnswerer implements LessonContextualAnswerer {
  constructor(private readonly provider: ContextualHelpProvider = new GatewayContextualHelpProvider()) {}

  async answer(
    input: Parameters<LessonContextualAnswerer["answer"]>[0],
  ): Promise<ContextualHelpResult> {
    const generated = await this.provider.ask({
      question: input.question,
      promotedSource: {
        id: input.lesson.id,
        version: input.lesson.contentVersion,
      },
      objective: input.lesson.objective,
      currentItem: {
        id: input.lesson.item.itemId,
        prompt: input.lesson.item.prompt,
        target: input.lesson.item.target,
        acceptedAnswers: input.lesson.item.acceptedAnswers,
        authoredHints: input.lesson.hints,
      },
      learnerLevel: input.lesson.cefr as "A1" | "A2" | "B1" | "B2" | "C1",
      spanishProfile: input.lesson.profile,
      ...(input.latestAttempt
        ? {
            latestAttempt: {
              answer: input.latestAttempt.answer,
              feedback: input.latestAttempt.feedback,
              verdict: input.latestAttempt.verdict,
            },
          }
        : {}),
      mayRevealAnswer: input.canRevealAnswer,
      userTrackingId: `usr_${createHash("sha256").update(input.learnerId).digest("hex").slice(0, 32)}`,
      signal: input.signal,
    });
    if (generated.kind === "unavailable") {
      return {
        status: "unavailable",
        retryable: generated.retryable,
        message: generated.retryable
          ? "I couldn’t answer that right now. Your lesson is unchanged—try again."
          : "Ask AIdioma is unavailable right now. Your lesson is unchanged.",
      };
    }
    return {
      status: "answered",
      answer: generated.message,
      kind: generated.kind,
    };
  }
}
