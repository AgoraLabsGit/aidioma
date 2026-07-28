# Curriculum Map — Adversarial Pedagogy Review

**Reviewer stance:** SLA specialist, adversarial. Scope: `curriculum/CURRICULUM-MAP.md` checked
against `research/{pcic-a1-inventory,cefr-a1-descriptors,oer-textbook-sequencing}.md` and
`style/STYLE-GUIDE.md`. App constraints treated as fixed (typed EN→ES from L1; ~10 vocab/lesson;
12–20 sentences, every vocab item exercised; sentences use only current+prior vocab + glue;
mastery-gated linear spine; neutral LatAm, `tú`).

Findings are ordered by severity. Each: **what · where · why · fix.**

---

## CRITICAL

### C1. L10 teaches three stem-changing reflexives whose morphology isn't taught until L12
**Where:** `a1-10-mi-dia`, vocab list — *despertarse, acostarse, vestirse* (alongside regular
*levantarse, ducharse, desayunar*).
**What:** *despertarse* is e→ie (*me despierto*), *acostarse* is o→ue (*me acuesto*), *vestirse* is
e→i (*me visto*). Stem-change morphology is not introduced until **L12**, and even there only
`verb.stemchange.e-ie`. So L10 requires the learner to *type-produce* `me despierto`, `me acuesto`,
`me visto` — irregular forms they cannot derive. A recognition app could absorb this; a
**production-typing** app cannot. This is exactly the "produce accented irregular forms from
scratch" load the map rightly used to justify deferring the preterite — but it slipped into L10
unnoticed. 3 of the lesson's 6 verbs are affected.
**Why it matters:** Mastery-gating means the learner is blocked on morphology the spine hasn't
delivered. Every leaked-morphology sentence is unfair or teaches a guess. It also undercuts the
map's own strongest design principle (defer heavy production morphology).
**Fix (blocking):** Restrict L10 to **regular** reflexives — e.g. *levantarse, ducharse, bañarse,
lavarse, peinarse, afeitarse, maquillarse, desayunar* (all regular; more than enough for a morning
routine). Move *despertarse / acostarse / vestirse* to A2 (after stem-changes), or admit them **only
as explicitly-flagged fixed chunks** with hints that hand over the stem vowel. Do not present them as
if derivable from `present.reflexive`.

---

## MAJOR

### M1. L3's -ar verbs are object-hungry, but the cumulative lexicon has no objects yet
**Where:** `a1-03-que-haces` — vocab *hablar, estudiar, trabajar, tomar, mirar, escuchar, comprar,
cocinar*; functional-goal example "*Trabajo en una tienda.*"
**What:** By L3 the available common-noun stock is essentially empty: L1 is greetings, L2 is
adjectives/nationalities. The first food/object nouns arrive at **L4** (casa, mesa…) and **L6**
(pan, agua…). Yet *comprar, cocinar, tomar, mirar, escuchar* are transitive verbs that want a direct
object. With only prior vocab you can write *Hablo mucho / Estudio bien / ¿Dónde trabajas?* but you
cannot naturally write *compro ___, cocino ___, tomo ___, miro ___, escucho ___* — there is nothing
to buy, cook, drink, watch, or listen to. The map's **own example already leaks** *tienda*, which is
not introduced until **L11**. The rule "every vocab item exercised by ≥1 sentence" is barely
satisfiable here and forces either adverb-only filler or leaks.
**Why it matters:** This is a hard authorability failure baked into the vocab selection, not an
authoring slip. It will pressure authors to smuggle words in (the exact QA#6 violation the map
warns against).
**Fix (blocking):** Reselect L3 verbs toward ones that read naturally intransitively/with glue
adverbs and question words (*hablar, estudiar, trabajar, escuchar* + *necesitar/descansar* type),
and **defer object-hungry verbs to their domain lessons**: *cocinar* → L6 (food), *comprar* → L12
(shopping), *tomar* → L6 (drinks). Fix the example to avoid *tienda*.

