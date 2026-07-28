# Spanish Word-Frequency Resources for A1 Vocab Prioritization

**Purpose:** Pick and license a frequency reference to prioritize ~120–180 A1 vocab items
(12 launch lessons × ~10, plus a 6-lesson buffer) in neutral Latin American Spanish.

**Research date:** 2026-07-21. Live web verification. Claims marked **[unverified]** where the
source page could not be fetched directly (some sites returned HTTP 403 to automated fetch; those
details come from search-engine snippets rather than a direct read).

---

## 0. The one legal principle that governs everything below

**Facts are not copyrightable; a particular compiled list/database can be.** Under US law
(*Feist Publications v. Rural Telephone*, 1991) a raw fact like *"`hablar` is among the top-200
Spanish verbs"* or *"`querer` is more frequent than `desear`"* carries **no copyright** — you may
freely consult any source, learn such facts, and let them inform which words you teach. What can be
protected is (a) the **verbatim copy** of a substantial portion of a curated list (its selection,
ordering, and coordinated frequency numbers as an original compilation), and (b) the **prose,
example sentences, definitions, and thematic groupings** in a published dictionary.

**Practical rule for AIdioma:** *Consult freely, copy nothing wholesale.* Use a frequency list as a
**sanity check** — "does our hand-picked lesson vocab sit in the high-frequency band?" — not as the
literal source table we ship. Build our own vocab list from pedagogical judgment, then verify each
item's frequency rank against a freely-usable source. This keeps us clear of both copyright and
database-right concerns regardless of which source we glance at. (EU *sui generis* database right is
stricter than US law about extracting "substantial parts," which is another reason to derive facts
rather than lift tables.)

---

## 1. Ranked evaluation of sources

Ranked by usefulness to *this* task (free + usable + LatAm-representative + safe license).

### Tier 1 — Use these (free, permissively licensed, safe to consult and even redistribute-with-attribution)

#### #1. wordfreq (Python package) — Robyn Speer
- **What:** Python library returning word-frequency estimates for 40+ languages incl. Spanish,
  blended from multiple corpora (OpenSubtitles 2018, Wikipedia, Google Books Ngrams, ParaCrawl web
  crawl, SUBTLEX, Leeds, Twitter). Query `word_frequency('hablar', 'es')` or `top_n_list('es', 500)`.
- **Coverage / quality:** Very broad; blended sources smooth out any single corpus's bias. Frequencies
  are given on a human-readable Zipf scale. Word **forms**, not lemmas (so `hablo`, `hablas`, `hablar`
  rank separately — you must lemmatize mentally for verb families).
- **LatAm representativeness:** Web + subtitle sources are pan-Hispanic, not Peninsular-only; better
  mixed than book-only corpora, though not filterable *by country*.
- **License:** Package **Apache 2.0**; bundled data redistributable under **CC-BY-SA 4.0**. Attribution
  required (credit **Robyn Speer** by name + acknowledge Google Books Ngram, SUBTLEX authors,
  OpenSubtitles). **Safe to use and even to redistribute derived lists** if we honor attribution/SA.
  *Caveat:* the maintainer stopped active updates (2024) over generative-AI-pollution concerns, but
  the published data remains available and valid for our purpose. **[data-license details via NOTICE.md,
  verified; Spanish-specific source weighting unverified]**
- **Verdict:** **Best default.** Free, scriptable, permissive, pan-Hispanic. Ideal for automated
  "is this word in the top-N?" checks across our whole vocab list.
- URLs: https://github.com/rspeer/wordfreq · https://github.com/rspeer/wordfreq/blob/master/NOTICE.md · https://pypi.org/project/wordfreq/

#### #2. hermitdave/FrequencyWords (OpenSubtitles-derived) — GitHub
- **What:** Plain-text frequency lists (word ⇢ count) for ~61 languages incl. Spanish (`es`), built
  from the OpenSubtitles 2016/2018 corpora. Full and 50k-trimmed lists.
- **Coverage / quality:** Subtitle language = conversational, high-frequency spoken register — an
  excellent match for a *speaking/chat-centric* A1 app. Word forms, not lemmas. Some subtitle noise
  (names, interjections, OCR artifacts).
