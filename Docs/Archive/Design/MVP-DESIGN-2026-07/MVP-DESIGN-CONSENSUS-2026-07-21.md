# AIdioma MVP Design Baseline — Panel Consensus

**Date:** 2026-07-21 · **Status:** Design baseline, synthesized from a 4-lens panel (pedagogy, product-UX, architecture, MVP-pragmatist) · **Companion:** `Docs/MVP-REVIEW-2026-07-21.md`

---

## 1. Consensus design

### 1.1 Lesson contract

All four panelists converged, independently, on the same architecture: **lessons are CI-validated typed data in the repo; the database is a materialized serving copy.** Canonical content lives at `content/lessons/*.json`, validated by a Zod schema in `shared/` that is frozen (additive-only after) in week 1. An idempotent `pnpm content:seed` upserts to Neon keyed by slug. This — not a CMS or authoring UI — is what makes parallel authoring safe: the founder + LLM can draft lessons against the contract with zero app code running, and CI rejects anything malformed before merge. **Decided.**

The load-bearing decision (every panelist called it "the hinge" or "the whole trick"): **one shared `GrammarTag`/`ErrorTag` enum, defined exactly once in `shared/`, used by both lesson content (what a lesson teaches) and evaluation results (what the user got wrong).** That single taxonomy is what turns four practice pages into one learning system that knows what the user can't do yet, and it powers weakness-weighted blending and Progress-by-grammar-point for free.

Consensus schema sketch (`shared/lesson-schema.ts`):

```ts
const GrammarTag = z.enum(['present-regular','ser-estar','gender-agreement',
  'word-order','preterite','por-para','vocab-choice', /* closed, versioned */]);
// SAME enum as ErrorTag in the evaluation contract. One taxonomy.

const VocabItem = z.object({
  id: z.string(),                          // stable forever: "a1-03.v.hablar"
  kind: z.literal('vocab'),
  es: z.string(), en: z.string(),
  pos: z.enum(['noun','verb','adj','adv','phrase','other']), // 'phrase' covers chunks
  gender: z.enum(['m','f']).optional(),
  exampleEs: z.string(), exampleEn: z.string(),
  audioUrl: z.string().optional(),         // reserved now, populated post-MVP
});

const ExplanationItem = z.object({          // the "teach" atom (see §4 ADD-1)
  id: z.string(), kind: z.literal('explanation'),
  markdown: z.string(),                    // ≤150 words, examples inline
  grammarTags: z.array(GrammarTag),
});

const SentenceItem = z.object({
  id: z.string(), kind: z.literal('sentence'),
  es: z.string(), en: z.string(),
  acceptedEs: z.array(z.string()).default([]),  // alternates power the
  acceptedEn: z.array(z.string()).default([]),  // comparison-first cost gate
  grammarTags: z.array(GrammarTag).min(1),
  vocabRefs: z.array(z.string()),          // must resolve to VocabItem ids (CI)
  difficulty: z.number().int().min(1).max(5),
  hints: z.array(z.string()).length(3),    // matches existing 3-level hint UX
});

const PassageItem = z.object({
  id: z.string(), kind: z.literal('passage'), title: z.string(),
  segments: z.array(z.object({             // sentence-ALIGNED, not free prose —
    es: z.string(), en: z.array(z.string()).min(1),  // each segment independently
    vocabRefs: z.array(z.string()),        // evaluable via the same pipeline
  })),
});

const ConversationSeed = z.object({        // authored NOW, page built post-MVP
  id: z.string(), kind: z.literal('conversation'),
  scenario: z.string(), personaPrompt: z.string(),
  openingLine: z.string(), goalPhrases: z.array(z.string()),
  vocabRefs: z.array(z.string()),
});

export const Lesson = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),                          // immutable slug: "a1-03-ser-vs-estar"
  ordinal: z.number().int(),               // global linear sequence
  level: z.enum(['A1','A2','B1','B2']),    // CEFR, not beginner/intermediate
  title: z.string(), objective: z.string(),
  grammarFocus: z.array(GrammarTag),
  prerequisites: z.array(z.string()).default([]), // in schema now; MVP = previous lesson only
  explanation: ExplanationItem,
  vocab: z.array(VocabItem).min(8).max(15),
  sentences: z.array(SentenceItem).min(12).max(20),
  passage: PassageItem,
  conversation: ConversationSeed,
  contentVersion: z.number(),              // bump on edit; attempts record it
});
```

