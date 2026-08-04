---
name: close
description: Close an AIdioma planning, feature, fix, or migration session by reconciling SSOT, validating, publishing through protected main, cleaning contained refs, and writing the next kickoff. Use when the operator says /close or ends a session.
---

# /close

1. Read `AGENTS.md` and current memory files. Inspect all owned/unrelated diffs, worktrees, branches,
   stashes, operations, PRs, and servers. Run `scripts/preflight.sh --fetch` when applicable.
2. Reconcile WORK/FIXES status and evidence, the active spec, and current implemented truth. Overwrite
   `HANDOFF.md` with candidate state, remaining work, evidence, and a kickoff message. Exact final
   merge/runtime facts belong in the close response because a commit cannot contain its own SHA.
3. Run focused and repository-wide checks appropriate to the diff plus affected browser proof. A
   skipped required gate is visible, not silently passed.
4. `/close` is explicit authorization to stage the reviewed scope, commit, push the short-lived
   branch, open/update a PR, and merge that exact unchanged head after required checks pass. It does
   not authorize production data/config changes or an expanded diff.
5. Fetch/prune and prove containment before deleting refs/worktrees. Return to one clean local main
   exactly matching the sole origin/main. Restart localhost from that main when app code changed.
6. Report outcome, SHA/PR, validation, preserved work, cleanup, runtime, and next command.
