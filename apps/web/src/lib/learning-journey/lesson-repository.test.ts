import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { getTableConfig } from "drizzle-orm/pg-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AIdiomaDatabase } from "@/lib/db";
import { learnerLessonProgress } from "@/lib/db/schema";

import {
  DatabaseLessonProgressRepository,
  type RetainedLessonProgress,
} from "./lesson-repository";
import { startLessonCheckpoint } from "./lesson-session";
import { resolvePromotedLesson } from "./promoted-lesson";

vi.mock("server-only", () => ({}));

const promotedResult = resolvePromotedLesson("es-AR");
if (promotedResult.status !== "ready") throw new Error("Promoted lesson fixture is unavailable.");

const activeRecord: RetainedLessonProgress = {
  checkpoint: startLessonCheckpoint({
    lesson: promotedResult.lesson,
    sessionId: "lesson-session-1",
  }),
  learnerId: "user_test",
  revision: 1,
  status: "active",
};

function row(record: RetainedLessonProgress = activeRecord) {
  return {
    checkpoint: record.checkpoint,
    completedAt: record.checkpoint.completedAt
      ? new Date(record.checkpoint.completedAt)
      : null,
    createdAt: new Date("2026-08-25T20:00:00.000Z"),
    learnerId: record.learnerId,
    lessonId: record.checkpoint.lessonId,
    profile: record.checkpoint.profile,
    revision: record.revision,
    status: record.status,
    updatedAt: new Date("2026-08-25T20:00:00.000Z"),
  };
}

function databaseWith(options: {
  completed?: RetainedLessonProgress[];
  inserted?: ReturnType<typeof row>[];
  selected?: ReturnType<typeof row>[];
  updated?: ReturnType<typeof row>[];
}): AIdiomaDatabase {
  return {
    insert: () => ({
      values: () => ({
        onConflictDoNothing: () => ({ returning: async () => options.inserted ?? [] }),
      }),
    }),
    select: (fields?: unknown) => ({
      from: () => ({
        where: () => {
          if (fields) {
            return Promise.resolve(
              (options.completed ?? []).map((record) => ({
                checkpoint: record.checkpoint,
                lessonId: record.checkpoint.lessonId,
              })),
            );
          }
          return { limit: async () => options.selected ?? [] };
        },
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({ returning: async () => options.updated ?? [] }),
      }),
    }),
  } as unknown as AIdiomaDatabase;
}

describe("lesson progress persistence contract", () => {
  beforeEach(() => vi.useRealTimers());

  it("declares one learner-scoped row with profile, checkpoint, revision, and completion", () => {
    const table = getTableConfig(learnerLessonProgress);

    expect(table.indexes.map((index) => index.config.name)).toEqual(
      expect.arrayContaining([
        "learner_lesson_progress_identity_unique",
        "learner_lesson_progress_learner_status_idx",
      ]),
    );
    expect(table.columns.map((column) => column.name)).toEqual(
      expect.arrayContaining([
        "learner_id",
        "lesson_id",
        "profile",
        "status",
        "revision",
        "checkpoint",
        "completed_at",
        "created_at",
        "updated_at",
      ]),
    );
  });

  it("keeps database constraints aligned with the schema contract", () => {
    const sql = readFileSync(resolve(process.cwd(), "drizzle/0003_lesson_journey.sql"), "utf8");

    expect(sql).toContain('"learner_lesson_progress_identity_unique"');
    expect(sql).toContain('"learner_lesson_progress_completion_check"');
    expect(sql).toMatch(/"status" IN \('active', 'completed'\)/);
    expect(sql).toMatch(/"revision" > 0/);
  });

  it("loads an existing learner/lesson row when create is retried", async () => {
    const repository = new DatabaseLessonProgressRepository(
      databaseWith({ inserted: [], selected: [row()] }),
    );

    await expect(repository.create(activeRecord)).resolves.toEqual(activeRecord);
  });

  it("returns an already-retained completion for an idempotent CAS retry", async () => {
    const completedAt = "2026-08-25T20:05:00.000Z";
    const completed: RetainedLessonProgress = {
      ...activeRecord,
      checkpoint: {
        ...activeRecord.checkpoint,
        completedAt,
        position: "complete",
      },
      revision: 2,
      status: "completed",
    };
    const repository = new DatabaseLessonProgressRepository(
      databaseWith({ selected: [row(completed)], updated: [] }),
    );

    await expect(
      repository.commit({
        checkpoint: completed.checkpoint,
        expectedRevision: 1,
        learnerId: completed.learnerId,
        lessonId: completed.checkpoint.lessonId,
        status: "completed",
      }),
    ).resolves.toEqual(completed);
  });

  it("unlocks only collections placed under a completed lesson", async () => {
    const completed: RetainedLessonProgress = {
      ...activeRecord,
      checkpoint: {
        ...activeRecord.checkpoint,
        completedAt: "2026-08-25T20:05:00.000Z",
        position: "complete",
      },
      revision: 2,
      status: "completed",
    };
    const locked = new DatabaseLessonProgressRepository(
      databaseWith({ completed: [] }),
    );
    const unlocked = new DatabaseLessonProgressRepository(
      databaseWith({ completed: [completed] }),
    );

    await expect(locked.unlockedCollectionIds(activeRecord.learnerId)).resolves.toEqual([]);
    await expect(unlocked.unlockedCollectionIds(activeRecord.learnerId)).resolves.toEqual([
      "collection.a1.home-location",
      "collection.a1.present-regular-ir",
    ]);
  });

  it("does not let a stale completed lesson authorize current collections", async () => {
    const stale: RetainedLessonProgress = {
      ...activeRecord,
      checkpoint: {
        ...activeRecord.checkpoint,
        completedAt: "2026-08-25T20:05:00.000Z",
        contentVersion: activeRecord.checkpoint.contentVersion + 1,
        position: "complete",
      },
      revision: 2,
      status: "completed",
    };
    const repository = new DatabaseLessonProgressRepository(databaseWith({ completed: [stale] }));

    await expect(repository.unlockedCollectionIds(activeRecord.learnerId)).resolves.toEqual([]);
  });
});
