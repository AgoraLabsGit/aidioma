# AIdioma agent rules

Use these rules for every repository session. Repository files are memory; never assume prior chat
context.

## Start here

1. Read this file and `Docs/AGENTS.md` (agent contract).
2. Living docs root is `Docs/`. Prefer `.work/context.json` when present; else read
   `Docs/START.md`, `Docs/System/system.md`, `Docs/System/COMMANDS.md`,
   `Docs/Handoffs/HANDOFF.md`, and the active/next phase under `Docs/Roadmap/Phases/`.
3. Treat `Docs.2/` as frozen evidence only (`Docs.2/FROZEN.md`). Never dual-write living state there.
4. Inspect Git status, branch/worktrees (exactly one phase branch/worktree when a phase is active),
   the active phase spec, and relevant executable behavior before acting.
5. `apps/web/`, packages, `content/`, migrations, and tests prove product behavior.

## Development System V3

- Contract SSOT: `Docs/System/system.md` (approved).
- One active phase; one branch; one worktree. Phase frontmatter is the schedule SSOT.
- **MCOO** at `/plan` (cheap) and `/close` (binding).
- Proof-first. Behavior change requires a spec change.
- ≤3 consequential founder decisions per checkpoint. Silence is not approval.
- Do not preload `Docs.2/`; farm relevant slices only after outcome/non-goals are set.

## Commands

See `Docs/System/COMMANDS.md`. Lifecycle: `/plan` `/run` `/close` `/ship`. Action: `/research`
`/design` `/fix`. Utility: `/status` `/check` `/launch` `/dashboard` `/handoff`. Meta: `/system`.

- `/run` may commit on the phase branch. Merges require audited close checks.
- `/handoff` overwrites `Docs/Handoffs/HANDOFF.md` only — no commit/PR/merge.
- `/system` only while no phase is `active`; writes under `Docs/System/`.

## Application boundaries

- `apps/web/` is the learner application. Keep work-dashboard/tooling out of its routes and deploy.
- `content/` owns authored curriculum; package schemas own executable contracts.
- Never expose secrets, learner text, provider payloads, or internal work registries in public output.

## Git and runtime

- `origin/main` is the sole durable branch.
- Preserve items listed in `Docs/PRESERVE.md` (including Lexicon stash).
- `/launch` and `/dashboard` clear their own stale servers; `/close` verifies phase-owned servers stop.
