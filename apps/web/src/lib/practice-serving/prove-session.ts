import { sql } from "drizzle-orm";

import { getDatabase } from "@/lib/db";
import {
  assertDatabaseIdentity,
  resolveDatabaseExpectation,
  type DatabaseIdentityRow,
} from "@/lib/db/safety";

import { DatabasePracticeSessionRepository } from "./database-session-repository";
import {
  PracticeSessionService,
  type PracticeSessionEvaluation,
  type PracticeSessionEvaluator,
} from "./session-service";

function fail(message: string): never {
  throw new Error(`FAIL session-proof ${message}`);
}

function identityRows(rows: readonly Record<string, unknown>[]): DatabaseIdentityRow[] {
  return rows.map((row) => {
    if (typeof row.database !== "string" || typeof row.role !== "string") {
      fail("invalid-database-identity");
    }
    return { database: row.database, role: row.role };
  });
}

function graded(verdict: "correct" | "wrong"): PracticeSessionEvaluation {
  return verdict === "correct"
    ? {
        status: "graded",
        evaluation: {
          status: "graded",
          score: 100,
          verdict,
          feedback: "Correct.",
          errorTags: [],
          evalSource: "comparison",
        },
      }
    : {
        status: "graded",
        evaluation: {
          status: "graded",
          score: 35,
          verdict,
          feedback: "Use the active Argentine form.",
          errorTags: [],
          evalSource: "comparison",
          correction: { text: "Vos vivís acá.", highlights: [] },
        },
      };
}

class ProofEvaluator implements PracticeSessionEvaluator {
  readonly queue: PracticeSessionEvaluation[] = [graded("wrong"), graded("correct")];
  async evaluate() {
    return this.queue.shift() ?? graded("correct");
  }
}

export async function proveDurablePracticeSession(): Promise<{
  attempts: number;
  database: string;
  itemId: string;
  reasons: string[];
  saved: boolean;
}> {
  const expectation = resolveDatabaseExpectation();
  if (expectation.target !== "development") {
    fail("requires-development-database");
  }

  const database = getDatabase();
  const identityResult = await database.execute(sql`
    SELECT current_database() AS database, current_user AS role
  `);
  assertDatabaseIdentity(identityRows(identityResult.rows), expectation);

  const learnerId = `phase-003-proof-${Date.now()}`;
  const service = new PracticeSessionService(
    new DatabasePracticeSessionRepository(database),
    new ProofEvaluator(),
    {
      now: () => new Date("2026-08-25T15:00:00.000Z"),
      randomId: () => `${learnerId}-session`,
      seed: () => "phase-003-proof",
    },
  );

  const started = await service.start({
    learnerId,
    profile: "es-AR",
    sourceKind: "collection",
  });
  if (!started.ok) fail(`start:${started.failure}`);
  if (started.value.session.currentOffer.reason !== "new_in_scope") {
    fail(`start-reason:${started.value.session.currentOffer.reason}`);
  }

  const missed = await service.answer({
    answer: "Tú vives aquí.",
    learnerId,
    offerOrdinal: 1,
    sessionId: started.value.session.sessionId,
  });
  if (!missed.ok) fail(`miss:${missed.failure}`);
  if (missed.value.record.session.currentOffer.reason !== "retry_after_miss") {
    fail(`retry-reason:${missed.value.record.session.currentOffer.reason}`);
  }

  const stale = await service.answer({
    answer: "duplicate",
    learnerId,
    offerOrdinal: 1,
    sessionId: started.value.session.sessionId,
  });
  if (stale.ok || stale.failure !== "session_conflict") fail("stale-request-not-rejected");

  const itemId = missed.value.record.session.attempts[0]?.itemId;
  if (!itemId) fail("miss-evidence-missing");
  const saved = await service.setSaved({
    itemId,
    learnerId,
    saved: true,
    sessionId: started.value.session.sessionId,
  });
  if (!saved.ok || !saved.value.includes(itemId)) fail("save-failed");

  const paused = await service.changeStatus({
    learnerId,
    sessionId: started.value.session.sessionId,
    status: "paused",
  });
  if (!paused.ok || paused.value.status !== "paused") fail("pause-failed");

  const resumed = await service.changeStatus({
    learnerId,
    sessionId: started.value.session.sessionId,
    status: "active",
  });
  if (!resumed.ok || resumed.value.status !== "active") fail("resume-failed");

  const corrected = await service.answer({
    answer: "Vos vivís acá.",
    learnerId,
    offerOrdinal: 2,
    sessionId: started.value.session.sessionId,
  });
  if (!corrected.ok) fail(`retry:${corrected.failure}`);
  if (corrected.value.evaluation.verdict !== "correct") fail("retry-not-correct");

  const ended = await service.changeStatus({
    learnerId,
    sessionId: started.value.session.sessionId,
    status: "ended",
  });
  if (!ended.ok || ended.value.status !== "ended") fail("end-failed");

  return {
    attempts: corrected.value.record.session.attempts.length,
    database: expectation.database,
    itemId,
    reasons: [
      started.value.session.currentOffer.reason,
      missed.value.record.session.currentOffer.reason,
      corrected.value.record.session.currentOffer.reason,
    ],
    saved: true,
  };
}

async function main(): Promise<void> {
  const proof = await proveDurablePracticeSession();
  console.info(
    `PASS session-proof database=${proof.database} attempts=${proof.attempts} saved=${proof.saved} reasons=${proof.reasons.join(",")}`,
  );
}

await main();
