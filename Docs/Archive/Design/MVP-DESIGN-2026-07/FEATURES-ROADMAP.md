# AIdioma — Features & Roadmap

**Date:** 2026-07-23 · **Status:** Living roadmap (product vision + feature map + phased plan)
**Owner tracks:** App Design Coordinator (app-track) + Lesson Plan/content-track — both read from this doc.

> **A0 update (2026-07-28):** all four §9 decisions are settled. Current build status lives in
> `Docs/ROADMAP.yaml`; the decisions live in ADRs 0003–0012, Specs, and Registers. This file
> remains the product map and links forward instead of reopening its former proposals.

---

## 1. Purpose

**Takeaway: this captures Mike's 2026-07-23 product vision as a single map of the 14 features he wants, tells each work-track who owns what and when it lands, and is honest about what's decided vs. still a proposal.**

This is a *living* roadmap, not a spec and not a source of truth for frozen decisions. Where a detail is already settled, the authority is one of these three documents, cross-referenced by section throughout:

- **`MVP-DESIGN/MVP-DESIGN-CONSENSUS-2026-07-21.md`** — the frozen design baseline (lesson contract, shared taxonomy, blender, DB tables, evaluation contract, 6-week build order).
- **`MVP-DESIGN/MVP-DECISIONS-RECOMMENDED-2026-07-21.md`** — the ratified answers (D1–D4, Q1–Q5).
- **`Docs/Specs/Features/module-spec.md`** — the current app-track/UI direction (chat-centric panel).

If anything here appears to contradict those, **those win** and this doc is wrong — flag it. Every item below that is *not* already agreed is marked **[PROPOSED]** or **[FOR DECISION]**. Nothing new is presented as settled.

---

## 2. How the finished app works (a day in the life)

**Takeaway: one chat-style surface, instant free grading, AI only when you actually miss, and a memory that keeps serving your weak spots until you own them.**

Mike opens the app. The Home screen has one dominant button: **Continue**. He taps it and drops straight into his current lesson's next activity — no dashboard, no menu-diving (Consensus §1.3).

The session runs in **one chat-centric panel** (Handoff §2). The app "deals cards" in a guided arc — a short explainer, a multiple-choice check, some vocab, then sentences, then a story passage (Handoff §3, the Mix arc: Learn → Quiz → Words → Sentences → Story). The cards aren't only from today's lesson: the engine **blends in** recently-studied words and anything he's been getting wrong, weighted toward his weak spots (Consensus §1.3).

He types a translation in the active direction (Both by default). It's graded **instantly and for free** — the app compares his answer against the authored correct answers and their accepted alternates. Most of the time that's a hit and no AI is called at all (Consensus §1.2). Only when his answer doesn't match anything on file does one cheap AI call decide "close" vs. "wrong," write a short encouraging note, and tag the mistake (e.g. *ser/estar*).

The input bar is dual-duty: at any point he can just **ask the tutor a question** — "why is it *estoy* not *soy* here?" — and get an inline answer without leaving the flow (Handoff §2).

At the end, a **session recap**: his score, which items moved up in mastery, and his top error tags ("you missed *ser/estar* twice — these come back tomorrow"). That recap is the retention surface (Consensus §4 ADD-2). The next day, the blender automatically re-serves those weak items and the un-confirmed lessons — and keeps serving them until he's genuinely mastered them, not just guessed right once.

---

## 3. The unifying engine (why most of this is one system)

**Takeaway: about eight of the 14 features are not separate builds — they're views of one architecture, and the shared error taxonomy is the moat.**

Every answer, in every modality, becomes **one row in the `evaluations` table**, tagged with **one shared `GrammarTag`/`ErrorTag` taxonomy** that is defined exactly once and used by both lesson content (what a lesson teaches) and grading (what the user got wrong) (Consensus §1.1). That single design choice is the hinge every panelist independently called "the whole trick."

From that one tagged table, the app *derives* — for free, with no extra system:

- **Proficiency** on words and lessons/topics (feature 2) → `user_item_stats` + `user_lesson_progress`.
- **The blend and overlap** of current + recently-studied material (feature 3) → the sampler reads those same stats.
- **Mastery** (feature 9) → computed from attempts, scores, and recency.
- **Progress-by-grammar-point** → just a group-by on the tag column.

Because the taxonomy is shared and closed, none of these need their own data pipeline, and they get smarter automatically as data accumulates. This is why the panel guarded it so hard: a second, parallel taxonomy would collapse the whole thing (SCHEMA-NOTES, Delta 1). **The moat is the shared tag set, not any one feature.**

---

## 4. Feature-by-feature map

**Takeaway: A0 settled every launch decision; later capabilities are explicitly parked or phased.**

Status key: **Decided-core** = frozen and central to MVP · **Decided** = frozen · **Extension** = builds on an existing decided structure · **New** = needs a new proposal · **Roadmap** = later phase.

