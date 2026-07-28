# AIdioma — Content QA Review Log

Per-lesson tracking for the 12 A1 launch lessons through the four-layer content review gate. Update the status columns as each lesson advances; record anything systemic in the incidents section at the bottom.

---

## The four-layer review gate

Every lesson passes through four gates, cheapest first, before it is launch-ready. A lesson only advances when the prior layer is clean.

- **L1 — CI validator (automated).** The `content:validate` schema/lint pass: valid schema, IDs well-formed and unique, exactly 3 hints per sentence, 3–6 Spanish sentence alternates, English alternates surfaced for review, `vocabRefs` resolve to this-or-prior lessons (no vocab leakage), explanation ≤150 words, difficulty present. Machine-checkable rules only.
- **L2 — adversarial LLM pass.** A *different* frontier model from the one that drafted the lesson, prompted as a pedantic native editor, runs the 10-point checklist and returns structured findings. Catches ~80% of the drafting model's blind spots before any human time is spent. Re-run after each fix round; track rounds as `L2-FAIL(n)` → `L2-PASS`.
- **L3 — founder checklist review.** Mike works the 10-point checklist by hand: grammar, naturalness, register, English quality, alternates, vocab leakage, hints, grammarTags, explanation, difficulty. Catches what a non-native founder reliably *can* catch (structural + grammatical errors); defers naturalness/register authority to L4.
- **L4 — native-speaker review.** One paid native LatAm reviewer (see `NATIVE-REVIEWER-BRIEF.md`) redlines the full lesson: errors in taught content (<1% bar), the accepted-alternates pass, passage/conversation naturalness. Their flags are triaged, applied, and the lesson is re-validated (back to L1) before it clears.

**The 10-point checklist** (used by L2 and L3) lives in `MVP-DECISIONS-RECOMMENDED-2026-07-21.md` §Q3 and mirrors the pre-flight in `style/STYLE-GUIDE.md` §10.

### Status vocabulary

| Status | Meaning |
|---|---|
| `PENDING` | Not yet drafted. |
| `DRAFTED` | Draft written; not yet through any gate. |
| `L1-PASS` | Passed the CI validator. |
| `L2-PASS` | Passed the adversarial LLM pass (clean). |
| `L2-FAIL(n)` | Failed the adversarial pass; `n` = round number of the current/last failing pass. |
| `L3-PASS` | Passed founder checklist review. |
| `L4-PASS` | Passed native-speaker review; flags applied and re-validated. |
| `LAUNCH-READY` | Cleared all four layers; frozen at a stamped `contentVersion`. |

Per-lesson `L2` column records the outcome plus rounds, e.g. `PASS (r2)` = passed on the second adversarial round.

---

## Per-lesson status

