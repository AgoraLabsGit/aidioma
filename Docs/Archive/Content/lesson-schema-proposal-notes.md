# SCHEMA-NOTES — rationale for P-001 (lesson schema v1)

**Author:** Content-track schema agent · **Date:** 2026-07-21 · **Status:** P-001…P-005 approved; schema v1-FROZEN, additive-only
**Artifact:** `schema/lesson-schema.ts` (Zod, single source of truth). Current rulings live in `SCHEMA-APPROVALS.md`; proposal-time evidence below is retained as history.

This document is written for the App Design Coordinator. It records **every delta** from the consensus §1.1 sketch, why each was made, and its impact on the app (DB mapping via `lesson_items.kind`, the evaluation contract, and SessionEngine recipes). It ends with what was deliberately **not** changed.

The schema keeps the consensus sketch's shape and every constraint verbatim: `schemaVersion` literal `1`; immutable `id`s; `ordinal`; `level` A1–B2; explanation (≤150 words enforced in **CI**, not Zod — see note); `vocab` 8–15; `sentences` 12–20; exactly 3 `hints`; `acceptedEs`/`acceptedEn` defaulting to `[]`; `difficulty` 1–5 int; `grammarTags.min(1)` on sentences; `vocabRefs`; sentence-aligned passage; conversation seed; `contentVersion`; `prerequisites`; reserved `audioUrl`.

---

## P-002 (APPROVED 2026-07-21) — Passage segments get immutable `id`s

**Status:** approved and backfilled corpus-wide. Raised by the cross-contract audit `review/audits/AUDIT-CONTRACTS-2026-07-21.md` (finding **F1, CRITICAL**); retained below as the proposal rationale.

**What changed.** Added a required `id: z.string()` to `PassageSegment` (previously `{ es, en[], vocabRefs, provenance? }` — the only authored, evaluable atom with no id). Segment ids follow the Style Guide §9 convention already reserved for them: `{passage-id}.{NN}`, e.g. `a1-01.p.01.02`. The golden lesson's 4 segments now carry `a1-01.p.01.01 … a1-01.p.01.04`.

**Why (from the audit).** Consensus §1.2 says each passage segment is "independently evaluable via the same pipeline," and every scoring submission is one `EvaluationRequest` with `itemRef = "lessonId:itemId"`. A segment with no id **cannot form an itemRef**, so reading evaluations and `user_item_stats` rows could not be keyed to a segment. Worse, the golden lesson's `q.03.passageRef` pointed at `a1-01.p.01.02` — a **positional index that was not a real id anywhere**, so the CI rule "passageRef resolves to a real item id" could not hold, and segments sat entirely **outside** the immutable-id / "deprecate never delete" / snapshot regime. Positional refs also silently retarget if a segment is inserted/removed. Adding ids now (before 11 more passages bake in the defect) makes it a one-lesson fix instead of a content migration + reading-stats re-key later.

**App impact.**
- *ID/ref coherence:* segments become first-class addressable items. `passageRef` and reading-eval `itemRef` now resolve to a real segment id — **itemRef semantics are uniform** across sentences, quick-checks, and segments.
- *DB mapping (§1.4):* segments still live inside the `passage` row's `payload jsonb` (no new table); the segment `id` is what a reading `evaluations.itemId` / `user_item_stats.itemId` references. If the app later promotes hot reading queries, segment ids give row-level addressability without a migration.
- *Lifecycle:* segments now fall under the immutable-id + snapshot guarantees like every other id (the validator now records them — see below).
- *Evaluation contract:* unchanged shape; segments simply gain a valid `itemId` to slot into the existing `itemRef`.

**Validator change (minimal, noted).** `tools/validate.ts` previously *reconstructed* segment targets positionally (`{passage.id}.{idx+1 padded}`) in four places (passageRef targets, segment vocabRef check, segment es-scan, and it did **not** include segments in the id/snapshot set at all). Changed those to use the real `seg.id`: segment ids now (a) are valid `passageRef` targets, (b) enter the globally-unique-id check, and (c) enter the immutable-id snapshot. No threshold or rule logic changed — only the source of the segment identifier (position → authored id). *(The concurrent tooling audit ran against the pre-change validator; this change is understood to post-date it.)*

**Not part of P-002 — a separate tooling work item.** The audit's **F5** recommends a CI guard binding the item-id prefix ↔ lesson slug ↔ ordinal (to prevent two slugs sharing a prefix and colliding item ids). That is a **validator/CI rule, not a schema change**, and is being handled separately after the tooling audit lands — explicitly **out of scope** for P-002. (The audit's other findings — F2/F3 DB columns, F4 deprecation path, F6 error-taxonomy tags, F7 answer-leak serving — are app-track or a later P-batch, untouched here.)

---

## Delta 1 — GrammarTag enum v1 (53 tags: 30 A1 frozen + 16 A2 + 7 B1 draft)