### M2. L9 cognitive overload — confirmed, worse than the self-flag suggests
**Where:** `a1-09-que-hora-es`. Grammar `time.telling` + `time.days` + `numbers.cardinal.31-100`;
vocab hora/minuto/día/semana/hoy/mañana/tarde/noche **+ days-of-week (set) + months (set)**.
**What:** Counting sets as "one item" hides the real load. The raw learnable payload is: 8 time
nouns + 7 weekday names + **12 month names** + ~70 new number words + telling-time conventions
(*son las…, y media, y cuarto, menos*). Months are the worst offender: 12 low-frequency items that a
beginner almost never needs to *type-produce* at A1, dumped in one lesson. This is far past the raw
15-item ceiling; the "each block = one set" accounting is masking a genuine violation.
**Why it matters:** The densest node on the spine sits right before another dense lesson (L10), and
mastery-gating means learners stall here.
**Fix (blocking):** **Cut months from the core.** They belong with seasons in buffer **L14
(weather/seasons)**, or as recognition-only flashcards, not typed production. Keep L9 = time nouns +
parts of day + weekdays + numbers 31–100 + telling time. That single move brings L9 to a sane load.
Optionally split numbers 21–100 into L9 and keep only 0–20 at L5 (see N1).

### M3. Grammar-tag namespacing is inconsistent — same concept, three schemes
**Where:** §1 grammar-focus lines across lessons.
**What:** A verb's present tense is tagged three incompatible ways:
- lemma-first: `ser.identity`, `estar.location`, `ir.present`, `gustar.pattern`
- `verb.`-prefixed: `verb.tener`, `verb.stemchange.e-ie`
- tense-first: `present.regular.ar / .er / .ir`, `present.reflexive`

So "tener's present" (`verb.tener`) and "ir's present" (`ir.present`) and "regular -ar present"
(`present.regular.ar`) share no common parent. Also untagged grammar appears in prose: L4
"prepositions of place", L10 "time-of-day expressions" have no tag.
**Why it matters:** The tags seed the `GrammarTag` enum used to **track learner weakness**. Without
a consistent parent you cannot roll up "weak at present-tense verbs" or "weak at copulas" — the whole
diagnostic value of the hierarchy is lost. Granularity is also uneven (`ser` split into
identity/origin/description/state/contrast — good; every other verb is a single flat tag).
**Fix (blocking):** Adopt one scheme. Recommended: `verb.{lemma}.{feature}` for irregulars
(`verb.ser.identity`, `verb.estar.location`, `verb.tener.present`, `verb.ir.present`,
`verb.gustar.pattern`), `verb.regular.{ar,er,ir}.present`, `verb.reflexive.present`,
`verb.stemchange.{e-ie,o-ue,e-i}`. Give every prose-only grammar point a real tag. Re-scan all 18
lessons for one-concept-one-tag after the rename.

### M4. Semantic-cluster interference — antonym pairs and synonym clusters taught within one lesson
**Where:** L2 (*alto/bajo*, *grande/pequeño*); L5 (7-adjective mood cluster incl. *contento*≈*feliz*
synonyms); L10 (*levantarse/acostarse*, *siempre/nunca*); minor in L4 (*aquí/allí*).
**What:** SLA evidence (Tinkham 1993/97; Waring 1997; Erten & Tekin 2008; Nation) is consistent:
presenting **same-category synonyms, antonyms, and co-hyponyms simultaneously** depresses initial
learning and produces cross-association errors ("was *alto* tall or short?"), because the items share
form-class, syntax, and meaning-space and interfere at encoding. L2 teaches **two full antonym
pairs** at once; L5 stacks 7 near-synonymous moods **including a true synonym pair** (*contento* /
*feliz*); L10 pairs *siempre/nunca*.
**Why it matters:** In a flashcard + production app, cross-association errors are precisely the
failure mode this interference predicts, and they persist. This is partly inherent to a
thematic-domain curriculum, but the antonym/synonym offenders are avoidable.
**Fix (strongly recommended, near-blocking):** Don't teach both members of an antonym pair in the
same lesson — keep *alto*, *grande* in L2; move *bajo*, *pequeño* one lesson later (or teach one and
gloss the other). Trim L5's mood set to ~5 and **drop the synonym *feliz*** (keep *contento*). Split
*siempre/nunca* if feasible. General authoring rule: within a lesson's ~10, avoid same-class direct
opposites and true synonyms.

