import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
  Lesson,
  type GrammarTag,
  type ItemKind,
  type Lesson as AuthoredLesson,
  type LessonItem,
} from "@aidioma/lesson-schema";

const workingDirectory = process.cwd();
const repositoryRoot = workingDirectory.endsWith(path.join("apps", "web"))
  ? path.resolve(workingDirectory, "../..")
  : workingDirectory;

export const DEFAULT_CONTENT_DIRECTORY = path.join(repositoryRoot, "content", "lessons");

export interface SeedItem {
  id: string;
  lessonId: string;
  kind: ItemKind;
  payload: Record<string, unknown>;
  grammarTags: GrammarTag[];
  difficulty: number | null;
  contentVersion: number;
  deprecated: boolean;
}

export interface SeedLesson {
  id: string;
  slug: string;
  ordinal: number;
  level: AuthoredLesson["level"];
  title: string;
  objective: string;
  grammarFocus: GrammarTag[];
  contentVersion: number;
  contentHash: string;
  isActive: boolean;
  items: SeedItem[];
}

export interface SeedState {
  lessons: Map<string, SeedLesson>;
  items: Map<string, SeedItem>;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }

  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([left], [right]) => compareText(left, right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value) ?? "null";
}

function itemPayload(item: LessonItem): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...item };
  delete payload.id;
  delete payload.kind;
  delete payload.deprecated;
  delete payload.grammarTags;
  delete payload.difficulty;
  return payload;
}

function itemGrammarTags(item: LessonItem): GrammarTag[] {
  return "grammarTags" in item ? [...item.grammarTags] : [];
}

function itemDifficulty(item: LessonItem): number | null {
  return "difficulty" in item ? item.difficulty : null;
}

function authoredItems(lesson: AuthoredLesson): LessonItem[] {
  return [
    lesson.explanation,
    ...lesson.vocab,
    ...lesson.sentences,
    lesson.passage,
    lesson.conversation,
    ...lesson.quickChecks,
    ...lesson.referenceCards,
  ];
}

export function transformLesson(lesson: AuthoredLesson): SeedLesson {
  const items = authoredItems(lesson)
    .map((item): SeedItem => ({
      id: item.id,
      lessonId: lesson.id,
      kind: item.kind,
      payload: itemPayload(item),
      grammarTags: itemGrammarTags(item),
      difficulty: itemDifficulty(item),
      contentVersion: lesson.contentVersion,
      deprecated: item.deprecated,
    }))
    .sort((left, right) => compareText(left.id, right.id));

  return {
    id: lesson.id,
    slug: lesson.id,
    ordinal: lesson.ordinal,
    level: lesson.level,
    title: lesson.title,
    objective: lesson.objective,
    grammarFocus: [...lesson.grammarFocus],
    contentVersion: lesson.contentVersion,
    contentHash: createHash("sha256").update(stableJson(lesson)).digest("hex"),
    isActive: true,
    items,
  };
}

async function lessonFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return lessonFiles(entryPath);
      }
      return entry.isFile() && entry.name.endsWith(".json") ? [entryPath] : [];
    }),
  );
  return nested.flat().sort(compareText);
}

export async function loadSeedLessons(
  directory = DEFAULT_CONTENT_DIRECTORY,
): Promise<SeedLesson[]> {
  const files = await lessonFiles(directory);
  const lessons = await Promise.all(
    files.map(async (file) => {
      const raw = JSON.parse(await readFile(file, "utf8")) as unknown;
      return transformLesson(Lesson.parse(raw));
    }),
  );

  const lessonIds = new Set<string>();
  const slugs = new Set<string>();
  const ordinals = new Set<number>();
  const itemIds = new Set<string>();

  for (const lesson of lessons) {
    if (lessonIds.has(lesson.id) || slugs.has(lesson.slug) || ordinals.has(lesson.ordinal)) {
      throw new Error(`Duplicate lesson identity in canonical content: ${lesson.id}`);
    }
    lessonIds.add(lesson.id);
    slugs.add(lesson.slug);
    ordinals.add(lesson.ordinal);

    for (const item of lesson.items) {
      if (itemIds.has(item.id)) {
        throw new Error(`Duplicate authored item id in canonical content: ${item.id}`);
      }
      itemIds.add(item.id);
    }
  }

  return lessons.sort(
    (left, right) => left.ordinal - right.ordinal || compareText(left.slug, right.slug),
  );
}

function cloneLesson(lesson: SeedLesson): SeedLesson {
  return structuredClone(lesson);
}

function cloneItem(item: SeedItem): SeedItem {
  return structuredClone(item);
}

/**
 * Pure model of production upsert semantics. Missing authored rows remain in the
 * serving copy and deprecation is monotonic, so accidental content omissions or
 * defaulted `deprecated: false` values cannot resurrect historical items.
 */
export function applySeed(
  previous: SeedState,
  incoming: readonly SeedLesson[],
): SeedState {
  const lessons = new Map(
    [...previous.lessons].map(([slug, lesson]) => [slug, cloneLesson(lesson)]),
  );
  const items = new Map(
    [...previous.items].map(([id, item]) => [id, cloneItem(item)]),
  );

  for (const lesson of incoming) {
    lessons.set(lesson.slug, { ...cloneLesson(lesson), items: [] });
    for (const item of lesson.items) {
      const existing = items.get(item.id);
      if (existing && existing.lessonId !== item.lessonId) {
        throw new Error(
          `Authored item ${item.id} cannot move from ${existing.lessonId} to ${item.lessonId}`,
        );
      }
      items.set(
        item.id,
        cloneItem({ ...item, deprecated: Boolean(existing?.deprecated || item.deprecated) }),
      );
    }
  }

  for (const lesson of lessons.values()) {
    lesson.items = [...items.values()]
      .filter((item) => item.lessonId === lesson.id)
      .map(cloneItem)
      .sort((left, right) => compareText(left.id, right.id));
  }

  return { lessons, items };
}

export function emptySeedState(): SeedState {
  return { lessons: new Map(), items: new Map() };
}
