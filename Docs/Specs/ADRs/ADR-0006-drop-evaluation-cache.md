---
title: ADR-0006 — Drop evaluationCache at MVP
type: adr
status: accepted
updated: 2026-07-28
---

# ADR-0006 — Drop evaluationCache at MVP

## Decision
Do **not** ship a cross-user `evaluationCache` table at MVP. Every evaluation still records `evalSource` and `normalizedInputHash` (plus itemRef, direction, contentVersion) so hit-rate can be measured later and a cache rebuilt if needed.

## Why
Comparison-first grading already kills most AI calls. Cross-user identical-miss hits are rare at small scale; a cache adds migration, invalidation, and another code path for little savings.

## Revisit when
Monthly AI spend ≳ $50 **or** >15% of AI-path calls share (itemRef, direction, normalizedInputHash) with a prior call. Then rebuild as cache keyed that way. Historical backlog context: `Docs/Archive/Registers/post-mvp.md` (PM-009).

## Closes
OI-008.
