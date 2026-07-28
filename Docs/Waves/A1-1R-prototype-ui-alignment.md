---
title: A1-1R — Prototype UI alignment
type: wave-slice
status: proven
updated: 2026-07-28
---

# A1-1R — Prototype UI alignment

## Brief
- **Lane:** App
- **Goal:** Replace the divergent editorial shell with a componentized Next.js implementation of the approved prototype visual system across Home, Lessons, Practice, and Settings.
- **Touches:** `apps/web/src/`, app-local tests and screenshot artifacts, the A1-1R visual-reference tooling/evidence, `Docs/Specs/Features/module-spec.md`, `Docs/Registers/open-items.md`, `Docs/ROADMAP.yaml`, `Docs/STATE.md`, and this record.
- **Out of scope:** A1-2 content import/seed, A2 evaluation work, SessionEngine behavior, mock learner progress, curriculum rewrites, deployment configuration, and prototype deletion. The operator separately authorized publishing the proven result to `AgoraLabsGit/aidioma` for Vercel linking.
- **Verify plan:** Run every app gate (`app:typecheck`, `app:lint`, `app:test`, `app:build`, `app:smoke`); prove route-aware navigation, Auto/Light/Dark behavior, truthful zero states, desktop/mobile parity, keyboard focus, 200% text reflow, and no horizontal overflow with side-by-side prototype/app screenshots at 390×844 and 1440×900.

## Gates (stage 2 — record actual results)
| Gate | Command | Result |
|---|---|---|
| typecheck | `npm run app:typecheck` | PASS |
| lint | `npm run app:lint` | PASS — 0 warnings |
| tests (baseline: 8 passing) | `npm run app:test` | PASS — 5 files, 14 tests |
| build | `npm run app:build` | PASS — 6 static pages plus Clerk auth routes |
| smoke | `npm run app:smoke` | PASS — 16 screen states plus interaction/reflow checks |

## Audit (stage 3)
- Auditors: independent accessibility/boundary audit and screenshot-informed visual-fidelity audit.
- Initial findings: no criticals. Warnings covered compact type weight, status-tag shape, lesson-section carets, Practice status/action fidelity, mobile title reflow, exact route matching, and explicit disclosure that the daily-goal slider is not yet persisted.
- Fixes: normalized comparable weights to 600; restored rectangular tags, level carets, two disabled Practice actions, and zero-state rings; made mobile context concise while retaining the full visible title; added exact/prefix navigation regression coverage; and labeled goal changes as preview-only.
- Delta re-audit: PASS from both auditors — 0 criticals and 0 remaining warnings; no boundary regression.

## Review (stage 4)
- React/Next.js review found no criticals. Warnings were fixed: current lessons now lead to the catalog instead of bypassing into Practice, catalog availability is not misrepresented as actionable, smoke rejects stale builds, and its visual contract covers all four routes. Exact route matching received a regression test. A final 200% mobile-tab overflow edge case was fixed with in-cell label reflow; fresh production delta review and smoke both PASS.

## Proof (stage 6)
- Headless Playwright: `SMOKE PASS: 16 screen states; prototype token/geometry parity; route-aware navigation; theme control; axe; keyboard focus; reduced motion; 200% text; no horizontal overflow; keyless auth.`
- Evidence: `apps/web/artifacts/a1-1r/prototype/` (16 references), `apps/web/artifacts/a1-1r/app/` (16 application captures), and `apps/web/artifacts/a1-1r/visual-contract.json`.
- Representative SHA-256: Home desktop light `04924052…67da`; Lessons mobile dark `e131d110…970f`; Practice mobile light `62fb443f…df2`; Settings desktop dark `b8e15977…2c53`; visual contract `4469bdf6…21a7`.

## Clean (stage 7)
- Deleted the superseded custom icon implementation and replaced the divergent shell/styles instead of retaining a second UI system. Residue scan found no remaining imports or duplicate shell implementation.
- The prototype remains authoritative evidence until A4-2, so its existing deprecation trigger has not fired. `OI-026` remains open: `npm audit --omit=dev` still reports the same 4 upstream production findings with no compatible fix.

## Publish
- Local `main` merge: `603526f` (includes feature `2a4b096` and keyless-smoke hardening `4cd3c28`).
- Authorized normal push to `https://github.com/AgoraLabsGit/aidioma.git` was attempted without force and failed with GitHub `Repository not found`; no remote repository was created or overwritten.

## Human check
1. Open `/`, then switch Home → Lessons → Practice → Settings; expect the active rail/tab item to follow the exact route.
2. Resize to phone width; expect bottom navigation, no horizontal scroll, and the Practice composer pinned above it.
3. In Settings choose Auto, Light, and Dark; expect the whole shell to change and the selection to remain after reload.
4. Move the daily-goal slider; expect the displayed number to change and the preview-only persistence disclosure to remain visible.
5. Expect real first-run zeros everywhere and no invented learner name, progress, unlocked practice, or reminder control.

## Decisions
- The prototype is the exact visual/layout baseline; settled A0 behavior and truthful application state override prototype mock data and stale controls.
- Retain Server Component pages and isolate only route awareness, theme, slider, and other genuinely interactive behavior in focused client components.
- Responsive web is the MVP target at 390×844 and 1440×900; native mobile remains a later platform concern.
