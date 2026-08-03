---
title: Handoff — BUG-002 deployment guard ready for release Preview
type: handoff
status: active
updated: 2026-07-30
---

# Handoff — BUG-002 deployment guard ready for release Preview

**Role:** App worker on `fix/BUG-002`
**Implementation commit:** `879ac52db41b7ce81fa29580fc00cbb506b33fd3`
**Base:** `origin/main` at `3da1ae7d2e5f4f68a7fd27cb3c563f3c143f9652`
**Next command:** `/close`
**Fresh-session prompt:** `Integrate fix/BUG-002 at its exact pushed HEAD into a release candidate, publish and prove Preview, then stop before Production unless Mike explicitly says SHIP.`

## Completed

- Added Vercel `ignoreCommand` backed by a repository-owned classifier. Exactly two-parent merge
  commits may skip only when their first-parent diff contains no `apps/web`, shared lesson-contract,
  or root-package-manifest input. Single-parent, squash/rebase, unexpected-parent, and Git failures
  all fail open to a build.
- GitHub repository settings now allow merge commits only (`allow_merge_commit=true`,
  `allow_squash_merge=false`, `allow_rebase_merge=false`). Branch protection remains in force.
- The regression failed before implementation. Final focused coverage is 8 passing tests; direct
  execution returned exit 0 against the existing two-parent docs-only PR #3 merge and exit 1 at the
  single-parent implementation commit.
- Full App gates passed: typecheck; lint with zero warnings; 20 files / 148 tests; production build;
  smoke across 16 screen states. Read-only delta audit passed with no blockers. No UI changed.

## Remaining proof — BUG-002 stays open

1. Coordinator creates/updates one `release/**` candidate from current `origin/main`, integrates the
   exact pushed worker HEAD, and proves the normal Git Preview plus CI.
2. Stop. Only explicit `SHIP` authorizes merging that exact candidate to `main` and Production.
3. After the shipped guard is live, merge the audit-only PR #4 with a normal merge commit. Confirm
   Vercel records an expected canceled ignored build only: no successful Production deployment and
   no Production alias movement.
4. Then close BUG-002, reconcile the Production exception and audit branch, and continue OI-044.

Preserve `slice/A2R-1`/PR #4 and `slice/C2-1`; do not edit or remove either worktree from this fix.
