/**
 * AIdioma — validate.ts fixture suite (counter-examples)
 * ------------------------------------------------------------------
 * Run:  npm run content:fixtures
 *
 * Proves each NEW / FIXED check in tools/validate.ts actually FIRES (and, for the
 * dedupe-safety fix, that an innocent lesson does NOT get a misattributed error).
 *
 * Strategy: each scenario starts from the REAL lessons (the single source of truth for a
 * valid, parseable lesson), applies a tiny mutation, writes the result into an ISOLATED
 * temp dir (one scenario = its own dir, so cross-lesson prefix/id checks never bleed between
 * scenarios), then runs validate.ts --json against that dir and asserts on the findings and
 * the process exit code. Nothing here mutates the committed corpus or snapshot.
 *
 * Covers: W1 (--lesson keeps global ERRORs), W2 (fenced-code word count), W3
 * (ordinal↔slug↔item-id-prefix), W4 (snapshot refuses a red build),
 * N1 (hint-3 substring leak), N2 (exampleEs scan + dropped capitalization exemption),
 * N5 (duplicate-id ordinal map is dedupe-safe), and P-003 setId partitioning for vocab
 * exercise coverage. Also covers P-005 reference-card immutable ids and vocabRef resolution.
 * Plus a green baseline on the real corpus.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolvePath(HERE, '..', '..', '..');
const LESSONS = resolvePath(REPO, 'content', 'lessons', 'a1');
const VALIDATE = resolvePath(REPO, 'tooling', 'content', 'validate.ts');
const TSX_CLI = createRequire(import.meta.url).resolve('tsx/cli');
const TMP_ROOT = join(HERE, '.gen');

type Lesson = any;
const loadBase = (slug: string): Lesson => JSON.parse(readFileSync(join(LESSONS, `${slug}.json`), 'utf8'));
// Keep the green control aligned with the immutable-ID snapshot as the canonical corpus grows.
// A hard-coded lesson list turns every newly snapshotted lesson into a false SNAPSHOT_MISSING failure.
const loadCorpus = (): Lesson[] =>
  readdirSync(LESSONS)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => JSON.parse(readFileSync(join(LESSONS, name), 'utf8')));
const clone = (o: unknown): any => JSON.parse(JSON.stringify(o));

interface RunResult {
  ok: boolean;
  exitCode: number;
  findings: { severity: string; code: string; lessonId: string; itemId?: string; message: string }[];
}

/** Write lessons into a fresh dir and run validate.ts --json against it. */
function runValidate(dir: string, lessons: Lesson[], extraArgs: string[] = [], env: NodeJS.ProcessEnv = {}): RunResult {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const l of lessons) writeFileSync(join(dir, `${l.id}.json`), JSON.stringify(l, null, 2));
  let exitCode = 0;
  let stdout = '';
  try {
    stdout = execFileSync(process.execPath, [TSX_CLI, VALIDATE, dir, '--json', ...extraArgs], {
      encoding: 'utf8',
      env: { ...process.env, ...env },
    });
  } catch (e: any) {
    exitCode = e.status ?? 1;
    stdout = e.stdout ?? '';
  }
  let parsed: any = {};
  try {
    parsed = JSON.parse(stdout);
  } catch {
    parsed = { ok: false, findings: [] };
  }
  return { ok: parsed.ok, exitCode, findings: parsed.findings ?? [] };
}

/* ------------------------------------------------------------------ assertions */

let passCount = 0;
let failCount = 0;
const fails: string[] = [];

interface Expect {
  code: string;
  lessonId?: string;
  msgIncludes?: string;
}

function has(res: RunResult, e: Expect): boolean {
  return res.findings.some(
    (f) =>
      f.code === e.code &&
      (e.lessonId === undefined || f.lessonId === e.lessonId) &&
      (e.msgIncludes === undefined || f.message.includes(e.msgIncludes)),
  );
}

function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    passCount++;
    console.log(`  PASS  ${name}`);
  } else {
    failCount++;
    fails.push(name);
    console.log(`  FAIL  ${name}${detail ? `  — ${detail}` : ''}`);
  }
}

const tmp = (n: string) => join(TMP_ROOT, n);

/* ================================================================== scenarios */

