# SOURCES — Canonical Source Ranking for AIdioma's A1 Curriculum

**Purpose:** The single authoritative ranking of every source evaluated for AIdioma's A1 Spanish
curriculum (12 launch lessons, text-first: typed EN→ES translation + flashcards, neutral Latin
American Spanish). Synthesizes the four curriculum research files (sequencing/frequency) plus the
2026-07-21 content-data-sources survey (ingestion/enrichment); §5 records the ingestion policy.

**Depth links:**
- [PCIC A1 inventory](research/pcic-a1-inventory.md) — scope-and-sequence backbone
- [CEFR A1 descriptors](research/cefr-a1-descriptors.md) — objective phrasing / can-do targets
- [Frequency vocab](research/frequency-vocab.md) — vocab prioritization sources
- [OER/textbook sequencing](research/oer-textbook-sequencing.md) — first-12 ordering cross-check
- [Content-data-sources survey](../../Docs/Archive/Design/MVP-DESIGN-2026-07/RESEARCH-CONTENT-DATA-SOURCES-2026-07-21.md) — historical source for §2b licensing/format/size detail

---

## 1. The chosen backbone (confirmed)

The proposed backbone is **confirmed** by the research; only clarifications are added:

- **PCIC** (*Plan Curricular del Instituto Cervantes*) — **scope-and-sequence backbone.** Inventories 2
  (Gramática → `GrammarTag` enum + ordering), 5 (Funciones → lesson objectives), 9 (Nociones específicas
  → thematic 10-word sets), with 8 (Nociones generales) as support. It is the only source that gives
  Spanish-specific grammar/function/vocab-domain content per CEFR level.
- **CEFR** — **objective phrasing (can-do targets).** CEFR tells us what an A1 learner *can do*; PCIC
  tells us the *Spanish content* to do it. Note the research verified the **2001** descriptors; the
  **2020 Companion Volume (CV)** is the wording authority for anything published, and adds the **Pre-A1**
  band we use to calibrate Lesson 1's on-ramp. (Files call it "CEFR / Companion Volume"; both refer to
  the same framework, CV being the current edition.)
- **wordfreq + hermitdave/FrequencyWords** — **vocab-priority overlay.** Both free, CC-BY-SA,
  conversational/pan-Hispanic register — a strong fit for a chat-centric app. Used to confirm hand-picked
  vocab sits in the high-frequency band, never as a shipped table.
- **OER / textbook consensus** — **sequencing sanity check.** The Vistas/Aula/OER field-consensus spine
  (greetings → gender/articles → `ser` → `-ar` present → `estar` → contrast → `-er/-ir`+`tener` →
  adjectives → `gustar` → `ir a` → wants → preterite) validates our lesson order.

**Rationale:** PCIC alone is a superset, not a syllabus (it front-loads all four past-reference
indicatives at A1 and gives no within-level difficulty gradient), Peninsular-default, and carries no
frequency data. CEFR supplies the proficiency ceiling and objective language; frequency corpora rank the
vocab PCIC only names as domains; the OER/textbook comparison supplies the pedagogical lesson ordering
PCIC omits. The four are complementary, not redundant — each fills a gap the others leave.

---

## 2. Ranked source table

Ranked by centrality to the build.

