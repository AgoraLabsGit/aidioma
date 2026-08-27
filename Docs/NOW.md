# NOW — session handoff

**Date:** 2026-08-27
**Repo:** AIdioma learner product

Read `AGENTS.md`, `Docs/AGENTS.md`, and `Docs/WORK.yaml` first. This file is only a short pointer;
durable intent and proof stay in canonical phase, spec, decision, target, and evidence files.

## Current pointers

- **F-006 — Native development workflow:** implementation is complete and is being closed and
  published from `Docs/Evidence/f-native-development-workflow/target.json`.
- **PHASE-004:** closed. Authority: `Docs/Roadmap/Phases/PHASE-004.md`; retained evidence:
  `Docs/Evidence/phase-004/`.
- **PHASE-005:** remains active in its existing working tree. Authority:
  `Docs/Roadmap/Phases/PHASE-005.md`. Do not mix its learner implementation into F-006.
- **PHASE-006:** proposed and must not start before PHASE-005 closes. Authority:
  `Docs/Roadmap/Phases/PHASE-006.md`.

## Operating rules

- Use the native commands in `Docs/COMMANDS-OVERVIEW.md` and templates in `Docs/Development/`.
- `Docs/WORK.yaml` is the only backlog. Add only short session pointers here.
- Run `npm run docs:check` after development-metadata changes.
- `/close` produces a verified local receipt unless publication was separately requested.
- `/phase-close` includes receipt publication, merge, deployment, and production smoke proof.
- Phase `/run` agents coordinate work by area and retain the parent session for integration.

## Next session

Keep PHASE-005 work isolated until F-006 is merged. Then refresh `main` without discarding that
working tree and continue from the PHASE-005 authority.
