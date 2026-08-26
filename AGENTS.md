# AIdioma agent rules

This repo is the **AIdioma learner product**. Ship learner behavior in `apps/web/`,
`packages/`, and `content/`.

**Praxis is parked.** Do not run `npx praxis`, host hooks, workbench, or sqlite
commands. Do not claim, gate, close, or publish Work. `.praxis/` and generated
`Docs/WORK.yaml` are frozen evidence only.

Praxis **product** work belongs in the sibling `Praxis.v2` repo. Never mix it here.

## Start here

1. Read this file, `Docs/AGENTS.md`, and the local `Docs/NOW.md` when present.
2. Use authored docs: `Docs/PRODUCT.md`, `Docs/DECISIONS.md`, specs, roadmap phases.
3. Treat `Docs.2/` as frozen. Never dual-write living state there.
4. Treat `Docs/System/` as unchanged historical Praxis-era evidence except for the live
   `Docs/System/Templates/phase.md`. Never edit or follow its old commands, protocols, CI, derive,
   or dashboard; living authority in this file and `Docs/CLOSE.md` supersedes historical metadata.
5. Edit files and prove behavior with tests / the running app.

Workflow/state passages in `Docs/Roadmap/MVP-SEQUENCE.md`, `Docs/Roadmap/Roadmap.md`, and
`Docs/Roadmap/Backlog.md` that name Praxis, sqlite, `Docs/WORK.yaml`, or obsolete “next phase” state
are pre-parking metadata and are not authority. Use those files only for current learner sequence
and backlog content; target JSON, authored phase files, and optional local NOW pointers own current
work/state. Do not revive or follow their old workflow instructions.

## Runtime providers (D-024)

Use real Clerk, Neon, and AI Gateway as soon as a learner path writes, resumes, or grades.
In-memory, keyless, and synthetic-learner paths are tests or explicit local opt-in only.

1. Neon: `npx neonctl`. Default `AIDIOMA_DB_TARGET=development`. Apply SQL in
   `apps/web/drizzle/`; do not use `drizzle-kit push`.
2. AI Gateway: `EVALUATION_AI_GATEWAY_API_KEY`, never ambient OIDC.
3. Clerk: `user-clerk` MCP. Keys live in `apps/web/.env.local`.
4. If a required variable is missing, stop and ask the founder. Do not invent keys.

## Commands

Plain English is enough. Optional verbs:

- `/task` or `/fix` — create a per-target authority, add a local NOW pointer, then do the work here
- `/log` — park a note in `Docs/NOW.md`
- `/check` — run proof and record binding results in the target evidence report
- `/handoff` — update `Docs/NOW.md` for the next session
- `/close` — candidate-pinned checks + independent adversarial audits; dispatches roadmap phases to the full release path
- `/phase-close` — close, commit, publish, merge, deploy, and smoke-check the roadmap phase
- `/plan` / `/run` — follow `Docs/Roadmap/Phases/` as coordinator; delegate coding by area to in-session sub-agents; no Praxis phase machine

Invocation is host-specific: plain English works everywhere; Cursor/Claude may use `/close`; Codex
may use `$close` or plain English.

Close gates are defined in `Docs/CLOSE.md`. Multi-agent audit sub-agents are required there and run
inside this session. Do not start a separate Cursor, Codex, Claude, or Praxis runner.
