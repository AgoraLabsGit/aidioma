import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { createCorrectionPresentation } from "@/lib/evaluation/comparison";
import { EvaluationService } from "@/lib/evaluation/evaluation-service";
import { GatewayAiVerdictGenerator } from "@/lib/evaluation/gateway-evaluator";

import type {
  PracticeSessionEvaluation,
  PracticeSessionEvaluator,
} from "./session-service";

export class ProductionPracticeSessionEvaluator implements PracticeSessionEvaluator {
  constructor(
    private readonly service = new EvaluationService(new GatewayAiVerdictGenerator()),
  ) {}

  async evaluate(
    input: Parameters<PracticeSessionEvaluator["evaluate"]>[0],
  ): Promise<PracticeSessionEvaluation> {
    const outcome = await this.service.evaluate({
      requestId: randomUUID(),
      request: {
        sourceType: "set",
        itemRef: input.item.itemId,
        modality: "translate",
        direction: "en-es",
        userInput: input.answer,
      },
      source: {
        sourceText: input.item.prompt,
        authoritativeAnswers: input.item.acceptedAnswers,
        grammarTags: [],
        assessmentGoal: `${input.item.cue} Use the active ${input.item.profile} profile.`,
      },
      userTrackingId: `usr_${createHash("sha256").update(input.learnerId).digest("hex").slice(0, 32)}`,
      signal: input.signal,
    });
    if (outcome.kind !== "graded") {
      const retryable = outcome.kind === "ungraded" && outcome.retryable;
      return {
        status: "ungraded" as const,
        retryable,
        message: retryable
          ? "I couldn’t grade that answer right now. Your response is still here—try again."
          : "Automatic grading isn’t available for this answer. Your response is still here.",
      };
    }
    const shared = {
      status: "graded" as const,
      score: outcome.result.score,
      feedback: outcome.result.feedback,
      errorTags: outcome.result.errorTags,
      evalSource: outcome.result.evalSource,
      ...(outcome.result.modelUsed ? { modelUsed: outcome.result.modelUsed } : {}),
    };
    if (outcome.result.verdict === "correct") {
      return {
        status: "graded",
        evaluation: {
          ...shared,
          verdict: "correct",
        },
      };
    }
    return {
      status: "graded",
      evaluation: {
        ...shared,
        verdict: outcome.result.verdict,
        correction: createCorrectionPresentation(
          input.answer,
          input.item.acceptedAnswers,
        ),
      },
    };
  }
}
