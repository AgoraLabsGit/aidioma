---
id: PHASE-005
title: "Reusable lesson pipeline and six-lesson proof"
type: build
proof_kind: visual
state: active
order: 5
depends_on:
  - "PHASE-004"
from_backlog: null
owner: founder
outcome: "One reviewed lesson artifact can enter the promoted catalog and run as a durable multi-step lesson without lesson-specific application code; the same path serves the real A1 introduction and five diverse A2/B1 proof lessons with authored teaching, hints, typed Spanish checks, bounded contextual help, feedback, resume, completion, and review handoff."
proof: "A signed-in learner completes the real A1 introduction and can open and complete each of five reviewed A2/B1 proof lessons through the same catalog, workspace, session, grading, and progress contracts. Candidate-bound checks show that every served step comes from a validated promoted artifact and that adding a fixture lesson changes content and placement data but no lesson-specific UI, route, session-service, or grading code."
non_goals:
  - "Generate, sequence, or market the complete A1 through C1 curriculum"
  - "Claim that the five representative A2/B1 lessons are the final intermediate course order"
  - "Generate hints or canonical lesson copy at runtime, or let AI promote curriculum"
  - "Add multiple choice, speech, listening, flashcards, free conversation, or another scored modality"
  - "Build Saved-library expansion, Translate, placement, onboarding, analytics, payments, or production hardening"
  - "Create a second lesson player or preserve lesson-specific prototype code beside the shared runtime"
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
  - "content/lessons/**"
  - "content/placements/**"
  - "content/units/**"
  - "content/promotions/**"
  - "content/review/**"
  - "apps/web/src/app/lessons/**"
  - "apps/web/src/app/api/practice/session/**"
  - "apps/web/src/app/globals.css"
  - "apps/web/src/app/page.tsx"
  - "apps/web/src/components/home-dashboard.tsx"
  - "apps/web/src/components/intermediate-lesson-pilot.tsx"
  - "apps/web/src/components/learning-workspace.tsx"
  - "apps/web/src/components/lesson-catalog.tsx"
  - "apps/web/src/components/lesson-row.tsx"
  - "apps/web/src/lib/course.ts"
  - "apps/web/src/lib/intermediate-pilot.ts"
  - "apps/web/src/lib/evaluation/**"
  - "apps/web/src/lib/learning-journey/**"
  - "apps/web/src/lib/practice-sets/**"
  - "apps/web/src/lib/practice-serving/**"
  - "apps/web/src/lib/contextual-help/**"
  - "apps/web/src/lib/db/**"
  - "apps/web/drizzle/**"
opened: 2026-08-26
closed: null
lessons: null
---

# PHASE-005 — Reusable lesson pipeline and six-lesson proof

## Context

Phase 4 proved the real Clerk, Neon, AI Gateway, promoted-content, contextual-help, completion, and review handoff with one minimal lesson containing one teaching card and one scored cue. That is a valuable vertical runtime proof, but it does not yet prove the learner experience of a full lesson or the cost of onboarding the next lesson. The app also exposes two competing catalogs: a static A1 list and a separate intermediate prototype whose only available lesson has hard-coded local steps and local grading.

This phase turns that vertical proof into the smallest reusable lesson supply path. It uses the existing rich lesson authority instead of inventing a parallel format, adds only the ordered placement information needed to make a finite learner journey, and removes lesson-specific runtime branches. The founder will then have six materially different full lessons to test before the product expands into Saved, Translate, or bulk A1–C1 generation.

## Inputs

- Decisions this depends on: D-016, D-017, D-019, D-020, D-021, D-023, D-024, D-025
- Research consulted: None; this phase proves the authored product contracts already accepted in the repository
- Specs this touches: SPEC-F-CONTENT-PIPELINE, SPEC-F-LEARNING-LOOP, SPEC-F-CONTEXTUAL-QUESTIONS, SPEC-A-CONTENT, SPEC-A-LEARNER, SPEC-A-PLATFORM

## Learner proof set

| Lesson | Level used by the artifact | Purpose in the proof |
|---|---|---|
| Hola: greetings and introducing yourself (`a1-01-hola-me-llamo`) | A1 | Prove the real curriculum opener, replacing “Living here” as the learner-visible first lesson. |
| Tell what happened | A2 | Prove completed events, past-time anchors, and connected production. |
| Place actions in time | A2 | Prove several related time constructions in one finite arc. |
| Locate things and give directions | A2 | Prove place, distance, and movement language across practical contexts. |
| Say what exists and what occurred | A2 | Prove contrast among related forms without multiple choice. |
| Connect and qualify ideas | B1 | Prove longer production with sequence, cause, result, contrast, and concession. |

The five A2/B1 artifacts are representative pipeline and UX proofs. Each must pass the same content, dialect, answer, hint, and promotion gates as learner content, but this phase does not claim that their displayed order is the final intermediate curriculum. “Intermediate” may remain a catalog grouping; it never replaces the exact CEFR level in content authority.

