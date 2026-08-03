# AUDIT — lesson-content tooling (validate.ts / export-prototype.ts / schema-smoke.ts)

Date: 2026-07-21
Auditor: isolated read-only code auditor (no authorship context)
Targets:
- `tools/validate.ts`
- `tools/export-prototype.ts`
- `schema/schema-smoke.ts` (+ `schema/lesson-schema.ts`)
Consumer cross-checked: `prototype/index.html`
All counter-examples were generated and run in the scratchpad against a copy of the two
real lessons (`lessons/a1/a1-01-hola-me-llamo.json`, `a1-02-soy-asi.json`) with isolated
snapshot files so the real snapshot / lesson-data.js were never mutated (originals restored).

## Baseline (green confirmed)
- `schema/schema-smoke.ts` → SMOKE OK, all checks pass (53 grammar tags).
- `tsx tools/validate.ts lessons/` → 0 errors, 5 warnings, RESULT: PASS.
- `tsx tools/export-prototype.ts` → runs; re-running is byte-identical (idempotent confirmed).

---

## WARNING findings

### W1. `--lesson <id>` silently masks every `(global)` ERROR (disables the snapshot immutability check)
- Target: `tools/validate.ts` (`matchesLesson` / exit-code filter, lines 424–426, 697–699).
- Reproduction: snapshot requiring a now-absent id (forbidden deletion):
  - snapshot `{ ids: { "a1-99.v.ghost": {"contentVersion":1} } }`, corpus = a1-01 + a1-02.
  - Full corpus: `validate.ts <corpus> --snapshot <snap>` → **exit 1** (SNAPSHOT_MISSING fires, correct).
  - Per-lesson: `validate.ts <corpus> --snapshot <snap> --lesson a1-01-hola-me-llamo` → **exit 0**.
- Cause: `SNAPSHOT_MISSING`, `SNAPSHOT_UNREADABLE`, `ALLOWLIST_UNREADABLE` are emitted with
  `lessonId = '(global)'`. `--lesson` filters findings to `f.lessonId === id`, so all global
  ERRORs are dropped from the exit-code decision.
- Impact: any CI / pre-commit hook that validates a changed lesson with `--lesson` (the flag's
  documented purpose) will never fail on a forbidden id deletion — check 9's immutability
  guarantee is silently off in that mode. It also masks an unreadable snapshot.
- Suggested fix (not applied): the exit-code / report set for `--lesson` should always include
  `(global)` findings in addition to the named lesson's.

### W2. Explanation ≤150-word check (check 7) is bypassed by a fenced code block
- Target: `tools/validate.ts` `stripMarkdown` (line 157) + `wordCount` (169); ERROR check line 486.
- Reproduction: `explanation.markdown = "Intro.\n\n```\n" + 400_words + "\n```"`.
  - `wordCount` of the 400-word fenced block = **1** (the fence is replaced with a single space).
  - `validate.ts` on that lesson → **0 errors** (EXPLANATION_WORDS never fires). 400 plain words
    correctly reports the error, confirming the fence is the escape hatch.
- Impact: an arbitrarily long explanation passes the ≤150-word budget by wrapping prose in a
  code fence. A genuine ERROR-level invariant is defeated by pathological (but valid) markdown.
- Suggested fix (not applied): count words on the visible text *including* code-fence contents,
  or reject/flag fenced code in explanations.

### W3. No ordinal ↔ slug-number consistency check
- Target: `tools/validate.ts` check 3 (lines 341–356) checks slug==filename, ordinal uniqueness,
  level prefix — but never that the numeric part of the slug matches `ordinal`.
- Reproduction: a1-01 lesson with `ordinal: 7` → validator PASS (0 errors).
- Impact: the "ordinal/slug/level consistency" claim is only partly enforced. A mismatch
  silently mis-keys the exporter (`a1-01` → `l7`) and corrupts prior-lesson vocabRef semantics
  (check 4 compares by ordinal, not slug), so "prior/future" resolution can be wrong while green.
- Suggested fix (not applied): parse the trailing number from the slug and assert `=== ordinal`.

### W4. `--update-snapshot` records ids from a FAILING corpus (mutates the immutability baseline on a red build)
- Target: `tools/validate.ts` `runSnapshotCheck` (lines 638–673) — writes unconditionally,
  before/independent of the ERROR exit.
- Reproduction: lesson with `hints[2] === es` (HINT_ANSWER_LEAK, ERROR). Run with
  `--update-snapshot` on a fresh snapshot → **exit 1** AND snapshot written with **33 ids** recorded.
