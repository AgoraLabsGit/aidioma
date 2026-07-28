---
title: ADR-0005 — Typed direction Both by default
type: adr
status: accepted
updated: 2026-07-28
---

# ADR-0005 — Typed direction Both by default

## Decision
At launch, typed practice **defaults to Both** (alternates EN→ES and ES→EN per card / session policy already in the prototype). The Direction control remains (OI-001); learners can narrow to one direction.

Flashcards stay both directions as before.

## Why
Operator chose maximum day-one practice variety over the panel’s EN→ES-only launch cut (D3). Production (EN→ES) remains the higher-value skill; recognition (ES→EN) is available without a later unlock.

## Consequences
- Authoring/QA must keep **both** `acceptedEs` and `acceptedEn` strong — English paraphrase space is wider; misses fall through to AI more often if alternates are thin.
- Vocab typed-recall accept sets (**P-003** item 1) become more important.
- Cost gate still comparison-first; expect somewhat higher AI-path rate than EN→ES-only until alternates mature.
- Overrides panel recommendation D3; noted deliberately.

## Closes
OI-007.
