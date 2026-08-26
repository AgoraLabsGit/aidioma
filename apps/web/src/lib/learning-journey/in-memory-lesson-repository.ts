import type {
  CommitLessonProgressInput,
  LessonProgressRepository,
  RetainedLessonProgress,
} from "./lesson-repository";
import { resolvePromotedLesson } from "./promoted-lesson";

function clone<T>(value: T): T {
  return structuredClone(value);
}
export class InMemoryLessonProgressRepository implements LessonProgressRepository {
  readonly records = new Map<string, RetainedLessonProgress>();

  private key(learnerId: string, lessonId: string): string {
    return `${learnerId}\u001f${lessonId}`;
  }

  async create(record: RetainedLessonProgress): Promise<RetainedLessonProgress> {
    const key = this.key(record.learnerId, record.checkpoint.lessonId);
    const existing = this.records.get(key);
    if (existing) return clone(existing);
    this.records.set(key, clone(record));
    return clone(record);
  }

  async find(learnerId: string, lessonId: string): Promise<RetainedLessonProgress | null> {
    const record = this.records.get(this.key(learnerId, lessonId));
    return record ? clone(record) : null;
  }

  async commit(input: CommitLessonProgressInput): Promise<RetainedLessonProgress | "conflict"> {
    const key = this.key(input.learnerId, input.lessonId);
    const current = this.records.get(key);
    if (!current || current.revision !== input.expectedRevision) return "conflict";
    const next: RetainedLessonProgress = {
      checkpoint: clone(input.checkpoint),
      learnerId: input.learnerId,
      revision: current.revision + 1,
      status: input.status,
    };
    this.records.set(key, next);
    return clone(next);
  }

  async unlockedCollectionIds(learnerId: string): Promise<string[]> {
    const ids = new Set<string>();
    for (const record of this.records.values()) {
      if (record.learnerId !== learnerId || record.status !== "completed") continue;
      const promoted = resolvePromotedLesson(record.checkpoint.profile);
      if (promoted.status !== "ready" || promoted.lesson.id !== record.checkpoint.lessonId) continue;
      for (const collection of promoted.lesson.collections) ids.add(collection.id);
    }
    return [...ids].sort();
  }
}
