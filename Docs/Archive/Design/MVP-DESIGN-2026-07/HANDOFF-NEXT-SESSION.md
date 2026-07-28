# Handoff — AIdioma app track (for the next session/agent)

> **Historical design handoff.** Its open agenda was resolved by A0. Current position lives in
> `Docs/STATE.md`; settled UI lives in `Docs/Specs/Features/module-spec.md` and ADRs 0003–0012.

**Written:** 2026-07-21, end of the prototyping session (session 3 of the MVP redesign).
**Supersedes:** the 2026-07-21 design-review handoff (its agenda is fully executed; decisions logged below). The three companion docs remain valid reference: MVP-REVIEW → MVP-DESIGN-CONSENSUS → MVP-DECISIONS-RECOMMENDED (all 2026-07-21).
**Parallel track:** content authoring runs app-independently — `MVP-DESIGN/HANDOFF-CONTENT-TRACK.md` + `/lesson-content/`. **What that pipeline is, what's built, and how the app consumes it is recorded in `MVP-DESIGN/LESSON-INFRASTRUCTURE.md` — read it before touching the lesson contract or the DB mapping.** **Standing rule: check `lesson-content/schema/SCHEMA-APPROVALS.md` at the start of every app-track session — this track is the App Design Coordinator with final schema approval, and P-001 is waiting (§4 below).**

---

## 0. STATUS ADDENDUM — session 4 (2026-07-21, later same day)

