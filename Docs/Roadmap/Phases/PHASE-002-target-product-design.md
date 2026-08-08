---
id: PHASE-002
title: Target Product Design
type: design
proof_kind: spec
state: proposed
order: 7
depends_on:
  - PHASE-009
from_backlog: null
owner: founder
outcome: "Mike approves one concise PRODUCT.md: learner pages, globals, MVP-versus-later — no internal architecture."
proof: "Approved Docs/PRODUCT.md with who/what/never and capability→surface map."
non_goals:
  - Internal services, engines, packages, APIs, schemas, DB design
  - Component implementation order beyond naming dependencies for later
  - Product-code changes
  - Lexicon publish
amends_specs: []
feature: null
area: SPEC-A-LEARNER
opened: 2026-08-05
closed: null
lessons: null
---

# PHASE-002 — Target Product Design

## Context

Component boundaries should follow an approved learner product. Claims are split across frozen
`Docs.2/` evidence and the running app.

## Inputs

- Running `apps/web/` routes and behavior
- Frozen `Docs.2/PRODUCT.md`, `ARCHITECTURE.md`, specs as evidence (farm after outcome set)
- Canonical Lessons and Restaurant content
- Preserved Lexicon WIP as evidence, not an automatic product decision

## Plan

Conversational design; ≤3 consequential decisions per checkpoint. Show wording before writing
`PRODUCT.md`. Explicit MVP / later / rejected / unresolved.

**Complexity cost:** one living PRODUCT.md only — no architecture bible.

## Proof

- [ ] Every approved capability has one learner-facing home
- [ ] MVP/later explicit; current vs target not mixed
- [ ] Mike explicitly approves the map
- [ ] No product code / component architecture shipped

## Close record

Filled at `/close`.

## Kickoff

Do not start until PHASE-001 is closed. Revise this kickoff when PHASE-001 completes.