- Impact: running the routine `--update-snapshot` on a corpus that is failing CI silently bakes
  the broken lesson's ids into the permanent immutability set. Later removal of that lesson then
  trips SNAPSHOT_MISSING. The snapshot is meant to be an authoritative baseline; it should not be
  advanced from a red build.
- Suggested fix (not applied): only persist new ids when the run has zero ERRORs (or gate behind
  an explicit `--force`).

### W5. Committed `prototype/lesson-data.js` is stale (and no freshness guard exists)
- Target: `tools/export-prototype.ts` output artifact.
- Reproduction: re-running the exporter changes the committed file by 506 lines. Committed file
  contains only `l1`; the current lessons produce `l1` + `l2` (a1-02 missing entirely), and a1-01's
  `acceptedEs` alternates have since changed.
- Impact: the shipped prototype data is out of sync with the validated lessons — the prototype
  renders without lesson 2. The exporter itself is correct/idempotent; the gap is that nothing
  (CI or otherwise) verifies the checked-in artifact is regenerated.
- Suggested fix (not applied): add a CI check that `export-prototype.ts` produces no diff, or
  regenerate and commit.

---

## NOTE findings

### N1. hint-3 leak check is exact-equality only (substring reveal passes)
- `tools/validate.ts` check 8 (lines 492–501) compares `normLoose(h3)` for full equality with
  `es` / `acceptedEs`. Reproduction: `hints[2] = "La respuesta es: Hola, soy Ana."` (contains the
  full answer verbatim) → 0 errors. A hint that literally spells out the answer plus extra words
  slips through. (NFC/NFD and trailing `¡!`/case variants ARE correctly caught — verified.)

### N2. Cumulative-vocab leak detector (check 12) blind spots
- `exampleEs` is never scanned: a vocab whose `exampleEs = "Hola, murcielago xilofono zutano."`
  raises no VOCAB_LEAK, though it is learner-facing Spanish. 
- Any Capitalized token not at sentence start is unconditionally exempted (proper-noun heuristic,
  line 542–543): `"Hola, soy Ana Fantasticamente."` → `Fantasticamente` not flagged. Untaught
  words dodge the detector by capitalization.
- Both are WARN-only (detector, not authority) so severity is low, but both are cheap to close
  (scan exampleEs; only exempt tokens that also fail lexicon lookup, or track a known proper-noun
  set).

### N3. Check 5 "every vocab exercised" verifies only the ref pointer, not the word
- `runPerLessonChecks` (lines 464–471) marks a vocab exercised when any sentence's `vocabRefs`
  contains its id. Reproduction: keep `vocabRefs:["a1-01.v.senor"]` but change the sentence `es`
  to `"El gato es de Argentina."` → 0 errors. A dangling ref satisfies the check even though the
  taught word never appears in the sentence.

### N4. Snapshot stores `contentVersion` but never validates it
- `Snapshot.ids[id].contentVersion` is recorded (line 654) and never compared on later runs.
  Reproduction: edit a1-01 sentence text but keep the same ids and `contentVersion: 1`, validate
  against a snapshot that already contains those ids → 0 errors. "Immutability" is enforced only
  as id-existence; an un-versioned content edit is undetectable, making the stored contentVersion
  dead data.

### N5. Duplicate vocab id across lessons corrupts `vocabOrdinal` (misattributed error)
- `vocabOrdinal` (lines 364–365) is last-write-wins. If a1-02 reuses `a1-01.v.hola`, that id's
  ordinal is overwritten to 2, and a1-01's own sentences referencing it then report
  `VOCABREF_RESOLVE … points to a FUTURE lesson` against the *innocent* a1-01. The build still
  fails (ID_UNIQUE also fires), so this is not a false negative — but the diagnostic points at the
  wrong lesson and could badly mislead an author.

---

## Exporter escaping (checked, NO defect)
- `export-prototype.ts` emits via `JSON.stringify`; quotes/newlines/backslashes are safely escaped.
- The one JSON-vs-JS gap (raw U+2028/U+2029, and `</script>`) is harmless here: the file is loaded
  as an external `<script src="lesson-data.js">` (not inline), and U+2028 is legal in ES2019+
  string literals — verified the emitted body evals cleanly. Shape mapping matches the consumer
  property-by-property (words/sentences/story/quiz; `seg` uses `context/es/accept/show/hint`;
  `flash`/`tr` use `es/en/accEs/accEn/pos/hint`; `mc` uses `prompt/options/correct/why/hint`).

---