**Sequencing & mastery (decided):** single linear spine ordered by `ordinal` within CEFR band; self-selected start level; mastery-gated unlock. Mastery = ≥70% of the lesson's sentence items with best score ≥70, AND ≥70% of vocab reviewed at least twice. Computed from evaluations, cached in `user_lesson_progress`. `prerequisites` stays in the schema so a DAG can exist later without migration, but no skill-tree UI at MVP.

**Versioning policy (architecture lens, adopted unanimously):** lesson and item IDs are immutable forever; edits bump `contentVersion` in place; items are deprecated, never deleted, so user progress rows never dangle. CI enforces: Zod parse, globally unique IDs, `vocabRefs` resolve, every vocab item exercised by ≥1 sentence, unique ordinals, acyclic prerequisites, and a snapshot check that no ID was ever removed.

**Vocab cap:** 8–15 new vocab per lesson. Pedagogy argued hard for 8–12 on retention evidence (per-item retention collapses past ~10 new items/session); pragmatist wanted up to 25 for authoring throughput. The panel sides with pedagogy — author *more lessons*, not fatter ones — with 15 as the schema ceiling (see §2 for the residual disagreement).

### 1.2 Modality feeding

Unanimous rule of thumb (pedagogy R9 / pragmatist R6): **anything the learner reads as model input or that gets scored is authored; anything reactive (feedback text, conversation replies, glosses) is generated.** No runtime generation of sentences or passages at MVP — it breaks the comparison-first cost gate and makes progress non-comparable.

Equally unanimous: **every scoring submission in every modality is one `EvaluationRequest` to one `/api/evaluate` endpoint** (ux R6, arch R4/R6, pedagogy R15, pragmatist R13). Reading is not a new system — a passage segment IS a sentence item rendered with context. Flashcards never trigger an AI call.

| Modality | Source | Authored | Generated |
|---|---|---|---|
| Flashcards | `vocab[]` + saved items | es/en/example | Card directions (ES→EN and EN→ES scheduled separately); zero AI |
| Typed translation | `sentences[]` | es, en, alternates, hints, tags | Nothing — alternates feed the DB-comparison gate; AI only on poor match |
| Reading | `passage.segments[]` | full aligned passage | Word-tap glosses from vocab data (no AI); per-segment eval = same endpoint |
| Conversation | `ConversationSeed` + vocab | scenario, persona, opener, goals | The dialogue (AI); each turn optionally evaluated via same contract, feedback deferred to an end-of-conversation recap |

**Highest-ROI authoring work** (ux R7, arch R2): the LLM-assisted drafting step must generate 3–6 accepted alternates per sentence per direction, human-reviewed. The cost gate lives or dies on alternate coverage.

Grammar is taught via the explanation item and tracked via tags — grammar points do **not** become flashcards (pedagogy R5).

### 1.3 Page orientation & blending

**Kill modality-first navigation** (ux R8, echoed by all). Lessons are the organizing unit; modalities are activities inside a lesson, rendered by thin shells over one headless `useSession(recipe)` hook (the SessionEngine). Consensus page map:

