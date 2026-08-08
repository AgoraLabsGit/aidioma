---
id: SPEC-F-DEV-DASHBOARD
kind: feature
title: Development dashboard and Work ledger
status: superseded
superseded_by: SPEC-F-PRAXIS-SHELL
depends_on:
  - SPEC-A-DEVSYSTEM
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
last_amended: PHASE-009
research: []

paths:
  - Docs/System/dashboard/**
  - Docs/System/derive/**
  - Docs/WORK.yaml
---

# Development dashboard and Work ledger

## Purpose

Lets the founder see phases, Work, Signals, and Knowledge projected from Docs/.

## Behavior

- Rule: Dashboard is read-only projection of Docs/ and `.work/`
- Rule: `work:dashboard` / `tooling/run-dashboard.sh` serves UI from Docs home when present (D-020), even if invoked from a phase/task cwd
- Rule: Missing static UI assets return 404 (no Error stack spam); launcher refuses to start when `public/index.html` is absent
- Rule: Work page shows outcome ledger `WORK.yaml`; Signals shows derived health only
- Rule: Activity **page** lists process/ops allowlist only (D-023): default `handoff`/`close`/`check`/`ship`; optional chips `launch`/`dashboard`/`status`/`triage`/`system`; no outcome-type rows or chips
- Rule: Activity Status / Feature / Area join `WORK.yaml` when `ref` is a Work id (ledger SSOT); when `ref` or `phase` is a Phase id and that phase is `closed`/`canceled`, Status shows `done` (stale mid-close `active` with `ref: null` must not stick); phase-linked Feature/Area still use phase tags
- Rule: Work kinds include `design` (`S-nnn`); UI shows human kind labels (e.g. Design); `D-nnn` remains decisions only (not Work ids); `/design` upserts `status: active` before other edits
- Rule: Work / Roadmap / Activity ID cells include a copy control; Activity copies `ts type ref` (no durable event id)
- Rule: `/check` Activity events use durable `ref: C-nnn` (not a Work kind); index exposes `next_check_id`
- Rule: Topbar git badge shows open worktree count; panel lists worktrees by category (docs/main/phase/task/other) with dirty/ahead and optional GitHub branch link
- Rule: File watcher includes `<git-common-dir>/worktrees` (when present) so worktree add/remove/prune updates the badge/panel without manual reindex; do not watch checkout trees under `.worktrees/`
- Rule: UI reads `repo.worktrees` (fallback `repo.sessions`) so a stale dashboard process cannot blank the panel after a field rename
- Rule: Sidebar brand is the official Praxis wordmark SVG (`public/brand/praxis-wordmark-{white,black}.svg`); ~22px; optically aligned to nav icon *ink* (same pad as `.tab` + ~4px logo nudge); selected nav uses soft fill + left accent flush to fill edge (`::before` left -1px); document title remains **Praxis**
- Rule: Nav sidebar width is `--sidebar-w: 180px`
- Rule: Sidebar page icons are minimal stroke SVGs in a `1.25em` slot with shared left bearing ~x=4–5 (Active target, Work checklist, Roadmap timeline, Activity pulse, Knowledge book); selected tab icons at full opacity
- Rule: Sidebar-foot is one horizontal **icon-only** row: **Signals · Docs · Theme** (`.sidebar-foot-btn`); ~28px height; foot icons ~12px (`1em` at 12px) — smaller than nav icons; visible labels omitted — `title` + `aria-label` required; Theme still toggles sun/moon icons
- Rule: **Docs** is a first-class dashboard page (`docs`, title Docs) — beginner Praxis guide; **not** a main-nav tab (same class as Signals); entry is the sidebar-foot Docs control only (D-026/D-027)
- Rule: Docs projects customer-facing guide pages: `Docs/START.md` (Welcome) + `Docs/COMMANDS-OVERVIEW.md` (Commands) (D-027 revisit); does **not** project `System/COMMANDS.md` (agent SSOT / Commands panel); does not replace Knowledge (artifact browser)
- Rule: Docs TOC shows titles only (no file-path sub-lines; no Guide/Praxis chrome labels)
- Rule: Docs page uses Knowledge reader chrome with fixed ~220px Guide TOC (no collapse control; does not share Knowledge TOC width/collapse prefs); `.page-docs` fills below the topbar like Knowledge; Docs prose is full pane width (no 72ch reading measure — that stays on Knowledge/detail)
- Rule: Knowledge page has a fixed table-style toolbar (search + Type chips: All / Product / Feature / Area / Decisions / Research / Releases + Status chips: Current (default) / Superseded / All + Filters panel + Reset); TOC lists categories **Product · Feature Specs · Area Specs · Decisions · Research · Releases** (Feature ≠ Area)
- Rule: Knowledge Feature/Area filters live in the shared Filters pop-up (not primary chips); Reset clears type/status/feature/area/search to defaults (`status` default `current`)
- Rule: Knowledge Status is global chips with kind-aware buckets — **Current** (default) vs **Superseded** vs **All**. Specs: `status===superseded` or `superseded_by` → superseded (else current, including contested). Research: `status===superseded` → superseded (fresh+stale → current). Decisions: any other decision’s `supersedes` text matching `\bD-nnn\b` (or own `superseded_by`) → superseded. Product/Releases: always current
- Rule: Knowledge Feature/Area slice — Feature F: Feature F + its primary Area (first `depends_on` SPEC-A-*) + Research/Decisions whose `affects` includes F or that Area. Area A: Area A + Features with any `depends_on` containing A + Research/Decisions whose `affects` includes A or those Features. Both filters AND. **Product always stays in the TOC** unless Type excludes it. Releases drop when Feature or Area is set. Untagged = no resolvable SPEC-F / SPEC-A tags on that axis. Type∩slice empty groups show “None match”
- Rule: When filters hide the selected Knowledge doc, selection moves to the first remaining TOC id (or Product). Superseded rows are greyed when Status shows them
- Rule: Knowledge TOC is static (always visible; no collapse control / expand arrow); no “Documents” chrome label — category labels (Product · Feature Specs · …) are enough
- Rule: Knowledge TOC rows use title + `id · status|date` secondary (Research uses status, not verdict); Product is `Product map` / `PRODUCT · active` (not the who/what/never slogan)
- Rule: Knowledge TOC titles clamp to **2 lines** (full name in tooltip); authored Spec `title`, Decision `title`, Research `question`, Release `summary` must be ≤60; UI still truncates past 60 with ellipsis inside the clamp
- Rule: Knowledge TOC list items are separated by a hairline divider between consecutive rows
- Rule: Knowledge search is a single-line 36px control (same as table pages); never a tall multi-line box
- Rule: Knowledge detail header is **title + id/copy on one row** (id to the right of title), then outcome below; Status glance + Brief / Connections / Files / Built by / Change log / Audits — no path byline and no `<details>` document-meta dropdown
- Rule: Knowledge document titles (`.knowledge-detail .phase-name`) are 24px — a step above shared `--detail-title-size` (22px); TOC primary lines use `--fs-base`
- Rule: Topbar is compact (`--topbar-h` ~52px, vertically centered title); page title uses `--fs-xl` (not oversized display)
- Rule: Knowledge Brief prose headings stay smaller than section labels (`now-label`) so Status/Brief remain the hierarchy
- Rule: Knowledge Status glance uses shared slots — Type/Status · Feature/Area · Created/Amended · Version proxy/Built by; Product uses the same slots with honest “—” / `living` (no Home/Role/Semver special-case)
- Rule: Glance label is **Amended** (not “Last amended”); **Version proxy** = stand-in for semver (`last_amended` phase id, else `living`) — tooltip restates this
- Rule: Knowledge detail has one vertical scroll pane (`.knowledge-doc`); `.knowledge-detail` must not nest a second `overflow: auto`
- Rule: Shell is viewport-locked (`body`/`workspace` `overflow: hidden`); table pages scroll in `main`; Knowledge/Docs fill `main` (`height: 100%`, not `100vh`) so stacked sidebar/TOC never grows past the viewport
- Rule: Knowledge Change log and Audits project activity journal rows with matching `ref` (no invented per-file git history)
- Rule: Knowledge markdown links and Connections buttons navigate in-page via `data-knowledge-link` for `PRODUCT`, `SPEC-*`, `D-nnn`, `R-nnn`, `RELEASE-nnn`
- Rule: `/api/doc` serves Feature/Area/Research files by id, Decision slices from `DECISIONS.md`, and Release slices from `RELEASES.md`
- Rule: Light theme uses a cream shell (`--bg` ~`#ebe6df`) with warm paper panels (`--surface` ~`#f3efe7`) — never pure `#fff` and never cool/blue greys; warmer muted ink; status soft fills ≥16% chroma
- Rule: Nav sidebar, detail rail, and Knowledge TOC use page `--bg` (light + dark); tables/cards stay on `--surface` panels
- Rule: Topbar worktrees control uses the GitHub mark icon
- Rule: Work/Phase detail section labels (D-024): **Brief** = authored intent (Work `note`; Phase `## Brief` if present else `## Context`); **Context** = declared `context_paths` (honest empty if none); **Files** = ownership trees (ledger/spec homes + spec `paths` / phase `amends_specs`)
- Rule: Work detail also surfaces `open_questions`, `done_summary`, and derived **Activity** trail (`ref === id`, including outcome types)
- Rule: `context_paths` are declared (nullable); never presented as a complete automatic read set; do not invent paths from tool traces
- Rule: Phase detail keeps projecting `plan`/`build`/`close`/`check` and other phase-matched journal events
- Rule: Durable outcome commands appear as Work rows; activity.jsonl remains the append-only journal (D-022); Activity page is not the full journal (D-023)

- Rule: Table summaries truncate at 80 chars (full text in tooltip); column headers own sort
- Rule: Work table defaults to Age newest-first; Roadmap schedule sort pins active phase(s) first, then Order; user sort/filter prefs persist until changed or Reset
- Rule: Age (and Activity time) columns default to newest-first on first click; second click toggles
- Rule: No page subtitles under the topbar title; no table “Showing N of M / columns…” meta bylines
- Rule: Feature/Area filters live in a Filters pop-up panel (not primary chip row); Reset clears filters/sort/search per table page and Knowledge; Filters badge is a small count chip
- Rule: Detail panels (Phase / Work / Signal) share Phase chrome: `phase-view` header, Status `phase-block` + `glance-grid`, optional `phase-card` sections
- Rule: Detail topbar shows the id once — no path byline (`Docs/…`) and no duplicate id under the title
- Rule: Page titles (`#page-title`), panel titles (`.phase-name`), and detail topbar ID (`#detail-title`) use `--mono` like table IDs; `#detail-title` / `.phase-name` share `--detail-title-size`; `#page-title` uses `--fs-xl`; copy control sits immediately right of the ID

- Rule: Detail collapse control is top-left (larger chevron in the collapsed rail); Close is top-right when expanded and hidden when collapsed; chevron flips (`›` / `‹`)
- Rule: Detail starts closed on load; `.detail[hidden]` must stay `display: none` (flex must not override `hidden`)
- Rule: Inactive page panels stay `display: none` via `.page[hidden]` (`.page-knowledge { display: flex }` must not override `hidden`)
- Rule: Detail overlays when expanded; while open, workspace keeps a fixed ~52px right gutter for the collapsed rail (no reflow on expand/collapse)
- Rule: Detail/Knowledge resize gutters are invisible until hover (no persistent thick divider)
- Rule: Signals entry is the sidebar-foot status control (not a main-nav item); Docs entry is the sidebar-foot Docs control (not a main-nav item)

## Boundaries

Does not fire commands or edit artifacts from the UI (V1).


## Dependencies

Rests on SPEC-A-DEVSYSTEM for process files and schemas.

## Successor

Superseded by Praxis page Features (PHASE-009):
`SPEC-F-PRAXIS-SHELL`, `-ACTIVE`, `-WORK`, `-ROADMAP`, `-ACTIVITY`, `-KNOWLEDGE`,
`-SIGNALS`, `-DOCS`, plus `SPEC-F-PRAXIS-ACTIVE-FLUSH`. Primary `superseded_by` pointer is
**SPEC-F-PRAXIS-SHELL**.