Executed from this handoff; supersedes the parts of §3–§4 noted below:
- **P-001 APPROVED** → schema **v1-FROZEN**; **P-002** (required PassageSegment.id, filed by Mike's parallel DB-audit agent) also **APPROVED**, backfilled corpus-wide. Rulings in `lesson-content/schema/SCHEMA-APPROVALS.md`.
- **§4 is done and exceeded:** a1-01 wired into the prototype (by content track, verified), then **pilot production ran: a1-02 + a1-03 both L2-PASS** after fix loops (a1-02 had a CRITICAL — false gender rule induced by a leak-detector gap — caught by adversarial QA, fixed, r2-verified). Corpus validates 0 errors. `prototype/lesson-data.js` regenerated: **l1–l3 all real content** (mock l4 remains). Founder go/no-go on a1-04…a1-12 pending: `lesson-content/review/FOUNDER-REVIEW-PILOT.md`.
- **§3 cut #1 resolved Mike's way, not the reviewer's:** streak badge removed from Practice header; proficiency bar → radial (same ring language as goal ring, both enlarged to 26px); new 📖 lesson-access button left of the filter button (disabled state when no lesson page exists). Cuts #2–#4 (Direction section, lesson multi-select, goal presets/reminders row) **still open**.
- **New open item:** real l3 displaced the mock "Ser vs Estar" lesson, but the static lesson-detail page still shows Ser-vs-Estar content — proposed fix: render the lesson page from real data (add explanation to `tools/export-prototype.ts`, generic renderer); Mike hadn't ruled yet.
- Known validator gaps + §4-alternates friction + `VocabItem.acceptedEn` are queued as **P-003** material (see SESSION-LOG session 2 entries).

## 1. Who/what/where

- Founder: Mike (solo, main designer, AI-assisted dev). Cost-sensitive. Spanish-learning app. One decision block at a time — don't overwhelm.
- **The working prototype is the center of gravity now:** `prototype/index.html` (v7, single file, no build step) + `prototype/preview.html` (phone 390px + web 1100px side-by-side via iframes). Open directly in a browser (`open prototype/index.html`). No claude.ai artifacts — Mike explicitly wants local web files only (the old artifact URL is frozen/stale).
- V1 codebase = read-only reference only; greenfield decision is made (§2.1). Old `Docs/` completion claims remain false; trust only `MVP-DESIGN/` + `lesson-content/`. If V1 must be run, see the launch-gotchas list in MVP-REVIEW §1 (ports 3002/5174, pnpm 11 workaround, revoked keys, retired model).
- Prototype tech notes: state persists in localStorage under `aidioma.*` (goal, theme, saved words, prof3, done.<date>); first run seeds fake demo stats (streak 4, 47 mastered, 23 today) — Settings → About → Reset clears all. Fake data is deliberate for demo; a real first-run zero-state is a logged launch requirement.

## 2. Decisions made this session (confirmed by Mike unless noted)

1. **Greenfield**: fresh repo, Next.js on Vercel, keep Neon + Clerk; V1 archived as reference.
2. **App shape**: one chat-centric Panel — *guided feed + open mic* (app deals cards; the input always also accepts free questions to the AI tutor, answered inline). Conversation-first Model B rejected; its fluidity arrives later as a wave-3 mode chip.
3. **Mix mode default**: one session walks the lesson arc **Learn → Quiz(MC) → Words → Sentences → Story**; other modes are filters on that arc. (This merged the old "guided sequence" + "blend toggle" ideas.)
4. **Dual-duty input** confirmed — he likes the minimal UI.
5. **Cards+Translate merged** into one "Type" mode with a Words/Sentences toggle (separate item kinds underneath).
6. **Mode config lives in a slide-in side panel** (funnel icon), keeping the main screen minimal: lesson multi-select ("tap to combine"), Blend, Saved-words pool, mode, unit, direction, missed-this-session list, saved list (tap-to-remove), end-session.
7. **Direction**: EN→ES / ES→EN / Both (Both alternates per card). MVP launch is still EN→ES-only per panel ruling D3 (unsigned); the prototype intentionally runs ahead to test UX.
8. **Multi-lesson sessions**: same infra as Blend (recipe pool) — in the prototype; whether the picker UI ships at MVP stays open (consensus: engine-yes/UI-later).
9. **Lessons catalog tab** with **level sections** (Sounds & spelling ✓ Complete / A1 Foundations "You are here" / locked future levels with teasers) — the consensus "Library", resurrected as a tab.
10. **Home + Progress merged**: stat tiles top, continue card, path with Focus / In review / Mastered badges (= the blend pool made visible), weekly chart vs goal line, "Focus on" weak-areas list.
11. **Daily goal = total exercises** (not correct-only; effort metric — wrong answers count). Presets 20/50/100/150 + custom input (5–500), default 50.
12. **Styling**: warm editorial identity (paper ground, single sienna accent, Avenir, uppercase micro-labels) — NOT dark generic-AI. **Dark mode added**: Auto/Light/Dark in Settings, Auto follows system.
13. **Voice/Talk**: grayed "soon" wherever shown. Calendar-day streak; zero notifications ("none — by design").
14. Adopted from a 3-lens design panel (UX / minimalism / learning-science) run on the prototype: **audio via speechSynthesis** (listen buttons on vocab, Spanish-side cards, story lines, every answer — the panel's #1 gap); **misses re-queue within the session** until retrieved (labeled "again"); **honest scoring** (wrong MC = 15, garbage-typed floor = 10, correct-with-hint labeled); **reveal** affordance next to hint; per-session card shuffle; "✓ daily goal met" feed marker; saved-words persistence; reset-data row.

## 3. NEXT SESSION — agenda 1: rule on the contested UI cuts

The minimalism reviewer's boldest cuts were overruled this session because they collided with Mike's explicit asks — **Mike now wants them properly considered**, one at a time:

1. **Practice header**: strip badges + live proficiency bar down to just title + options button? (Reviewer: streak/ring already live on Home; each answer is effectively scored twice — radial verdict AND ticking header bar; the feed reads calmer bare. Direct conflict with Mike's original "proficiency + daily stats in header" ask.)
2. **Delete the Direction section** from the panel? (Reviewer: day-1 beginners can't make this choice; default EN→ES, let Mix auto-introduce reverse cards — per-card `dirA` mechanism already exists. Pedagogy panel adds: serve recognition-direction FIRST for brand-new items, promote to production after one success.)
3. **Drop lesson multi-select**? (Reviewer: duplicates Blend's job; costs panel notes, title states, per-card source tags.)
4. **Collapse goal presets+custom to one control** and cut the "Reminders: none" settings row?

Also queued from the panel for the module spec (Mike saw the list; confirm which are in): first-run zero state · unified status vocabulary (six tag styles → done/current/locked) · word-level error diff naming the mistake · **split "today's accuracy" (live) from persistent proficiency (next-day-confirmed only)** — feeds the proficiency-algorithm spec · lesson detail pages for every lesson (only L3 has one) · "Review · N due" row on Home · quieter card furniture · Home-path vs Lessons-tab duplication.

## 4. NEXT SESSION — agenda 2: review + integrate the first real lesson

The content track finished its golden lesson and is **blocked on this track's ruling**:

- **First, rule on P-001** in `lesson-content/schema/SCHEMA-APPROVALS.md` (status: PROPOSED; hard gate on scaled production). Five rulings requested: `multipleChoice` kind + `quickChecks[]` (0–6, index-graded, never hits `/api/evaluate`); sentence-flashcard as a view-flag on SentenceItem; optional per-item `provenance`; freeze the A1 tag block (30) with A2/B1 provisional; note the P-002 candidates. Review against: EvaluationRequest/Result contract, lessons/lesson_items DB mapping, SessionEngine recipe needs, and the Panel UI (MC mode and word/sentence flashcards are both *in the prototype already* — the proposal should map cleanly). Evidence: `lesson-content/schema/lesson-schema.ts` (compiles, smoke 11/11), `SCHEMA-NOTES.md`, golden lesson `lesson-content/lessons/a1/a1-01-hola-me-llamo.json` (validator 0 errors, adversarial QA passed), `tools/validate.ts` (14 checks). Flip the status with notes; disputes escalate to Mike in the log.
- **Then wire a1-01 into the prototype**, replacing/joining the hardcoded `LESSONS` mock as Lesson 1. Mapping: `quickChecks`→Quiz cards · vocab→Words (alternates both directions) · sentences→Sentences (acceptedEs/acceptedEn; note the schema's 3-level hints vs the prototype's single hint — friction expected, log it) · passage→Story · flashcard view-flags→deck eligibility. Contract friction discovered here feeds back into P-001 notes / P-002 — that's the point of the exercise.
- **Gotcha**: `fetch()` of local JSON fails on `file://`. Either serve (`python3 -m http.server` in `prototype/`) or generate `prototype/lesson-data.js` (`window.LESSON_DATA = {…}`) from the JSON and `<script src>` it. Recommend the generated-JS route so double-clicking keeps working.

## 5. Parked / carried forward

- **DB model confirmation** — walked through in session 2, parked by Mike until the UI settled. It has held up: everything the prototype added maps onto it (mc kind or derived, `modality` value, recipe `phases`/pool, direction per evaluation, daily-goal on users, saved_items). Re-confirm alongside the **proficiency algorithm spec** (coverage × best-score with recency decay; live-accuracy vs confirmed-proficiency split from §3).
- **Formal sign-off on the 9 panel recommendations** (Gateway + gpt-5-mini w/ W2 bake-off, A2 banner, 4-layer content review, W1 return metric, calendar streak/no notifications, 10 vocab/lesson, Completed/Mastered split, EN→ES launch, drop evaluationCache) — deferred twice; several now half-ratified by prototype decisions. Close them out.
- Old §2.6 proposals: (b) guided sequence → **confirmed** (= Mix arc); (c) typed-recall flashcards → **effectively confirmed** (Type mode); (a) word-types-as-facets → untouched, revisit at DB confirmation.
- W2 verification: confirm `gpt-5-mini` + `claude-haiku-4-5` actually routable via Vercel AI Gateway.
- Preview-ahead policy: previewing future lessons (implemented, labeled) vs "no quiz on untaught material" — decide in the module spec.
- Final deliverables once settled: module spec + new roadmap (most content exists in the consensus doc).

## 6. Session mechanics that worked (keep)

One decision block at a time. Prototype-first: all UI iteration directly on `prototype/index.html`, reload to see; `preview.html` for dual-viewport checks. Sub-agent design/UI panels are valuable, but findings get triaged BY the main session against Mike's explicit decisions — never auto-apply cuts that collide with founder asks; surface them honestly instead (that's what produced §3).
