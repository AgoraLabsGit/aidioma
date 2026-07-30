# Post-MVP — parked features & later upgrades

> One home for “not in launch, don’t forget.” Agents check here before inventing scope.
> Promote a row into ROADMAP via `/feature` when it’s time to build.

| ID | Item | Why later | Trigger to reopen |
|---|---|---|---|
| PM-001 | Rewrite hint authoring: 0–1 strong hint (or drop forced `hints.length(3)`) | MVP UI is mode-smart (OI-024); current 3-pack often unhelpful | After launch feedback on “stuck” moments; needs schema additive change or style-guide-only if UI ignores extras |
| PM-002 | Full 3-level progressive hint UX (cost labels, verb tables) | Overbuilt vs Reveal + Ask tutor | Data shows Ask-tutor cost high and offline help needed |
| PM-003 | Notes model (feature 8) | Deferred 2026-07-28 (OI-015); saved items only at launch | After saved_items ships and users ask for notes |
| PM-004 | Study / reference cards — **deeper content volume** | Schema + MVP UI approved (ADR-0012 / P-005); cards optional per lesson | Author more cards after core loop ships |
| PM-011 | Manual multi-lesson picker | Continue + Blend + Review cover MVP without picker complexity | Users ask to combine named lessons after Blend ships |
| PM-005 | Dialects / region variants (feature 14) — **content + UI** | Schema shape reserved (P-004 APPROVED 2026-07-28); launch stays neutral LatAm/tú | After A1 verified; separate content wave |
| PM-006 | 5-level familiarity candidate: Brand new → Needs practice → Partial → Knows well → Mastered; distinct retrieval days + optional user threshold; lesson rollup still Completed/Mastered | Deferred by ADR-0011; may combine objective Type performance with optional Flashcard self-rating | After blend proven and users need finer control |
| PM-007 | Reading modality ES→EN (roadmap A8) | Reuses evaluate; fast-follow by design | After MVP ship |
| PM-009 | KB growth: repeat-verdict cache → AI-correct answer becomes a **review candidate** → approved alternate; A9 custom-topic generation passes provenance + validate/QA before becoming authored | Direct automatic promotion risks poisoning content; needs measured repeat misses/spend | AI spend or repeat-miss data justifies |
| PM-014 | Single MVP success metric (e.g. week-1 return to completed session) | Parked 2026-07-28 — not blocking design/build | First cohort of real users; before big feature bets |
| PM-016 | Streak rest-day grace | Calendar-day streak ships without grace inventory/rules | Users report the streak feels punitive after launch |
| PM-017 | Deeper companion lessons / reference-card collections | Core 12 + optional MVP cards come first | Learners ask for depth after the core loop ships |
| PM-019 | Real SRS/FSRS scheduler | MVP blender already handles weakness + staleness; SRS columns reserved | Retention data shows the weighted blender is insufficient |
| PM-020 | Assistance telemetry (cue, Reveal, Ask tutor) as a weakness signal | MVP help works without punitive hint scoring or another analytics system | Help usage is high enough to improve review ordering |
| PM-021 | Rich reading library: tap-to-gloss, genre/difficulty filters, reading-time/comprehension, save vocab | A8 launches the reusable reading evaluation first | Reading modality is proven and has repeat users |
| PM-022 | User-content import: manual text first, document/URL later; extract items then run provenance + content gates | User-supplied material creates licensing, privacy, and QA risk | Core authored curriculum and custom topics are proven |
| PM-023 | Offline session continuity: cached authored content, local attempt queue, reconnect sync, auth restoration | Requires conflict/idempotency design across sessions/evaluations | Mobile usage shows unreliable-connectivity demand |
| PM-024 | Adaptive placement assessment with explained result | Launch is A1-first and has no higher-level destination yet | A2 content exists and start-level routing becomes useful |
| PM-025 | Structural-difficulty QA (frequency tier + clause/structure signals) | Current human/LLM QA is sufficient at 12 lessons | Content volume makes manual calibration inconsistent |
| PM-026 | Phoneme-level pronunciation assessment and scoring | STT can normalize imperfect speech into the intended word; grammar correction is not pronunciation evidence | A12 live beta is proven and a labeled native-reviewed pronunciation corpus/provider bake-off is funded |

## Already decided for MVP (do not re-open here)
- Mode-smart help — OI-024 / module-spec §Settled (2026-07-28).

## Promoted to ROADMAP

| ID | Promoted decision | Where |
|---|---|---|
| PM-015 | 2026-07-29: reviewed curated Practice Sets enter MVP; private custom-topic generation follows after the curated path is proven | ADR-0015 · ROADMAP A6/A9 · `Specs/Features/practice-sets.md` |
| PM-008 | 2026-07-29: constrained conversation becomes the A12 guided live beta after a provider bake-off | ADR-0016 · ROADMAP A11/A12 · `Specs/Features/voice-practice.md` |
| PM-018 | 2026-07-29: listen/speak audio becomes the A10 turn-based core and staged quality path; pronunciation scoring remains PM-026 | ADR-0016 · ROADMAP A10–A13 · `Specs/Features/voice-practice.md` |
