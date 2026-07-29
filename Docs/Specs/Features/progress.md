---
title: Progress — honest evaluation-derived views
type: feature-spec
status: active
updated: 2026-07-29
---

# Progress — honest evaluation-derived views

## MVP surface

Progress is derived from real sessions/evaluations only; no fake first-run numbers and no separate
analytics truth. Show:

- today’s accuracy (live) separately from confirmed proficiency;
- lesson Completed / Mastered outcomes;
- items mastered and Review due;
- weakest GrammarTag/ErrorTag areas with plain-language labels;
- calendar-day streak from completed practice sessions;
- weekly completed work versus the learner’s goal.
- Practice Set coverage/performance, visibly separate from lesson Completed/Mastered.

Home owns the compact snapshot and Continue/Review actions. Progress owns trends and by-grammar
detail. Lesson detail owns that lesson’s activity/proficiency view; set detail owns that set/version’s
coverage and last-practiced view.

## Explicit cuts

No XP economy, badges, leaderboard, hearts, streak purchases/freezes, or fabricated analytics at
MVP. A future metric or experiment may add events, but it cannot replace evaluations/sessions as
the learning record.

## Accessibility and honesty

Never encode state by color alone. Every chart has a text equivalent; empty history shows a useful
zero state. “Completed” and “Mastered” follow ADR-0004 and the proficiency spec exactly.

## Data

Reads `practice_sessions`, `evaluations`, lesson stats/progress, and set target/progress rollups. Formula
authority remains `Specs/Areas/proficiency.md`; this file owns presentation and scope.