## Plan

### 1. Make one promoted lesson authority

Extend the existing lesson placement/promotion contract so a promoted lesson names one versioned rich lesson artifact and an ordered finite flow of references to its authored teaching, vocabulary or phrase support, examples, passage material, and sentence checks. The compiler/registry must resolve immutable item IDs, supported Spanish profiles, concepts, topics, prerequisites, answer policy, exactly three authored hints for every scored sentence, review results, and the promotion receipt before anything becomes catalog-visible.

Keep reusable meaning units separate from placement. A lesson flow selects and orders existing content; it does not duplicate canonical Spanish, accepted answers, hints, concepts, or dialect renderings. Missing references, stale content versions, unsupported dialects, missing reviews, or absent promotion evidence fail publication and serving instead of silently dropping a step.

The rich schema currently contains multiple-choice quick checks, but D-017 permits only typed Spanish as scored MVP evidence. The runtime does not render those checks. Their teaching intention may be covered by authored sentence items in the ordered flow, while the unsupported item type remains outside the promoted learner path.

### 2. Make one full finite lesson experience

Use the existing shared learning workspace and session/evaluation services. A full lesson begins with its practical outcome, moves through concise authored teaching and support, asks several ordered English-cue → typed-Spanish checks, gives the standard feedback card and optional authored hints for the current cue, allows bounded Ask AIdioma questions, and ends with a recap plus the existing collection/review handoff. Teaching, vocabulary/phrase support, examples, and passage excerpts are unscored context; only typed Spanish production creates attempt evidence.

Generalize the durable checkpoint from one lesson cue to stable lesson-version and step identities. Reload and resume restore the exact feed position, per-step hint cursor, attempts, feedback, and contextual exchanges. Duplicate or stale requests remain idempotent, a content-version mismatch fails honestly, assisted attempts cannot increase mastery, and completion is recorded once after every required scored step is resolved.

Phase 5 establishes the shared boundary that Practice collections will consume next: promoted item and dialect resolution, deterministic comparison and Gateway evaluation, canonical attempt and learner-item identity, failure semantics, Clerk identity, Neon access, and Gateway transport. An unassisted lesson answer updates the same profile-neutral item evidence that the adaptive Practice policy can later rank; assisted lesson work is retained but cannot raise that evidence. The lesson itself still follows an authored finite flow and owns a lesson-position checkpoint. Generalizing the Practice collection catalog, collection promotion contract, shared turn components, and adaptive collection proof belongs to Phase 6; do not force both phases into one oversized state machine.

### 3. Remove parallel prototype paths

Derive the learner catalog, lesson availability, title, objective, CEFR level, concepts/topics, and route resolution from the promoted lesson registry. Remove the hard-coded intermediate steps, local answer matcher, and any lesson-specific route/service switch that the registry replaces. The real A1 introduction becomes Lesson 1; “Living here” remains reusable promoted material only where the reviewed curriculum places it and is not mislabeled as the course opener.

A dedicated development proof learner may have seeded prerequisites so the founder and browser proof can open all six lessons without weakening production unlock rules. There is no production bypass and no synthetic identity in retained proof.

### 4. Author and promote the proof set

Bring the existing A1 introduction through the new placement and promotion path. Author the five named A2/B1 lessons as full schema-valid artifacts with explicit CEFR level, practical objective, concepts, topical tags, prerequisite references, supported `es-AR`, `es-419`, and `es-ES` renderings, accepted-answer classes, exactly three reviewed hints per scored sentence, validation results, adversarial review, and promotion receipts.

The lesson matrix is deliberately broad enough to expose weak UX assumptions—short versus longer answers, related-form contrasts, spatial language, multi-clause production, dialect-neutral and dialect-sensitive copy—without becoming a bulk curriculum factory. Adding the sixth lesson must consume the same contracts as the first five and must not require a new React component, route branch, session method, or grading function. Each promoted lesson artifact must include a unique typed-sentence pool of at least 25 prompts, scaled by CEFR (A1 ≥25, A2 ≥35, B1 ≥50). The finite flow still scores only a short subset; Practice may later continue up to 100 offers by re-serving that pool.

**Complexity cost:** one ordered lesson-placement extension, one promoted registry/compiler, and one generalized durable lesson checkpoint are added. Each has six immediate consumers. Parallel catalogs, local prototype grading, and lesson-specific steps are removed; no generic workflow engine, runtime content generator, second player, or speculative A1–C1 graph is introduced.

## Proof

