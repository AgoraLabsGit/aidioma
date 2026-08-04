---
id: PRACTICE-SERVING-001
title: Practice serving and reinforced scheduling
area: practice-serving
status: draft
implementation: partial
founder_review: required
updated: 2026-08-03
---

# Practice serving and reinforced scheduling

This migration dossier identifies implemented queue behavior, preserved legacy decisions, and
unapproved scheduling candidates. It is a founder-approved temporary exception to normal spec
creation timing, remains `status: draft`, and does not authorize an adaptive policy.
`legacy-accepted` preserves a prior decision pending migration disposition; `accepted` is reserved
for current founder approval.

## Outcome

Serve a continuous stream of learner-appropriate, reviewed practice that balances reinforcement,
spacing, interleaving, new material, direction, and learner agency without exposing internal batches
as artificial session endings.

## Non-goals

- Choosing the final algorithm before founder-led planning and validation.
- Calling same-session correction or retrieval durable mastery.
- Guaranteeing infinite novelty or using generated content to hide reviewed-pool exhaustion.
- Letting collection practice complete a lesson or silently broaden the visible collection promise.
- Building ML ranking, a target ontology, or a universal activity score for the initial policy.

## Claim status

### Implemented

- The current queue uses a seeded shuffle or fixed fixture order.
- Both direction creates one directional pass over every prompt, then the opposite-direction pass.
- The queue cycles continuously with modulo indexing after exhausting all units.
- A new varied visit avoids the previous visit's first prompt when possible.
- Verdicts do not affect ordering; misses are not requeued sooner.
- A session configuration snapshot freezes activity, direction, focus, order seed, and matching pool.

### Legacy-accepted in earlier records, pending migration disposition

- The learner's study session is continuous; internal planning batches must not force visible stops.
- A collection may span levels, but each served scope must stay learner-appropriate and explicit.
- Recognition and production are distinct directions/evidence facets; Both was the legacy-accepted default.
- Collection practice cannot grant lesson completion or mastery.

### Candidate

- Select a bounded internal working set from new, due, weak, and previously missed material.
- Requeue a miss after deliberate intervening items and require successful retrieval before graduation.
- Refill the working set as items graduate while preserving a continuous learner visit.
- Interleave related material and avoid immediate duplicates or runs of near-identical demands.
- Couple or separate direction evidence only through an explicit, testable rule.
- Use deterministic policy inputs and outputs so a resolved plan can be reproduced and audited.

### Research

- Archived SessionEngine research weights weakness, staleness, error tags, and saved state and proposes
  interleaving plus within-session miss requeue; its exact formula has not been validated.
- Withdrawn V4 research separates durable delayed evidence from same-session scheduling facts and
  recommends simple deterministic baselines before more complex adaptation.
- Honest no-cap practice requires reviewed repetition, labeled fallback, and explicit exhaustion—not
  a promise of endless novelty.

### Conflicting or superseded

- “Every eligible prompt before any repeat” appears in legacy authority and runtime tests. Migration
  input records that it should no longer be the primary learning policy, but that change still needs
  an explicit founder disposition in the new SSOT.
- `session-engine.md` describes size-10 learner sessions; the later learner journey treats those as
  internal batches beneath a continuous study visit.
- V4 alternately prioritizes misses/due before unseen material and unseen inventory before misses/due.
- V4's tense-bounded collection identity was withdrawn.

## Policy responsibilities

- Resolve the eligible reviewed pool from collection promise, learner stage, direction, and valid focus.
- Select and order internal working-set units under a versioned deterministic policy.
- Record enough resolved state to resume without silently changing the in-progress order.
- Accept graded outcomes and update only scheduling facts the current authority permits.
- Return an explicit exhaustion or shortfall reason when the reviewed pool cannot satisfy the request.
- Keep learner-facing session lifecycle separate from internal batch lifecycle.

## Initial policy hypotheses for `/plan`

1. Maintain a small active working set rather than exhausting the entire collection inventory.
2. Mix new, due, weak, and missed units using a simple declared ratio or priority ladder.
3. After a miss, provide feedback immediately but retry retrieval after a bounded lag.
4. Graduate a unit only after an approved successful-retrieval rule.
5. Refill from eligible inventory as units graduate.
6. Apply anti-clumping and minimum-spacing constraints without restoring global no-repeat.
7. Treat same-session success as scheduling evidence, not durable mastery proof.

These are candidates to compare, not accepted behavior.

## Reuse boundaries

- A pure serving engine should accept eligible units, history/scheduling facts, configuration, and seed.
- It should return ordered unit identity, direction, reason, policy version, and batch metadata.
- Practice should first prove a source-neutral deterministic serving contract. Lessons may later reuse
  a low-level selection/interleaving primitive only when a canonical Lesson slice demonstrates the
  same job; Lesson reuse is not an acceptance condition for the first Practice policy.
- Evaluation owns verdict interpretation; the serving engine consumes normalized outcome facts.
- Persistence owns sessions and observations; the engine must remain deterministic without a database.

## Migrated evidence

| Evidence | Use in this draft |
|---|---|
| `apps/web/src/lib/practice-sets/session-order.ts` | Implemented exhaustive queue and direction behavior |
| `apps/web/src/components/practice-workspace.tsx` | Continuous visit and immutable configuration snapshot |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Specs/Areas/session-engine.md` | Weak/due weighting, interleaving, requeue research |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Archive/Handoffs/023-2026-08-01-learner-journey-design-reset.md` | Session/block and collection/scope corrections |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Archive/Prototypes/adaptive-learning-system-proposal-v4.md` | Evidence and planner research only |
| `git:b0fd03f7ef73b6e3b095d6190353d81f1b7aeb3a:Docs/Archive/Prototypes/adaptive-learning-system-panel-review-v4.md` | Recorded contradictions and validation cautions |

## Draft acceptance criteria

- Founder approves the learner-visible session model and internal batch vocabulary.
- A deterministic policy defines eligibility, working-set size, mix, miss lag, graduation, refill, and interleaving.
- Tests prove misses return at the intended time, correct items graduate, and no item starves indefinitely.
- Tests cover cold start, all-correct, repeated misses, one-item pools, narrow focus, Both direction, exhaustion,
  resume, policy-version change, and seeded reproducibility.
- Same-session outcomes are not represented as durable mastery.
- The policy exposes explicit inputs/outputs and does not assume Lesson progression semantics.
- UI can explain a selection reason without exposing answer keys or scoring internals.

## Open questions

1. What active working-set size or range best supports the first experiment?
2. Should miss lag be fixed, adaptive, or randomly bounded?
3. How many successful retrievals graduate a unit from the current working set?
4. How are new, due, weak, saved, and missed units mixed during cold start and later use?
5. Does a miss in one direction affect the opposite direction, and by how much?
6. When is reviewed repetition preferable to adjacent reviewed content or an exhaustion message?
7. Which scheduling facts exist before durable learner history is implemented?

## Decisions and discovered issues

### Decisions

| ID | Classification | Decision | Migration disposition |
|---|---|---|---|
| PRACTICE-SERVING-D001 | legacy-accepted | Internal batches do not end the learner's continuous study visit. | pending founder disposition |
| PRACTICE-SERVING-D002 | candidate | Retire global inventory exhaustion as the primary repeat rule. | `/plan` required; replacement policy remains unresolved |
| PRACTICE-SERVING-D003 | research | Same-session retrieval may schedule but cannot prove durable mastery. | pending policy disposition |

### Canonical work reference

- `PRACTICE-SERVING-001` — decide the first deterministic reinforcement policy and replace the
  verdict-blind modulo queue only after founder approval.
