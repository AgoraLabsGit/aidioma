import { sql } from "drizzle-orm";

import { getDatabase } from "../src/lib/db";
import {
  assertDatabaseIdentity,
  resolveDatabaseExpectation,
  type DatabaseIdentityRow,
} from "../src/lib/db/safety";
import { createEvaluateHandler } from "../src/lib/evaluation/evaluate-handler";
import { EvaluationService } from "../src/lib/evaluation/evaluation-service";
import { GatewayAiVerdictGenerator } from "../src/lib/evaluation/gateway-evaluator";
import { resolveLessonSource } from "../src/lib/evaluation/source-resolver";

const itemRef = "a1-01.s.01";
const direction = "en-es" as const;

function fail(message: string): never {
  throw new Error(`FAIL evaluate-proof ${message}`);
}

function identityRows(rows: readonly Record<string, unknown>[]): DatabaseIdentityRow[] {
  return rows.map((row) => {
    if (typeof row.database !== "string" || typeof row.role !== "string") {
      fail("invalid-database-identity");
    }
    return { database: row.database, role: row.role };
  });
}

async function responseBody(response: Response): Promise<Record<string, unknown>> {
  const body = (await response.json()) as unknown;
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    fail(`status=${response.status} invalid-json-response`);
  }
  return body as Record<string, unknown>;
}

async function call(
  handler: (request: Request) => Promise<Response>,
  userInput: string,
): Promise<{ response: Response; body: Record<string, unknown> }> {
  const response = await handler(
    new Request("http://proof.local/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceType: "lesson",
        itemRef,
        modality: "translate",
        direction,
        userInput,
      }),
    }),
  );
  return { response, body: await responseBody(response) };
}

async function main(): Promise<void> {
  const expectation = resolveDatabaseExpectation();
  if (expectation.target !== "development") {
    fail("requires-development-database");
  }

  const identityResult = await getDatabase().execute(sql`
    SELECT current_database() AS database, current_user AS role
  `);
  assertDatabaseIdentity(identityRows(identityResult.rows), expectation);

  const source = await resolveLessonSource(itemRef, direction);
  const expected = source.authoritativeAnswers[0];
  if (!expected) fail("missing-authoritative-answer");

  const handler = createEvaluateHandler({
    authenticate: async () => ({ userId: "a2-proof-user" }),
    service: new EvaluationService(new GatewayAiVerdictGenerator()),
  });

  const exact = await call(handler, expected);
  if (exact.response.status !== 200 || exact.body.evalSource !== "comparison") {
    fail(`comparison status=${exact.response.status}`);
  }

  const ai = await call(handler, "This deliberately does not match the Spanish answer.");
  if (ai.response.status !== 200 || ai.body.evalSource !== "ai") {
    const reason = typeof ai.body.reason === "string" ? ai.body.reason : "unexpected-response";
    fail(`gateway status=${ai.response.status} reason=${reason}`);
  }

  if ("evaluationId" in exact.body || "evaluationId" in ai.body) {
    fail("unexpected-persistence-id");
  }

  console.info(
    "PASS evaluate-proof development-db=verified comparison=graded gateway=graded persistence=none",
  );
}

await main();
