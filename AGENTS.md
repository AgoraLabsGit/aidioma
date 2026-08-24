# AIdioma agent rules

This repo is the **AIdioma learner product** and has its own Praxis project ledger.

Praxis **product** development lives in its sibling repository. Never place Praxis product
work in AIdioma's ledger.

## Start here

1. Read this file and `Docs/AGENTS.md`.
2. Run `npx praxis status --json` and follow its `nextAction` before governed work.
   After installing or repairing host hooks, reload that host before relying on its live status.
3. Treat `.praxis/state.sqlite` as the sole authority for Praxis Work, phases, checks, and
   generated projections. Use Praxis commands; do not hand-edit projected ledger state.
4. Treat existing V1 `Docs/WORK.yaml`, roadmap phase files, and derived dashboard files as
   migration evidence until their approved content has been selectively reseeded.
5. `Docs/PRODUCT.md` and `Docs/DECISIONS.md` remain authored product context.
6. Treat `Docs.2/` as frozen evidence only. Never dual-write living state there.
7. `apps/web/`, packages, and `content/` prove learner product behavior.

## Dual Praxis projects

| Project | Repo | Data |
|---|---|---|
| AIdioma | this repo | Learner specs, AIdioma Work/phases/research |
| Praxis dev | sibling Praxis repository | Praxis product specs, Praxis Work/phases/research |

Do not mix project ledgers. In AIdioma, use the Praxis sidebar or `npx praxis ...`; do not
use the V1 `work:dashboard` as the current authority.

## Commands

The generated command registry below is authoritative. V1 command documentation under
`Docs/System/` is retained only as migration evidence until it is archived.

<!-- praxis:canonical-commands:start -->
## Praxis canonical commands (registry v6)

Load Praxis skills from `.agents/skills/`. These files are generated from the typed Praxis command registry; do not copy or redefine their command semantics.
Codex does not accept Cursor slash commands. Type `$task` or ask in plain English. Never type `/task` — Codex will reject it as unrecognized.
If you are already in this host session, do the work here after creating the Work item. Do not start the Cursor agent runner.
Before a governed mutation, run `praxis status --json` and follow the returned next action. Mutation-hook health is authoritative only through `praxis hooks status --json`.

- `$plan` → `/plan` — Work placed as a task, phase, or active-phase work
- `$run` → `/run` — The one active phase is prepared for its governed runner
- `$task` → `/task` — Work item created and claimed
- `$fix` → `/fix` — Fix Work item created and claimed
- `$log` → `/log` — Work item parked for later
- `$check` → `/check` — Check receipt recorded
- `$handoff` → `/handoff` — Handoff stored and projected
- `$close` → `/close` — Local Work close recorded with proof
- `$publish` → `praxis publish execute` — A confirmed exact-head publication enters the canonical receipt chain
<!-- praxis:canonical-commands:end -->
