/**
 * AIdioma — Lesson Content Validator (local CI check)
 * ------------------------------------------------------------------
 * Run:  npm run content:validate
 * Flags:
 *   --lesson <id>        validate ONE lesson id, but in the context of all others
 *   --update-snapshot    append newly-seen ids to tooling/content/config/id-snapshot.json
 *   --snapshot <path>    override the snapshot file location
 *   --allowlist <path>   override the lexicon allowlist
 *   --json               emit a machine-readable JSON report (for QA agents) instead of text
 *
 * Exit code: 0 when there are zero ERRORs, 1 otherwise. WARN/INFO never fail the build.
 *
 * This enforces the CI-only invariants of the lesson contract (consensus §1.1 / §1.4,
 * packages/lesson-schema/src/index.ts §"CI-ONLY invariants"). The Zod schema is the single source of
 * truth for structure; this tool layers the cross-file / semantic checks on top.
 *
 * -----------------------------------------------------------------------------------------
 * SCOPE NOTE — check 12 (cumulative-vocab lexical leak) is a *detector*, NOT an authority.
 * Spanish inflection makes exact lemma matching naive, so this tool matches tokens against
 * taught lemmas + a pragmatic, generated inflection expansion (regular plural -s/-es, adj
 * -o/-a/-os/-as, and regular present-tense endings for taught verb lemmas) + a glue list +
 * a hand-maintained allowlist. Anything it cannot derive is reported as a WARN, never an
 * ERROR. Adversarial QA and human authors remain the authority on vocab leakage. Real
 * morphology (wordfreq difficulty scoring, kaikki/Wiktionary inflection tables) is phase-2
 * python-side tooling — see the TODO stubs at the bottom of this file.
 * -----------------------------------------------------------------------------------------
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, basename, dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  Lesson,
  VocabItem,
  MultipleChoiceItem,
  acceptedText,
} from '@aidioma/lesson-schema';

type LessonT = z.infer<typeof Lesson>;
type VocabT = z.infer<typeof VocabItem>;

const TOOL_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolvePath(TOOL_DIR, '..', '..');

/* ==================================================================
 * Finding model
 * ================================================================== */

type Severity = 'ERROR' | 'WARN' | 'INFO';

interface Finding {
  severity: Severity;
  code: string;        // stable check code, e.g. "VOCABREF_RESOLVE"
  lessonId: string;    // '(global)' or a lesson slug
  itemId?: string;     // offending item id, when applicable
  message: string;
}

const findings: Finding[] = [];
const add = (f: Finding) => findings.push(f);
const err = (code: string, lessonId: string, message: string, itemId?: string) =>
  add({ severity: 'ERROR', code, lessonId, itemId, message });
const warn = (code: string, lessonId: string, message: string, itemId?: string) =>
  add({ severity: 'WARN', code, lessonId, itemId, message });
const info = (code: string, lessonId: string, message: string, itemId?: string) =>
  add({ severity: 'INFO', code, lessonId, itemId, message });

/* ==================================================================
 * CLI args
 * ================================================================== */

const argv = process.argv.slice(2);
let lessonsDir = resolvePath(REPO_ROOT, 'content', 'lessons');
let onlyLesson: string | undefined;
let updateSnapshot = false;
let snapshotPath = join(TOOL_DIR, 'config', 'id-snapshot.json');
let allowlistPath = join(TOOL_DIR, 'config', 'lexicon-allowlist.json');
let jsonOut = false;

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--lesson') onlyLesson = argv[++i];
  else if (a === '--update-snapshot') updateSnapshot = true;
  else if (a === '--snapshot') snapshotPath = argv[++i];
  else if (a === '--allowlist') allowlistPath = argv[++i];
  else if (a === '--json') jsonOut = true;
  else if (a.startsWith('--')) {
    console.error(`Unknown flag: ${a}`);
    process.exit(2);
  } else {
    lessonsDir = a; // positional lessons-dir
  }
}

/* ==================================================================
 * Loading
 * ================================================================== */

interface Loaded {
  file: string;    // absolute path
  slug: string;    // filename without .json
  raw: unknown;    // parsed JSON (may be malformed vs schema)
  lesson?: LessonT; // present iff Zod-valid
}

function findLessonFiles(dir: string): string[] {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  const rels = readdirSync(dir, { recursive: true, encoding: 'utf8' }) as string[];
  return rels
    .filter((r) => r.endsWith('.json'))
    .map((r) => resolvePath(dir, r))
    .sort();
}

function loadAll(dir: string): Loaded[] {
  const files = findLessonFiles(dir);
  const loaded: Loaded[] = [];
  for (const file of files) {
    const slug = basename(file, '.json');
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(file, 'utf8'));
    } catch (e) {
      err('JSON_PARSE', slug, `File is not valid JSON: ${(e as Error).message}`);
      continue;
    }
    const parsed = Lesson.safeParse(raw);
    if (parsed.success) {
      loaded.push({ file, slug, raw, lesson: parsed.data });
    } else {
      // ZOD errors — report and keep the raw so id-uniqueness can still see it.
      for (const issue of parsed.error.issues) {
        err('ZOD_PARSE', slug, `${issue.path.join('.') || '(root)'}: ${issue.message}`);
      }
      loaded.push({ file, slug, raw });
    }
  }
  return loaded;
}