**What changed.** The sketch shipped a 7-value illustrative enum. v1 is the full closed taxonomy: the **30 A1 tags from CURRICULUM-MAP §7 verbatim** (24 core + 6 buffer, no renaming), plus **16 draft A2 tags** derived from the map's §3 A2 outline and **7 draft B1 tags** from the §4 B1 sketch, all in the map's naming scheme (dotted lowercase, hierarchical, `verb.*` for verbs). Level provenance is marked in inline comments (`// A1 core`, `// A1 buffer`, `// A2`, `// B1`). A `GRAMMAR_TAG_VERSION = 1` constant is exported; `GRAMMAR_TAGS` is exported as a `readonly` array so tooling/CI can iterate and count.

**Final count by level:** A1 = **30** (frozen), A2 = **16** (draft), B1 = **7** (draft) → **53 total**, inside the map's 45–58 / "under ~60 for A1–B1" target.

**Coarsening rationale (inherited from the map).** The enum serves weakness-tracking + lesson tagging, **not** linguistic completeness, so points that are not distinct failure modes share one tag (map §7 fix 11: ~53–58 pre-coarsening → 30 A1). Kept split where the failure mode differs: `verb.regular.ar` vs `verb.regular.er-ir`; `verb.ser-estar.contrast`; `pronoun.subject`/`io`/`do`. The A2/B1 drafts follow the same instinct — e.g. `imperfect` is one tag (regular + irregular), `periphrasis.aspectual` merges acabar-de/volver-a/empezar-a, `superlative` is one tag.

**A2 tags (16), traceable to §3 outline:** `preterite.irregular`, `imperfect`, `past.contrast`, `perfect`, `periphrasis.estar-gerund`, `periphrasis.aspectual`, `future.simple`, `pronoun.do-io.combined`, `imperative.negative`, `pronoun.placement`, `subjunctive.present`, `superlative`, `por-para.contrast`, `preposition`, `relative`, `connector`. (`perfect` is included because the map coverage table assigns pretérito perfecto to A2 even though the §3 outline lists it only implicitly.)

**B1 tags (7), from §4 sketch:** `subjunctive.adverbial`, `subjunctive.imperfect`, `conditional`, `pluperfect`, `reported-speech`, `passive.se-impersonal`, `connector.discourse`.

**Why these are DRAFT.** A1 is authored and frozen; A2/B1 lessons are not yet written, and SOURCES.md flags the A1/A2 grammar line and A2 outline as only medium confidence (open-verification items 2, 5). Drafting them **now** means: (a) the shared enum is stable enough that the app's `errorTags` column and Progress-by-grammar-point view never need a migration when A2 ships, and (b) A2/B1 are additive-only refinements after freeze, not new taxonomy. The Coordinator should approve the **A1 block as frozen** and the **A2/B1 block as provisional** (revisable additively when those levels are authored) — that is the intended freeze boundary.

**Impact on the app.** This enum **is** `ErrorTag` in `evaluation.ts` (consensus §1.1: one taxonomy). `EvaluationResult.errorTags: GrammarTag[]`, `lesson_items.grammarTags jsonb`, `user_item_stats.missedTags jsonb`, and the blender's tag-boost term all key on these exact strings. The tag-boost term is simply zero until data accumulates (consensus §1.3), so the larger enum costs the app nothing on day 1. **Action for the app:** import `GrammarTag`/`GRAMMAR_TAGS` from this file rather than redeclaring — a second copy is the exact dual-taxonomy failure the panel killed.

---

## Delta 2 — NEW item kind `multipleChoice` (optional per lesson)

**What changed.** Added a sixth item kind, `MultipleChoiceItem`: `{ id, kind:'multipleChoice', prompt, passageRef?, choices (3–4), correctIndex, explanation, grammarTags (default []), vocabRefs (default []), difficulty (1–5), provenance? }`. A `.refine` guarantees `correctIndex < choices.length`. Lessons gain **one optional field** — `quickChecks: z.array(MultipleChoiceItem).max(6).default([])` — so a lesson with no quick-checks is byte-for-byte the same shape as the consensus sketch. Existing lesson anatomy (explanation/vocab/sentences/passage/conversation) is untouched.

**Design — works for both use cases.**
- *Reading comprehension:* `passageRef` points at a passage (or segment) id; the `prompt` asks about its meaning; `grammarTags` may be empty (a pure meaning check). This gives Reading (fast-follow W7–8) a non-translation check without new machinery.
- *Grammar quick-check:* `prompt` stands alone ("Which verb says where you're from?"); `grammarTags` carries ≥1 tag so a wrong answer feeds weakness-tracking exactly like a missed sentence.

**Why optional.** Two reasons. (1) It is a **net-new authoring surface** not costed into the 6-week MVP (which ships typed translation + flashcards only). Making it optional lets the Coordinator approve the *shape* now so content authors can add quick-checks opportunistically, without making them mandatory work for the 12 launch lessons. (2) It keeps the launch lesson contract identical to what's already being authored — zero rework if the answer is "not yet."

