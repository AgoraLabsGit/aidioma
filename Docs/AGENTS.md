# Agent contract (AIdioma project)

Read `../AGENTS.md` first. Day-to-day authority is authored files: per-target records under
`Docs/Evidence/`, `Docs/PRODUCT.md`, `Docs/DECISIONS.md`, specs, and roadmap phases. `Docs/NOW.md`
is an optional local status/handoff index, not target authority. Founder chat is not a
contract until those files and, when enforceable, a validator or test say so (D-029).

`Docs/WORK.yaml` is the live manually authored backlog. `Docs/NOW.md` is a short session handoff,
not a second backlog. Templates live in `Docs/Development/`; `npm run docs:check` validates the
register, specs, phases, target contracts, command mirrors, and empty mutation hooks.

`Docs/Development/DELIVERY.md` is the implementation operating contract. A phase owns one primary
learner journey, proves it before close, and routes adjacent improvements to named future work.
Close may verify or reject that journey; it may not grow it into a broader feature program.

Runtime providers live in `SPEC-A-PLATFORM` (D-024). Use `npx neonctl` and the
Vercel CLI. Ask the founder only for secrets those tools cannot supply.

Phase `/run` agents are coordinators. They preserve their context window and delegate coding by
area of concern to in-session sub-agents. Before decomposition, they triage every relevant open
`Docs/WORK.yaml` entry and claim it into the phase or retain a concrete future-phase reason. Follow
`.claude/skills/run/SKILL.md`.

Close behavior lives in `Docs/CLOSE.md`: pin one dirty-tree candidate, run deterministic proof,
then use independent lens-specific audit sub-agents. Retain every result before remediation. An
ordinary item close is local unless the founder requests `/publish`; an explicit roadmap phase close
includes publication of the verified receipt, PR merge, production deployment, and smoke proof.
