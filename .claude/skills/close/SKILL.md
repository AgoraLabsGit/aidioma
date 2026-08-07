---
name: close
description: Close the active phase with audits, publish through protected main, clean refs, and write the next kickoff. Use when the operator says /close.
---

# /close

1. Read `AGENTS.md`, active phase, handoff. Confirm scope if unrelated dirty work.
2. **Phase `/triage`** (sub-agent; this phase only) — before audits/tests.
3. **`/check`** (path-aware) — FAIL blocks close.
4. **Proof** — outcome evidence; **Required Adv** on phase claims via `Docs/System/adv-protocol.md`; path-triggered lenses per `Docs/System/path-lens-map.md`.
5. **Scope** — path→spec; **MCOO** via `Docs/System/mcoo-checklist.md` (binding FAIL list); seams/composability (build); code quality if code in diff. Design: no product-code change.
   On FAIL: May invoke `/run` (cut), `/design`, `/research` with founder confirm — do not merge.
6. **Publish** — PR contained, servers stopped, orphans cleaned; every **started** CI check green (`ci-policy.md`).
7. Helpers (Bugbot / security-review / code-review) advise only — this command owns PASS/WARN/FAIL.
8. Merge exact head → fetch/prune → delete contained worktrees → clean `main` → handoff + journal.
9. Report SHA/PR, audits, triage, next command.

`--dry-run`: steps 2–6 only; findings → `WORK.yaml`.

**May invoke:** `/triage`, `/check`, `/audit`, Bugbot/security/code-review helpers.  
**Must not:** skip triage or `/check`; treat `/audit` as a second merge gate.
