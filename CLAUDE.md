# AIdioma agent entry point

Read and follow `AGENTS.md`. This repo is the AIdioma learner product.

The development workflow is repository-native. Read `Docs/COMMANDS-OVERVIEW.md`, use
`Docs/Development/` templates, keep `Docs/WORK.yaml` live, and run `npm run docs:check` after
metadata changes. Repository mutation hooks remain empty.

Phase `/run` agents coordinate and delegate coding to in-session sub-agents; they do not implement
the phase themselves. Follow `.claude/skills/run/SKILL.md`.

For close, follow `Docs/CLOSE.md` and the repository close skill. Independent audit sub-agents are
part of this session; they do not authorize another runner or publication.
