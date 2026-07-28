# PCIC A1 Inventory — Curriculum Research

**Purpose:** Evaluate the *Plan Curricular del Instituto Cervantes* (PCIC) as the scope-and-sequence
backbone for AIdioma's A1 Spanish curriculum (12 launch lessons), with an A2 outline.
**Researched:** 2026-07-21 via live web fetch of `cvc.cervantes.es`.
**Status of sources:** Official PCIC inventory pages were reachable and fetched directly (primary).
Structural facts below are extracted from those pages; A1/A2 line-item splits carry the confidence
caveats noted per section.

---

## 1. What the PCIC is + inventory structure

The PCIC — full title of the linguistic-content volumes: ***Niveles de referencia para el español***
— is the Instituto Cervantes' curriculum specification for Spanish as a foreign language. It develops
the six CEFR/MCER levels (A1, A2, B1, B2, C1, C2) into detailed, itemized inventories of teaching and
learning content. It is the Spanish-language analogue of the Council of Europe's "Reference Level
Descriptions" (like the English *Threshold/Waystage* and German *Profile Deutsch*). Published by
Instituto Cervantes (Biblioteca Nueva, first ed. 2006), authored under Álvaro García Santa-Cecilia,
Departamento de Ordenación Académica.

- Purpose page: https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/introduccion.htm
- Index: https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/indice.htm
- Publisher page: https://cervantes.org/es/sobre-nosotros/publicaciones/plan-curricular-instituto-cervantes-niveles-referencia-espanol

### The 13 inventories (components)

Content is split across three volumes by level band (A1-A2, B1-B2, C1-C2). Each band presents general
objectives plus twelve content inventories. The full component list (1–9 confirmed live from the index
page; 10–13 are the established PCIC structure — the index excerpt truncated before them, so treat
10–13 as "standard-structure, not re-verified live this session"):

1. **Objetivos generales** — general objectives (not itemized content; framing only)
2. **Gramática** — grammar inventory ✅ core for sequencing
3. **Pronunciación y prosodia** — pronunciation/prosody
4. **Ortografía** — spelling
5. **Funciones** — communicative functions ✅ core for objectives
6. **Tácticas y estrategias pragmáticas** — pragmatic tactics/strategies
7. **Géneros discursivos y productos textuales** — discourse genres / text types
8. **Nociones generales** — general (abstract) notions ✅ useful for grammar-adjacent vocab
9. **Nociones específicas** — specific (thematic) notions ✅ core for vocab domains
10. **Referentes culturales** — cultural references
11. **Saberes y comportamientos socioculturales** — sociocultural knowledge/behaviors
12. **Habilidades y actitudes interculturales** — intercultural skills/attitudes
13. **Procedimientos de aprendizaje** — learning procedures

### Which inventories matter for AIdioma lesson sequencing

| Inventory | Use for AIdioma | Priority |
|---|---|---|
| 2. Gramática | Backbone for `GrammarTag` enum + lesson ordering | **Primary** |
| 5. Funciones | Lesson objectives ("can-do"), dialogue design | **Primary** |
| 9. Nociones específicas | Thematic vocab domains (10-word sets per lesson) | **Primary** |
| 8. Nociones generales | Cross-cutting notions (quantity, time, space) — supports grammar vocab | Secondary |
| 1. Objetivos generales | Sanity-check overall level scope | Reference only |
| 3/4. Pronunciación / Ortografía | Not needed for text-first MVP | Skip for now |
| 6. Tácticas pragmáticas | Too advanced/subtle for A1 launch | Skip |
| 7. Géneros discursivos | Text-type awareness — not A1-lesson-shaping | Skip |
| 10–12. Culturales/interculturales | Nice-to-have cultural notes, not sequencing | Skip for MVP |
| 13. Procedimientos | Learner-strategy meta-content, not lesson content | Skip |

**Verdict on structure:** Inventories 2, 5, 9 (+8 as support) are the working set. Everything else is
skippable for an A1 text-based MVP.

---

## 2. A1 GRAMMAR inventory (for `GrammarTag` enum + 12-lesson ordering)

Source (fetched live):
https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/02_gramatica_inventario_a1-a2.htm

The grammar inventory has **15 top-level sections**. Below are the points the page marks for **A1**.
(Confidence: high on section structure; medium-high on exact A1 vs A2 line assignment — the page tags
each item, but a few boundary items may actually be A2. Verify borderline items against the source
before hard-coding.)

