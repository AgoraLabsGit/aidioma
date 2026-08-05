---
schema_version: 1
id: PHASE-002
title: Target Product Design
phase_type: design
subtype: product-map
status: proposed
depends_on:
  - PHASE-001
founder_approval: required
updated: 2026-08-05
---

# PHASE-002 — Target Product Design

## Outcome

Mike approves one concise target product map: learner-facing pages, global experiences, core
features, and MVP-versus-later boundaries—without designing internal component architecture.

## Why now

Component boundaries should follow an approved learner product. Current claims are split across
frozen `Docs.2/` evidence and the running app.

## Inputs

- Running `apps/web/` routes and behavior
- Frozen `Docs.2/PRODUCT.md`, `ARCHITECTURE.md`, `WORK.yaml`, and specs as evidence
- Canonical Lessons and Restaurant content
- Preserved Lexicon dirty work as evidence, not as an automatic product decision

## In scope

- Learner job/promise per page or global experience
- Pages vs sections vs modes vs shared actions
- MVP / later / rejected / unresolved
- Navigation-level relationships
- One approved living `Docs/PRODUCT.md` from explicit decisions only

## Out of scope

- Internal services, engines, packages, APIs, schemas, DB design
- Component implementation order beyond naming dependencies for later phases
- Product-code changes; Lexicon publish

## Founder checkpoints

Conversational; ≤3 consequential decisions per checkpoint; show wording before writing PRODUCT.md.

## Strategic review

Bounded sub-agents after founder discussion only.

## Deliverables

- `Docs/PRODUCT.md` (approved)
- Feature-to-surface coverage table
- Input summary for Phase 003

## Proof and exit criteria

- Every approved feature has one learner-facing home
- MVP/later explicit; current vs target not mixed
- Mike explicitly approves the map
- No component architecture or product code implemented

## Close audits

Design close: Steward + Publish + Decision Auditor + MCOO.

## Decisions

| ID | Decision | Date |
|---|---|---|
| D-001 | Scheduled after Dev System Dashboard | 2026-08-05 |

## Fresh-session kickoff

Do not start until Phase 001 is closed. Revise this kickoff when Phase 001 completes.
