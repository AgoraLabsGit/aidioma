---
title: A0-1 — UI and interaction decisions
type: wave-slice
status: closed
updated: 2026-07-28
---

# A0-1 — UI and interaction decisions

## Brief
- **Lane:** App
- **Goal:** Turn the contested prototype cuts and queued UI questions into one build-ready module spec.
- **Touches:** `Docs/Specs/Features/module-spec.md`, open-items OI-001…004 and OI-024
- **Out of scope:** App implementation; engine and data-model details
- **Verify plan:** Design-only consistency review against the prototype handoff and settled ADRs

## Gates (design)
| Gate | Result |
|---|---|
| Contested cuts each have one explicit outcome | PASS |
| Queued Home/Lessons/feedback items are covered | PASS |
| Vocabulary agrees with launch ADRs | PASS |
| Preview-ahead residue reconciled with “no quiz on untaught material” | PASS |

## Review
- Whole-spec consistency scan found one stale `draft` marker and one uncaptured preview-ahead sentence; A0-H corrected both.
- No app code exists or changed.

## Proof
- `Docs/Specs/Features/module-spec.md` is the active UI contract.
- OI-001…004 and OI-024 are Closed with links back to the spec.

## Decisions
- Keep Direction; default Both. Drop lesson multi-select. Goal uses one slider; no reminders row.
- Home and Lessons stay distinct; typed answers get word-level diff; lesson detail is data-driven.
- Locked lessons may be previewed as labeled teasers, never quizzed or practiced before teaching.