| Rank | Source | Role | License posture | Verdict |
|---|---|---|---|---|
| 1 | **PCIC** (Instituto Cervantes) | Backbone (grammar/functions/vocab domains) | All rights reserved; free to read online; facts uncopyrightable | The authoritative CEFR-aligned Spanish content inventory — the only source giving grammar points, functions, and vocab domains per level. Free to read on cvc.cervantes.es; the scope-and-sequence *facts* we need are uncopyrightable. Adopt inventories 2/5/9 (+8) as the skeleton; make our own 12-lesson cuts, add a Latin-American localization pass. Confidence: high. |
| 2 | **CEFR / Companion Volume** (Council of Europe) | Objective phrasing / can-do targets | Descriptor wording © CoE; framework facts/level names free | Defines what an A1 learner can do and sets grading expectations (memorised/formulaic output, error-tolerant, very short items). Paraphrase descriptors; never quote. Verified against 2001 originals (stable at A1); use the 2020 CV as publishing authority and Pre-A1 calibration for Lesson 1. Confidence: high on A1; Pre-A1 sentences need verification. |
| 3 | **wordfreq** (Robyn Speer) | Vocab priority — primary; difficulty-scoring signal | Package Apache-2.0; data CC-BY-SA 4.0 | Best default frequency check: free, scriptable, pan-Hispanic, conversational-register. Word forms not lemmas. Maintenance paused 2024 but data remains valid; derived lists redistributable if attribution/SA honored. **Adopted by both files (§2b/§5);** survey adds a planned rare-word-density → difficulty use. Confidence: high. |
| 4 | **hermitdave/FrequencyWords** (OpenSubtitles) | Vocab priority — cross-check | Code MIT; lists CC-BY-SA (this file: 4.0/3.0; survey: 3.0 — SA either way) | Human-readable spoken-register second source to cross-check wordfreq; same pan-Hispanic strengths. Some subtitle noise. **Both files adopt as the wordfreq cross-check.** Confidence: high. |
| 5 | **OER textbook consensus** (Vistas, Aula, Libro Libre, COERLL, Language Transfer, Madrigal, Duolingo, Dreaming Spanish) | Sequencing cross-check | Mixed: OER CC-BY / CC-BY-NC-SA; commercial © all rights reserved; **our policy = original regardless** | Cross-checks lesson ordering against how ~10 established courses sequence their first 12 units. Strong field consensus on the grammar spine; genuine splits on ser/estar bundling, preterite timing, gustar placement. Facts (topic order) only; no prose/exercises copied even from openly-licensed OER. Confidence: high on consensus. |
| 6 | **Leipzig Corpora (Wortschatz)** (Uni Leipzig) | Vocab — per-country cross-check | CC-BY 4.0 (most permissive of the free set) | Best free per-country filterability (MX/AR editions) for a written-register or explicit-LatAm cross-check. News/web register skews formal. Cite Goldhahn/Eckart/Quasthoff 2012. Confidence: high on license; exact current editions unverified. |
| 7 | **SUBTLEX-ESP** (Cuetos et al. 2011) | Vocab — reference/spot-check | Research-use via OSF; explicit reuse license unclear | Psycholinguistic gold standard for spot-checking a word is genuinely high-frequency in speech; predominantly European sourcing, less LatAm-tuned. Consult facts, don't redistribute. Confidence: medium (license unverified). |
| 8 | **Corpus del Español — Web/Dialects** (Mark Davies) | Reference-only — LatAm dialect diagnostic | Online interface free; downloadable lists licensed (not open); runs anti-copy checks | The single best diagnostic for LatAm-vs-Spain lexical disputes (per-country subcorpora, 21 nations). Use the free web interface for facts (e.g. `carro` vs `coche` by country); do NOT buy/ship the compiled list. Confidence: high on utility; free-tier details unverified. |
| 9 | **CORPES XXI** (RAE) | Reference-only — authoritative corroboration | Consultation/research; restrictive on bulk reuse | RAE's pan-Hispanic 400M-word corpus; v1.1 (2024) added a frequency dictionary. Authoritative and LatAm-inclusive but clunky, no API. Facts-only corroboration. Confidence: medium (details unverified, 403 to fetch). |
| 10 | **Wiktionary frequency lists** | Reference — quick eyeball | CC-BY-SA (plus upstream licenses) | Convenient human-browsable check but merely re-hosts upstream (mainly OpenSubtitles). Cite the upstream source, not Wiktionary. Confidence: high (adds no new corpus value). |
| 11 | **Routledge *Frequency Dictionary of Spanish*** (Davies) | Reference-only | Fully copyrighted commercial book | Excellent human-curated sanity check if a copy is on hand; the ranked list, definitions, examples, and thematic groupings are all protected. Read, cite individual facts, lift nothing. Confidence: high. |
| 12 | **CREA** (RAE) | Reference — honorable mention | RAE data terms restrictive; cleaned repo has no license | Older 160M-word corpus with a free 1,000-forms list; less LatAm-balanced than CORPES, encoding-messy. Consult-for-facts only. Confidence: low priority. |

---

## 2b. Content-data & ingestion sources (from the 2026-07-21 survey)

These feed *content* atoms (sentences, alternates, morphology validation, audio), not sequencing. The
[content-data survey](../../Docs/Archive/Design/MVP-DESIGN-2026-07/RESEARCH-CONTENT-DATA-SOURCES-2026-07-21.md) is the source
for full licensing/format/size detail; §5 records the policy. PCIC is reference-only **in both
documents** — never ingested as data.

