/**
 * AIdioma — Lesson Schema (single source of truth)
 * ------------------------------------------------------------------
 * @version      schemaVersion 1
 * @grammarTags  GRAMMAR_TAG_VERSION 2  (see GrammarTag below)
 * @date         2026-07-21
 * @status       v1-FROZEN; P-001…P-006 APPROVED — see Docs/Registers/schema-proposals.md
 *
 * This Zod schema is the shared contract between lesson CONTENT (what a lesson
 * teaches) and the APP (evaluation + persistence + SessionEngine). It is the
 * canonical form of the consensus §1.1 sketch, with the P-001 deltas applied
 * (multipleChoice, sentence flashcard view, provenance, and — found via
 * golden-lesson authoring — ConversationSeed.openingLineGloss). Rationale for
 * historical delta notes live in Docs/Archive/Content/lesson-schema-proposal-notes.md.
 * Changes are additive-only after v1 freeze.
 *
 * Contract discipline (consensus §1.1 / §1.4):
 *  - `schemaVersion` is frozen at 1; changes are ADDITIVE-ONLY after freeze.
 *  - Item and lesson `id`s are IMMUTABLE forever; edits bump `contentVersion`.
 *  - The one `GrammarTag` enum is ALSO the `ErrorTag` of the evaluation contract
 *    (evaluation.ts). One taxonomy powers lesson tagging AND weakness tracking.
 *  - Some constraints are intentionally CI checks, NOT Zod checks, and are
 *    labelled `CI:` inline (e.g. the ≤150-word explanation budget, vocabRef
 *    resolution, globally-unique IDs, ordinal uniqueness, acyclic prerequisites).
 *
 * DB mapping (consensus §1.4): every item schema below is one `kind` in the
 * single `lesson_items` table (payload jsonb, discriminated by `kind`). The
 * `LessonItem` discriminated union at the bottom mirrors that table 1:1.
 */

import { z } from 'zod';

/* ==================================================================
 * 1. GrammarTag — the one shared taxonomy (= ErrorTag)
 * ------------------------------------------------------------------
 * Closed, versioned, additive-only after freeze. Dotted lowercase,
 * hierarchical, singular nouns; verbs under `verb.*` (irregulars key on
 * lemma, regulars on class). Casing per CURRICULUM-MAP §7: dotted.lowercase.
 *
 * A1 (30) = the map §7 appendix verbatim (24 core + 6 buffer), FROZEN.
 * A2 (16) + B1 (7) = DRAFT tags derived from the map's §3 A2 outline and §4
 * B1 sketch, same naming scheme — provisional until those levels are authored.
 * Total: 53 (inside the map's 45–58 / "~under 60 for A1–B1" target).
 * ================================================================== */

export const GRAMMAR_TAG_VERSION = 2 as const;

