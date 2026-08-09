---
id: SPEC-F-PRAXIS-SHELL
kind: feature
title: Praxis shell chrome
status: active
superseded_by: null
depends_on:
  - SPEC-A-PRAXIS
decisions:
  - D-011
  - D-012
  - D-013
  - D-022
  - D-023
  - D-024
  - D-026
  - D-027
built_by:
  - PHASE-005
  - PHASE-006
  - PHASE-009
last_amended: PHASE-009
research: []
paths:
  - Docs/System/dashboard/public/**
  - Docs/System/dashboard/server.ts
  - Docs/System/derive/**
---

# Praxis shell chrome

## Purpose

Shared Praxis dashboard chrome: brand, nav, topbar, Filters, detail rail, theme, settings, worktrees.

## Behavior

- Rule: Dashboard is a read-only projection of Docs/ and `.work/`
- Rule: `work:dashboard` / `tooling/run-dashboard.sh` serves UI from Docs home when present (D-020), even if invoked from a phase/task cwd
- Rule: Missing static UI assets return 404 (no Error stack spam); launcher refuses to start when `public/index.html` is absent
- Rule: Sidebar brand is the official Praxis wordmark SVG (`public/brand/praxis-wordmark-{white,black}.svg`); ~22px; optically aligned to nav icon ink; selected nav uses soft fill + left accent; document title remains **Praxis**
- Rule: Nav sidebar width is `--sidebar-w: 180px`
- Rule: Main nav tabs are **Work · Roadmap · Activity · Knowledge** only — **Active is not a main-nav tab**
- Rule: Sidebar page icons are minimal stroke SVGs in a `1.25em` slot with shared left bearing ~x=4–5; selected tab icons at full opacity
- Rule: Sidebar-foot is one horizontal icon-only row: **Signals · Docs · Theme · Settings** (`.sidebar-foot-btn`); visible labels omitted — `title` + `aria-label` required
- Rule: **Settings** is a foot page (not main nav): Appearance shows current theme + Color mode chips (`rich` default · `status` · `mono`) persisted as `aidioma-dashboard-color-mode` / `data-color`; Theme toggle remains in the foot
- Rule: Status and Kind/Type table/detail pills share one component (`statusChipHtml` → `.status`, no leading dot); Kind uses `data-variant=kind`
- Rule: Chip hue set includes orange/rose/copper/slate; **never** assign cyan (`--info`) to chips
- Rule: Color mode gates Kind/Type hues (`rich`); `status` mutes Kind only; `mono` mutes Kind and Status/severity chips
- Rule: Topbar is compact (`--topbar-h` ~52px); page title uses `--fs-xl` and `--mono`
- Rule: Topbar **Active badge** sits immediately left of the worktrees/GitHub control; shows count of Active tabs (in-flight phases + `status: active` Work); click navigates to Active; always visible (including `0`)
- Rule: Topbar git badge shows open worktree count; panel lists worktrees by category (docs/main/phase/task/other) with dirty/ahead and optional GitHub branch link; control uses the GitHub mark icon
- Rule: File watcher includes `<git-common-dir>/worktrees` (when present); do not watch checkout trees under `.worktrees/`
- Rule: UI reads `repo.worktrees` (fallback `repo.sessions`) so a stale dashboard process cannot blank the panel after a field rename
- Rule: Feature/Area filters live in a Filters pop-up panel (not primary chip row); Reset clears filters/sort/search per table page and Knowledge; Filters badge is a small count chip
- Rule: Shell is viewport-locked (`body`/`workspace` `overflow: hidden`); table pages scroll in `main`; Knowledge/Docs fill `main` (`height: 100%`, not `100vh`)
- Rule: Light theme uses a cream shell (`--bg` ~`#ebe6df`) with warm paper panels (`--surface` ~`#f3efe7`) — never pure `#fff` and never cool/blue greys
- Rule: Nav sidebar, detail rail, and Knowledge TOC use page `--bg` (light + dark); tables/cards stay on `--surface` panels
- Rule: Detail panels (Phase / Work / Signal) share Phase chrome: `phase-view` header, Status `phase-block` + `glance-grid`, optional `phase-card` sections
- Rule: Detail topbar shows the id once — no path byline and no duplicate id under the title; copy control sits immediately right of the ID
- Rule: Detail collapse control is top-left; Close is top-right when expanded; Detail starts closed on load; `.detail[hidden]` must stay `display: none`
- Rule: Inactive page panels stay `display: none` via `.page[hidden]`
- Rule: Detail overlays when expanded; while open, workspace keeps a fixed ~52px right gutter for the collapsed rail
- Rule: Detail/Knowledge resize gutters are invisible until hover
- Rule: No page subtitles under the topbar title; no table “Showing N of M / columns…” meta bylines
- Rule: Table summaries truncate at 80 chars (full text in tooltip); column headers own sort
- Rule: Work/Phase detail section labels (D-024): **Brief** = authored intent; **Context** = declared `context_paths` (honest empty if none); **Files** = ownership trees
- Rule: `context_paths` are declared (nullable); never presented as a complete automatic read set

## Boundaries

Does not own page-specific Behavior Rules (Active/Work/Roadmap/Activity/Knowledge/Signals/Docs Features). Does not fire commands or edit artifacts from the UI (V1).

## Dependencies

Rests on SPEC-A-PRAXIS.
