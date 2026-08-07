---
name: audit
description: Run a scoped review of a feature, area, spec, agent-context, or process; record Work kind audit + done_summary. Use when the operator says /audit.
---

# /audit

Scoped review — **not** the `/close` merge gate.

1. Upsert `WORK.yaml` `kind: audit`, `status: active` (ids: `A-nnn`).
2. Ask once if needed: best lens? Offer: Proof · Scope · Publish · Adv claims · MCOO · seams · security · agent-context · classifier/routing · schema drift.
3. Clarifications → `open_questions` on this row.
4. Run review (sub-agent OK). Findings → `done_summary`.
5. `status: done`. Activity `type: audit`. Report id.

**May invoke:** review sub-agent.  
**Must not:** merge to main; replace `/close`; write application code unless founder asked for fixes (then `/fix`/`/task`).
