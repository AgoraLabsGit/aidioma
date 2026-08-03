---
title: A2R-1 — Application baseline audit
type: wave-slice
status: active
updated: 2026-07-30
---

# A2R-1 — Application baseline audit

## Brief
- **Lane:** App
- **Goal:** Produce an evidence-backed health scorecard for the application foundation before persistence work begins.
- **Touches:** `Docs/Audits`, `Docs/Registers`, this wave record, `Docs/ROADMAP.yaml`, `Docs/STATE.md`, and audit-only proof artifacts.
- **Out of scope:** Code or UI fixes, A2R-2 founder UI decisions, A3 persistence, A6 Practice Sets, Production configuration, and `SHIP`.
- **Verify plan:** Run every App gate; inspect architecture/security/integration/dependency seams; prove the current non-production browser → API → data/response path without writes; record every finding with severity and owner.

## Gates (stage 2 — record actual results)
| Gate | Command | Result |
|---|---|---|
| typecheck | `npm run app:typecheck` | PASS |
| lint | `npm run app:lint` | PASS — zero warnings |
| tests (baseline: 140 passing) | `npm run app:test` | PASS — 19 files / 140 tests |
| build | `npm run app:build` | PASS — 7 UI routes, dynamic evaluate route, Proxy |
| smoke | `npm run app:smoke` | PASS — 16 states; axe, keyboard, reduced motion, 200% text, responsive overflow |

## Audit (stage 3)
- Auditors: three isolated read-only reviews covering code/trust, platform/integrations, and quality/operability.
- Findings: 0 critical; high — OI-041, OI-042, OI-044, OI-045; moderate — OI-043, OI-046…OI-052 and BUG-002; known — OI-026/OI-034. Full triage: `Docs/Audits/2026-07-30-a2r-application-baseline.md`.
- Delta re-audit: implementation changes were intentionally not made; every finding is dispositioned to a register owner. Audit-record review is pending below.

## Review (stage 4)
- Medium read-only review: initial critical found stale Production SHA/exception; corrected to live `3da1ae7` + BUG-002. Ownership, evidence anchors, caps, severity, and active/not-proven status passed delta review.

## Proof (stage 6)
- PASS partial: local headless UI smoke; real Development Neon identity/source → handler comparison returned 200 with no AI and no persistence; Production routes returned expected 200/404 and signed-out API returned safe 401.
- BLOCKED closure: fresh authenticated immutable-Preview browser → Clerk → API → Neon/Gateway receipt is still required by OI-044. A2R-1 remains active.

## Clean (stage 7)
- Audit-only slice; no implementation or temporary tracked proof code was added. Browser artifacts are the existing canonical smoke paths. A2R-H still owns final review-artifact reconciliation.

## Decisions
- Operator split A2R across sessions: A2R-1 audit only here; A2R-2 founder UI review and A2R-H later.
- A2R-1 records findings but does not implement code or UI fixes; fixes use `/fix`.
