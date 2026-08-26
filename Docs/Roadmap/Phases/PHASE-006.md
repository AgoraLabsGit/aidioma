---
id: PHASE-006
title: "Reusable Practice collection pipeline and five-collection proof"
type: build
proof_kind: visual
state: proposed
order: 6
depends_on:
  - "PHASE-005"
from_backlog: null
owner: founder
outcome: "One reviewed concept or topic collection can enter the promoted Practice catalog and run through the shared adaptive workspace without collection-specific application code; five diverse A1–B1 collections prove shared items, dialects, grading, hints, contextual help, learner evidence, pause/resume, saving, and explainable serving."
proof: "A signed-in learner sees and completes five promoted concept/topic collections whose cards, membership, unlocks, item versions, and dialect renderings come from reviewed collection definitions. Lesson evidence changes later collection ordering, assisted work cannot raise mastery, and adding a fixture collection changes content/promotion data but no collection-specific JSX, resolver, route, session-service, or grading code."
non_goals:
  - "Create a second content pipeline, duplicate lesson items, answers, hints, concepts, topics, or dialect renderings"
  - "Change the finite lesson pipeline or force lesson and adaptive Practice orchestration into one state machine"
  - "Generate or market the complete A1 through C1 collection matrix"
  - "Build Saved-library expansion, named lists, or Translate"
  - "Add multiple choice, speech, listening, flashcards, games, unrestricted chat, or another scored modality"
  - "Add a learned recommendation model, opaque collection membership rules, or a generic query/workflow language"
amends_specs:
  - "SPEC-F-CONTENT-PIPELINE"
  - "SPEC-F-LEARNING-LOOP"
  - "SPEC-F-CONTEXTUAL-QUESTIONS"
  - "SPEC-A-CONTENT"
  - "SPEC-A-LEARNER"
  - "SPEC-A-PLATFORM"
feature: SPEC-F-CONTENT-PIPELINE
area: SPEC-A-CONTENT
context_paths:
  - "packages/lesson-schema/**"
  - "tooling/content/**"
  - "content/collections/**"
  - "content/lessons/**"
  - "content/placements/**"
  - "content/units/**"
  - "content/promotions/**"
  - "content/review/**"
  - "apps/web/src/app/practice/**"
  - "apps/web/src/app/api/practice/session/**"
  - "apps/web/src/components/**"
  - "apps/web/src/lib/practice-serving/**"
  - "apps/web/src/lib/practice-sets/**"
  - "apps/web/src/lib/evaluation/**"
  - "apps/web/src/lib/contextual-help/**"
  - "apps/web/src/lib/learning-journey/**"
  - "apps/web/src/lib/db/**"
  - "apps/web/drizzle/**"
opened: 2026-08-26
closed: null
lessons: null
---

# PHASE-006 — Reusable Practice collection pipeline and five-collection proof

## Context

Phase 3 proved one real adaptive Practice session, and Phase 4 proved that completing a lesson can unlock and launch a review collection. Those paths still resolve one promoted unit and render collection cards through hard-coded application branches. Phase 5 will prove that six full lessons enter the product through one promoted rich-lesson path and will produce the same canonical item evidence Practice needs.

This phase makes Practice collections a second, focused consumer of that foundation. A collection is not another lesson: it groups already-promoted items by a reviewed concept or practical topic, then lets the existing deterministic policy choose the next weak, due, or new item inside that boundary. The founder will get five materially different collections to test before Saved/Translate or bulk A1–C1 generation expands the surface area.

## Inputs

- Decisions this depends on: D-016, D-017, D-019, D-020, D-021, D-023, D-024, D-025
- Research consulted: None; the product and feature contracts already define concept/topic collections and deterministic serving
- Specs this touches: SPEC-F-CONTENT-PIPELINE, SPEC-F-LEARNING-LOOP, SPEC-F-CONTEXTUAL-QUESTIONS, SPEC-A-CONTENT, SPEC-A-LEARNER, SPEC-A-PLATFORM

## Practice proof set

| Collection | Kind | Purpose in the proof |
|---|---|---|
| Greetings and introductions | A1 topic | Prove a practical topic assembled from the real course opener. |
| Completed past actions | A2 concept | Prove concept membership and weak/missed-item prioritization. |
| Time and routines | A2 topic | Prove related vocabulary, phrases, and sentences across time constructions. |
| Places and directions | A2 topic | Prove spatial language, dialect-sensitive renderings, and varied prompt depth. |
| Connecting ideas | B1 concept | Prove longer multi-clause production and cumulative evidence at a higher level. |