**Why index-graded, not AI-graded.** `correctIndex` equality is a deterministic client/DB check — an MCQ **never** hits `/api/evaluate`, so it adds zero AI cost and preserves the comparison-first gate. This mirrors how flashcards are handled (§1.2: "flashcards never trigger an AI call").

**Impact on the app.**
- *DB mapping (§1.4):* a new `kind = 'multipleChoice'` in the single `lesson_items` table; `payload jsonb` holds prompt/choices/correctIndex/explanation; `grammarTags jsonb` and `difficulty` populate the existing columns. **No new table.** `correctIndex` should not be shipped to the client before answer (grade server-side or omit from the payload sent pre-answer) — a UI/serving concern, not a schema one.
- *Evaluation contract:* MCQ results persist as `evaluations` rows with modality `multipleChoice` (`itemRef = lessonId:itemId`, `errorTags` = the item's tags on a wrong answer, `evalSource = 'comparison'`). They remain index-graded and never call AI. App-track resolution: `Docs/Specs/Areas/data-model.md` (2026-07-28).
- *SessionEngine recipes:* quick-checks are just another item pool. A recipe could interleave them into a lesson session or run a "quick-check" recipe; the weakness/staleness weighting applies unchanged because MCQs carry `grammarTags` + `difficulty`.

**Coordinator ruling requested:** approve the `multipleChoice` kind + optional `quickChecks` as-is; or defer the kind entirely (drop from v1); or approve the shape but mark it "reserved, not authored at launch."

---

## Delta 3 — Flashcard mode: a VIEW over SentenceItem, not a new item kind

**What changed.** Word cards are unchanged: `VocabItem` **is** the card, both directions (already decided, §1.2). For **sentence** cards, added one optional field to `SentenceItem`: `flashcard?: { eligible: boolean, front?: 'es'|'en' }`. No new item kind, no duplicated content.

**Design (minimal).** `eligible` is the author's opt-in: it marks a sentence as short/memorable enough to work as a card (not every 12–20 sentence should be). `front` optionally pins a default display side; absent means "both directions," matching vocab-card behavior. That's the whole addition — two fields, both optional.

**Why a view, not a kind.** A sentence card shows the **same** `es`/`en` a `SentenceItem` already holds; a new `flashcardSentence` kind would duplicate that content under a second id, and any edit would have to be mirrored (an immutable-id nightmare, and a vocab-leakage re-check surface). A view over the existing item keeps one source of truth per sentence, keeps the id stable, and — because flashcards never call the evaluator (§1.2) — needs nothing beyond a display hint. This is the smallest change that unlocks sentence-card scheduling.

**Impact on the app.**
- *DB mapping:* rides inside the existing `sentence` payload jsonb — **no schema/table change.** The flashcard renderer filters `sentences[]` where `flashcard?.eligible`.
- *Evaluation contract:* none — sentence flashcards, like all flashcards, are self-graded and never produce an `evaluations` row via the AI path.
- *SessionEngine recipes:* a flashcard recipe pools eligible vocab + eligible sentences; `front` feeds the ES→EN / EN→ES direction the card renders. Card directions are still "scheduled separately" per §1.2; `front` only sets the default, it doesn't replace direction scheduling.

**Coordinator ruling requested:** approve the `flashcard` view field; or defer sentence-cards to post-MVP (drop the field — vocab-only flashcards still ship).

---

## Delta 4 — Optional `provenance` on every item type

**What changed.** Added `Provenance = { source: string, sourceId?: string, license: string }`, spread as an **optional** field into every item schema (vocab, explanation, sentence, passage + per-segment, conversation, multipleChoice). Absent ⇒ fully original — the default for **all** launch content (SOURCES.md §5: 12 A1 lessons stay 100% LLM-original).

**Why now.** This is a pre-decided content-track requirement (SESSION-LOG, SOURCES.md §5, decision 2): Tatoeba is an approved QA **reserve** for alternates-mining, and any verbatim-derived sentence must carry provenance + attribution. Adding the field to v1 means future ingestion (Tatoeba at A2+ scale, corpus enrichment) needs **no schema change** and per-item attribution is representable from day one. It costs launch content nothing (the field is simply absent).

**Impact on the app.** Purely additive metadata. DB: fold into the item's `payload jsonb` (no column needed) or lift to an optional `provenance jsonb` column on `lesson_items` if you want to query attribution — an app choice. No effect on the evaluation contract or SessionEngine; it is display/legal metadata (an attribution footer, license hygiene in `tools/`).

---

## Delta 5 — Chunk-vocab support (minimal)

**What changed.** Added one optional boolean to `VocabItem`: `chunk?: boolean`. Combined with the existing `pos: 'phrase'`, it covers the map's sanctioned fixed chunks (`me llamo`/`te llamas`/`se llama`, `tengo … años`, `me gusta`).

**Why.** The map/Style Guide §2 define chunks as expressions taught **whole**, granting **no** underlying grammar for vocab-leakage purposes. `pos:'phrase'` places them lexically; `chunk:true` is the explicit signal that CI's cumulative-vocab checker must treat the item as granting no grammar (so a chunk of `llamarse` doesn't "unlock" reflexives before L10). Minimal: one optional flag, no new item kind.