1. **Home ("Learn")** — one dominant CTA: *Continue → current lesson, next activity*. Below: today's review count, streak strip, compact linear lesson path (current/locked/mastered).
2. **Lesson detail** — objective, explainer, activity checklist (Learn → Flashcards → Translate → Read), mastery bar.
3. **Session player** — one full-screen surface hosting any modality; the existing PracticePage becomes a renderer inside it. Ends in a **session summary**: score, weak items, error-tag recap ("you missed *ser/estar* twice — retry items tomorrow"), next-step CTA.
4. **Library** — *Lessons* tab (browse/replay unlocked) and *Saved* tab (words/sentences captured via a save icon anywhere — makes the dead bookmark buttons real).
5. **Progress** — kept, fed entirely by real evaluations; "by grammar point" view as tags accumulate. Achievements page: deleted.

First-session journey target (ux R10): sign-up → pick start level → land inside Lesson 1's explainer → first evaluated answer in under 90 seconds. No empty dashboard on day 1. Streak yes; streak commerce, hearts, and loss-aversion notifications no.

**Consensus blending algorithm** (merging pedagogy R11, ux R12, arch R8, pragmatist R9 — they were already ~90% identical):

```
SessionRecipe = { scope: 'lesson' | 'blend' | 'saved', focusLessonId, size: 10 }

Pool (blend mode) = items of requested modality from:
  current lesson ∪ last 3–4 completed lessons ∪ saved items
  ∪ any item with an error-tag miss in the last 14 days

Ratio: 60% current lesson / 40% review  (100% review in "Review" mode)

Per-item weight:
  w = (1 − bestScore/100 + 0.2)          // weakness
      × min(daysSinceLastAttempt, 14)/14 // staleness; never-attempted = max
      × (1.5 if item's grammarTags ∩ user's top-3 error tags)  // tag boost
      × (1.2 if saved)

Weighted sample without replacement to size, with one constraint:
  no two consecutive items exercise the same vocab/tag (true interleaving).
```

All inputs derive from the `evaluations` table via `user_item_stats` — the blend gets smarter for free as data accumulates, and the tag-boost term is simply zero on day 1 (resolving arch's "defer tag weighting" vs pedagogy's "include it": ship the formula; it self-activates).

**Manual mix & match: the engine ships, the UI doesn't** (unanimous — pedagogy R12, ux R13, arch R14, pragmatist R10). SessionEngine takes a recipe from day one, so "blend lessons 3+7+saved" is just data; MVP exposes exactly three recipes: Continue lesson, Blend toggle, Review/Saved. No ratio sliders — learners reliably mass when self-scheduling; the algorithm spaces.

### 1.4 Schema & shared-type deltas

**New tables (decided):**
- `lessons` (id PK slug, ordinal, level, title, objective, grammarFocus jsonb, contentVersion, contentHash, isActive)
- `lesson_items` (id PK = authored item id, lessonId FK, kind enum, payload jsonb, grammarTags jsonb, difficulty, deprecated bool) — **one table, discriminated by kind**, mirroring the Zod union. (Pedagogy preferred normalized sentence rows; the panel picks the single jsonb table — stable authored IDs give row-level addressability for evaluation and stats without a three-table migration burden.)
- `user_lesson_progress` (userId, lessonId, status: locked|active|mastered, masteryScore, masteredAt)
- `user_item_stats` (userId, itemId, attempts, bestScore, avgScore, lastAttemptAt, missedTags jsonb; nullable SRS columns reserved) — generalizes `userProgress` beyond sentences; drives the blender
- `saved_items` (userId, refType: vocab|sentence|passage|lesson, refId, createdAt)

**Modified:** `evaluations` gains `itemId`, `lessonId`, `modality`, `direction`, `errorTags jsonb`, `evalSource`, `contentVersion`. `users` gains CEFR level + `currentLessonId`.

**Removed:** `sentences` table — migrate the 15 seeds into a "Lesson 0" fixture lesson, then drop (all four flagged that keeping it recreates the dual-stack disease at the data layer). Drop `learningAnalytics` (derive from evaluations) and `evaluationCache` (see §2.4).

**Shared types (`shared/`):** `lesson-schema.ts`, `evaluation.ts`, `session.ts`.

