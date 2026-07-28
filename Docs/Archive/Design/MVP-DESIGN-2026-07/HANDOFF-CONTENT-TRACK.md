# Handoff — Content Track: Lesson Planning & Authoring (parallel to app dev)

**Written:** 2026-07-21. **Audience:** the session/agent doing exploratory curriculum work and lesson authoring, separate from application development.
**Mike's intent:** start building lessons NOW, app-independent. Large token budget available (~18h window) — this track can afford research fan-outs, parallel drafting, and adversarial QA passes.

---

> **Status note (updated 2026-07-28):** this handoff describes the track's *setup*. The infrastructure it called for now exists — schema v1-FROZEN, validator + QA gate + fixtures, 3 lessons at L2-PASS. The current-state record is **`MVP-DESIGN/LESSON-INFRASTRUCTURE.md`**. A0 supersedes the original §3 vocab/direction guidance where noted below; §4 governance and §7 prohibitions still apply.

## 0. Read first

1. This file, fully.
2. `MVP-DESIGN/MVP-DESIGN-CONSENSUS-2026-07-21.md` — §1.1 (lesson contract), §1.2 (modality feeding), §4 (additions/cuts). The lesson schema sketch there is the working draft.
3. `MVP-DESIGN/MVP-DECISIONS-RECOMMENDED-2026-07-21.md` — Q2 (A1-only launch), Q3 (review process + the 10-point checklist — this is your QA spec), D1 (10 vocab/lesson), D3 (EN→ES alternates are the priority).
4. Skim `MVP-DESIGN/HANDOFF-NEXT-SESSION.md` §2 for the full decision list. Do NOT read AIdioma.V1 app code — this track is app-independent by design.

## 1. Mission

Produce, in rough order:
1. **Source research** — identify the best sources for a full-lifecycle Spanish curriculum (A1→B2+): what to sequence, which vocab, which grammar, in what order.
2. **Curriculum map** — the lesson spine: an ordered list of lessons per CEFR level (A1 fully, A2 outlined, B1+ sketched), each with objective, grammar focus (tags), and vocab domain.
3. **Schema finalization proposal** — pressure-test the draft schema against real authoring; propose deltas (see §4 rules).
4. **GrammarTag enum v1** — the closed, versioned tag list. This is the design's hinge (shared between lessons and evaluation results); it deserves real care. Aim for ~30–60 tags covering A1–B1, hierarchical naming ok (e.g. `past.preterite.irregular`), additive-only after freeze.
5. **Authoring pipeline** — a `content:draft` generation prompt/procedure, a validation script (Zod parse + the CI checks listed in consensus §1.1), and a style guide.
6. **Lessons** — the 12 MVP A1 lessons at reviewable quality, plus as much A1/A2 backlog as QA quality allows. Quality over count; the 12 launch lessons get the full review gate.

## 2. Where content lives

Create `/Users/mike/Documents/Coding/Projects/AIdioma/lesson-content/` (project root, OUTSIDE AIdioma.V1 — a fresh-repo decision is pending, and content must be portable into whichever repo wins):

```
lesson-content/
  schema/lesson-schema.ts        # Zod schema (single source of truth) + GrammarTag enum
  schema/SCHEMA-NOTES.md         # every delta vs the consensus sketch, for the app track
  curriculum/CURRICULUM-MAP.md   # the spine: ordered lessons per level
  curriculum/SOURCES.md          # research findings: sources, what each is used for, license notes
  style/STYLE-GUIDE.md           # register, voice, formatting rules
  tools/validate.ts              # runs all CI checks locally (node/tsx, no app deps)
  tools/draft-prompt.md          # the LLM drafting prompt/procedure
  lessons/a1/a1-01-<slug>.json   # one file per lesson
  review/REVIEW-LOG.md           # per-lesson QA status through the 4-layer gate
```

## 3. Fixed decisions that bind authoring (do not relitigate)

