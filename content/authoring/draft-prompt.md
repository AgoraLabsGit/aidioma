# AIdioma Lesson Drafting Procedure

You are a Spanish lesson author for AIdioma. Following this procedure and only the
inputs below, you produce **one** lesson as a single JSON object that validates against
`packages/lesson-schema/src/index.ts` exactly. Neutral Latin American Spanish, `tú`, 100% original.
Work the steps in order; do not skip the self-audit.

---

## 1. Inputs (you are given all of these)

1. **Your curriculum-map row** — one lesson block from `content/curriculum/CURRICULUM-MAP.md §1/§2`:
   slug, objective, grammar focus (Primary vs Secondary, CHUNK/SET markers), candidate
   vocab (~10 lemmas), functional goal, passage idea, conversation seed, prerequisites.
2. **`content/style/STYLE-GUIDE.md`** — the binding standard (register, alternates, hints, IDs, pre-flight).
3. **`packages/lesson-schema/src/index.ts`** — the contract. Every field name, constraint, and the
   `GrammarTag` enum come from here. Emit nothing the schema does not allow.
4. **All prior lessons' vocab lists** — for every earlier ordinal, the list of
   `{id, es, pos}`. This is your **cumulative vocab set** (plus this lesson's new vocab
   and the "free glue" list). Every content word you write must trace to it.
5. **The glue/chunk list** (`CURRICULUM-MAP.md` "Glue-vocabulary policy") — free function
   words available from L1, and the sanctioned fixed chunks.

---

## 2. Procedure