**Impact on the app.** None at runtime — it's a content/CI marker. A chunk card behaves as a normal vocab card.

---

## Delta 6 — `LessonItem` discriminated union + `ItemKind` enum (app convenience export)

**What changed.** Exported `LessonItem = z.discriminatedUnion('kind', [...all six item schemas])` and an `ItemKind`/`ITEM_KINDS` enum. Not in the sketch; added because consensus §1.4 mandates one `lesson_items` table discriminated by `kind`, and the app needs a type that mirrors it exactly for reading rows back.

**Note for the Coordinator.** `MultipleChoiceItem` carries a `.refine`, which `z.discriminatedUnion` can't take directly, so the union spreads its `.innerType()` (the plain object). The refine still runs whenever a `MultipleChoiceItem` is parsed via its own schema — which is what the content validator in `tools/` does item-by-item. Parsing a full `Lesson` also validates every quick-check through the refined `MultipleChoiceItem` (the lesson uses the refined schema in `quickChecks`). So the only path that skips the refine is parsing a raw row *as `LessonItem`* — acceptable, since rows are written from already-validated lessons.

**Impact on the app.** Gives the persistence layer a single typed union for `lesson_items` reads; no effect on content authoring.

---

## Delta 7 — CI-vs-Zod boundary documented in-file

**What changed.** Constraints that cannot (or should not) be Zod checks are labelled `CI:` inline and collected in a closing comment block: the **≤150-word explanation budget**, `vocabRefs`/`passageRef` resolution, "every vocab exercised by ≥1 sentence" (set-vocab: the *set* represented, not each member), globally-unique ids, unique ordinals, acyclic prerequisites, the immutable-id snapshot check, and cumulative-vocab discipline.

**Why.** These are cross-item / cross-lesson invariants (Zod validates one object in isolation) or fuzzy (word-count). Documenting the boundary in the schema file keeps the contract in one place and tells the validator author in `tools/` exactly what Zod does **not** cover. No app impact — it's a note to the content toolchain.

---

## Delta 8 — `ConversationSeed.openingLineGloss` (found via golden-lesson authoring)

**What changed.** Added one optional field to `ConversationSeed`: `openingLineGloss: z.string().optional()` — the EN gloss of `openingLine`. `openingLine` stays Spanish-only.

**Why (surfaced by real authoring, not design).** Style Guide §7 mandates an EN gloss on the persona's opening line, but the golden lesson (`a1-01`) showed that embedding the English inside `openingLine` (e.g. `"Hola… ('Hi…')"`) trips the content validator's **vocab-leak scan of Spanish-text fields** — the scanner reads `openingLine` as es-text and flags the English words as untraceable vocab. Splitting the gloss into its own field keeps `openingLine` a clean es-string the scanner can check honestly, and gives the gloss a first-class home. This is the same principle already used for sentences (separate `es`/`en`) and passage segments — the conversation seed was the one authored es-field that lacked its paired gloss field.

**Impact on the app.** Purely additive and optional. DB: rides in the `conversation` payload jsonb — no column/table change. Evaluation contract: none (conversation turns are wave-3; the opener is display/prompt text). SessionEngine: the conversation renderer shows `openingLineGloss` under the Spanish opener, exactly as sentence glosses render. Existing seeds without the field are unaffected.

**Version note.** No schema-version bump — `schemaVersion` remains literal `1`; this additive optional field was approved inside P-001.

---

## What I deliberately did NOT change

