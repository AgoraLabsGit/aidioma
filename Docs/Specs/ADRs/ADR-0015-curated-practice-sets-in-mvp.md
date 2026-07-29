---
title: ADR-0015 — Curated Practice Sets enter MVP
type: adr
status: accepted
updated: 2026-07-29
---

# ADR-0015 — Curated Practice Sets enter MVP

## Decision

Curated Practice Sets are part of the launch MVP and get a dedicated App wave before Ship. They
reuse the Practice workspace and evaluation/session infrastructure but are first-class content,
not synthetic lessons. MVP includes the catalog, reviewed prebuilt sets, capability-aware settings,
Type + Flashcards, set persistence/progress, and structured verb filters.

Sets use overlapping Vocabulary/Verbs/Phrases/Topics/Situations facets. Popular is a curation badge,
not a content kind. Set evaluations never advance lesson completion or mastery. The initial content
is original and frequency-informed; AIdioma does not ship a copied third-party ranked table.

Private custom-topic generation is designed into the contract but implemented in A9 after the
curated path is proven. It must generate structured candidates, pass validation/quality gates,
retain provenance, and remain private unless it passes the authored-content review bar.

## Why

Learners need focused repetition outside the linear lesson path, including verb-form drills and
situation-specific practice. Reusing one engine keeps evaluation, progress evidence, accessibility,
and feedback coherent. Separating set progress prevents optional drilling from bypassing the
governed lesson sequence.

The UI is intentionally prototype-responsive: labels, layout, defaults, facets, and presets may
change after testing without destabilizing content identity or history.

## Consequences

- ROADMAP adds A6 for curated sets; the former pending Ship/Reading waves move to A7/A8.
- PM-015 is promoted; its former post-MVP timing and the timing row in ADR-0012 no longer govern.
- The data model gains set, target, session-source, evaluation-source, and set-progress shapes.
- Curated set content follows deterministic validation plus the launch review bar.
- Generated custom sets and user-content import remain distinct; import stays PM-022.

## Supersedes

ADR-0012 only where its comparison table placed custom/frequency decks after MVP. Its reference-card
decision remains accepted. PM-015 is promoted to ROADMAP A6; PM-009 continues to govern safe
generated-content promotion.
