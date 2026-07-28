# Schema Approvals Log
Roles: Lesson Plan agent PROPOSES · App Design Coordinator APPROVES/REQUESTS CHANGES · Mike arbitrates disputes.
Schema status: v0-DRAFT (unapproved) → v1-FROZEN (approved; additive-only after; additive changes still logged here for approval, may be batched)

| ID | Date | Change (one line) | Rationale | Status | Coordinator notes |
|----|------|-------------------|-----------|--------|-------------------|
| P-001 | 2026-07-21 | Full schema v1 (`packages/lesson-schema/src/index.ts`: item kinds incl. new `multipleChoice`, flashcard view-flag, `provenance`, `openingLineGloss`; GrammarTag enum v1 = 53 tags) + golden lesson `content/lessons/a1/a1-01-hola-me-llamo.json` | Consensus §1.1 sketch pressure-tested through real authoring + adversarial QA; deltas documented in the archived proposal notes | **APPROVED** | 2026-07-21, App Design Coordinator. All 5 rulings granted — see "P-001 ruling" below. Schema → **v1-FROZEN** (additive-only). Evidence independently re-verified (smoke 11/11, validator 0 err, tsc clean). |

| P-002 | 2026-07-21 | Additive: required `id` on PassageSegment (`.p.NN.NN` convention); golden lesson + validator updated | Cross-contract audit F1 CRITICAL: segments were the only evaluable atom with no id — no itemRef possible for reading eval, outside immutable-ID regime; full rationale in SCHEMA-NOTES.md §P-002 | **APPROVED** | 2026-07-21, App Design Coordinator. Audit F1 is correct: consensus §1.2 makes every segment independently evaluable, and a positional ref can't survive the immutable-id/deprecation regime — approving before 11 more passages bake in the defect is the right call. Backfill is complete corpus-wide (a1-01 by proposer, a1-02/a1-03 during this session's pilot fix loops); validator PASS 0 errors, snapshot includes segment ids. **Process note:** this landed in the frozen schema before approval; acceptable at a 3-lesson corpus where it was fixable in-flight, but post-scale a required-field change must arrive as a proposal + migration plan and wait for the ruling — a strict-additive (optional-then-required) two-step. The SCHEMA-NOTES "P-002 candidates" section (formula.courtesy tag, set-vocab marker, VocabItem.acceptedEn) is NOT covered by this ruling — file those as P-003 when ready; the VocabItem.acceptedEn candidate looks strong (typed-recall grading is live in the prototype). |

| P-003 | 2026-07-21 | Batched additive/optional: (1) `acceptedEn`+`acceptedEs` on VocabItem · (2) A1 tag `formula.courtesy` (`GRAMMAR_TAG_VERSION`→2) · (3) optional `setId` on VocabItem | Prototype typed-recall + courtesy tag honesty + set-vocab CI | **APPROVED** | 2026-07-28, App Design Coordinator (operator chose approve all three). Schema updated: VocabItem fields + tag + version 2. a1-01 s.09–s.12 re-tagged → `formula.courtesy`, contentVersion 2. **Still owed (content hygiene, not blocking approval):** vocab `acceptedEn`/`acceptedEs` backfill on a1-01/02/03; validator check-5 `setId` partition (tooling). See OI-025. |

| P-004 | 2026-07-23 | Additive scaffolding: `AcceptedEntry` = `string \| { text, region? }` on vocab/sentence accept arrays | Reserve dialect grain without launch content | **APPROVED** | 2026-07-28, App Design Coordinator — operator chose **reserve shape only** (not launch dialects). Option (a) per-entry region. **No launch lesson gains region tags**; neutral LatAm/`tú` stays canonical. Dialect *content* = post-MVP (PM-005). Schema union landed; existing string arrays remain valid. |

| P-005 | 2026-07-23 | Additive: `referenceCard` kind + optional `referenceCards[]` (study-on-demand; never graded) | Feature 10 study cards; seeds deeper lessons | **APPROVED** | 2026-07-28, App Design Coordinator — operator chose **ship in MVP** (UI on lesson detail / study affordance; not part of Mix practice arc). Schema optional/default `[]` — existing lessons valid with zero cards. Author cards where useful (not required on every lesson for launch). Content authoring for cards can trail app UI. |

| P-006 | 2026-07-28 | Additive: `deprecated: boolean = false` on every authored item/segment | Make “deprecate, never delete” executable before the shared contract moves to its package | **APPROVED** | 2026-07-28, App Design Coordinator during A0 legacy/SSOT audit. Existing content parses unchanged via default. Seed keeps historical rows addressable and excludes deprecated items from new sessions. |