### A1 grammar points, by section

1. **El sustantivo** — gender (‑o/‑a + other patterns, heteronyms), number (‑s / ‑es), proper vs common nouns
2. **El adjetivo** — gender & number agreement, gentilicios, postnominal position, absolute superlative with *muy*
3. **El artículo** — definido (el/la/los/las, contractions al/del), indefinido (un/una/unos/unas), bare-noun basics, incompatibilities (with *haber*, proper nouns)
4. **Los demostrativos** — este/ese/aquel (+ gender/number), neuter esto/eso/aquello, spatial deixis
5. **Los posesivos** — unstressed mi/tu/su (+ plurals), one vs multiple possessors, position/incompatibilities
6. **Los cuantificadores** — cardinals, ordinals (to 10th), poco/mucho, focal *también/tampoco*
7. **El pronombre**
   - Subject pronouns (yo/tú/él/nosotros/vosotros/ellos; usually omitted, present for contrast)
   - Unstressed OI in *me gusta* pattern
   - Reflexive *se* + reflexive verbs (levantarse, peinarse)
   - Stressed prepositional pronouns (mí, ti, conmigo, contigo)
   - Relative *que* (specifying clauses)
   - Interrogatives qué / quién / cuánto
   - Exclamative *qué*
8. **El adverbio y locuciones adverbiales** — place (aquí/ahí/allí), time (ahora/hoy/mañana), quantity (poco/mucho/bastante), sí/no, bien/mal; interrogatives dónde/cómo; *por qué* vs *porque*
9. **El verbo** — indicative tenses at A1:
   - **Presente** (regular + irregulars ser, estar, haber, ir)
   - **Pretérito perfecto** (haber + participle; regular + common irregular participles)
   - **Pretérito indefinido** (regular + irregular; past in defined time frame)
   - **Pretérito imperfecto** (regular + ser/ir/ver; description, habitual)
   - **Imperativo afirmativo** (2nd sing/pl regular; irreg di/haz/pon/sal; usted/ustedes; enclitics)
   - **Formas no personales**: infinitivo (simple), participio (adjectival)
   - *(Note: PCIC front-loads all four past-reference indicatives into A1. AIdioma should almost
     certainly split these across A1→A2 rather than teach all four in 12 lessons — see §6 gaps.)*
10. **El sintagma nominal** — head + modifiers (adjective, *de*-phrase, specifying relative), internal & SN–verb agreement, vocative
11. **El sintagma adjetival** — degree modifiers muy/poco/bastante
12. **El sintagma verbal** — *gustar*-type verbs; copulas *ser* (identity/class/time) vs *estar* (location, bien/mal); attribute, direct object, indirect object, circumstantial complements
13. **La oración simple** — SVO canonical order; affirmative/negative; total/partial interrogatives; impersonal *hay*; copular/transitive/intransitive types
14. **Oraciones coordinadas** — copulativa *y* / *ni*, disyuntiva *o*, adversativa *pero*, distributiva *uno… otro*
15. **Oraciones subordinadas** —
    - Sustantivas: infinitive subject (con *ser*, *gustar*), object with *querer*, finite object with *creer* (affirmative)
    - Relativas: specifying *que* + indicative
    - Adverbiales: causal *porque*, final *para + infinitivo*, conditional real *si* + present, consecutive *por eso/entonces*, comparative (tan/tanto… como, más/menos que, mejor/mayor/peor/menor)

### Suggested `GrammarTag` enum seed (from A1 points)

```
NOUN_GENDER, NOUN_NUMBER, ADJ_AGREEMENT, ARTICLE_DEFINITE, ARTICLE_INDEFINITE,
DEMONSTRATIVES, POSSESSIVES, CARDINALS, ORDINALS, QUANTIFIERS,
SUBJECT_PRONOUNS, GUSTAR_IO_PRONOUNS, REFLEXIVE_VERBS, PREP_PRONOUNS,
INTERROGATIVES, PRESENT_REGULAR, PRESENT_IRREGULAR, SER_VS_ESTAR,
HAY_IMPERSONAL, PRET_PERFECTO, PRET_INDEFINIDO, PRET_IMPERFECTO,
IMPERATIVE_AFF, INFINITIVE, PARTICIPLE, ADVERBS_PLACE_TIME, ADVERBS_QUANTITY,
COORD_Y_O_PERO, SUBORD_PORQUE, SUBORD_PARA_INF, COND_SI_PRESENT,
COMPARATIVES, WORD_ORDER_SVO
```

