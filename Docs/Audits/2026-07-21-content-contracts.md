# AUDIT — Joint contract fit (content schema ⋈ DB model ⋈ evaluation contract)

**Auditor:** isolated read-only systems auditor · **Date:** 2026-07-21
**Scope:** joint interlock of `schema/lesson-schema.ts` (v1-FROZEN), MVP-DESIGN-CONSENSUS §1.1–1.4 (DB tables + shared types), and the `EvaluationRequest`/`EvaluationResult` contract, against the golden lesson `lessons/a1/a1-01-hola-me-llamo.json`.
**Method:** walked every schema field to a DB home; traced every id/ref format; sampled 5 realistic A1 wrong answers against the frozen 30-tag taxonomy; checked blender inputs, versioning/lifecycle, and direction policy.
**Out of scope (already ruled by Coordinator, not re-reported):** `EvaluationRequest.modality` missing a `'quickcheck'` member; `correctIndex` client pre-answer exposure.

**Verdict: NOT A CLEAN PASS — 1 CRITICAL, 6 WARNING, 4 NOTE.**
One item (F1, passage-segment ids) should be resolved via P-002 **before** a1-02…a1-12 are mass-drafted; the rest are app-track / P-002-batch decisions that do not block drafting.

---

## CRITICAL

### F1 — Passage segments have no stable IDs, but the contract addresses and evaluates them per-segment
**Dimension:** 2 (ID/ref coherence) + 5 (lifecycle) · **Owner:** Content track (schema) → P-002, then App track

**The mismatch.** `PassageSegment = { es, en[], vocabRefs, provenance? }` — **no `id` field** (only the parent `PassageItem` has an id, `a1-01.p.01`). Yet:
- Consensus §1.2 states each passage segment is "independently evaluable via the same pipeline" and "per-segment eval = same endpoint." Every scoring submission is one `EvaluationRequest` whose `itemRef = "lessonId:itemId"`. A segment has no `itemId`, so **no per-segment itemRef can be formed** — reading evaluations and `user_item_stats` rows cannot be keyed to a segment.
- The golden lesson already trips over this: quickCheck `a1-01.q.03` sets `passageRef: "a1-01.p.01.02"` — a **positional index into segments that is not a real schema id anywhere**. The CI rule "`passageRef` resolves to a real item id" (schema closing comment + MultipleChoiceItem `CI:` note) therefore **cannot hold as written**: `a1-01.p.01.02` is not an id of any item; only `a1-01.p.01` exists.

**Consequence.**
1. Reading (fast-follow W7–8) cannot persist or weakness-weight per-segment results — the whole point of "segments are sentence items with context."
2. `passageRef` to a segment is a fragile positional convention: reorder/insert/remove a segment and every ref (and any stats keyed by index) silently shifts to the wrong target. Segments are **not** covered by the immutable-id / "deprecate never delete" / snapshot guarantees because they have no ids.
3. Mass-drafting 11 more passages now bakes the defect in 11×, and retrofitting segment ids later is a content migration across every lesson + a re-key of any reading stats.

**Suggested resolution.** Additive P-002: add `id: z.string()` to `PassageSegment` (e.g. `a1-01.p.01.s.02`), make it immutable like every other id, and require `passageRef` to resolve to a segment id (not a positional suffix). Fix `a1-01.q.03.passageRef` accordingly. Do this **before** mass drafting so all A1 passages carry segment ids from birth.

---

## WARNING

### F2 — `prerequisites` (and `schemaVersion`) are homeless in the `lessons` table
**Dimension:** 1 (schema→DB totality) · **Owner:** App track (DB confirmation)

`§1.4 lessons` columns = `id, ordinal, level, title, objective, grammarFocus jsonb, contentVersion, contentHash, isActive`. `Lesson.prerequisites: string[]` (deliberately kept in the schema per §1.1 "so a DAG can exist later without migration") has **no column** — it lands nowhere. `schemaVersion` (literal 1) likewise has no column.
**Consequence:** the one field explicitly retained to avoid a future migration would itself require a migration to persist; a DAG-unlock feature can't read prerequisites from the serving copy. `schemaVersion` is lower-risk (global constant).
**Resolution:** add `prerequisites jsonb` (and optionally `schemaVersion smallint`) to `lessons` at table-creation time. Cheap now, a migration later.

### F3 — DB `lesson_items.kind` enum text predates `multipleChoice` (6 kinds, not 5)
**Dimension:** 1 · **Owner:** App track (DB confirmation)

