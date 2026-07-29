import "server-only";

import {
  SentenceItem,
  VocabItem,
  type GrammarTag,
  type SentenceItem as SentenceItemData,
  type VocabItem as VocabItemData,
} from "@aidioma/lesson-schema";
import { and, eq } from "drizzle-orm";

import { getDatabase } from "@/lib/db";
import { lessonItems, lessons } from "@/lib/db/schema";

import { acceptedAnswersForItem } from "./comparison";
import type { EvaluationDirection } from "./contracts";

export type EvaluableLessonItem = VocabItemData | SentenceItemData;

export interface LessonSourceRow {
  id: string;
  lessonId: string;
  kind: string;
  payload: unknown;
  grammarTags: unknown;
  difficulty: number | null;
  contentVersion: number;
  deprecated: boolean;
}

export interface LessonSourceRepository {
  findActiveItem(itemRef: string): Promise<LessonSourceRow | undefined>;
}

export interface ResolvedLessonSource {
  sourceType: "lesson";
  itemRef: string;
  lessonId: string;
  item: EvaluableLessonItem;
  authoritativeAnswers: readonly string[];
  grammarTags: readonly GrammarTag[];
  contentVersion: number;
}

export class EvaluationSourceNotFoundError extends Error {
  constructor() {
    super("The requested evaluation source was not found.");
    this.name = "EvaluationSourceNotFoundError";
  }
}

export class EvaluationSourceIntegrityError extends Error {
  constructor(options?: ErrorOptions) {
    super("The requested evaluation source is not valid for grading.", options);
    this.name = "EvaluationSourceIntegrityError";
  }
}

export const databaseLessonSourceRepository: LessonSourceRepository = {
  async findActiveItem(itemRef) {
    const [row] = await getDatabase()
      .select({
        id: lessonItems.id,
        lessonId: lessonItems.lessonId,
        kind: lessonItems.kind,
        payload: lessonItems.payload,
        grammarTags: lessonItems.grammarTags,
        difficulty: lessonItems.difficulty,
        contentVersion: lessonItems.contentVersion,
        deprecated: lessonItems.deprecated,
      })
      .from(lessonItems)
      .innerJoin(lessons, eq(lessonItems.lessonId, lessons.id))
      .where(
        and(
          eq(lessonItems.id, itemRef),
          eq(lessons.isActive, true),
          eq(lessonItems.deprecated, false),
        ),
      )
      .limit(1);

    return row;
  },
};

function parseEvaluableItem(row: LessonSourceRow): EvaluableLessonItem {
  if (row.payload === null || typeof row.payload !== "object" || Array.isArray(row.payload)) {
    throw new EvaluationSourceIntegrityError();
  }

  try {
    if (row.kind === "vocab") {
      return VocabItem.parse({
        ...row.payload,
        id: row.id,
        kind: row.kind,
        deprecated: row.deprecated,
      });
    }

    if (row.kind === "sentence") {
      return SentenceItem.parse({
        ...row.payload,
        id: row.id,
        kind: row.kind,
        grammarTags: row.grammarTags,
        difficulty: row.difficulty,
        deprecated: row.deprecated,
      });
    }
  } catch (cause) {
    throw new EvaluationSourceIntegrityError({ cause });
  }

  // Unsupported and otherwise incompatible item kinds are deliberately
  // indistinguishable from missing items at the API boundary.
  throw new EvaluationSourceNotFoundError();
}

function nonEmptyDistinctAnswers(answers: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const answer of answers) {
    const trimmed = answer.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  }

  return result;
}

export async function resolveLessonSource(
  itemRef: string,
  direction: EvaluationDirection,
  repository: LessonSourceRepository = databaseLessonSourceRepository,
): Promise<ResolvedLessonSource> {
  const row = await repository.findActiveItem(itemRef);
  if (!row || row.deprecated) {
    throw new EvaluationSourceNotFoundError();
  }

  const item = parseEvaluableItem(row);
  const authoritativeAnswers = nonEmptyDistinctAnswers(
    acceptedAnswersForItem(item, direction),
  );

  if (authoritativeAnswers.length === 0) {
    throw new EvaluationSourceIntegrityError();
  }

  return {
    sourceType: "lesson",
    itemRef: row.id,
    lessonId: row.lessonId,
    item,
    authoritativeAnswers,
    grammarTags: item.kind === "sentence" ? item.grammarTags : [],
    contentVersion: row.contentVersion,
  };
}
