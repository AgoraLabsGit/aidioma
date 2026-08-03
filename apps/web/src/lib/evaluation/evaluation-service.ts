import "server-only";

import type { AiFailureCategory, AiVerdictGenerator, AiVerdictMetadata } from "./gateway-evaluator";
import { compareAnswer } from "./comparison";
import {
  EvaluationResultSchema,
  type EvaluationRequest,
  type EvaluationResult,
} from "./contracts";
import type { ResolvedLessonSource } from "./source-resolver";

export type EvaluationServiceSource = Pick<
  ResolvedLessonSource,
  "authoritativeAnswers" | "grammarTags" | "sourceText"
> & {
  assessmentGoal?: string;
};

export type EvaluationServiceOutcome =
  | { kind: "graded"; result: EvaluationResult }
  | { kind: "invalid"; reason: "empty" | "too-long" }
  | {
      kind: "ungraded";
      retryable: boolean;
      failure: AiFailureCategory;
    };

export type EvaluationLogEvent = {
  event: "evaluation.completed";
  requestId: string;
  path: "comparison" | "ai";
  outcome: "graded" | "invalid" | "ungraded";
  latencyMs: number;
  failure?: AiFailureCategory | "invalid-input";
  model?: string;
  provider?: "gateway";
  generationId?: string;
  providerStatus?: number;
  usage?: AiVerdictMetadata["usage"];
};

export type EvaluationLogger = (event: EvaluationLogEvent) => void;

export type EvaluationServiceRequest = {
  requestId: string;
  request: EvaluationRequest;
  source: EvaluationServiceSource;
  userTrackingId?: string;
  signal?: AbortSignal;
};

type EvaluationServiceOptions = {
  logger?: EvaluationLogger;
  now?: () => number;
};

function defaultLogger(event: EvaluationLogEvent): void {
  console.info(JSON.stringify(event));
}

export class EvaluationService {
  readonly #ai: AiVerdictGenerator;
  readonly #logger: EvaluationLogger;
  readonly #now: () => number;

  constructor(ai: AiVerdictGenerator, options: EvaluationServiceOptions = {}) {
    this.#ai = ai;
    this.#logger = options.logger ?? defaultLogger;
    this.#now = options.now ?? Date.now;
  }

  #record(event: EvaluationLogEvent): void {
    try {
      this.#logger(event);
    } catch {
      // Observability must never turn a valid grading result into a failure.
    }
  }

  async evaluate(input: EvaluationServiceRequest): Promise<EvaluationServiceOutcome> {
    const startedAt = this.#now();
    const comparison = compareAnswer(
      input.request.userInput,
      input.source.authoritativeAnswers,
      { tolerateSingleCharacterTypo: input.request.direction === "es-en" },
    );

    if (comparison.kind === "invalid") {
      this.#record({
        event: "evaluation.completed",
        requestId: input.requestId,
        path: "comparison",
        outcome: "invalid",
        latencyMs: Math.max(0, this.#now() - startedAt),
        failure: "invalid-input",
      });
      return comparison;
    }

    if (comparison.kind === "graded") {
      const result = EvaluationResultSchema.parse(comparison.result);
      this.#record({
        event: "evaluation.completed",
        requestId: input.requestId,
        path: "comparison",
        outcome: "graded",
        latencyMs: Math.max(0, this.#now() - startedAt),
      });
      return { kind: "graded", result };
    }

    const generation = await this.#ai.evaluate({
      sourceText: input.source.sourceText,
      userInput: input.request.userInput,
      acceptedAnswers: input.source.authoritativeAnswers,
      assessmentGoal: input.source.assessmentGoal,
      direction: input.request.direction,
      modality: input.request.modality,
      grammarTags: input.source.grammarTags,
      userTrackingId: input.userTrackingId,
      signal: input.signal,
    });

    if (generation.kind === "ungraded") {
      this.#record({
        event: "evaluation.completed",
        requestId: input.requestId,
        path: "ai",
        outcome: "ungraded",
        latencyMs: Math.max(0, this.#now() - startedAt),
        failure: generation.failure,
        model: generation.metadata.responseModel ?? generation.metadata.requestedModel,
        provider: generation.metadata.provider,
        generationId: generation.metadata.generationId,
        providerStatus: generation.metadata.providerStatus,
        usage: generation.metadata.usage,
      });
      return {
        kind: "ungraded",
        retryable: generation.retryable,
        failure: generation.failure,
      };
    }

    const modelUsed = generation.metadata.responseModel ?? generation.metadata.requestedModel;
    const parsed = EvaluationResultSchema.safeParse({
      ...generation.result,
      evalSource: "ai",
      ...(modelUsed && { modelUsed }),
    });

    if (!parsed.success) {
      this.#record({
        event: "evaluation.completed",
        requestId: input.requestId,
        path: "ai",
        outcome: "ungraded",
        latencyMs: Math.max(0, this.#now() - startedAt),
        failure: "schema",
        model: modelUsed,
        provider: generation.metadata.provider,
        generationId: generation.metadata.generationId,
        usage: generation.metadata.usage,
      });
      return { kind: "ungraded", retryable: true, failure: "schema" };
    }

    this.#record({
      event: "evaluation.completed",
      requestId: input.requestId,
      path: "ai",
      outcome: "graded",
      latencyMs: Math.max(0, this.#now() - startedAt),
      model: modelUsed,
      provider: generation.metadata.provider,
      generationId: generation.metadata.generationId,
      usage: generation.metadata.usage,
    });
    return { kind: "graded", result: parsed.data };
  }
}
