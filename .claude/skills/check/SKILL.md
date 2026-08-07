---
name: check
description: Run path-aware tests/lint and record last_check. Use when the operator says /check or a parent command requires a green suite.
---

# /check

Utility. Tests/lint only — **must not fix**.

1. Diff: `git diff --name-only origin/main...HEAD` ∪ dirty tree → select lanes:
   - **work:** `Docs/**`, skills, derive, dashboard → `work:typecheck` → `work:test` → `work:validate`
   - **app:** `apps/web/**`, packages → `app:typecheck` → `app:lint` → `app:test`
   - **content:** `content/**`, tooling/content → `content:typecheck` → `content:validate` (+ fixtures as needed)
2. Flags: `--all` all lanes; `--lane work|app|content` force one. Empty → report skip.
3. Fail-fast. Do not patch findings.
4. Append activity `type: check` (`status: complete|failed`, summary with lanes).
5. `derive()` projects `last_check` from the latest check event.

**May invoke:** none.  
**Invoked by:** `/close` (required), `/ship`, `/run`, `/triage` (after unassigned batch), `/fix`/`/task` before publish, `/system`.
