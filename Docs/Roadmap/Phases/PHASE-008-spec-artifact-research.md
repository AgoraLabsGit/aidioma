---
id: PHASE-008
title: Spec & Knowledge Artifact Research
type: design
proof_kind: spec
state: closed
order: 6
depends_on:
  - PHASE-006
from_backlog: W-040
owner: founder
outcome: "Mike approves a research verdict for core artifact shapes (Feature, Area, Product, Phase, Research, Decision, Release): each template covers development-critical fields with clear, actionable guidance — and thin living stubs are refined to match."
proof: "R-* research (panel-style options) + decision(s); updated Templates + schemas as needed; sample Feature/Area stubs demonstrate the mold; Revisit-if recorded."
non_goals:
  - Full PRODUCT.md learner map (PHASE-002)
  - Component architecture (PHASE-003)
  - Dashboard Knowledge chrome (PHASE-006)
  - Inventing many empty SPEC files beyond mold samples
amends_specs:
  - SPEC-A-DEVSYSTEM
  - SPEC-F-PRACTICE
  - SPEC-A-LEARNER
feature: null
area: SPEC-A-DEVSYSTEM
opened: 2026-08-08
closed: 2026-08-08
lessons: null
---

# PHASE-008 — Spec & Knowledge Artifact Research

## Context

Thin SPEC stubs and templates exist for tagging, but they may not be “well designed” for real
development. Run a **research panel** against peer patterns and our own molds so Feature/Area/
Product/Phase/Research/Decision/Release carry actionable fields only.

## Inputs

- `Docs/System/Templates/*`, `System/schemas/*`, living `Docs/Specs/**`
- Knowledge page (PHASE-006) for inspection
- Frozen `Docs.2/` only as evidence slices after outcome locked
- External comparables via `/research` (options table, not cargo-cult)

## Plan

1. `/research` panel: options for each artifact family (keep / trim / add fields).
2. Verdicts → Decisions; amend templates/schemas (MCOO — no essay fields).
3. Refine a minimal set of living stubs to the new mold; leave product depth to PHASE-002.
4. Record Revisit-if (e.g. after first real Feature close).

**Complexity cost:** Research + template/schema cuts. Cut: rewriting all historical Docs.2 specs.

## Proof

- [x] R-file(s) with verdicts (or `none` where keep-as-is)
- [x] Decision entries for accepted mold changes
- [x] Templates updated; schemas unchanged (as-needed); sample stubs match
- [x] Knowledge can render the refined samples (derive indexes SPEC-F-PRACTICE, SPEC-A-LEARNER, D-028–D-030, R-004/R-005; visual spot-check via `/dashboard` optional)

## Close record

- Result: PASS (Proof Adv WARN on ack dispositioned — founder approved R-004/D-028–D-030 and accepted R-005; Scope WARN path→spec fixed via amends_specs)
- Specs amended: SPEC-A-DEVSYSTEM, SPEC-F-PRACTICE, SPEC-A-LEARNER
- Journal line: Mold research closed — Rule grammar + Product/Release template SSOT; peer panel deferred extras; no product code.

## Kickoff

```text
/run PHASE-008

Read .work/context.json. Research panel on artifact molds; amend templates/schemas; refine sample stubs only.
```
