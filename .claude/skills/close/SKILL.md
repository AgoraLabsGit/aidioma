---
name: close
description: Close any AIdioma agent session safely and keep one protected origin/main. Use when the operator says /close or SHIP, ends a worker chat, requests branch handoff, closes a wave, publishes a Preview, or asks for branch/worktree cleanup. Workers hand off short-lived branches; the coordinator alone integrates, ships, and cleans up.
---

# /close + SHIP — short-lived agent branches, one clean main

## Safety contract

- Treat GitHub PRs and commit SHAs as the handoff queue; never use shared chat memory as state.
- `origin/main` is the only durable integrated history. At rest there is one clean primary worktree
  on local `main` matching it; agent branches/worktrees are temporary execution state.
- One active agent owns one worktree, branch, and declared file/area scope. Never let two sessions
  edit or merge the same branch; serialize overlapping scopes instead of resolving avoidable conflicts.
- Worker sessions never merge into `main` or a release candidate. One coordinator at a time owns
  the primary worktree, shared control files (`STATE`, `ROADMAP`, `PROCESS`), integration, Preview
  publication, Production publication, and branch deletion.
- Worker `/close` authorizes committing/pushing only the current ordinary work branch. Coordinator
  `/close` authorizes integrating documentation/non-deploying work through a passing PR and updating
  a named short-lived `release/**` branch for deployable Preview work. Neither authorizes deployable
  code onto `main`, Production configuration, force push, or uncontained deletion. Retire clean
  worktrees immediately after their exact HEAD is contained in the fetched integration target.
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
2. Reconcile worker-owned wave/spec evidence and record requested global changes in the handoff;
   the coordinator updates shared control files. Run the lane gates required by the work; a required
   gate that did not run is failed. Record exact results.
3. Review `git status`, staged paths, and the diff. Stage only files owned by this session. Exclude
   secrets, caches, accidental screenshots, and unrelated user changes. Commit with a scoped message.
4. Re-run preflight. The worktree must be clean and the commit must contain the intended diff.
5. Push the ordinary branch without force. For App work, target the open ROADMAP release branch when
   one exists; otherwise target `main`. Open/update one **draft** PR and record the exact HEAD, checks,
   remaining proof, declared file/area scope, and coordinator action in the PR/handoff. Workers do
   not reconcile coordinator-owned shared control files directly. Then stop; only the coordinator
   retires the worktree after integration.

## 2B. Coordinator `/close` — integrate and clear temporary work

1. Documentation, process, planning, and non-deploying Content work that is complete and internally
   consistent merges to `main` through passing checks without waiting for an unrelated App release.
   Documentation inseparable from unshipped behavior travels with that code instead.
2. Deployable App work integrates into one short-lived `release/**` branch from current `origin/main`.
   The coordinator publishes its Git Preview, proves the required paths, and may batch later App waves.
3. After either integration path, fetch the target and run the worktree cleanup audit. Remove clean
   secondary worktrees marked `SAFE_REMOVE_AFTER_CLOSE`. Delete a task branch once it is merged into
   `origin/main`; otherwise keep only the ref needed by the active release PR.

### Deployable Preview details

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
5. Fetch the remote integration target and run
   `.claude/skills/close/scripts/preflight.sh --target origin/<release-branch> --worktree-cleanup-audit`.
   Remove only clean secondary worktrees marked `SAFE_REMOVE_AFTER_CLOSE`. Keep no redundant local
   checkout; the remote PR/ref is sufficient recovery until `SHIP`.

## 2C. Coordinator `SHIP` — publish the exact cumulative batch

1. Read ROADMAP `release_batch`; require at least one queued wave, a clean candidate, passing checks,
   and an immutable Preview URL. Reconfirm the branch HEAD and remote SHA have not moved.
2. Treat `SHIP` as both human verification of that exact Preview and Production authorization for all
   listed waves. If the operator has not tested that SHA, or reports a mismatch, stop without release.
3. Apply only the reviewed Production configuration named in the batch runsheet, then merge/push the
   exact candidate to `main` once. Verify Production deployment, aliases, bounded logs, data behavior,
   and required infrastructure receipts. When a provider requires the account owner to publish a
   staged Production change, present exactly one command, wait for it once, then continue automatically.
   Never substitute a later commit after `SHIP`.
4. Update `last_shipped_wave` and `production_sha`, clear `queued_waves`/any Production exception,
   and close release-only register rows. Run
   `.claude/skills/close/scripts/preflight.sh --fetch --target origin/main --cleanup-audit`; any
   dirty or uncontained ref blocks deletion.
5. Close superseded PRs, keep/sync local `main` to verified `origin/main`, remove any remaining
   secondary worktrees marked `SAFE_REMOVE_AFTER_SHIP`, then delete contained local/remote branches.
   Prune and rerun the cleanup audit; finish with one clean `origin/main`, one primary worktree on
   matching local `main`, no merged task/release branches, and no superseded PR. A failed Production
   proof or containment check stops cleanup and owns an incident.

## Required final report

State the mode, branch and exact SHA, checks run, queued waves, PR/Preview/Production URLs when
applicable, what was committed or preserved, every remaining branch/worktree, and the one next
command for a fresh session (`/run`, `/close`, or `SHIP`).