function main() {
  rmSync(TMP_ROOT, { recursive: true, force: true });
  console.log('Fixture suite — counter-examples for validate.ts\n');

  const a1 = () => loadBase('a1-01-hola-me-llamo');
  const a2 = () => loadBase('a1-02-soy-asi');

  /* ---- Baseline: real corpus is green (control) ---- */
  {
    const res = runValidate(tmp('baseline'), loadCorpus());
    check('baseline: real corpus has ZERO errors', res.exitCode === 0 && !res.findings.some((f) => f.severity === 'ERROR'));
  }

  /* ---- W1: --lesson must NOT drop a global SNAPSHOT_MISSING error ---- */
  {
    const dir = tmp('w1');
    const snap = join(TMP_ROOT, 'w1-snapshot.json');
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    writeFileSync(snap, JSON.stringify({ schema: 1, updatedAt: '', ids: { 'a1-99.v.ghost': { contentVersion: 1 } } }));
    const l = a1();
    const res = runValidate(dir, [l], ['--snapshot', snap, '--lesson', l.id]);
    check('W1: --lesson still reports global SNAPSHOT_MISSING', has(res, { code: 'SNAPSHOT_MISSING', lessonId: '(global)' }));
    check('W1: --lesson with a global ERROR exits non-zero', res.exitCode === 1);
  }

  /* ---- W2: a fenced code block cannot hide words from the ≤150 budget ---- */
  {
    const l = a1();
    const filler = Array.from({ length: 400 }, () => 'palabra').join(' ');
    l.explanation.markdown = 'Intro.\n\n```\n' + filler + '\n```';
    const res = runValidate(tmp('w2'), [l]);
    check('W2: fenced 400-word explanation trips EXPLANATION_WORDS', has(res, { code: 'EXPLANATION_WORDS' }));
  }

  /* ---- W3a: slug number must equal ordinal ---- */
  {
    const l = a1();
    l.ordinal = 7;
    const res = runValidate(tmp('w3a'), [l]);
    check('W3a: ordinal 7 vs slug "01" trips ID_PREFIX_CONSISTENCY', has(res, { code: 'ID_PREFIX_CONSISTENCY', msgIncludes: 'implies ordinal' }));
  }

  /* ---- W3b: two lessons must not share an id prefix ---- */
  {
    const a = a1();
    a.id = 'a1-02-alpha';
    a.ordinal = 2;
    const b = a2();
    b.id = 'a1-02-beta';
    b.ordinal = 2;
    const res = runValidate(tmp('w3b'), [a, b]);
    check('W3b: shared id prefix "a1-02" trips ID_PREFIX_CONSISTENCY', has(res, { code: 'ID_PREFIX_CONSISTENCY', msgIncludes: 'already used by lesson' }));
  }

  /* ---- W3c: owned item id whose prefix != lesson prefix ---- */
  {
    const l = a1();
    l.vocab[0].id = 'a1-99.v.hola'; // wrong prefix (lesson is a1-01)
    const res = runValidate(tmp('w3c'), [l]);
    check('W3c: mis-prefixed owned item id trips ID_PREFIX_CONSISTENCY', has(res, { code: 'ID_PREFIX_CONSISTENCY', msgIncludes: 'must share the lesson prefix' }));
  }

  /* ---- W4: --update-snapshot refuses to advance from a red build ---- */
  {
    const dir = tmp('w4');
    const snap = join(TMP_ROOT, 'w4-snapshot.json'); // fresh, non-existent
    rmSync(snap, { force: true });
    const l = a1();
    l.explanation.markdown = Array.from({ length: 400 }, () => 'palabra').join(' '); // forces an ERROR
    const res = runValidate(dir, [l], ['--update-snapshot', '--snapshot', snap]);
    check('W4: red build + --update-snapshot emits SNAPSHOT_UPDATE_REFUSED', has(res, { code: 'SNAPSHOT_UPDATE_REFUSED' }));
    check('W4: red build did NOT write the snapshot file', !existsSync(snap));
    check('W4: red build still exits non-zero', res.exitCode === 1);
  }

  /* ---- W4b (control): --update-snapshot DOES write on a clean run ---- */
  {
    const dir = tmp('w4b');
    const snap = join(TMP_ROOT, 'w4b-snapshot.json');
    rmSync(snap, { force: true });
    const res = runValidate(dir, [a1()], ['--update-snapshot', '--snapshot', snap]);
    check('W4b: clean build + --update-snapshot writes the snapshot', existsSync(snap) && has(res, { code: 'SNAPSHOT_UPDATED' }));
  }

  /* ---- P-005a: reference-card ids participate in the immutable-id snapshot ---- */
  {
    const dir = tmp('p005-snapshot');
    const snap = join(TMP_ROOT, 'p005-snapshot.json');
    const l = a1();
    const cardId = 'a1-01.r.fixture';
    l.referenceCards = [{
      id: cardId,
      kind: 'referenceCard',
      title: 'Fixture reference card',
      markdown: 'Fixture.',
      vocabRefs: [l.vocab[0].id],
    }];
    const updated = runValidate(dir, [l], ['--update-snapshot', '--snapshot', snap]);
    const snapshotIds = existsSync(snap) ? JSON.parse(readFileSync(snap, 'utf8')).ids : {};
    check(
      'P-005a: reference-card id is written to the immutable-id snapshot',
      updated.exitCode === 0 && snapshotIds[cardId]?.contentVersion === l.contentVersion,
    );

    l.referenceCards = [];
    const removed = runValidate(dir, [l], ['--snapshot', snap]);
    check(
      'P-005a: removing a snapshotted reference-card id trips SNAPSHOT_MISSING',
      has(removed, { code: 'SNAPSHOT_MISSING', lessonId: '(global)', msgIncludes: cardId }) && removed.exitCode === 1,
    );
  }

  /* ---- P-005b: reference-card vocabRefs use normal resolution rules ---- */
  {
    const l = a1();
    const cardId = 'a1-01.r.fixture';
    l.referenceCards = [{
      id: cardId,
      kind: 'referenceCard',
      title: 'Fixture reference card',
      markdown: 'Fixture.',
      vocabRefs: ['a1-01.v.does-not-exist'],
    }];
    const res = runValidate(tmp('p005-vocabref'), [l]);
    check(
      'P-005b: bad reference-card vocabRef trips VOCABREF_RESOLVE on the card',
      has(res, { code: 'VOCABREF_RESOLVE', lessonId: l.id, msgIncludes: 'does-not-exist' }) &&
        res.findings.some((f) => f.code === 'VOCABREF_RESOLVE' && f.itemId === cardId) &&
        res.exitCode === 1,
    );
  }

  /* ---- N1: hint 3 that CONTAINS the full answer (not just equals) ---- */
  {
    const l = a1();
    l.sentences[0].hints[2] = 'La respuesta es: ' + l.sentences[0].es;
    const res = runValidate(tmp('n1'), [l]);
    check('N1: hint-3 containing the full answer trips HINT_ANSWER_LEAK', has(res, { code: 'HINT_ANSWER_LEAK', itemId: l.sentences[0].id } as any));
  }

  /* ---- P-003.3a: one exercised member represents its whole set (old false FAIL) ---- */
  {
    const l = a1();
    const represented = l.vocab[0];
    const unreferenced = l.vocab[1];
    represented.setId = 'fixture-greetings';
    unreferenced.setId = 'fixture-greetings';
    for (const s of l.sentences) {
      s.vocabRefs = s.vocabRefs.filter((ref: string) => ref !== unreferenced.id);
    }
    const res = runValidate(tmp('p003-set-represented'), [l]);
    const coverageFindings = res.findings.filter((f) => f.code === 'VOCAB_EXERCISED');
    check('P-003.3a: represented set passes when a different member is unreferenced', coverageFindings.length === 0);
  }

  /* ---- P-003.3b: a wholly unrepresented set fails once at group grain ---- */
  {
    const l = a1();
    const first = l.vocab[0];
    const second = l.vocab[1];
    first.setId = 'fixture-greetings';
    second.setId = 'fixture-greetings';
    for (const s of l.sentences) {
      s.vocabRefs = s.vocabRefs.filter((ref: string) => ref !== first.id && ref !== second.id);
    }
    const res = runValidate(tmp('p003-set-unrepresented'), [l]);
    const coverageFindings = res.findings.filter((f) => f.code === 'VOCAB_EXERCISED');
    check(
      'P-003.3b: unrepresented set emits one group-level VOCAB_EXERCISED error',
      coverageFindings.length === 1 && coverageFindings[0].message.includes('fixture-greetings') && res.exitCode === 1,
    );
  }

  /* ---- N2a: vocab exampleEs is now scanned for leaks ---- */
  {
    const l = a1();
    l.vocab[0].exampleEs = 'Hola, murcielago xilofono.';
    const res = runValidate(tmp('n2a'), [l]);
    check('N2a: leak in vocab.exampleEs trips VOCAB_LEAK', has(res, { code: 'VOCAB_LEAK', itemId: l.vocab[0].id } as any));
  }

  /* ---- N2b: capitalized mid-sentence untaught word is no longer exempted ---- */
  {
    const l = a1();
    l.sentences[0].es = 'Hola, soy Ana Fantasticamente.';
    const res = runValidate(tmp('n2b'), [l]);
    const leak = res.findings.find((f) => f.code === 'VOCAB_LEAK' && /Fantasticamente/i.test(f.message));
    check('N2b: capitalized untaught "Fantasticamente" trips VOCAB_LEAK', !!leak);
  }

  /* ---- N5: duplicate vocab id across lessons must NOT misattribute a FUTURE error ---- */
  {
    const a = a1(); // ordinal 1, owns a1-01.v.hola, references it in its own sentences
    const b = a2(); // ordinal 2
    b.vocab[0].id = 'a1-01.v.hola'; // duplicate of a1-01's id (collision)
    const res = runValidate(tmp('n5'), [a, b]);
    check('N5: duplicate id still flags ID_UNIQUE', has(res, { code: 'ID_UNIQUE' }));
    const misattributed = res.findings.some(
      (f) => f.code === 'VOCABREF_RESOLVE' && f.lessonId === a.id && /FUTURE/.test(f.message),
    );
    check('N5: innocent a1-01 gets NO misattributed FUTURE-lesson error', !misattributed);
  }

  /* ---- Summary ---- */
  console.log(`\n${passCount} passed, ${failCount} failed.`);
  if (failCount > 0) {
    console.log('FAILED: ' + fails.join(', '));
    console.log('RESULT: FAIL');
    process.exit(1);
  }
  console.log('RESULT: PASS');
  rmSync(TMP_ROOT, { recursive: true, force: true });
}

main();