## VERDICT
Not a clean pass. **0 CRITICAL, 5 WARNING, 5 NOTE.**
(No defect lets ERROR-level content through the *default* full-corpus `validate.ts lessons/`
invocation with normal content; the ERROR-check bypasses require either the opt-in `--lesson`
mode, a fenced-code explanation, or a slug/ordinal mismatch.)

Worst finding: **W1** — `--lesson` mode drops all `(global)` findings from the exit code, so a
forbidden id deletion (snapshot immutability, check 9) returns exit 0 and passes CI.

---

## Remediation 2026-07-21

All 5 WARNINGs fixed in `tools/validate.ts`; the 4 nominated cheap NOTEs (N1, N2, N5) applied;
N3/N4 skipped. New/fixed checks are proven by a counter-example suite,
`tools/fixtures/run-fixtures.ts` (17 assertions, each mutates a real lesson into an isolated
temp dir and asserts the expected code fires — or, for N5, does NOT misfire). P-002 real
segment ids were preserved (not undone).

| Finding | Status | Fix + how verified |
|---|---|---|
| **W1** — `--lesson` masks global ERRORs | FIXED | `matchesLesson` now also matches `lessonId === '(global)'`, so global findings always count toward report + exit code. Fixture W1: `--lesson` on a snapshot with a ghost id → `SNAPSHOT_MISSING` reported, exit 1. |
| **W2** — fenced code hides prose from ≤150 budget | FIXED | `stripMarkdown` now strips only the fence delimiters/info-string and keeps inner prose (inline code already kept). Fixture W2: 400-word fenced explanation → `EXPLANATION_WORDS` fires. |
| **W3** — no ordinal↔slug↔prefix check | FIXED | New ERROR `ID_PREFIX_CONSISTENCY` in check 3: (a) slug number == ordinal, (b) id prefixes unique across lessons, (c) every owned item id carries the lesson prefix. Fixtures W3a/W3b/W3c each fire the matching branch. |
| **W4** — `--update-snapshot` bakes in a red build | FIXED | `runSnapshotCheck` refuses to write when the run has any ERROR, emitting `SNAPSHOT_UPDATE_REFUSED` (with reason). Fixture W4: red build → refused, file not written, exit 1; W4b control: clean build still writes (`SNAPSHOT_UPDATED`). |
| **W5** — stale `prototype/lesson-data.js` | SUPERSEDED 2026-07-28 | The mtime coupling was removed during the content/app boundary cleanup. `npm run prototype:check` now compares generated bytes explicitly and fails on drift. |
| **N1** — hint-3 leak was exact-equality only | FIXED | New `normLeak` (accent/case/punct-stripped) + token-aligned substring match against `es` and every `acceptedEs`. Fixture N1: `"La respuesta es: <answer>"` → `HINT_ANSWER_LEAK`. |
| **N2** — exampleEs unscanned; blanket cap-exemption | FIXED | Leak detector now scans `vocab.exampleEs`; the blanket "capitalized mid-sentence ⇒ exempt" rule is removed in favour of an explicit `PROPER_NOUNS` set (+ existing allowlist). Fixtures N2a (exampleEs leak) and N2b (`Fantasticamente`) both fire `VOCAB_LEAK`. |
| **N3** — check 5 verifies ref pointer, not word presence | SKIPPED | Not in the required set; closing it means matching the taught word against sentence text (heuristic, false-positive-prone). Deferred to phase-2 morphology tooling. |
| **N4** — `contentVersion` recorded but never validated | SKIPPED | Not in the required set; content-drift detection needs a hashing/versioning design decision beyond this hardening pass. |
| **N5** — duplicate id corrupts `vocabOrdinal` | FIXED | `vocabOrdinal` is now FIRST-write-wins, so a later duplicate can't overwrite the original owner's ordinal and misattribute a FUTURE-lesson error. `ID_UNIQUE` still flags the real dup. Fixture N5 asserts both. |

**Verification run (final):** `schema-smoke.ts` → SMOKE OK (53 tags); `tools/fixtures/run-fixtures.ts`
→ 17/17 PASS; `validate.ts lessons/` → **RESULT: PASS, 0 errors, 5 warnings** (pre-existing
`ACCEPTED_ES_COUNT`/`ACCEPTED_EN_EMPTY` on a1-01, unchanged by this work); `tsc --noEmit` clean.
No new check fires on real content. (The pre-P-002 fixture pair `a1-01-hola.json` /
`a1-02-malo.json` predates required segment ids and no longer Zod-parses; the authoritative
suite is now `run-fixtures.ts`, which generates isolated, current fixtures on the fly.)