| Lesson | Draft date | L1 | L2 (rounds) | L3 | L4 | contentVersion | Notes |
|---|---|---|---|---|---|---|---|
| `a1-01-hola-me-llamo` | — | PENDING | L2-PASS (0 CRIT / 0 MAJ / 4 MIN, r1) | PENDING | PENDING | 3 | Greetings & introducing yourself; L2 minors fixed, re-validated. quickCheck prompts restyled per Mike 2026-07-21 (§7a — instruction prefixes/guillemets removed; q.03 comprehension question kept). |
| `a1-02-soy-asi` | 2026-07-21 (ext.) | L1-PASS | L2-PASS (0 CRIT / 0 MAJ / 3 MIN) | PENDING | PENDING | 3 | Describing people. **Externally drafted (app-track prototype), gated post-hoc** — never authored through the content pipeline; this L2 is its first full independent linguistic QA. L1 validator: PASS (0 err / 0 warn, `--json`). **Curriculum alignment PASS:** grammarFocus [agreement.gender-number, verb.ser] matches map a1-02 row (agreement primary, ser secondary, per v2 panel revision); vocab = EXACTLY the 10 map candidates (zero deviation); the panel's **split-antonym / synonym-cluster fix HOLDS** — no *bajo*/*grande*/*pequeño*, no thing-adjectives, no feo/gordo/viejo, no contento/feliz cluster (that's L5); *lindo/linda* is only an accepted alternate, not taught vocab. The earlier alto/bajo-cluster problem is fully resolved. Independent 3-way translation diff on all 14 sentences: **missingAlternates=1** (alternates otherwise strong). Prior-round CRIT (false gender rule) + MAJOR (missing lindo alternates) confirmed already fixed in this artifact. 3 MINOR: (9) over-broad '-n invariable' generalization in e.01 (correct for all in-scope vocab); (10) s.12 difficulty 2→3 vs parallel s.06; (5) s.13 missing subject-drop alternate. Validator: 0 err / 0 warn. The L2 artifact was contentVersion 2; OI-025 later bumped it to 3. All 3 MINOR fixes applied (s.13 subject-drop alternate added; e.01 -n generalization scoped honestly; s.12 difficulty 2→3 aligned with twin s.06). Difficulty skew noted for founder review. See `review/qa/a1-02.qa1.json`. quickCheck prompts restyled per Mike 2026-07-21 (§7a — instruction prefixes/guillemets removed; single-lemma cues dropped as redundant; q.04 comprehension question kept). |
| `a1-03-que-haces` | 2026-07-21 (ext.) | L1-PASS | L2-PASS (0 CRIT / 0 MAJ / 2 MIN, r1) | PENDING | PENDING | 3 | Saying what you do (-ar verbs). **Externally drafted (app-track prototype), gated post-hoc** — never authored through the content pipeline; this L2 is its first independent linguistic QA. **Curriculum alignment PASS:** grammarFocus matches map L3 row (verb.regular.ar primary; question.formation + negation secondary), vocab = exactly the 8 map candidates (zero deviation), and the panel's **M1 intransitive/legal-object fix HOLDS** — every verb exercised with only a1-01/a1-02/a1-03 vocab + glue, no untaught object noun. Independent 3-way translation diff on all 14 sentences: **missingAlternates=0** (alternates genuinely strong). 2 MINOR, both documentation-only: (6) 'hoy' produced ×9 but absent from the free-glue list / not a vocab item (log in glue policy); (10) difficulty skew — 0×L1, clusters at L2 (7/14). Validator re-run: 0 err / 0 warn (segment ids present). The L2 artifact was contentVersion 2; OI-025 later bumped it to 3. 'hoy' added to CURRICULUM-MAP glue policy (v2.1); no lesson edits needed (both minors documentation-level). Difficulty skew noted for founder review. See `review/qa/a1-03.qa1.json`. quickCheck prompts restyled per Mike 2026-07-21 (§7a — instruction prefixes/guillemets removed; redundant single-lemma cues dropped; q.03 recast as `¿___ trabajas? (asking about a place)`; q.04 kept). progressive alternates added per Mike ruling (2026-07-21, §4 v2.4): 7 sentences with EN-progressive prompts (s.02/04/05/06/07/11/12) each gained 2 estar+gerund acceptedEs variants (pronoun-drop + pronoun-inclusion), 14 total; canonical es/ids/contentVersion untouched at that stage; validator 0 err / 0 warn on a1-03. |
| `a1-04-donde-esta` | — | PENDING | PENDING | PENDING | PENDING | — | Where things and people are |
| `a1-05-ser-y-estar` | — | PENDING | PENDING | PENDING | PENDING | — | Being: identity vs. state |
| `a1-06-como-y-vivo` | — | PENDING | PENDING | PENDING | PENDING | — | Eating & living (-er/-ir verbs) |
| `a1-07-mi-familia` | — | PENDING | PENDING | PENDING | PENDING | — | Family & what you have (tener) |
| `a1-08-me-gusta` | — | PENDING | PENDING | PENDING | PENDING | — | Likes and interests (gustar) |
| `a1-09-que-hora-es` | — | PENDING | PENDING | PENDING | PENDING | — | Time, days, and the calendar |
| `a1-10-mi-dia` | — | PENDING | PENDING | PENDING | PENDING | — | Daily routine (reflexives) |
| `a1-11-voy-a` | — | PENDING | PENDING | PENDING | PENDING | — | Plans & getting around (ir a) |
| `a1-12-quiero` | — | PENDING | PENDING | PENDING | PENDING | — | Wants, needs, requests (capstone) |

*Legend: fill each gate column with the reached status (`PENDING` → `DRAFTED` → `PASS`, or `FAIL(n)` for L2). Set `contentVersion` when a lesson reaches `LAUNCH-READY`; bump it on any post-review content change.*

---

## OI-025 cross-lesson contract review — 2026-07-28

- Scope: vocab accept sets only across `a1-01`…`a1-03`, plus validator check-5 `setId`
  partitioning and Both-direction authoring guidance. Existing per-lesson L2 verdicts were not
  reopened or advanced.
- Accept-set review: all 30 vocab items now carry explicit `acceptedEs` and `acceptedEn` arrays;
  16 Spanish and 29 English noncanonical entries were retained after neutral-LatAm, meaning, and
  duplicate-purpose review. Empty arrays are explicit where canonical/display-split variants suffice.
- Version/identity: all three lessons are `contentVersion: 3`; no lesson, item, or segment ID changed.
- Regression proof: a represented `setId` partition passes when only one member is referenced, while
  a wholly unrepresented partition emits exactly one group-level `VOCAB_EXERCISED` error.
- Gate evidence: `content:typecheck` PASS; `content:validate` PASS (0 errors; five documented L1
  Spanish-alternate exemption warnings); contract smoke PASS (13 checks); content fixtures PASS
  (18/18); prototype freshness PASS.

---

## QA incidents worth remembering

*Systemic issues surfaced during QA — patterns, not one-off typos. Anything here should feed back into `style/STYLE-GUIDE.md` and/or the `content:draft` prompt so the same class of error stops recurring in future lessons. Record: what the pattern was, which lessons/layer surfaced it, and what upstream fix was made (or is needed).*

_(none yet)_
