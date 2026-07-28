# AIdioma Curriculum Map — CEFR A1 Spine (+ A2/B1/B2 outline)

> The canonical scope-and-sequence for AIdioma. Single linear spine, ordered by ordinal; each lesson
> assumes mastery of **all** prior lessons' vocab and grammar (mastery-gated unlock). App modality at
> launch: **typed EN→ES translation + flashcards** — so every objective is production-oriented, and
> every vocab item must be exercisable by short typed sentences.
>
> **Framework backbone:** PCIC A1 inventories 2 (grammar), 5 (functions), 9 (nociones específicas),
> filtered to what 12 lessons of typed production can carry; CEFR A1 can-do statements phrase the
> objectives. Register: neutral LatAm Spanish, `tú` / `ustedes`, no `vosotros`. Content 100% original.
>
> **Grammar tags** below (dotted, hierarchical) seed the `GrammarTag` enum in **one unified scheme**
> (see **§7 Tag Appendix** — the enum's source of truth). Tags are stable: introduced once, reused,
> never renamed. Each grammar-focus line marks **primary** foci (drilled) vs **secondary**
> (shown-not-drilled — see the explanation-budget policy). Vocab are **candidate** lemmas; a full
> frequency spot-check (`research/map-review-practicality.md`) cleared every A1 item, so ⚠ flags are removed.

---

## Glue-vocabulary policy (read before authoring any lesson)

Cumulative-vocab discipline (Style Guide §3, QA #6): a sentence may use only content words from the
**current or a prior** lesson. To keep early lessons writable, these **function words are "free glue"
— available from Lesson 1, never counted against the ~10-item budget**, taught implicitly through
sentences (and flagged once in the L1 explanation):

- **Articles:** el, la, los, las, un, una, unos, unas
- **Connectors:** y, o, no, sí, también*, pero, ni
- **Prepositions:** de, en, a, con, para*, por
- **Degree/quantity adverbs:** muy, más, poco, mucho, bien, mal
- **Time adverbs:** hoy (high-frequency; more added per lesson as needed)
- **Subject pronouns:** yo, tú, él, ella, nosotros, nosotras, ustedes, ellos, ellas (Spanish drops them; `ustedes` is the register's only plural *you*).
- **Proper nouns & language names:** country/city/person names and *español/inglés* are free (no new grammar).

*`también`/`tampoco` and `para` are free from L1 (top-frequency); the earlier "free only after L8 /
after anchoring" gate is dropped as self-contradictory.* **Not free** until their lesson: question
words (L3), reflexive `se` (L10), demonstratives (buffer). **Number policy:** each cardinal block =
**one vocab set**, not N items (one lemma-keyed ID per member for grading; see §7 / Style Guide §9).

**Fixed-chunk mechanism (full rule in Style Guide §2).** A few inflected/multi-word expressions are
taught **whole, as memorized chunks** before their grammar is formalized — flagged CHUNK on the lesson
row, never derivable, granting **no** underlying grammar. Sanctioned A1 chunks:
**`me llamo`/`te llamas`/`se llama`** (L1 — `llamarse`'s clitic can't wait for L10),
**`tengo … años`** (L5 age), **`me gusta`** (before L8).

---

## Explanation-budget policy (full rule in Style Guide §2/QA #9)

The ≤150-word explanation can't cover four systems, so each lesson row is annotated **Primary** vs
**Secondary**: prose drills the **primary** focus (rule + 2–3 examples + contrast); **closed sets**
(numbers, days) get **no prose beyond one naming line**; **secondary** foci are **shown, not drilled**
(in examples, tagged, no prose). This lets L1 (was 6 foci) and L3/L5/L9/L12 (3–4 each) fit budget.

---

## 1. A1 CORE — Lessons 1–12 (full detail)

### `a1-01-hola-me-llamo` · Greetings & introducing yourself
- **Objective:** You can greet someone and write a simple introduction giving your name and where you're from.
- **Grammar focus:** **Primary** `verb.ser` (identity + origin). **Secondary** `article`, `agreement.gender-number`, `pronoun.subject`. **CHUNK:** `me llamo`/`te llamas`/`se llama` (reflexive deferred to L10).
- **Vocab domain:** Identity / social relations (PCIC 3 + Func. 5). **~10:** hola, adiós, gracias, por favor, perdón, buenos días, buenas noches, señor, señora, llamarse (chunk). (`ser` is grammar; proper nouns free; *lo siento* = optional apology chunk.)
- **Functional goal:** Greet, say goodbye, thank, apologize, introduce yourself: *Hola, me llamo Ana. Soy de México.*
- **Passage idea:** A three-line self-introduction card (name, origin, a courtesy line).
- **Conversation seed:** Meeting someone new; the persona **introduces herself declaratively** (*Hola, me llamo Camila. Soy de México.*) and you introduce yourself back — **no question words** (L3). `goalPhrases` are statements (*me llamo…*, *soy de…*, a greeting).
- **Prerequisites:** none (entry lesson). *Real dep: `ser` here underpins every later lesson.*

### `a1-02-soy-asi` · Describing people
- **Objective:** You can write short sentences describing what a person is like, with correct gender/number agreement.
- **Grammar focus:** **Primary** `agreement.gender-number` (adjective agreement). **Secondary** `verb.ser` (description sense, reused from L1).
- **Vocab domain:** Physical/personality traits + nationalities (PCIC 1, 2). **~10:** alto, joven, bonito, simpático, inteligente, delgado, amable, trabajador, mexicano, colombiano (nationalities are samples). *People-traits only (L2's nouns are people); thing-adjectives + antonym `bajo` deferred (cluster interference).*
- **Functional goal:** Describe appearance, nationality, and simple qualities: *Ella es alta y simpática.*
- **Passage idea:** A learner describes two friends (looks + nationality) in four short lines.
- **Conversation seed:** Persona describes a person; you describe one back (declarative — no questions).
- **Prerequisites:** L1 (`ser`). *Real dep: agreement rules reused every lesson with an adjective.*

### `a1-03-que-haces` · Saying what you do
- **Objective:** You can say what you and others do using regular -ar verbs, and ask a simple question about it.
- **Grammar focus:** **Primary** `verb.regular.ar`. **Secondary (shown-not-drilled)** `question.formation` (wh + yes/no), `negation`. Question words (qué/dónde/cómo) enter here as **grammar exposure, not vocab** — they don't spend the ~10-item budget.
- **Vocab domain:** Everyday actions / study & work (PCIC 6, 7). **~10:** hablar, estudiar, trabajar, escuchar, descansar, caminar, practicar, necesitar. *All read intransitively/with glue; object-hungry verbs deferred (cocinar/tomar→L6, comprar→L12).*
- **Functional goal:** State daily activities and ask about them: *¿Dónde trabajas? — Estudio y trabajo mucho.*
- **Passage idea:** Short "a normal day" paragraph of -ar actions (works, studies, speaks, buys).
- **Conversation seed:** Persona asks what you do (work/study); you answer and ask back.
- **Prerequisites:** L1–L2. *Real dep: the -ar pattern is the model for all later present tense.*

### `a1-04-donde-esta` · Saying where things and people are
- **Objective:** You can say where things and people are located and describe what a place contains.
- **Grammar focus:** **Primary** `verb.estar` (location), `verb.hay` (existential). **Secondary** `expression.place` (adverbs *aquí/allí* + prepositions of place *en/sobre/debajo de*).
- **Vocab domain:** Housing (PCIC 10). **~10:** estar, hay, casa, mesa, silla, cocina, baño, cuarto, aquí, allí.
- **Functional goal:** Locate objects and describe a home: *El baño está allí. Hay una mesa en la cocina.*
- **Passage idea:** A tour of a small apartment — where each room and object is.
- **Conversation seed:** Persona asks where things in the house are; you answer.
- **Prerequisites:** L1–L3. *Real dep: `estar` here sets up the L5 contrast.*

### `a1-05-ser-y-estar` · Being: identity vs. state
- **Objective:** You can choose between *ser* and *estar* to say who someone is versus how they feel right now, and use numbers to 30.
- **Grammar focus:** **Primary** `verb.ser-estar.contrast` (the single hardest A1 concept). **Secondary** `verb.estar` (state sense), `number.cardinal` (0–30 — closed set, one naming line, no prose). **CHUNK:** `tengo … años` (age; `tener` formalized L7).
- **Vocab domain:** Feelings & moods (PCIC 2) + numbers. **~10:** cansado, contento, triste, enfermo, ocupado, nervioso; numbers 0–30 (set). *`feliz` dropped (synonym of `contento`); `bien/mal` removed (glue).*
- **Functional goal:** Contrast permanent traits with current states and give ages/quantities: *Soy alta pero hoy estoy cansada. Tengo veinte años.* (tener previewed as a fixed age phrase; formalized L7.)
- **Passage idea:** "Today I feel…" — someone contrasts who they are with how they are today.
- **Conversation seed:** Persona asks how you are and how old you are.
- **Prerequisites:** L4 (needs both `ser` from L1 and `estar` from L4). *This is the pivot lesson — hard dep on L1 + L4.*

### `a1-06-como-y-vivo` · More actions: eating and living
- **Objective:** You can talk about eating, drinking, and everyday -er/-ir actions.
- **Grammar focus:** **Primary** `verb.regular.er-ir` (the two classes differ only in *nosotros*; taught together as one paradigm).
- **Vocab domain:** Food & drink (PCIC 5). **~10:** comer, beber, tomar, vivir, leer, escribir, aprender; pan, agua, jugo, fruta. (*tomar* arrives here with drinks.)
- **Functional goal:** Describe meals and routines with -er/-ir verbs: *Como pan y bebo jugo en la mañana.*
- **Passage idea:** What someone eats and drinks across a day.
- **Conversation seed:** Persona (waiter/friend) asks what you eat and drink; you answer.
- **Prerequisites:** L3–L5. *Real dep: completes the three regular conjugation classes with L3.*

### `a1-07-mi-familia` · Family and what you have
- **Objective:** You can write about your family and possessions using *tener* and possessive adjectives.
- **Grammar focus:** **Primary** `verb.tener`, `possessive`.
- **Vocab domain:** Family & relationships (PCIC 4). **~10:** tener, padre, madre, hermano, hermana, hijo, hija, esposo, amigo, perro.
- **Functional goal:** Introduce family and say what you have: *Tengo dos hermanos. Mi madre es alta.* (*doctora*/professions are A2 — keep examples in cumulative vocab.)
- **Passage idea:** A short family portrait (who they are, ages, what the family has).
- **Conversation seed:** Persona asks about your family; you describe members.
- **Prerequisites:** L1–L6. *Real dep: `tener` + `mi/tu/su`; ages reuse L5 numbers.*

### `a1-08-me-gusta` · Likes and interests
- **Objective:** You can say what you and others like and dislike, and agree with *también/tampoco*.
- **Grammar focus:** **Primary** `verb.gustar-type` (backwards gusta/gustan), `pronoun.io` (reused by `doler`). **Secondary** `adverb` (también/tampoco). Prep-pronoun *a mí/a ti* rides the `a mí me gusta` pattern.
- **Vocab domain:** Leisure & sports (PCIC 8). **~10:** gustar, música, película, deporte, fútbol, libro, jugar, bailar, cantar, nadar.
- **Functional goal:** Express likes/dislikes and preferences: *Me gusta el fútbol. A ti también te gusta.*
- **Passage idea:** Someone lists what they like and dislike doing in their free time.
- **Conversation seed:** Persona asks what you like; you answer and ask their likes.
- **Prerequisites:** L1–L7. *Real dep: `gustar` reuses IO pronouns + all prior nouns as liked things.*

### `a1-09-que-hora-es` · Time, days, and the calendar
- **Objective:** You can tell the time, name days and parts of the day, and use numbers past 30.
- **Grammar focus:** **Primary** `time.telling` (son las…/es la…/y media/y cuarto). **Secondary** `number.cardinal` (31–100 — closed set, one line). Days-of-week are a **vocab set** (not a grammar tag). *`mañana` is polysemous (tomorrow / morning) — author note.*
- **Vocab domain:** Time (PCIC nociones generales). **~10:** hora, minuto, día, semana, hoy, mañana, tarde, noche; days-of-week (set). *12 months cut → buffer L14 (recognition-only).*
- **Functional goal:** State times and days: *Son las tres. Hoy es lunes. Estudio en la mañana.*
- **Passage idea:** A weekly schedule — what happens on which day and at what time.
- **Conversation seed:** Persona asks the time and what day you do things.
- **Prerequisites:** L1–L8. *Real dep: telling time reuses `ser` (son las…) + numbers from L5.*

### `a1-10-mi-dia` · Daily routine
- **Objective:** You can describe your daily routine in order using reflexive verbs and time-of-day phrases.
- **Grammar focus:** **Primary** `verb.reflexive` (present). **Secondary** `adverb` (frequency/sequence: siempre/nunca/temprano/luego); time-of-day phrases reuse `time.telling` from L9.
- **Vocab domain:** Body actions / daily life (PCIC 1). **~10:** levantarse, ducharse, bañarse, lavarse, peinarse, afeitarse, desayunar, siempre, nunca, temprano, luego. *All **regular** — stem-changers `despertarse/acostarse/vestirse` removed (unproducible before A2 stem-changes).*
- **Functional goal:** Narrate a routine: *Me levanto temprano y luego desayuno.*
- **Passage idea:** "My morning" from waking to leaving the house, in sequence.
- **Conversation seed:** Persona asks about your morning; you narrate the steps.
- **Prerequisites:** L9 (needs time expressions). *Real dep: reflexive `se`; sequencing reuses L9 time phrases.*

### `a1-11-voy-a` · Plans and getting around
- **Objective:** You can say where you're going and what you're going to do using *ir* and *ir a + infinitive*.
- **Grammar focus:** **Primary** `verb.ir` (present), `periphrasis.ir-a-inf`.
- **Vocab domain:** Travel / places in town / transport (PCIC 14, 20). **~10:** ir, viajar, carro, bus, calle, ciudad, tienda, parque, playa, aeropuerto. (*tienda* introduced here.)
- **Functional goal:** Talk about destinations and near-future plans: *Voy a la playa. Voy a viajar mañana.*
- **Passage idea:** Weekend plans — where they're going and what they'll do there.
- **Conversation seed:** Persona asks your plans; you say where you're going and what you'll do.
- **Prerequisites:** L1–L10. *Real dep: `ir a + inf` recombines every prior verb as an infinitive.*

### `a1-12-quiero` · Wants, needs, and simple requests
- **Objective:** You can express what you want, can, or have to do, and make a simple request in a shop or café.
- **Grammar focus:** **Primary** `periphrasis.modal-inf` (querer/poder/tener que + inf — one shared pattern). **Secondary** `verb.stemchange` (querer e→ie, poder o→ue — flagged A2 preview; *quiero/puedo* given as hints).
- **Vocab domain:** Shopping & food service (PCIC 12, 5). **~10:** querer, poder, dinero, precio, café, comida, restaurante, menú, cuánto, cuenta.
- **Functional goal:** Make requests and state needs: *Quiero un café. ¿Cuánto es? Tengo que pagar.* (use *¿Cuánto es?* — *costar* is untaught o→ue.)
- **Passage idea:** Ordering at a café — greeting, order, asking the price, paying (segments).
- **Conversation seed:** Persona is a waiter; you order, ask the price, and settle up (capstone recombining L1–L11).
- **Prerequisites:** L1–L11. *Capstone: `querer/poder/tener que + inf` recombine the whole spine; stem-change is a light preview of A2.*

---

## 2. A1 BUFFER — Lessons 13–18 (outline)

- **`a1-13-este-o-ese` · This and that (shopping).** Grammar: `determiner` (demonstratives este/ese + quantifiers mucho/poco/otro). Domain: clothing & shopping (PCIC 12). Objective: you can point out and compare specific items when shopping.
- **`a1-14-que-tiempo-hace` · Weather and seasons.** Grammar: `weather.impersonal` (hace/hay + `estar` + climate + seasons). Domain: weather & nature (PCIC 20). Objective: you can describe today's weather and the seasons. *Hosts the 12 months (from L9) as recognition-only flashcards.*
- **`a1-15-me-duele` · Body and health.** Grammar: `verb.gustar-type` (doler, same backwards pattern), `pronoun.io` (reused), `verb.tener` (+ symptoms, reused). Domain: health & body (PCIC 13, 1). Objective: you can say how you feel physically and name a simple ailment.
- **`a1-16-mas-que` · Comparing things.** Grammar: `comparative` (más/menos que + tan…como + irregular mejor/peor — one tag). Domain: general/cross-cutting. Objective: you can compare two people or things.
- **`a1-17-conteste` · Object pronouns & simple commands.** Grammar: `pronoun.do`, `imperative` (affirmative tú/ustedes). Domain: instructions & requests (Func. 4). Objective: you can give a short instruction and replace a noun with a pronoun.
- **`a1-18-ayer` · A first taste of the past.** Grammar: `preterite.regular` (-ar intro only). Domain: past events / narration. Objective: you can name one thing you did yesterday. *(Deliberately the FIRST preterite exposure — see rationale; full past-tense work lives in A2.)*

---

## 3. A2 OUTLINE (12–16 lessons — title · grammar focus · domain)

1. **En el pasado (1)** — `preterite.regular` (all classes) — daily events / narration
2. **En el pasado (2)** — `preterite.irregular` (ser/ir/estar/tener/hacer) — travel & experiences
3. **Cuando era niño** — `imperfect.regular-irregular` (description/habit) — childhood / past routine
4. **Pretérito vs. imperfecto** — `past.contrast` — storytelling
5. **Justo ahora** — `estar` + gerundio (present continuous) — actions in progress
6. **Voy a, tengo que, acabo de** — verbal `periphrasis` (ir a / tener que / acabar de / volver a / empezar a) — plans & obligations
7. **El futuro** — `future.simple` — predictions & intentions
8. **Se lo doy** — `pronoun.do-io.combined` (se lo/la) — services & favors
9. **No hagas eso** — `imperative.negative` + `pronoun.placement` — advice & prohibitions
10. **Ojalá / Espero que** — `subjunctive.present` first uses (wishes, `querer que`) — feelings & wishes
11. **Más grande, el mejor** — comparatives extended + `superlative.relative` — opinions & reviews
12. **Por o para** — `por-para.contrast`, expanded prepositions — reasons & goals
13. **El lugar donde…** — relatives `donde`/`quien`, expanded connectors — describing places & people
14. **Servicios y trámites** — consolidation; formal register / `usted` transactions — bank, doctor, hotel

*(Domains added at A2: services (11), media/communication (9), deeper work/education (6,7), economy basics (15), travel logistics (14).)*

---

## 4. B1 / B2 SKETCH

**B1 — Independent User, "Threshold."** The arc shifts from *reporting my world* to *handling
unpredictable exchanges and connected discourse.* Grammar backbone: the **subjunctive matures** —
present subjunctive across doubt, emotion, unreal antecedents, and purpose/time clauses (*cuando +
subj*, *para que*, *aunque*); **conditional + imperfect subjunctive** for hypotheticals (*si tuviera…
haría*); the **past-tense system consolidates** with pluperfect and reported speech; **passive/
impersonal `se`** and richer connectors (sin embargo, aunque, por lo tanto) enable paragraph-level
argument. Thematic shift: from concrete personal domains to **abstract-lite topics** — work and
studies in depth, health systems, media and technology, travel problems, environment, personal
opinions and plans, narrating experiences with nuance. Functional center of gravity: **negotiating
meaning, expressing and defending opinions, hypothesizing.**

**B2 — Independent User, "Vantage."** The arc is *fluency, precision, and register control.* Grammar
is less about new tenses than **mastery and subtlety**: full subjunctive/indicative alternation,
compound conditionals (*habría hecho*), advanced periphrasis and aspect, nominalizations, discourse
markers for cohesion and stance, and **register-shifting** between colloquial and formal/academic.
Thematic shift: **abstract and specialized fields** — politics and society, science and technology,
art and culture, economics, ethics — plus idiom, connotation, and implicit meaning. Functional
center: **sustained argument, concession and rebuttal, summarizing and synthesizing sources,
adapting tone to audience.** Text types widen to essays, reviews, formal correspondence, and
structured debate — well beyond the sentence-translation core, so B-levels imply new app modalities
(extended writing, reading comprehension, open conversation).

---

## 5. DESIGN RATIONALE — key sequencing decisions

**Spine choice.** We adopt the field-consensus order (greetings → gender/articles/`ser` → adjectives
→ `-ar` present + questions → `estar`/`hay` → `ser`/`estar` contrast → `-er/-ir` → `tener`/possessives
→ `gustar` → time → routine → `ir a` → `querer/poder/tener que`), so a learner cross-referencing any
mainstream course meets the same landmarks. We deviate where our **typed-production, ~10-vocab,
cumulative** mechanics demand it.

**ser/estar — split, then contrast (L1 → L4 → L5).** We rejected the SpanishDict "power-trio bundle"
(`ser/estar/tener` together) and the Aula "`hay/ser/estar` at once" bundle. For a *typed-production*
app the learner must generate the correct verb, not just recognize it; bundling three copulas in one
lesson would force a choice they can't yet make and blow the vocab budget. Staging gives `ser` a full
lesson to become automatic (L1–2), introduces `estar` for the concrete, unambiguous case of location
(L4), then makes the contrast itself the explicit objective of L5 — the pivot lesson. `tener` is
deferred to L7 (its own lesson with possessives) rather than crammed into the copula cluster; ages in
L5 use *tengo … años* as a memorized chunk, formalized later.

**gustar — mid-sequence, as grammar (L8), leaked as a chunk earlier.** Everyone teaches `gustar`,
nobody teaches it first. It needs IO pronouns and a stock of likeable nouns, so it can only pay off
once L1–L7 supply them. *Me gusta* may appear as a fixed phrase in glue/examples before L8, but the
**backwards-agreement grammar** (gusta/gustan, *a mí me…*) is formalized at L8 where prior vocab makes
rich sentences possible.

**Numbers & questions — placed, not scattered.** Questions get no standalone lesson; they ride L3
(`verb.regular.ar`) because you can't ask about actions before you can name them. Numbers split:
**0–30 at L5** (needed for ages/quantities at the contrast lesson) and **31–100 at L9** (needed for
telling time). Treating each number block as one vocab *set* keeps them off the per-lesson item cap.

**No preterite in the 12 core — first taste at L18, full treatment in A2.** This is our sharpest,
most deliberate call, made *against* the Madrigal-inspired "early past" option in the research. Three
reasons rooted in our mechanics: (1) **Typed production of preterite is heavy** — the learner must
produce correct, accented conjugations (*hablé, comió*) from scratch, not recognize them; A1's
`ir a + infinitive` (L11) already delivers "future" expressive power using only infinitives learners
already own, at a fraction of the load. (2) **CEFR A1 writing is "isolated phrases about my immediate
world"; past-time reference is an explicit A2 signature.** (3) **The ~10-vocab cumulative cap** means
a past-tense lesson would spend its whole budget on morphology with no room for new content. The L12
capstone (`querer/poder/tener que + inf`) is a stronger, lower-risk motivational payoff than a shaky
preterite. Buffer L18 offers a single *-ar* preterite "taste" for learners who want it before A2 —
isolated and optional, not on the critical path.

**Cognate bootstrapping — a technique, not a lesson.** The research's clever "L2 = cognate/suffix
rules" idea is genuinely suited to a typing app, but a full slot for it weakens grammar coverage we
can't spare across only 12 lessons. Instead we **weave cognate confidence into L1–L3 sentence
selection** (favor `-ción`, `-al`, `-ble` words the learner can nearly type already) rather than
spend an ordinal on it.

**Cumulative-vocab discipline & glue policy.** Enforced by the glue list at the top of this file:
articles, core connectors/prepositions, degree adverbs, and subject pronouns are **free from L1** so
early lessons aren't starved of grammatical scaffolding; question words, reflexive `se`, and
demonstratives are **not free** until their lesson. Every content noun/verb/adjective in a sentence
must trace to the current or a prior lesson (Style Guide QA #6). Authors: before finalizing a lesson,
scan each sentence against the cumulative vocab set and rewrite any leak — do not smuggle a word in.

---

## 6. COVERAGE CHECK

**PCIC A1 grammar inventory → lessons** (✓ covered in core 1–12 · ▷ deferred to buffer 13–18 · ◇ deferred to A2):

| PCIC grammar section | Where |
|---|---|
| Sustantivo (gender/number) | ✓ L1–L2 |
| Adjetivo (agreement, position, *muy* superlative) | ✓ L2 |
| Artículo (def/indef) | ✓ L1 · al/del contraction ◇ A2 (not anchored in the core) |
| Demostrativos | ▷ L13 |
| Posesivos | ✓ L7 |
| Cuantificadores (cardinals, poco/mucho, también/tampoco) | ✓ L5, L8, L9 · ordinals ◇ A2 |
| Pronombre (subject, gustar-IO, reflexive, interrog.) | ✓ L1, L8, L10, L3 · prep. pronouns ▷/◇ |
| Adverbio (place/time/quantity, dónde/cómo) | ✓ L3, L4, L9, L10 |
| Verbo — presente (regular + ser/estar/ir/tener) | ✓ L1,L3,L4,L6,L7,L11 |
| Verbo — imperativo afirmativo | ▷ L17 |
| Verbo — pret. perfecto / indefinido / imperfecto | ◇ A2 (▷ L18 taste of indefinido) |
| Sintagma verbal (gustar; ser/estar copulas) | ✓ L5, L8 |
| Oración simple (SVO, neg., interrog., *hay*) | ✓ L3, L4 |
| Coordinadas (y/o/pero/ni) | ✓ glue, from L1 |
| Subordinadas (querer+inf, para+inf, porque, comparatives) | ✓ L12 (modal+inf) · comparatives ▷ L16 · *para+inf/porque* not anchored in the core → ◇ A2 |
| Perífrasis (ir a / tener que / querer / poder + inf) | ✓ L11–L12 |

**PCIC A1 vocab domains (20) → lessons:**

| Domain | Status |
|---|---|
| 1 Body / physical · 2 Feelings | ✓ L2, L5, L10 |
| 3 Identity · 4 Family/relations | ✓ L1, L7 |
| 5 Food · 8 Leisure/sport · 10 Housing | ✓ L6, L8, L4 |
| 6 Education · 7 Work | ✓ partial via L3 verbs; deeper ◇ A2 |
| 12 Shopping · 14 Travel/transport | ✓ L11, L12 |
| time/numbers (nociones generales) | ✓ L5, L9 |
| 13 Health · 20 Weather/nature · clothing | ▷ L14–L15, L13 |
| 9 Media · 11 Services · 15 Economy | ◇ A2 |
| 16 Science · 17 Politics · 18 Arts · 19 Religion | ◇ B-levels (out of A1/A2 scope) |

**Consciously deferred from the core 12:** preterite/imperfect and all past reference (→ L18 taste,
A2); imperative and object pronouns (→ L17); demonstratives (→ L13); comparatives (→ L16); weather,
health, clothing, services, media domains (→ buffer/A2). Everything deferred is either heavier than
typed A1 production supports or dependent on vocab the 12-lesson budget can't fund.

---

## 7. GRAMMAR-TAG APPENDIX — the `GrammarTag` enum source of truth

**One scheme, one tag per concept.** Dotted lowercase, hierarchical, singular nouns; verbs under
`verb.*` (irregulars key on lemma, regulars on class). The enum serves **weakness-tracking + lesson
tagging**, not linguistic completeness, so tags are **coarsened** — points never tracked as separate
failure modes share one tag; sense/range nuance is lesson metadata.

### The A1 tag set — **30 tags** (24 core + 6 new in buffer)

| # | Tag | Lessons | Covers / merge note |
|---|---|---|---|
| 1 | `verb.ser` | L1,L2 | identity/origin/description senses |
| 2 | `verb.estar` | L4,L5 | location + state |
| 3 | `verb.ser-estar.contrast` | L5 | kept split — the signature A1 failure mode |
| 4 | `verb.regular.ar` | L3,L11+ | kept split from er-ir (different endings) |
| 5 | `verb.regular.er-ir` | L6 | er+ir merged (differ only in *nosotros*) |
| 6 | `verb.reflexive` | L10 | regular reflexive present |
| 7 | `verb.tener` | L5(chunk),L7,L15 | — |
| 8 | `verb.ir` | L11 | — |
| 9 | `verb.hay` | L4 | existential *hay* |
| 10 | `verb.gustar-type` | L8,L15 | gustar + doler (same backwards pattern) |
| 11 | `verb.stemchange` | L12 | e-ie/o-ue/e-i merged (A2 preview) |
| 12 | `periphrasis.ir-a-inf` | L11 | near future |
| 13 | `periphrasis.modal-inf` | L12 | querer/poder/tener-que + inf merged |
| 14 | `agreement.gender-number` | L1,L2+ | noun gender/number + adjective agreement |
| 15 | `article` | L1 | definite + indefinite |
| 16 | `pronoun.subject` | L1 | — |
| 17 | `pronoun.io` | L8,L15 | indirect-object clitics (gustar/doler) |
| 18 | `adverb` | L8,L10 | additive (también/tampoco) + frequency |
| 19 | `expression.place` | L4 | place adverbs + prepositions of place |
| 20 | `number.cardinal` | L5,L9 | 0–30 + 31–100 (range is metadata) |
| 21 | `negation` | L3 | — |
| 22 | `question.formation` | L3 | wh + yes/no |
| 23 | `possessive` | L7 | — |
| 24 | `time.telling` | L9,L10 | days = vocab set, not a tag |
| 25 | `determiner` | L13 | demonstratives + quantifiers |
| 26 | `weather.impersonal` | L14 | hace/hay + estar-climate + seasons |
| 27 | `comparative` | L16 | más/menos-que + tan-como + mejor/peor |
| 28 | `imperative` | L17 | affirmative (negative → A2) |
| 29 | `pronoun.do` | L17 | direct-object clitics |
| 30 | `preterite.regular` | L18 | -ar taste (er/ir, irregulars → A2) |

**Merge decisions (fix 11).** Pre-coarsening carried ~53–58 A1 tags — over the 30–60 A1–B1 target;
every merge is in the "Covers" column. **Kept split** (distinct failure modes): `verb.regular.ar` vs
`.er-ir`; `verb.ser-estar.contrast`; `pronoun.subject`/`io`/`do`. Result: **30 A1 tags**, leaving room
for ~15 at A2 + ~7 at B1 → under **~60 for A1–B1**. **Per-lesson mapping** comes from the *Lessons*
column (tag → lessons) plus the Primary/Secondary annotation on every §1–§2 row (lesson → tags, with
CHUNK/SET markers). *Casing: the map's dotted.lowercase wins; research SCREAMING_SNAKE is illustrative.*

---

## Changelog

**v2.1 (2026-07-21)** — glue list += `hoy` (time adverbs), per a1-03 QA (used 9× as a legitimate high-frequency time adverb; previously unlisted/untaught).

**v2 (2026-07-21) — revised per panel review** (two adversarial reviews; all blocking fixes accepted):

- **L10 (C1)** — stem-changing reflexives *despertarse/acostarse/vestirse* → regular *bañarse/lavarse/peinarse/afeitarse*.
- **L3 (M1)** — -ar verbs reselected to intransitive/legal set (object-hungry *tomar→L6, cocinar→L6, comprar→L12, mirar* dropped); *tienda* example leak fixed.
- **L9 (M2)** — 12 months cut to buffer L14 (recognition-only).
- **Tags (M3/M5)** — unified into one dotted scheme (fixed ser.identity/verb.tener/present.regular clash, pronouns→pronoun, orphan `focus.`); all prose foci tagged; §7 seeds the enum.
- **Clustering (M4)** — antonyms split (L2 dropped *bajo*, *grande/pequeño*); L5 synonym *feliz* dropped; *bien/mal* removed (glue).
- **L1** — *me llamo/te llamas/se llama* granted as CHUNKS (mechanism explicit in glue policy); seed rewritten declarative-only.
- **L2** — thing-adjectives → people-traits; *simpática* leak fixed.
- **Fix 9** — explanation-budget policy added; every lesson row annotated primary vs secondary.
- **Fix 10 (M6)** — set-type vocab ID convention fixed (one lemma-keyed ID/member; set = one budget item); Style Guide §9 patched.
- **Fix 11** — tags coarsened ~53–58 → **30 A1 tags**; merges in §7.
- **Minors applied:** L1 *perdón*/*lo siento* (m1); leaked examples fixed (L7 *doctora*→*alta*, L12 *¿Cuánto cuesta?*→*¿Cuánto es?*) (m2); coverage-table honesty on al/del + para/porque (m4); poder o→ue → `verb.stemchange` (m5); ⚠ flags cleared (T1); *ustedes/ellas/nosotras* + language names freed (N4/N3); también/para glue contradiction fixed (N2); *mañana* polysemy note.
- **Minors NOT applied:** m6/c(c) Pre-A1 cognate on-ramp — substantive redesign, flagged for authoring; al/del anchor — left to A2 (table made honest); N5/T2 casing/slug cosmetics — resolved by the "dotted.lowercase wins" note in §7.