### A2 grammar — outline only (headline topics)

A2 (same inventory page, A2 column) deepens each section rather than adding many new categories.
Headline A2 additions include: **futuro imperfecto** and **condicional simple**; broader
**pretérito indefinido/imperfecto contrast**; **estar + gerundio** (present continuous);
**perífrasis** (ir a + inf, tener que / hay que + inf, empezar a, volver a, acabar de);
comparatives/superlatives extended; **direct + indirect object pronoun combinations** (se lo/la);
**imperativo negativo** and first appearances of **presente de subjuntivo** in select functions;
more relative pronouns (donde, quien); expanded prepositions and connectors; **por vs para** basics.
(Confidence on A2: medium — outline drawn from the A1-A2 page's A2 markings + established PCIC A2
scope; verify against source before building the A2 syllabus.)

---

## 3. A1 FUNCTIONS (funciones) — lesson objectives / can-do statements

Source (fetched live):
https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/05_funciones_inventario_a1-a2.htm
Intro: https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/05_funciones_introduccion.htm

The functions inventory has **6 macro-categories**. The fetched page returns the full A1-A2 function
set; **not every label below is A1-exclusive** — many (skepticism, counter-argument, condolences,
telephone-recado routines) are A2. The A1-typical core is marked ✅. (Confidence: high on the 6
categories and label names; **medium** on the precise A1 vs A2 split — treat unmarked items as
"A1-or-A2, verify".)

**1. Dar y pedir información** — identificar ✅, pedir información ✅, dar información ✅, pedir/confirmar
confirmación ✅, describir ✅, narrar

**2. Expresar opiniones, actitudes y conocimientos** — pedir/dar opinión ✅, valorar, expresar
acuerdo/desacuerdo ✅, expresar (falta de) certeza, posibilidad, obligación y necesidad, preguntar/expresar
conocimiento ✅, habilidad (*saber/poder*) ✅, recuerdo. *(Most nuanced sub-functions here are A2.)*

**3. Expresar gustos, deseos y sentimientos** — preguntar/expresar gustos e intereses ✅, aversión ✅,
preferencia ✅, deseos ✅, planes e intenciones, estado de ánimo ✅, alegría/tristeza ✅, and a long list
of finer emotions (aburrimiento, enfado, miedo, alivio, sorpresa, afecto — mostly A2), sensaciones
físicas ✅

**4. Influir en el interlocutor** — dar orden/instrucción ✅, pedir un favor / objetos / ayuda ✅,
responder a una petición ✅, pedir/dar/denegar permiso ✅, proponer y sugerir ✅, ofrecer e invitar ✅,
aceptar/rechazar propuesta ✅, aconsejar, advertir, ofrecerse

**5. Relacionarse socialmente** (highest A1 density) — saludar ✅, responder a un saludo ✅, dirigirse a
alguien ✅, presentar a alguien / presentarse ✅, responder a una presentación ✅, dar/responder bienvenida ✅,
disculparse ✅, responder a disculpa ✅, agradecer ✅, responder a agradecimiento ✅, dar el pésame,
brindar, felicitar ✅, formular buenos deseos ✅, despedirse ✅

**6. Estructurar el discurso** — establecer comunicación y reaccionar ✅, teléfono routines (preguntar por
persona, dejar recado), organizar información, conectar elementos ✅, interrumpir, concluir, proponer
cierre, despedirse ✅. *(Discourse-management functions are mostly A2; A1 keeps only the simplest.)*

**Mapping to lessons:** Category 5 (social relations) + the "identificar / dar información sobre uno
mismo" cluster in Category 1 anchor lessons 1–3 (greetings, introductions, personal data). Category 3
gustos anchors a "likes/food/hobbies" lesson. Category 4 basic requests anchors a "shopping/café/asking
price" lesson.

---

## 4. A1 NOCIONES ESPECÍFICAS — thematic vocab domains

Source (fetched live):
https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/09_nociones_especificas_inventario_a1-a2.htm
Intro: https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/09_nociones_especificas_introduccion.htm

