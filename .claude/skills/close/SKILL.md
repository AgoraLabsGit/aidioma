---
name: close
description: Close any AIdioma agent session safely. Use when the operator says /close, ends a worker chat, requests branch handoff, closes a wave, publishes a verified release, or asks for branch/worktree cleanup. Worker mode commits and hands off without merging; coordinator mode alone integrates, deploys, publishes, and cleans up.
---

# /close — one safe exit for every session

## Safety contract

- Treat GitHub PRs and commit SHAs as the handoff queue; never use shared chat memory as state.
- One worktree owns one branch. Never let two sessions edit or merge the same branch.
- Worker sessions never merge into `main` or a release candidate. One coordinator at a time owns
  integration, Preview publication, Production publication, and branch deletion.
- Invoking `/close` authorizes committing and pushing the current ordinary work branch after its
  checks pass. It does **not** authorize pushing `release/**` or `main`, publishing Firewall rules,
  deploying through the CLI, or changing other live infrastructure.
- Preserve unrelated or ambiguous changes. Never stage everything blindly, reset a dirty worktree,
  delete an uncontained branch, or use force push.

## 1. Preflight and choose the mode

1. Read `Docs/STATE.md`, `Docs/ROADMAP.yaml`, `Docs/PROCESS.md`, and the newest relevant Handoff.
2. Run `.claude/skills/close/scripts/preflight.sh --fetch`. Inspect every dirty worktree and every
   branch reported as not contained in the current target.
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
5. Push the ordinary branch without force and open/update one **draft** PR to `main`. Record the exact
   HEAD, checks, remaining proof, and coordinator action in the PR/handoff. Then stop.

## 2B. Coordinator close — integrate and release in batches

1. Confirm no other coordinator is active. Fetch/prune, confirm `origin/main` has not moved, and build
   `release/<wave>-<date>` from that exact base. Integrate only clean, pushed worker SHAs with a clear
   PR/handoff. Resolve conflicts centrally; never ask workers to merge each other.
2. Run the hygiene slice, cache-free lane gates, whole-wave review/audits, and docs reconciliation.
   Batch all known fixes locally before creating another deployment.
3. Show the exact candidate SHA and request explicit **PREVIEW GO**. On GO, push the release branch
   once, open/update its PR, and use only its immutable Git-backed Vercel URL for acceptance proof.
4. Give the operator the plain-language recap and exact testing script. Do not publish Production
   until the operator records **VERIFIED** for that SHA and then gives a separate explicit **GO**.
5. On GO, merge/push the verified tree to `main` once. Verify the Production deployment, aliases,
   bounded logs, and required infrastructure proof. Do not substitute a new commit after verification.
6. Only after `origin/main` contains the released work: triage every dirty worktree, remove contained
   worktrees, delete contained local/remote task and release branches, prune, and rerun preflight.

## Required final report

State the mode, branch and exact SHA, checks run, PR/Preview/Production URLs when applicable, what was
committed or preserved, every remaining branch/worktree, and the one next command for a fresh session.
