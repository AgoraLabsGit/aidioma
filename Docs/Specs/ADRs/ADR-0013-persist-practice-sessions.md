---
title: ADR-0013 — Persist practice sessions
type: adr
status: accepted
updated: 2026-07-28
---

# ADR-0013 — Persist practice sessions

## Decision

Persist one `practice_sessions` row for every started SessionEngine run and link every graded
submission through `evaluations.sessionId`.

A session records its recipe, focus lesson, start, and one terminal outcome:

- **completed** — the recipe’s completion rule was met;
- **ended** — the learner deliberately ended early;
- no terminal timestamp — abandoned/interrupted and eligible for resume/expiry policy.

Continue completes when its full lesson Mix arc finishes. Blend and Review complete after their
size-10 recipe finishes. A fixed “8 evaluations = complete” rule is rejected because Continue is
variable-length and sessions may contain non-graded flashcards/study steps.

## Why

Streaks count completed sessions, summaries describe a session, and evaluations need provenance.
Without a persisted completion fact, all three are guesses. Legacy versions contained the useful
session identity concept, but their schema/analytics are not ported.

## Consequences

- Streaks derive from `practice_sessions.completedAt` in the user’s IANA timezone.
- Session summaries derive from the session plus its linked evaluations.
- AI/tutor turns are not silently counted as graded submissions.
- A later product metric may query completed sessions without adding an event pipeline (PM-014).

## Closes

A0 legacy-audit session-persistence gap.
