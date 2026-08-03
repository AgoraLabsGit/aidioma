# Bugs — the defect register

> Observed defects. Every fix REQUIRES a regression test proven to fail without it.
> `↻` = recurrence count; a bug that comes back is a visible signal, not a memory.

| ID | ↻ | Bug | Root cause / anchor | Status |
|---|---|---|---|---|
| BUG-002 | 1 | **A documentation-only `main` merge created a new Production deployment without `SHIP`** | `apps/web/vercel.json` enables every `main` deployment while PROCESS permits docs to merge promptly and says only `SHIP` authorizes Production. PR #3 moved `main` to `3da1ae7`; Vercel created deployment `dpl_5vpB9P6bkzKz2g6JxYf211QcNuBz` and reassigned Production aliases even though the deployable app tree matched shipped `c3f50be`. Fix through `/fix`: prove an unaffected-build skip or define and receipt an explicitly authorized docs-only rebuild path. | open |

## Closed
(move rows here when fixed — keep the full row as the audit trail)
| ID | ↻ | Bug | Root cause / anchor | Status |
|---|---|---|---|---|
| BUG-001 | 1 | **Authenticated A2 Preview AI grading returned `503` while comparison grading succeeded** | Request `87195cd5-34ca-412f-970c-d4a723b750dd` exposed Gateway HTTP 400. Minimal live probes proved `quotaEntityId` alone was rejected as `invalid gateway provider options`, while supported opaque `user` + tags graded successfully. Commit `9cdca85` removes the option and regression-forbids it; authenticated replacement Preview AI returned 200 with Gateway generation receipts. | closed |
