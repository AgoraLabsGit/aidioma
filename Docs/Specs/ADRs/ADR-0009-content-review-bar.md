---
title: ADR-0009 — Four-layer content review bar
type: adr
status: accepted
updated: 2026-07-29
---

# ADR-0009 — Four-layer content review bar

## Decision
Launch scored content (12 A1 lessons plus the ADR-0015 curated Practice Set pack) passes:

1. **CI validator** (schema + lint)  
2. **Adversarial second-LLM QA** (different model; structured checklist)  
3. **Founder checklist** (grammar/structure you can catch)  
4. **One paid native-speaker pass** on all 12 (~$200–400 once; brief at `content/review/NATIVE-REVIEWER-BRIEF.md`)

Plus **in-app “report this item”** after launch (missing alternates are the common failure).

Post-launch lessons: native review may drop to a sample (e.g. 25%) unless flag rate spikes.

## Why
Founder alone misses naturalness/register; full native retainer pre-launch is overkill; one-time native on the launch set is enough. Layers 1–2 are already in the content lane.

## Closes
OI-011. Gates content wave C3 before ship (roadmap A7; renumbered by ADR-0015).
