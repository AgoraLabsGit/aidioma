---
title: ADR-0008 — A1-first, then expand levels
type: adr
status: accepted
updated: 2026-07-28
---

# ADR-0008 — A1-first, then expand levels

## Decision
1. **Build and verify the full app loop on one CEFR level: A1** (launch = 12 A1 lessons once content+app gates pass).
2. **Do not author A2/B1 lessons for launch.** Expand levels only after the plumbing works on real A1 data (session engine, grade, blend, progress, seed/CI).
3. **Self-identified A2/B1 users:** unlock the A1 set (waive grind gates as needed) + honest banner (“content is A1 for now; A2 later”). No fake mid-spine placement.

## Why
Operator: prove one level end-to-end, then widen. Matches core-outward and avoids delaying ship for non-ICP content. A1 is a dependency chain — starting A2 users mid-spine without A1 vocab is dishonest.

## Sequencing (plain)
| Phase | What |
|---|---|
| Now | 3 pilot A1 lessons exist; app design close (A0) |
| Launch | App + **12 A1** lessons live |
| After verify | More A1 buffer → **A2** → **B1** (content waves C4+) |

Schema already allows A2/B1 tags as provisional; no need to fill those lessons yet.

## Closes
OI-010.
