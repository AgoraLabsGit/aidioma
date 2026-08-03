---
title: A0-H — Design-close hygiene and repository consolidation
type: wave-slice
status: closed
updated: 2026-07-28
---

# A0-H — Design-close hygiene and repository consolidation

## Brief

- **Goal:** leave one current application-design SSOT in Docs and a clean app/content boundary.
- **Reviewed:** former MVP design, V1, V2, old docs, lesson-content, and prototype trees.
- **Out of scope held:** no production app implementation; no C2 drafting; no push.
- **Operator:** design VERIFIED; expanded folder cleanup explicitly approved.

## Result

- Durable legacy findings entered current specs: evaluation trust/failure boundary, persisted
  sessions, exact blend formula, full model fields, word-diff marks, accessibility, progress,
  visual direction, and content-pipeline governance.
- Post-MVP gems entered the register: KB approval loop, five-level mastery, deeper lessons,
  audio, SRS, conversations, help telemetry, richer reading, import, offline, placement, QA.
- V1/V2 moved to ignored `Archive/Legacy-Apps/`; nested Git and `.env` evidence preserved there.
- Historical design/docs moved to `Docs/Archive/`; meaningful content retained and cataloged.
- Two credential-shaped connection examples in tracked legacy docs were redacted; the tracked
  tree now has no live-looking secret patterns.
- Generated legacy dependencies, builds, logs, OS files, and two empty legacy files removed
  (about 671 MB; reproducible/non-evidence only).
- New boundary: `apps/`, `packages/lesson-schema/`, `content/`, and `tooling/`. The former
  `lesson-content/` root is gone. `apps/web/` remains README-only until A1.

## Gates

| Gate | Result |
|---|---|
| ROADMAP YAML | PASS — 12 waves |
| Active Markdown links | PASS — 67 files |
| File caps + required frontmatter | PASS |
| Contract typecheck | PASS |
| Contract smoke | PASS — 13/13 |
| Content/tooling typecheck | PASS |
| Content validator | PASS — 0 errors, 5 known warnings across 3 lessons |
| Validator counter-examples | PASS — 16/16 |
| Prototype deterministic freshness | PASS |

## Residue and register audit

- Active-path scan: no stale authority points at a removed root; historical logs retain old paths
  as dated evidence. Docs is the only current application-design authority.
- No production app code exists; `apps/web/README.md` only reserves the A1 destination.
- OI-023 remains the required post-close C2 call; OI-025 owns content contract prep.
- DEP-001 owns temporary prototype/exporter removal after A4 proves the real replacement.
- No fired deprecation trigger remains and no finding is unowned.
- Full review report: `Docs/Audits/2026-07-28-legacy-ssot-consolidation.md`.

## Close proof

- A0-1…A0-4 remain proven and the operator’s design approval remains valid; consolidation added
  detail without reopening those product choices.
- High-effort artifact review: 0 critical, 0 unowned warnings after path, register, archive,
  contract-package, and failure-semantics reconciliation.
- Whole-wave Git diff is unavailable because this repository has no first commit. The full
  artifact set was reviewed instead.
- Operator gave design VERIFIED and explicit close GO on 2026-07-28. A0 is closed.
- No remote or first commit exists, so no commit/push operation was available or attempted.
