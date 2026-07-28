---
title: SessionEngine — recipes + blender
type: area-spec
status: active
updated: 2026-07-28
---

# SessionEngine — recipes + blender

> A0-4 / OI-021. Runtime shape for practice sessions. Weight formula detail:
> Consensus §1.3 — this file locks MVP recipes and the Continue vs size-10 split.
> UI surface: [module-spec](../Features/module-spec.md). Data inputs: [data-model](data-model.md).

## MVP recipes (exactly three)

| Recipe | Scope | Session shape |
|---|---|---|
| **Continue** | Current lesson | **Full Mix arc:** Learn → Quiz(MC) → Words → Sentences → Story. Study/reference cards stay on lesson detail (ADR-0012), not in Mix. |
| **Blend** | Current + review | **Size 10** weighted sample: ~60% current lesson / ~40% review pool |
| **Review / Saved** | Saved + weak/due | **Size 10**, 100% review pool |

No multi-lesson picker UI, no ratio sliders (OI-002 / module-spec). Engine may accept richer recipes later; MVP UI only exposes these three.

## Review pool (Blend + Review)

Items of the requested modality from:
- current lesson ∪ last 3–4 completed lessons ∪ saved items
- ∪ items with an error-tag miss in the last ~14 days

## Sampler weights (Blend / Review)

MVP defaults (tunable after real usage; no 5-level enum — ADR-0011):

```text
w = (1 - bestScore/100 + 0.2)
    × min(daysSinceLastAttempt, 14)/14
    × 1.5 when item tags intersect the learner's top 3 error tags
    × 1.2 when saved
```

Never-attempted items use maximum staleness. On day one the tag boost is absent.

Weighted sample without replacement to size; **no two consecutive items** share the same vocab/tag (interleave). Misses re-queue within the session until retrieved (prototype “again” behavior).

## Continues / ends

- Continue completes when the Mix arc for that lesson run finishes (or learner ends session).
- Blend/Review complete at size 10 (or end-session).
- Session summary: score, items moved, top error tags, next step (roadmap A6).
- Every run creates `practice_sessions`. Recipe completion sets `completedAt`; explicit early end sets
  `endedAt`; abandonment sets neither. Evaluations carry the session ID (ADR-0013).
- Shuffle within each run; preserve the same in-progress ordering when resuming rather than silently
  dealing a different session.

## Closes
OI-021.
