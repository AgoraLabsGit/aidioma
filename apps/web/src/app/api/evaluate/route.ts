import { auth } from "@clerk/nextjs/server";

import { createEvaluateHandler } from "@/lib/evaluation/evaluate-handler";
import { EvaluationService } from "@/lib/evaluation/evaluation-service";
import { GatewayAiVerdictGenerator } from "@/lib/evaluation/gateway-evaluator";

export const runtime = "nodejs";

const service = new EvaluationService(new GatewayAiVerdictGenerator());

export const POST = createEvaluateHandler({
  authenticate: async () => {
    const session = await auth();
    return session.userId ? { userId: session.userId } : null;
  },
  service,
});
