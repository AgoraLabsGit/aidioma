# MVP Design Review — State of the App & Findings
**Date:** 2026-07-21 · **Status:** Working document for the MVP redesign
**Ground rule:** Everything is assumed UNBUILT until reviewed and verified. Docs claiming completion are not evidence.

---

## TL;DR

AIdioma is one working page (Practice) plus four attractive-but-hollow page shells, on a backend with three overlapping AI services where one would do, and a fully-designed database the app almost entirely ignores — no user progress is ever saved. The prior docs' "MVP Complete / Production Ready" claim is contradicted by the project's own July 2025 audit. The hard parts (evaluation UX, DB-comparison-first cost gate, Clerk auth, schema) exist; an MVP is reachable mostly by deleting and wiring, not building.

---

## 1. Verified-live smoke test (2026-07-21)

- App launches: server on :3002 (3001 occupied by unrelated Next.js app; 5000 collides with macOS AirPlay → client on :5174 via `client/vite.config.launch.ts` scratch config).
- pnpm 11 pre-run check breaks `pnpm dev` (unapproved build scripts). Workaround: `onlyBuiltDependencies` in pnpm-workspace.yaml + launch binaries directly (`server: PORT=3002 ./node_modules/.bin/tsx src/index.ts`, `client: ./node_modules/.bin/vite --config vite.config.launch.ts`).
- **Stored Anthropic/OpenAI API keys are revoked.** Server crashes on boot doing a Claude health check (unhandled rejection in claude-service.ts). Workaround: blank the keys → heuristic-only mode works.
- **Neon Postgres is alive** and seeded (15 sentences). `/health` 200, `/api/sentences` returns real data.
- Welcome page, Clerk sign-in (dev instance live), and `/sandbox` practice loop all render and work — submitted a translation, got word-level feedback + hint/penalty options. Zero console errors.
- Hardcoded model `claude-3-haiku-20240307` is past its retirement date (Apr 19, 2026) — calls will fail even with fresh keys.

## 2. Frontend inventory (what's real vs mock)

