---
name: close
description: Close the active AIdioma phase with audits, publish through protected main, clean refs, and write the next kickoff. Use when the operator says /close.
---

# /close

1. Read `AGENTS.md`, `Docs/System/development-system-v2.md`, active phase spec, and handoff.
2. Confirm close scope with Mike when the worktree contains unrelated dirty work (e.g. Lexicon).
   Do not expand the diff silently.
3. Run the phase close-audit set (design or build). FAIL blocks merge; WARN needs Mike ack.
   May invoke Cursor `review-bugbot`, `review-security`, and/or `code-review` as audit helpers;
   they advise only—this command still owns publish gates.
4. Stop stale `/launch` and `/dashboard` servers owned by this work.
5. Reconcile Roadmap/phase status, SSOT, and overwrite `Docs/Handoffs/HANDOFF.md`.
6. `/close` authorizes commit of the reviewed scope, PR, and merge of that exact unchanged head after
   checks. Run local gates for the diff first. On the PR: wait until every **started** check is green
   (`merge-gate` is always required; app/content/work run only when their paths change—do not merge
   if a started suite failed or is still pending). See `Docs/System/ci-policy.md`. It does not
   authorize production data/config changes.
7. Fetch/prune; delete only refs/worktrees proven contained in `origin/main`. Return to clean local
   `main` matching `origin/main`.
8. Report SHA/PR, audits, preserved work, and next command.
