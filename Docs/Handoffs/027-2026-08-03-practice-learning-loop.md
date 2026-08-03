# Handoff 027 — Practice learning-loop prototype

**Date:** 2026-08-03
**Branch:** `feature/practice-learning-loop-2026-08-03`
**Base:** `9e00f09` (`main` / `origin/main` at session start)

## Current product truth

The localhost Practice fixture now exercises realistic depth and the main visit-local learning loop.
Restaurant Spanish has 50 distinct reviewed prototype prompts; the other collections remain small
breadth samples. This is prototype evidence, not canonical or launch-approved curriculum.

- Every fresh varied session has a new seeded order, schedules each prompt before repeating one,
  exhausts both-direction units before repeating, and avoids the prior first prompt when possible.
  Shuffle off preserves fixture order as a deterministic test seam.
- Ungraded feedback preserves the response and prompt. Only retryable failures offer retry; no
  failure advances count/score, and stale results cannot update an ended or restarted session.
- Settings are drafts until Start practice/Start new session; cancel discards them. Applying settings
  starts a new immutable session snapshot. The inert learner support setting is gone; authored
  numeric content difficulty remains separate.
- Saved separates visit-only collection bookmarks from direction-independent prompt references.
  Saved prompts form a shuffled both-direction practice queue and do not survive reload.

## Restaurant corpus and generation boundary

The 46 added Restaurant prompts were created with the operator-only candidate bench and combined with
the four original prompts. The bench enforces strict structured schemas, bounded batches, semantic
checkpoint validation, resumable inventory/hash integrity, deterministic final validation, complete
human decisions, warning acknowledgement, and an independent different-model critic bound to the
reviewed content hash. Promotion is prototype-only and installs hash-bound JSON plus its tracked
review/critic sidecar.

This is not A9: there is no learner request flow, Workflow orchestration, Neon job state, private-set
persistence, publication, or canonical-content promotion. The corpus has not passed ADR-0009 founder
and paid native-speaker launch review, and its existing model-assisted reviews do not substitute for
those layers.

## Validation evidence

- Focused unit/component coverage proves fresh-order invariants, immutable settings snapshots,
  retry/non-retry and stale-result handling, saved-reference identity, saved-material replay, strict
  generation/resume/checkpoint gates, and promotion/sidecar hash binding.
- The promoted fixture parses at application load, contains exactly 50 unique Restaurant prompt IDs,
  and keeps generated provenance absent for the original-only brief.
- Repository App typecheck, lint, tests, production build, Practice headless smoke, and final diff
  checks are the required close gates; record their final coordinator totals in the merge/PR evidence.

## Residual prototype limits

- The corpus is suitable for depth and interaction testing only; linguistic naturalness and coverage
  still need founder/native launch review before any production-content decision.
- Saved state, latest score, settings, and session history are visit/local prototype state, not a
  durable learner profile or collection-proficiency claim.
- A completed finite queue cycles again during continuous practice; adaptation, persistence, and
  learner-generated/private collections remain deliberately deferred.

## Next actions

1. Complete the combined App gates and browser proof on the exact branch head.
2. Review the live 50-unit session for content quality and interaction fatigue; edit prototype
   material through the same review/critic boundary if needed.
3. Merge through the repository's protected-main workflow, then remove the temporary branch and
   return the one clean worktree to `main` matching `origin/main`.
