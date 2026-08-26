---
id: PHASE-004
title: "Complete lesson and collection journeys"
type: build
proof_kind: visual
state: closed
order: 4
depends_on:
  - "PHASE-003"
from_backlog: null
owner: founder
outcome: "One representative A1 path carries a signed-in learner through a finite promoted lesson with contextual open questions, durable completion, newly available concept and topical collections, and an explainable recommended review in the shared learning workspace."
proof: "A signed-in learner starts the representative lesson, uses an authored hint, asks and resumes an open-ended topic question, misses and corrects a check, reloads without losing position or conversation, completes the lesson, opens its newly available review collection, and receives a reasoned next-review recommendation with the same dialect and retained progress."
non_goals:
  - "Generate or publish the complete A1 through C1 curriculum"
  - "Expand the Saved library or add Translate"
  - "Add a new scored modality, runtime-generated hints, unrestricted off-topic chat, or a standalone tutor"
  - "Build placement, launch telemetry, payments, or production hardening"
  - "Create a second lesson player or duplicate the Phase 3 session and evaluation contracts"
amends_specs:
  - "SPEC-F-CONTEXTUAL-QUESTIONS"
  - "SPEC-F-LEARNING-LOOP"
  - "SPEC-F-CONTENT-PIPELINE"
  - "SPEC-A-LEARNER"
  - "SPEC-A-CONTENT"
  - "SPEC-A-PLATFORM"
feature: SPEC-F-LEARNING-LOOP
area: SPEC-A-LEARNER
context_paths:
  - "apps/web/src/app/lessons/**"
  - "apps/web/src/app/practice/**"
  - "apps/web/src/app/api/practice/session/**"
  - "apps/web/src/components/**"
  - "apps/web/src/lib/practice-serving/**"
  - "apps/web/src/lib/learning-journey/**"
  - "apps/web/src/lib/db/**"
  - "apps/web/drizzle/**"
  - "content/placements/**"
  - "content/units/**"
  - "content/promotions/**"
  - "packages/lesson-schema/**"
opened: 2026-08-25
closed: 2026-08-26
lessons: "The frozen Phase 4 contract closed after a bounded creation-race identity guard; unrelated winners now conflict without termination, while same-source stale replacement remains."
---

# PHASE-004 — Complete lesson and collection journeys

## Context

Phase 3 proved that one promoted collection can grade, adapt, save, pause, and resume on the real Clerk, Neon, and AI Gateway path. The next learner gap is continuity: the existing lesson prototypes do not yet teach from promoted dialect-aware content, persist a learner's place, unlock review, or hand the learner into an explainable next session.

## Inputs

- Decisions this depends on: D-016, D-017, D-019, D-020, D-021, D-024, D-025
- Research consulted: None
- Specs this touches: SPEC-F-CONTEXTUAL-QUESTIONS, SPEC-F-LEARNING-LOOP, SPEC-F-CONTENT-PIPELINE, SPEC-A-LEARNER, SPEC-A-CONTENT, SPEC-A-PLATFORM

## Plan

Promote only the minimum additional A1 material needed for one coherent teaching arc, then describe its lesson placement and concept/topic collection memberships without copying the underlying meaning units. Evolve the Phase 3 session contract and shared workspace so teaching steps, authored hints, typed checks, feedback, contextual questions, and review use the same promoted items and dialect rendering. Implement SPEC-F-CONTEXTUAL-QUESTIONS through one bounded Ask AIdioma action: AI Gateway receives the active promoted source, relevant item and feedback, learner level, and Spanish profile; its visibly generated response may explain but cannot grade, add accepted answers, unlock content, or move the session. Persist lesson position, contextual exchanges needed for resume, and completion against the Clerk learner in Neon; completion makes the lesson's review scopes available, and the deterministic serving policy selects a recommended review with a plain-language reason.

The representative journey will fail closed when identity, promoted content, durable progress, contextual explanation, or grading is unavailable. Existing static lesson prototypes may be removed or narrowed as the real journey replaces them.

**Complexity cost:** one small lesson-placement contract, one learner lesson-progress record, and one bounded contextual-question action are added. All are consumed immediately by the representative journey; there is no second player, speculative curriculum graph, separate recommendation service, or standalone tutor.

## Proof

- [x] Candidate-bound content checks show every served teaching step, hint, answer, lesson placement, and collection membership resolves to promoted dialect-aware material.
- [x] Focused tests prove finite lesson order, reload-safe position, idempotent completion, completion-gated collection availability, source-bounded review, and an explainable deterministic recommendation.
- [x] SPEC-F-CONTEXTUAL-QUESTIONS tests prove bounded promoted context, active-profile responses, resume continuity, assisted-attempt handling, no grading/unlock/serving mutation, honest off-topic and provider failure, and no raw learner prompt text in logs or proof.
- [x] A development-Neon proof tied to a verified Clerk user retains lesson position, a scripted non-personal contextual exchange, and completion without printing learner identity or secrets.
- [x] A signed-in browser journey in `Docs/Evidence/phase-004/` shows lesson start → authored hint → scripted non-personal contextual question → reload/resume with the exchange intact → miss → correction → completion → newly available collection → recommended review, all in one Spanish profile.
- [x] Honest auth, content-integrity, persistence, grading, and stale-request failure states are exercised without fabricated progress.

## Audit

Filled at `/plan` from `Docs/CLOSE.md`. This phase changes authenticated learner state, a Neon migration, promoted content, API behavior, and learner-visible UI, so every canonical gate applies and Tier 3 requires a fresh auditor for each lens.

**Risk tier:** 3

| Lens | Run? | Why / N/A | Sub-agent |
|---|---|---|---|
| Claims / Proof evidence | yes | Every phase; challenge whether retained proof demonstrates the full signed-in journey and every outcome claim. | audit-claims |
| Code quality / Standards | yes | Tier 3 code, tests, content contracts, migration, and repository rules change. | audit-standards |
| MCOO | yes | Every phase; reject duplicate players, speculative curriculum machinery, and work beyond the representative journey. | audit-mcoo |
| Seams / Integration | yes | Lesson content, shared workspace, session API, serving policy, Clerk identity, and Neon progress cross multiple boundaries. | audit-seams |
| Security / Privacy | yes | Authenticated learner identity, durable progress, attempts, contextual prompts/responses, and proof-data retention change. | audit-security |
| API / Provider usage | yes | The outcome uses Clerk, Neon, and AI Gateway for grading and contextual explanations under D-024 and D-025. | audit-provider |
| Product / Learner journey | yes | The phase changes the complete lesson-to-review experience, contextual help, feedback, unlocks, resume, and recommendation copy. | audit-product |

`Docs/Evidence/phase-004/close-audits.md` will be the compact index. Complete responses will live once under `audits/`; ordered selection will live in `audit-results.json`; replayable deterministic checks and every retained attempt will live under `checks/` and in `check-results.json`. Close uses one immutable candidate and one fresh declared auditor per required lens.

## Close record

The immutable final decision will live in `Docs/Evidence/phase-004/close-record.json`; publication results later live in `Docs/Evidence/phase-004/publication.md`. At close, change only frontmatter `state`, `closed`, and `lessons` in this file.

## Kickoff

```text
/run PHASE-004

Read AGENTS.md, Docs/NOW.md, this phase file, Docs/Specs/Features/SPEC-F-CONTEXTUAL-QUESTIONS.md, and Docs/Evidence/phase-004/target.json. Build only the representative A1 lesson with bounded Ask AIdioma help → unlocked collection → recommended review journey on the existing promoted-content and shared-session contracts.
```
