---
title: ADR-0010 — Streak yes, notifications no
type: adr
status: accepted
updated: 2026-07-28
---

# ADR-0010 — Streak yes, notifications no

## Decision
- **Ship a calendar-day streak** (user local timezone), counted from **completed sessions** (not a single stray answer).
- **No reminder notifications** at MVP (no email/push nags). Matches Settings: no Reminders row (OI-003).
- Rest-day grace is not required at MVP; any later version is parked as PM-016.
- Completion authority is `practice_sessions.completedAt` (ADR-0013), not an evaluation-count guess.

## Why
Streak motivates without building notification infra. Product should earn returns; Clerk auth email is not a reminder channel.

## Revisit
Opt-in reminder only after real retention data shows a concentrated early drop-off (see parked PM-014).

## Closes
OI-013.