export const GRAMMAR_TAGS = [
  // ---- A1 core (24) — CURRICULUM-MAP §7 tags 1–24, verbatim, FROZEN ----
  'verb.ser',                 // A1 core — identity/origin/description
  'verb.estar',               // A1 core — location + state
  'verb.ser-estar.contrast',  // A1 core — the signature A1 failure mode (kept split)
  'verb.regular.ar',          // A1 core — kept split from er-ir (different endings)
  'verb.regular.er-ir',       // A1 core — er+ir merged (differ only in nosotros)
  'verb.reflexive',           // A1 core — regular reflexive present
  'verb.tener',               // A1 core
  'verb.ir',                  // A1 core
  'verb.hay',                 // A1 core — existential hay
  'verb.gustar-type',         // A1 core — gustar + doler (same backwards pattern)
  'verb.stemchange',          // A1 core — e-ie/o-ue/e-i merged (A2 preview)
  'periphrasis.ir-a-inf',     // A1 core — near future
  'periphrasis.modal-inf',    // A1 core — querer/poder/tener-que + inf merged
  'agreement.gender-number',  // A1 core — noun gender/number + adjective agreement
  'article',                  // A1 core — definite + indefinite
  'pronoun.subject',          // A1 core
  'pronoun.io',               // A1 core — indirect-object clitics (gustar/doler)
  'adverb',                   // A1 core — additive (también/tampoco) + frequency
  'expression.place',         // A1 core — place adverbs + prepositions of place
  'number.cardinal',          // A1 core — 0–30 + 31–100 (range is metadata)
  'negation',                 // A1 core
  'question.formation',       // A1 core — wh + yes/no
  'possessive',               // A1 core
  'time.telling',             // A1 core — days = vocab set, not a tag
  'formula.courtesy',         // A1 core — P-003.2: thanks/apology/please/farewell formulae

  // ---- A1 buffer (6) — CURRICULUM-MAP §7 tags 25–30, verbatim, FROZEN ----
  'determiner',               // A1 buffer — demonstratives + quantifiers (L13)
  'weather.impersonal',       // A1 buffer — hace/hay + estar-climate + seasons (L14)
  'comparative',              // A1 buffer — más/menos-que + tan-como + mejor/peor (L16)
  'imperative',               // A1 buffer — affirmative (negative → A2) (L17)
  'pronoun.do',               // A1 buffer — direct-object clitics (L17)
  'preterite.regular',        // A1 buffer — -ar taste (er/ir, irregulars → A2) (L18)

  // ---- A2 (16) — DRAFT, from CURRICULUM-MAP §3 A2 outline ----
  'preterite.irregular',      // A2 — ser/ir/estar/tener/hacer (A2 outline 2)
  'imperfect',                // A2 — regular + irregular, description/habit (A2 outline 3)
  'past.contrast',            // A2 — pretérito vs imperfecto (A2 outline 4)
  'perfect',                  // A2 — pretérito perfecto (he hablado); coverage table → A2
  'periphrasis.estar-gerund', // A2 — estar + gerundio / present continuous (A2 outline 5)
  'periphrasis.aspectual',    // A2 — acabar de / volver a / empezar a (A2 outline 6)
  'future.simple',            // A2 — predictions & intentions (A2 outline 7)
  'pronoun.do-io.combined',   // A2 — se lo/la (A2 outline 8)
  'imperative.negative',      // A2 — negative commands (A2 outline 9)
  'pronoun.placement',        // A2 — clitic placement in commands/periphrasis (A2 outline 9)
  'subjunctive.present',      // A2 — first uses: wishes, querer que (A2 outline 10)
  'superlative',              // A2 — superlative.relative, comparatives extended (A2 outline 11)
  'por-para.contrast',        // A2 — por o para (A2 outline 12)
  'preposition',              // A2 — expanded preposition system (A2 outline 12)
  'relative',                 // A2 — donde/quien relatives (A2 outline 13)
  'connector',                // A2 — expanded coordinating/subordinating connectors (A2 outline 13)

  // ---- B1 (7) — DRAFT, from CURRICULUM-MAP §4 B1 sketch ----
  'subjunctive.adverbial',    // B1 — cuando+subj / para que / aunque clauses
  'subjunctive.imperfect',    // B1 — si tuviera… (imperfect subjunctive)
  'conditional',              // B1 — haría (conditional simple + hypotheticals)
  'pluperfect',               // B1 — había hablado (past consolidation)
  'reported-speech',          // B1 — indirect discourse / consecutio temporum
  'passive.se-impersonal',    // B1 — passive & impersonal se
  'connector.discourse',      // B1 — sin embargo / aunque / por lo tanto (paragraph-level)
] as const;

export const GrammarTag = z.enum(GRAMMAR_TAGS);
export type GrammarTag = z.infer<typeof GrammarTag>;

/* ==================================================================
 * 2. Provenance (P-001 delta) — optional on EVERY item type.
 * Absent ⇒ fully original content (the default for ALL launch content;
 * see SOURCES.md §5). Present ⇒ item derived from / cross-checked against a
 * named source, so future ingestion (e.g. Tatoeba) needs no schema change and
 * per-item attribution is representable from day one.
 * ================================================================== */

export const Provenance = z.object({
  source: z.string(),                 // e.g. "tatoeba", "original"
  sourceId: z.string().optional(),    // upstream id, when a specific record was used
  license: z.string(),                // SPDX-ish string, e.g. "CC-BY-2.0-FR", "original"
});
export type Provenance = z.infer<typeof Provenance>;

/** Shared item metadata: provenance plus explicit non-destructive retirement (P-006). */
const withProvenance = {
  provenance: Provenance.optional(),
  deprecated: z.boolean().default(false),
};

/**
 * P-004 — accepted-answer entry (tolerant union).
 * Plain string = neutral (accepted everywhere). Object form reserves optional
 * `region` for future dialect variants; launch content stays strings only.
 */
export const AcceptedEntry = z.union([
  z.string(),
  z.object({
    text: z.string(),
    region: z.string().optional(), // e.g. 'AR', 'MX' — ISO-3166-ish; absent ⇒ neutral
  }),
]);
export type AcceptedEntry = z.infer<typeof AcceptedEntry>;

/** Unwrap P-004 tolerant union to the comparable text string. */
export function acceptedText(entry: AcceptedEntry): string {
  return typeof entry === 'string' ? entry : entry.text;
}

/* ==================================================================
 * 3. Item schemas — one per `lesson_items.kind` (consensus §1.4)
 * ================================================================== */

/**
 * VocabItem — the "word/chunk" atom. Also IS the flashcard (both directions,
 * decided §1.2): flashcards never trigger an AI call.
 * - Set-vocab (numbers/days) needs NO new machinery: each member is a normal
 *   VocabItem with a lemma-keyed id (e.g. "a1-05.v.veinte"); "the set" is an
 *   authoring/budget grouping, not a schema construct (Style Guide §9).
 * - Chunks (e.g. "me llamo") use pos:'phrase' + `chunk:true` to signal they are
 *   memorized whole and grant NO underlying grammar (map/Style Guide §2).
 */
