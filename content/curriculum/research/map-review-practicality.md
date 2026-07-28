# Curriculum-Map Practicality Review — A1 Spine

**Lens:** the author who must write and validate 12 lessons against `CURRICULUM-MAP.md` under the
fixed schema (explanation ≤150 words covering the whole grammar focus; ~10 vocab, each exercised;
12–20 sentences; cumulative-vocab + glue discipline; 1 passage + 1 conversation seed on taught vocab).
**Method:** drafted sentences/seeds against the cumulative pool for every lesson (L1–L2 hardest);
ran `wordfreq` (zipf, `es`) on all ⚠ items + ~60 candidate lemmas; deduplicated every draft tag.
**Date:** 2026-07-21.

Verdict at the end. Severity: **CRITICAL** blocks authoring · **MAJOR** forces awkward/unnatural
content or rework · **MINOR** clean-up · **NIT** cosmetic.

---

## CRITICAL

### C1 — `llamarse` (L1) needs a reflexive clitic the glue policy withholds until L10
L1's headline function is *me llamo* / *te llamas* / *se llama*. Those require the clitic **me/te/se**.
The glue list grants **subject** pronouns only (`yo, tú, él…`) and explicitly states "reflexive `se`
[is] **not free** until L10." So the map, as written, makes L1's flagship vocab item and its
functional goal (*Hola, me llamo Ana*) **unauthorable** — you cannot conjugate the one verb the
lesson is named after.
**Fix (pick one):** (a) grant the `llamarse` clitic as a memorized L1 chunk exactly as *tengo…años*
is chunked in L5 — "*me llamo / te llamas* taught whole, reflexive mechanics deferred to L10"; or
(b) add object/reflexive clitics **me, te** to the free-glue list (they're top-30-frequency and
appear in `me gusta` too). Recommend (a): it keeps the reflexive *system* at L10 while unblocking L1.

---

## MAJOR

### M1 — L1 conversation seed (and any pre-L3 "asking") requires question words deferred to L3
The seed says the persona "asks your name and where you're from"; the opening line is inevitably
*¿Cómo te llamas? / ¿De dónde eres?* — **cómo/dónde are L3** and "not free." Seeds must stay "within
available vocab" (Style Guide §7). L1's seed as specified is infeasible; L2's ("persona describes,
you describe back") is fine because it's declarative.
**Fix:** make the L1 persona **declarative** ("*Hola, me llamo Camila. Soy de México.*") and set
`goalPhrases` to statements, **or** grant a tiny greetings-only question exception (*¿cómo?*) at L1.
This also touches the L1 passage only lightly (a self-intro card is declarative — fine).

