---
id: PHASE-008
title: Spec & Knowledge Artifact Research
type: design
proof_kind: spec
state: proposed
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
amends_specs: []
feature: null
area: SPEC-A-DEVSYSTEM
opened: 2026-08-07
closed: null
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

- [ ] R-file(s) with verdicts (or `none` where keep-as-is)
- [ ] Decision entries for accepted mold changes
- [ ] Templates/schemas updated; sample stubs match
- [ ] Knowledge can render the refined samples

## Close record

- Result:
- Specs amended:
- Journal line:

## Kickoff

```text
/run PHASE-008

Read .work/context.json. Research panel on artifact molds; amend templates/schemas; refine sample stubs only.
```
