# AIdioma agent rules

Use these rules for every repository session. Repository files are memory; never assume prior chat
context.

## Start here

1. Read this file and `Docs/AGENTS.md` (agent contract).
2. **Docs home first (D-020):** If `.worktrees/docs` exists (`npm run work:docs-home`), treat that
   worktree as the only writable SSOT for `Docs/**`, `.work/**`, this file, `CLAUDE.md`, and
   `.claude/skills/**`. Do not edit those paths on `phase/*` / `task/*` / `fix/*` trees.
3. **Non-phase desk (D-025):** Product `/task`/`/fix` → dedicated `task/*`/`fix/*` worktree
   (create if missing). Docs home is meta-only. Concurrent Docs-home writers: lease via active
   Work `context_paths` (overlap → wait/park).
4. Living docs root is `Docs/` (inside Docs home when present). Prefer `.work/context.json` when
   present; else read `Docs/START.md`, `Docs/System/system.md`, `Docs/System/COMMANDS.md`,
   `Docs/Handoffs/HANDOFF.md`, and the active/next phase under `Docs/Roadmap/Phases/`.
5. Treat `Docs.2/` as frozen evidence only (`Docs.2/FROZEN.md`). Never dual-write living state there.
6. Inspect Git status, branch/worktrees (exactly one phase branch/worktree when a phase is active),
   the active phase spec, and relevant executable behavior before acting.
7. `apps/web/`, packages, `content/`, migrations, and tests prove product behavior.

## Development System V3

- Contract SSOT: `Docs/System/system.md` (approved).
- **At most one active phase today** (one phase branch/worktree while a phase is in flight).
  Parallel active phases are planned (`W-015 — Parallel active phases`) — not live.
  Non-phase `/task` `/fix` `/research` `/design` are first-class; publish via reduced `/close`
  (D-021/D-025).
- **MCOO** at `/plan` (cheap) and `/close` (binding).
- Proof-first. Behavior change requires a spec change.
- ≤3 consequential founder decisions per checkpoint. Silence is not approval.
- Do not preload `Docs.2/`; farm relevant slices only after outcome/non-goals are set.

## Commands

See `Docs/System/COMMANDS.md`. Lifecycle: `/plan` `/run` `/close` `/ship`. Action: `/research`
`/design` `/fix` `/task`. Utility: `/log` `/triage` `/status` `/check` `/launch` `/dashboard`
`/handoff`. Meta: `/system`.

- `/run` may commit on the phase branch. Merges require audited close checks.
- `/close` always: active phase → full close; no phase → reduced close (D-021).
- `/handoff` overwrites `Docs/Handoffs/HANDOFF.md` only — no commit/PR/merge.
- `/system` only while no phase is `active`; writes under `Docs/System/`.

## Application boundaries

- `apps/web/` is the learner application. Keep `Docs/System/dashboard` out of its routes and deploy.
- `content/` owns authored curriculum; package schemas own executable contracts.
- Never expose secrets, learner text, provider payloads, or internal work registries in public output.

## Git and runtime

- `origin/main` is the sole durable branch.
- Preserve items listed in `Docs/PRESERVE.md` (including Lexicon stash).
- `/launch` and `/dashboard` clear their own stale servers; `/close` verifies phase-owned servers stop.
- Docs home (D-020): `.worktrees/docs` via `npm run work:docs-home` — write `Docs/`, `.work/`,
  `AGENTS.md`, `CLAUDE.md`, `.claude/skills/**` only there when the home exists.
- Non-phase product code (D-025): `task/*` / `fix/*` worktrees; not `docs/ssot`.
