---
name: close
description: Validate, commit, and publish current AIdioma work through a protected-main PR, then safely remove only branches and worktrees already contained in main. Use when the operator says /close, requests publication, ends a session, or asks for repository cleanup.
---

# /close — intentional commit, checked PR, contained cleanup

## Safety rules

- `origin/main` is the sole durable integrated branch. Never push directly to it, force-push, reset
  user work, or delete a branch/worktree whose exact tip is not contained in fetched `origin/main`.
- Preserve unrelated or ambiguous changes. Stage explicit paths after reviewing the complete diff;
  do not use blanket staging as a substitute for deciding what belongs.
- Stop repo-owned development servers before removing their worktrees. Never force-remove a dirty
  worktree.
- Old STATE/ROADMAP/Waves/register files do not control close. Do not recreate their boilerplate.

## Close workflow

1. Read `Docs/INDEX.md` and the highest-numbered handoff. Inspect all worktrees, local/remote branches,
   stashes, open Git operations, server processes, and current PRs. Run
   `.claude/skills/close/scripts/preflight.sh --fetch` when it fits the repository state.
2. Review `git status`, unstaged/staged diffs, generated files, and secrets. Decide the exact owned
   paths. Update only active specs or the current handoff needed to explain tested behavior or a pause.
3. Run the checks appropriate to the diff. Application work normally requires typecheck, lint, tests,
   production build, and the affected browser smoke. Content/schema work requires its contract and
   content validations. A failed or skipped required check stays visible.
4. Stage only intentional paths, inspect the staged diff, and create a scoped commit. Confirm the
   worktree is clean and the commit contains exactly the intended change.
5. Push the short-lived branch without force. Open or update one PR to `main`, link the exact HEAD and
   validation evidence, and wait for protected `app-validate` and `content-validate`. Verify the exact
   Preview or candidate for learner-facing changes.
6. Merge only the reviewed, unchanged candidate through the PR. If checks fail, the branch moves, or
   live proof disagrees, fix and revalidate instead of merging a different SHA.
7. Fetch/prune after merge. Before cleanup, prove each disposable tip with
   `git merge-base --is-ancestor <tip> origin/main`. Close superseded PRs, remove only clean contained
   secondary worktrees, and then delete their contained local/remote branches. Keep one clean primary
   worktree on local `main` exactly matching `origin/main`.
8. Rerun the cleanup audit with
   `.claude/skills/close/scripts/preflight.sh --fetch --target origin/main --cleanup-audit`.

## Final report

Give the branch and exact SHA, commit and PR, checks and live proof, files intentionally preserved,
merge result, deleted and remaining branches/worktrees, and the next action. If work is not merged,
state the precise blocker and leave every recovery ref intact.
