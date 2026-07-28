---
title: ADR-0011 — MVP mastery stays Completed/Mastered
type: adr
status: accepted
updated: 2026-07-28
---

# ADR-0011 — MVP mastery stays Completed/Mastered

## Decision
MVP uses the **two lesson states** from ADR-0004 (Completed / Mastered). Do **not** ship a 5-level per-item familiarity scale or user-set mastery threshold at launch.

Blender weights from existing signals: bestScore, recency, error tags, saved — not a separate level enum.

## Why
Operator chose simplify: one clear unlock/confirm story. Richer levels add UI + rules without proving the core loop first. Already parked as PM-006.

## Closes
OI-014.
