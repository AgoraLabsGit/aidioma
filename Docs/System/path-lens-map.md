---
schema_version: 3
updated: 2026-08-07
---

# Path → Proof lens map

Used by `/close` (and standalone publish when the path set matches). Nested under **Proof**;
these lenses are path-triggered — skip when the diff does not touch the path class.

| Path class (diff vs `origin/main` ∪ dirty) | Lens | Notes |
|---|---|---|
| `apps/web/**` UI routes, components, CSS | Accessibility | Forms, focus, contrast, labels |
| `apps/web/**` auth, sessions, cookies, middleware | Security · Privacy | AuthZ, secret handling, PII |
| `apps/web/**` or packages calling model/gateway APIs | AI tokens | Cost, logging of prompts/completions |
| Any path with migrations / SQL / Drizzle | Data migration | Forward-only, rollback story |
| Hot paths (practice loop, API handlers) with perf claims | Performance | Only if phase/fix claims perf |
| `content/**` learner-facing authored text | Privacy | No secrets; license/attribution |
| `Docs/**`, skills, derive, dashboard only | *(none)* | No path-triggered Proof lenses |

**Always** (not path-triggered): outcome evidence; Required Adv on `/close` claims.  
**Always under Scope:** path→spec; MCOO (`mcoo-checklist.md`).

If unsure whether a class matches — run the lens (false positive WARN beats silent skip).
