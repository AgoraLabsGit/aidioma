# Lesson Infrastructure — canonical record

**Recorded:** 2026-07-27 · **State as of:** 2026-07-28 (A0 schema rulings reconciled)
**Why this doc exists:** the lesson pipeline physically lives in `/lesson-content/`, but app-track sessions read only `MVP-DESIGN/`. This file records what the lessons infrastructure *is*, what's built, what isn't, and how the app consumes it — so neither track has to reverse-engineer the other. Companions: `RESEARCH-CONTENT-DATA-SOURCES-2026-07-21.md` (licensing survey), `HANDOFF-CONTENT-TRACK.md` (content-track brief), `MVP-DESIGN-CONSENSUS-2026-07-21.md` §1.1–1.4 (the contract this implements).

---

## 1. Where everything lives

```
lesson-content/                     # canonical content + the shared schema (SSOT)
  schema/lesson-schema.ts           # Zod schema + GrammarTag enum — SINGLE SOURCE OF TRUTH
  schema/schema-smoke.ts            # 12 smoke assertions on the schema itself
  schema/SCHEMA-APPROVALS.md        # governance log (P-001…P-005) — app track rules here
  schema/SCHEMA-NOTES.md            # per-proposal rationale / deltas vs consensus sketch
  curriculum/CURRICULUM-MAP.md      # the A1 spine (12 launch lessons) + A2 outline
  curriculum/SOURCES.md             # source ranking, licensing rules, ingestion policy (§2b, §5)
  curriculum/research/*.md          # PCIC inventory, CEFR descriptors, frequency, OER sequencing,
                                    #   + two panel reviews of the map (pedagogy / practicality)
  style/STYLE-GUIDE.md              # register: neutral LatAm, tú, formatting rules
  tools/                            # the pipeline (see §4)
  lessons/a1/*.json                 # the content itself, one file per lesson
  review/REVIEW-LOG.md              # per-lesson gate status (PENDING→LAUNCH-READY)
  review/qa/*.json                  # adversarial QA reports, per lesson per round
  review/audits/*.md                # contract + tooling audits
  review/FOUNDER-REVIEW-PILOT.md    # founder go/no-go package
  review/NATIVE-REVIEWER-BRIEF.md   # brief for the paid layer-4 reviewer
prototype/lesson-data.js            # generated: real lessons injected into the UI prototype
```

Content is **CI-validated typed JSON in the repo**; the database is a materialized serving copy (consensus §1.1). There is no CMS and no authoring UI — the schema + validator *are* the CMS.

## 2. The pipeline

Authoring runs through a four-layer gate (decisions doc Q3). Status vocabulary is defined in `review/REVIEW-LOG.md`:

| Stage | What happens | Artifact |
|---|---|---|
| **Draft** | LLM drafts a lesson against `tools/draft-prompt.md` + the curriculum-map row + style guide + prior lessons' vocab (so leak checks pass) | `lessons/a1/<id>.json` → `DRAFTED` |
| **L1 — validator** | `tools/validate.ts` enforces the CI-only invariants: Zod parse, globally unique + immutable ids (snapshot-diffed), `vocabRefs` resolve, every vocab item exercised by ≥1 sentence, unique ordinals, acyclic prerequisites, alternates present, hints escalate, and a cumulative-vocab **leak detector** (WARN-only by design) | exit 0/1 → `L1-PASS` |
| **L2 — adversarial QA** | A *different* model, prompted as a pedantic native editor (`tools/qa-prompt.md`), scores the lesson against the 10-point checklist and emits structured findings | `review/qa/<id>.qaN.json` → `L2-PASS` / `L2-FAIL(n)` |
| **L3 — founder review** | Mike's checklist pass; the judgment calls (naturalness, alternates coverage) | `review/FOUNDER-REVIEW-PILOT.md` → `L3-PASS` |
| **L4 — native review** | One paid native-speaker pass over the 12 launch lessons (~$200–400); 25% sampling after launch | flags applied + re-validated → `L4-PASS` → `LAUNCH-READY` |
| **Export** | `tools/export-prototype.ts` regenerates `prototype/lesson-data.js` so the UI prototype runs on real content | `window.AIDIOMA_LESSONS`, keyed `l<ordinal>` |