**20 thematic domains**, each with subtopics. (Confidence caveat: the fetch returned the subtopic
structure but did **not** reliably isolate which individual subtopics are A1-only vs A2 — the page marks
individual vocabulary items, not whole subtopics, by level. Treat the *domains* as A1-relevant and
expect only a **subset of vocab within each** to be A1. Verify item-level before building word lists.)

The 20 domains:

1. **Individuo: dimensión física** — body parts, physical characteristics, body actions/positions, life cycle
2. **Individuo: dimensión perceptiva y anímica** — character/personality, feelings/moods, physical sensations, values
3. **Identidad personal** — personal data, documentation, personal objects
4. **Relaciones personales** — family, social relations, celebrations
5. **Alimentación** — diet, drink, foods, recipes, dishes, kitchen/table utensils, restaurant
6. **Educación** — institutions, teachers/students, system, learning, exams, studies, classroom language, materials
7. **Trabajo** — professions/roles, workplaces/tools, activity, unemployment, rights/obligations, worker traits
8. **Ocio** — free time, shows/exhibitions, sports, games
9. **Información y medios de comunicación** — communication, written correspondence, telephone, press, TV/radio, internet
10. **Vivienda** — housing actions, characteristics, domestic activities, household objects
11. **Servicios** — postal, financial, health, protection/security, social services
12. **Compras, tiendas y establecimientos** — places/people/activities, clothing/footwear, food, payments
13. **Salud e higiene** — health/illness, symptoms, health centers, medicine, hygiene, aesthetics
14. **Viajes, alojamiento y transporte** — travel, lodging, transport system
15. **Economía e industria** — finance, commerce, entities/companies, industry/energy *(mostly A2+)*
16. **Ciencia y tecnología** — general, mathematics, IT/new tech *(mostly A2+)*
17. **Gobierno, política y sociedad** — society, politics, law/justice, military *(mostly B-levels)*
18. **Actividades artísticas** — art disciplines, music/dance, architecture/sculpture/painting, literature, photography, cinema/theater *(mostly A2+)*
19. **Religión y filosofía** — religion *(mostly B-levels)*
20. **Geografía y naturaleza** — universe/space, geography, urban/rural spaces, weather, fauna, flora

**A1-priority domains for 12 launch lessons** (high everyday frequency, dense A1 vocab): 1 (body),
2 (feelings), 3 (identity/personal data), 4 (family/relations), 5 (food/restaurant), 6 (education/
classroom), 7 (professions), 8 (leisure/sports), 10 (housing), 12 (shopping), 14 (travel/transport),
20 (weather/nature basics). Domains 15–19 are largely A2/B and should be **deferred**.

---

## 5. Licensing / copyright — what is SAFE to use

**Copyright holder:** Instituto Cervantes. Every CVC page footer reads
"Centro Virtual Cervantes © Instituto Cervantes. Reservados todos los derechos." (all rights reserved).
The print edition is © Instituto Cervantes / Biblioteca Nueva (2006).

**Access conditions:** The PCIC inventories are **freely readable online** on the Centro Virtual
Cervantes (`cvc.cervantes.es`) with no paywall or login. Free-to-read ≠ free-to-copy — "reservados
todos los derechos" still governs reproduction of the text.

**What is SAFE for AIdioma:**
- ✅ **Scope-and-sequence FACTS are not copyrightable.** The *fact* that PCIC assigns "presente de
  indicativo," "ser vs estar," or "saludar/despedirse" to A1 is uncopyrightable information. Using this
  to order lessons, name `GrammarTag`s, and choose vocab domains is safe.
- ✅ Citing the PCIC as our sequencing authority (attribution) is safe and good practice.
- ✅ Deriving our own original example sentences, descriptors, and explanations that happen to cover the
  same grammar points is safe.

**What is NOT safe:**
- ❌ Copying PCIC **prose**: descriptor wording, explanatory paragraphs, methodological text.
- ❌ Copying PCIC **example sentences** verbatim into our content or seed data.
- ❌ Reproducing an inventory **table/list verbatim** as a substantial extract (a full verbatim copy of
  an inventory could be an infringing reproduction of the selection/arrangement even if individual
  facts are free). Re-express structure in our own words/format (as this digest does).
- ❌ Presenting AIdioma content as endorsed by / affiliated with Instituto Cervantes.