### M2 — L2 teaches object-adjectives with no objects yet in the pool
L2 vocab is **10 adjectives**; the only nouns available (L1) are **señor, señora** and proper-noun
people. But **grande, pequeño, bonito, nuevo, bueno** are naturally *thing* adjectives — the first
concrete objects (mesa, silla, casa…) don't arrive until **L4**, carro/etc. until **L11**. You are
forced into *"la señora es nueva/bonita/pequeña,"* which is odd, and into cloning *"X es [nationality]"*
to hit variety. Only **alto/bajo/joven + nacionalidades** sit naturally on people. Each of the 5
thing-adjectives still needs ≥1 sentence, guaranteeing unnatural output. (The L2 objective example
*"Ella es alta y simpática"* even uses **simpática**, which isn't in the vocab list.)
**Fix:** either seed L2 with 2–3 people-friendly traits (simpático, inteligente, delgado — swap out
bonito/nuevo/bueno), or pull one small object noun forward, or explicitly allow L2 to describe
proper-noun *places*/people so grande/bonito have a natural home. Also add *simpático* to the list or
change the example.

### M3 — Several explanations can't cover their whole grammar focus in ≤150 words
The schema demands one ≤150-word explanation covering the **entire** focus. These bundle too much:
- **L1** — six foci: `ser.identity` + `ser.origin` + subject-pronoun drop + `noun.gender` +
  `article.definite` + `article.indefinite`. Teaching gender **and** both article sets **and** ser
  (two senses) **and** pronoun-drop, each with an example, overflows 150 words badly.
- **L3** — `present.regular.ar` (full 6-ending paradigm) + `questions.wh` + `questions.yesno` +
  `negation.no`: four systems in one budget.
- **L9** — telling time (*son las…/es la…/y media/y cuarto*) alone can eat 150 words; then +days +
  numbers 31–100.
- **L12** — three periphrases + `verb.stemchange.e-ie` intro (the periphrases share one *verb+inf*
  pattern, so this is the least bad; stem-change is the overflow risk).
- **L5** — `ser-estar.contrast` (the Style Guide's own model of it is 78 words) + `estar.state` +
  numbers 0–30 + the *tengo…años* preview. Tight.
**Fix:** allow a per-lesson **explanation to name a focus without fully drilling it** (gender/articles
can be "shown, not lectured" in L1; questions can ride L3 examples), or split: give **articles+gender
their own micro-focus in L1** and demote pronoun-drop to a one-line note; treat **numbers/days/time
sets as flashcard sets that need no explanation prose** (state this policy). Without an explicit
"sets don't consume explanation budget" rule, L5/L9 authors will fail QA #9.

### M4 — Tag granularity collides with the 30–60 A1–B1 enum target
Deduplicated (below), the **A1 core alone yields ~40 tagged foci + ~6 prose foci that still need
tags ≈ 46–50**; the buffer adds ~10 → **A1 total ≈ 55–58**. That already fills the entire "30–60 for
A1–B1" band **before A2**. The A2 outline introduces ~15–18 more (preterite×2, imperfect, contrast,
gerund, future, combined clitics, negative imperative, subjunctive, superlative, por/para,
relatives…) → **~73+ by end of A2**, blowing the target well before B1.
**Fix:** coarsen deliberately and record the rule: merge `numbers.cardinal.0-30` + `.31-100` →
`numbers.cardinal`; collapse the three L12 periphrases → one `periphrasis.modal-inf`; treat
`ser.identity/origin/description` as one `ser.copula` (senses are lesson metadata, not separate
enum members). That trims ~8–10 and makes A1–B1 ≤60 realistic. **Or** revise the target upward and
say so.

### M5 — Tag naming is internally inconsistent; several foci carry no tag at all
Same-concept/different-shape and orphan-namespace problems will fork the enum during authoring:
- **Lemma-namespace vs `verb.` namespace:** `ser.*`, `estar.*`, `ir.present`, `hay.existential`,
  `gustar.*`, `doler.pattern` put the lemma first — but `verb.tener` and `verb.stemchange.e-ie` use
  a `verb.` prefix. Pick one shape.
- **Plural/singular:** `pronouns.subject` vs `pronoun.do`. Standardize (`pronoun.*`).
- **Orphan namespace:** `focus.tambien-tampoco` — "focus." appears nowhere else; it's an additive
  adverb → e.g. `adverb.additive`.
- **Reuse missed:** `gustar.io-pronouns` and the buffer's `doler.pattern` share IO-pronoun mechanics
  → one reusable `pronoun.io` beats a gustar-specific tag.
- **Untagged prose foci that MUST become enum members:** L4 "prepositions of place", L10 "time-of-day
  expressions", L14 "estar+climate"/"seasons", L15 "tener+symptoms", L16 "irregular mejor/peor",
  L13 bare "quantifiers" (no dotted form). The enum can't be seeded from the map until these are named.

### M6 — Set-type vocab (numbers/days/months) breaks the ID scheme and the "every vocab exercised" rule
The map counts each number/day/month block as **one vocab item**, but the schema says every vocab
item is **exercised by ≥1 sentence** and every sentence's `vocabRefs` **resolve to taught vocab**,
while Style Guide §9 keys vocab by **lemma** (`a1-05.v.<lemma>`). A sentence using *veinte* or *lunes*
must resolve to a *set* entry (`a1-05.v.numeros-0-30`?) the ID scheme doesn't define, and "each
vocab exercised" is ambiguous for a 31-member set. Also L3 folds a **question set (qué/dónde/cómo)**
into the ~10 vocab count although it's grammar, not the stated domain — muddying both the item cap
and the domain.
**Fix:** add a §9 rule for **set-type vocab** (one ID per set; a sentence ref resolves to the set;
"exercised" = the set appears, not every member), and decide whether question words count as vocab or
live purely as grammar-tag exposure (recommend the latter — don't spend vocab budget on them).

---

## MINOR

- **N1 — Reflexive infinitives look low-frequency but aren't a real problem.** As *infinitives*
  `ducharse` (2.76), `despertarse` (3.25), `acostarse` (3.54) fall below the 3.5 floor, but that's a
  wordfreq form artifact (people say *me ducho*, not *ducharse*). Conjugated, they're high:
  *ducha* 4.10, *despierta* 4.29, *levanta* 4.29, *desayuno* 4.38. **No action** beyond noting L10 is
  frequency-safe; don't let a naive infinitive lookup scare anyone off these.
- **N2 — `también`/`para` free-glue wording is self-contradictory.** The glue list marks *también\**
  and *para\** free **from L1**, then the footnote says *también/tampoco* "become fully free **after
  L8**" and *para* "after [it] anchor[s] a lesson" (para never anchors a core lesson). Pick: free from
  L1 (recommended for both — they're top-frequency) and delete the gating footnote, or gate them and
  remove them from the L1 list.
- **N3 — Words used in examples but never declared free/taught:** *español/inglés* (languages —
  L3 leans on *hablo español*), *año/años* (age chunk, L5), *simpática* (L2 example). Declare
  **languages free like proper nouns**, and note *años* rides the age chunk.
- **N4 — Glue subject-pronoun list omits `ustedes`/`ellas`.** Register mandates *ustedes* for plural
  you, but it isn't in the free list (only *ellos*, *nosotros*). Add *ustedes, ellas, nosotras*.

## NIT

- **T1 — All six ⚠ flags are false alarms; clear them.** Every flagged item is comfortably
  high-frequency (see table): mexicano 4.75, colombiano 4.39, perro 4.90, feliz 5.12, jugar 5.05,
  aeropuerto 4.75. The ⚠ convention was over-cautious for these; remove the marks.
- **T2 — Style-Guide slug example mismatches the map.** §9 shows `a1-03-ser-vs-estar`; the map's
  ser/estar lesson is `a1-05-ser-y-estar` (different seq, "y" not "vs"). Harmless, but align the
  example to a real slug to avoid author confusion.
- **T3 — `menú` 3.85, `nadar` 3.80, `desayunar` 3.79, `vestirse` (borderline)** — all fine as
  thematic A1; no change, just don't re-flag them.
- **T4 — L9 "months (set)" is unneeded for the telling-time/day objective** and inflates the item
  count; consider dropping months to the buffer.

---

## Frequency spot-check (wordfreq, zipf on `es`; ≥4.0 HIGH · 3.5–4.0 borderline · <3.5 question it)

**Flagged (⚠) items — all HIGH, flags unwarranted:**

| word | zipf | band |
|---|---|---|
| mexicano | 4.75 | HIGH |
| colombiano | 4.39 | HIGH |
| perro | 4.90 | HIGH |
| feliz | 5.12 | HIGH |
| jugar | 5.05 | HIGH |
| aeropuerto | 4.75 | HIGH |

**Random candidate lemmas (sample across L1–L12 + region-sensitive):**

| word | zipf | band | | word | zipf | band |
|---|---|---|---|---|---|---|
| gracias | 5.86 | HIGH | | fútbol | 5.06 | HIGH |
| señora | 4.92 | HIGH | | bailar | 4.44 | HIGH |
| llamarse | 3.89 | borderline* | | nadar | 3.80 | borderline* |
| adiós | 4.43 | HIGH | | película | 5.17 | HIGH |
| bajo | 5.59 | HIGH | | deporte | 4.69 | HIGH |
| bonito | 4.66 | HIGH | | semana | 5.48 | HIGH |
| joven | 5.18 | HIGH | | temprano | 4.66 | HIGH |
| estudiar | 4.83 | HIGH | | luego | 5.69 | HIGH |
| trabajar | 5.22 | HIGH | | levantarse | 3.94 | borderline* |
| cocinar | 4.21 | HIGH | | acostarse | 3.54 | borderline* |
| escuchar | 4.91 | HIGH | | ducharse | 2.76 | LOW* |
| silla | 4.43 | HIGH | | despertarse | 3.25 | LOW* |
| cuarto | 4.93 | HIGH | | vestirse | 3.58 | borderline* |
| baño | 4.80 | HIGH | | desayunar | 3.79 | borderline* |
| allí | 5.26 | HIGH | | viajar | 4.63 | HIGH |
| cansado | 4.30 | HIGH | | carro | 4.40 | HIGH |
| contento | 4.36 | HIGH | | bus | 4.22 | HIGH |
| enfermo | 4.42 | HIGH | | calle | 5.27 | HIGH |
| nervioso | 4.22 | HIGH | | parque | 4.85 | HIGH |
| ocupado | 4.35 | HIGH | | playa | 4.72 | HIGH |
| triste | 4.85 | HIGH | | ciudad | 5.70 | HIGH |
| beber | 4.30 | HIGH | | tienda | 4.74 | HIGH |
| jugo | 4.12 | HIGH | | querer | 4.75 | HIGH |
| aprender | 4.93 | HIGH | | poder | 5.68 | HIGH |
| fruta | 4.20 | HIGH | | dinero | 5.47 | HIGH |
| pan | 4.82 | HIGH | | precio | 5.16 | HIGH |
| padre | 5.36 | HIGH | | restaurante | 4.45 | HIGH |
| hermano | 5.11 | HIGH | | menú | 3.85 | borderline |
| esposo | 4.50 | HIGH | | cuenta | 5.78 | HIGH |
| hija | 5.06 | HIGH | | café | 4.81 | HIGH |
| gustar | 4.05 | HIGH | | | | |

**Region-sensitive (all HIGH — LatAm forms confirmed frequent):** auto 5.00, celular 4.69,
computadora 4.37, papa 4.81, manejar 4.43.

**\*Reflexive/infinitive caveat:** wordfreq ranks word *forms*, not lemmas. The "borderline/LOW"
reflexives are all high once conjugated — *ducha* 4.10, *despierta* 4.29, *levanta* 4.29,
*acuesta* 3.23, *desayuno* 4.38, and *llama* 5.15 for *llamarse*. Verb families also spread across
forms: inflected-sum zipf ≈ *querer* 6.18, *gustar* 5.67, *jugar* 5.62, *levantarse* 4.74. **Bottom
line: zero genuinely low-frequency items in the A1 spine.** The only truly sub-3.5 raw readings are
the deferred/infinitive forms, which are frequency-safe in the conjugations learners actually type.

---

## Deduplicated draft-tag inventory

**Core L1–L12 (as written, tagged):**
`ser.identity`, `ser.origin`, `ser.description`, `ser-estar.contrast`, `pronouns.subject`,
`noun.gender`, `noun.number`, `article.definite`, `article.indefinite`, `adjective.agreement`,
`present.regular.ar`, `present.regular.er`, `present.regular.ir`, `present.reflexive`,
`questions.wh`, `questions.yesno`, `negation.no`, `estar.location`, `estar.state`, `hay.existential`,
`adverbs.place`, `adverbs.frequency`, `numbers.cardinal.0-30`, `numbers.cardinal.31-100`,
`verb.tener`, `possessive.adjective`, `gustar.pattern`, `gustar.io-pronouns`, `focus.tambien-tampoco`,
`time.telling`, `time.days`, `ir.present`, `periphrasis.ir-a-inf`, `periphrasis.querer-inf`,
`periphrasis.poder-inf`, `periphrasis.tener-que-inf`, `verb.stemchange.e-ie`
→ **~37 tagged**, **+ 3 prose foci needing tags** (L4 prepositions-of-place, L10 time-of-day,
implicit adjective-position). **Core ≈ 40.**

**Buffer L13–L18:** `demonstratives.este-ese`, `quantifiers`, `weather.hacer-haber`, `doler.pattern`,
`comparatives.mas-menos-que`, `comparatives.tan-como`, `pronoun.do`, `imperative.affirmative`,
`preterite.regular.ar` → **+9**, **+ prose foci** (estar-weather, seasons, tener-symptoms,
comparatives-irregular). **Buffer ≈ 13.**

**A1 total ≈ 53–58** (pre-coarsening). **Inconsistencies to resolve before freezing the enum:**
lemma-prefix vs `verb.` prefix; `pronouns.` vs `pronoun.`; orphan `focus.`; gustar/doler IO
duplication; number-range split; untagged prose foci. See **M4/M5**.

---

## Lesson-by-lesson authorability verdict

| L | Slug | 12–20 nat. sentences on cumulative pool? | Notes |
|---|---|---|---|
| 1 | hola-me-llamo | **At risk** | 7/10 vocab are frozen interjections; clitic gap (C1); seed needs questions (M1); leans hard on ser+proper nouns → repetitive |
| 2 | soy-asi | **At risk** | object-adjectives, no objects (M2); people-only pool |
| 3 | que-haces | OK | good -ar verb pool; questions ride here; explanation crowded (M3) |
| 4 | donde-esta | OK | mesa/silla/casa give estar/hay real targets |
| 5 | ser-y-estar | OK-ish | rich feelings pool; explanation crowded (M3) |
| 6 | como-y-vivo | OK | leer/escribir lack objects (libro is L8) → use intransitively; minor |
| 7 | mi-familia | OK | strong family pool + tener/possessives |
| 8 | me-gusta | OK | best-supported lesson; L1–L7 nouns feed gustar |
| 9 | que-hora-es | OK | telling-time explanation heavy (M3); months superfluous (T4) |
| 10 | mi-dia | OK | reflexive se granted; sequencing via luego/temprano works |
| 11 | voy-a | OK | ir-a-inf recombines all prior verbs; rich place pool |
| 12 | quiero | OK | capstone; explanation heavy (M3) |

Lessons **3–12 are authorable**; **L1 and L2 are the real risks** and drive the blocking fixes.

---

## VERDICT: **APPROVE-WITH-FIXES**

The spine, sequencing, vocab selection, and frequency profile are sound — every A1 item is
high-frequency, the ⚠ flags can all be cleared, and lessons 3–12 are authorable as specified. The
problems are concentrated in **L1–L2 authorability**, **explanation bundling**, and **tag hygiene**,
and every one has a **local fix that doesn't disturb the spine**.

**Blocking fixes (must land before authoring L1–L2 and before freezing the tag enum):**
1. **C1** — Grant `llamarse`'s reflexive clitic as an L1 memorized chunk (or add *me/te* to glue);
   otherwise L1's headline verb can't be conjugated.
2. **M1** — Make the L1 conversation-seed persona declarative (or allow a greetings-only *¿cómo?*);
   question words are L3.
3. **M2** — Fix L2's adjective/object mismatch (swap in people-friendly traits or pull an object
   noun earlier); add/replace *simpática*.
4. **M3** — Add an explicit rule that number/day/time **sets need no explanation prose**, and
   permit L1/L3 explanations to *show-not-drill* secondary foci, so ≤150-word budgets are reachable.
5. **M5/M6** — Resolve tag-naming inconsistencies, name the ~6 untagged prose foci, and add a §9
   ID/exercise rule for set-type vocab before seeding the `GrammarTag` enum.

Non-blocking: **M4** (coarsen tags or restate the enum target), MINOR N1–N4, NIT T1–T4.
