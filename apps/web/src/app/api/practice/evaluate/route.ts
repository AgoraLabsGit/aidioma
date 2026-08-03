import { randomUUID } from "node:crypto";

import { EvaluationService } from "@/lib/evaluation/evaluation-service";
import { GatewayAiVerdictGenerator } from "@/lib/evaluation/gateway-evaluator";
import {
  PracticeEvaluationRequestSchema,
  PracticeEvaluationResponseSchema,
} from "@/lib/practice-sets/evaluation-contract";
import { acceptedPracticeAnswerTexts } from "@/lib/practice-sets/practice-prompt-contract";
import { practiceSetFixtures } from "@/lib/practice-sets/prototype-fixtures";

export const runtime = "nodejs";

const service = new EvaluationService(new GatewayAiVerdictGenerator());
const localEvaluationUser = "usr_00000000000000000000000000000001";

function json(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  if (process.env.AIDIOMA_ENABLE_LOCAL_PRACTICE_EVALUATION !== "true") {
    return new Response(null, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_request" }, 400);
  }

  const parsed = PracticeEvaluationRequestSchema.safeParse(body);
  if (!parsed.success) return json({ error: "invalid_request" }, 400);

  const prompt = practiceSetFixtures
    .flatMap((set) => set.prompts)
    .find((candidate) => candidate.id === parsed.data.itemRef);
  if (!prompt) return json({ error: "source_not_found" }, 404);

  const answerGroup =
    parsed.data.direction === "en-es" ? prompt.answers.spanish : prompt.answers.english;
  const modelAnswer = parsed.data.direction === "en-es" ? prompt.spanish : prompt.english;
  const sourceText = parsed.data.direction === "en-es" ? prompt.english : prompt.spanish;
  const outcome = await service.evaluate({
    requestId: randomUUID(),
    request: {
      sourceType: "set",
      itemRef: prompt.id,
      modality: "translate",
      direction: parsed.data.direction,
      userInput: parsed.data.userInput,
    },
    source: {
      sourceText,
      authoritativeAnswers: acceptedPracticeAnswerTexts(modelAnswer, answerGroup.target),
      grammarTags: prompt.grammarTags,
      assessmentGoal: `${prompt.capability}. ${prompt.cue}`,
    },
    userTrackingId: localEvaluationUser,
    signal: request.signal,
  });

  if (outcome.kind !== "graded") {
    const retryable = outcome.kind === "ungraded" && outcome.retryable;
    const response = PracticeEvaluationResponseSchema.parse({
      status: "ungraded",
      retryable,
      message: retryable
        ? "I couldn’t grade that answer right now. Your response is still here—try again."
        : "Automatic grading isn’t available for this answer. Your response is still here, but retrying won’t help right now.",
    });
    return json(response, 503);
  }

  return json(
    PracticeEvaluationResponseSchema.parse({
      status: "graded",
      ...outcome.result,
      modelAnswer,
    }),
    200,
  );
}
