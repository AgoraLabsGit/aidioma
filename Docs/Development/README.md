# AIdioma development workflow

This folder contains the templates for AIdioma's repository-native, files-first development
workflow. There is no external work database or generated projection.

## Sources of truth

| Need | File |
|---|---|
| Unscheduled tasks, fixes, proposals, questions, and research | `Docs/WORK.yaml` |
| Current-session focus and handoff | `Docs/NOW.md` |
| Product promise | `Docs/PRODUCT.md` |
| Product choices | `Docs/DECISIONS.md` |
| Feature and area behavior | `Docs/Specs/` |
| Roadmap outcomes | `Docs/Roadmap/Phases/` |
| Per-task, per-fix, and per-phase proof contract | `Docs/Evidence/<target>/target.json` |
| Learner-journey delivery and code-ownership rules | `Docs/Development/DELIVERY.md` |
| Close and release gates | `Docs/CLOSE.md` |

`WORK.yaml` is the backlog. `NOW.md` is a short-lived pointer, never a second backlog. A task or
fix that starts gets a target contract. A phase gets one canonical phase file and one target
contract. Specs describe durable product behavior; they are not task lists.

Before planning or running a learner-visible phase, apply `DELIVERY.md`. If the proposed outcome
contains several primary journeys or unresolved choices, split it before implementation.

## Quick commands

Agents can use the native slash commands documented in `Docs/COMMANDS-OVERVIEW.md`. The same basic
file operations are available from the terminal:

```bash
npm run docs:work -- log task "Short task summary"
npm run docs:work -- log fix "Short defect summary"
npm run docs:work -- spec feature SPEC-F-NAME "Feature title" --path "apps/web/src/**"
npm run docs:work -- phase PHASE-010 "Outcome title" --outcome "Observable outcome" --proof "How it will be proven"
npm run docs:check
```

The scaffolder refuses duplicate IDs and existing output paths. Review generated files before
implementation, replace placeholder proof/scopes with the real contract, and run `npm run
docs:check` before handoff or close.
