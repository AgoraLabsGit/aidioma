---
id: SPEC-F-PRAXIS-KNOWLEDGE
kind: feature
title: Praxis Knowledge page
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
  - Docs/Specs/**
  - Docs/DECISIONS.md
  - Docs/Research/**
  - Docs/PRODUCT.md
  - Docs/RELEASES.md
  - Docs/System/dashboard/public/app.js
---

# Praxis Knowledge page

## Purpose

Knowledge page browses Product, Specs, Decisions, Research, and Releases.

## Behavior

- Rule: Knowledge page has a fixed table-style toolbar (search + Type chips: All / Product / Feature / Area / Decisions / Research / Releases + Status chips: Current (default) / Superseded / All + Filters panel + Reset); TOC lists categories **Product · Feature Specs · Area Specs · Decisions · Research · Releases** (Feature ≠ Area)
- Rule: Knowledge Feature/Area filters live in the shared Filters pop-up (not primary chips); Reset clears type/status/feature/area/search to defaults (`status` default `current`)
- Rule: Knowledge Status is global chips with kind-aware buckets — **Current** (default) vs **Superseded** vs **All**. Specs: `status===superseded` or `superseded_by` → superseded (else current, including contested). Research: `status===superseded` → superseded (fresh+stale → current). Decisions: any other decision’s `supersedes` text matching `\bD-nnn\b` (or own `superseded_by`) → superseded. Product/Releases: always current
- Rule: Knowledge Feature/Area slice — Feature F: Feature F + its primary Area (first `depends_on` SPEC-A-*) + Research/Decisions whose `affects` includes F or that Area. Area A: Area A + Features with any `depends_on` containing A + Research/Decisions whose `affects` includes A or those Features. Both filters AND. **Product always stays in the TOC** unless Type excludes it. Releases drop when Feature or Area is set. Untagged = no resolvable SPEC-F / SPEC-A tags on that axis. Type∩slice empty groups show “None match”
- Rule: When filters hide the selected Knowledge doc, selection moves to the first remaining TOC id (or Product). Superseded rows are greyed when Status shows them
- Rule: Knowledge TOC is static (always visible; no collapse control / expand arrow); no “Documents” chrome label — category labels are enough
- Rule: Knowledge TOC rows use title + `id · status|date` secondary (Research uses status, not verdict); Product is `Product map` / `PRODUCT · active`
- Rule: Knowledge TOC titles clamp to **2 lines** (full name in tooltip); authored Spec `title`, Decision `title`, Research `question`, Release `summary` must be ≤60; UI still truncates past 60 with ellipsis inside the clamp
- Rule: Knowledge TOC list items are separated by a hairline divider between consecutive rows
- Rule: Knowledge search is a single-line 36px control (same as table pages); never a tall multi-line box
- Rule: Knowledge detail header is **title + id/copy on one row**, then outcome below; Status glance + Brief / Connections / Files / Built by / Change log / Audits — no path byline and no `<details>` document-meta dropdown
- Rule: Knowledge document titles (`.knowledge-detail .phase-name`) are 24px — a step above shared `--detail-title-size` (22px); TOC primary lines use `--fs-base`
- Rule: Knowledge Brief prose headings stay smaller than section labels (`now-label`)
- Rule: Knowledge Status glance uses shared slots — Type/Status · Feature/Area · Created/Amended · Version proxy/Built by; Product uses the same slots with honest “—” / `living`
- Rule: Glance label is **Amended** (not “Last amended”); **Version proxy** = stand-in for semver (`last_amended` phase id, else `living`)
- Rule: Knowledge detail has one vertical scroll pane (`.knowledge-doc`); `.knowledge-detail` must not nest a second `overflow: auto`
- Rule: Knowledge Change log and Audits project activity journal rows with matching `ref` (no invented per-file git history)
- Rule: Knowledge markdown links and Connections buttons navigate in-page via `data-knowledge-link` for `PRODUCT`, `SPEC-*`, `D-nnn`, `R-nnn`, `RELEASE-nnn`
- Rule: `/api/doc` serves Feature/Area/Research files by id, Decision slices from `DECISIONS.md`, and Release slices from `RELEASES.md`

## Boundaries

Does not replace Docs (beginner guide) or System/COMMANDS.md (agent SSOT).

## Dependencies

Rests on SPEC-A-PRAXIS.
