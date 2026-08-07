---
name: close
description: End a session by publishing through audited main — full phase close, or reduced close when no phase is active. Use when the operator says /close.
---

# /close

**Dispatcher.** Same verb always. Branch on whether a phase is `active`.

**Docs home (D-020):** Close journal, phase `state`, handoff, `WORK.yaml`, System docs → write on
`.worktrees/docs` when present; refresh via `npm run work:docs-home` after merge.

## A. Active phase → full phase close

1. Read `AGENTS.md`, active phase, handoff. Confirm scope if unrelated dirty work.
2. **Phase `/triage`** (sub-agent; this phase only) — before audits/tests.
3. **`/check`** (path-aware) — FAIL blocks close.
4. **Proof** — outcome evidence; **Required Adv** on phase claims via
   `Docs/System/protocols/adv-protocol.md`; path-triggered lenses per
   `Docs/System/protocols/path-lens-map.md`. Required Adv + path lenses: prefer dedicated
   sub-agents; this command owns PASS/WARN/FAIL and merge.
5. **Scope** — path→spec; **MCOO** via `Docs/System/protocols/mcoo-checklist.md`;
   seams/composability (build); code quality if code in diff. Design: no product-code change.
   On FAIL: May invoke `/run` (cut), `/design`, `/research` with founder confirm — do not merge.
6. **Publish** — PR contained, servers stopped, orphans cleaned; every **started** CI check
   green (`ci-policy.md`).
7. Helpers (Bugbot / security-review / code-review) advise only — this command owns PASS/WARN/FAIL.
8. Merge exact head → fetch/prune → delete contained worktrees → clean `main` → handoff + journal.
9. Report SHA/PR, audits, triage, next command.

`--cancel` → `canceled`, no merge. `--dry-run` → steps 2–6 only; findings → `WORK.yaml`.

## B. No active phase → reduced close

Use when the operator says `/close` outside a phase (task/fix/research session, short-lived
branch). Follow `Docs/System/protocols/reduced-close.md` **as this command** — do not tell the
operator to run a different ritual.

1. Confirm branch is the session work branch (not dirty `main` with unrelated mess).
2. **`/check`** (path-aware) — FAIL blocks.
3. **Proof (reduced)** — outcome demonstrated; Adv not required; path lenses if applicable.
4. **Scope (reduced)** — path→spec; MCOO FAIL list; unspecified = WARN.
5. **Publish (reduced)** — PR open/up to date; started CI green; merge → fetch/prune → delete
   session worktree if any → clean `main` → brief handoff + activity `type: close`.
6. Report SHA/PR + next command.

If there is nothing to publish (clean `main`, no open PR): say so; offer `/handoff` only.

**May invoke:** `/triage` (phase path only), `/check`, `/audit`, Bugbot/security/code-review helpers.  
**Must not:** skip `/check`; treat `/audit` as a second merge gate; refuse `/close` merely because
no phase is active (use path B).
