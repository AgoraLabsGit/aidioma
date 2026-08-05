---
schema_version: 3
updated: 2026-08-05
---

# CI policy

Primary proof is local `/close`. GitHub Actions is a thin merge gate.

## Roles

| Lane | Owns |
|---|---|
| Local `/close` | Primary proof: three close checks, focused/full gates for the diff |
| GitHub Actions | Thin merge gate + path-filtered suites when relevant paths change |

## Always-on: `merge-gate`

| Check | Fails when |
|---|---|
| Schema validation | Any frontmatter violates `System/schemas/*.schema.json` |
| Docs allowlist | A directory exists under `Docs/` outside the layout in `system.md` |
| Size caps | Spec >1500 words, research >800, phase >600 |
| Link resolution | `depends_on`, `decisions`, `affects`, `amends_specs` name ids that do not exist |

Required check on protected `main` so docs-only PRs are not blocked by skipped app/content jobs.

## Path-filtered

| Workflow | When it runs |
|---|---|
| `app-validate` | App-related paths change |
| `content-validate` | Content/schema-related paths change |
| `work-validate` | Docs/skills/registry/dashboard paths change |

## Rules

- Do not rely on GitHub as the primary code-review surface.
- `/close` must run appropriate local gates and wait until every **started** PR check is green.
- Production deploys are never a side effect of merge — only `/ship`.
