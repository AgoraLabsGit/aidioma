import "server-only";

import { and, eq } from "drizzle-orm";

import { getDatabase, type AIdiomaDatabase } from "@/lib/db";
import { learnerLessonProgress } from "@/lib/db/schema";

import { LessonCheckpointSchema, type LessonCheckpoint } from "./lesson-session";
import { resolvePromotedLesson } from "./promoted-lesson";

export type LessonProgressStatus = "active" | "completed";

export type RetainedLessonProgress = {
  checkpoint: LessonCheckpoint;
  learnerId: string;
  revision: number;
  status: LessonProgressStatus;
};

export type CommitLessonProgressInput = {
  checkpoint: LessonCheckpoint;
  expectedRevision: number;
  learnerId: string;
  lessonId: string;
  status: LessonProgressStatus;
};

export interface LessonProgressRepository {
  commit(input: CommitLessonProgressInput): Promise<RetainedLessonProgress | "conflict">;
  create(record: RetainedLessonProgress): Promise<RetainedLessonProgress>;
  find(learnerId: string, lessonId: string): Promise<RetainedLessonProgress | null>;
  unlockedCollectionIds(learnerId: string): Promise<string[]>;
}

type LessonProgressRow = typeof learnerLessonProgress.$inferSelect;

function retain(row: LessonProgressRow): RetainedLessonProgress {
  return {
    checkpoint: LessonCheckpointSchema.parse(row.checkpoint),
    learnerId: row.learnerId,
    revision: row.revision,
    status: row.status,
  };
}

function validateRecord(record: RetainedLessonProgress): RetainedLessonProgress {
  const checkpoint = LessonCheckpointSchema.parse(record.checkpoint);
  if (!record.learnerId.trim()) throw new Error("A learner id is required.");
  if (!Number.isInteger(record.revision) || record.revision < 1) {
    throw new Error("Lesson progress revision must be positive.");
  }
  if (
    (record.status === "completed") !==
    (checkpoint.position === "complete" && checkpoint.completedAt !== null)
  ) {
    throw new Error("Lesson progress status must match its checkpoint.");
  }
  return { ...record, checkpoint };
}

function sameCheckpoint(left: LessonCheckpoint, right: LessonCheckpoint): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function unlockedCollections(
  completedRows: readonly { checkpoint: unknown; lessonId: string }[],
): string[] {
  const ids = completedRows.flatMap((row) => {
    const retained = LessonCheckpointSchema.safeParse(row.checkpoint);
    if (
      !retained.success ||
      retained.data.lessonId !== row.lessonId ||
      retained.data.position !== "complete" ||
      retained.data.completedAt === null
    ) {
      return [];
    }
    const current = resolvePromotedLesson(retained.data.profile);
    if (
      current.status !== "ready" ||
      current.lesson.id !== row.lessonId ||
      current.lesson.contentVersion !== retained.data.contentVersion
    ) {
      return [];
    }
    return current.lesson.collections.map((collection) => collection.id);
  });
  return [...new Set(ids)].sort();
}

export class DatabaseLessonProgressRepository implements LessonProgressRepository {
  constructor(private readonly database: AIdiomaDatabase = getDatabase()) {}

  async create(record: RetainedLessonProgress): Promise<RetainedLessonProgress> {
    const valid = validateRecord(record);
    const [created] = await this.database
      .insert(learnerLessonProgress)
      .values({
        checkpoint: valid.checkpoint,
        completedAt: valid.checkpoint.completedAt
          ? new Date(valid.checkpoint.completedAt)
          : null,
        learnerId: valid.learnerId,
        lessonId: valid.checkpoint.lessonId,
        profile: valid.checkpoint.profile,
        revision: valid.revision,
        status: valid.status,
      })
      .onConflictDoNothing({
        target: [learnerLessonProgress.learnerId, learnerLessonProgress.lessonId],
      })
      .returning();
    if (created) return retain(created);

    const existing = await this.find(valid.learnerId, valid.checkpoint.lessonId);
    if (!existing) throw new Error("Lesson progress could not be created or reloaded.");
    return existing;
  }

  async find(learnerId: string, lessonId: string): Promise<RetainedLessonProgress | null> {
    if (!learnerId.trim() || !lessonId.trim()) return null;
    const [row] = await this.database
      .select()
      .from(learnerLessonProgress)
      .where(
        and(
          eq(learnerLessonProgress.learnerId, learnerId),
          eq(learnerLessonProgress.lessonId, lessonId),
        ),
      )
      .limit(1);
    return row ? retain(row) : null;
  }

  async commit(input: CommitLessonProgressInput): Promise<RetainedLessonProgress | "conflict"> {
    if (input.checkpoint.lessonId !== input.lessonId) {
      throw new Error("The lesson checkpoint does not match the requested lesson.");
    }
    const valid = validateRecord({
      checkpoint: input.checkpoint,
      learnerId: input.learnerId,
      revision: input.expectedRevision,
      status: input.status,
    });
    const [updated] = await this.database
      .update(learnerLessonProgress)
      .set({
        checkpoint: valid.checkpoint,
        completedAt: valid.checkpoint.completedAt
          ? new Date(valid.checkpoint.completedAt)
          : null,
        profile: valid.checkpoint.profile,
        revision: input.expectedRevision + 1,
        status: valid.status,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(learnerLessonProgress.learnerId, input.learnerId),
          eq(learnerLessonProgress.lessonId, input.lessonId),
          eq(learnerLessonProgress.revision, input.expectedRevision),
          eq(learnerLessonProgress.status, "active"),
        ),
      )
      .returning();
    if (updated) return retain(updated);

    const existing = await this.find(input.learnerId, input.lessonId);
    if (
      existing &&
      existing.status === valid.status &&
      sameCheckpoint(existing.checkpoint, valid.checkpoint)
    ) {
      return existing;
    }
    return "conflict";
  }

  async unlockedCollectionIds(learnerId: string): Promise<string[]> {
    if (!learnerId.trim()) return [];
    const rows = await this.database
      .select({
        checkpoint: learnerLessonProgress.checkpoint,
        lessonId: learnerLessonProgress.lessonId,
      })
      .from(learnerLessonProgress)
      .where(
        and(
          eq(learnerLessonProgress.learnerId, learnerId),
          eq(learnerLessonProgress.status, "completed"),
        ),
      );
    return unlockedCollections(rows);
  }
}
