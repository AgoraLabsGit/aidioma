---
schema_version: 1
updated: 2026-08-05
---

# CI policy

## Roles

| Lane | Owns |
|---|---|
| Local `/close` | Primary proof: audits, Cursor review helpers, focused/full gates for the diff |
| GitHub Actions | Thin merge gate + path-filtered suites when relevant paths change |

## Workflows

| Workflow | When it runs |
|---|---|
| `merge-gate` | Every PR and every push to `main` (cheap; required check) |
| `app-validate` | Only when app-related paths change |
| `content-validate` | Only when content/schema-related paths change |
| `work-validate` | Only when Docs/skills/registry/dashboard paths change |

## Rules

- Do not rely on GitHub as the primary code-review surface.
- `/close` must run appropriate local gates and wait until every **started** PR check is green
  (including path-filtered app/content when those files changed).
- Protected `main` requires `merge-gate` so docs-only PRs are not blocked by skipped app/content jobs.