---

## MINOR

### m1. Missing apology formula — a genuine A1 can-do gap
**Where:** L1 vocab (hola/adiós/gracias/por favor/… — no apology term).
**What:** PCIC A1 function **"disculparse"** is ✅ A1, and CEFR can-do #7 ("express a basic apology")
is on the research list, yet *perdón / lo siento* appears in **no core lesson**. It's among the
highest-frequency courtesy formulas a beginner needs.
**Fix:** Add *perdón* (and/or *lo siento* as a chunk) to L1's courtesy set.

### m2. Leaks in illustrative examples signal authoring traps
**Where:** L7 "*Mi madre es doctora*" (professions/*doctora* are never taught — coverage table itself
defers work/professions to A2); L12 "*¿Cuánto cuesta?*" (*costar* is not a vocab item — *precio* is —
and it's an o→ue stem-changer).
**Why:** The map's examples are the authoring template; leaked examples will be copied into leaked
sentences.
**Fix:** Rewrite examples to stay inside available vocab (*Mi madre es alta*; *¿Cuánto es?*), or add
the needed items explicitly.

### m3. `bien` / `mal` double-listed as L5 vocab but already free glue
**Where:** L5 vocab includes *bien, mal*; the glue list (degree/quantity adverbs) already frees
*bien, mal* from L1.
**Fix:** Remove them from the L5 count (they're glue), freeing budget for the mood trim in M4.

### m4. Coverage-table overclaims
**Where:** §6. "Artículo (def/indef, **contractions**) ✓ L1" — but L1's grammar focus lists only
`article.definite`/`article.indefinite`; the **al/del contraction is not in any lesson's grammar
focus** and is never anchored. Separately, the glue note flags *para*/*porque* as "free after they
anchor a lesson," but **no core lesson anchors them**, so they never actually become available in the
core (fine if unused, but the note implies otherwise). Prep-pronoun *mí* is marked deferred yet is
needed by L8's *a mí me gusta*.
**Fix:** Either add al/del to L1 (or the first lesson that needs it) and mark contractions honestly,
or drop the "contractions ✓ L1" claim. Decide whether *para+inf* / *porque* get a core anchor or are
explicitly A2 (CEFR supports A2; PCIC says A1 — pick and state it).

### m5. L12 tags only e→ie but introduces an o→ue verb
**Where:** L12 grammar `verb.stemchange.e-ie` (intro), vocab *poder*.
**What:** *querer* is e→ie (*quiero*) ✓, but *poder* is **o→ue** (*puedo*) — not covered by the
e→ie tag. Learners must type *puedo*.
**Fix:** Add `verb.stemchange.o-ue`, or teach *puedo* as a flagged chunk and say so.

### m6. First-lesson calibration lacks an explicit Pre-A1 on-ramp
**Where:** L1 objective = write a full self-introduction (name + origin).
**What:** Per the CEFR research, freely producing a full sentence is **already solid A1, not
Pre-A1**; the recommended on-ramp is single high-frequency words → 2–3-word set phrases → full
sentence. The Style-Guide difficulty rubric (1–5) permits this spread, but the map doesn't **mandate**
that L1's earliest items be Pre-A1-flavoured, and it asks for accented output (*adiós*) on the very
first day of typing Spanish.
**Fix:** Require L1 to open with difficulty-1 unaccented single words/set phrases (*hola, gracias,
señor, soy Ana*) before the full "*Soy de México*" sentence. **Combine with the cognate point below**
to deliver the first-typing confidence win.

---

## Attack on the three "riskiest calls"

**(a) No preterite in the core (→ L18 taste, full in A2): DEFENSIBLE — approve.** The three reasons
are sound *specifically because* the app is typed production: accented preterite morphology
(*hablé, comió*) is heavy to produce (not recognize); `ir a + inf` (L11) buys future expressivity
from infinitives already owned; the ~10-vocab cap would be entirely eaten by morphology. Deviating
from Madrigal is safe — Madrigal is the documented outlier. **No change.** (Irony: the same logic
convicts C1 — L10's stem-changing reflexives violate exactly this principle.)

**(b) ser/estar split-then-contrast (L1→L4→L5): DEFENSIBLE — approve, and correct for the
modality.** For a production app the learner must *generate* the right copula, so bundling three
copulas (SpanishDict's trio) or hay/ser/estar (Aula) forces an un-makeable choice and blows the
budget. Staging — `ser` automated over L1–2, `estar` on the unambiguous case (location, L4), contrast
as the explicit L5 objective — matches the field majority (Vistas) and the mechanics. **No change.**

**(c) Cognate bootstrapping woven in, not a lesson: DECISION defensible, EXECUTION too thin.**
Skipping a full ordinal is reasonable across only 12 slots. But "weave cognate confidence into L1–L3
sentence selection" is under-specified and, worse, **L1–L3's actual vocab is not cognate-rich**
(hablar, trabajar, cocinar, comprar, mirar, escuchar are not cognates; the greetings aren't either).
So the claimed technique has almost nothing to bite on where it's promised. The cognate win (learner
types near-identical *-ción/-al/-ble* words for an instant confidence hit) is precisely the Pre-A1
on-ramp L1 is missing (m6). **Fix:** either commit concretely — a short cognate-rule explanation atom
in L1 + a deliberate cognate-heavy quota in the first ~10 sentences — or drop the claim. Committing
solves m6 and c(c) together; not blocking, but a clear win.

---

## NITs

- **N1.** L5 is nearly as dense as L9: ser/estar **contrast** (the single hardest A1 concept) + 0–30
  + 7 moods + *tener* age-chunk. Consider moving 21–100 wholly to L9 and trimming moods (M4) to
  lighten it.
- **N2.** L1's *me llamo* is a reflexive-pronoun chunk taught before reflexive grammar (L10). Fine as
  a memorized chunk, but note it against the "reflexive `se` not free until L10" glue rule so authors
  don't over-generalize.
- **N3.** *mañana* is polysemous (tomorrow / morning), introduced L9 and reused L11 (*viajar mañana*)
  — add an author note.
- **N4.** Subject-pronoun glue list omits *ustedes* (the register's plural "you") and feminine
  *ella*/*ellas* is partial; align with the LatAm `ustedes` register.
- **N5.** The research's suggested enum names are SCREAMING_SNAKE (`SER_VS_ESTAR`); the map uses
  dotted.lowercase. Harmonize the docs so the enum source of truth is unambiguous (map wins, but say
  so).

---

## VERDICT: APPROVE-WITH-FIXES

The spine is fundamentally sound: the field-consensus order is respected, the three headline bets
(no preterite, staged ser/estar, no cognate slot) are the right calls for a typed-production app, and
CEFR/PCIC coverage of the 12 objectives is genuinely strong (only *disculparse* and address/profession
are thin). But several defects are load-bearing and must be fixed before authoring.

**Blocking fixes:**
1. **C1** — remove/repackage L10's stem-changing reflexives (*despertarse/acostarse/vestirse*);
   morphology not yet taught, unproducible in a typing app.
2. **M1** — reselect L3's -ar verbs; object-hungry verbs have no legal objects yet (and the example
   leaks *tienda*).
3. **M2** — de-load L9: cut months from the core (→ buffer L14 / recognition-only).
4. **M3** — unify the grammar-tag scheme (`verb.{lemma}.{feature}` + `verb.regular.*`); tag the
   prose-only points; re-scan all 18 lessons.
5. **M4** — split same-lesson antonym pairs (L2, L10) and trim/de-synonym L5's mood cluster
   (drop *feliz*). *(Strongly recommended; treat as blocking for the affected lessons.)*

**Should-fix before authoring (non-blocking):** m1 (add *perdón*), m2 (fix leaked examples), m3
(drop *bien/mal* from L5 count), m4 (coverage-table honesty on contractions & *para/porque*), m5
(tag *poder* o→ue), m6 + c(c) (add a Pre-A1/cognate on-ramp to L1).
