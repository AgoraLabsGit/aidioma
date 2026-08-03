/**
 * AIdioma — Prototype Data Exporter
 * ------------------------------------------------------------------
 * Run:  npm run prototype:export
 *
 * Reads every validated lesson under content/lessons and emits
 *   apps/prototype/lesson-data.js
 * a plain, file://-loadable JS file that assigns `window.AIDIOMA_LESSONS`
 * in the shape the app-track UI prototype expects (the `LESSONS` object in
 * apps/prototype/index.html). The prototype merges this over its mock lessons:
 *   const LESSONS = Object.assign({}, MOCK_LESSONS, window.AIDIOMA_LESSONS || {})
 *
 * KEY SCHEME: each lesson maps to `l<ordinal>` (a1-01 ordinal 1 -> "l1"), so
 * real lessons add/override mock lessons by key. Today only a1-01 exists; the
 * remaining 11 lessons will regenerate this file unchanged in scheme.
 *
 * SHAPE MAPPING (schema -> prototype item shapes; see prototype/DATA-README.md):
 *   vocab       -> words phase   { type:'flash', es, en, pos, accEs, accEn, hint }
 *   sentences   -> sentences ph. { type:'tr',    es, en, accEs, accEn, hint }
 *   passage.seg -> story phase   { type:'seg', context, es, accept, show, hint }
 *   quickChecks -> quiz phase    { type:'mc', label, prompt, options, correct, why, hint }
 *   conversation-> lesson metadata (no UI consumer in the prototype)
 *
 * SYNTHESIZED fields (prototype shape wants them, schema lacks them) are marked
 * `SYNTHESIZED:` inline below and summarized in the generated file header.
 * The converter is intentionally simple and idempotent (re-runnable).
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Lesson, acceptedText } from '@aidioma/lesson-schema';
import type { z } from 'zod';

type LessonT = z.infer<typeof Lesson>;

const TOOL_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolvePath(TOOL_DIR, '..', '..');
const LESSONS_DIR = resolvePath(REPO_ROOT, 'content', 'lessons');
const OUT_FILE = resolvePath(REPO_ROOT, 'apps', 'prototype', 'lesson-data.js');
const checkOnly = process.argv.slice(2).includes('--check');

/* ---------------- small helpers ---------------- */

const lc = (s: string) => s.toLowerCase().trim();
const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))];

/** Strip parentheticals (e.g. "my name is (I'm called)") and split slash-alternates. */
function enVariants(en: string): string[] {
  const stripped = en.replace(/\([^)]*\)/g, ' ');
  return uniq(stripped.split('/').map(lc));
}

/** prototype `pos` is a free display string; mock uses e.g. 'noun · f', 'adjective'. */
function posLabel(v: LessonT['vocab'][number]): string {
  switch (v.pos) {
    case 'noun': return v.gender ? `noun · ${v.gender}` : 'noun';
    case 'verb': return 'verb';
    case 'adj': return 'adjective';
    case 'adv': return 'adverb';
    case 'phrase': return v.chunk ? 'phrase · chunk' : 'phrase';
    case 'other': return 'expression';
    default: return String(v.pos);
  }
}

/* ---------------- per-phase mappers ---------------- */

function toWords(l: LessonT) {
  return l.vocab.map((v) => ({
    type: 'flash',
    es: v.es,
    en: v.en,
    pos: posLabel(v),
    // Include canonical/display-split answers plus P-003/P-004 accepted variants.
    accEs: uniq([lc(v.es), ...v.acceptedEs.map((e) => lc(acceptedText(e)))]),
    accEn: uniq([...enVariants(v.en), ...v.acceptedEn.map((e) => lc(acceptedText(e)))]),
    // SYNTHESIZED: vocab has no `hint`; use the example pair (matches mock's example-quoting hints).
    hint: `${v.exampleEs} — ${v.exampleEn}`,
  }));
}

function toSentences(l: LessonT) {
  return l.sentences.map((s) => ({
    type: 'tr',
    es: s.es,
    en: s.en,
    // prototype's answer-check arrays must INCLUDE the canonical form + schema alternates.
    accEs: uniq([lc(s.es), ...s.acceptedEs.map((e) => lc(acceptedText(e)))]),
    accEn: uniq([lc(s.en), ...s.acceptedEn.map((e) => lc(acceptedText(e)))]),
    // schema has 3 progressive hints; prototype shows one -> use the most general (first).
    hint: s.hints[0],
    // NOTE: schema `difficulty` (1-5) has no slot in the prototype's tr shape -> dropped.
  }));
}

function toStory(l: LessonT) {
  const segs = l.passage.segments;
  return segs.map((seg, i) => ({
    type: 'seg',
    // prototype renders `${context} <strong>${es}</strong>`; use prior Spanish lines as context.
    context: segs.slice(0, i).map((s) => s.es).join(' '),
    es: seg.es,
    accept: uniq(seg.en.map(lc)),
    show: seg.en[0],
    // SYNTHESIZED: passage segments carry no `hint` -> generic nudge.
    hint: 'Translate the highlighted Spanish line into natural English.',
  }));
}