| # | Feature (restated) | Status | Owner | Where it lives |
|---|---|---|---|---|
| 1 | Learn by lesson, anchored to word lists, until words + lesson are mastered | **Decided-core** | both | Lesson contract (Consensus §1.1); mastery-gated unlock |
| 2 | Proficiency tracking on word list + lesson/topic | **Decided** | app | `user_item_stats`, `user_lesson_progress` (Consensus §1.4) |
| 3 | Overlap of recently-studied words/topics with the current one | **Decided** | app | Blender algorithm (Consensus §1.3) |
| 4 | A hint field that's actually helpful | **Decided + extension** | both | Schema keeps 3 authored hints; MVP UI uses mode-smart cue / Reveal / Ask tutor |
| 5 | LLM generates now, KB grows so calls shrink over time | **Post-MVP evolution** | app | See §5 below — cache + promotion |
| 6 | Ask questions inside the chat | **Decided** | app | Dual-duty input, ask-AI inline (module spec) |
| 7 | Practice around custom topics | **Planned** | app | Depends on the KB engine (feature 5) |
| 8 | Generate + save notes on topics/words/areas | **Post-MVP** | both | Deferred: PM-003 / OI-015 |
| 9 | Robust progress-memory serving items until mastery; define mastery | **Decided-core** | app | Completed/Mastered for MVP: ADR-0004/0011 |
| 10 | Study cards (verb conjugation, topic essentials) | **Decided** | content | Reference-card item kind approved: P-005 / ADR-0012 |
| 11 | Deeper "lessons" on each level's topics | **Extension** | content | Deeper companion to the ≤150-word explainer |
| 12 | A minimum number of practice questions per lesson | **Decided** | content | Schema `sentences.min(12).max(20)` floor |
| 13 | Strategic word progression by Spanish frequency | **Decided / built** | content | wordfreq backbone (SOURCES §2, §5) |
| 14 | Dialects (vos, region-specific words/phrases) | **Roadmap** | content | Shape approved P-004; content/UI deferred PM-005 |

---

## 5. The knowledge-base cost engine (feature 5)

**Takeaway: the MVP has "no runtime generation" on purpose — and that's exactly what lets the KB grow later without breaking cheap grading. Every AI verdict we ever produce becomes reusable authored content.**

**How this reconciles with the frozen rule.** The consensus bans runtime generation of graded sentences at MVP because it would break the comparison-first cost gate and make progress non-comparable (Consensus §1.2). Feature 5 does **not** violate that — it's the *evolution* of the same gate. At MVP the pieces are already in place:

- Content is **authored** (not generated at runtime), so grading is a cheap string comparison.
- Grading is **comparison-first**: normalize → exact → Levenshtein against the accepted answers → AI **only** on a poor match or an empty accept set (Consensus §1.4).
- **Every verdict is logged** with `evalSource` and a `normalizedInputHash` — a deliberate hook kept from day one precisely so the KB can grow (D4).

**The growth path (post-MVP, each strictly additive):**

1. **Cross-user verdict cache.** When two users type the same normalized wrong answer to the same item, reuse the first AI verdict instead of paying again (the `evaluationCache` idea, deferred not deleted — D4). Rebuilt only when the data shows it would pay (>15% repeat rate or >\$50/mo spend).
2. **Alternate-promotion.** An answer the AI judged *correct* gets promoted into the item's authored `acceptedEs`/`acceptedEn`. From then on it **hits the free comparison gate forever** — that user's valid phrasing becomes permanent free content for everyone.
3. **Generated-content promotion (custom topics, feature 7).** When the LLM generates practice for a custom topic, it goes through the **same validate + QA gate** as authored content, then is **cached as authored**. Generation happens once; grading stays free thereafter.

**Net effect:** per-interaction LLM cost trends toward zero as the KB fills — the app calls the model to *manufacture reusable content*, not to grade every keystroke.

**The discipline that makes it safe:** generated or AI-derived content is treated as **candidate content that must be gated and cached — never trusted blind.** That's what preserves comparable, cheap grading as the KB grows. This also ties into the content-track's ingestion policy (SOURCES §5): Tatoeba as an alternates-mining QA reserve, corpus ingestion only at A2+ scale, everything carrying a `provenance` field.

---

## 6. Three honest tensions with the frozen plan

**Takeaway: A0 resolved all three tensions; the rationale below is retained as decision history.**

**(a) Features 5 & 7 (generation) vs. the "no runtime generation" rule.** Direct tension on paper, resolved in practice by sequencing: MVP stays authored-only; generation arrives **post-MVP**, made safe by the gate-and-cache discipline in §5. No change to the frozen rule — generation is added *around* it, not *through* it.

**(b) Feature 14 (dialects) vs. the neutral-Latin-American / tú register lock.** A0 approved the optional per-entry region shape (P-004) but deferred dialect content/UI to PM-005. Launch remains neutral Latin American Spanish, tú throughout.

**(c) Feature 9 (5-level scale + user threshold) vs. today's binary Completed/Mastered (D2).** A0 kept Completed/Mastered for MVP (ADR-0011) and deferred the richer model to PM-006.

---

## 7. Mastery model proposal (feature 9 detail) — DEFERRED

