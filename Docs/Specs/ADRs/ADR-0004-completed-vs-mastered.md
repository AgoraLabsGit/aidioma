---
title: ADR-0004 — Completed vs Mastered (spacing)
type: adr
status: accepted
updated: 2026-07-28
---

# ADR-0004 — Completed vs Mastered (spacing)

## Decision
Two lesson states after first success:

| State | When | Effect |
|---|---|---|
| **Completed** | Same-day: learner hits the lesson’s success bar | Next lesson **unlocks** immediately; celebrate |
| **Mastered** | Same bar met again on a **later calendar day** (blend/review re-serves items) | Confirmed memory; UI can show Mastered |

No invisible “you can’t proceed until tomorrow.” Spacing never blocks progression.

## Why
Same-day “mastery” is often fluency illusion; forcing a wait before unlock feels broken. Split unlock from confirmation. Blend already re-serves weak/recent items — Mastered is the later-day confirm of that loop.

## Consequences
- `user_lesson_progress.status` includes `completed` (and `mastered` / locked / active as already planned).
- Session summary copy: “Completed — come back tomorrow to confirm mastery.”
- Relates to OI-014 (5-level scale): MVP keeps this binary lesson rollup; richer per-item levels stay open / post-MVP.

## Closes
OI-006.