The gate demonstrably works: adversarial QA caught a genuine CRITICAL in a1-02 that the validator and drafting pass both missed.

## 3. Schema & governance

**Status: v1-FROZEN — additive-only.** The App Design Coordinator holds final approval; the Lesson Plan agent proposes. All proposals and rulings live in `schema/SCHEMA-APPROVALS.md`.

| # | Change | Status |
|---|---|---|
| P-001 | Full schema v1 — item kinds incl. `multipleChoice`, flashcard view-flag, `provenance`, `openingLineGloss`; **GrammarTag enum v1 = 53 tags**; + golden lesson a1-01 | **APPROVED** → v1-FROZEN |
| P-002 | Required `id` on `PassageSegment` (`.p.NN.NN`) so every evaluable atom has an itemRef | **APPROVED** (backfilled corpus-wide) |
| P-003 | Batched additive: `acceptedEn`/`acceptedEs` on VocabItem, `formula.courtesy` (GrammarTag v2), optional `setId` | **APPROVED**; remaining backfill/tooling → OI-025 |
| P-004 | Optional per-entry `region` tag on accepted answers | **APPROVED shape only**; dialect content/UI → PM-005 |
| P-005 | Non-graded `referenceCard` kind + optional `referenceCards[]` | **APPROVED for MVP**; lesson-detail study only |

**Process rule established by the P-002 ruling:** a required-field change must arrive as a proposal *plus a migration plan* and wait for the ruling — strict-additive two-step (optional → required). P-002 landing before approval was tolerated only because the corpus was 3 lessons deep and fixable in flight.

## 4. Tooling inventory

Run from `lesson-content/` (note: only `smoke` and `typecheck` are npm scripts; the rest run via `tsx` directly).

| Tool | Command | Purpose |
|---|---|---|
| `schema/schema-smoke.ts` | `pnpm smoke` | 12 assertions that the schema itself behaves (accepts golden shapes, rejects malformed) |
| `tools/validate.ts` | `./node_modules/.bin/tsx tools/validate.ts` | The L1 gate. Flags: `--lesson <id>` (validate one in the context of all), `--update-snapshot`, `--snapshot`, `--allowlist`, `--json` (machine-readable, for QA agents). Exit 0 iff zero ERRORs; WARN/INFO never fail |
| `tools/id-snapshot.json` | (auto) | Immutable-ID enforcement — ids may be added, never removed/renamed |
| `tools/lexicon-allowlist.json` | (hand-maintained) | Suppresses false positives in the leak detector |
| `tools/draft-prompt.md` | (prompt) | The authoring procedure for drafting agents |
| `tools/qa-prompt.md` | (prompt) | The adversarial pedantic-native-editor pass |
| `tools/fixtures/run-fixtures.ts` | `tsx tools/fixtures/run-fixtures.ts` | Tests the validator itself against deliberately-broken fixtures (a1-01-hola, a1-02-malo) — i.e. the QA gate has its own tests |
| `tools/export-prototype.ts` | `tsx tools/export-prototype.ts` | Emits `prototype/lesson-data.js`; maps schema atoms → prototype item shapes (vocab → flash cards, sentences → translation items, etc.) |

## 5. Data sources — what powers what

Full licensing survey: `RESEARCH-CONTENT-DATA-SOURCES-2026-07-21.md`. Policy of record: `lesson-content/curriculum/SOURCES.md` §2b (sources) and §5 (ingestion strategy). In plain terms, five things the external data buys us:

