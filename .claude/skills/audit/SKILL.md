---
name: audit
description: Run a scoped review of a feature, area, spec, agent-context, or process; record Work kind audit + done_summary. Use when the operator says /audit.
---

# /audit

Action. Scoped review — not the `/close` merge gate (Proof/Scope/Publish still own merges).

1. Upsert `WORK.yaml` `kind: audit`, `status: active` (new ids: `A-nnn`). Scope = feature/area/spec/path/process named by user.
2. Ask once if needed: **best audit lens for this scope?** Offer close-related lenses when relevant:
   Proof · Scope · Publish · agent-context size/fit · classifier/routing gaps · schema drift.
3. Record any clarification on the audit row's `open_questions`.
4. Run the review (sub-agent OK). Findings → `done_summary` (concise; link paths).
5. `status: done`. Activity `type: audit`. Report W-id.

Must not: merge to main; replace `/close`; write product/learner code unless the audit scope is that code and founder asked for fixes (then `/fix`/`/task` separately).