- **LatAm representativeness:** OpenSubtitles mixes Spain + LatAm subtitles; conversational and
  pan-Hispanic, though not country-filterable.
- **License:** Code **MIT**; the word lists **CC-BY-SA 4.0** (README also references CC-BY-SA 3.0 for
  older data). Reused by Wikipedia/keyboards. **Safe to consult and redistribute with attribution.**
- **Verdict:** Strong, human-readable second source; great for cross-checking wordfreq. Same
  spoken-register strength.
- URLs: https://github.com/hermitdave/FrequencyWords · https://github.com/hermitdave/FrequencyWords/blob/master/LICENSE

#### #3. Leipzig Corpora Collection (Wortschatz) — Uni Leipzig
- **What:** Downloadable Spanish frequency/word lists (10K–1M) from news + web + Wikipedia corpora;
  multiple country editions exist (e.g. Spanish-Mexico, Spanish-Argentina web corpora).
- **Coverage / quality:** Large, clean, well-documented. Written register (news/web) skews slightly
  more formal than subtitles.
- **LatAm representativeness:** **Best filterability by country** among the free options — you can pick
  a Mexican or Argentine web corpus edition. **[per-country editions per search snippet; unverified
  which exact editions are current]**
- **License:** **CC-BY 4.0** (attribution only, no share-alike) — the most permissive of the free set.
  Cite Goldhahn, Eckart & Quasthoff (LREC 2012).
- **Verdict:** Use when we want a written-register cross-check or an explicitly per-country LatAm list.
- URLs: https://wortschatz.uni-leipzig.de/en/download/ · https://wortschatz-leipzig.de/en/freqdict

### Tier 2 — Consult for facts, don't lean on as primary

#### #4. SUBTLEX-ESP — Cuetos, Glez-Nosti, Barbón & Brysbaert (2011)
- **What:** Spanish word frequencies from ~41M words of film/TV subtitles (1990–2009), psychologically
  validated against lexical-decision/naming reaction times. Hosted on OSF.
- **Quality:** High for psycholinguistic validity; the gold standard for "which frequencies predict
  human processing." Subtitle register = conversational.
- **LatAm:** Predominantly European-Spanish subtitle sourcing **[unverified]**; less LatAm-tuned than
  wordfreq/OpenSubtitles blends.
- **License:** Distributed for **research use** via OSF; the paper is open. Explicit reuse license **not
  clearly stated** on the landing pages — treat as *consult-the-facts, don't redistribute the table*.
  **[license unverified]**
- **Verdict:** Good for spot-checking that a word is genuinely high-frequency in speech; not our
  shippable source.
- URLs: https://osf.io/xp6sz/ · paper: https://www.academia.edu/2835895/

#### #5. Wiktionary Spanish frequency lists
- **What:** Community lists — "Top 10,000 / Top 1000 Spanish words from subtitles," plus links to
  Leipzig- and OpenSubtitles-derived lists.
- **Quality:** Convenient, human-browsable, but ultimately **re-hosts the sources above** (mainly
  OpenSubtitles). No new corpus value.
