---
title: ADR-0012 — Reference / study cards in MVP
type: adr
status: accepted
updated: 2026-07-29
---

# ADR-0012 — Reference / study cards in MVP

## Decision
Ship **study / reference cards** in MVP (schema P-005 **APPROVED**):

- Kind `referenceCard` + optional `referenceCards[]` (default empty; max 12).
- **Never graded** — never calls `/api/evaluate`.
- Surfaced from **lesson detail / study** affordance — **not** part of the Mix practice arc (Learn→Quiz→Words→Sentences→Story).
- Existing lessons need zero cards to stay valid; author where useful (e.g. high-value conjugation tables).

## Also confirmed (same session)
| Capability | MVP |
|---|---|
| Ask AI questions in the practice input | **Yes** (dual-duty) |
| Practice saved words/sentences outside lessons | **Yes** (Saved / Review recipes) |
| Custom + frequency decks (1–100, 101–200…) | **Post-MVP** (PM-015) |

**Timing update:** ADR-0015 supersedes only the row above: reviewed curated Practice Sets now enter
MVP wave A6, while private custom-topic generation is A9. The reference-card decision is unchanged.

## Closes
OI-018 / P-005.