- **No new set-vocab machinery.** Confirmed the Style Guide §9 convention needs none: each number/day is a normal `VocabItem` with a lemma-keyed id (`a1-05.v.veinte`); "the set" is an authoring/budget grouping, not a schema construct. No composite id, no `set` field. (The "set represented by ≥1 sentence" rule is a CI check, noted above.)
- **`pos` enum unchanged** (`noun|verb|adj|adv|phrase|other`) — matches the sketch verbatim. Numbers/days map to `other`/`noun`; adding a `number` pos would be scope creep the map doesn't ask for.
- **No direction field on items.** The sketch keeps `direction` on the `EvaluationRequest`/`EvaluationResult` (evaluation contract), not the content item — an item is direction-neutral (an author writes es+en once; both directions derive). Kept it that way; this matches the "direction is first-class on every evaluation" decision (§4 ADD-7) without duplicating it onto content.
- **No SRS/scheduling fields on items.** The blender's weakness/staleness weighting is the MVP's SRS (§4 CUT-6); SRS columns are reserved on `user_item_stats` (app side), not on content. Content stays scheduling-free.
- **`vocabRefs`/`grammarFocus`/`prerequisites` typing unchanged** — plain `string[]` / `GrammarTag[]`, resolution left to CI (cross-item, can't be Zod).
- **No lesson-level `modality` or `activities` list.** Which modalities a lesson exposes is a SessionEngine/UI concern (thin shells over `useSession(recipe)`, §1.3), derived from which item arrays are populated — not authored metadata.
- **`schemaVersion` stays literal `1`; all additions are additive/optional**, so approving P-001 does not break the frozen-after-week-1 policy.

---

## Contradictions found between the map and the Style Guide

**None blocking.** One casing note worth recording: the map §7 declares "dotted.lowercase wins" over the research's SCREAMING_SNAKE; the Style Guide never contradicts this. The schema follows the map's dotted lowercase exactly. The Style Guide §9 set-vocab convention and the map's set-vocab budget rule agree (both say: members are the ids, the set is a grouping) — the schema honors both with no new field. No tag naming in the map conflicts with any Style Guide rule.

---

## P-003 (APPROVED 2026-07-28) — batched additive schema candidates

**Status:** approved by the App Design Coordinator on 2026-07-28; all three additive items accepted. Schema and a1-01 courtesy-tag work landed; remaining content/tooling follow-through is OI-025. The proposal rationale below is retained as the approval record.

### P-003.1 — `acceptedEn` (+ optional `acceptedEs`) on VocabItem

**What.** Add to `VocabItem`: `acceptedEn: z.array(z.string()).default([])` and, symmetrically, `acceptedEs: z.array(z.string()).default([])`. Both optional, default `[]`, authored exactly like the sentence-level alternate arrays.

**Why.** Typed-recall flashcard grading is **live in the prototype** (Words mode grades typed input). Vocab `en` glosses are display strings — *"sir / man / Mr."*, *"hello / hi"* — so a learner typing "hi" is graded against the raw gloss and fails. The app adapter currently splits on `/` and strips parentheticals as a stopgap; the schema-clean fix is an explicit accept set the author controls. `acceptedEs` is the mirror for ES-recall / EN→ES vocab cards.

**Semantics (the composition rule — document this exactly).** The **display gloss stays `en`** (unchanged; it is what the card shows). The **grading accept set** is composed by the consumer as:

> `acceptEN = normalize( splitVariants(en) ∪ acceptedEn )` — and symmetrically `acceptES = normalize( splitVariants(es) ∪ acceptedEs )`.

That is: the canonical `en`/`es` **always joins its own accept set** (never duplicated into the array by the author — same rule as sentences' `[es, ...acceptedEs]` gate, and the "canonical joins the accept set" clarification recorded below). `splitVariants` is the adapter's existing " / "-split + parenthetical-strip, so a gloss like *"sir / man / Mr."* yields {sir, man, Mr} even before any `acceptedEn` is authored — `acceptedEn` then adds anything splitting can't derive (e.g. *"you're welcome"* for *"thank you"*-adjacent cards, or spelling variants). Authors keep glosses adapter-friendly (variants separated by " / ", parentheticals only for disambiguation) **and** may add `acceptedEn` for the rest.

**App impact.** DB: both arrays live inside the `vocab` row's `payload jsonb` — **no column, no new table.** SessionEngine: the flashcard/Words renderer builds `acceptEN`/`acceptES` and does a **local string compare** — flashcards never call `/api/evaluate` (consensus §1.2), so there is **no evaluation-contract change** and no AI cost. If vocab recall is ever persisted, its `itemRef` is just the vocab id (already addressable). Net: additive metadata that removes an adapter hack.

**Touched on approval:** `VocabItem` schema (2 optional fields); backfill `acceptedEn` (and `acceptedEs` where ES-recall matters) across **a1-01 / a1-02 / a1-03** vocab, then a QA pass on the accept sets. `contentVersion` bump on the three lessons.

### P-003.2 — `formula.courtesy` GrammarTag (A1 block, additive)

**What.** Add one tag, `formula.courtesy`, to the **frozen A1 block** of the `GrammarTag` enum (additive-only is permitted for the frozen block; A1 stays closed+versioned). On approval, bump `GRAMMAR_TAG_VERSION` `1 → 2` to signal the additive change (the enum content changed even though it is backward-compatible).

**Why.** Golden-lesson QA (`a1-01.qa1`, checklist pt. 8) flagged that bare-vocative courtesy items — *Gracias, señor.* / *Perdón, señora.* / *Por favor, señor.* / *Adiós, señora.* (a1-01 s.09–s.12) — have **no honest tag**: `grammarTags.min(1)` forces a tag, but these fixed social formulae exercise no article+noun or adjective agreement, only a lone gendered noun. They are currently tagged `agreement.gender-number` as the **least-dishonest** option, which risks misattributing a courtesy-formula typo into the agreement weakness bucket (polluting the blender's tag-boost and Progress-by-grammar-point). A dedicated tag lets fixed formulae carry an honest tag. Recurs in every lesson with greetings/politeness routines. (Chose `formula.courtesy` over `expression.greeting` — "courtesy formula" covers thanks/apology/please/farewell, not just greetings, and reads as a fixed-expression class rather than a place/adverb bucket like the existing `expression.place`.)

**App impact.** DB: it is a new **string value** in `grammarTags jsonb` / `errorTags jsonb` — **no structural change.** Evaluation: becomes an emittable `errorTag`; the blender's tag-boost term and Progress-by-grammar-point pick it up automatically (they iterate `GRAMMAR_TAGS`). SessionEngine: no change. **The app imports `GRAMMAR_TAGS` from `lesson-schema.ts`, so it inherits the new tag with no redeclaration** — but any code that pinned `GRAMMAR_TAG_VERSION === 1` should be checked.

**Touched on approval:** enum (+1 tag, version bump); **re-tag a1-01 s.09–s.12** from `agreement.gender-number` → `formula.courtesy` (uniformly across the four), `contentVersion` bump on a1-01. Their hints/QA are unaffected.

### P-003.3 — Set-vocab marker on VocabItem

**What.** Add optional `setId: z.string().optional()` to `VocabItem` — a **grouping key** (e.g. `"numbers-0-30"`, `"days-of-week"`), NOT an item id. Members of a closed set (numbers, days, months) share a `setId`; ordinary vocab omit it.

**Why (and why `setId` not `set: boolean`).** Style Guide §9 makes each set member a normal lemma-keyed `VocabItem`, and the "set counts as one budget item / is satisfied when the set is represented" rule currently lives only as a **caveat in the validator's error message** (VOCAB_EXERCISED, check 5), not as data the check can consume. A boolean `set` flag would only say "this is a set member" — the validator couldn't tell *which* set, so it would either exempt all set members wholesale or lump them. A `setId` lets the check enforce the real rule: **each distinct `setId` must be represented by ≥1 exercised member**, while every non-set vocab still needs its own exercising sentence. This matches Style Guide §9 exactly and removes the "don't invent a composite id" ambiguity — `setId` is explicitly a grouping tag, **not** an item id, so it does not resurrect the banned `numeros-0-30` composite id.

**Validator change (described, NOT implemented in this proposal).** In `tools/validate.ts` check 5 (`VOCAB_EXERCISED`): partition `l.vocab` into `setId`-grouped members vs singletons. For singletons, keep the current "≥1 own-lesson sentence exercises it" rule. For each distinct `setId`, require that **≥1 member** appears in some sentence's `vocabRefs` (the set is "represented"); if none, emit VOCAB_EXERCISED against the set. No other check changes. (This is the coordination point the Coordinator asked for: the field exists to feed exactly this partition.)

**App impact.** DB: `setId` lives in the `vocab` `payload jsonb` — **no column.** SessionEngine/blender: optional — a flashcard scheduler *could* group a set, but nothing requires it; the field is primarily a **CI/validator** signal. Evaluation: none. Budget/authoring accounting stays as Style Guide §9 describes.

**Touched on approval:** `VocabItem` schema (1 optional field) + the check-5 change above (separate tooling task, not this proposal). No **existing** a1-01…03 content requires backfill *yet* — sets first appear at a1-05 (numbers 0–30) and a1-09 (days); adding `setId` there is authoring, not migration. (a1-01…03 have no closed sets, so they are unaffected.)

### P-003 — what I'd add / drop

- **Kept out on purpose (not a schema change):** the "**canonical string always joins the accept set**" clarification (parking-lot item below) is an **app-track adapter/seed-script contract**, not a schema field — it needs documenting, not a Zod change, so it stays out of P-003. It is, however, the composition rule P-003.1 leans on, so it is referenced there.
- **No drops.** All three are additive, prototype- or QA-driven, and cheap. If the Coordinator wants to minimize surface, **P-003.3 (setId) is the most deferrable** — it fixes a CI honesty issue, not a user-facing bug, and no launch content needs it before a1-05. P-003.1 is the only one blocking a live prototype hack; P-003.2 is the only one that dirties weakness-tracking data. Suggested priority: **1 > 2 > 3.**

---

## P-004 (APPROVED 2026-07-28) — Dialect / region dimension (additive, optional scaffolding)

**Status:** approved by the App Design Coordinator on 2026-07-28 as **shape only**. The additive union landed; **nothing changes for the 12 launch lessons** — neutral LatAm / `tú` stays the canonical default. Dialect content/UI is PM-005. The proposal rationale below is retained as the approval record.

**What.** A minimal way for an accepted-answer entry to carry an optional region label, so a future `acceptedEs` can include, e.g., a `vos`-conjugated variant marked as Argentine without changing anything about how launch content grades.

**Why.** Today `acceptedEs`/`acceptedEn` are `string[]` — a flat set with no way to say "this alternate is *only* correct in region X" or "offer this variant to AR users." Retrofitting region onto a flat string array after dialect content exists would be a corpus-wide migration. Reserving the shape now (used by nobody at launch) keeps the door open at zero launch cost — the same discipline as `provenance` (P-001 Delta 4) and the reserved `audioUrl`.

**Design options evaluated.**
- **(a) Per-accepted-entry `region?` tag.** Promote accepted answers from bare strings to an optional richer form that can carry `region?: 'AR' | 'MX' | …` (ISO-3166-ish). A launch entry stays a plain string (neutral, region-absent = accepted everywhere); a future AR entry is `{ text: 'vos tenés…', region: 'AR' }`. Grading composes the accept set filtered by the active region (neutral entries always included).
- **(b) Lesson/item-level `dialect` variant block.** A parallel block on the lesson or item holding whole-variant overrides per region (a region's own `es`/alternates/hints).

**Recommendation: (a), per-entry `region` tag.** It is far more granular and additive: dialect divergence at A1–B2 is overwhelmingly *lexical/morphological at the answer level* (a `vos` conjugation, `carro`→a regional synonym), not whole-lesson rewrites, so tagging individual accepted variants matches the real grain of the change and lets one sentence accept neutral + AR + MX variants side by side. Option (b) duplicates entire items per region — an authoring and immutable-id nightmare (every variant needs its own id, its own QA, and drifts out of sync with the canonical) and it over-models the problem. To keep (a) **backward-compatible and non-disruptive**, the field would be added as a *tolerant union* — an accepted entry may be either a plain `string` (today's form, neutral) **or** `{ text: string, region?: string }` — so all existing `acceptedEs`/`acceptedEn` arrays stay valid untouched (this is the additive, no-required-change property). The canonical `es`/`en` remain neutral and region-less.

**App impact.**
- *Evaluation:* `direction` and the grading algorithm are **unaffected** — region is not a new axis of grading; it only *filters which accepted variants are in the comparison set*. The gate order (normalize → exact → Levenshtein bands → AI) is unchanged; the `expected: string[]` the app builds is simply `[canonical, ...alternates-whose-region-is-null-or-matches-user-region]`.
- *SessionEngine / user-pref:* region becomes a **filter** the SessionEngine reads from a user preference (default = neutral, i.e. accept region-less entries + optionally the user's chosen region). No new recipe; it is a parameter to accept-set composition.
- *DB:* variants live in the item's `payload jsonb` (the `acceptedEs`/`acceptedEn` arrays already do) — **no column, no new table.** A future analytics view could group by region, but nothing is required at DB-confirmation time.
- *Roadmap cost (flagged, not launch):* every dialect added is a large **authoring + QA multiplier** — each supported region means re-reviewing accepted-answer coverage per sentence per direction. This is a content-wave cost decision for later; the schema scaffolding is cheap, the content is not.

**On approval — content touched:** **none.** No launch lesson gains a region tag; a1-01…a1-12 stay 100% neutral LatAm. The only change is the schema's accept-entry type widening to the tolerant union (existing arrays remain valid). Dialect *content* is a separate future wave with its own proposals.

---

## P-005 (APPROVED 2026-07-28) — `referenceCard` item kind (additive, optional, non-graded)

**Status:** approved for MVP by the App Design Coordinator on 2026-07-28. The additive/optional schema landed; cards surface on lesson detail/study and stay out of the Mix arc. The proposal rationale below is retained as the approval record.

**What.** A new **non-graded** item kind, `referenceCard`, for on-demand study material:

> `{ id, kind: 'referenceCard', title, markdown, grammarTags: GrammarTag[], vocabRefs?: string[], provenance? }`

Surfaced via an **optional** lesson-level array — `referenceCards?: ReferenceCard[]` (empty/absent by default, e.g. `.max(…).default([])`) — exactly like `quickChecks`, so a lesson with none is byte-for-byte the current shape. Kept intentionally minimal (no difficulty, no accept sets — it is not an exercise).

**Why, and how it differs from ExplanationItem.** The lesson already has **one** `ExplanationItem` — the ≤150-word **primary teach atom** shown before practice, budget-capped precisely so the first session isn't a wall of grammar (Style Guide §2). A `referenceCard` is the opposite end: **on-demand, deeper reference** the learner pulls up when they want it (a full conjugation table, a "topic essentials" cheat-sheet), **not** budget-capped and **not** part of the teach-then-practice flow. So: `explanation` = one, required, ≤150 words, always-shown; `referenceCard` = zero-or-many, optional, no word cap, study-on-demand. This also seeds feature 11 — deeper per-level lessons can ship several reference cards without inflating the primary explanation.

**App impact.**
- *Evaluation:* **never hits `/api/evaluate`** — it is study material, not an exercise (same posture as flashcards/`multipleChoice` being non-AI, but reference cards aren't even graded/index-checked; there is no answer). No evaluation-contract change.
- *DB (§1.4):* a new `kind = 'referenceCard'` row in the single `lesson_items` table; `payload jsonb` holds `title`/`markdown`; `grammarTags jsonb` populates the existing column; `difficulty` is NULL (like vocab/explanation/passage today — the blender already null-guards non-sentence kinds, audit N3). If the app builds `lesson_items.kind` as a native enum, this is one more additive `ADD VALUE` — same class as `multipleChoice` (audit F3), so add it at enum-creation time. `ItemKind`/`ITEM_KINDS` and the `LessonItem` discriminated union would each gain the member.
- *SessionEngine:* not part of any practice recipe — surfaced by the Lesson-detail / a "study" affordance, filtered by `grammarTags`/`vocabRefs` for a "reference for what I'm weak on" view. No blender weighting (nothing to score).
- *CI/validator:* `vocabRefs` (if present) resolve like any other; `grammarTags` validate against the enum. No word-count check (unlike explanation). Reference cards do **not** count toward the vocab/sentence caps.

**On approval — content touched:** **none of the 12 launch lessons** need a reference card (optional array, default empty; MVP ships translation + flashcards). It becomes available for feature-11 deeper lessons and any lesson that wants an on-demand conjugation table. Adding cards later is authoring, not migration.

---

## Referred to app track (NOT a lesson-schema proposal)

**Mastery / familiarity scale + user-configurable correct-answer threshold (Mike 2026-07-23, feature 9).** A0 kept Completed/Mastered for MVP (ADR-0011) and deferred the richer model to PM-006. This remains an app/DB concern, not a lesson-schema proposal.

---

## P-002 candidates

*Post-P-001 schema ideas surfaced during real lesson authoring/QA. Items 1–3 were formalized and **APPROVED** as P-003; this list is retained as the original parking-lot record.*

- **`acceptedEn` on VocabItem (typed-recall grading).** Prototype integration (2026-07-21, from the app track's five integration frictions): Words mode grades TYPED answers, but vocab `en` glosses like "hello / hi" or "sir / man / Mr." are display strings — a learner typing "hi" would be graded against the raw gloss and fail. Short-term the app adapter splits on "/" and strips parentheticals; the schema-clean fix is an optional `acceptedEn: string[]` (and possibly `acceptedEs` for ES-recall) on VocabItem, authored like sentence alternates. Additive; batch into P-002. Until then, authors should keep vocab `en` glosses adapter-friendly (variants separated by " / ", parentheticals only for disambiguation).
- **Contract clarification — canonical string always joins the accept set (no schema change).** Authoring correctly does NOT duplicate the canonical `es`/`en` inside `acceptedEs`/`acceptedEn` (some sentences legitimately have empty alternate arrays). Consumers must compose the comparison set as `[es, ...acceptedEs]` / `[en, ...acceptedEn]` — this matches the consensus `expected: string[]` gate semantics and is how the seed script should populate `expected`. Flagged because the prototype's evaluator initially checked only the alternates array. Owner: app track adapters/seed script; recorded here so no future consumer repeats it.
- **Dedicated tag for formulaic / courtesy sentences.** Golden lesson `a1-01` L2-QA (a1-01.qa1, checklist pt. 8) flagged that bare-vocative courtesy items (*Gracias, señor.* / *Perdón, señora.* / *Por favor, señor.* / *Adiós, señora.*) have **no honest `GrammarTag`**: the schema forces `grammarTags.min(1)`, but these phrases exercise no article+noun or adjective agreement — only a lone gendered noun. They are currently tagged `agreement.gender-number` as the **least-dishonest** option available in the lesson's map-row tag set (defensible under §7 tag 14's "noun gender/number" clause), applied uniformly across the four items. This risks misattributing a courtesy-formula typo to the agreement weakness bucket. A dedicated tag (e.g. `formula.courtesy` or `expression.greeting`) would let fixed social formulae carry an honest tag without polluting agreement tracking. Recurs across every lesson with greetings/politeness routines — worth a taxonomy addition when A1 tags next open for revision.

---

## Proposal-time verification (historical)

- `schema/schema-smoke.ts`: 11/11 checks pass — enum has no duplicates (53), A1 block = 30, total in 45–58, `GRAMMAR_TAG_VERSION === 1`, a minimal valid lesson parses (incl. one quick-check + provenance + a sentence flashcard), `acceptedEs` defaults to `[]`, and five invalid fixtures are rejected (<8 vocab, unknown tag, ≠3 hints, MCQ `correctIndex` out of range via refine, >6 quick-checks).
- `tsc --noEmit`: clean.
- Setup: `lesson-content/package.json` (npm, private; deps zod, tsx, typescript, @types/node), `tsconfig.json`. Run with `npm run smoke`.
