---
title: Handoff — cumulative release consolidation and cleanup
type: handoff
status: active
updated: 2026-07-30
---

# Handoff — cumulative release consolidation and cleanup

**Role:** sole App release coordinator; preserve every worktree until containment is proven
**Next command:** coordinator `/close` to update the A2 cumulative Preview
**Fresh-session prompt:** `Continue AIdioma from Handoff 017 as sole release coordinator; run /close.`

## Exact prepared position

- Continue from `.worktrees/process-two-phase-close` on `work/process-two-phase-close`; resolve its
  HEAD dynamically. It contains A2 diagnostic commit `3033c62` and the batched close/cleanup workflow.
- All four worktrees are clean with no repo dev/Preview server running: primary release, A2-H close,
  BUG-001 diagnostic, and process close. Every local branch is contained in the continuation line.
- Nothing is yet deletable against `origin/main` at `ec0ef9b`: no local branch is contained there.
  Preserve all worktrees/branches until the exact batch reaches and passes Production proof.
- Remote residue is explicit: PR #2 / `release/A2-2026-07-29` is canonical; superseded PR #1 /
  `agent/reconcile-main` remains open. GitHub `main` has no branch protection or repository ruleset.
- OI-037 owns PR supersession, strict containment cleanup, and `main` protection. No new cleanup row
  is needed. The preflight `--cleanup-audit` mode reports but never deletes.

## Before SHIP

1. Coordinator `/close` integrates this exact continuation into `release/A2-2026-07-29`, runs the
   full batch gates, updates PR #2/Preview, and tests authenticated AI first.
2. Any failure leaves A2 active and every worktree preserved. If all Preview receipts pass, close A2
   into `release_batch.queued_waves`; later waves may be added before Mike chooses `SHIP`.
3. Every later App branch bases on the cumulative release candidate, so one tested lineage—not
   parallel release tips—eventually reaches Production.

## SHIP and consolidate to one clean main

1. Mike tests the final immutable cumulative Preview and says `SHIP`. Reconfirm its SHA, queued waves,
   CI, Preview receipts, and remote ancestry; a moved candidate requires a new Preview/test.
2. Configure `main` to require a PR and passing checks and to block force-push/deletion; keep required
   approving reviews at zero for the solo-founder workflow. Apply only reviewed Production config.
3. Merge the exact canonical PR #2 candidate, verify `origin/main`, Production, Firewall/Gateway/data
   receipts, and update ROADMAP's shipped SHA before any cleanup.
4. From the primary worktree run
   `.claude/skills/close/scripts/preflight.sh --fetch --target origin/main --cleanup-audit`.
   Stop on any `BLOCK_DIRTY` or `BLOCK_UNCONTAINED` result.
5. Close PR #1 as superseded. Switch/synchronize the primary worktree to `main`; remove only secondary
   worktrees marked `SAFE_REMOVE_AFTER_SHIP`, then delete only their contained local branches.
6. After PRs are closed/merged, delete contained remote `agent/reconcile-main` and release branches,
   prune worktree/remote metadata, and rerun the strict audit. Finish with one clean primary worktree
   on local `main` exactly matching `origin/main`, no open superseded PR, and no secondary branch.
