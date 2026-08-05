---
schema_version: 1
updated: 2026-08-05
---

# Development System V2 — commands

Authoritative command list for agents and the dashboard command key. Process details live in
`development-system-v2.md`.

| Cmd | When | Does | Must not |
|---|---|---|---|
| `/plan` | New work not on Roadmap | Draft phase spec; add to Roadmap as `proposed`/`ready` | Product code; old multi-doc design ritual |
| `/run` | Start/resume the one `active` phase | Execute the whole phase outcome; may commit on phase branch | Merge to `main` |
| `/fix` | Bounded defect | Reproduce → patch → prove | Stretch into new product design |
| `/status` | Anytime | Read-only Roadmap/phase/Git/runtime + next command | Change files |
| `/handoff` | Mid-phase session end | Overwrite `Docs/Handoffs/HANDOFF.md` | Commit / PR / merge |
| `/close` | Phase complete | Audits → commit/PR/merge → clean `main`; stop stale servers | Prod data/config; silent scope expansion |
| `/launch` | View learner app | Stop stale app servers; `npm run app:dev` | Deploy / prod |
| `/dashboard` | View work dashboard | Stop stale dashboard servers; `npm run work:dashboard` | Run in production |
| `/feat` | — | **Removed** → use `/run` | — |

## Git rule

`/run` may commit on the phase branch. Only `/close` merges to `origin/main`.

## Runtime hygiene

`/launch` and `/dashboard` clear their own stale servers before start. `/close` verifies phase-owned
servers are stopped.