- **License:** Wiktionary text is **CC-BY-SA** (plus the underlying lists' own licenses). Safe to
  consult.
- **Verdict:** Handy quick reference / eyeball check; cite the upstream source, not Wiktionary, for
  anything substantive.
- URL: https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Spanish

### Tier 3 — Reference-only (do NOT copy the compiled list/book)

#### #6. Corpus del Español — Mark Davies (corpusdelespanol.org / wordfrequency.info)
- **What:** The most authoritative Spanish corpus family. The **Web/Dialects** corpus is ~2 billion
  words from **21 Spanish-speaking countries** with **per-country subcorpora** — the single best tool
  for LatAm-vs-Spain lexical comparison. wordfrequency.info sells derived lemma/frequency lists.
- **Free vs paid:** The **online interface is free** (registration/limited queries). Downloadable
  frequency lists: **samples free** (every 10th entry; top-5,000 entries now downloadable per site
  copy), **full 20k-lemma lists + genre/collocate breakdowns are paid**. **[pricing/free-tier details
  from search snippets; wordfrequency.info returned 403 to direct fetch — unverified]**
- **License / terms:** The downloadable lists are **licensed data**, not open. Site terms require
  attribution to www.wordfrequency.info if re-posted, and the site **runs automated nightly checks for
  unauthorized copies.** ⇒ **Do NOT redistribute or ship their list.** You *may* still legally *learn
  facts* from the free interface (e.g., that a word ranks top-500, or that `carro` outranks `coche` in
  Mexico) — facts aren't owned — but treat the compiled table as off-limits to copy.
- **Verdict:** **Best for LatAm dialect insight; consult the free web interface for facts only.** Do
  not buy or copy the list for shipping — our Tier-1 free sources cover the ranking need.
- URLs: https://www.corpusdelespanol.org/ · https://www.corpusdelespanol.org/compare_corpes.asp · https://www.wordfrequency.info/spanish.asp

#### #7. Routledge — *A Frequency Dictionary of Spanish* (Mark Davies; 2nd ed. Davies & Davies)
- **What:** Published book: top ~5,000 lemmas with definitions, example sentences, thematic vocab
  boxes, register/dialect notes. Derived from a 20M-word corpus balanced spoken/fiction/non-fiction
  across Spain + Latin America.
- **License:** **Fully copyrighted commercial book.** The rank-ordered list *as a curated compilation*,
  and especially all definitions/examples/prose, are protected. **Reference-only.**
- **Safe use:** Read it, let it inform judgment, cite individual *facts* ("`tener` is a top-15 verb").
  **Do not reproduce its list, its example sentences, or its thematic groupings.**
- **Verdict:** Excellent human-curated sanity check if a copy is on hand; never a data source to lift.
- URL: https://www.amazon.com/Frequency-Dictionary-Spanish-Vocabulary-Dictionaries/dp/0415334292

#### #8. CORPES XXI (RAE) — Corpus del Español del Siglo XXI
- **What:** RAE's 400M+ word 21st-century corpus. **v1.1 (April 2024) added a lexical frequency
  dictionary** for the first time — downloadable frequency inventories (absolute + normalized, by
  lemma/form/POS), and virtual subcorpora.
- **Access / usability:** **Free** via web interface; **no official API** (contact corpus@rae.es for
  programmatic access). Inventories exportable as .txt → spreadsheet. Interface is powerful but
  clunkier and more academic than the tools above. RAE pages returned **403 to automated fetch** —
  **[frequency-dictionary/v1.1 details from search snippets, unverified by direct read].**
- **LatAm:** Pan-Hispanic by design (RAE + American academies), filterable by region/country.
- **License:** RAE corpus data is provided for **consultation/research**; terms are restrictive about
  bulk reuse — **consult for facts, don't redistribute.**
- **Verdict:** Authoritative, LatAm-inclusive, now has real frequency data — good corroborating
  reference, but heavier to use than wordfreq. Facts-only.
- URLs: https://www.rae.es/banco-de-datos/corpes-xxi · https://www.rae.es/noticia/conozca-algo-mas-el-corpes-listados-de-frecuencias

#### CREA (RAE, older corpus) — honorable mention
- 160M-word reference corpus; RAE publishes a **1,000-most-frequent-forms** list (free, but delimiter/
  encoding-messy). Community-cleaned copy: https://github.com/rivaquiroga/frecuencias-crea (repo has
  **no explicit license**; underlying RAE data terms restrictive). Older and less LatAm-balanced than
  CORPES. Consult-for-facts only. URL: http://corpus.rae.es/creanet.html

---

## 2. Recommended working approach for AIdioma

**Primary source: `wordfreq` (Python), cross-checked against hermitdave/FrequencyWords.**
Both are free, CC-BY-SA, conversational-register (ideal for a chat-centric app), and pan-Hispanic.

Workflow:
1. **Hand-author** each lesson's ~10 vocab items from pedagogical/thematic judgment (greetings, family,
   food, numbers, core verbs, etc.) — we own this selection.
