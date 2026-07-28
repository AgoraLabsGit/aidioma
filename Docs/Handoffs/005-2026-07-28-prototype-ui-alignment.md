---
title: Handoff — Port the prototype UI system into Next.js
type: handoff
status: active
updated: 2026-07-28
---

# Handoff — Port the prototype UI system into Next.js

**Role:** primary coordinator for the A1-1R corrective slice while C2 may continue independently  
**Operator:** Mike; continue autonomously and ask only for genuine blockers  
**Rule:** never push without Mike's explicit GO at wave close

## Boot in this order

1. `Docs/STATE.md` → `Docs/ROADMAP.yaml` → `Docs/INDEX.md`
2. This handoff and `Docs/PROCESS.md`
3. `Docs/Specs/Features/module-spec.md` + `accessibility.md`
4. `Docs/Waves/A1-1-nextjs-scaffold.md` and `Docs/Waves/C2-1-draft-launch-lessons.md`
5. `apps/prototype/index.html`, then the current `apps/web/src/` implementation
6. `.claude/skills/run/SKILL.md`; apply current Next.js, React, and browser-verification guidance

## Operator ruling — do not reinterpret it

- Mike prefers the prototype UI by a wide margin and supplied dark desktop screenshots of Home,
  Lessons, Practice, and Settings as the intended experience.
- **Use the prototype styling and layout exactly and port it into Next.js.** It is an implementation
  baseline, not loose inspiration. Do not create another visual redesign.
- Port the visual system, not stale mock truth. Settled A0 behavior and canonical content win when
  the prototype contains fake data or superseded controls.
- Correct this before A1-2 so real data is not built on the wrong component/layout foundation.

## What went wrong

- A1-1 correctly established Next.js 16 App Router, Clerk, Neon + Drizzle, routes, tests, build, and
  smoke gates, but its brief said only “responsive app shell.”
- `module-spec.md` formerly said “read, don't copy” and described only broad visual traits. The
  implementation turned that ambiguity into a wide, oversized editorial/marketing-style shell.
- Audits checked accessibility, contrast, reflow, auth, shutdown, and standalone visual quality;
  they did not compare the app side-by-side with the prototype. OI-027 owns this miss.

## Preserve these working foundations

- Keep the current Next.js App Router route structure and Server Component default.
- Keep Clerk boundaries, `src/proxy.ts`, keyless-safe behavior, Neon + Drizzle server-only lazy
  initialization, root workspace scripts, and Node 22.22.2+ floor.
- Keep truthful zero states until real data exists. Do not restore `Hola, Mike`, fake streaks,
  mastery percentages, points, or progress from prototype localStorage.
- Keep canonical lesson JSON/schema and current lesson titles; do not port mock curriculum data.
- Do not start A1-2, A2, or substantive SessionEngine work inside this corrective slice.

## Exact visual baseline

Port from `apps/prototype/index.html` and verify against Mike's supplied screenshots:

- Desktop persistent left rail with Home, Lessons, Practice, and Settings; compact active state.
- Contained full-height application canvas, dense central column, thin borders, quiet card chrome,
  restrained amber accent, Avenir-style sans typography, and dark/light token parity.
- Mobile bottom tab bar and single-column screens using the prototype breakpoint behavior.
- Home: compact heading, stat tiles/zero equivalents, Continue row, lesson path, weekly goal, and
  focus/review regions—no oversized marketing hero.
- Lessons: level groups and dense lesson rows with clear done/current/locked states.
- Practice shell: context header, lesson/explainer row, dense activity cards, and fixed composer.
  Placeholder content is allowed until later features, but geometry must be represented truthfully.
- Settings: compact grouped panels; use the approved single daily-goal slider and theme control;
  omit the prototype's presets/custom input and Reminders section.

## Component system before page work

Create a small explicit design system instead of copying one large HTML file into JSX:

- **Tokens:** one source for background/panel/card/soft/border/text/muted/accent/good/error,
  radii, spacing, type scale, content widths, sidebar width, and breakpoints. Start by copying the
  prototype values exactly; do not scatter replacement hex values or arbitrary spacing.
