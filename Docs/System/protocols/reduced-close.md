---
schema_version: 3
updated: 2026-08-07
---

# Reduced close (`/close` with no active phase)

Invoked by **`/close`** when no phase is `active` (task/fix/research/meta sessions). Same
operator verb as phase close. Full phase close stays in `system.md` §10 / close skill path A.
Aligned with **D-020** (Docs home) and **D-025** (non-phase desks).

## Order

0. **Inventory desks (D-025)**  
1. **`/check`** (path-aware) — FAIL blocks publish  
2. **Proof** (reduced)  
3. **Scope** (reduced)  
4. **Publish** (reduced) — every session desk

## Desk inventory

| Dirty where | Desk | Publish shape |
|---|---|---|
| `task/*` / `fix/*` (product code) | Product | PR that branch → merge → **delete** worktree |
| Docs home only (`docs/ssot`) | Meta | Cut short-lived `close/*` from Docs home → PR → merge → refresh Docs home (`npm run work:docs-home`). **Never delete** Docs home |
| Both | Dual | Publish **both** (product PR + meta `close/*`). Do not leave ledger/System dirty |

- Not dirty `main` with unrelated mess.
- Permanent `docs/ssot` is a **home**, not a disposable session branch — always publish meta via
  contained `close/*` (or equivalent short-lived branch) when Docs home has session diffs.
- Unrelated dirty worktrees: leave alone or confirm with founder.

## Proof (reduced)

| Check | Pass when |
|---|---|
| Outcome / defect | Real path shows the fix or chore; regression if practical |
| Adv | **Not required** for routine `/fix`/`/task` (optional `/audit` if high-risk) |
| Path-triggered lenses | Only if diff matches [`path-lens-map.md`](path-lens-map.md) |

## Scope (reduced)

| Check | Pass when |
|---|---|
| path→spec | Touched product paths map to a SPEC; behavior change ⇒ spec amended |
| MCOO | No unjustified abstraction in the diff (`mcoo-checklist.md` FAIL list) |
| Unspecified paths | WARN only (same as full close) |

## Publish (reduced)

| Check | Pass when |
|---|---|
| Desks | Every session desk from inventory has an audited PR (or honest “nothing to publish”) |
| Branch | Contained short-lived branch per desk (`task/*` / `fix/*` / `close/*`); not dirty `main` |
| Docs home | Survives close; tip refreshed to `main` after meta merge |
| Servers | No orphan session-owned servers from this work |
| CI | Every **started** check green on each PR (`ci-policy.md`) |
| Merge | Audited main — same invariant as `/close`, smaller ritual |

## Must not

- Skip `/check`
- Treat `/audit` as a second merge gate
- Expand into phase-sized scope (stop → `/log` `proposal` or `/plan`)
- Delete the Docs home worktree
- Merge product code and skip dirty Docs-home ledger/System from the same session (or the reverse)