**Rule of thumb:** Extract the *facts and taxonomy* (what's assigned to which level), re-express in our
own labels and prose, write all example sentences ourselves, and attribute PCIC as the framework source.
This research file itself follows that rule — it paraphrases structure and never lifts descriptor prose.

---

## 6. Verdict — PCIC as the A1 backbone

**Strong fit as the sequencing backbone.** PCIC is the authoritative, CEFR-aligned, Spanish-specific
inventory of exactly the three things AIdioma needs: grammar points per level (→ `GrammarTag` + ordering),
communicative functions (→ lesson objectives), and thematic vocab domains (→ 10-word sets). It is free
to read, and the facts we need are uncopyrightable. **Recommendation: adopt PCIC as the canonical
scope-and-sequence reference.**

**Gaps / things PCIC does NOT give us — fill from other sources:**

1. **It's a superset, not a syllabus.** PCIC A1 is broad (all four past-reference indicative tenses live
   at A1). 12 lessons cannot cover all of it. We must **select and re-sequence** — likely deferring
   indefinido/imperfecto/perfecto contrast and imperative into late-A1/A2. PCIC won't make these cuts
   for us.
2. **No frequency data / word lists.** PCIC names vocab *domains*, not ranked word lists. Pair with a
   frequency resource (e.g., *A Frequency Dictionary of Spanish*, Davies) to pick the ~10 highest-value
   words per domain per lesson.
3. **Peninsular default.** PCIC is written for Peninsular Spanish (includes *vosotros*, peninsular
   lexis). AIdioma targets **neutral Latin American Spanish** — we must adapt: de-emphasize *vosotros*,
   prefer *ustedes*, swap peninsular lexis (coche→carro/auto, ordenador→computadora, móvil→celular,
   zumo→jugo, etc.). This is an editorial layer PCIC does not provide.
4. **No difficulty gradient within a level.** PCIC gives the A1 set flat; it doesn't tell us lesson 1 vs
   lesson 12 ordering. We supply pedagogical ordering (build from ser/estar + present → gustar →
   basic past).
5. **No grading rubric / distractors / exercises.** PCIC is content-scope only. Assessment design,
   example sentences, and grading logic are ours to build.

**Bottom line:** Use PCIC inventories 2 (grammar), 5 (functions), 9 (nociones específicas) as the
skeleton; overlay a frequency dictionary for word selection and a Latin-American localization pass;
make our own cuts to fit 12 lessons. Confidence in this recommendation: **high**.

---

## Source URLs (all fetched live 2026-07-21 unless noted)

- Index: https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/indice.htm
- Introducción general: https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/introduccion.htm
- Gramática A1-A2: https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/02_gramatica_inventario_a1-a2.htm
- Funciones A1-A2: https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/05_funciones_inventario_a1-a2.htm
- Funciones intro: https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/05_funciones_introduccion.htm
- Nociones generales A1-A2: https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/08_nociones_generales_inventario_a1-a2.htm
- Nociones específicas A1-A2: https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/09_nociones_especificas_inventario_a1-a2.htm
- Nociones específicas intro: https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/09_nociones_especificas_introduccion.htm
- Publisher/overview: https://cervantes.org/es/sobre-nosotros/publicaciones/plan-curricular-instituto-cervantes-niveles-referencia-espanol
- Tácticas pragmáticas A1-A2 (reference): https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/06_tacticas_pragmaticas_inventario_a1-a2.htm

**Secondary/academic (describing PCIC, not relied on for the A1 line-item splits):**
- Redalyc article on PCIC concept & grammar: https://www.redalyc.org/journal/921/92153510004/html/
- *Decires* (CEPE-UNAM) critique of PCIC: https://decires.cepe.unam.mx/index.php/decires/article/download/36/30/60

### Confidence summary
- Inventory structure (13 components, section headings, 20 domains, 6 function categories): **high** (live primary source).
- A1 grammar point list: **high** on structure, **medium-high** on exact A1/A2 line assignment.
- A1 function split (which labels are A1 vs A2): **medium** — verify borderline labels at source.
- A1 nociones específicas at subtopic granularity: **medium** — domains are solid; item-level A1 filtering still needed.
- Licensing analysis: **high** on facts (© notice, free access); the "facts aren't copyrightable"
  application is sound but is legal-reasoning, not legal advice.
