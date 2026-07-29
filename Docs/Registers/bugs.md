# Bugs — the defect register

> Observed defects. Every fix REQUIRES a regression test proven to fail without it.
> `↻` = recurrence count; a bug that comes back is a visible signal, not a memory.

| ID | ↻ | Bug | Root cause / anchor | Status |
|---|---|---|---|---|
| BUG-001 | 1 | **Authenticated A2 Preview AI grading returns `503` while comparison grading succeeds** | Preview request `f3965a82-1813-4b75-9af7-aa9da37e15db` reached the AI path but failed before any AI Gateway request event was registered. The evaluation key is active and nearly unused; current safe telemetry collapses the upstream status/detail into `provider`, blocking exact diagnosis. | investigating |

## Closed
(move rows here when fixed — keep the full row as the audit trail)