| # | What we get | From | How it's used |
|---|---|---|---|
| 1 | Practice-sentence pool + alternate answers | **Tatoeba** (CC-BY, ~144K es-en pairs; links table yields multiple translations per sentence) | **Reserve, not bulk-ingested at MVP** — used QA-time for alternates mining and naturalness cross-check. Bulk pipeline is post-launch. Verbatim reuse needs per-sentence provenance + attribution |
| 2 | Automatic correctness checking of vocab/verbs | **kaikki.org Wiktionary extract** (CC-BY-SA — **facts only**: POS, gender, inflection tables) | Planned morphology validator in `tools/`; replaces the NC-licensed Jehle DB. Never copy glosses/examples (SA contamination) |
| 3 | Difficulty + vocab-priority ordering | **wordfreq** (primary) cross-checked against **hermitdave/FrequencyWords** | Vocab sequencing today; rare-word-density → `difficulty` 1–5 is phase-2 |
| 4 | Proven syllabus skeleton + conversation seeds | **FSI Spanish Basic** (public domain, LatAm, grammar-sequenced drills) and **COERLL CC-BY items** (contemporary LatAm transcripts) | Sequencing and pattern mining; 100% of FSI surface text gets rewritten (1957, usted-heavy) |
| 5 | Reading passages + future audio | PD graded readers, VOA (VOA-produced only), **Common Voice** (CC0) | A2+ reading fodder; audio reserved for post-MVP voice |

**Backbone for *what belongs at each level*:** Instituto Cervantes **PCIC** + CEFR descriptors — **reference-only, never ingested as data** (copyrighted, no data license); distilled in `curriculum/research/`.
**Hard avoid:** Anki shared decks, OPUS OpenSubtitles, Fred Jehle verb DB, Radio Ambulante, any CC-BY-NC item (incl. several COERLL projects on the same page as the CC-BY ones).
**Standing hazard:** share-alike contamination — SA sources are used for *facts* only; their prose never enters lesson JSON.

## 6. Current production state

- **Schema:** v1-FROZEN; GrammarTag v2 (54 tags); current smoke 12/12, validator 0 errors, `tsc` clean (A0-H re-verified 2026-07-28).
- **Lessons:** `a1-01-hola-me-llamo`, `a1-02-soy-asi`, `a1-03-que-haces` — all **L2-PASS** with QA artifacts on file; a1-01 is the golden lesson.
- **Prototype:** running on real content for l1–l3 via `lesson-data.js`.
- **Open:** founder go/no-go on drafting a1-04…a1-12; OI-025 content/tooling prep; L3/L4 layers not yet run on any lesson.

## 7. Not built yet (deliberate)

- **Phase-2 python-side tooling**, stubbed as TODOs at the bottom of `validate.ts`: (a) wordfreq-based difficulty cross-check, (b) kaikki/Wiktionary real inflection lookup to replace the pragmatic `expandForms` heuristic in the leak detector.
- **Tatoeba bulk-ingestion pipeline** — post-launch by policy (SOURCES.md §5).
- **No CI runner** — validation is local-only today; wire `validate` + `smoke` into the app repo's CI in A1.
- **No `validate`/`export` npm scripts** — invoked via `tsx` paths above.
- **L3/L4 review layers** — process and briefs exist; not yet executed.

## 8. How the app track consumes this

1. **`schema/lesson-schema.ts` is the contract.** The app imports/mirrors it rather than redefining lesson types; changes flow through SCHEMA-APPROVALS, not through app-side edits.
2. **DB mapping** (consensus §1.4): `lessons` + `lesson_items` (one table, discriminated by `kind`, payload jsonb) are a *serving copy* seeded idempotently by slug from these JSON files. Authored ids are the row ids — which is why P-002 mattered: every evaluable atom needs a stable `itemRef`.
3. **Evaluation grain:** `itemRef = "lessonId:itemId"`; authored `acceptedEs`/`acceptedEn` feed the comparison-first gate, so alternate coverage is directly an AI-cost lever.
4. **Shared taxonomy:** the GrammarTag enum is the same enum used for `errorTags` on evaluation results — the hinge that lets the blender and Progress-by-grammar-point work.
5. **Prototype path:** `tsx tools/export-prototype.ts` → `prototype/lesson-data.js`, merged over mock lessons by `l<ordinal>` key.

## 9. Obligations that ship with the product

- **Tatoeba attribution** if any sentence is used verbatim — keep sentence ids + contributor metadata in the DB from day one (retrofitting is painful).
- **wordfreq / FrequencyWords attribution** where frequency ranks are exposed as derived metadata.
- **COERLL CC-BY attribution** for conversation seeds derived from their materials.
- **Provenance field** exists on items (`provenance`) — use it; it is the audit trail that keeps licensing defensible.
