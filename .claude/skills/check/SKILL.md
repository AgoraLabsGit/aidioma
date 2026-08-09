---
name: check
description: Run path-aware tests/lint and record last_check. Use when the operator says /check or a parent command requires a green suite.
---

# /check

Utility. Tests/lint only — **must not fix**.

0. **Docs home (D-020):** Append activity under Docs home `.work/activity/` when present.
1. Allocate **`ref: C-nnn`** before running lanes (Activity-only id — **not** a Work ledger row).
   - Prefer `next_check_id` from a fresh `derive` / dashboard index when available.
   - Else scan `.work/activity/*.jsonl` for `ref` values matching `C-###`; next = max + 1
     (`C-001` if none). Helper: `nextCheckId(refs)` in `Docs/System/derive/schema.ts`.
2. Diff: `git diff --name-only origin/main...HEAD` ∪ dirty tree → select lanes:
   - **work:** `Docs/**`, skills, derive, dashboard → `work:typecheck` → `work:test` → `work:validate`
   - **app:** `apps/web/**`, packages → `app:typecheck` → `app:lint` → `app:test`
   - **content:** `content/**`, tooling/content → `content:typecheck` → `content:validate` (+ fixtures as needed)
3. Flags: `--all` all lanes; `--lane work|app|content` force one. Empty → report skip.
4. Fail-fast. Do not patch findings.
5. Append activity `type: check`, **`ref: C-nnn`**, `status: complete|failed`, summary with lanes.
6. `derive()` projects `last_check` (includes `ref`) from the latest check event.

**May invoke:** none.  
**Invoked by:** `/close` (required), `/ship`, `/run`, `/triage` (after unassigned batch), `/fix`/`/task` before publish, `/system`.
