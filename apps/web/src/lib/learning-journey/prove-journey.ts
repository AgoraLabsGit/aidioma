import { and, eq, sql } from "drizzle-orm";

import { getDatabase } from "@/lib/db";
import { learnerLessonProgress } from "@/lib/db/schema";
import {
  assertDatabaseIdentity,
  resolveDatabaseExpectation,
  type DatabaseIdentityRow,
} from "@/lib/db/safety";
import type {
  PracticeSessionEvaluation,
  PracticeSessionEvaluator,
} from "@/lib/practice-serving/session-service";

import { ProductionLessonContextualAnswerer } from "./contextual-answerer";
import { DatabaseLessonProgressRepository } from "./lesson-repository";
import { LessonJourneyService } from "./lesson-service";
import { PROMOTED_LESSON_ID } from "./promoted-lesson";

function fail(message: string): never {
  throw new Error(`FAIL journey-proof ${message}`);
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
  private readonly queue: PracticeSessionEvaluation[] = [graded("wrong"), graded("correct")];
  async evaluate(): Promise<PracticeSessionEvaluation> {
    return this.queue.shift() ?? graded("correct");
  }
}

export async function proveLessonJourney(): Promise<{
  attempts: number;
  collections: number;
  contextualExchanges: number;
  database: string;
  positionRetained: boolean;
}> {
  const expectation = resolveDatabaseExpectation();
  if (expectation.target !== "development") fail("requires-development-database");
  const learnerId = process.env.PHASE_004_PROOF_CLERK_USER_ID?.trim();
  if (!learnerId || !/^user_[A-Za-z0-9]+$/u.test(learnerId)) {
    fail("requires-verified-clerk-proof-user");
  }
  if (!process.env.EVALUATION_AI_GATEWAY_API_KEY?.trim()) {
    fail("requires-explicit-ai-gateway-key");
  }

  const database = getDatabase();
  const identity = await database.execute(sql`
    SELECT current_database() AS database, current_user AS role
  `);
  assertDatabaseIdentity(identityRows(identity.rows), expectation);

  // The named proof user is dedicated to replayable PHASE-004 evidence. Reset only its one
  // representative lesson row; no production or unrelated learner record can match this scope.
  await database
    .delete(learnerLessonProgress)
    .where(
      and(
        eq(learnerLessonProgress.learnerId, learnerId),
        eq(learnerLessonProgress.lessonId, PROMOTED_LESSON_ID),
      ),
    );

  const repository = new DatabaseLessonProgressRepository(database);
  let minute = 0;
  const service = new LessonJourneyService(
    repository,
    new ProofEvaluator(),
    new ProductionLessonContextualAnswerer(),
    {
      now: () => new Date(`2026-08-25T21:0${minute++}:00.000Z`),
      randomId: () => "phase-004-proof-session",
    },
  );

  const started = await service.start({ learnerId, profile: "es-AR" });
  if (!started.ok) fail(`start:${started.failure}`);
  const continued = await service.continue({
    expectedRevision: started.value.revision,
    learnerId,
    sessionId: started.value.checkpoint.sessionId,
  });
  if (!continued.ok) fail(`continue:${continued.failure}`);
  const hinted = await service.hint({
    expectedRevision: continued.value.revision,
    learnerId,
    sessionId: continued.value.checkpoint.sessionId,
  });
  if (!hinted.ok || hinted.value.checkpoint.revealedHints !== 1) fail("authored-hint");

  const asked = await service.question({
    expectedRevision: hinted.value.revision,
    learnerId,
    question: "Why does vivir change with vos?",
    requestId: "00000000-0000-4000-8000-000000000004",
    sessionId: hinted.value.checkpoint.sessionId,
  });
  if (!asked.ok) fail(`contextual:${asked.failure}`);
  const reloaded = await new DatabaseLessonProgressRepository(database).find(
    learnerId,
    PROMOTED_LESSON_ID,
  );
  if (
    !reloaded ||
    reloaded.checkpoint.position !== "check" ||
    reloaded.checkpoint.exchanges.length !== 1 ||
    !reloaded.checkpoint.exchanges[0]?.answer
  ) {
    fail("resume-continuity");
  }

  const missed = await service.answer({
    answer: "Tú vives aquí.",
    expectedRevision: reloaded.revision,
    learnerId,
    sessionId: reloaded.checkpoint.sessionId,
  });
  if (!missed.ok || missed.value.checkpoint.position !== "check") fail("miss");
  const stale = await service.answer({
    answer: "Vos vivís acá.",
    expectedRevision: reloaded.revision,
    learnerId,
    sessionId: reloaded.checkpoint.sessionId,
  });
  if (stale.ok || stale.failure !== "lesson_conflict") fail("stale-request");
  const corrected = await service.answer({
    answer: "Vos vivís acá.",
    expectedRevision: missed.value.revision,
    learnerId,
    sessionId: missed.value.checkpoint.sessionId,
  });
  if (!corrected.ok || corrected.value.status !== "completed") fail("completion");
  const collections = await repository.unlockedCollectionIds(learnerId);
  if (collections.length !== 2) fail("collection-unlock");

  return {
    attempts: corrected.value.checkpoint.attempts.length,
    collections: collections.length,
    contextualExchanges: corrected.value.checkpoint.exchanges.length,
    database: expectation.database,
    positionRetained: true,
  };
}

const proof = await proveLessonJourney();
console.info(
  `PASS journey-proof database=${proof.database} attempts=${proof.attempts} contextual_exchanges=${proof.contextualExchanges} collections=${proof.collections} position_retained=${proof.positionRetained}`,
);