```ts
type EvaluationRequest = {
  modality: 'translate'|'reading'|'flashcard'|'conversation';
  direction: 'es-en'|'en-es';
  itemRef: string | null;         // "lessonId:itemId"; null for conversation turns
  source: string; expected: string[];  // [] ⇒ AI-only path
  userInput: string;
  context?: { lessonId: string; conversationHistory?: Turn[] };
};
type EvaluationResult = {
  score: number; verdict: 'correct'|'close'|'wrong';
  feedback: string; wordDiff?: WordMark[];
  errorTags: GrammarTag[];
  evalSource: 'cache'|'comparison'|'ai'; modelUsed?: string;
};
```

Gate order preserved from the existing claude-mvp path: normalize → exact → Levenshtein bands against `expected[]` → AI only on poor match or empty `expected`. Every result persisted.

### 1.5 MVP scope & build order

**MVP ships (~6 weeks):** lesson contract + content CI/seed scripts; **12 A1 lessons** (authored in parallel from week 1); one consolidated `/api/evaluate` (claude-mvp survivor behind a Gateway abstraction, non-fatal key failure, current model); full persistence loop; Home/Lesson-detail/Session-player/Library/Progress page map with nav debt cleared (one AppLayout, one token system, dead pages deleted); **two modalities: typed translation + flashcards**; blend toggle + sampler; saved words/sentences; session summary; streak.

Three panelists (ux, arch, pragmatist) vs pedagogy's three-modality launch: the panel rules **two modalities at launch** — four-at-once is the same horizontal over-build the review just diagnosed, one layer up. Reading is explicitly **fast-follow week 7–8**, cheap by design because it reuses the entire evaluation pipeline.

**Fast-follow:** Reading (ES→EN). **Wave 3:** Conversations — unanimously deferred (highest AI cost, no comparison gate, current implementation is a setTimeout fake), but the `ConversationSeed` ships in the contract now so authors write scenarios in parallel, and per pedagogy R8 it ships only with per-turn evaluation + end-of-conversation recap, never as unstructured chat.

**Build order (unanimous shape):**
1. **W1** — Freeze shared contracts (lesson + evaluation + session types); content CI + seed scripts; Lesson 0 migration. *Content authoring starts and runs in parallel from here.*
2. **W2** — Backend consolidation: one `/api/evaluate`, delete claude-service + universal service (~4,900 → ~500 lines), Gateway abstraction, non-fatal health check.
3. **W3** — Persistence loop: Clerk→users upsert, evaluations written per submission, item/lesson stats derived.
4. **W4** — SessionEngine hook; refactor Practice onto it; Home + lesson detail; nav/layout cleanup.
5. **W5** — Flashcards renderer; saved_items end-to-end; blend sampler + toggle.
6. **W6** — Progress on real data; session summary; content QA of 12 lessons; quality gate + audit. **Ship.**
7. **W7–8** — Reading. Then decide conversations vs. more lessons based on actual usage.

---

## 2. Genuine disagreements (founder to decide)

1. **Vocab load per lesson.** Pedagogy: hard-cap at 8–12 new items — SLA retention evidence is consistent that per-item retention collapses past ~10/session. Pragmatist: 12–25 — authoring throughput and content volume matter more at MVP scale, and users self-pace anyway. The schema ceiling of 15 is a compromise both can live with, but the *authoring guideline* (aim for 10 vs. aim for 15–20) is genuinely contested.
2. **Mastery spacing requirement.** Pedagogy wants each vocab item to require ≥2 successful retrievals *on different days* before counting toward mastery (same-day "mastery" is an illusion of competence). UX/pragmatist counter that this adds invisible friction — a user who aces a lesson is told it isn't mastered for a reason the UI can't easily explain. MVP as specced allows same-day mastery; tightening it is a one-line change either way.
3. **Direction policy at launch.** Pedagogy + architecture: both directions in typed practice from day 1 (EN→ES production is the highest-value exercise; the data doubles the item count for free). Pragmatist: one direction per modality at launch (typed = EN→ES, reading = ES→EN, flashcards = both) to halve the alternate-authoring and QA surface. The schema supports both regardless; this is purely a launch-UI and authoring-effort call.
4. **Persistent evaluation cache.** Three lenses say drop `evaluationCache` (orphaned, and the comparison gate already kills most AI calls). Architecture argues to *repurpose* it as a cross-user persistent cache keyed by `(itemRef, direction, normalizedInputHash)` — the concept compounds the cost gate across users. Zero-risk to defer; worth revisiting when AI spend data exists.