| Page | Lines | UI | Functionality |
|---|---|---|---|
| PracticePage.tsx | 828 | Complete | REAL — wired to /api/claude-mvp/* (sentence eval, word-level click-to-evaluate, 3-level hints). Stats hardcoded (correctCount 12/3). |
| ReadingPage.tsx | 910 | Complete | Evaluation/hints/bookmarks are mocks |
| ConversationsPage.tsx | 710 | Complete chat UI | "AI" = canned Spanish string on 1.5s setTimeout |
| MemorizePage.tsx | 721 | Complete flashcards | 3 hardcoded cards; SRS buttons console.log only |
| ProgressPage.tsx | 500 | Complete dashboard | 100% mock literals (XP 2347, grades, achievements) |
| Settings/Achievements/Content | — | Placeholder | "Temporarily disabled due to React Hooks violations"; sidebar still links to them |
| PracticePage_BACKUP_BEFORE_CLAUDE_MVP.tsx | 770 | — | Dead file, unimported |
| /sandbox, /enhanced-practice | 217/586 | — | Dev experiments in production routing |

**Cross-cutting UI facts:**
- Header/sidebar/`md:ml-64 pt-16` shell + `currentUser` mapping copy-pasted across all 5 pages; branding diverges (Logo component vs plain h1).
- Two conflicting token systems in `index.css` (raw-hex "Strike" vars + Tailwind HSL vars) plus unused `.btn-*`/`.card` CSS classes duplicating Button/Card components.
- Dark-only theme; `darkMode:"class"` configured but no toggle; `dark:` variants never fire.
- Word-status chips use light-theme palettes (`bg-green-50 border-green-200`) that clash on dark bg (PracticePage.tsx:232-234).
- Fake data everywhere: ProgressWheels hardcodes 7/15, 12/25, 4/7; sidebar always "Level beginner • 0 pts" (useUser.ts:61-63 TODOs); useUser references nonexistent `PUT /api/users/update-profile`.
- PracticePage `handleSubmit` bypasses the TanStack Query mutation in usePractice.ts (direct fetch, no cache/invalidations); `usePractice.getUserProgress` is a setTimeout mock.

## 3. Backend / AI stack

Two parallel non-overlapping evaluation stacks:
1. `/api/claude-mvp/*` → **claude-mvp-service.ts** (~1,368 lines; own Anthropic client; OpenAI "fallback" is FAKE — returns heuristic labeled openai).
2. `/api/sentences/*` → **universal-ai-learning-service.ts** (~1,065) → **claude-service.ts** (~1,057; only reachable through universal; its rich activity prompts effectively dead).

- Near-verbatim duplication across the three: MemoryCache, logger, StandardModule interface, Levenshtein, Spanish-word heuristics, cost tracking. Three separate uncoordinated in-memory caches.
- **The one great pattern:** `/api/claude-mvp/evaluate-sentence` does DB/string comparison FIRST (normalize → exact → Levenshtein bands); score ≥70 → instant response, zero AI tokens; AI used only for feedback text on poor matches. This is the real cost optimization — keep it.
- Inconsistent scoring paths: `/api/sentences/evaluate` stuffs the whole sentence into `evaluateWord` with no comparison-first logic. Two different hint endpoints (one AI-wrapped, one pure templates).
- `evaluationCache` Postgres table orphaned (caching is in-memory). `.env.example` advertises knobs no code reads; stale SQLite DATABASE_URL example. Dead debug scripts at repo root. `.backup.20250720_184846` file in services/.
- DeepL/LanguageTool: docs only. No SDK, no key, no code.
- Bug: server crashes (unhandled rejection) when Anthropic key invalid — make health-check failure non-fatal.

## 4. Data model & progress tracking

- `shared/schema.ts`: 7 tables (users, sentences, userProgress, practiceSessions, evaluations, evaluationCache, learningAnalytics) with relations + Zod schemas. **Only `sentences` is touched by live routes (read-only).** Everything else seed-only.
- Clerk never joins the DB — no code creates/looks up a users row from a Clerk ID.
- Evaluations compute score + pointsEarned and discard them. `/api/practice`, `/api/evaluation`, `/api/analytics`, `/api/auth` are "coming soon" stubs.
- Content: 15 seeded sentences; straight filtered pagination in fixed ID order; no randomization/SRS/adaptivity. Bugs: list `total` returns page size not true count; `/meta/*` endpoints read the in-memory seed array, not the DB.

## 5. Roadmap reality

- AI-MASTER-ROADMAP.md claims "MVP Complete / Production Ready / 90% cost reduction ($515→$95/mo)"; Phase 2 = DeepL + LanguageTool + Universal Router ($26/mo target).
- 02-Roadmaps/AI/Master-Roadmap.md ("Reality Check — July 20, 2025"): Practice 60%, Reading/Memorize/Conversation **0% AI**, progress analytics 35%; explicit "reality gap" (features documented 95%, actually 20–30%).
- Three contradictory cost models across docs ($95 vs $63 vs ~$600/mo). Last real work (Aug 2025): docs cleanup + un-coded "V2" DeepL-centric design.
- **Honest position: mid-Phase-1. One page working. Phase 2 never started.**

## 6. Key recommendations (from review)

1. **Scope MVP to Practice + real Progress.** Hide Reading/Memorize/Conversations from nav (keep code dormant).
2. **One AI service, one provider, one route family.** Keep the claude-mvp path (has the comparison-first gate); delete claude-service.ts + universal-ai-learning-service.ts; retarget /api/sentences/evaluate* at the survivor. ~4,900 lines → ~400-500. Make invalid-key non-fatal.
3. **Close the persistence loop (highest-value work).** Upsert users row keyed by Clerk ID; write one evaluations row per submission; update userProgress; derive points/streak/level on read. Makes Progress/sidebar/wheels real. Drop orphaned evaluationCache table.
4. **Content:** grow seed to ~100 sentences via one-off generation script; serve "least-recently-attempted at right difficulty" (one query). Real SRS post-MVP.
5. **Design system:** one AppLayout; one token system (keep Tailwind HSL, delete Strike vars + `.btn-*` classes); fix light-on-dark chips; remove dead nav links; delete backup/sandbox/demo files.
6. **Docs:** replace roadmap sprawl with one STATUS/roadmap doc (this file starts that). Archive `AIdioma.V2 (AI_Dev)/` — V1 is the product.

## 7. Direction set 2026-07-21 (decisions from review kickoff)

- **MVP design review mode:** everything assumed unbuilt until reviewed; work with current UI but improve it; docs to be rewritten; new roadmap to be created.
- **Module-first for real this time:** design a core product spine of reusable modules (evaluation/grade module, practice tracker/session engine, hint system, progress display) enforced in code (shared types + headless hooks), so features are adapted per page/practice-type, not rebuilt.
- **Provider strategy under consideration:** OpenAI or cheaper (e.g., Kimi) vs Anthropic; possibly Vercel AI Gateway for multi-model optionality behind one endpoint. Decision pending; abstract behind our own single evaluation service either way.
- **Voice is post-MVP:** research ElevenLabs and alternatives later; design module contracts so a speaking/listening practice type can slot in.

## 8. Lesson-centric architecture (decided 2026-07-21, same session)

- **Lessons are the organizing unit of the app.** Sequenced beginner→advanced, authored as typed schemas (Zod in shared/ + content files), buildable in parallel with app dev once contracts are set. Content extraction from textbooks = scope/sequence and topics only (not copyrightable); actual sentences/explanations written original (LLM-assisted + human review).
- **One lesson feeds all four modalities from its atoms:** vocabulary items → flashcards; sentence bank → typed translation; generated/authored passage → reading (both directions ES↔EN); topic + vocab + persona → conversation context. Author once, practice four ways.
- **Four modalities:** typed sentence translation, reading translation (ES→EN and EN→ES), flashcards, conversations.
- **Blended/interleaved practice:** session recipes mixing the current lesson with the last 3–4 lessons (weighted by per-item weakness from userProgress). Users can also mix & match lessons/topics manually.
- **Saved items:** user can save words/sentences/topics anywhere in the app → personal deck feeding flashcards and blends (makes the existing dead bookmark buttons real; needs a saved_items table).
- **Schema additions implied:** lessons, lesson_items (vocab/sentences/passages), user_lesson_progress (with mastery criteria for unlock), saved_items.
- **Evaluation contract addition:** error taxonomy tags (conjugation, gender agreement, word order, vocab choice…) on results — cheap now, powers weakness-weighted blending + Progress-by-grammar-point later.
- MVP progression model: self-selected start level + linear unlock by mastery (no placement test at MVP).
