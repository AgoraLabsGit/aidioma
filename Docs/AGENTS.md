# Agent contract (AIdioma project)

Read `../AGENTS.md` first. Day-to-day authority is authored files: per-target records under
`Docs/Evidence/`, `Docs/PRODUCT.md`, `Docs/DECISIONS.md`, specs, and roadmap phases. `Docs/NOW.md`
is an optional local status/handoff index, not target authority.

Do not boot Praxis. Do not treat `.praxis/state.sqlite` or `Docs/WORK.yaml` as
live writers.

`Docs/System/` is unchanged historical evidence except for `Templates/phase.md`. Never edit or
follow its command, close, publish, CI, protocol, derive, or dashboard files; current higher-level
authority in `AGENTS.md` and `Docs/CLOSE.md` supersedes their historical metadata.

The root contract also supersedes stale Praxis/sqlite/WORK workflow or old phase-state passages in
the three living roadmap indexes it names. Their learner-sequence/backlog content remains usable;
their old workflow metadata does not.

Runtime providers live in `SPEC-A-PLATFORM` (D-024). Use `npx neonctl` and the
Vercel CLI. Ask the founder only for secrets those tools cannot supply.

Phase `/run` agents are coordinators. They preserve their context window and delegate coding by
area of concern to in-session sub-agents. They do not implement the phase themselves or start a
second runner. Follow `.claude/skills/run/SKILL.md`.

Close behavior lives in `Docs/CLOSE.md`: pin one dirty-tree candidate, run deterministic proof,
then use independent lens-specific audit sub-agents. Retain every result before remediation. An
ordinary item close is local unless the founder requests `/publish`; an explicit roadmap phase close
includes publication of the verified receipt, PR merge, production deployment, and smoke proof.