---

## 3. Open product questions for the founder

1. **Provider/model.** The abstraction is decided (one internal service, likely via Vercel AI Gateway), but the actual model choice is pending — and the hardcoded `claude-3-haiku-20240307` is past retirement, so this blocks W2.
2. **Start-level story with A1-only content.** MVP ships 12 A1 lessons, but onboarding offers self-selected start level. Does an A2/B1 self-identifier just start at Lesson 1 anyway (with messaging), or do a few A2 lessons need authoring before launch?
3. **Content review bar.** LLM-drafted lessons need human review — who reviews, against what checklist, and is the founder the sole reviewer (a throughput bottleneck for the parallel-authoring plan)?
4. **Success metric.** UX proposed judging all post-MVP additions (conversations, SRS, manual blends) against **day-7 return to a completed session**. Adopt this as the single MVP metric, or define another?
5. **Streak/notification posture.** Panel consensus is streak-yes, dark-patterns-no; whether to send any reminder notifications at all is a brand/product call.

---

## 4. Additions & cuts (consolidated)

**ADD (missing from the founder's plan):**
1. **Explanation/"teach" item per lesson** — without a 30–60s explainer the first session is a quiz on material never presented; it's one authored markdown field (pedagogy + ux, independently).
2. **Session summary screen** — the end-of-session recap (score, weak items, error tags, next step) is the retention surface, not the Progress page (three lenses independently).
3. **Authored answer alternates (3–6/sentence/direction)** — cheapest cost-optimization in the project; the comparison gate depends on it.
4. **One-tap save affordance everywhere** + one polymorphic `saved_items` table — converts the existing dead bookmark buttons at near-zero cost.
5. **Content CI validator + idempotent seed script + `pnpm content:draft` generator** — this tooling *is* the parallel-authoring enabler and must be built first.
6. **Immutable-ID / deprecation policy for content** — without it, content edits silently orphan user progress.
7. **Explicit `direction` on every item and evaluation** — implicit in the founder's framing; making it first-class doubles usable item count for free.
8. **Reserved `audioUrl` field** — schema now, TTS post-MVP, so voice slots in without migration.

**CUT / DEFER:**
1. **Conversations → wave 3** — unbounded AI cost, no comparison gate, weakest persistence story; author the seeds now, build the page when the spine is solid (unanimous).
2. **Reading → fast-follow (W7–8)** — cheap by design, but don't block launch on passage QA for 12 lessons (3 of 4 lenses).
3. **Manual mix & match picker UI** — the blend toggle covers ~90% of the value; the engine's recipe type keeps the door open (unanimous).
4. **Saved "topics"** — a third content taxonomy for zero acquisition gain; lessons + saved items cover it.
5. **XP/achievements economy** — replace with three honest numbers (streak, items mastered, weakest error tags); every displayed number must derive from the evaluations table.
6. **Real SRS scheduler** — the blender's weakness/staleness weighting is the MVP's SRS; FSRS later, columns reserved.
7. **Placement test, voice, authoring UI, runtime sentence generation** — all confirmed out (placement/voice were already decided; JSON-in-git + CI is the CMS; runtime generation breaks the cost gate).

**The panel's through-line:** one shared error taxonomy, one evaluation endpoint, one item store, one session engine, content as CI-validated data in git. Every founder feature survives contact with that discipline; the only casualties are conversations-at-launch and the mix-&-match UI, both of which trade poorly against shipping the spine.
