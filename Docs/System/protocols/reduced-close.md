---
schema_version: 3
updated: 2026-08-07
---

# Reduced close (`/close` with no active phase)

Invoked by **`/close`** when no phase is `active` (task/fix/research sessions). Same operator
verb as phase close. Full phase close stays in `system.md` §10 / close skill path A.

## Order

1. **`/check`** (path-aware) — FAIL blocks publish  
2. **Proof** (reduced)  
3. **Scope** (reduced)  
4. **Publish** (reduced)

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
| Branch | Contained short-lived branch; not dirty `main` |
| Servers | No orphan phase-owned servers from this work |
| CI | Every **started** check green (`ci-policy.md`) |
| Merge | Audited main — same invariant as `/close`, smaller ritual |

## Must not

- Skip `/check`
- Treat `/audit` as a second merge gate
- Expand into phase-sized scope (stop → `/log` `proposal` or `/plan`)
