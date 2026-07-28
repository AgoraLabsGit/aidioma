/**
 * schema-smoke.ts — fast sanity check for the shared lesson contract.
 * Run: npm run contract:smoke
 * Kept (not deleted) as a fast, human-readable contract check; it is NOT the
 * real content validator (that lives in tools/ per the roadmap).
 */

import {
  Lesson,
  MultipleChoiceItem,
  GRAMMAR_TAGS,
  GRAMMAR_TAG_VERSION,
} from '../src/index.js';

let failures = 0;
const ok = (label: string) => console.log(`  PASS  ${label}`);
const bad = (label: string, detail?: unknown) => {
  failures++;
  console.error(`  FAIL  ${label}`, detail ?? '');
};

/* ---- enum sanity: count by level provenance ---- */
const A1 = GRAMMAR_TAGS.slice(0, 31);
const total = GRAMMAR_TAGS.length;
const unique = new Set(GRAMMAR_TAGS).size;
if (total === unique) ok(`GrammarTag has no duplicates (${total} tags)`);
else bad(`GrammarTag has duplicates`, `${total} listed / ${unique} unique`);
if (A1.length === 31) ok('A1 block = 31 tags (map §7 + P-003 formula.courtesy)');
else bad('A1 block != 31', A1.length);
if (total >= 45 && total <= 59) ok(`total ${total} within 45–59 target`);
else bad('total out of 45–59 range', total);
if (GRAMMAR_TAG_VERSION === 2) ok('GRAMMAR_TAG_VERSION === 2');
else bad('GRAMMAR_TAG_VERSION !== 2', GRAMMAR_TAG_VERSION);

/* ---- a minimal VALID lesson fixture ---- */
const validLesson = {
  schemaVersion: 1,
  id: 'a1-01-hola-me-llamo',
  ordinal: 1,
  level: 'A1',
  title: 'Greetings & introducing yourself',
  objective: 'You can greet someone and write a simple introduction.',
  grammarFocus: ['verb.ser'],
  prerequisites: [],
  explanation: {
    id: 'a1-01.e.01',
    kind: 'explanation',
    markdown: 'Use **ser** to say who you are and where you are from.',
    grammarTags: ['verb.ser'],
  },
  vocab: Array.from({ length: 8 }, (_, i) => ({
    id: `a1-01.v.w${i}`,
    kind: 'vocab',
    es: `palabra${i}`,
    en: `word${i}`,
    pos: 'noun',
    exampleEs: `Es la palabra${i}.`,
    exampleEn: `It is word${i}.`,
  })),
  sentences: Array.from({ length: 12 }, (_, i) => ({
    id: `a1-01.s.${String(i + 1).padStart(2, '0')}`,
    kind: 'sentence',
    es: 'Soy de México.',
    en: "I'm from Mexico.",
    // acceptedEs/acceptedEn omitted → default []
    grammarTags: ['verb.ser'],
    vocabRefs: ['a1-01.v.w0'],
    difficulty: 2,
    hints: ['Start with the verb.', "Use 'ser'.", 'Soy de ___.'],
    ...(i === 0 ? { flashcard: { eligible: true, front: 'es' } } : {}),
  })),
  passage: {
    id: 'a1-01.p.01',
    kind: 'passage',
    title: 'A self-introduction',
    segments: [
      { id: 'a1-01.p.01.01', es: 'Hola, me llamo Ana.', en: ["Hi, my name's Ana."], vocabRefs: ['a1-01.v.w0'] },
    ],
  },
  conversation: {
    id: 'a1-01.c.01',
    kind: 'conversation',
    scenario: 'Meeting someone new.',
    personaPrompt: 'Camila introduces herself in short present-tense sentences.',
    openingLine: 'Hola, me llamo Camila.',
    openingLineGloss: "Hi, my name's Camila.",
    goalPhrases: ['me llamo…', 'soy de…'],
    vocabRefs: ['a1-01.v.w0'],
  },
  // one quick-check exercising the new item kind + provenance
  quickChecks: [
    {
      id: 'a1-01.q.01',
      kind: 'multipleChoice',
      prompt: 'Which verb says where you are from?',
      choices: ['ser', 'estar', 'tener'],
      correctIndex: 0,
      explanation: 'Origin uses ser.',
      grammarTags: ['verb.ser'],
      difficulty: 1,
      provenance: { source: 'original', license: 'original' },
    },
  ],
  contentVersion: 1,
};

const parsed = Lesson.safeParse(validLesson);
if (parsed.success) {
  ok('valid lesson fixture parses');
  if (parsed.data.sentences[0].deprecated === false) ok('deprecated defaults to false');
  else bad('deprecated does not default to false');
}
else bad('valid lesson fixture rejected', parsed.error.issues);

// defaults applied?
if (parsed.success && parsed.data.sentences[0].acceptedEs.length === 0)
  ok('acceptedEs defaults to []');
else if (parsed.success) bad('acceptedEs default missing');

// P-004: tolerant union — object form with region still parses
const withRegion = {
  ...validLesson,
  sentences: validLesson.sentences.map((s, i) =>
    i === 0
      ? { ...s, acceptedEs: ['Soy de México.', { text: 'Yo soy de México.', region: 'MX' }] }
      : s,
  ),
};
const regionParsed = Lesson.safeParse(withRegion);
if (regionParsed.success) ok('P-004 AcceptedEntry object+region parses');
else bad('P-004 AcceptedEntry rejected', regionParsed.error?.issues);

/* ---- INVALID fixtures must be rejected ---- */

// (a) too few vocab (7 < min 8)
const tooFewVocab = { ...validLesson, vocab: validLesson.vocab.slice(0, 7) };
if (!Lesson.safeParse(tooFewVocab).success) ok('rejects <8 vocab');
else bad('accepted <8 vocab (should reject)');

// (b) unknown grammar tag
const badTag = {
  ...validLesson,
  grammarFocus: ['verb.does-not-exist'],
};
if (!Lesson.safeParse(badTag).success) ok('rejects unknown GrammarTag');
else bad('accepted unknown GrammarTag (should reject)');

// (c) sentence with 2 hints instead of 3
const badHints = {
  ...validLesson,
  sentences: validLesson.sentences.map((s, i) =>
    i === 0 ? { ...s, hints: ['only', 'two'] } : s,
  ),
};
if (!Lesson.safeParse(badHints).success) ok('rejects sentence without exactly 3 hints');
else bad('accepted !=3 hints (should reject)');

// (d) MCQ with correctIndex out of range (refine)
const badMc = MultipleChoiceItem.safeParse({
  id: 'x.q.01',
  kind: 'multipleChoice',
  prompt: 'p',
  choices: ['a', 'b', 'c'],
  correctIndex: 5,
  explanation: 'e',
  difficulty: 1,
});
if (!badMc.success) ok('rejects MCQ correctIndex out of range (refine)');
else bad('accepted out-of-range correctIndex (should reject)');

// (e) too many quickChecks (7 > max 6)
const tooManyQc = {
  ...validLesson,
  quickChecks: Array.from({ length: 7 }, () => validLesson.quickChecks[0]),
};
if (!Lesson.safeParse(tooManyQc).success) ok('rejects >6 quickChecks');
else bad('accepted >6 quickChecks (should reject)');

console.log(
  failures === 0
    ? `\nSMOKE OK — all checks passed (${total} grammar tags).`
    : `\nSMOKE FAILED — ${failures} check(s) failed.`,
);
process.exit(failures === 0 ? 0 : 1);
