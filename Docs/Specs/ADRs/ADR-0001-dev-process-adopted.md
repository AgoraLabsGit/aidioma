---
title: ADR-0001 — Docs-as-memory dev process adopted
type: adr
status: accepted
updated: 2026-07-23
---

# ADR-0001 — Docs-as-memory dev process adopted

> Historical decision record. The 2026-08-03 documentation reset retained the useful validation and
> repository-hygiene rules while archiving the roadmap/wave control files. Current onboarding begins
> at `Docs/INDEX.md` and the latest handoff.

**Decision:** This project runs the wave/slice dev process defined in `Docs/PROCESS.md`
(imported from the Praxis project's process kit, `Docs/Archive/Operations/PROCESS-KIT.md`). The former
ROADMAP was the plan
SSOT; no work is "done" without gates + audit + on-screen proof; nothing is pushed without
operator GO.

**Context:** Solo non-technical operator (Mike) + AI agent build, with Mike running parallel
agent sessions. The process externalizes application design and project memory into `Docs/`,
with links to executable contracts and content artifacts, so any fresh session is operational
after reading STATE + INDEX.

**Two-lane adaptation:** unlike the single-lane kit, AIdioma runs two parallel lanes under one
roadmap — **Lane A (App)** and **Lane C (Content)** — each with its own active wave and its own
`verify:` gate set. The content lane keeps `content/SESSION-LOG.md` and
`content/review/REVIEW-LOG.md` as working memory; Docs tracks roadmap status and owns schema
rulings in `Docs/Registers/schema-proposals.md`. The App Design Coordinator retains final
approval over the v1-FROZEN, additive-only lesson schema.
