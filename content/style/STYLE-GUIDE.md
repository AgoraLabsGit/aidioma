# AIdioma Authoring Style Guide

> The binding standard for all Spanish lesson content. Every atom you write is judged against the
> 10-point QA checklist (see the pre-flight at the end). These rules are decisions, not suggestions.
> When in doubt, follow the examples literally.

**Non-negotiables at a glance**
- Register: **neutral Latin American Spanish**. `tú` for singular *you*, `ustedes` for plural.
- **No `vosotros`.** Never conjugate, teach, or exercise it. One-line mentions in explanations only.
- All content **100% original**. Never copy or "adapt" from any textbook, course, or app.
- **IDs are immutable** once published. Content can change; IDs cannot.

---

## 1. Register & lexical choice

Write the Spanish a well-educated speaker from anywhere in Latin America would recognize as normal and
unmarked — think pan-regional TV Spanish, not Mexico City slang or Buenos Aires *voseo*. Use `tú`
throughout for singular *you*; use `ustedes` for all plural *you* (formal and informal alike). Prefer
verbs and nouns understood everywhere over locally "correct" but regionally narrow ones.

Explanations **may** note in one line that other regions differ (e.g. "Spain uses *vosotros* here; we
don't"). Never build vocab, sentences, or hints around those forms.

**Contested word-choice table** (primary = teach this; accepted = allow in `acceptedEs[]`):

| English | Primary (teach) | Also accept | Avoid / caution |
|---|---|---|---|
| car | **carro** | auto, automóvil | *coche* (Peninsular-marked) |
| computer | **computadora** | computador | *ordenador* (Spain only) |
| juice | **jugo** | — | *zumo* (Spain only) |
| to take (bus/coffee) | **tomar** | agarrar (grab) | **coger** — vulgar in MX/AR/etc.; never use |
| cell phone | **celular** | teléfono | *móvil* (Spain only) |
| computer mouse | **mouse** | ratón | — |
| potato | **papa** | — | *patata* (Spain only) |
| ok / fine (adj.) | **bien** | está bien | *vale* (Peninsular) |
| bus | **el bus / el autobús** | el camión (MX), la guagua (regional) | keep to bus/autobús for neutrality |
| pen | **el bolígrafo** | la pluma, el lapicero | — |
| glasses (eye) | **los lentes** | los anteojos | *las gafas* (Spain-leaning) |
| pretty / nice | **bonito** | lindo | — |
| right now | **ahora / ahora mismo** | ya | *ahorita* (regionally fuzzy — avoid) |

When two options are both pan-neutral (e.g. *carro/auto*), teach one and list the other as an accepted
alternate so learners typing either are marked correct. **`coger` is banned** in all directions and all
fields — even where grammatically innocent — because it is vulgar across much of LatAm.

## 2. Explanation style — the "teach" atom

**Voice:** warm, direct, second person ("you"), plain US English. Talk to one learner like a patient
tutor. No linguistics jargon unless you immediately define it. No filler ("As you may know…").

**Structure (always this order):**
1. **The rule** in one or two sentences.
2. **2–3 inline Spanish examples**, each with an English gloss: *Yo hablo español* ("I speak Spanish").
3. **One contrast or caveat** — the thing learners get wrong, or a one-line regional note.

**Budget: ≤150 words of markdown.** Count them. Use `*italics*` for Spanish, quotes for glosses. Bold
sparingly for the key term. No headers inside an explanation.

**Explanation-budget rule (what the 150 words must cover).** The explanation drills the lesson's
**primary** grammar focus only (rule + 2–3 examples + one contrast). **Closed sets** (numbers, days,
months) get **no prose beyond a single naming line** — they are flashcard sets, not paragraphs.
**Secondary** foci are **shown, not drilled**: they appear in the lesson's example sentences and carry
`grammarTag`s, but get no prose. Formalize a secondary focus only in the lesson where it becomes
primary. (A lesson with 3–4 tagged foci is fine — only one or two are *taught* in prose.)

**Fixed-chunk mechanism.** A small set of inflected/multi-word expressions may be taught **whole, as
memorized chunks**, before their grammar is formalized — e.g. *me llamo / te llamas / se llama*,
*tengo … años*, *me gusta*. Flag them in the explanation as chunks ("learn this as a set phrase; the
mechanics come later"), never present them as derivable, and do **not** treat them as granting the
underlying grammar for vocab-leakage purposes. The lesson row in the curriculum map marks each with
**CHUNK**.

**Example (ser vs estar, 78 words):**
> Spanish has two verbs for "to be." Use **ser** for identity and permanent traits — who or what
> something *is*: *Ella es doctora* ("She is a doctor"), *Soy de México* ("I'm from Mexico"). Use
> **estar** for states, feelings, and location — how or where something *is right now*: *Estoy
> cansado* ("I'm tired"), *El carro está aquí* ("The car is here"). Quick test: if it could change
> today, reach for *estar*.

## 3. Sentence authoring

Write **natural over literal**. The `es` and `en` must each read like something a real person would
say — not a word-for-word bridge. Everyday A1 contexts only: **self, family, food, home, daily
routine, work/school, time, weather.** No politics, no idioms a beginner won't meet.

Each sentence carries: `es`, `en`, `acceptedEs[]`, `acceptedEn[]`, ≥1 `grammarTag`, `vocabRefs`,
`difficulty` (1–5), and **exactly 3 hints**.

**Vocab-leakage discipline (QA #6):** every content word in a sentence must come from **this lesson's
vocab or a prior lesson's**. Function words (articles, común pronouns, *y, de, en, es*) are always
free. Before finalizing, scan each sentence and confirm every noun/verb/adjective has a `vocabRef`. If
a word isn't available yet, rewrite the sentence — don't smuggle it in.

**Pure-chunk sentences are disallowed.** Every sentence must exercise **≥1 real (non-chunk) grammar
point** so its `grammarTags` are honest — a fixed chunk (e.g. *me llamo*, *tengo … años*) grants no
underlying grammar, so a sentence built only from a chunk has nothing legitimate to tag. **Pair chunks
with a taught structure**: *Me llamo Diego y soy de Colombia* is fine (the chunk plus `verb.ser`);
*Me llamo Diego* alone is not.

**Difficulty rubric (within one A1 lesson):**
| Level | Profile |
|---|---|
| 1 | 2–4 words, one target structure, no alternates trap. *Soy Ana.* |
| 2 | Short SVO, present tense, concrete noun. *Yo tomo jugo.* |
| 3 | Full clause with adj. agreement or a preposition. *Mi hermana está cansada hoy.* |
| 4 | Two clauses or a less-obvious word order / negation. *No tengo hambre, pero como algo.* |
| 5 | Longest in lesson: subordination, time expression, or tricky agreement stack. |

Spread the 12–20 sentences across the range; don't cluster at 3.

**Punctuation (mandatory):** opening `¿` and `¡`; all accents present and correct (*mamá, está, tú,
así, adiós*); the *ñ* where required. `tú` (you) vs `tu` (your) and *él* vs *el* must be right —
these are graded.

## 4. Alternates authoring — the highest-ROI work

`acceptedEs[]` (EN→ES, the launch priority) is where grading feels fair or infuriating. Target **3–6
alternates per sentence.** Generate them systematically:

**Entry-lesson exemption (L1–L2).** Lessons 1–2 may fall below 3 alternates on sentences whose closed
lexicon offers **no register-safe variants** — fixed courtesy formulae (*Gracias, señor.*) and
third-person definite-subject identity (*La señora es de Colombia.*), where pronoun-drop doesn't apply
and every synonym would break register. **Justify each in the QA notes;** the validator warning stands
as documentation, not a defect (do not pad with marginal variants to silence it).

- **Pronoun drop / inclusion:** Spanish drops subject pronouns. If `es` is *Yo hablo español*, accept
  *Hablo español* and vice-versa. This alone covers a huge share of "correct but marked wrong."
- **Synonym swaps within neutral register:** *carro* ↔ *auto*; *bonito* ↔ *lindo*; *celular* ↔
  *teléfono* — but only pairs from the §1 table.
- **Clitic position (where relevant):** *Lo quiero comer* ↔ *Quiero comerlo*. Both accepted.
- **Natural word-order variants:** *Hoy estoy cansado* ↔ *Estoy cansado hoy*. Include only orders a
  native would actually say.
- **Contractions on the EN side** (`acceptedEn`): *I am* → *I'm*, *do not* → *don't*, *she is* →
  *she's*. Author these when cheap; EN→ES is priority but ES→EN grading benefits.
- **EN-progressive → ES progressive rendering:** when the `en` prompt uses **progressive aspect**
  for an action verb (*I'm listening*, *She's studying*), accept the Spanish progressive (*estar* +
  gerund; -ar→*-ando*, -er/-ir→*-iendo*) as `acceptedEs` alternates — **with and without the
  subject pronoun** (*Estoy escuchando…* / *Yo estoy escuchando…*, *Está estudiando…* / *Ella está
  estudiando…*). The canonical `es` **stays the taught simple present**. Alternates are grading
  data, never displayed, so an untaught structure here carries no pedagogy cost — a learner's
  correct progressive must not be scored wrong. Do **not** add progressive where `en` is simple
  aspect (*Where do you work?*, *Do you study Spanish?*).

**Never accept:** wrong agreement (*cansada* for a male speaker), wrong register (*vosotros* forms,
*vale*, *ordenador*, *coche*, *zumo*), *coger* in any sense, missing accents that change meaning, or
awkward word orders no native uses. An alternate must be *fully correct*, not merely understandable.

**Worked example** — EN prompt *"I'm tired today."* `es`: *Hoy estoy cansado.*
`acceptedEs`: [`Estoy cansado hoy`, `Hoy estoy cansado`, `Estoy cansada hoy` (female speaker),
`Hoy estoy cansada`]. (4 alternates; agreement variants are valid because speaker gender is open.)

## 5. Hints — 3-level escalation

Exactly **3 hints per sentence**, escalating and **never revealing the literal answer**:

- **Level 1 — nudge:** name the concept or what to notice. No Spanish words from the answer.
- **Level 2 — structure:** give the pattern, a key word's dictionary form, or the tense — a partial.
- **Level 3 — near-reveal:** almost there, but the learner still types something. Leave one blank or
  give the answer minus final agreement/accent. **Never the exact target string.**

**Example A** — target *Yo tomo jugo* ("I drink juice"):
1. "Start with the subject, then the verb for 'drink' in the *yo* form."
2. "'Drink' here is *tomar*; in *yo* it becomes *tomo*. 'Juice' is our word from this lesson."
3. "*Yo tomo ___* — fill in the drink (starts with *j*)."

**Example B** — target *Mi hermana está cansada* ("My sister is tired"):
1. "Whose state is this, and is 'tired' permanent or right-now? Pick *ser* or *estar*."
2. "Use *estar* for the state. The adjective must agree with a feminine subject."
3. "*Mi hermana está ___* — the adjective for 'tired,' feminine form."

## 6. Passage style

One passage per lesson: 4–8 short segments forming a tiny coherent text (a day, a family intro, a
meal). Each segment must be **independently translatable** — a standalone sentence with its own `es` and
`en[]` (an array of 1+ accepted English translations — the segment-level analogue of alternates;
reading is graded ES→EN, so segments carry no `acceptedEs`), following all §3–4 rules where they
apply. No segment may depend on another for meaning.
**A1-constrained:** same vocab-leakage discipline as sentences; present tense; everyday scene. Give the
passage a one-line `title`/context so the learner knows the setting.

## 7. Conversation seeds

One seed per lesson to launch open practice. Fields:
- **scenario:** the situation in one line ("Ordering breakfast at a café").
- **personaPrompt** (schema field name): who the AI plays, with an A1-appropriate speech constraint ("Camila, a friendly waiter
  who speaks slowly, in short present-tense sentences, using only this lesson's vocab").
- **openingLine:** the persona's first line in Spanish, A1-level, with EN gloss.
- **goalPhrases:** 3–5 target things the learner should produce to "win" (e.g. *quiero un jugo*, *soy
  de…*, a greeting). Keep them within available vocab.

Persona speech must stay at the learner's level: short sentences, `tú` to the learner, no slang, no
`vosotros`.

## 7a. Quick-check (multipleChoice) prompt style

The `prompt` is **content only** — never embed task instructions. The UI owns every affordance (the
card is already labeled *Quiz*), so openers like "Complete:", "Choose…", "Which is correct:", "Which
form agrees:" are pure noise. Write the prompt as the raw material the learner reasons about, nothing
more.

- **Cloze items:** a plain sentence with the blank — **no guillemets, no quote-wrapping.**
  `Yo ___ español.`, never `Complete: «Yo ___ español.»`.
- **EN cue (parenthetical):** add a `(cue)` **only when the choices don't disambiguate the intended
  word on their own** — e.g. options drawn from different lemmas, where the learner must know which
  meaning is wanted. When **all choices are forms of one lemma** (an agreement or conjugation item),
  the word is already given by the options, so the cue is redundant — **omit it.**
- **Non-cloze questions:** one natural question, plainly phrased. Any Spanish material sits inline in
  plain text (no guillemets); no meta-instructions. Passage-comprehension items are ordinary
  questions: *In the reading, where is Diego from?*
- **No quotation marks of any kind in prompts** (Mike ruling, 2026-07-21) — no `«»`, `""`, or `''`
  wrapping. To present an EN phrase the learner must render in Spanish, delimit with a colon:
  `Say it in Spanish: I don't work today` — never `How do you say 'I don't work today'?`.
  Apostrophes inside contractions (*don't*, *I'm*) are fine — they're not quotation marks.

**Worked before / after (actual a1-03 fixes):**

| Before | After | Why |
|---|---|---|
| `Complete: «Yo ___ español.» (speak)` | `Yo ___ español.` | choices are all *hablar* forms — cue redundant; instruction + guillemets stripped |
| `Complete: «Ella ___ mucho.» (study)` | `Ella ___ mucho.` | choices are all *estudiar* forms — same |
| `Which word asks about a place: «¿___ trabajas?»` | `¿___ trabajas? (asking about a place)` | choices span different lemmas (*Dónde/Qué/No/Y*) — a cue is warranted, but phrased as content, not instruction |
| `How do you say 'I don't work today'?` | `How do you say 'I don't work today'?` | already a natural question, no instruction prefix — kept as-is |

## 8. English style

Natural US English throughout `en` and glosses. **Contractions welcome and preferred** where a person
would use them (*I'm, don't, she's, we're*). The `en` must be both accurate to the Spanish *and*
idiomatic — if the literal translation sounds stiff, write what an English speaker actually says and
let `acceptedEs`/alternates carry the mapping. Avoid Britishisms; keep spelling US (*color, organize*).

## 9. ID & file naming conventions

**Lesson slug:** `{level}-{seq}-{topic}` — e.g. `a1-03-ser-vs-estar`. Lowercase, hyphenated, `seq`
zero-padded to 2 digits.

**Item IDs:** `{lesson-slug}.{type}.{key}` —

| Type | Code | Example |
|---|---|---|
| vocab | `v` | `a1-03.v.hablar` (use the lemma as key) |
| sentence | `s` | `a1-03.s.01` (zero-padded seq) |
| passage | `p` | `a1-03.p.01` (passage), `a1-03.p.01.02` for segment 2 |
| conversation | `c` | `a1-03.c.01` |
| explanation | `e` | `a1-03.e.01` |
| multipleChoice (quick-check) | `q` | `a1-03.q.01` (zero-padded seq) |

Vocab keys use the dictionary lemma (infinitive verbs, singular nouns). Sentence/passage/convo keys are
zero-padded sequence numbers. **IDs are immutable once published** — if content is wrong, fix the
content, keep the ID. Retire, never renumber. **File naming:** one file per lesson,
`{lesson-slug}.json` (or `.ts`), inside `lessons/`.

**Set-type vocab (numbers, days, months).** Each member is **still one lemma-keyed vocab item** with a
normal ID — `a1-09.v.lunes`, `a1-05.v.veinte` — keeping IDs immutable and one-concept-per-item. What
changes is **budget + exercise accounting**: the whole set counts as **one item** against the ~10-item
lesson cap (a closed class learned as a group), and QA #6's "every vocab item exercised by ≥1 sentence"
is satisfied when the **set is represented** by sentences — not every one of 30 members needs its own
sentence. Sentence `vocabRefs` still resolve to the individual member IDs actually used. (Don't invent
a `numeros-0-30` composite ID; there is no such thing — the members are the IDs, the set is an
authoring/budget grouping.) **Question words** (qué/dónde/cómo) are **not vocab** — they enter via
their `grammarTag` (`question.formation`), spend no vocab budget, and get no `v.` ID.

## 10. Author's pre-flight checklist

Run this against every lesson before marking it done. Each item maps to a QA point.

- [ ] **1. Grammar & accents** — every accent, *ñ*, and agreement correct (*tú/tu*, *él/el*, gendered adjs).
- [ ] **2. Naturalness** — no anglicisms or calques; `es` reads like real speech, not a word-bridge.
- [ ] **3. Register** — neutral LatAm throughout; `tú`/`ustedes`; zero `vosotros`; no banned/regional words (§1).
- [ ] **4. English** — every `en` accurate *and* idiomatic US English; contractions where natural.
- [ ] **5. Alternates** — 3–6 `acceptedEs` per sentence incl. pronoun-drop; contractions in `acceptedEn`; no wrong-register/agreement entries.
- [ ] **6. Vocab leakage** — every content word traces to this or a prior lesson; every noun/verb/adj has a `vocabRef`.
- [ ] **7. Hints** — exactly 3, escalating nudge→near-reveal, none states the literal answer.
- [ ] **8. grammarTags** — each sentence's tags match what it actually exercises.
- [ ] **9. Explanation** — ≤150 words, rule correct, 2–3 inline examples that demonstrate it, one contrast.
- [ ] **10. Difficulty** — 1–5 assigned plausibly and spread across the lesson, not clustered.
- [ ] **Meta** — 8–12 vocab (15 hard max), 12–20 sentences, 1 passage, 1 conversation seed; all IDs follow §9; 100% original.

---

## Changelog

**v2.4 (2026-07-21) — EN-progressive accepts ES progressive rendering (Mike's live prototype
testing, 2026-07-21).** Added a §4 alternates bullet: when an `en` prompt uses progressive aspect
for an action verb (*I'm listening*, *She's studying*), the Spanish progressive (*estar* + gerund,
-ar→*-ando* / -er/-ir→*-iendo*) is a fully correct translation and joins `acceptedEs` — with and
without the subject pronoun; the canonical `es` stays the taught simple present. Because alternates
are grading data and never displayed, the untaught structure carries no pedagogy cost. Real case:
EN "Today I'm listening to the lady." had only accepted "Hoy escucho a la señora.", scoring a
learner's correct "Hoy estoy escuchando a la señora." a 10. Swept across a1-03 (a1-01/a1-02 are all
*ser* sentences — no progressive-aspect action verbs).

**v2.3 (2026-07-21) — quick-check prompt style (Mike's ruling 2026-07-21).** Added **§7a
Quick-check (multipleChoice) prompt style**: prompts are content only — no task-instruction prefixes
("Complete:", "Choose…", "Which is correct:") since the UI owns affordances; cloze items are plain
sentences with the blank and no guillemets/quote-wrapping; a parenthetical EN cue is included only
when the choices don't disambiguate the intended word (omitted when all choices are forms of one
lemma); non-cloze items are natural questions with Spanish inline and no meta-instructions. Applied
across a1-01 / a1-02 / a1-03 quickChecks. No renumbering.

**v2.2 (2026-07-21) — patched per golden-lesson (a1-01) authoring contact.** Four surgical additions,
no renumbering: §9 gains the **multipleChoice ID convention** `.q.NN` (e.g. `a1-01.q.01`); §3 gains the
**pure-chunk-sentence ban** (every sentence must exercise ≥1 real grammar point; pair chunks with a
taught structure); §4 gains the **L1–L2 entry-lesson alternates exemption** (closed courtesy formulae /
definite-subject identity may fall below 3 alternates, justified in QA notes, validator warning kept as
documentation). Schema side (not in this file): `ConversationSeed.openingLineGloss` added so the §7
EN gloss lives in its own field instead of inside the Spanish `openingLine` (P-001 delta 8).

**v2 (2026-07-21) — patched per curriculum-map panel review.** Added the **explanation-budget rule**
and **fixed-chunk mechanism** to §2 (map fixes 6/9); added the **set-type vocab ID/exercise
convention** and the "question words aren't vocab" rule to §9 (map fix 10). No changes to register,
alternates, hints, or QA-point numbering.

**v2.1 (2026-07-21) — aligned to schema v1 (P-001 draft).** §6: corrected passage-segment fields —
segments carry `es` + `en[]` (accepted-English array); no `acceptedEs` on segments (reading grades
ES→EN; the schema is authoritative). §7: field renamed to **personaPrompt** to match the schema.
Found during draft/QA-prompt authoring; schema unchanged.