`§1.4` describes `kind enum … mirroring the Zod union`, but that prose was frozen against the 5-kind consensus sketch (vocab/explanation/sentence/passage/conversation). The approved schema's `ITEM_KINDS` now has **6** (`+ multipleChoice`). An implementer building the enum from §1.4's text alone creates a 5-value enum.
**Consequence:** if `kind` is a native Postgres enum, adding `'multipleChoice'` later is an `ALTER TYPE … ADD VALUE` (awkward in a transaction) — exactly the "migration later" this audit is meant to catch. The golden lesson already ships 3 `multipleChoice` rows, so the gap is immediate.
**Resolution:** create the enum from `ITEM_KINDS` (all 6) at DB-confirmation time. (Covered by SCHEMA-NOTES Delta 2 + the P-001 ruling, but the §1.4 table text should be reconciled so no one implements the stale list.)

### F4 — `deprecated` is a DB-only column the content pipeline can never set
**Dimension:** 5 (versioning/lifecycle) · **Owner:** Content track (schema) + App track (seed contract)

`lesson_items.deprecated bool` exists in the DB, but **no item schema has a `deprecated` field**, and the seed upserts *from* the JSON (JSON = source of truth). So:
- An author cannot mark an item deprecated (no field to author).
- They cannot delete it either — CI's snapshot check blocks id removal ("deprecate, never delete").
- Therefore an item can never legitimately become `deprecated = true` through JSON → seed → DB.

Worse, the two mechanisms **conflict**: the only way to "retire" an item today is to drop it from the JSON, which is precisely what the snapshot check forbids. So the intended lifecycle ("deprecate, never delete") has no implementation path.
**Consequence:** retired sentences/vocab stay `active` forever; no way to stop serving a bad item while preserving its id for FK integrity. Not exercised during initial authoring (nothing to deprecate yet), so non-blocking for drafting — but it will bite the first time a lesson is revised post-launch.
**Resolution (pick one, P-002):** (a) add optional `deprecated?: boolean` to items (additive) and have the seed honor it; or (b) define a seed contract where an id present in the snapshot but absent from current JSON is upserted as `deprecated = true` (tombstone) instead of tripping the snapshot check. Decide and document which.

### F5 — Three uncoordinated lesson identifiers: slug vs short-prefix vs ordinal
**Dimension:** 2 (ID/ref coherence) · **Owner:** Content track (CI) + App track (itemRef parsing)

The lesson has **three** identifiers with no binding invariant:
- slug / PK: `a1-01-hola-me-llamo`
- short prefix embedded in every item id: `a1-01` (e.g. `a1-01.s.01`)
- `ordinal`: `1`

`EvaluationRequest.itemRef = "lessonId:itemId"` ⇒ `"a1-01-hola-me-llamo:a1-01.s.01"` — the lesson is encoded **twice**, once as full slug and once as the short prefix inside the item id. Parsing (split on first `:`) is unambiguous, but:
- You **cannot** recover the FK `lessonId` (slug) from an `itemId` — the item only knows `a1-01`, not the slug — so both must always be carried.
- CI enforces globally-unique item ids and unique ordinals, but **nothing binds the item-id prefix to the slug or the ordinal**. Two distinct slugs (`a1-01-hola`, `a1-01-greetings`) could share prefix `a1-01`; their item ids would then collide (caught late by the unique-id check) or items could be silently misfiled under the wrong lesson.
**Consequence:** latent id-collision / mis-attribution surface; item ids are immutable, so a bad convention can't be corrected after drafting.
**Resolution:** add a CI invariant — every item id's prefix maps 1:1 to exactly one lesson slug, and the prefix ↔ slug ↔ ordinal triple is consistent — **before** mass drafting locks the ids in. (No schema change needed; a CI rule.)

### F6 — Error-taxonomy expressibility gap: no orthography/accent, vocab-choice, or word-order tag
**Dimension:** 3 (one-taxonomy invariant) · **Owner:** Content track (schema) → P-002 batch

`EvaluationResult.errorTags: GrammarTag[]` is the sole taxonomy. Sampling 5 realistic A1 wrong answers against the frozen 30 A1 tags:

| Golden sentence | Plausible wrong answer | Honest tag in the 30? |
|---|---|---|
| s.01 `Hola, soy Ana.` | `Hola, estoy Ana.` | ✅ `verb.ser-estar.contrast` |
| s.02 `El señor es de Argentina.` | `La señor es de Argentina.` | ✅ `article` / `agreement.gender-number` |
| s.07 `…Soy de México.` | `…Soy de Mexico.` (missing accent) | ❌ **none** |
| s.12 `Adiós, señora.` | `Adios, señora.` (missing accent) | ❌ **none** |
| s.09 `Gracias, señor.` | `Grasias, señor.` (spelling) | ❌ **none** |

The **single most common A1 typed error class — dropped accents** (`México/Perú/adiós`) — and plain misspellings and wrong-word-choice have **no tag**. Notably the consensus §1.1 sketch enum *included* `vocab-choice` and `word-order`; the frozen v1 enum **dropped both** and added no orthography tag. (This is the same misattribution class as the already-parked `formula.courtesy` P-002 candidate.)
**Consequence:** the evaluator will mark these "close/wrong" but return **empty or force-fit** `errorTags`. Empty tags don't feed the blender's tag-boost or Progress-by-grammar-point; force-fit tags (e.g. dumping an accent slip into `agreement.gender-number`) pollute weakness tracking. Degrades evaluation quality, but does **not** block content drafting (lessons author `grammarFocus`, not learner errors). A1 is additive-only, so new tags are allowed.
**Resolution:** P-002 batch — add error-oriented tags such as `orthography.accent`, `orthography.spelling`, `vocab.choice`, `word-order` (additive to the frozen block). Batch with `formula.courtesy`.