2. **Verify frequency band** programmatically: for each candidate word, pull its rank/Zipf from
   `wordfreq` (lemma-aware — sum inflected forms for verbs). Flag any A1 candidate that falls *outside*
   the top ~2,000–3,000 band as "is this really beginner-core?" A hard floor: aim for launch vocab in
   the **top ~1,000–1,500 lemmas**, with a handful of thematic exceptions (e.g. specific food/color
   nouns that are pedagogically essential but rank lower).
3. **LatAm dialect check** on region-sensitive words: use the free **Corpus del Español Web/Dialects**
   interface (facts only) or a **Leipzig per-country (MX/AR)** list to confirm the neutral-LatAm form
   (e.g. prefer `carro`/`auto` context appropriately — see §4).
4. **Never ship a copied table.** Our repository stores *our* vocab list; frequency ranks are recorded
   as derived facts/metadata, with a sources note crediting wordfreq (Robyn Speer) + OpenSubtitles.

This is defensible on every source's terms: we *consulted* freely, *copied* nothing.

---

## 3. Practical orientation — the shape of the top ~500 Spanish words

Every large Spanish frequency list agrees on the broad picture (this structure is itself an
uncopyrightable fact). Implications for A1 selection:

- **Function words dominate the very top (~top 100–150):** articles (`el/la/los/las/un/una`),
  prepositions (`de, en, a, por, para, con, sin`), conjunctions (`y, o, pero, porque, que`), pronouns
  (`yo, tú, él, ella, nosotros, me, te, se, lo, le`), high-frequency adverbs (`no, sí, muy, más, ya,
  también, aquí, ahora`). ⇒ These must be **taught implicitly through sentences from lesson 1**, not
  drilled as isolated "vocab cards" — they're grammar glue.
- **A small set of ultra-frequent verbs appears extremely early** — the ones to front-load:
  **`ser, estar, haber, tener, hacer, ir, poder, decir, querer, ver, saber, dar, poner, venir, salir,
  llegar, pasar, deber, poner, creer, hablar, llevar, dejar, seguir, encontrar, llamar, vivir,
  necesitar, gustar`.** For A1, prioritize **`ser/estar` (be), `tener` (have), `ir` (go), `hacer`
  (do/make), `querer` (want), `poder` (can), `gustar` (like), `hablar, comer, vivir`** (also the three
  regular -ar/-er/-ir model verbs).
- **Content nouns become dense from ~rank 150–500,** clustered by everyday domain: time (`día, año,
  tiempo, hora, vez, momento`), people/family (`hombre, mujer, persona, gente, niño, casa, vida,
  padre, madre, amigo`), place (`país, ciudad, mundo, lugar, calle, casa`), and communication (`cosa,
  parte, forma, caso, trabajo, agua`). ⇒ These map cleanly onto **thematic A1 lessons** (family, home,
  food, city).
- **Question words** (`qué, quién, cómo, cuándo, dónde, por qué, cuánto`) and **numbers** (`uno…diez,
  cien, mil`) are high-frequency and pedagogically essential ⇒ dedicate early lessons; they punch above
  their thematic weight.
- **Common adjectives** appear steadily: `bueno, malo, grande, pequeño, nuevo, mismo, mucho, poco,
  primero, último`, plus colors — good A1 material.

**Selection heuristic:** For each launch lesson, anchor on **1–2 high-frequency verbs + a themed set of
top-1,500 nouns + the function/question/number words the grammar of that lesson needs.** Frequency
confirms the "core," pedagogy chooses the theme.

---

## 4. Neutral-LatAm caveats

**The risk:** Book-based and Peninsular-weighted corpora (classic Routledge dictionary; older CREA)
over-represent Spain. Subtitle/web blends (wordfreq, OpenSubtitles, Leipzig-country editions) are more
LatAm-balanced. Raw frequency alone can steer you to a **Spain-preferred synonym** that sounds foreign
in Latin America.