Statuses: PROPOSED / APPROVED / CHANGES-REQUESTED / REJECTED

## P-001 — evidence & requested rulings (for the App Design Coordinator)

**Artifacts:** `packages/lesson-schema/src/index.ts` (compiles clean; smoke at `packages/lesson-schema/test/schema-smoke.ts`) · `Docs/Archive/Content/lesson-schema-proposal-notes.md` (historical rationale) · golden lesson `content/lessons/a1/a1-01-hola-me-llamo.json` · `tooling/content/validate.ts` (CI checks, fixtures as tests) · QA verdict `content/review/qa/a1-01.qa1.json`.

**Golden-lesson gate history:** drafted per `content/authoring/draft-prompt.md` → validator PASS (0 errors; 5 justified entry-lesson alternate warnings, exemption codified in Style Guide §4) → adversarial L2 QA PASS (0 critical / 0 major / 4 minor) → minors fixed (3 alternates added) → re-validated 0 errors. Stats: 12 vocab (9 + 3 chunks), 14 sentences (avg ~2.6 acceptedEs), passage, conversation seed, 3 quickChecks, 4 flashcard-eligible.

**Explicit rulings requested:**
1. `multipleChoice` item kind + optional `quickChecks[]` (0–6) per lesson — index-graded, never calls `/api/evaluate` (Mike floated; exercised in the golden lesson).
2. Sentence-flashcard mode as a view-flag on `SentenceItem` (`flashcard {eligible, front?}`) — no new item kind, no content duplication (Mike floated).
3. Optional per-item `provenance {source, sourceId?, license}` — absent = original; enables future corpus ingestion (Tatoeba etc.) without migration.
4. Freeze scope: approve the **A1 tag block (30) as frozen**; A2 (16) + B1 (7) tags as **provisional/additive-until-authored**.
5. Note the P-002 candidates listed in SCHEMA-NOTES.md (e.g. `formula.courtesy` tag; set-vocab marker) — not blocking, listed for awareness.

Per protocol: flip P-001's status above with notes; CHANGES-REQUESTED items will be revised under the same ID; disputes escalate to Mike in this log.

## P-001 ruling — APPROVED (App Design Coordinator, 2026-07-21)

**Verification performed independently this session** (not taken on trust): contract smoke PASS · validator 0 errors / 5 warnings (the codified Style-Guide-§4 L1 exemption class) · typecheck clean · QA verdict `content/review/qa/a1-01.qa1.json` read in full (PASS, 0 critical/major; the 3 minor alternates confirmed present in the lesson) · schema read line-by-line against consensus §1.1 (all sketch constraints kept verbatim: vocab 8–15, sentences 12–20, exactly 3 hints, `grammarTags.min(1)`, immutable ids, `contentVersion`, literal `schemaVersion: 1`).

**Rulings:**

1. **`multipleChoice` kind + `quickChecks[]` (0–6) — APPROVED as-is** (not "reserved"). The prototype already ships an MC Quiz phase in the Mix arc, and a1-01's 3 quickChecks map onto it cleanly (verified in `apps/prototype/lesson-data.js`). Index-graded / never hits `/api/evaluate` is exactly right. In the real app, `correctIndex` must be graded server-side or stripped from the pre-answer payload. **App-track resolution (2026-07-28):** MC attempts persist in `evaluations` with modality `multipleChoice`; see `Docs/Specs/Areas/data-model.md`.
2. **Sentence-flashcard as view-flag on `SentenceItem` — APPROVED.** Matches the prototype's Type-mode Words/Sentences toggle; one source of truth per sentence; `front` as default-not-scheduler is the right split.
3. **Optional per-item `provenance` — APPROVED.** Purely additive; absent = original; enables Tatoeba-class ingestion at A2+ with no migration.
4. **Freeze scope — APPROVED as proposed.** A1 block (30) **frozen**; A2 (16) + B1 (7) **provisional/additive-until-authored**. The app will import `GrammarTag`/`GRAMMAR_TAGS` from `lesson-schema.ts` — no redeclaration (the dual-taxonomy failure mode stays dead).
5. **P-002 candidates — noted.** `formula.courtesy` (or similar) is a *good* candidate: the QA advisory on s.09–s.12 shows real misattribution risk into the `agreement.gender-number` bucket. Also noted: set-vocab marker for the VOCAB_EXERCISED check. Batch when A1 tags next open.

**Consequence:** schema status v0-DRAFT → **v1-FROZEN**. The scaled-production hard gate is **released from this side**; note Mike's separate mid-session pause ("wire prototype first") — that pause is now also satisfied (a1-01 is live in the prototype), but mass drafting of a1-02…a1-12 should get Mike's explicit go, since he asked for the pause personally.