### F7 — Same class as `correctIndex`: `EvaluationRequest.expected[]`/`source` leak answers if populated client-side
**Dimension:** 2 / cross-check of the Coordinator's client-exposure class · **Owner:** App track (serving)

The Coordinator flagged `correctIndex` must not reach the client pre-answer. The **same class** recurs in the evaluation contract: `EvaluationRequest = { …, source, expected: string[], userInput, … }`. For typed translation, `expected = [es, …acceptedEs]` — **the accepted answers**. If the browser builds/POSTs the `EvaluationRequest`, those answers were shipped to the client, defeating the exercise (identical to leaking `correctIndex`).
**Consequence:** answer leakage for every typed item unless serving is careful; the single `EvaluationRequest` type is used ambiguously for both client→server and server-internal calls.
**Resolution:** `/api/evaluate` must resolve `expected[]`/`source` **server-side from `itemRef`**, never trust a client-supplied `expected`. Document that the client sends only `{ modality, direction, itemRef, userInput, context }`. App/serving concern, not a schema change.

---

## NOTE

### N1 — Flashcard-eligibility (and pooling predicates) live in jsonb, not columns
**Dimension:** 4. The flashcard pool = `kind='vocab'` ∪ (`kind='sentence'` AND `payload.flashcard.eligible = true`). Eligibility sits in `payload jsonb`; there is no column. A jsonb scan over ~168 sentences (12 lessons × 12–20) is trivially fine at MVP scale — flagged as a **design consideration** only: if flashcard-pool queries get hot, promote to a generated column / partial index. Same applies to `chunk`, `provenance`. No action now.

### N2 — `lesson_items` has no explicit position/ordering column
**Dimension:** 1. Authored order (s.01…s.14, segment order, quickCheck order) is recoverable only by **lexical sort of the item id**. Ids are zero-padded to 2 digits, so this holds up to 99 items of a kind per lesson (well within 8–15 vocab / 12–20 sentences). It is an implicit contract — worth an explicit `position` column or a documented "sort-by-id" rule so a future 3-digit lesson doesn't reorder silently.

### N3 — VocabItem carries neither `difficulty` nor `grammarTags`
**Dimension:** 4. The `lesson_items.difficulty` column will be NULL for `vocab`/`explanation`/`passage`/`conversation` rows (only `sentence` and `multipleChoice` have difficulty). The blend weight formula doesn't multiply by `difficulty` (so no divide-by-null risk), and vocab has no `grammarTags`, so the tag-boost term is always ×1.0 for vocab-card pooling. Acceptable for MVP — noted so the blender code null-guards `difficulty`/`grammarTags` when pooling vocab/flashcards.

### N4 — `saved_items.refType` (vocab|sentence|passage|lesson) can't reference a segment or quickCheck
**Dimension:** 4. You can save a whole `passage` but not a segment, and not a `multipleChoice`. Fine for MVP (save = word/sentence/passage/lesson per §1.3). Noted only so the save affordance on the reading surface targets the passage, not an (id-less) segment — which also depends on F1.

---

## Dimension coverage summary

| Dimension | Result |
|---|---|
| 1 — Schema→DB mapping totality | F2 (prerequisites/schemaVersion homeless), F3 (kind enum), N2, N3 |
| 2 — ID/ref format coherence | **F1 (CRITICAL, segment ids)**, F5 (slug/prefix/ordinal), F7 (expected[] leak) |
| 3 — One-taxonomy invariant | F6 (accent/spelling/vocab-choice/word-order gap) |
| 4 — Blending/SessionEngine inputs | N1, N3, N4 — all inputs present; eligibility jsonb-scan OK at scale |
| 5 — Versioning/lifecycle | F4 (deprecation has no pipeline path) + F1 (segments outside immutable-id regime) |
| 6 — Direction policy (D3) | **CLEAN.** Items are direction-neutral (es/en/acceptedEs[]/acceptedEn[]); EN→ES typed + both-direction flashcards fully supported; nothing contradicts D3. |

## Verdict
**NOT A CLEAN PASS — 1 CRITICAL / 6 WARNING / 4 NOTE.**
Blocking mass drafting: **F1 only** — resolve segment ids (additive P-002) before a1-02…a1-12 so passages are authored with immutable segment ids. F5 (id-convention CI guard) is strongly advised before drafting since item ids are immutable once written. All other findings are app-track DB-confirmation or P-002-batch decisions that do not block content authoring.
