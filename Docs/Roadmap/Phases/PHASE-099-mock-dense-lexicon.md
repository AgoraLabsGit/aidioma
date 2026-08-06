---
id: PHASE-099
title: "MOCK — Dense Lexicon-style phase (UI fixture)"
type: build
proof_kind: visual
state: proposed
order: 99
depends_on:
  - PHASE-001
from_backlog: null
owner: founder
outcome: "MOCK ONLY — Learner gets quiet active-prompt word help on one Restaurant Practice visit without changing default Practice UX."
proof: "MOCK — Eight-screenshot Lexicon smoke (320px + desktop, both themes) + focused package/app tests green."
non_goals:
  - Global word lookup / reverse indexes
  - Learner persistence or scheduling policy inside Lexicon
  - Broad Lesson annotation
  - Database-backed lexicon
  - Changing default prompt/composer chrome
amends_specs: []
feature: SPEC-F-LEXICON
area: SPEC-A-CONTENT
opened: 2026-08-05
closed: null
lessons: null
---

# PHASE-099 — MOCK dense phase (UI / schema fixture)

> **Not scheduled work.** Synthesized from frozen `Docs.2/WORK.yaml` → `LEXICON-001` to stress-test
> dashboard density. Do not `/run`. Delete after layout review.

## Context

Frozen WORK items carried summary, dependencies, blocked_by, next_slice, and a long **evidence**
list. V3 splits the same jobs across frontmatter (`outcome`, `proof`, `depends_on`, `non_goals`)
and body (Context, Inputs, Plan, Proof).

This mock copies Lexicon-001 *density* (reviewed word/phrase help on one Restaurant journey) so
Active/Detail can be judged against a full phase, not a stub. Real Lexicon product work stays
behind later phases.

## Inputs

- Frozen: `Docs.2/WORK.yaml` → `LEXICON-001` (rich `evidence:`; legacy `spec: Specs/lexicon.md`)
- Pattern: help limited to named reviewed targets; memory/scheduling outside Lexicon
- Depends on (mock): `PHASE-001` — shows a dependency edge in the UI
- Specs amended: none yet (honest empty `amends_specs`)

## Plan

1. Bound delivery to **one** assisted Restaurant Practice proof (not a full lexicon platform).
2. Spanish-first entry+sense contract + versioned contextual map; keep mappings out of payloads.
3. Quiet active-prompt help; neutral “I don’t know” reveal; visit-local checkpointed assistance.
4. Preserve default Practice UI; help must not steal grading or focus.
5. Prove with package/app tests, build, and multi-viewport screenshot smoke.
6. Close only the proven head — no Profile, ranking, or Lesson-wide expansion.

**Complexity cost:** lexical identity + one consumer. Reject unconsumed foundations.

**WORK.yaml → V3 mapping**

| WORK.yaml | V3 phase |
|---|---|
| `summary` | `outcome` + Context |
| `dependencies` / `blocked_by` | `depends_on` (+ Issues if blocked) |
| `spec` | `amends_specs` + Inputs |
| `next_slice` | Plan + Kickoff |
| `evidence[]` | Proof checklist |
| `area` / `reusable_by` | Specs / PRODUCT later — not phase FM |

When densifying real phases, prefer WORK’s explicit next_slice + evidence receipts over vague Plan.

## Proof

- [x] Founder authorized bounded feat; preserve Practice UI/UX
- [x] Contract narrowed to Restaurant consumer
- [x] Adversarial audit blockers cleared
- [x] Active-prompt help + reveal + visit-local checkpoint implemented
- [x] Package + app tests + production build green
- [x] Eight-screenshot smoke @ 320px and desktop, both themes
- [ ] MOCK: Roadmap → PHASE-099 detail holds this density
- [ ] MOCK: Note missing fields vs PHASE-001 worth promoting

## Close record

Fixture only — not for `/close`.

## Kickoff

```text
# Do not /run PHASE-099. Open Roadmap → PHASE-099 to review density.
```