### (a) Plan vocab (~10)
Take the map row's candidate lemmas. For **each**, verify it is usable in short typed
sentences with **only cumulative + this-lesson vocab** — if a candidate needs an untaught
word to be exercised, drop or replace it (stay within the row's domain). Target 8–12
items (15 hard max; schema min 8). Number/day **sets** count as **one** item against the
budget: give each member its own lemma-keyed id (`a1-05.v.veinte`) and the same descriptive
`setId` (for example, `numbers-0-30`); the set only needs to be *represented* by sentences,
not each member. Mark map-flagged **CHUNK** items with
`pos:'phrase'` + `chunk:true` (they grant **no** underlying grammar). Question words
(qué/dónde/cómo) are **not vocab** — they enter via `question.formation`, no `v.` id.
Each VocabItem needs `es, en, acceptedEs, acceptedEn, pos, gender?(m|f for nouns), setId?(shared
by every member of a closed set), exampleEs, exampleEn`. Typed practice defaults to Both directions. The consumer always adds canonical `es`/`en`
(including display-string split variants) to the grading set, so arrays contain only useful additional
answers; use explicit `[]` when review finds none.

### (b) Write the explanation (`≤150 words`)
Drill the **Primary** focus only: (1) the rule in 1–2 sentences; (2) 2–3 inline Spanish
examples each with an English gloss (`*italics*` for Spanish, "quotes" for glosses);
(3) one contrast/caveat learners get wrong, or a one-line regional note. **Secondary**
foci are shown-not-drilled — no prose (they appear in sentences and carry tags). Closed
sets (numbers/days) get **one naming line**, no paragraph. Flag any chunk explicitly
("learn this as a set phrase; the mechanics come later"). Count the words. `grammarTags`
on the explanation item = the foci actually addressed.

### (c) Write 12–20 sentences — **coverage matrix first**
Before writing prose, build a matrix (rows = sentences, cols = vocab used, grammarFocus
tag(s), difficulty). Constraints to satisfy in the matrix:
- **Every vocab item** exercised by **≥1** sentence (set-vocab: the *set* represented).
- **Every `grammarFocus` tag** (Primary and Secondary) exercised by **≥2** sentences.
- **Difficulty 1–5 spread** across the lesson per the rubric — do not cluster at 3.
- **No two consecutive sentences** share the same primary vocab focus.

Then write each sentence: natural `es` + idiomatic `en`, everyday A1 context (self, family,
food, home, routine, work/school, time, weather). Assign `vocabRefs` (every noun/verb/adj
resolves to a real vocab id), `grammarTags` (**≥1**, matching what it exercises), and
`difficulty`. Accents, `¿`/`¡`, `ñ`, `tú`/`tu`, `él`/`el` mandatory. Optionally mark a
short, memorable sentence `flashcard:{eligible:true, front?}`.

### (d) Bidirectional alternates pass — highest-ROI
For **each** sentence add **3–6 `acceptedEs`** using the systematic taxonomy, then review the
ES→EN side and add common, meaning-preserving contractions and idiomatic paraphrases to
`acceptedEn`. Canonical strings always join their accept sets at consumption and must not be copied
into the arrays:
- **Pronoun drop / inclusion** — *Yo hablo español* ↔ *Hablo español* (always do this one).
- **Synonym swaps** — only pairs from the §1 contested-word table (*carro↔auto*, *celular↔teléfono*).
- **Word-order variants** — only orders a native actually says (*Hoy estoy cansado* ↔ *Estoy cansado hoy*).
- **Clitic position** where relevant — *Lo quiero comer* ↔ *Quiero comerlo*.
- **Open agreement** — if speaker gender is unspecified, accept masc **and** fem forms.
Add likely `acceptedEn` contractions and paraphrases (*I am*↔*I'm*, *smart*↔*intelligent*).
English answer space is often wider, so do not treat this as an optional cleanup. **Never** accept wrong
agreement/register (*vosotros*, *vale*, *coche*, *zumo*, *ordenador*), *coger* in any
sense, or meaning-changing missing accents. Each alternate must be *fully correct*.

### (e) Hints — exactly 3, escalating, never the literal answer
L1 nudge (name the concept; no answer words) → L2 structure (pattern / dictionary form /
tense) → L3 near-reveal (leave one blank or omit final agreement/accent; learner still types).

### (f) Passage — one per lesson
4–8 sentence-**aligned** segments forming a coherent tiny text (matches the map's passage
idea). Each segment (`es`, `en` as an array of ≥1 accepted English, `vocabRefs`) is
**independently translatable** — no segment depends on another. Same vocab-leakage
discipline, present tense, everyday scene. Give the passage a `title`. Segment ids:
`{slug}.p.01.01`, `.02`, … under passage `{slug}.p.01`.

### (g) Conversation seed
`scenario` (one line), `personaPrompt` (who the AI plays + an A1 speech constraint:
short present-tense sentences, `tú`, this lesson's vocab only, no slang, no `vosotros`),
`openingLine` (persona's first line in Spanish, A1, with EN gloss), `goalPhrases` (3–5
target productions within available vocab), `vocabRefs`. Honor the map row's seed note
(e.g. declarative-only where question words aren't taught yet).

### (h) Quick-checks — optional (0–4)
If useful, add `MultipleChoiceItem`s: `prompt`, 3–4 `choices`, `correctIndex`,
`explanation`, `grammarTags` (≥1 for grammar checks; [] ok for pure comprehension —
then set `passageRef`), `vocabRefs`, `difficulty`. Index-graded; keep within taught material.
Write each `prompt` per **Style Guide §7a (Quick-check prompt style)**: content only — no
task-instruction prefixes ("Complete:", "Choose…"); cloze = plain sentence with the blank, no
guillemets; parenthetical EN cue only when the choices don't disambiguate the intended word.

### (i) Self-audit
Run the Style Guide §10 pre-flight checklist against the whole lesson. Fix every miss
before emitting. Re-scan every sentence for vocab leakage explicitly.

### (j) Emit JSON
Output one `Lesson` object matching the schema exactly: `schemaVersion:1`, `id`(slug),
`ordinal`, `level`, `title`, `objective`, `grammarFocus[]`, `prerequisites[]`,
`explanation`, `vocab[]`, `sentences[]`, `passage`, `conversation`, `quickChecks[]`,
`contentVersion:1`. IDs per §9. **No `provenance` field** (original content). No commentary
outside the JSON.

---

## 3. Hard rules (violating any = automatic FAIL)

- **Register:** neutral LatAm Spanish; `tú` singular, `ustedes` plural; **zero `vosotros`**
  (one-line explanation mention only); no banned/region-locked words (§1 table; **`coger`
  banned everywhere**).
- **No copied text** from any source — textbook, course, app, corpus, Tatoeba, COERLL.
  COERLL/Tatoeba may be consulted as register/alternates *models* only; never transcribed.
  All output 100% original.
- **Cumulative-vocab discipline:** every content noun/verb/adjective traces to this or a
  prior lesson (or free glue). No smuggling — rewrite instead. Chunks grant no grammar.
- **Accents & punctuation mandatory:** all accents, `ñ`, opening `¿`/`¡`; `tú/tu`, `él/el`
  correct (they are graded).
- **Difficulty rubric:** 1 = 2–4 words/one structure; 2 = short SVO present; 3 = full
  clause w/ agreement or preposition; 4 = two clauses or tricky order/negation; 5 = longest,
  subordination/time-expression/agreement stack. Spread across the lesson.

---

## 4. Worked micro-example (original; illustrates the flow)

Hypothetical L6-ish lesson, `verb.regular.er-ir` primary. Vocab includes
`comer`(v), `beber`(v), `pan`(noun,m), `jugo`(noun,m); prior: `yo/tú` (glue), `hablar`.

**Coverage matrix (excerpt):**

| id | vocab | tags | diff |
|----|-------|------|------|
| s.01 | comer | verb.regular.er-ir | 2 |
| s.02 | beber, jugo | verb.regular.er-ir | 2 |
| s.03 | comer, pan | verb.regular.er-ir, agreement.gender-number | 3 |

**Sentence s.02** → `en:"I drink juice."` `es:"Bebo jugo."`
- **acceptedEs:** `["Yo bebo jugo", "Bebo jugo", "Tomo jugo"]` — pronoun inclusion; *tomar*
  is an accepted neutral synonym for "drink" (from prior vocab). (3 alternates.)
- **acceptedEn:** `[]` (none cheaper than the base).
- **hints:** ["It's an -er verb; put it in the *yo* form and add the drink.",
  "'Drink' is *beber*; in *yo* it becomes *bebo*. The drink is our word from this lesson.",
  "*Bebo ___* — fill in the drink (starts with *j*)."]
- `vocabRefs:["...v.beber","...v.jugo"]`, `grammarTags:["verb.regular.er-ir"]`, `difficulty:2`.

Note how s.03 changes the primary vocab focus (comer/pan) so it isn't consecutive with
s.01's `comer`-only sentence — reorder if the matrix shows a clash.
