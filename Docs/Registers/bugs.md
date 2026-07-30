# Bugs — the defect register

> Observed defects. Every fix REQUIRES a regression test proven to fail without it.
> `↻` = recurrence count; a bug that comes back is a visible signal, not a memory.

| ID | ↻ | Bug | Root cause / anchor | Status |
|---|---|---|---|---|
| BUG-001 | 1 | **Authenticated A2 Preview AI grading returns `503` while comparison grading succeeds** | Replacement request `87195cd5-34ca-412f-970c-d4a723b750dd` exposed Gateway HTTP 400. Minimal live probes proved `quotaEntityId` alone is rejected as `invalid gateway provider options`, while the same structured call with supported opaque `user` + tags grades successfully. The regression test now forbids the rejected option; replacement Preview proof remains. | fixing |

## Closed
(move rows here when fixed — keep the full row as the audit trail)