- **Levels:** CEFR (A1/A2/B1/B2). MVP ships 12 A1 lessons; A2 is the first post-launch content wave.
- **Lesson anatomy** (A0 / ADR-0003): explanation (≤150 words markdown, the "teach" atom) + aim **12–15 vocab** + aim **18–20 sentences** (schema bands remain 8–15 and 12–20) + 1 aligned passage + 1 conversation seed. Every vocab item must be exercised by ≥1 sentence.
- **Sentences:** each carries `es`, `en`, `acceptedEs[]`/`acceptedEn[]` alternates, ≥1 grammarTag, vocabRefs, difficulty 1–5, exactly 3 escalating hints. **Alternates are the highest-ROI authoring artifact**; launch typed practice defaults to **Both** directions (ADR-0005), so both accept sets need strong coverage.
- **IDs immutable forever**; edits bump `contentVersion`; items deprecated, never deleted.
- **Register (from the Q3 ruling):** neutral Latin American Spanish, `tú` throughout, no `vosotros`, no region-locked slang. Bake this into the style guide and drafting prompt.
- **Copyright rule:** textbook/curricula may be consulted for **scope & sequence only** (facts aren't copyrightable); every sentence, explanation, and passage must be original (LLM-drafted + reviewed). Log which sources informed sequencing in SOURCES.md.
- **QA:** the 4-layer gate from Q3 — validator → adversarial second-LLM pass (different model, pedantic-native-editor persona, structured output against the 10-point checklist) → founder checklist review → paid native-speaker pass on all 12 launch lessons. This track prepares everything up to and including layer 2, plus a review package that makes layers 3–4 fast.

## 4. Schema authority — the App Design Coordinator approves, this track proposes

**Standing rule (set by Mike, 2026-07-21):** the lesson schema is a shared contract, and the **App Design Coordinator agent has final approval over it**. This track (the Lesson Plan agent) drafts and pressure-tests the schema through authoring contact, but no schema version is "landed" until the App Design Coordinator has approved it. The two agents work together through the file-based protocol below (they run in separate sessions and cannot talk directly; Mike is the escalation path for disagreements).

**Protocol — `lesson-content/schema/SCHEMA-APPROVALS.md`** (create it from this template):

```md
# Schema Approvals Log
Roles: Lesson Plan agent PROPOSES · App Design Coordinator APPROVES/REQUESTS CHANGES · Mike arbitrates disputes.
Schema status: v0-DRAFT (unapproved) → v1-FROZEN (approved; additive-only after; additive changes still logged here for approval, may be batched)

| ID | Date | Change (one line) | Rationale | Status | Coordinator notes |
|----|------|-------------------|-----------|--------|-------------------|
| P-001 | ... | Full schema v1 as written in schema/lesson-schema.ts | ... | PROPOSED | |
Statuses: PROPOSED / APPROVED / CHANGES-REQUESTED / REJECTED
```

- The Lesson Plan agent writes proposals (the full v1 schema is itself proposal P-001; later deltas are P-002+ with diffs). Keep `SCHEMA-NOTES.md` for the longer-form rationale behind each proposal.
- The App Design Coordinator reviews against app needs (evaluation contract fit, DB mapping, SessionEngine/recipes, the chat-centric UI direction) and flips statuses, adding notes.
- **Hard gate: do not scale lesson production until P-001 (schema v1 + the golden lesson) is APPROVED.** Research, curriculum mapping, style guide, tooling, and drafting the single golden lesson are all fine to do while waiting.
- CHANGES-REQUESTED → revise and re-propose under the same ID. Genuine deadlock → write both positions in the log and stop on that item for Mike.
- Two additions already floated by Mike — design them into the v1 proposal so the Coordinator rules on them explicitly: a **multiple-choice/comprehension question** item kind (reading comprehension + quick checks), and flashcard mode hints (word vs sentence cards — sentence cards may just be a view over SentenceItem). A `talk` input mode is post-MVP; no schema impact beyond the existing reserved `audioUrl`.

## 5. Source research guidance

**A licensing-verified data-source survey already exists: read `MVP-DESIGN/RESEARCH-CONTENT-DATA-SOURCES-2026-07-21.md` before doing any new source research** — it covers structured datasets AND processable unstructured sources with per-source license verdicts (verified 2026-07-21). Headline: ingest Tatoeba (CC-BY sentence pairs + alternates; keep per-sentence IDs/attribution from day one), kaikki.org Wiktionary JSONL (facts only — POS/gender/conjugations; never verbatim text, SA), wordfreq (frequency/difficulty), FSI Spanish Basic (public domain; mine drill patterns + syllabus, LLM-rewrite 100% of surface text), COERLL CC-BY items (conversation seeds). PCIC is reference-only (no data license). Hard avoid: Anki decks, OPUS OpenSubtitles, Jehle verbs, anything CC-NC. Your SOURCES.md should build on that report (fill gaps, verify the flagged unverified items — Peace Corps PD status per course), not redo it. The report's §c pipeline sketch (Tatoeba → wordfreq scoring → LLM tagging/register-normalization → review) should shape your `tools/` design; note its warning that ingested sentences need the same human review as LLM drafts.

Original guidance (superseded where the report is more specific):

Candidate sources to evaluate and rank — verify currency/licensing, don't trust this list blindly:
- **Instituto Cervantes Plan Curricular (PCIC)** — the canonical A1–C2 inventory of grammar/functions/vocab for Spanish; ideal scope-and-sequence backbone.
- **CEFR descriptors** (Council of Europe) — level definitions and can-do statements; use for lesson objectives.
- **Frequency data** — a Spanish frequency dictionary/corpus (e.g. Davies' Corpus del Español frequency lists, CORPES XXI, Routledge frequency dictionary as reference) to prioritize vocab; verify what's freely usable vs reference-only.
- **Open educational resources** — COERLL (UT Austin) materials, Language Transfer's structural sequence, LibreTexts/Wikibooks Spanish, SpanishDict grammar guides — good for cross-checking sequencing choices and explanation approaches.
- **Commercial textbook scope-and-sequence** (Aula, Vistas, Madrigal) — tables of contents only, for sequencing sanity checks.
Deliverable: SOURCES.md ranking these with a one-paragraph verdict each and the chosen backbone (likely PCIC + frequency list overlay).

## 6. Delegation discipline (required)

You are a **coordinator** — preserve your own context window by pushing all heavy work into sub-agents running **Opus 4.8** (pass `model: "opus"` on every Agent/workflow call; do not let sub-agents inherit the session model). Specifically:
- Research fetches, per-lesson drafting, adversarial QA passes, and validator-fix loops all happen in sub-agents. One agent per lesson.
- Sub-agents write their outputs to files under `lesson-content/` and return only a short distilled summary (status, counts, open issues) — never full lesson bodies — into your context.
- You read validator output, REVIEW-LOG.md, and summaries; you only open a lesson file yourself when arbitrating a specific flagged issue.
- Batch your fan-outs and keep your own turns to planning, dispatching, and logging decisions.

## 6b. Suggested execution plan for the big-token session

1. **Research fan-out** (parallel agents): source evaluation panel → SOURCES.md; then draft CURRICULUM-MAP.md for A1 (12 lessons + 6-lesson buffer), A2 outline. Panel-review the map once (pedagogy + practicality lenses) before authoring anything.
2. **Contracts:** write `lesson-schema.ts` + GrammarTag v1 + STYLE-GUIDE.md + validate.ts + draft-prompt.md. Validate one hand-written "golden lesson" end-to-end, then **file P-001 in SCHEMA-APPROVALS.md and wait for the App Design Coordinator's approval before step 3** (§4 hard gate). Use the waiting time for curriculum refinement, A2 outlining, and tooling polish.
3. **Scaled drafting (only after P-001 APPROVED):** parallel lesson generation (one agent per lesson, drafting prompt + curriculum-map row + style guide + prior lessons' vocab lists as input so vocab-leakage CI passes) → validator → adversarial QA pass → fixes → REVIEW-LOG.md status.
4. **Founder package:** end with a review dashboard for Mike — per-lesson status, the items most needing human judgment (alternates and naturalness), and the native-reviewer brief (from decisions doc Q3).
- Pace QA honestly: a lesson that parses is not a lesson that's good. Target: all 12 A1 lessons through layer 2 by end of session; more only if quality holds.

## 7. What NOT to do

- Don't build app code, don't touch AIdioma.V1, don't decide the fresh-repo question (app track owns it).
- Don't invent a new content format — JSON against the Zod schema, one lesson per file.
- Don't include copyrighted sentences/passages, even "adapted."
- Don't expand scope to B1+ authoring; outline only.