At least one proof collection must contain promoted items originating in more than one lesson artifact. The set proves pipeline and learner-experience breadth; it does not claim to be the final intermediate collection taxonomy or complete level coverage.

## Plan

### 1. Add one reviewed collection authority to the existing pipeline

Define the minimum versioned collection artifact: immutable ID, content version, learner-facing title and description, exact CEFR scope, `concept` or `topic` kind, referenced concept/topic identity, prerequisite or lesson-unlock rule, supported Spanish profiles, and promotion identity. Membership resolves from the concept and topical tags already attached to promoted bilingual units; it never copies canonical text, accepted answers, hints, or dialect renderings into the collection.

Validate that every resolved member is promoted at the pinned version, belongs to the declared level/scope, supports all required profiles, and has intact answer policy and review evidence. A collection with a missing reference, empty eligible pool, stale member, unsupported profile, duplicate membership, failed review, or absent promotion receipt fails publication and serving instead of dropping or substituting items. Keep membership limited to the two product-owned meanings—concept and practical topic—rather than introducing a query language.

### 2. Make the Practice catalog a registry consumer

Derive collection cards, kind/level labels, descriptions, availability, membership, source versions, and lesson-unlock relationships from the promoted collection registry. Remove the hard-coded card JSX, known collection-ID conditions, and single-unit resolver branches. Adding the fifth collection must use the same content and promotion records as the first four and must not require a new component, route, session method, evaluator, or database table.

Unavailable or locked collections remain visible only when the product contract calls for inspectable course context, and their state is explained honestly. A dedicated development proof learner may have seeded lesson prerequisites so the founder can open all five without creating a production bypass.

### 3. Reuse the adaptive loop and shared learning turns

Keep the Phase 3 deterministic serving policy: after the learner chooses a collection, rank unresolved misses, due items, low-confidence evidence, and controlled unseen material only inside its eligible promoted pool. Lesson attempts and collection attempts write the same dialect-neutral item/concept evidence, so an unassisted lesson answer can affect the next collection item while an assisted answer or contextual question cannot increase mastery.

Factor and reuse behavior that is identical across Lessons and Practice: typed composer intent, current-cue authored hints when present, correction/feedback card, Ask AIdioma question turns, request cancellation, auth/provider errors, and message-feed accessibility. Preserve the distinct orchestration: Practice owns adaptive selection plus pause/resume/end/recap; Lessons own authored finite order plus completion. No second player and no universal workflow engine are introduced.

Implement bounded contextual questions for promoted collections using the Phase 4 authority boundary. Gateway context contains only the active collection, current promoted item, relevant hints/feedback, level, and profile. Pre-answer questions mark the attempt assisted; direct answer requests reveal only the next authored hint when one exists; questions cannot grade, change membership, advance serving, or unlock content.

### 4. Prove five real collections

Author, review, and promote the five named collection definitions against the six Phase 5 lesson artifacts. Each collection’s unique typed-prompt membership must meet the same CEFR floor as lessons (A1 ≥25, A2 ≥35, B1 ≥50). A Practice visit may continue past that floor by re-serving weak, due, or unseen in-scope items, and ends no later than 100 offers. Do not duplicate lesson sentences into the collection record.

**Complexity cost:** one small collection schema/registry and its promotion validation are added. The existing Practice session, evaluator, evidence tables, provider adapters, and interaction components are reused and consolidated. Collection-specific JSX/resolvers are removed; Saved scopes, bulk generation, a rule engine, and new activity modes remain out.

## Proof

