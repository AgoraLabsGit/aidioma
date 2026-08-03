---
name: run
description: Continue the current AIdioma work from the latest handoff, grounded in the live app. Use when the operator says /run or asks to continue building.
---

# /run — continue current work

1. Read `Docs/INDEX.md`, then the highest-numbered `Docs/Handoffs/*.md`. Inspect the current branch,
   worktree status, and relevant diff. Historical STATE/ROADMAP/Waves/register files may provide
   context but are not the automatic work queue; do not create or update them as routine ceremony.
2. State the current learner-facing outcome and the smallest useful next step. If intent is genuinely
   ambiguous, ask one focused question; otherwise continue.
3. Confirm the existing behavior in the live app before changing it. For Practice work, start at
   `http://127.0.0.1:3217/practice`. Treat tested behavior and fresh founder feedback as product truth.
4. Work on a short-lived branch from fetched `origin/main`, or continue the clearly owned current
   branch. Preserve unrelated changes and give sub-agents non-overlapping path scopes.
5. Implement the smallest coherent change. Keep `content/` authorship and
   `packages/lesson-schema/` contract changes separate and deliberate.
6. Run narrow tests while iterating, then the relevant typecheck, lint, tests, build, content checks,
   and browser proof for the final diff. Fix or clearly disposition findings.
7. Update only active specs or the current handoff, and only with behavior proven in the app. Use:
   what the learner sees; what must be true; what it must not do; how the live prototype proves it.
8. Report the outcome, evidence, remaining uncertainty, and whether `/close` can publish the branch.
