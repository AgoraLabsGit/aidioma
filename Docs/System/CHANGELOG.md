# System changelog

Append only. Every `/system` change adds one line.

| Date | schema_version | Change |
|---|---|---|
| 2026-08-07 | 3 | Work ids: kind-prefixed F/T/P/R/Q/A-nnn for new rows; legacy W-* kept (W-018) |
| 2026-08-06 | 3 | Phase-scoped `/triage` via sub-agent; `/close` hygiene runs it before audits/reviews/tests |
| 2026-08-06 | 3 | PHASE-005 routing v2: executing `/triage`; Work `open_questions`+`done_summary`; `/audit` kind+command; context-budget under `/system` |
| 2026-08-06 | 3 | PHASE-005: `WORK.yaml` ledger; `/log` `/triage` `/task`; Work vs Signals dashboard; phase `feature`/`area` |
| 2026-08-05 | 3 | Approved V3 (`system.md`); migrated Docs.3 schedule/dashboard/ci into live Docs/; re-minted PHASE-000..003 |
