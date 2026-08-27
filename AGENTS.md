# AIdioma agent rules

This repo is the **AIdioma learner product**. Ship learner behavior in `apps/web/`,
`packages/`, and `content/`.

Development coordination is repository-native and files-first. `Docs/WORK.yaml` is the live,
manually authored backlog; `Docs/NOW.md` is a short session pointer; canonical specs, phases, and
target contracts own durable intent and proof. Repository mutation hooks must remain empty.

## Start here

1. Read this file, `Docs/AGENTS.md`, `Docs/WORK.yaml`, and `Docs/NOW.md` when present.
2. Use authored docs: `Docs/PRODUCT.md`, `Docs/DECISIONS.md`, specs, roadmap phases.
3. Treat `Docs.2/` as frozen. Never dual-write living state there.
4. Use `Docs/Development/` for workflow templates and `Docs/COMMANDS-OVERVIEW.md` for native command
   routing. Do not create a parallel work database or generated docs projection.
5. Run `npm run docs:check` after changing development metadata, plus the product checks warranted
   by the implementation.

Development work follows `Docs/Development/DELIVERY.md`: one complete learner journey at a time,
product choices before code, real-path acceptance before close, and no audit-driven scope expansion.
Close confirms work that already passed acceptance; it is not an implementation phase.

**Living product authority.** Founder chat is not a contract (D-029). A learner-visible
rule exists only after it is written in `Docs/PRODUCT.md` and, when it chooses among
alternatives, `Docs/DECISIONS.md`. Enforceable content or runtime rules also need a
validator or test. Do not reinterpret PRODUCT to fit a phase proof. Schema leftovers
(multiple-choice, flashcards, click-to-compose) stay unpublished unless a decision
reopens D-017. `Docs/Audits/` findings become work only when a phase or target triages
them; do not silently drop them.

Roadmap indexes summarize sequence; they do not override canonical phase files. Target JSON,
authored phase files, the live work register, and optional NOW pointers own current work/state.

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

- `/log` — add open work to `Docs/WORK.yaml`
- `/task` or `/fix` — activate a register entry, create its target authority, and complete it
- `/spec` — create or amend a feature or area contract
- `/phase-spec` — create or amend one canonical phase plus its target contract
- `/decision` / `/research` — retain product choices and the evidence behind them
- `/status` — report current work without changing it
- `/check` — run proof and record binding results in the target evidence report
- `/handoff` — update `Docs/NOW.md` for the next session
- `/close` — candidate-pinned checks + independent adversarial audits; dispatches roadmap phases to the full release path
- `/phase-close` — close, commit, publish, merge, deploy, and smoke-check the roadmap phase
- `/release` — append a release record only after verified production publication and smoke proof
- `/plan` / `/run` — plan and coordinate `Docs/Roadmap/Phases/`; delegate coding by area to
  in-session sub-agents

At the start of every roadmap phase, triage every open `Docs/WORK.yaml` entry whose `phase`,
feature, area, or context paths overlap the phase. Claim relevant entries by setting `status: active`
and the phase ID; leave unrelated entries open. A phase may not close with a relevant untriaged or
still-active entry: finish it, route it to a named future phase with a reason, or ask the founder.

Plain English works everywhere. Cursor/Claude can use the slash forms; Codex can use the matching
skill name or plain English.

Close gates are defined in `Docs/CLOSE.md`. Required audit sub-agents run inside this session; do
not start a separate runner.
