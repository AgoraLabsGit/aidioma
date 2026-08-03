# Bugs — the defect register

> Observed defects. Every fix REQUIRES a regression test proven to fail without it.
> `↻` = recurrence count; a bug that comes back is a visible signal, not a memory.

| ID | ↻ | Bug | Root cause / anchor | Status |
|---|---|---|---|---|
| BUG-002 | 1 | **A documentation-only `main` merge created a new Production deployment without `SHIP`** | Vercel treated every `main` commit as deployable because `apps/web/vercel.json` had no Ignored Build Step. PR #3 moved `main` to `3da1ae7`; deployment `dpl_5vpB9P6bkzKz2g6JxYf211QcNuBz` reassigned Production aliases although the app inputs matched shipped `c3f50be`. `fix/BUG-002` adds a merge-safe deployable-input classifier; closure still requires a shipped candidate followed by a docs-only merge proving only an expected canceled ignored-build record, with no successful Production deployment or alias movement. | open |

## Closed
(move rows here when fixed — keep the full row as the audit trail)
| ID | ↻ | Bug | Root cause / anchor | Status |
|---|---|---|---|---|
| BUG-001 | 1 | **Authenticated A2 Preview AI grading returned `503` while comparison grading succeeded** | Request `87195cd5-34ca-412f-970c-d4a723b750dd` exposed Gateway HTTP 400. Minimal live probes proved `quotaEntityId` alone was rejected as `invalid gateway provider options`, while supported opaque `user` + tags graded successfully. Commit `9cdca85` removes the option and regression-forbids it; authenticated replacement Preview AI returned 200 with Gateway generation receipts. | closed |
