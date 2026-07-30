---
name: close
description: Close any AIdioma agent session safely and manage the two-phase release flow. Use when the operator says /close or SHIP, ends a worker chat, requests branch handoff, closes a wave into the cumulative Preview batch, publishes that batch, or asks for branch/worktree cleanup. Worker mode commits and hands off without merging; coordinator mode alone integrates, previews, ships, and cleans up.
---

# /close + SHIP — one safe exit and one Production gate

## Safety contract

- Treat GitHub PRs and commit SHAs as the handoff queue; never use shared chat memory as state.
- One worktree owns one branch. Never let two sessions edit or merge the same branch.
- Worker sessions never merge into `main` or a release candidate. One coordinator at a time owns
  integration, Preview publication, Production publication, and branch deletion.
- Worker `/close` authorizes committing/pushing only the current ordinary work branch. Coordinator
  `/close` authorizes updating the named cumulative `release/**` branch and its Git-backed Preview,
  including reviewed Preview-only configuration named in the wave record. Neither authorizes
  `main`, Production configuration, force push, or destructive cleanup.
- `SHIP` means the operator verified the exact current batch Preview and authorizes that whole batch
  for Production. It does not cover a later commit, unrelated infrastructure, new spending, or an
  unreviewed/destructive operation.
- Preserve unrelated or ambiguous changes. Never stage everything blindly, reset a dirty worktree,
  delete an uncontained branch, or use force push.
- Stop every repo-owned long-lived dev/preview server before final preflight. Preflight reports and
  fails on server residue; it never kills an ambiguous process automatically.

## 1. Preflight and choose the mode

1. Read `Docs/STATE.md`, `Docs/ROADMAP.yaml`, `Docs/PROCESS.md`, and the newest relevant Handoff.
2. Stop known repo-owned dev/preview servers, then run
   `.claude/skills/close/scripts/preflight.sh --fetch`. Inspect every dirty worktree, reported server,
   and branch reported as not contained in the current target.
3. Stop for an active merge/rebase, secrets, unexplained generated files, failing required checks,
   an ambiguous owner, or remote movement that invalidates the base.
4. Choose exactly one mode:
   - **Worker:** any `slice/**`, `fix/**`, `work/**`, `prototype/**`, or other task branch.
   - **Coordinator:** `release/**`, or the sole branch named by `Docs/STATE.md` as release candidate.
   - **Main:** recovery/verification only. New work directly on `main` is a process failure.

## 2A. Worker close — hand off, never merge

1. Decide whether the work is complete or intentionally paused. For paused work, write/update one
   numbered Handoff with the exact branch, HEAD, completed checks, dirty state, and next action.
2. Reconcile the touched wave/spec/register/STATE records. Run the lane gates required by the work;
   a required gate that did not run is failed. Record exact results.
3. Review `git status`, staged paths, and the diff. Stage only files owned by this session. Exclude
   secrets, caches, accidental screenshots, and unrelated user changes. Commit with a scoped message.
4. Re-run preflight. The worktree must be clean and the commit must contain the intended diff.
5. Push the ordinary branch without force. For App work, target the open ROADMAP release branch when
   one exists; otherwise target `main`. Open/update one **draft** PR and record the exact HEAD, checks,
   remaining proof, and coordinator action in the PR/handoff. Then stop.

## 2B. Coordinator `/close` — add a wave to the Preview batch

1. Confirm no other coordinator is active. Fetch/prune and read ROADMAP `release_batch`. If no batch
   is open, create `release/<first-wave>-<date>` from current `origin/main`; otherwise continue the
   named release branch from its exact remote HEAD. Integrate only clean, pushed worker SHAs with a
   clear PR/handoff. Resolve conflicts centrally; never ask workers to merge each other.
2. Run the hygiene slice, cache-free lane gates, whole-wave review/audits, and docs reconciliation.
   Re-run full-batch gates against `origin/main`, not merely the newest wave delta.
3. `/close` is the Preview authorization: push/update the cumulative release branch, open/update its
   draft PR, wait for CI/deployment, apply only reviewed Preview-scoped configuration, and prove the
   required real paths. Use the immutable commit URL as evidence. A failed proof leaves the wave active.
4. On passing proof, mark the wave `closed` for roadmap/dependency purposes and append it to ROADMAP
   `release_batch.queued_waves`. Report the exact SHA, Preview URL, contained waves, and test script.
   The operator may continue development and add later waves without shipping this batch.

## 2C. Coordinator `SHIP` — publish the exact cumulative batch

1. Read ROADMAP `release_batch`; require at least one queued wave, a clean candidate, passing checks,
   and an immutable Preview URL. Reconfirm the branch HEAD and remote SHA have not moved.
2. Treat `SHIP` as both human verification of that exact Preview and Production authorization for all
   listed waves. If the operator has not tested that SHA, or reports a mismatch, stop without release.
3. Apply only the reviewed Production configuration named in the batch runsheet, then merge/push the
   exact candidate to `main` once. Verify Production deployment, aliases, bounded logs, data behavior,
   and required infrastructure receipts. Never substitute a later commit after `SHIP`.
4. Update `last_shipped_wave` and `production_sha`, clear `queued_waves`/any Production exception,
   and close release-only register rows. Then triage
   every worktree and delete only branches/worktrees proven contained in `origin/main`; prune and rerun
   preflight. A failed Production proof leaves an owned incident and stops further publication.

## Required final report

State the mode, branch and exact SHA, checks run, queued waves, PR/Preview/Production URLs when
applicable, what was committed or preserved, every remaining branch/worktree, and the one next
command for a fresh session (`/run`, `/close`, or `SHIP`).