| Source | Role | License | Verdict (this track) |
|---|---|---|---|
| **Tatoeba** | Sentence-bank + accepted-alternates **reserve** | CC-BY 2.0 FR (some CC0); audio per-contributor incl. NC | QA-time alternates-mining & naturalness cross-check; bulk-ingestion pipeline is post-launch. Verbatim sentences require provenance + attribution. |
| **kaikki.org wiktextract** | **Facts-only:** POS/gender/conjugation validation | CC-BY-SA + GFDL | Ingest as morphology validator in `tools/`; never copy glosses/examples (SA contamination). Replaces the NC Jehle DB; broader than UniMorph. |
| **MCR Spanish WordNet** | Alternates + lesson theming | CC-BY 3.0 (es part) | Secondary enrichment for accepted-alternates/synonyms; sparse glosses vs Wiktionary. |
| **FSI Spanish Basic** | Grammar-tagged **pattern-mine** + syllabus cross-check | Public domain (US gov) | LLM-rewrite feedstock; mine drill patterns/sequencing, never ship verbatim (1957, usted-heavy). |
| **COERLL CC-BY items** (Proficiency Exercises, ¡Listos!, Recorridos) | Conversation-seed + LatAm register models | CC-BY (attribution, no SA) | Ingest for conversation seeds; avoid COERLL's CC-BY-NC(-SA/-ND) projects. |
| **Common Voice (es)** | Sentence/vocab audio | CC0 | **Post-MVP** — adopt when audio is needed; TTS otherwise. |
| **Avoid-list** | — | NC / personal-use / murky | Do not use: Anki shared decks, OPUS OpenSubtitles (direct), Fred Jehle verbs, SUBTLEX-ESP (as shipped data), Radio Ambulante, NC-licensed OER. |

---

## 3. Safe-use rules (consolidated licensing)

**Standing rule — overrides everything:** *ALL AIdioma content is original regardless of source
license.* We consult sources for **facts and taxonomy** (what's assigned to which level, what order
topics come in, which band a word sits in) and write every descriptor, explanation, example sentence,
and vocab entry ourselves. This keeps us clear of copyright, EU database-right, and endorsement concerns
no matter which source we glance at. The legal basis for using facts: *Feist v. Rural Telephone* (1991)
— facts and single data points are not copyrightable; a curated compilation's selection/arrangement,
prose, and examples are.

**Per-source posture:**

- **Facts-only, do not copy prose/examples/tables** — PCIC (all rights reserved; free to read ≠ free to
  copy; never reproduce an inventory verbatim as a substantial extract, never present AIdioma as
  Cervantes-endorsed), CEFR/CV (descriptor wording © CoE — paraphrase, cite, acknowledge copyright),
  SpanishDict, and all commercial textbooks (Vistas, Aula, Madrigal, Duolingo, Dreaming Spanish).
- **Freely reusable with attribution (but we stay original anyway)** — wordfreq (CC-BY-SA 4.0; credit
  Robyn Speer + acknowledge Google Books Ngram/SUBTLEX/OpenSubtitles; share-alike on redistributed
  derived lists), hermitdave/FrequencyWords (CC-BY-SA 4.0), Leipzig (CC-BY 4.0), COERLL (CC-BY), the
  CC-BY / CC-BY-NC-SA OER textbooks (Libro Libre, ¡Bienvenidos!, ¡Chévere!, etc.). Full reuse would be
  legal; our policy uses them only as sequencing/frequency cross-checks.
- **Reference-only, licensed data — never redistribute or ship the list** — Corpus del Español /
  wordfrequency.info (runs automated anti-copy checks — consult free web interface for facts only),
  Routledge Frequency Dictionary (fully copyrighted book), CORPES XXI & CREA (RAE restrictive terms),
  SUBTLEX-ESP (research-use, license unclear).
- **Attribution we will carry:** cite PCIC as sequencing authority and CEFR as competence framework;
  record frequency ranks as derived metadata crediting wordfreq (Robyn Speer) + OpenSubtitles.

**Localization rule:** PCIC is Peninsular-default. Apply a neutral-Latin-American editorial layer —
prefer `ustedes` over `vosotros`, `tú` as neutral singular (aware of `vos`), and LatAm lexis
(carro/auto, computadora, celular, jugo, papa, manejar, etc.). Resolve contested synonym pairs via a
free Corpus del Español Web/Dialects lookup.

---

## 4. Open verification items (consolidated)

Nothing here should be silently lost. Grouped by file.

**From PCIC ([detail](research/pcic-a1-inventory.md)):**
1. Inventory components **10–13** are standard-structure but were **not re-verified live** (index
   truncated) — reconfirm before relying on them.
2. **A1-vs-A2 grammar line assignment** is medium-high confidence — verify borderline grammar items at
   source before hard-coding the `GrammarTag` enum.
3. **A1-vs-A2 function split** is medium confidence — verify which unmarked function labels are truly A1.
4. **Nociones específicas at item level** — domains are solid, but *which individual vocab items within
   each domain are A1* was not isolated; filter item-level before building word lists.
5. **A2 grammar outline** is medium confidence — verify against source before building the A2 syllabus.
6. PCIC front-loads all four past-reference indicatives at A1; **we must make our own cuts** (defer
   indefinido/imperfecto/perfecto contrast + imperative to late-A1/A2).

