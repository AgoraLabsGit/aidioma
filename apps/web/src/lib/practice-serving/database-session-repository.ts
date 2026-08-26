import "server-only";

import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { getDatabase, type AIdiomaDatabase } from "@/lib/db";
import {
  learnerItemStates,
  practiceSessions,
  savedPracticeItems,
} from "@/lib/db/schema";
import { DatabaseLessonProgressRepository } from "@/lib/learning-journey/lesson-repository";

import { AdaptivePracticeSessionSchema, type LearnerItemEvidence, type PracticeSourceScope } from "./adaptive-session";
import type { PromotedPracticeItem } from "./promoted-source";
import type {
  CommitPracticeAnswerInput,
  PracticeSessionRepository,
  RetainedAdaptiveSession,
  RetainedSessionStatus,
} from "./session-service";

function retained(row: typeof practiceSessions.$inferSelect): RetainedAdaptiveSession {
  return {
    learnerId: row.learnerId,
    revision: row.revision,
    session: AdaptivePracticeSessionSchema.parse(row.checkpoint),
    status: row.status,
  };
}

function confidenceFromDatabase(value: number): number {
  return Math.max(0, Math.min(1, value / 1_000));
}

function confidenceForDatabase(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 1_000);
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? error.code : undefined;
  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  return code === "23505" || /duplicate key|unique constraint/i.test(message);
}

export class DatabasePracticeSessionRepository implements PracticeSessionRepository {
  constructor(private readonly database: AIdiomaDatabase = getDatabase()) {}

  async createSession(record: RetainedAdaptiveSession): Promise<RetainedAdaptiveSession> {
    try {
      const [created] = await this.database
        .insert(practiceSessions)
        .values({
          id: record.session.sessionId,
          learnerId: record.learnerId,
          sourceKind: record.session.source.kind,
          sourceId: record.session.source.id,
          sourceVersion: record.session.source.version,
          profile: record.session.profile,
          policyVersion: record.session.policyVersion,
          status: record.status,
          revision: record.revision,
          checkpoint: record.session,
        })
        .returning();
      return retained(created);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      const existing = await this.findResumable(record.learnerId);
      if (existing) return existing;
      throw error;
    }
  }

  async findResumable(learnerId: string): Promise<RetainedAdaptiveSession | null> {
    const [row] = await this.database
      .select()
      .from(practiceSessions)
      .where(
        and(
          eq(practiceSessions.learnerId, learnerId),
          inArray(practiceSessions.status, ["active", "paused"]),
        ),
      )
      .orderBy(desc(practiceSessions.updatedAt))
      .limit(1);
    return row ? retained(row) : null;
  }

  async findSession(learnerId: string, sessionId: string): Promise<RetainedAdaptiveSession | null> {
    const [row] = await this.database
      .select()
      .from(practiceSessions)
      .where(
        and(eq(practiceSessions.learnerId, learnerId), eq(practiceSessions.id, sessionId)),
      )
      .limit(1);
    return row ? retained(row) : null;
  }

  async learnerEvidence(
    learnerId: string,
    itemIds: readonly string[],
  ): Promise<Record<string, LearnerItemEvidence>> {
    if (itemIds.length === 0) return {};
    const rows = await this.database
      .select()
      .from(learnerItemStates)
      .where(
        and(
          eq(learnerItemStates.learnerId, learnerId),
          inArray(learnerItemStates.itemId, [...itemIds]),
        ),
      );
    return Object.fromEntries(
      rows.map((row) => [
        row.itemId,
        {
          confidence: confidenceFromDatabase(row.confidence),
          dueAt: row.dueAt?.toISOString() ?? null,
          lastAttemptAt: row.lastAttemptAt?.toISOString() ?? null,
          seenCount: row.seenCount,
          unresolvedMisses: row.unresolvedMisses,
        },
      ]),
    );
  }

