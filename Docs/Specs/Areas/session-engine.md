---
title: SessionEngine — recipes + blender
type: area-spec
status: active
updated: 2026-07-29
---

# SessionEngine — recipes + blender

> A0-4 / OI-021. Runtime shape for practice sessions. Weight formula detail:
> Consensus §1.3 — this file locks MVP recipes and the Continue vs size-10 split.
> Current UI review surface: [intermediate pilot](../../Prototypes/intermediate-learning-pilot.md).
> Historical screen contract: [module spec](../../Archive/Specs/Features/module-spec.md). Data inputs:
> [data model](data-model.md).

## MVP recipes

| Recipe | Scope | Session shape |
|---|---|---|
| **Continue** | Current lesson | **Full Mix arc:** Learn → Quiz(MC) → Words → Sentences → Story. Study/reference cards stay on lesson detail (ADR-0012), not in Mix. |
| **Blend** | Current + review | **Size 10** weighted sample: ~60% current lesson / ~40% review pool |
| **Review / Saved** | Saved + weak/due | **Size 10**, 100% review pool |
| **Set** | One curated Practice Set | **Size 10 default**, sampled from the frozen capability/filter configuration |

No multi-lesson picker UI and no ratio sliders (OI-002 / module-spec). The Set recipe is not a
lesson picker and never changes lesson progress. Custom-generated sets reuse it after A9 gating.

## Voice staging

- A10 spoken input and audio playback are presentation/input modes on the four existing recipes,
  not another recipe or progress path. Transcription fills the same composer and evaluation request.
- A12 may add **Conversation** only after the A11 provider decision: one authored scenario/persona,
  register, vocabulary, goals, correction mode, and maximum duration snapshotted into the session.
- Generated dialogue turns do not advance lesson/set progress. Only an explicit server-resolved
  authored target can create a scored evaluation; other turns feed a non-credit end recap.
- Resume preserves accepted transcript turns, never a live microphone connection or raw audio.

## Set recipe

Resolve the active set version server-side, intersect requested activity/direction/size/difficulty
and grammatical filters with declared capabilities, reject an empty/invalid intersection, then
persist the resolved configuration snapshot before dealing items. Verb sampling balances selected
tense/person targets where possible; invalid forms are absent from the target pool. The initial
renderer supports Type + Flashcards. Later Quiz/Sentences/Story/Reading/Conversation activities
enter only when the set version carries their required reviewed assets.

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
- Blend/Review complete at size 10 (or end-session); Set completes at its snapshotted size.
- Session summary: score, items moved, top error tags, next step (roadmap A7).
- Every run creates `practice_sessions`. Recipe completion sets `completedAt`; explicit early end sets
  `endedAt`; abandonment sets neither. Evaluations carry the session ID (ADR-0013).
- Shuffle within each run; preserve the same in-progress ordering when resuming rather than silently
  dealing a different session.

## Closes
OI-021.