- [ ] Candidate-bound validation parses all six lesson artifacts and their exact placements, dialect renderings, answer classes, authored hints, concept/topic/prerequisite references, review results, content versions, and promotion receipts; negative fixtures fail every publication gate.
- [ ] A registry extension test adds a fixture lesson through content and placement data only, then proves the catalog and runtime resolve it with no lesson-specific UI, route, session-service, or grading branch.
- [ ] Focused tests prove ordered multi-step teaching and checks, per-step hints, bounded question context, miss/correction/retry, the SPEC-F-LEARNING-LOOP feedback card (one material issue, canonical Spanish, next cue separate), equivalent and regional-alternative matches grading as correct, assisted evidence, reload/resume, stale and duplicate request handling, content-version failure, idempotent completion, unlocks, and the review handoff.
- [ ] Cross-surface contract tests prove that lesson output uses the promoted item, answer policy, evaluator, and profile-neutral learner-item identity required by Practice; an unassisted lesson attempt updates adaptive evidence while an assisted attempt does not increase mastery.
- [ ] Catalog tests prove one promoted source of truth: the real A1 introduction is Lesson 1, exact CEFR is retained for every artifact, unavailable content is honest, and the old static/intermediate prototype paths cannot serve learner lessons.
- [ ] A real Clerk/Neon/Gateway proof tied to a verified development learner completes the A1 lesson and at least one A2/B1 lesson, persists multi-step position and a scripted non-personal contextual exchange, and does not print identity, secrets, or learner-authored text. Deterministic comparison and durable progress are exercised across all six lessons.
- [ ] A signed-in browser journey retained under `Docs/Evidence/phase-005/` completes the real A1 lesson, opens and completes all five representative A2/B1 lessons, reloads during at least one, uses a hint and bounded Ask AIdioma at least once per CEFR grouping, and returns to an accurate catalog/progress state.
- [ ] Founder-facing UX notes distinguish pipeline/content defects from lesson-player defects and record the exact six lesson versions tested, so the next UX iteration is based on reproducible lessons rather than screenshots of one cue.
- [ ] Auth, content-integrity, persistence, grading, provider, unsupported-item, and stale-version failures are exercised honestly without fabricated content, progress, or completion.

## Audit

Filled at `/plan` from `Docs/CLOSE.md`. This phase changes authenticated durable progress, a multi-step checkpoint and likely migration, grading context, promoted curriculum, three dialect profiles, provider-backed contextual help, and the primary lesson/catalog experience. Every canonical gate applies, and Tier 3 requires one fresh auditor per lens.

**Risk tier:** 3

| Lens | Run? | Why / N/A | Sub-agent |
|---|---|---|---|
| Claims / Proof evidence | yes | Every phase; challenge whether six retained full lessons and the extension test actually prove a reusable pipeline rather than six disguised special cases. | audit-claims |
| Code quality / Standards | yes | Schema, compiler, content validation, session state, migration, tests, and removal of prototype code all change. | audit-standards |
| MCOO | yes | Reject a generic workflow engine, premature collection machinery, forced all-purpose session state machine, parallel content/evidence authority, unused schema machinery, bulk-curriculum work, and any second lesson player. | audit-mcoo |
| Seams / Integration | yes | Rich lesson content, shared item evidence, promotion, lesson catalog, route, workspace, session API, grading, Clerk identity, Neon state, and the existing review handoff cross boundaries. | audit-seams |
| Security / Privacy | yes | Authenticated identity, durable attempts, contextual exchanges, migration, provider prompts, proof data, and development prerequisite seeding are in scope. | audit-security |
| API / Provider usage | yes | Real Clerk, Neon, and AI Gateway behavior is required for resume, grading, and bounded explanations under D-024 and D-025. | audit-provider |
| Product / Learner journey | yes | The phase defines the full lesson rhythm, first lesson, course catalog truth, progress continuity, accessibility, feedback, and six-lesson founder test. | audit-product |

`Docs/Evidence/phase-005/close-audits.md` will index the complete candidate-bound audit responses under `audits/`. Deterministic checks and every attempt will live under `checks/` and in `check-results.json`; `audit-results.json` will select the final response for each lens. Close uses one immutable candidate and one fresh declared auditor per required lens.

## Close record

The immutable final decision will live in `Docs/Evidence/phase-005/close-record.json`; publication results later live in `Docs/Evidence/phase-005/publication.md`. At close, change only frontmatter `state`, `closed`, and `lessons` in this file.

## Coordination

The `/run` agent is the coordinator for this phase. Delegate coding by area of concern to in-session sub-agents so you preserve your context window. Follow `.claude/skills/run/SKILL.md`.

## Kickoff

```text
/run PHASE-005

Act as the coordinator for this phase. Delegate coding by area of concern to in-session sub-agents so you preserve your context window. Do not start another runner.

Read AGENTS.md, Docs/NOW.md, this phase file, the six amended specs, and Docs/Evidence/phase-005/target.json. Replace the parallel lesson prototypes with one promoted rich-lesson registry and durable multi-step runtime; prove it with the real A1 introduction plus the five named A2/B1 lessons. Do not add another scored modality or bulk-generate the curriculum.
```
