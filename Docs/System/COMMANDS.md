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
| `/system` | Evolve the dev system | Onboard/revise commands, System files/folders, process best practices | Product code; silent sprawl; skip founder wording review |
| `/feat` | — | **Removed** → use `/run` | — |

## Cursor skills

Helpers only (advise; do not replace commands). See `development-system-v2.md`: `/close` may use
review-bugbot / review-security / code-review; `/run` may use code-review (and split-to-prs with
Mike’s OK).

## Legacy docs (`Docs.2/`)

Do not preload. After outcome/non-goals are set, a bounded sub-agent may farm relevant slices as
keep/defer/reject evidence only.

## Git rule

`/run` may commit on the phase branch. Only `/close` merges to `origin/main`.

## Runtime hygiene

`/launch` and `/dashboard` clear their own stale servers before start. `/close` verifies phase-owned
servers are stopped.
