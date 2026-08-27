---
name: task
description: Start and complete one task through AIdioma's native files-first workflow.
---

# /task

1. Add or reuse one `kind: task` entry in `Docs/WORK.yaml`; set it `active`. Use `npm run
   docs:work -- log task "<summary>"` when allocating a new ID.
2. Create one `Docs/Evidence/<target>/target.json` authority with version, id, kind `task`, evidence
   directory, observable outcome, proof list, non-goals, integer risk tier 0–3, required lenses in canonical gate order,
   exact ordered check command argv arrays, check environment-name allowlist, bounded check timeout,
   and exact scoped paths. Include that target
   file in its own scopes. Add only a status pointer to `Docs/NOW.md`, creating the local handoff if
   absent; never duplicate the target contract there.
3. Do it in the repository paths that own the outcome. Product tasks usually use `apps/web/`,
   `packages/`, or `content/`; process/documentation tasks use the relevant authored files.
4. Run the target proof. On completion set the register entry to `done`, add `done_summary` and the
   material `context_paths`, and update the NOW pointer. Use `npm run docs:check` for metadata changes.