Region-sensitive pairs to decide deliberately (pick the neutral-LatAm form; teach Spain's as a note):

| Concept | Spain-preferred | Neutral / LatAm-preferred |
|---|---|---|
| car | coche | **carro** (Mex/Col/CenAm) / **auto** (Southern Cone) — both beat `coche` in LatAm |
| computer | ordenador | **computadora** (most LatAm) / computador (Chile/Col) |
| cell phone | móvil | **celular** |
| to drive | conducir | **manejar** |
| juice | zumo | **jugo** |
| potato | patata | **papa** |
| glasses | gafas | **lentes / anteojos** |
| bus | autobús | **camión** (Mex) / **colectivo** (Arg) / **guagua** (Carib) — genuinely regional |
| "you all" | vosotros | **ustedes** (LatAm uses `ustedes` universally — teach this, not `vosotros`) |
| pen | bolígrafo | **lapicero / pluma / lápiz de pasta** (regional) |
| apartment | piso | **departamento / apartamento** |

**Grammar-level LatAm defaults for the app:** use **`ustedes`** (not `vosotros`) for plural "you";
prefer **`tú`** for informal singular but be aware of **`vos`** in the Southern Cone/Central America
(teach `tú` as the neutral default). Preterite-preferring past-tense usage (LatAm) over Spain's
present-perfect leaning.

**Which source handles LatAm best:**
- **Corpus del Español – Web/Dialects (Davies)** is the *single best diagnostic* — per-country
  subcorpora across 21 nations let you literally compare `carro` vs `coche` vs `auto` frequency by
  country. Use its **free web interface for facts** to settle any disputed pair. (Six documented
  dialect zones: European, Southern Cone, Andean, Caribbean, Northern & Southern Central America.)
- **Leipzig** offers per-country (MX/AR) downloadable lists — free CC-BY, good for a scripted check.
- **wordfreq / OpenSubtitles** are pan-Hispanic blends (good neutral default, but *not* country-
  filterable — they won't by themselves tell you a word is Mexican vs Argentine).
- **Recommendation:** default lexical choices to the neutral-LatAm column above; when a synonym pair is
  genuinely contested, resolve it with a quick free lookup in **Corpus del Español Web/Dialects** by
  country. Avoid letting Routledge/Peninsular frequency alone pick the word.

---

## 5. Sources (all URLs)

**Tier 1 (free, usable):**
- wordfreq: https://github.com/rspeer/wordfreq · https://github.com/rspeer/wordfreq/blob/master/NOTICE.md · https://pypi.org/project/wordfreq/
- hermitdave/FrequencyWords: https://github.com/hermitdave/FrequencyWords · https://github.com/hermitdave/FrequencyWords/blob/master/LICENSE
- Leipzig Corpora: https://wortschatz.uni-leipzig.de/en/download/ · https://wortschatz-leipzig.de/en/freqdict

**Tier 2:**
- SUBTLEX-ESP: https://osf.io/xp6sz/ · https://www.academia.edu/2835895/
- Wiktionary Spanish frequency lists: https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Spanish

**Tier 3 (reference-only):**
- Corpus del Español (Davies): https://www.corpusdelespanol.org/ · https://www.corpusdelespanol.org/compare_corpes.asp · https://www.wordfrequency.info/spanish.asp
- Routledge Frequency Dictionary of Spanish: https://www.amazon.com/Frequency-Dictionary-Spanish-Vocabulary-Dictionaries/dp/0415334292
- CORPES XXI (RAE): https://www.rae.es/banco-de-datos/corpes-xxi · https://www.rae.es/noticia/conozca-algo-mas-el-corpes-listados-de-frecuencias
- CREA (RAE): http://corpus.rae.es/creanet.html · cleaned copy: https://github.com/rivaquiroga/frecuencias-crea
- Legal basis: Feist Publications, Inc. v. Rural Telephone Service Co., 499 U.S. 340 (1991)

**Verification notes:** wordfreq NOTICE.md, hermitdave LICENSE, Wiktionary, Leipzig, SUBTLEX-ESP,
CREA-repo, and Corpus-del-Español dialect facts were read/confirmed live. **wordfrequency.info and
rae.es returned HTTP 403 to automated fetch** — their pricing/free-tier and CORPES-v1.1 frequency-
dictionary details rest on search-engine snippets and are marked **[unverified]** above; confirm by
opening those pages in a browser before relying on exact prices or export formats.
