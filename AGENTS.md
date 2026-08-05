# AIdioma agent rules

Use these rules for every repository session. Repository files are memory; never assume prior chat
context.

## Start here

1. Read this file completely and the reusable AIdioma development skill.
2. Living docs root is `Docs/`. Read `Docs/INDEX.md`, `Docs/Roadmap/Roadmap.md`,
   `Docs/Handoffs/HANDOFF.md`, `Docs/System/development-system-v2.md`, and
   `Docs/System/COMMANDS.md`.
3. Treat `Docs.2/` as frozen evidence only. Never mix living `Docs/` with `Docs.2/` as dual authority.
4. Inspect Git status, branch/worktrees (exactly one phase branch/worktree when a phase is active),
   the active phase spec, and relevant executable behavior before acting.
5. `apps/web/`, packages, `content/`, migrations, and tests prove product behavior.

## Development System V2

- One bounded phase at a time (`design` or `implementation`; optional subtypes).
- `Docs/Roadmap/Roadmap.md` is the schedule SSOT. Phase specs own contracts. Backlog is unscheduled
  candidates only.
- **MCOO:** never onboard more complexity than the phase needs; excess complexity can cut scope.
- Proof-first for implementation: one real path, composition/seams review, keep/revise/remove.
- ≤3 consequential founder decisions per checkpoint. Silence is not approval.
- Sub-agents only for bounded questions; coordinator synthesizes; Mike decides.

## Commands

- `/plan` — onboard a new phase onto the Roadmap (draft phase spec, `proposed`/`ready`). No product
  code. Not the old multi-doc design ritual.
- `/run` — start or resume the single `active` phase. Execute the whole phase outcome. May commit on
  the phase branch. Stop for founder gates or contract breaks.
- `/fix` — bounded defect with regression proof. Systemic work → `/plan`.
- `/status` — read-only Roadmap, phase, Git, runtime, next command.
- `/handoff` — end a session inside an active phase; overwrite `Docs/Handoffs/HANDOFF.md`; **no**
  commit/PR/merge.
- `/close` — end the phase: close audits → commit/PR/merge exact head → one clean `origin/main` +
  local main. Human UI review when testable. Stop stale app/dashboard servers. Does not authorize
  production data/config work or unrelated diff expansion.
- `/launch` — stop stale learner-app dev servers, then `npm run app:dev`.
- `/dashboard` — stop stale work-dashboard servers, then `npm run work:dashboard`.
- `/feat` — **removed**; use `/run`.

## Close audits (implementation)

Always (3): Close Steward (MCOO, scope, SSOT, code-quality smells), Evidence Auditor, Publish
Guardian. Up to 2 conditional: Learner-Surface (UI/a11y/privacy), Contract/Seams (schemas/APIs/
shared packages/AI-boundary). FAIL blocks merge; WARN needs Mike ack.

Design close: Steward + Publish + Decision Auditor; FAIL if product code shipped.

## File ownership

- `Docs/System/` — process contracts, `COMMANDS.md`, `Templates/`
- `Docs/Roadmap/` — schedule, phases, backlog
- `Docs/Handoffs/HANDOFF.md` — sole handoff file (lean; overwrite)
- `Docs/Specs/` — capability contracts when earned
- `Docs/FIXES.yaml` — bounded fixes when present
- `Docs/PRODUCT.md` — durable product principles when approved
- `Docs.2/` — frozen pre-V2 evidence

Do not create parallel roadmaps, numbered handoffs, ADR/research archives, or a second living work
registry beside the Roadmap.

## Application boundaries

- `apps/web/` is the learner application. Keep internal tooling (including the work dashboard) out of
  its routes, imports, and deployment output.
- `content/` owns authored curriculum; package schemas own executable contracts.
- Search the canonical component/token library before adding UI.
- Never expose secrets, learner text, provider payloads, or internal work registries in public output.

## Git and runtime

- `origin/main` is the sole durable branch.
- One short-lived phase branch and one worktree while a phase is open.
- Preserve unrelated changes (including dirty Lexicon work). Never force-push or destructively reset.
- `/run` may commit on the phase branch; only `/close` merges to main.
- `/launch` and `/dashboard` must clear their own stale servers before starting; `/close` verifies
  phase-owned servers are stopped.