**From CEFR ([detail](research/cefr-a1-descriptors.md)):**
7. **Pre-A1 illustrative descriptor wording** (Lesson-1 calibration) is reconstructed from prior CV
   knowledge — verify exact sentences against the official 2020 CV PDF before publication.
8. Optionally re-verify A1/A2 descriptors against **2020 CV** wording (we verified 2001 originals;
   substantively stable, reworded for inclusivity in the CV).
9. Mining PCIC A1–A2 inventories for concrete sequencing was flagged as the next task — now largely
   covered by the PCIC file, but item-level vocab (item 4 above) remains.

**From Frequency vocab ([detail](research/frequency-vocab.md)):**
10. **wordfreq** Spanish-specific source weighting is unverified (NOTICE.md data-license verified).
11. **Leipzig** per-country editions (which exact MX/AR editions are current) unverified.
12. **SUBTLEX-ESP** reuse license and its degree of European-Spanish skew both unverified.
13. **Corpus del Español / wordfrequency.info** pricing and free-tier/download limits unverified
    (site returned HTTP 403 to fetch) — confirm in a browser before relying on export details.
14. **CORPES XXI v1.1** frequency-dictionary and export-format details unverified (RAE 403 to fetch).

**From OER/textbook sequencing ([detail](research/oer-textbook-sequencing.md)):**
15. **Language Transfer** license (exact CC-NC variant) and mid/late track ordering unverified.
16. **Libro Libre** per-chapter grammar list not enumerated beyond "10 chapters."
17. **Vistas** exact `gustar` lesson unverified (functionally early, formalized ~Lec 6).
18. **Duolingo** full Section-1 unit order unverified.
19. **Open lesson-design decisions** for the curriculum-map owner: bundle vs stage `ser/estar/tener`;
    is L12 preterite too early (A/B flag); where numbers/time/dates live; teach `gustar` as an early
    chunk vs formal grammar at L9.

**From the content-data survey ([detail](../../Docs/Archive/Design/MVP-DESIGN-2026-07/RESEARCH-CONTENT-DATA-SOURCES-2026-07-21.md), its own unverified notes):**
20. **Peace Corps Spanish PD status** — inferred from US-gov authorship; verify **per course** before ingesting.
21. **Common Voice Spanish per-language totals** (hours/clips) — dataset-wide CC0 confirmed; per-language figures unverified.
22. **FreeDict eng-spa headword count** unconfirmed — moot unless FreeDict is reconsidered over kaikki.
23. **OpenSubtitles NC label** taken from META-SHARE/HF listings — stays on the avoid-list regardless.
24. **PD editions** (FSI, Gutenberg) must be verified against **original government/pre-copyright scans**.

---

## 5. Data ingestion strategy (content-track policy, 2026-07-21)

Coordinator decisions on how the content track uses §2b sources. Absorbed from the survey's §c/§d.

- **12 A1 launch lessons stay 100% LLM-original.** The cumulative-vocab constraint (a sentence may use
  only vocab taught so far) makes pre-existing corpus sentences a poor fit — most would need rewriting
  anyway. Corpus-ingestion economics only pay off at A2+ scale, not across 12 lessons.
- **Tatoeba — approved as a QA RESERVE, not a launch feed.** Use during review to mine accepted-alternates
  and cross-check naturalness (how natives actually rendered similar sentences). Any verbatim ingested
  sentence must carry provenance + attribution. A bulk-ingestion pipeline is a **post-launch** project.
- **kaikki / wiktextract — approved facts-only for tooling.** Powers a planned verb-conjugation/gender
  validation check in `tools/` that validates our drafted content against Wiktionary morphology facts.
  Never copy glosses or example sentences into lessons (share-alike contamination).
- **wordfreq — already adopted** (§2 rank 3); additionally planned as a difficulty-scoring heuristic
  (rare-word density → the 1–5 difficulty field) in tooling.
- **Schema consequence (being proposed to the App Design Coordinator in P-001):** an optional per-item
  `provenance` field `{source, sourceId, license}`, so future ingestion needs no schema change and
  per-sentence Tatoeba attribution is representable from day one.
- **SA/NC hygiene:** from share-alike sources (kaikki, wordfreq, FrequencyWords, UniMorph, Wikibooks)
  extract only **facts** (POS, gender, forms, frequencies — uncopyrightable), never creative prose;
  NC-licensed sources never enter the pipeline; PD editions are used only after verifying the text
  against the original government/pre-copyright scan.

---

*Synthesis of existing research plus the 2026-07-21 content-data survey; no new web research. Last updated 2026-07-21.*