- [ ] Candidate-bound validation parses all five collection definitions and exact resolved memberships, levels, kinds, prerequisites, profiles, member versions, answer/hint policy, review results, and promotion receipts; negative fixtures fail every publication gate.
- [ ] A registry extension test adds a fixture concept/topic collection through content and promotion data only, then proves the catalog and runtime resolve it with no collection-specific JSX, route, session-service, evaluator, or database branch.
- [ ] Catalog tests prove that cards, labels, descriptions, lock/availability state, source versions, and item counts come from the promoted registry; hard-coded collection IDs and single-unit fallbacks cannot serve learners.
- [ ] Adaptive tests prove pool boundaries, miss retry, due/weak/new ordering, controlled unseen material, item variety, pause/resume/end/recap, stale/duplicate requests, and honest empty/stale/unavailable collection failures across the five definitions.
- [ ] Cross-surface tests prove Lessons and Practice use the same promoted item identity, answer policy, evaluator, correction behavior, and learner-item evidence; an unassisted lesson result affects collection ordering while assisted work does not raise mastery.
- [ ] Contextual-help tests prove authored hints, bounded promoted collection context, pre-answer assistance, direct-answer protection, resume continuity, rate/length/time limits, no grading/membership/serving mutation, and no raw learner text in logs or retained proof.
- [ ] Feedback-card tests prove one-issue English, canonical Spanish, a separate next cue, Save, and a visible accepted-alternative note when the match is `equivalent` or `regional-alternative`.
- [ ] A real Clerk/Neon/Gateway proof tied to a verified development learner starts and retains sessions from all five collections, exercises deterministic and ambiguous grading, persists shared evidence and one scripted non-personal contextual exchange, and prints no identity, secrets, or learner-authored text.
- [ ] A signed-in browser journey retained under `Docs/Evidence/phase-006/` opens and completes all five collections, shows at least three explainable serving reasons, reloads/resumes one session, uses an authored hint and Ask AIdioma, saves one item, and returns to an accurate data-driven Practice catalog.
- [ ] Founder-facing UX notes record the exact five collection/member versions tested and distinguish catalog, adaptive-serving, content, and shared-workspace defects for the next iteration.
- [ ] Auth, content-integrity, membership, unlock, persistence, grading, provider, stale-request, and unsupported-hint failures are exercised honestly without fabricated content, progress, or completion.

## Audit

Filled at `/plan` from `Docs/CLOSE.md`. This phase changes authenticated durable evidence, adaptive serving, contextual prompts, promoted collections across three dialect profiles, provider-backed grading/help, shared lesson/Practice components, and the primary Practice catalog/session journey. Every canonical gate applies, and Tier 3 requires one fresh auditor per lens.

**Risk tier:** 3

| Lens | Run? | Why / N/A | Sub-agent |
|---|---|---|---|
| Claims / Proof evidence | yes | Every phase; challenge whether five retained collections and the fixture extension test prove a reusable collection pipeline rather than five special cases. | audit-claims |
| Code quality / Standards | yes | Collection schema, registry, validation, shared components, adaptive tests, contextual help, and removal of hard-coded branches all change. | audit-standards |
| MCOO | yes | Reject a second content pipeline, universal state machine, collection query language, duplicate evidence authority, speculative collection types, and bulk-curriculum work. | audit-mcoo |
| Seams / Integration | yes | Lesson artifacts/evidence, collection promotion, Practice catalog, adaptive session, shared UI turns, API, Clerk, Neon, Gateway, and Save cross boundaries. | audit-seams |
| Security / Privacy | yes | Authenticated identity, attempts, saves, contextual exchanges, provider prompts, rate limits, retained proof, and any migration are in scope. | audit-security |
| API / Provider usage | yes | Real Clerk, Neon, and AI Gateway behavior is required for adaptive evidence, grading, saving, resume, and bounded collection explanations. | audit-provider |
| Product / Learner journey | yes | The phase changes collection discovery, understandable focus, adaptive reasons, feedback, hints, contextual questions, pause/resume, saving, and catalog return. | audit-product |

`Docs/Evidence/phase-006/close-audits.md` will index complete candidate-bound responses under `audits/`. Deterministic checks and every attempt will live under `checks/` and in `check-results.json`; `audit-results.json` will select the final response for each lens. Close uses one immutable candidate and one fresh declared auditor per required lens.

## Close record

The immutable final decision will live in `Docs/Evidence/phase-006/close-record.json`; publication results later live in `Docs/Evidence/phase-006/publication.md`. At close, change only frontmatter `state`, `closed`, and `lessons` in this file.

## Coordination

The `/run` agent is the coordinator for this phase. Delegate coding by area of concern to in-session sub-agents so you preserve your context window. Follow `.claude/skills/run/SKILL.md`.

## Kickoff

```text
/run PHASE-006

Act as the coordinator for this phase. Delegate coding by area of concern to in-session sub-agents so you preserve your context window. Do not start another runner.

Read AGENTS.md, Docs/NOW.md, PHASE-005, this phase file, the six amended specs, and Docs/Evidence/phase-006/target.json. Build one promoted concept/topic collection registry on the Phase 5 item/evidence foundation and prove the five named collections in the existing adaptive Practice workspace. Do not duplicate lesson content or build Saved/Translate.
```
