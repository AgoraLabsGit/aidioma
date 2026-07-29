---
title: Proficiency — live accuracy vs confirmed
type: area-spec
status: active
updated: 2026-07-29
---

# Proficiency — live accuracy vs confirmed

> A0-4 / OI-019. Aligns with Completed/Mastered (ADR-0004) and binary MVP mastery (ADR-0011).
> Blender weights live in SessionEngine (OI-021) — this spec owns the two progress numbers.

## Two numbers (never merge)

| Number | What | Updates | UI job |
|---|---|---|---|
| **Today’s accuracy** | Share of today’s attempts that meet the pass bar | Live, same day | “How did practice go?” Session / header feel |
| **Confirmed proficiency** | Lesson (or path) lasting strength | Only after a **later calendar day** re-check | Progress, Mastered, honest long-term bar |

Same-day success can unlock the next lesson (**Completed**). It must **not** be labeled lasting mastery.

## Confirmed proficiency formula

For a lesson (or comparable item set):

1. **Coverage** — share of in-scope items with ≥1 real attempt.
2. **Best score** — per item, keep best score; roll up (don’t let early misses permanently tank the lesson).
3. **Recency** — confirmed wins fade if not re-proven within a bounded window (same spirit as blend staleness; exact days tuned in build, default aligned with consensus ~14-day horizon).
4. **Next-day gate** — an item only contributes fully to **confirmed** proficiency after success on a **calendar day after** first success (or after a miss that needs re-confirm). Same-day-only success feeds **today’s accuracy** and Completed, not Mastered.

**Lesson rollup (MVP):**
- **Completed** — coverage × score hits the lesson bar **today** → unlock next.
- **Mastered** — confirmed proficiency hits the bar after later-day confirm (ADR-0004).

No 5-level per-item scale at MVP (ADR-0011 / PM-006).

Practice Set coverage/performance uses its own target and set rollups (ADR-0015). It may share a
knowledge key across sets, but it never contributes to lesson Completed/Mastered.

## Data inputs (read, don’t redefine)

Signals already planned on `user_item_stats` / `evaluations`: attempts, bestScore, avgScore, lastAttemptAt, missedTags, distinct success days. Exact columns confirmed in OI-020 DB area spec.

## Out of scope here

- Session recipe / sampler weights → OI-021.
- Passing-score slider / 5-level familiarity → post-mvp PM-006.
- Streak → ADR-0010 (calendar-day completed sessions; separate from proficiency %).

## Closes
OI-019.
