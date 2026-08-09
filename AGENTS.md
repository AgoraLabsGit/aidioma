# AIdioma agent rules

This repo is the **AIdioma Praxis project** (learner product + its own process ledger).

Praxis **product** development (bootstrap / productization) lives in the sibling repo
`/Users/mike/Documents/Coding/Projects/Praxis.v2` — a separate Praxis project with its own
`Docs/`, `WORK.yaml`, and dashboard.

## Start here

1. Read this file and `Docs/AGENTS.md`.
2. **Docs home (D-020):** If `.worktrees/docs` exists (`npm run work:docs-home`), treat that
   worktree as the only writable SSOT for `Docs/**`, `.work/**`, this file, `CLAUDE.md`, and
   `.claude/skills/**`.
3. **Non-phase desk (D-025):** Product `/task`/`/fix` → `task/*`/`fix/*` worktrees.
4. Living docs: `Docs/START.md`, `Docs/System/system.md`, `Docs/System/COMMANDS.md`,
   `Docs/Handoffs/HANDOFF.md`, active phase under `Docs/Roadmap/Phases/`.
5. Treat `Docs.2/` as frozen evidence only. Never dual-write living state there.
6. `apps/web/`, packages, `content/` prove learner product behavior.

## Dual Praxis projects

| Project | Repo | Data |
|---|---|---|
| AIdioma | this repo | Learner specs, AIdioma Work/phases/research |
| Praxis dev | `../Praxis.v2` | Praxis product specs, Praxis Work/phases/research |

Do not mix project ledgers. Each runs its own `work:dashboard` (D-057 ports avoid collisions).

## Commands

See `Docs/System/COMMANDS.md`. `/launch` is for the learner app; `/dashboard` is this project's Praxis UI.
