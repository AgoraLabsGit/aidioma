# AIdioma — agent guide

> Keep this file concise. Current detail begins at `Docs/INDEX.md` and the latest numbered handoff.

## Operator

Mike is a non-technical solo founder. Lead with the outcome in plain language. Triage implementation
detail yourself, surface one strategic decision at a time, recommend an option, and distinguish
free-now work from paid-later work. Coordinate parallel sessions through branches, commits, PRs, and
current files; never assume shared chat memory.

## Start every session here

1. Read `Docs/INDEX.md`.
2. Read the highest-numbered file in `Docs/Handoffs/`.
3. Inspect the current branch, worktree status, and relevant diff before acting.
4. Open only the active product/spec/reference files needed for the requested scope.

`Docs/Archive/Planning/`, `Docs/Archive/Waves/`, and `Docs/Archive/Registers/` are historical inputs.
They are not automatic status or planning authority, and routine commands must not recreate their
boilerplate.

## Product truth

- The current tested application—especially `http://127.0.0.1:3217/practice`—is the product truth.
- Specs follow or accompany behavior exercised in the live app; they do not invent future behavior.
- Record a tested feature as: what the learner sees; what must be true; what it must not do; how the
  live prototype proves it.
- When behavior is unresolved, identify the smallest next live test instead of writing architecture
  around it.
- Keep feedback direct and learner-facing. Do not let historical proposals override current founder
  feedback from the working app.

## Repository boundaries

- `apps/web/` owns the application and executable UI behavior.
- `content/` owns original authored curriculum, lessons, and review evidence. Research informs new
  work but is never bulk-copied into shippable content.
- `packages/lesson-schema/` is the executable content contract. Schema changes are explicit,
  compatibility-conscious work, never an incidental app edit.
- Preserve technical references and ADR history. Archive or delete only from an approved exact-path
  retention map; use reversible commits, never destructive resets.

## How work runs now

- Use `/run`, `/fix`, `/feature`, `/status`, and `/close` from `.claude/skills/`.
- Base new work on fetched `origin/main` unless continuing a clearly owned branch. Give parallel
  agents non-overlapping file scopes; sequence shared files.
- Preserve unrelated user changes. Never stage blindly, force-push, or delete an uncontained ref.
- Run the smallest relevant checks while iterating, then the complete checks appropriate to the diff.
  Prove learner-facing changes through the real browser path.
- Update only active docs that the tested change affects. Prefer a current spec or handoff over a new
  process document.
- Publish through a PR. Protected `main` requires `app-validate` and `content-validate`; merging an
  app change also requires verification of the exact candidate users will receive.
- Remove a worktree only when clean and contained in fetched `origin/main`. Delete local/remote task
  branches only after the same containment proof.

## Sub-agents and handoff

Delegate bounded implementation, mechanical scans, or independent audits when useful. Assign exact,
non-overlapping paths and ask for compact findings rather than transcripts. Keep coordination and
judgment in the main thread. If a session must pause, update the current highest handoff with the
branch, exact HEAD, dirty state, checks, and next action. After three failures on the same step, stop
and ask Mike rather than looping.
