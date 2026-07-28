---
title: A0-3 — Feature and schema decisions
type: wave-slice
status: closed
updated: 2026-07-28
---

# A0-3 — Feature and schema decisions

## Brief
- **Lane:** App
- **Goal:** Rule on mastery, notes, and schema proposals P-003/004/005 so build and content work have stable contracts.
- **Touches:** ADR-0011/0012, SCHEMA-APPROVALS, open-items OI-014…018, post-MVP register
- **Out of scope:** P-003 content backfill/tooling; app implementation; dialect content
- **Verify plan:** Design-only consistency review across schema approvals, module spec, and data model

## Gates (design)
| Gate | Result |
|---|---|
| OI-014/015 have explicit MVP/deferred outcomes | PASS |
| P-003/004/005 each have a Coordinator ruling | PASS |
| Deferred work has one owner | PASS (OI-025; PM-003/005/006) |
| Study cards agree across schema, UI, and session arc | PASS |

## Review
- A0-H removed stale “filed/proposed” wording from schema notes and the living feature map.
- No app code exists or changed.

## Proof
- P-003/004/005 are APPROVED in `Docs/Registers/schema-proposals.md`.
- ADR-0011/0012 and Closed OI-014…018 record the build-facing decisions.

## Decisions
- MVP keeps Completed/Mastered; richer familiarity and notes are deferred.
- P-003 approved; its remaining backfill/tooling is OI-025.
- P-004 reserves region shape only. P-005 study cards ship on lesson detail, outside Mix.