- **Shell components:** `AppShell`, `DesktopSidebar`, `MobileTabBar`, `TopContextBar`, and a focused
  theme boundary. Route-aware navigation must expose `aria-current="page"`.
- **Primitives:** `Button`, `IconButton`, `Card`, `Badge`, `Progress`, `SectionHeading`, `StatTile`,
  `EmptyState`, `SegmentedControl`, `FormField`, and `ScreenContainer` (names may vary, roles may not).
- **Feature compositions:** `HomeDashboard`, `LessonCatalog`, `PracticeWorkspace`, and
  `SettingsPanel` should compose primitives rather than duplicate card/nav markup.
- Keep interactive state in the smallest client islands. Shell/pages remain Server Components where
  possible; do not mark the whole application client-side for theme or current-route behavior.

## Library decision rules

- The existing app has no Tailwind/shadcn setup. **Do not initialize shadcn or Tailwind merely to
  claim a component library**: generated defaults could overwrite the exact prototype tokens and
  add migration scope.
- Prefer semantic HTML and owned React primitives for the static shell, cards, lists, progress,
  navigation, and buttons. Reuse the prototype CSS faithfully through organized global/component
  styles.
- A small established library is advisable when it provides real accessibility/behavior value:
  evaluate `next-themes` for Auto/Light/Dark, one consistent icon library such as Lucide, and
  Radix/shadcn primitives for genuinely complex controls (Dialog, Sheet, Tooltip, Slider) only.
- If shadcn is adopted, use a non-interactive dry run first, Radix/new-york semantics, import only
  named components, and restyle them to AIdioma tokens. Never let initialization overwrite
  `globals.css`, fonts, or the prototype look. Record the dependency and bundle rationale.
- Avoid barrel imports, unnecessary client components, duplicated UI primitives, nested card
  furniture, gradients/glassmorphism, and one-off color/spacing values.

## Required lifecycle and verification

1. Create `Docs/Waves/A1-1R-prototype-ui-alignment.md` and an isolated `slice/A1-1R` worktree.
2. Capture reference screenshots from the prototype at 390×844 and 1440×900 in light and dark.
3. Build tokens/primitives/shell first; then port Home, Lessons, Practice shell, and Settings.
4. Extend tests for route-aware navigation, theme behavior, truthful zero states, and component
   semantics. Add visual regression/reference comparison to the Playwright smoke path.
5. Run `npm run app:typecheck`, `app:lint`, `app:test`, `app:build`, and `app:smoke`.
6. Browser proof must cover both themes, both widths, keyboard navigation, visible focus, 200% text,
   no horizontal overflow, and saved screenshots. Compare against the prototype side-by-side.
7. Dispatch independent accessibility/boundary and visual-fidelity audits. The visual auditor must
   receive both prototype and app screenshots; standalone “looks good” judgment is insufficient.
8. Merge locally only after fixes and delta re-audit. Close OI-027 and update specs/state/evidence.
   Do not push.

## Acceptance bar

- At a glance, the Next.js Home/Lessons/Practice/Settings screens belong to the same product shown
  in the supplied prototype screenshots: same shell, density, tokens, typography, borders, radii,
  and navigation behavior.
- Differences are explainable only by truthful state, settled A0 behavior, accessibility, or real
  framework/auth constraints—not personal design preference.
- No regression to Clerk/Neon boundaries, responsive behavior, accessibility gates, or build-safe
  credential handling.

## Current repository caution

- At handoff creation, `main` also has pre-existing uncommitted changes in
  `apps/web/.gitignore` (`/.clerk/`) and generated `apps/web/next-env.d.ts` from local previewing.
  Treat them as operator/tool-owned: inspect and preserve them; do not silently stage, overwrite,
  or discard them with this docs handoff.
- `Archive/Legacy-Apps/` remains ignored and sensitive. Never inspect, stage, or push it.
- C2 remains active at a1-05 next; coordinate through committed files and keep lane ownership
  isolated. Latest clean content checkpoint is a1-04 L2-PASS (r3).