function toQuiz(l: LessonT) {
  const out: any[] = [];
  for (const q of l.quickChecks ?? []) {
    if (q.kind !== 'multipleChoice') {
      console.log(`[export-prototype] ${l.id}: skipping quickCheck ${q.id} (kind not multipleChoice).`);
      continue;
    }
    out.push({
      type: 'mc',
      label: 'Quiz',
      prompt: q.prompt,
      options: q.choices,
      correct: q.correctIndex,
      why: q.explanation,
      // SYNTHESIZED: quickChecks carry no `hint` -> generic nudge (mock quiz items have one).
      hint: 'Re-read the prompt and pick the form that fits.',
    });
  }
  return out;
}

/* ---------------- lesson object ---------------- */

function toLessonObject(l: LessonT) {
  const conversation = l.conversation && {
    scenario: l.conversation.scenario,
    openingLine: l.conversation.openingLine,
    // openingLineGloss is optional in the schema; include only when present.
    ...(l.conversation.openingLineGloss ? { openingLineGloss: l.conversation.openingLineGloss } : {}),
    goalPhrases: l.conversation.goalPhrases,
  };
  return {
    n: l.ordinal,
    title: l.title,
    // SYNTHESIZED: real content carries no learner proficiency; the prototype's proficiency
    // bars/percentages are demo-only. A number (not null) is required — profOf() feeds it
    // straight into a width:% / "%" render for any non-locked/preview catalog row (l1 is NOT
    // special-cased like l3). 92 keeps the l1 "Mastered" row visually identical to the mock.
    prof: 92,
    objective: l.objective, // extra metadata; harmless (no UI consumer for this key).
    conversation,           // metadata only; the prototype has no conversation consumer yet.
    items: {
      quiz: toQuiz(l),
      words: toWords(l),
      sentences: toSentences(l),
      story: toStory(l),
    },
  };
}

/* ---------------- main ---------------- */

function loadLessons(): LessonT[] {
  const rels = readdirSync(LESSONS_DIR, { recursive: true, encoding: 'utf8' }) as string[];
  const files = rels.filter((r) => r.endsWith('.json')).sort();
  const lessons: LessonT[] = [];
  for (const rel of files) {
    const raw = JSON.parse(readFileSync(join(LESSONS_DIR, rel), 'utf8'));
    // Parse through the shared Zod schema -> fail loud on any contract drift.
    lessons.push(Lesson.parse(raw));
  }
  return lessons;
}

function main() {
  const lessons = loadLessons();
  if (!lessons.length) {
    console.error(`[export-prototype] No lessons found under ${LESSONS_DIR}. Nothing to emit.`);
    process.exit(1);
  }

  const map: Record<string, ReturnType<typeof toLessonObject>> = {};
  for (const l of lessons) {
    const key = `l${l.ordinal}`;
    if (map[key]) {
      console.error(`[export-prototype] Duplicate ordinal ${l.ordinal} (key ${key}) — ids collide. Aborting.`);
      process.exit(1);
    }
    map[key] = toLessonObject(l);
  }

  const header = [
    '/* AUTO-GENERATED by tooling/prototype/export-lessons.ts — DO NOT EDIT BY HAND.',
    ' * Regenerate: npm run prototype:export',
    ' *',
    ' * Real, CI-validated lesson content mapped into the prototype LESSONS shape.',
    ' * Keyed l<ordinal>; merged over MOCK_LESSONS in apps/prototype/index.html.',
    ' * SYNTHESIZED (prototype-only, no schema source): lesson.prof (demo bars, 92),',
    ' *   vocab.hint (from example pair), passage-seg.hint + quiz.hint (generic nudges).',
    ' * DROPPED (no prototype slot): sentence.difficulty.',
    ' * METADATA (no UI consumer): lesson.objective, lesson.conversation.',
    ` * Lessons exported: ${lessons.map((l) => `${l.id} -> l${l.ordinal}`).join(', ')}.`,
    ' */',
    '',
  ].join('\n');

  const body = `window.AIDIOMA_LESSONS = ${JSON.stringify(map, null, 2)};\n`;
  const output = header + body;
  if (checkOnly) {
    const current = existsSync(OUT_FILE) ? readFileSync(OUT_FILE, 'utf8') : '';
    if (current !== output) {
      console.error('[export-prototype] FAIL: apps/prototype/lesson-data.js is stale. Run npm run prototype:export.');
      process.exit(1);
    }
    console.log('[export-prototype] PASS: generated prototype data is current.');
    return;
  }
  writeFileSync(OUT_FILE, output, 'utf8');
  console.log(`[export-prototype] Wrote ${OUT_FILE}`);
  console.log(`[export-prototype] Lessons: ${Object.keys(map).join(', ')}`);
}

main();