**Takeaway: retained as the rejected-for-MVP alternative. ADR-0011 keeps Completed/Mastered; PM-006 owns reconsideration.**

This was an App Design Coordinator proposal, not lesson content. It is **not MVP scope**.

**The 5 levels, each mapped to signals already in `user_item_stats`** (attempts, bestScore, lastAttemptAt, plus a distinct-retrieval-days count):

| Level | Derivation (illustrative) |
|---|---|
| **Brand new** | `attempts = 0` — never served |
| **Needs practice** | attempted, `bestScore < threshold`, or a miss in the last few days |
| **Partial** | `bestScore ≥ threshold` but only same-day success so far |
| **Knows well** | `bestScore ≥ threshold` on **≥2 distinct days** |
| **Mastered** | Knows-well **and** still correct after a longer gap, no recent miss |

**User-configurable threshold (feature 9's second half):** the learner sets the minimum-correct bar — e.g. the passing score (default 70, per current mastery math) and/or how many clean retrievals a "Mastered" requires. Stricter learners demand more repetitions; casual learners less.

**How it supersedes/extends D2.** D2's **Completed** (same-day, unlocks next lesson) and **Mastered** (confirmed on a later day) map cleanly onto the new scale at the *lesson* level: a lesson is **Completed** when its items reach ≥ *Partial*, and **Mastered** when a set share reach ≥ *Knows well*. So D2 isn't thrown away — it becomes the lesson-level rollup of a richer per-item signal. The "confirm tomorrow to master" behavior (D2) is preserved by the distinct-days requirement.

**Deferred rationale:** a future richer signal may sharpen blending, but MVP weights directly from bestScore, recency, error tags, and saved state. Reopen only through PM-006.

---

## 8. Roadmap in phases

**Takeaway: content foundation is ~80% done; the 6-week MVP is the core loop; everything richer is fast-follow or later, in a deliberate order.**

- **Phase 0 — Content + contracts foundation (now, ~80% done).** Curriculum + frequency backbone (feature 13), frozen schema + shared taxonomy (P-001 approved → **v1-FROZEN**; P-002 approved), CI validator + adversarial QA, **3 real lessons live** (a1-01/02/03), working prototype. **Remaining:** draft lessons a1-04…a1-12 on Mike's go (`lesson-content/review/FOUNDER-REVIEW-PILOT.md`).
- **Phase 1 — MVP core loop (~6 weeks; Consensus §1.5).** Features **1, 2, 3, 4, 6, 10, 12, 13** + the **core of 9** (Completed/Mastered per ADR-0004/0011). Typed translation + flashcards, chat panel, blend, saved items, optional study cards, recap, and streak.
- **Phase 2 — Fast-follow (weeks 7–10).** Reading (ES→EN), **notes (8)**, **deeper lessons (11)**; richer mastery only if PM-006 is reopened.
- **Phase 3 — KB cost engine (5) + custom topics (7).** Cross-user cache, alternate-promotion, generation-behind-the-gate.
- **Phase 4 — Conversations, then dialects (14) + talk/voice mode.** Highest AI cost and biggest authoring multiplier last.

| Feature | Phase |
|---|---|
| 1 Lesson-anchored learning | 1 |
| 2 Proficiency tracking | 1 |
| 3 Blend / overlap | 1 |
| 4 Helpful hints | 1 |
| 5 KB cost engine | 3 |
| 6 Ask-AI in chat | 1 |
| 7 Custom topics | 3 |
| 8 Notes | 2 |
| 9 Mastery memory | 1 (Completed/Mastered); richer levels parked |
| 10 Study cards | 1 |
| 11 Deeper lessons | 2 |
| 12 Min. questions/lesson | 1 |
| 13 Frequency progression | 0/1 (built) |
| 14 Dialects | 4 |

---

## 9. Ownership split & A0 resolutions

**Takeaway: ownership is unchanged; A0 resolved all four former decisions.**

**Content-track owns:**
- Feature 13 (frequency progression) — **built**.
- Features 10 and 11 — study-card/deeper-lesson authoring; feature 14 dialect content is future.
- Lesson-schema proposals and follow-through (P-003/004/005 approved; OI-025 owns remaining P-003 content/tooling work).

**App-track owns:**
- The chat UI: features 6 (ask-AI) and 7 (custom-topic practice).
- The derived engine: features 3 (blender), 5 (KB cost engine), 9 (mastery) — all computed from `evaluations`.
- Word-level error-diff feedback (naming the mistake).
- Mode-smart help authoring follow-through (schema retains 3 hints; MVP UI uses fewer) and Both-direction alternate coverage.

**Resolved by A0:**
1. Five-level mastery + user threshold → **deferred** (ADR-0011 / PM-006).
2. Dialect dimension → **shape approved; content/UI deferred** (P-004 / PM-005).
3. Notes model → **deferred** (OI-015 / PM-003).
4. Study-card kind → **approved for MVP** (P-005 / ADR-0012).

---

*This roadmap is subordinate to the three frozen docs named in §1. Update it as decisions land; do not treat it as the authority for anything already frozen there.*