/* ==================================================================
 * Lexical helpers (checks 7, 8, 12, 13)
 * ================================================================== */

/** Lowercase, keep letters/digits (incl. accents/ñ), collapse everything else to spaces. */
function normLoose(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Stronger normalization for the hint-answer leak check (N1): like normLoose but ALSO
 * strips diacritics (NFD + drop combining marks) so "Adiós" ≈ "adios" and accent/case/
 * punctuation variants of the answer cannot slip a literal reveal past the check.
 */
function normLeak(s: string): string {
  return normLoose(s)
    .normalize('NFD')
    .replace(/\p{M}+/gu, '');
}

function stripMarkdown(md: string): string {
  return md
    // W2: strip ONLY the fence delimiters (and any info string), keeping the inner
    // prose so a fenced/inline code block cannot hide words from the ≤150 budget.
    .replace(/```[^\n]*\n?/g, ' ')        // opening/closing fence lines -> gone, content kept
    .replace(/`([^`]*)`/g, '$1')          // inline code -> inner text kept
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // links/images -> visible text
    .replace(/^[ \t]*#{1,6}[ \t]+/gm, '') // headings
    .replace(/^[ \t]*>[ \t]?/gm, '')      // blockquote markers
    .replace(/^[ \t]*[-+*][ \t]+/gm, '')  // bullet markers
    .replace(/[*_~]+/g, '')               // emphasis
    .replace(/\|/g, ' ')                  // table pipes
    .replace(/\s+/g, ' ')
    .trim();
}

function wordCount(md: string): number {
  const t = stripMarkdown(md);
  return t ? t.split(/\s+/).length : 0;
}

/**
 * Pragmatic inflection expansion for a single lemma. Regular patterns only:
 *  - nouns: plural -s (vowel) / -es (consonant)
 *  - adjectives: -o/-a/-os/-as gender-number set (+ plural for others)
 *  - verbs: infinitive + regular present-tense endings (tú/ustedes register, no vosotros);
 *           reflexive lemmas (…se) are stripped before conjugating.
 * Multiword lemmas (chunks / phrases) contribute the whole phrase AND each token.
 * This is deliberately over-generative: false "known" forms only *suppress* a WARN.
 */
function expandForms(lemmaRaw: string, pos: string): string[] {
  const l = normLoose(lemmaRaw);
  if (!l) return [];
  const forms = new Set<string>();
  if (l.includes(' ')) {
    forms.add(l);
    for (const t of l.split(' ')) if (t) forms.add(t);
    return [...forms];
  }
  forms.add(l);
  const addPlural = (w: string) => {
    if (/[aeiouáéíóú]$/.test(w)) forms.add(w + 's');
    else forms.add(w + 'es');
  };
  if (pos === 'noun') addPlural(l);
  if (pos === 'adj') {
    if (l.endsWith('o')) {
      const st = l.slice(0, -1);
      forms.add(st + 'a');
      forms.add(st + 'os');
      forms.add(st + 'as');
      addPlural(l);
    } else if (l.endsWith('a')) {
      forms.add(l + 's');
    } else {
      addPlural(l);
    }
  }
  if (pos === 'verb') {
    let v = l;
    if (v.endsWith('se')) v = v.slice(0, -2); // reflexive: levantarse -> levantar
    forms.add(v);
    const stem = v.slice(0, -2);
    const end = v.slice(-2);
    if (end === 'ar') for (const e of ['ar', 'o', 'as', 'a', 'amos', 'an']) forms.add(stem + e);
    else if (end === 'er') for (const e of ['er', 'o', 'es', 'e', 'emos', 'en']) forms.add(stem + e);
    else if (end === 'ir') for (const e of ['ir', 'o', 'es', 'e', 'imos', 'en']) forms.add(stem + e);
  }
  return [...forms];
}

/**
 * "Free glue" from CURRICULUM-MAP §"Glue-vocabulary policy" — function words available
 * from Lesson 1, never counted against the vocab budget. Kept in code so the detector works
 * even if the allowlist file is missing; the allowlist file layers extra forms on top.
 */
const GLUE: string[] = [
  // articles
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  // connectors
  'y', 'o', 'no', 'sí', 'si', 'también', 'tampoco', 'pero', 'ni',
  // prepositions
  'de', 'en', 'a', 'con', 'para', 'por',
  // degree / quantity adverbs
  'muy', 'más', 'mas', 'menos', 'poco', 'poca', 'pocos', 'pocas', 'mucho', 'mucha', 'muchos', 'muchas', 'bien', 'mal',
  // subject pronouns
  'yo', 'tú', 'tu', 'él', 'el', 'ella', 'nosotros', 'nosotras', 'ustedes', 'ellos', 'ellas',
  // reflexive / object clitics ride along (leak detector is permissive; se is warn-only anyway)
  'me', 'te', 'se', 'nos',
];

/**
 * Known proper nouns (personal names) the curriculum treats as free — they are not
 * "content words" to be traced to taught vocab. Kept as an EXPLICIT set (N2) so the leak
 * detector no longer blanket-exempts *every* capitalized mid-sentence token (which let
 * untaught words like "Fantasticamente" dodge the scan). Place/country/language proper
 * nouns already live in the lexicon allowlist; add corpus names here as content grows.
 */
const PROPER_NOUNS: string[] = [
  'ana', 'diego', 'camila', 'sofía', 'sofia', 'pedro',
  'maría', 'maria', 'juan', 'luis', 'carlos', 'lucía', 'lucia',
];

/* ==================================================================
 * Snapshot (check 9)
 * ================================================================== */

interface Snapshot {
  schema: number;
  updatedAt: string;
  // id -> the containing lesson's contentVersion at first snapshot time
  ids: Record<string, { contentVersion: number }>;
}

function loadSnapshot(path: string): Snapshot {
  if (!existsSync(path)) return { schema: 1, updatedAt: '', ids: {} };
  try {
    const s = JSON.parse(readFileSync(path, 'utf8')) as Snapshot;
    if (!s.ids) s.ids = {};
    return s;
  } catch {
    err('SNAPSHOT_UNREADABLE', '(global)', `Could not parse snapshot at ${path}; treating as empty.`);
    return { schema: 1, updatedAt: '', ids: {} };
  }
}

/* ==================================================================
 * Per-lesson id collectors
 * ================================================================== */

function lessonItemIds(l: LessonT): { id: string; contentVersion: number }[] {
  const cv = l.contentVersion;
  const out: { id: string; contentVersion: number }[] = [];
  out.push({ id: l.id, contentVersion: cv });
  out.push({ id: l.explanation.id, contentVersion: cv });
  for (const v of l.vocab) out.push({ id: v.id, contentVersion: cv });
  for (const s of l.sentences) out.push({ id: s.id, contentVersion: cv });
  out.push({ id: l.passage.id, contentVersion: cv });
  for (const seg of l.passage.segments) out.push({ id: seg.id, contentVersion: cv }); // P-002: immutable segment ids
  out.push({ id: l.conversation.id, contentVersion: cv });
  for (const q of l.quickChecks) out.push({ id: q.id, contentVersion: cv });
  return out;
}

/** All valid passageRef targets globally: passage ids + real segment ids (P-002). */
function collectPassageRefTargets(lessons: LessonT[]): Set<string> {
  const set = new Set<string>();
  for (const l of lessons) {
    set.add(l.passage.id);
    for (const seg of l.passage.segments) set.add(seg.id);
  }
  return set;
}

const LEVEL_PREFIX: Record<string, string> = { a1: 'A1', a2: 'A2', b1: 'B1', b2: 'B2' };

/* ==================================================================
 * MAIN
 * ================================================================== */

function main() {
  const loaded = loadAll(lessonsDir);

  if (loaded.length === 0) {
    // Includes: directory missing/empty, or every file failed JSON.parse (those are reported).
    const hardErrors = findings.filter((f) => f.severity === 'ERROR');
    if (hardErrors.length === 0) {
      report(loaded, [], []);
      if (!jsonOut) console.log(`\nNo lessons found in "${lessonsDir}". Nothing to validate.`);
      process.exit(0);
    }
    report(loaded, [], []);
    process.exit(1);
  }

  const validLessons = loaded.filter((l): l is Loaded & { lesson: LessonT } => !!l.lesson);
  const lessons = validLessons.map((l) => l.lesson);

  /* ---- Check 2: globally unique item + lesson IDs ---- */
  const idOwner = new Map<string, string>(); // id -> lessonId that first claimed it
  // include ids from raw (unparseable) lessons too, best-effort, so a dup with a broken file still trips.
  for (const l of loaded) {
    const lid = l.lesson?.id ?? (typeof (l.raw as any)?.id === 'string' ? (l.raw as any).id : l.slug);
    const ids = l.lesson
      ? lessonItemIds(l.lesson).map((x) => x.id)
      : typeof (l.raw as any)?.id === 'string'
        ? [(l.raw as any).id]
        : [];
    for (const id of ids) {
      if (idOwner.has(id)) {
        err('ID_UNIQUE', lid, `Duplicate id "${id}" (already used by lesson "${idOwner.get(id)}"). IDs are globally unique.`, id);
      } else {
        idOwner.set(id, lid);
      }
    }
  }

  /* ---- Check 3: unique ordinals; slug matches filename; level prefix consistency;
   *              ordinal ↔ slug-number ↔ item-id prefix consistency (W3 / contracts F5) ---- */
  const ordinalOwner = new Map<number, string>();
  const idPrefixOwner = new Map<string, string>(); // "a1-03" -> owning lesson id (W3: unique)
  for (const l of validLessons) {
    const les = l.lesson;
    if (les.id !== l.slug) {
      err('SLUG_FILENAME', les.id, `Lesson id "${les.id}" does not match filename "${l.slug}.json".`);
    }
    if (ordinalOwner.has(les.ordinal)) {
      err('ORDINAL_UNIQUE', les.id, `Duplicate ordinal ${les.ordinal} (also used by "${ordinalOwner.get(les.ordinal)}").`);
    } else {
      ordinalOwner.set(les.ordinal, les.id);
    }
    const prefix = les.id.split('-')[0]?.toLowerCase();
    const expectedLevel = prefix ? LEVEL_PREFIX[prefix] : undefined;
    if (expectedLevel && expectedLevel !== les.level) {
      err('LEVEL_CONSISTENCY', les.id, `Slug prefix "${prefix}" implies level ${expectedLevel} but level is "${les.level}".`);
    }

    /* ---- W3 / contracts-audit F5: item-id prefix ↔ slug prefix ↔ ordinal must all agree ---- */
    // Slug shape: "<level><num>-<ordinal>-<words>", e.g. "a1-03-que-haces" -> ("a1", "03").
    const m = /^([a-z]+\d+)-(\d+)(?:-|$)/.exec(les.id);
    if (!m) {
      err('ID_PREFIX_CONSISTENCY', les.id, `Lesson id "${les.id}" does not match the "<level><n>-<ordinal>-<slug>" shape; cannot verify ordinal/prefix consistency.`);
    } else {
      const idPrefix = `${m[1]}-${m[2]}`; // e.g. "a1-03" — the immutable item-id prefix
      const slugOrdinal = Number(m[2]);
      // (a) the ordinal encoded in the slug number must equal the declared ordinal
      if (slugOrdinal !== les.ordinal) {
        err('ID_PREFIX_CONSISTENCY', les.id, `Slug number "${m[2]}" implies ordinal ${slugOrdinal} but declared ordinal is ${les.ordinal}; they must agree.`);
      }
      // (b) two lessons must never share an id prefix
      if (idPrefixOwner.has(idPrefix)) {
        err('ID_PREFIX_CONSISTENCY', les.id, `Id prefix "${idPrefix}" is already used by lesson "${idPrefixOwner.get(idPrefix)}"; id prefixes must be unique.`);
      } else {
        idPrefixOwner.set(idPrefix, les.id);
      }
      // (c) every OWNED item id must carry this lesson's id prefix (e.g. "a1-03.v.hablar")
      for (const { id } of lessonItemIds(les)) {
        if (id === les.id) continue;              // the lesson slug itself has no dotted prefix
        const itemPrefix = id.split('.')[0];
        if (itemPrefix !== idPrefix) {
          err('ID_PREFIX_CONSISTENCY', les.id, `Item id "${id}" has prefix "${itemPrefix}" but its lesson's prefix is "${idPrefix}"; owned item ids must share the lesson prefix.`, id);
        }
      }
    }
  }

  /* ---- Prep for ordinal-aware checks ---- */
  const byOrdinalAsc = [...lessons].sort((a, b) => a.ordinal - b.ordinal);
  const lessonIdSet = new Set(lessons.map((l) => l.id));
  const ordinalOf = new Map(lessons.map((l) => [l.id, l.ordinal] as const));

  // vocab id -> owning lesson ordinal (for check 4)
  // N5: FIRST-write-wins (dedupe-safe). A duplicate vocab id in a later lesson must NOT
  // overwrite the original owner's ordinal, or check 4 would mis-report a FUTURE-lesson
  // violation against the innocent original. ID_UNIQUE still flags the actual duplicate.
  const vocabOrdinal = new Map<string, number>();
  for (const l of lessons) for (const v of l.vocab) if (!vocabOrdinal.has(v.id)) vocabOrdinal.set(v.id, l.ordinal);

  const passageRefTargets = collectPassageRefTargets(lessons);

  /* ---- Check 6 (graph): acyclic prerequisites (explicit DFS) ---- */
  detectPrereqCycles(lessons, lessonIdSet);

  /* ---- Cumulative lexical known-forms per lesson (checks 12) ---- */
  const fileAllow = loadAllowlist(allowlistPath);
  // baseKnown = glue + allowlist (available everywhere)
  const baseKnown = new Set<string>();
  for (const g of GLUE) baseKnown.add(normLoose(g));
  for (const n of PROPER_NOUNS) baseKnown.add(normLoose(n));
  for (const w of fileAllow) baseKnown.add(normLoose(w));

  // cumulative forms indexed by lesson id
  const knownFormsByLesson = new Map<string, Set<string>>();
  {
    const running = new Set<string>(baseKnown);
    for (const l of byOrdinalAsc) {
      // add this lesson's vocab forms (own lesson can use its own new vocab)
      for (const v of l.vocab) {
        for (const f of expandForms(v.es, v.pos)) running.add(f);
        if (v.chunk) for (const f of expandForms(v.es, 'phrase')) running.add(f);
      }
      knownFormsByLesson.set(l.id, new Set(running));
    }
  }

  /* ---- Check 13: duplicate es across lessons (built globally first) ---- */
  const esIndex = new Map<string, { lessonId: string; itemId: string }[]>();
  for (const l of lessons) {
    for (const s of l.sentences) {
      const key = normLoose(s.es);
      if (!key) continue;
      const arr = esIndex.get(key) ?? [];
      arr.push({ lessonId: l.id, itemId: s.id });
      esIndex.set(key, arr);
    }
  }

  /* ---- Per-lesson checks ---- */
  for (const l of lessons) {
    runPerLessonChecks(l, {
      vocabOrdinal,
      ordinalOf,
      lessonIdSet,
      passageRefTargets,
      knownForms: knownFormsByLesson.get(l.id)!,
      esIndex,
      lessons,
    });
  }

  /* ---- Check 9: snapshot ---- */
  runSnapshotCheck(lessons);

  /* ---- Output ---- */
  report(loaded, lessons, byOrdinalAsc);

  const relevant = onlyLesson ? findings.filter((f) => matchesLesson(f, onlyLesson!)) : findings;
  const hasError = relevant.some((f) => f.severity === 'ERROR');
  process.exit(hasError ? 1 : 0);
}

/* ==================================================================
 * Per-lesson check body
 * ================================================================== */

interface Ctx {
  vocabOrdinal: Map<string, number>;
  ordinalOf: Map<string, number>;
  lessonIdSet: Set<string>;
  passageRefTargets: Set<string>;
  knownForms: Set<string>;
  esIndex: Map<string, { lessonId: string; itemId: string }[]>;
  lessons: LessonT[];
}

function runPerLessonChecks(l: LessonT, ctx: Ctx) {
  const lid = l.id;
  const ownVocabIds = new Set(l.vocab.map((v) => v.id));

  /* ---- Check 4: vocabRefs resolve to same or PRIOR lesson vocab (by ordinal) ---- */
  const checkRef = (ref: string, itemId: string) => {
    const refOrdinal = ctx.vocabOrdinal.get(ref);
    if (refOrdinal === undefined) {
      err('VOCABREF_RESOLVE', lid, `vocabRef "${ref}" does not resolve to any VocabItem id.`, itemId);
    } else if (refOrdinal > l.ordinal) {
      err('VOCABREF_RESOLVE', lid, `vocabRef "${ref}" points to a FUTURE lesson (ordinal ${refOrdinal} > ${l.ordinal}); only same/prior vocab allowed.`, itemId);
    }
  };
  for (const s of l.sentences) for (const r of s.vocabRefs) checkRef(r, s.id);
  l.passage.segments.forEach((seg) => {
    for (const r of seg.vocabRefs) checkRef(r, seg.id); // P-002: real segment id
  });
  for (const r of l.conversation.vocabRefs) checkRef(r, l.conversation.id);
  for (const q of l.quickChecks) for (const r of q.vocabRefs) checkRef(r, q.id);

  /* ---- Check 5: every own vocab exercised by >=1 own-lesson sentence ---- */
  const exercised = new Set<string>();
  for (const s of l.sentences) for (const r of s.vocabRefs) if (ownVocabIds.has(r)) exercised.add(r);
  for (const v of l.vocab) {
    if (!exercised.has(v.id)) {
      warnOrErrVocabUnused(l, v);
    }
  }

  /* ---- Check 6: prerequisites acyclic, existing, lower ordinal ---- */
  for (const p of l.prerequisites) {
    if (!ctx.lessonIdSet.has(p)) {
      err('PREREQ_EXISTS', lid, `prerequisite "${p}" does not reference an existing lesson.`);
      continue;
    }
    const po = ctx.ordinalOf.get(p)!;
    if (po >= l.ordinal) {
      err('PREREQ_ORDINAL', lid, `prerequisite "${p}" (ordinal ${po}) must have a LOWER ordinal than ${l.ordinal}.`);
    }
  }

  /* ---- Check 7: explanation word count <=150 (markdown stripped) ---- */
  const wc = wordCount(l.explanation.markdown);
  if (wc > 150) {
    err('EXPLANATION_WORDS', lid, `Explanation is ${wc} words (>150 budget after stripping markdown).`, l.explanation.id);
  }

  /* ---- Check 8: hint 3 must not reveal the full es answer ----
   * N1: normalize accents/case/punctuation (normLeak) and flag hint-3 that EQUALS *or
   * CONTAINS* the full answer string — not just exact equality — so "La respuesta es:
   * Hola, soy Ana." (answer verbatim + extra words) is caught, as are accent variants. */
  for (const s of l.sentences) {
    if (s.hints.length !== 3) continue; // Zod enforces; guard anyway
    const h3 = normLeak(s.hints[2]);
    if (!h3) continue;
    const answers = [s.es, ...s.acceptedEs.map(acceptedText)];
    const leaked = answers.find((a) => {
      const na = normLeak(a);
      if (!na) return false;
      // guard against trivial containment: require the answer to be multi-token OR the
      // hint to be effectively just the answer.
      const multiToken = na.includes(' ');
      return h3 === na || (multiToken && (h3 === na || (' ' + h3 + ' ').includes(' ' + na + ' ')));
    });
    if (leaked !== undefined) {
      err('HINT_ANSWER_LEAK', lid, `Hint 3 reveals the literal es answer ("${leaked}"); it must not contain the full answer verbatim.`, s.id);
    }
  }

  /* ---- Check 10: multipleChoice (quickChecks) ---- */
  for (const q of l.quickChecks) {
    if (q.correctIndex < 0 || q.correctIndex >= q.choices.length) {
      err('MC_INDEX', lid, `multipleChoice correctIndex ${q.correctIndex} is out of range (choices: ${q.choices.length}).`, q.id);
    }
    const seen = new Set<string>();
    for (const c of q.choices) {
      const k = normLoose(c);
      if (seen.has(k)) {
        err('MC_CHOICES_UNIQUE', lid, `multipleChoice has duplicate choice "${c}".`, q.id);
        break;
      }
      seen.add(k);
    }
    if (q.passageRef !== undefined && !ctx.passageRefTargets.has(q.passageRef)) {
      err('MC_PASSAGEREF', lid, `multipleChoice passageRef "${q.passageRef}" does not resolve to a passage/segment id.`, q.id);
    }
  }

  /* ---- Check 11: acceptedEs count (WARN) / acceptedEn empty (INFO) ---- */
  for (const s of l.sentences) {
    const n = s.acceptedEs.length;
    if (n < 3) {
      warn('ACCEPTED_ES_COUNT', lid, `acceptedEs has ${n} alternate(s); launch priority is 3–6.`, s.id);
    } else if (n > 6) {
      warn('ACCEPTED_ES_COUNT', lid, `acceptedEs has ${n} alternates (>6); trim toward the 3–6 launch range.`, s.id);
    }
    if (s.acceptedEn.length === 0) {
      info('ACCEPTED_EN_EMPTY', lid, `acceptedEn is empty (informational; en alternates are optional).`, s.id);
    }
  }

  /* ---- Check 12: cumulative-vocab lexical leak (WARN, detector only) ---- */
  const scanEs = (text: string, itemId: string) => {
    const words = text.split(/\s+/);
    words.forEach((wRaw) => {
      const stripped = wRaw.replace(/[^\p{L}\p{N}]/gu, '');
      if (!stripped) return;
      const token = normLoose(stripped);
      if (!token) return;
      if (/^\d+$/.test(token)) return; // bare digits
      // N2: NO blanket capitalization exemption. Proper nouns (names/places/languages) are
      // tracked explicitly in PROPER_NOUNS + the allowlist and thus land in knownForms; every
      // other token — capitalized mid-sentence or not — must trace to taught vocab/glue.
      if (ctx.knownForms.has(token)) return;
      warn(
        'VOCAB_LEAK',
        lid,
        `Token "${stripped}" not derivable from taught vocab/glue/allowlist/proper-nouns (leak DETECTOR — verify by hand).`,
        itemId,
      );
    });
  };
  for (const s of l.sentences) scanEs(s.es, s.id);
  l.passage.segments.forEach((seg) => {
    scanEs(seg.es, seg.id); // P-002: real segment id
  });
  scanEs(l.conversation.openingLine, l.conversation.id);
  for (const g of l.conversation.goalPhrases) scanEs(g, l.conversation.id);
  // N2: scan learner-facing vocab example sentences too (exampleEs) — previously unscanned.
  for (const v of l.vocab) scanEs(v.exampleEs, v.id);

  /* ---- Check 13: duplicate es across lessons (WARN) ---- */
  for (const s of l.sentences) {
    const key = normLoose(s.es);
    const group = ctx.esIndex.get(key);
    if (!group) continue;
    const others = group.filter((g) => g.lessonId !== l.id);
    if (others.length > 0) {
      warn('DUP_SENTENCE', lid, `es "${s.es}" duplicates a sentence in another lesson (${others.map((o) => o.itemId).join(', ')}).`, s.id);
    }
  }

  /* ---- Check 14: difficulty distribution sanity (WARN) ---- */
  const diffs = l.sentences.map((s) => s.difficulty);
  if (diffs.length > 0 && diffs.every((d) => d === 1)) {
    warn('DIFFICULTY_SANITY', lid, `All ${diffs.length} sentences are difficulty 1; spread difficulty across the lesson.`);
  } else if (diffs.length > 0 && diffs.every((d) => d === 5)) {
    warn('DIFFICULTY_SANITY', lid, `All ${diffs.length} sentences are difficulty 5; spread difficulty across the lesson.`);
  }
}

/**
 * Check 5 is an ERROR per the consensus invariant. Set-type vocab (numbers/days) is
 * satisfied when the SET is represented rather than every member (Style Guide §9), but the
 * schema has no set marker, so we cannot distinguish members here — we report the ERROR and
 * note the exception so an author can confirm a set member is genuinely represented.
 */
function warnOrErrVocabUnused(l: LessonT, v: VocabT) {
  err(
    'VOCAB_EXERCISED',
    l.id,
    `Vocab "${v.id}" (${v.es}) is not exercised by any sentence vocabRef in its own lesson.` +
      ` (If it is a set-type member — numbers/days — confirm the set is represented; Style Guide §9.)`,
    v.id,
  );
}

/**
 * Explicit cycle detection over the prerequisite DAG (check 6). The lower-ordinal rule
 * already makes cycles impossible for well-formed content, but this reports a clear
 * PREREQ_CYCLE (with the cycle path) if ordinals are malformed/equal, independent of that.
 */
function detectPrereqCycles(lessons: LessonT[], lessonIdSet: Set<string>) {
  const graph = new Map<string, string[]>();
  for (const l of lessons) graph.set(l.id, l.prerequisites.filter((p) => lessonIdSet.has(p)));
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  const reported = new Set<string>();
  const stack: string[] = [];
  const visit = (node: string) => {
    color.set(node, GRAY);
    stack.push(node);
    for (const next of graph.get(node) ?? []) {
      const c = color.get(next) ?? WHITE;
      if (c === GRAY) {
        const at = stack.indexOf(next);
        const cyclePath = [...stack.slice(at), next];
        const key = [...cyclePath].sort().join('>');
        if (!reported.has(key)) {
          reported.add(key);
          err('PREREQ_CYCLE', node, `Prerequisite cycle detected: ${cyclePath.join(' -> ')}.`);
        }
      } else if (c === WHITE) {
        visit(next);
      }
    }
    stack.pop();
    color.set(node, BLACK);
  };
  for (const l of lessons) if ((color.get(l.id) ?? WHITE) === WHITE) visit(l.id);
}

/* ==================================================================
 * Snapshot check (9)
 * ================================================================== */

function runSnapshotCheck(lessons: LessonT[]) {
  const snap = loadSnapshot(snapshotPath);
  const current = new Map<string, number>();
  for (const l of lessons) for (const { id, contentVersion } of lessonItemIds(l)) current.set(id, contentVersion);

  // Missing: previously-snapshotted ids no longer present -> ERROR (deletion forbidden).
  for (const id of Object.keys(snap.ids)) {
    if (!current.has(id)) {
      err('SNAPSHOT_MISSING', '(global)', `Previously-snapshotted id "${id}" is missing. Deletion is forbidden — deprecate, never delete.`, id);
    }
  }

  // W4: the snapshot is the authoritative immutability baseline; it must NEVER be advanced
  // from a FAILING run (that already bit us — phantom scratch-draft ids entered the snapshot).
  // Refuse to persist unless the ENTIRE run has zero ERRORs, and say exactly why.
  const runHasErrors = findings.some((f) => f.severity === 'ERROR');

  // New ids: present now, not in snapshot.
  const newIds = [...current.keys()].filter((id) => !(id in snap.ids));
  if (newIds.length > 0) {
    if (updateSnapshot && runHasErrors) {
      warn(
        'SNAPSHOT_UPDATE_REFUSED',
        '(global)',
        `Refusing to advance the snapshot: this run has ERROR(s). The snapshot is an authoritative ` +
          `immutability baseline and must not be updated from a red build (poisoning guard). ` +
          `${newIds.length} new id(s) were NOT recorded — fix all errors, then re-run --update-snapshot.`,
      );
    } else if (updateSnapshot) {
      for (const id of newIds) snap.ids[id] = { contentVersion: current.get(id)! };
      snap.schema = snap.schema || 1;
      snap.updatedAt = new Date().toISOString();
      writeFileSync(snapshotPath, JSON.stringify(snap, null, 2) + '\n');
      info('SNAPSHOT_UPDATED', '(global)', `Appended ${newIds.length} new id(s) to snapshot ${snapshotPath}.`);
    } else {
      const preview = newIds.slice(0, 12).join(', ');
      const more = newIds.length > 12 ? `, … (+${newIds.length - 12} more)` : '';
      info(
        'SNAPSHOT_NEW',
        '(global)',
        `${newIds.length} new id(s) not yet in snapshot (run --update-snapshot to record them): ${preview}${more}`,
      );
    }
  } else if (updateSnapshot && !runHasErrors && !existsSync(snapshotPath)) {
    // no ids at all but flag given on a clean run: still create an empty snapshot
    snap.updatedAt = new Date().toISOString();
    writeFileSync(snapshotPath, JSON.stringify(snap, null, 2) + '\n');
  }
}

/* ==================================================================
 * Allowlist loader
 * ================================================================== */

function loadAllowlist(path: string): string[] {
  if (!existsSync(path)) return [];
  try {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    // accept either { words: [...] } or a bare array
    const words: unknown = Array.isArray(data) ? data : data?.words;
    if (!Array.isArray(words)) return [];
    return words.filter((w): w is string => typeof w === 'string');
  } catch {
    warn('ALLOWLIST_UNREADABLE', '(global)', `Could not parse allowlist at ${path}; proceeding with glue only.`);
    return [];
  }
}

/* ==================================================================
 * Output
 * ================================================================== */

function matchesLesson(f: Finding, id: string): boolean {
  // W1: `--lesson <id>` narrows to that lesson, but GLOBAL findings (snapshot immutability,
  // unreadable snapshot/allowlist) are never lesson-scoped and must ALWAYS count — otherwise
  // a forbidden id deletion would return exit 0 under the flag's documented CI use.
  return f.lessonId === id || f.lessonId === '(global)';
}

function report(loaded: Loaded[], lessons: LessonT[], byOrdinalAsc: LessonT[]) {
  const shown = onlyLesson ? findings.filter((f) => matchesLesson(f, onlyLesson!)) : findings;

  if (jsonOut) {
    // per-lesson tallies
    const lessonIds = (onlyLesson ? loaded.filter((l) => (l.lesson?.id ?? l.slug) === onlyLesson) : loaded).map(
      (l) => l.lesson?.id ?? l.slug,
    );
    const perLesson = lessonIds.map((id) => tally(id));
    const globalTally = tally('(global)');
    const out = {
      ok: shown.every((f) => f.severity !== 'ERROR'),
      lessonsDir,
      onlyLesson: onlyLesson ?? null,
      counts: {
        errors: shown.filter((f) => f.severity === 'ERROR').length,
        warnings: shown.filter((f) => f.severity === 'WARN').length,
        info: shown.filter((f) => f.severity === 'INFO').length,
      },
      findings: shown,
      summary: {
        global: globalTally,
        perLesson,
      },
    };
    console.log(JSON.stringify(out, null, 2));
    return;
  }

  // text mode
  const order: Record<Severity, number> = { ERROR: 0, WARN: 1, INFO: 2 };
  const sorted = [...shown].sort(
    (a, b) => order[a.severity] - order[b.severity] || a.lessonId.localeCompare(b.lessonId) || a.code.localeCompare(b.code),
  );

  if (sorted.length === 0) {
    console.log('No findings.');
  } else {
    console.log('Findings');
    console.log('--------');
    for (const f of sorted) {
      const loc = f.itemId ? `${f.lessonId} / ${f.itemId}` : f.lessonId;
      console.log(`  [${f.severity}] ${f.code}  (${loc})`);
      console.log(`         ${f.message}`);
    }
  }

  // summary table
  const lessonIds = onlyLesson
    ? loaded.filter((l) => (l.lesson?.id ?? l.slug) === onlyLesson).map((l) => l.lesson?.id ?? l.slug)
    : loaded.map((l) => l.lesson?.id ?? l.slug);
  console.log('\nSummary');
  console.log('-------');
  const pad = (s: string, n: number) => s.padEnd(n);
  console.log(`  ${pad('LESSON', 30)} ${pad('ERR', 5)} ${pad('WARN', 5)} STATUS`);
  const rows = ['(global)', ...lessonIds];
  for (const id of rows) {
    const t = tally(id);
    if (id === '(global)' && t.errors === 0 && t.warnings === 0 && t.info === 0) continue;
    const status = t.errors > 0 ? 'FAIL' : t.warnings > 0 ? 'warn' : 'ok';
    console.log(`  ${pad(id, 30)} ${pad(String(t.errors), 5)} ${pad(String(t.warnings), 5)} ${status}`);
  }
  const totalErr = shown.filter((f) => f.severity === 'ERROR').length;
  const totalWarn = shown.filter((f) => f.severity === 'WARN').length;
  console.log(`\n  ${totalErr} error(s), ${totalWarn} warning(s) across ${lessonIds.length} lesson(s).`);
  console.log(totalErr === 0 ? '  RESULT: PASS' : '  RESULT: FAIL');
}

function tally(lessonId: string) {
  const f = findings.filter((x) => x.lessonId === lessonId);
  return {
    lessonId,
    errors: f.filter((x) => x.severity === 'ERROR').length,
    warnings: f.filter((x) => x.severity === 'WARN').length,
    info: f.filter((x) => x.severity === 'INFO').length,
  };
}

/* ==================================================================
 * PHASE-2 TODO (python-side tooling — intentionally NOT implemented here)
 * ------------------------------------------------------------------
 * TODO(phase-2): wordfreq-based difficulty scoring. Cross-check each sentence's authored
 *   `difficulty` (1–5) against a corpus frequency signal (e.g. the `wordfreq` package) so a
 *   sentence built entirely from top-500 lemmas can't be tagged difficulty 5, and vice
 *   versa. Out of scope for this TS validator (no python runtime here); lives in the
 *   content pipeline's python tooling.
 *
 * TODO(phase-2): kaikki.org / Wiktionary morphology check. Replace the pragmatic
 *   `expandForms` heuristic (regular plurals/adjective endings/regular present tense) with a
 *   real inflection-table lookup (kaikki Spanish dump) so the leak detector can resolve
 *   irregular/stem-changing forms authoritatively and promote high-confidence leaks from
 *   WARN toward ERROR. Also python-side; keep this TS tool dependency-free.
 * ================================================================== */

main();
