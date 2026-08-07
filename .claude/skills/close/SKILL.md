---
name: close
description: Close the active AIdioma phase with audits, publish through protected main, clean refs, and write the next kickoff. Use when the operator says /close.
---

# /close

1. Read `AGENTS.md`, active phase spec, and handoff.
2. Confirm close scope with Mike when the worktree contains unrelated dirty work (e.g. Lexicon).
   Do not expand the diff silently.
3. **Close hygiene — phase Work triage (before any audit/review/test):**
   - Run `/triage PHASE-nnn` for the phase being closed.
   - **Spawn a sub-agent** that only loads open/active Work with `phase: <this phase>`.
   - Clear or resolve do-now rows; confirm drop/plan leftovers with founder.
   - Do **not** start Proof/Scope/Publish, Bugbot, security review, or `/check` until this pass finishes (or reports empty/blocked with founder ack).
4. Run the phase close-audit set (design or build). FAIL blocks merge; WARN needs Mike ack.
   May invoke Cursor `review-bugbot`, `review-security`, and/or `code-review` as audit helpers;
   they advise only—this command still owns publish gates.
5. Stop stale `/launch` and `/dashboard` servers owned by this work.
6. Reconcile Roadmap/phase status, SSOT, and overwrite `Docs/Handoffs/HANDOFF.md`.
7. `/close` authorizes commit of the reviewed scope, PR, and merge of that exact unchanged head after
   checks. Run local gates for the diff first. On the PR: wait until every **started** check is green
   (`merge-gate` is always required; app/content/work run only when their paths change—do not merge
   if a started suite failed or is still pending). See `Docs/System/ci-policy.md`. It does not
   authorize production data/config changes.
8. Fetch/prune; delete only refs/worktrees proven contained in `origin/main`. Return to clean local
   `main` matching `origin/main`.
9. Report SHA/PR, audits, preserved work, triage result, and next command.
