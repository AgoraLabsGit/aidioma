# System changelog

Append only. Every `/system` change adds one line.

| Date | schema_version | Change |
|---|---|---|
| 2026-08-07 | 3 | T-022: Copy ID on Work/Roadmap/Activity; humanize Work kind labels; keep D-/S- |
| 2026-08-07 | 3 | T-021: Work default Age newest-first; Roadmap schedule pins active then Order |
| 2026-08-07 | 3 | T-020: Ship D-024 — `context_paths` schema; Brief/Context/Files UI; skills fill at done |
| 2026-08-07 | 3 | D-024/S-003: Brief vs Context labels; declared context_paths (Adv WARN acked) |
| 2026-08-07 | 3 | D-023: Work = outcomes; Activity page = process spine allowlist (keep both) |
| 2026-08-07 | 3 | F-014: Work detail Context + Files (Phase parity) |
| 2026-08-07 | 3 | F-015: Work kind `design` (`S-nnn`) in schema/Zod |
| 2026-08-07 | 3 | T-019/D-022: Work detail Activity trail; kind `design` (`S-nnn`); Activity page optional |
| 2026-08-07 | 3 | T-018: `/design` skill — activity `design` active flush at start (Activity visibility) |
| 2026-08-07 | 3 | F-013: Detail respects hidden (closed on load); 52px rail gutter |
| 2026-08-07 | 3 | F-012: Fixed 48px detail-rail gutter (no expand/collapse reflow) |
| 2026-08-07 | 3 | T-017: Age/time columns default newest-first on first sort click |
| 2026-08-07 | 3 | T-016: Detail overlays again — no workspace padding reflow |
| 2026-08-07 | 3 | T-015: Detail Close top-right when expanded; larger collapse chevron |
| 2026-08-07 | 3 | A-006: UI audit — shell/tokens solid; table pages not templated; Knowledge/Signals spec drift |
| 2026-08-07 | 3 | F-011: Detail Close when collapsed; chevron flip; workspace offset for rail |
| 2026-08-07 | 3 | T-014: Detail panels drop path byline + duplicate id under title |
| 2026-08-07 | 3 | T-013: Detail panels match Phase layout; collapse top-left; invisible resize gutter |
| 2026-08-07 | 3 | T-012: Remove page/table bylines; shrink Filters count badge |
| 2026-08-07 | 3 | F-010: Activity Feature/Area join Work ledger when `ref` is a Work id |
| 2026-08-07 | 3 | F-009: `run-dashboard` always prefers primary Docs home; missing static → quiet 404 |
| 2026-08-07 | 3 | F-008: Do not persist table search `q` (avoids hiding new Work rows) |
| 2026-08-07 | 3 | F-007: Table column sort toggles asc/desc on repeat click (▴/▾) |
| 2026-08-07 | 3 | F-006: Activity Status syncs to Work ledger when `ref` is a Work id |
| 2026-08-07 | 3 | F-005: Work opened ISO datetime; Age no longer fakes hours from midnight UTC |
| 2026-08-07 | 3 | T-010: dashboard Filters panel (Feature/Area) + Reset on table pages |
| 2026-08-07 | 3 | A-003/A-004/T-008/T-009: Work immediacy; sub-agent defaults; sortable cols except Summary; run-dashboard from Docs home |
| 2026-08-07 | 3 | A-002/T-007: Docs home write rule in writer skills; `work:docs-home` ff-refresh; system.md P-001 shipped |
| 2026-08-07 | 3 | D-021: `/close` dispatches full phase close or reduced close (no-phase sessions) |
| 2026-08-07 | 3 | System layout: `protocols/` + `specs/`; dashboard persists page filters/sorts (localStorage) |
| 2026-08-07 | 3 | P-001: Docs home derive/dashboard pin + `work:docs-home`; path-lens-map + reduced-close residuals |
| 2026-08-07 | 3 | D-020: Docs home worktree SSOT (supersedes D-018); implement deferred to P-001 |
| 2026-08-07 | 3 | A-001: Adv protocol + MCOO checklist; skills project-agnostic (operator, not product names) |
| 2026-08-07 | 3 | D-019: command audit bars; `/check` in `/close`; May-invoke/Must-precede links; nested close lenses |
| 2026-08-07 | 3 | D-018: primary-rooted `/dashboard`; `derive()` overlays active phase worktree (phases/HANDOFF/Research/WORK/activity) |
| 2026-08-07 | 3 | Work ids: kind-prefixed F/T/P/R/Q/A-nnn for new rows; legacy W-* kept (W-018) |
| 2026-08-06 | 3 | Phase-scoped `/triage` via sub-agent; `/close` hygiene runs it before audits/reviews/tests |
| 2026-08-06 | 3 | PHASE-005 routing v2: executing `/triage`; Work `open_questions`+`done_summary`; `/audit` kind+command; context-budget under `/system` |
| 2026-08-06 | 3 | PHASE-005: `WORK.yaml` ledger; `/log` `/triage` `/task`; Work vs Signals dashboard; phase `feature`/`area` |
| 2026-08-05 | 3 | Approved V3 (`system.md`); migrated Docs.3 schedule/dashboard/ci into live Docs/; re-minted PHASE-000..003 |
