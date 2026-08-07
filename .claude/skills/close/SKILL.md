---
name: close
description: End a session by publishing through audited main — full phase close, or reduced close when no phase is active. Use when the operator says /close.
---

# /close

**Dispatcher.** Same verb always. Branch on whether a phase is `active`.

**Docs home (D-020):** Close journal, phase `state`, handoff, `WORK.yaml`, System docs → write on
`.worktrees/docs` when present; refresh via `npm run work:docs-home` after merge.
**Never delete** the Docs home worktree.

**Desks (D-025):** Product code lives on `task/*` / `fix/*` (or `phase/*`). Meta lives on Docs
home. Publish **every dirty desk** that belongs to this session — do not merge product and leave
ledger/System dirty on Docs home (or the reverse).

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
6. **Publish** — dual desk when needed (D-020/D-025):
   - **Code:** PR from `phase/*` worktree → merge exact head.
   - **Meta:** Docs-home schedule/spec/System/WORK/activity → audited path to `main`
     (usually `close/*` cut from Docs home if not already on `main`).
   - Servers stopped, orphans cleaned; every **started** CI check green (`ci-policy.md`).
7. Helpers (Bugbot / security-review / code-review) advise only — this command owns PASS/WARN/FAIL.
8. Merge exact head(s) → fetch/prune → delete **contained** phase/task/fix worktrees (not Docs
   home) → clean `main` → `npm run work:docs-home` → handoff + journal.
9. Report SHA/PR, audits, triage, next command.

`--cancel` → `canceled`, no merge. `--dry-run` → steps 2–6 only; findings → `WORK.yaml`.

## B. No active phase → reduced close

Use when the operator says `/close` outside a phase (task/fix/research/meta session). Follow
`Docs/System/protocols/reduced-close.md` **as this command** — do not tell the operator to run a
different ritual.

0. **Inventory desks (D-025)** — classify dirty trees for this session:
   - Product: `task/*` / `fix/*` (or other short-lived code branch)
   - Meta: Docs home (`docs/ssot`) — System/Docs/WORK/skills/activity
   - Ignore unrelated dirty trees; confirm with founder if ambiguous
1. **`/check`** (path-aware across desks being published) — FAIL blocks.
2. **Proof (reduced)** — outcome demonstrated; Adv not required; path lenses if applicable.
3. **Scope (reduced)** — path→spec; MCOO FAIL list; unspecified = WARN.
4. **Publish (reduced)** — for **each** session desk (see protocol):
   - Product → PR from that branch → merge → delete that worktree
   - Meta → short-lived `close/*` from Docs home (do not treat permanent `docs/ssot` as disposable;
     never delete Docs home) → merge → refresh Docs home to `main`
   - Started CI green on every PR; clean `main`; brief handoff + activity `type: close`
5. Report SHA/PR(s) + next command.

If there is nothing to publish (clean desks, no open PR): say so; offer `/handoff` only.

**May invoke:** `/triage` (phase path only), `/check`, `/audit`, Bugbot/security/code-review helpers.  
**Must not:** skip `/check`; treat `/audit` as a second merge gate; refuse `/close` merely because
no phase is active (use path B); delete Docs home; publish only one desk when both are dirty for
this session.