export const VocabItem = z.object({
  id: z.string(),                                 // immutable, e.g. "a1-03.v.hablar"
  kind: z.literal('vocab'),
  es: z.string(),
  en: z.string(),
  acceptedEs: z.array(AcceptedEntry).default([]), // P-003.1 + P-004 tolerant union
  acceptedEn: z.array(AcceptedEntry).default([]), // P-003.1 + P-004 tolerant union
  pos: z.enum(['noun', 'verb', 'adj', 'adv', 'phrase', 'other']), // 'phrase' covers chunks
  gender: z.enum(['m', 'f']).optional(),
  chunk: z.boolean().optional(),                  // true ⇒ fixed chunk; grants no grammar
  setId: z.string().optional(),                   // P-003.3: grouping key for closed sets (numbers/days); not an item id
  exampleEs: z.string(),
  exampleEn: z.string(),
  audioUrl: z.string().optional(),                // reserved now, populated post-MVP (TTS)
  ...withProvenance,
});
export type VocabItem = z.infer<typeof VocabItem>;

/** ExplanationItem — the "teach" atom (consensus §4 ADD-1). One per lesson. */
export const ExplanationItem = z.object({
  id: z.string(),
  kind: z.literal('explanation'),
  markdown: z.string(),                           // CI: ≤150 words (Style Guide §2) — NOT a Zod check
  grammarTags: z.array(GrammarTag),
  ...withProvenance,
});
export type ExplanationItem = z.infer<typeof ExplanationItem>;

/**
 * Flashcard view over a SentenceItem (P-001 delta). NOT a new item kind —
 * sentence cards are a VIEW over existing SentenceItems (reuse es/en, never
 * trigger AI). Minimal: `eligible` blesses a sentence as card-worthy; optional
 * `front` pins a default display side (else both directions, like vocab).
 */
export const SentenceFlashcard = z.object({
  eligible: z.boolean(),
  front: z.enum(['es', 'en']).optional(),
});
export type SentenceFlashcard = z.infer<typeof SentenceFlashcard>;

/** SentenceItem — the typed-translation atom; alternates feed the cost gate. */
export const SentenceItem = z.object({
  id: z.string(),
  kind: z.literal('sentence'),
  es: z.string(),
  en: z.string(),
  acceptedEs: z.array(AcceptedEntry).default([]), // alternates; P-004 may tag region
  acceptedEn: z.array(AcceptedEntry).default([]),
  grammarTags: z.array(GrammarTag).min(1),
  vocabRefs: z.array(z.string()),                 // CI: must resolve to VocabItem ids
  difficulty: z.number().int().min(1).max(5),
  hints: z.array(z.string()).length(3),           // exactly 3 (existing 3-level hint UX)
  flashcard: SentenceFlashcard.optional(),        // P-001 delta: sentence-card view
  ...withProvenance,
});
export type SentenceItem = z.infer<typeof SentenceItem>;

/** PassageItem — sentence-ALIGNED reading; each segment independently evaluable. */
export const PassageSegment = z.object({
  id: z.string(),                                 // P-002: immutable segment id, e.g. "a1-01.p.01.02"
  es: z.string(),
  en: z.array(z.string()).min(1),
  vocabRefs: z.array(z.string()),
  ...withProvenance,                              // provenance also allowed per-segment
});
export type PassageSegment = z.infer<typeof PassageSegment>;

export const PassageItem = z.object({
  id: z.string(),
  kind: z.literal('passage'),
  title: z.string(),
  segments: z.array(PassageSegment),
  ...withProvenance,
});
export type PassageItem = z.infer<typeof PassageItem>;

/** ConversationSeed — authored now, page built post-MVP (wave 3). */
export const ConversationSeed = z.object({
  id: z.string(),
  kind: z.literal('conversation'),
  scenario: z.string(),
  personaPrompt: z.string(),
  openingLine: z.string(),                         // Spanish only (keeps es-text vocab-leak scan clean)
  openingLineGloss: z.string().optional(),         // EN gloss of openingLine (Style Guide §7); see SCHEMA-NOTES delta 8
  goalPhrases: z.array(z.string()),
  vocabRefs: z.array(z.string()),
  ...withProvenance,
});
export type ConversationSeed = z.infer<typeof ConversationSeed>;

/**
 * MultipleChoiceItem — NEW kind (P-001 delta; Mike floated, Coordinator to rule).
 * A comprehension / quick-check item that works for BOTH:
 *  - reading comprehension (prompt references a passage via `passageRef`; grammarTags
 *    may be empty — a pure meaning check), and
 *  - grammar quick-checks (prompt stands alone; grammarTags ≥1 for weakness tracking).
 * Never triggers the AI evaluator: it is graded by index equality (like a flashcard),
 * so it can carry a lesson without touching the /api/evaluate cost gate.
 */