  async commitAnswer(input: CommitPracticeAnswerInput): Promise<RetainedAdaptiveSession | "conflict"> {
    const updatedAt = this.nowIso();
    const dueAt = input.evidence.dueAt;
    const lastAttemptAt = input.evidence.lastAttemptAt;
    try {
      const result = await this.database.execute<{ session_id: string }>(sql`
      WITH updated_session AS (
        UPDATE practice_sessions
        SET checkpoint = ${JSON.stringify(input.nextSession)}::jsonb,
            revision = revision + 1,
            updated_at = ${updatedAt}::timestamptz
        WHERE id = ${input.sessionId}
          AND learner_id = ${input.learnerId}
          AND revision = ${input.expectedRevision}
          AND status = 'active'
        RETURNING id
      ), retained_attempt AS (
        INSERT INTO practice_attempts (
          id, session_id, learner_id, offer_ordinal, item_id, content_version,
          concept_ids, activity, answer, verdict, score, feedback, eval_source,
          model_used, created_at
        )
        SELECT
          ${`${input.sessionId}:${input.expectedOfferOrdinal}`},
          ${input.sessionId},
          ${input.learnerId},
          ${input.expectedOfferOrdinal},
          ${input.attempt.itemId},
          ${input.attempt.contentVersion},
          ${JSON.stringify(input.attempt.conceptIds)}::jsonb,
          ${input.attempt.activity},
          ${input.attempt.answer},
          ${input.attempt.verdict},
          ${input.attempt.score},
          ${input.attempt.feedback},
          ${input.attempt.evalSource},
          ${input.attempt.modelUsed ?? null},
          ${input.attempt.attemptedAt}::timestamptz
        FROM updated_session
      ), retained_state AS (
        INSERT INTO learner_item_states (
          learner_id, item_id, confidence, unresolved_misses, seen_count,
          due_at, last_attempt_at, updated_at
        )
        SELECT
          ${input.learnerId},
          ${input.attempt.itemId},
          ${confidenceForDatabase(input.evidence.confidence)},
          ${input.evidence.unresolvedMisses},
          ${input.evidence.seenCount},
          ${dueAt}::timestamptz,
          ${lastAttemptAt}::timestamptz,
          ${updatedAt}::timestamptz
        FROM updated_session
        ON CONFLICT (learner_id, item_id) DO UPDATE SET
          confidence = EXCLUDED.confidence,
          unresolved_misses = EXCLUDED.unresolved_misses,
          seen_count = EXCLUDED.seen_count,
          due_at = EXCLUDED.due_at,
          last_attempt_at = EXCLUDED.last_attempt_at,
          updated_at = EXCLUDED.updated_at
      )
      SELECT id AS session_id FROM updated_session
    `);
      if (result.rows.length === 0) return "conflict";
      const committed = await this.findSession(input.learnerId, input.sessionId);
      if (!committed) throw new Error("Committed practice session could not be reloaded.");
      return committed;
    } catch (error) {
      if (isUniqueViolation(error)) return "conflict";
      throw error;
    }
  }

  private nowIso(): string {
    return new Date().toISOString();
  }

  async setStatus(
    learnerId: string,
    sessionId: string,
    expectedRevision: number,
    status: RetainedSessionStatus,
  ): Promise<RetainedAdaptiveSession | "conflict" | null> {
    const [updated] = await this.database
      .update(practiceSessions)
      .set({
        status,
        revision: expectedRevision + 1,
        pausedAt: status === "paused" ? new Date() : null,
        endedAt: status === "ended" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(practiceSessions.id, sessionId),
          eq(practiceSessions.learnerId, learnerId),
          eq(practiceSessions.revision, expectedRevision),
        ),
      )
      .returning();
    if (updated) return retained(updated);
    const existing = await this.findSession(learnerId, sessionId);
    return existing ? "conflict" : null;
  }

  async savedItemIds(learnerId: string): Promise<string[]> {
    const rows = await this.database
      .select({ itemId: savedPracticeItems.itemId })
      .from(savedPracticeItems)
      .where(eq(savedPracticeItems.learnerId, learnerId));
    return rows.map((row) => row.itemId).sort();
  }

  async unlockedCollectionIds(learnerId: string): Promise<string[]> {
    return new DatabaseLessonProgressRepository(this.database).unlockedCollectionIds(learnerId);
  }

  async setSaved(
    learnerId: string,
    item: PromotedPracticeItem,
    source: PracticeSourceScope,
    saved: boolean,
  ): Promise<string[]> {
    if (saved) {
      await this.database
        .insert(savedPracticeItems)
        .values({
          learnerId,
          itemId: item.itemId,
          contentVersion: item.contentVersion,
          meaningId: item.meaningId,
          sourceKind: source.kind,
          sourceId: source.id,
        })
        .onConflictDoNothing({
          target: [savedPracticeItems.learnerId, savedPracticeItems.itemId],
        });
    } else {
      await this.database
        .delete(savedPracticeItems)
        .where(
          and(
            eq(savedPracticeItems.learnerId, learnerId),
            eq(savedPracticeItems.itemId, item.itemId),
          ),
        );
    }
    return this.savedItemIds(learnerId);
  }
}
