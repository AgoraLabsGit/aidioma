# Bugs — the defect register

> Observed defects. Every fix REQUIRES a regression test proven to fail without it.
> `↻` = recurrence count; a bug that comes back is a visible signal, not a memory.

| ID | ↻ | Bug | Root cause / anchor | Status |
|---|---|---|---|---|

## Closed
(move rows here when fixed — keep the full row as the audit trail)

| ID | ↻ | Bug | Root cause / anchor | Status |
|---|---:|---|---|---|
| BUG-001 | 0 | A failed local connection-string transform emitted the credential in command error output during A1-H | Shell quoting passed a literal variable name into URL parsing, whose exception echoed the input. The credential was immediately rotated; environment credentials were then replaced with dedicated roles. Regression coverage now proves exact database/role write-target guards fail closed. | closed 2026-07-29 |