export const MultipleChoiceItem = z
  .object({
    id: z.string(),
    kind: z.literal('multipleChoice'),
    prompt: z.string(),                           // stands alone OR frames a passage question
    passageRef: z.string().optional(),            // CI: if set, resolves to a passage/segment id
    choices: z.array(z.string()).min(3).max(4),   // 3–4 options
    correctIndex: z.number().int().min(0).max(3), // index into choices
    explanation: z.string(),                      // why the correct answer is correct
    grammarTags: z.array(GrammarTag).default([]), // [] ok for pure comprehension; ≥1 for grammar checks
    vocabRefs: z.array(z.string()).default([]),
    difficulty: z.number().int().min(1).max(5),
    ...withProvenance,
  })
  .refine((mc) => mc.correctIndex < mc.choices.length, {
    message: 'correctIndex must point at an existing choice',
    path: ['correctIndex'],
  });
export type MultipleChoiceItem = z.infer<typeof MultipleChoiceItem>;

/**
 * ReferenceCard — P-005: on-demand study material (conjugation tables, topic
 * essentials). Never graded / never hits /api/evaluate. Distinct from the one
 * ≤150-word ExplanationItem (always-shown teach atom).
 */
export const ReferenceCard = z.object({
  id: z.string(),
  kind: z.literal('referenceCard'),
  title: z.string(),
  markdown: z.string(),                           // no word-cap (unlike explanation)
  grammarTags: z.array(GrammarTag).default([]),
  vocabRefs: z.array(z.string()).default([]),     // CI: resolve if present
  ...withProvenance,
});
export type ReferenceCard = z.infer<typeof ReferenceCard>;

/**
 * LessonItem — discriminated union mirroring the single `lesson_items` table
 * (consensus §1.4, discriminated by `kind`). App-facing convenience export;
 * does not change lesson anatomy. NOTE: MultipleChoiceItem carries a `.refine`,
 * so it is spread as its inner object into the union (discriminatedUnion needs
 * plain object members); the refine still runs when a MultipleChoiceItem is
 * parsed directly, and item-level parsing in CI uses the concrete schemas.
 */
export const LessonItem = z.discriminatedUnion('kind', [
  VocabItem,
  ExplanationItem,
  SentenceItem,
  PassageItem,
  ConversationSeed,
  MultipleChoiceItem.innerType(),
  ReferenceCard,
]);
export type LessonItem = z.infer<typeof LessonItem>;

export const ITEM_KINDS = [
  'vocab',
  'explanation',
  'sentence',
  'passage',
  'conversation',
  'multipleChoice',
  'referenceCard',
] as const;
export const ItemKind = z.enum(ITEM_KINDS);
export type ItemKind = z.infer<typeof ItemKind>;

/* ==================================================================
 * 4. Lesson — the top-level contract
 * ================================================================== */

export const Lesson = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),                                 // immutable slug, e.g. "a1-05-ser-y-estar"
  ordinal: z.number().int(),                      // CI: globally unique linear sequence
  level: z.enum(['A1', 'A2', 'B1', 'B2']),        // CEFR
  title: z.string(),
  objective: z.string(),
  grammarFocus: z.array(GrammarTag),
  prerequisites: z.array(z.string()).default([]), // CI: acyclic; MVP = previous lesson only
  explanation: ExplanationItem,
  vocab: z.array(VocabItem).min(8).max(15),
  sentences: z.array(SentenceItem).min(12).max(20),
  passage: PassageItem,
  conversation: ConversationSeed,
  quickChecks: z.array(MultipleChoiceItem).max(6).default([]), // P-001 delta: OPTIONAL (0–6)
  referenceCards: z.array(ReferenceCard).max(12).default([]), // P-005: OPTIONAL study cards
  contentVersion: z.number(),                     // bump on edit; evaluations record it
});
export type Lesson = z.infer<typeof Lesson>;

/**
 * CI-ONLY invariants (enforced by the content validator, NOT by Zod — listed
 * here so the contract is documented in one place; consensus §1.1 / §1.4):
 *  - explanation.markdown ≤150 words (Style Guide §2).
 *  - Every `vocabRefs` / `passageRef` resolves to a real item id.
 *  - Every VocabItem is exercised by ≥1 sentence (set-vocab: the SET is
 *    represented, not every member — Style Guide §9).
 *  - Globally unique ids; unique ordinals; acyclic prerequisites.
 *  - Immutable-id snapshot check: no id ever removed (deprecate, never delete).
 *  - Cumulative-vocab discipline: every content word traces to this/prior lessons.
 */
