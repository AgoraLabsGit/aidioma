---
schema_version: 1
id: DASH-SPEC-V1
title: Development Dashboard V1
status: draft
owner: founder
implements: DEV-SYSTEM-V3
---

# Development Dashboard V1

A local read-only projection of the development system. It answers, in three seconds: what am I
doing, what happened, what exists, what's broken.

**Non-goals for V1:** firing commands, editing artifacts, remote access, auth, charts,
multi-project support, mobile.

---

## 1. Boundary

The dashboard is a **projection**. `Docs/` and `.work/` are written only by commands running in
the IDE or terminal. The dashboard never writes to either.

| | Writer | Reader |
|---|---|---|
| `Docs/`, `.work/activity/` | Commands (Cursor, terminal) | Indexer |
| `.work/index.json` | Indexer | Dashboard |

The only bridge back to the user's workflow is **copy-to-clipboard** on every command string.
Two-way control is a separate product.

---

## 2. Architecture

```
primary Docs/** + .work/activity ─┐
active phase worktree (overlay) ──┼─→ chokidar ─→ debounce 300ms ─→ derive() ─→ projection
git-common-dir/worktrees (meta) ──┤                                      │
                                  └──────────────────────────────────────┘
                                                                         ▼
                                           dashboard UI ←── SSE /api/events
```

**One `derive()` module** (V3 §7). `/status`, other commands, and the dashboard all call it.
The dashboard watches files, re-runs `derive()`, and serves the projection. It does not invent a
second derivation engine. Authored `Docs/` files are never written by the dashboard.

**Docs home (D-020):** When `.worktrees/docs` exists (branch `docs/ssot`; `npm run work:docs-home`),
`/dashboard` and `derive()` root there for `Docs/` + `.work/`. No phase overlay. Agents write
Docs/System/skills only in that worktree.

**Interim (D-018) — only if Docs home absent:** primary-rooted index; if exactly one linked
worktree has an `active`/`blocked` phase, overlay that tree’s phases, HANDOFF, Research, WORK,
activity. Heartbeat may show `live PHASE-nnn (branch)`. `projection_roots.docs_home` is set when
D-020 is active; `overlay*` fields apply only in interim mode.

- Lives under `Docs/System/dashboard/` with shared `Docs/System/derive/`; launched by `/dashboard`
- Local single process, no database; stack may stay the existing server or move to Next — decide in PHASE-001
- Parsers: frontmatter + YAML + markdown body render + `chokidar` (watch)
- Port fixed; `/dashboard` stops stale servers before starting (V3 §7 runtime hygiene)
- Watches Docs-home (or primary ± overlay) `Docs/` + `.work/activity/`
- Also watches `<git-common-dir>/worktrees` (when present) so linked worktree
  add/remove/prune/branch moves reindex without a manual refresh

### Watcher contract

| Requirement | Rule |
|---|---|
| Rebuild strategy | Full re-derive on any change. No incremental invalidation. |
| Debounce | 300ms — a branch switch must produce one rebuild, not hundreds |
| Worktree meta | Watch `<git-common-dir>/worktrees` only (not checkout trees) so ordinary edits do not storm rebuilds |
| Fail soft | Per-file try/catch. A malformed file becomes a `parse_error` row, never a crash |
| Validate | Unresolvable `depends_on`, `decisions`, `affects`, `amends_specs` ids become `broken_link` rows |
| Heartbeat | Stamp `indexed_at` on every build; UI displays it with a manual reindex button |
| Budget | Fast cycle < 200ms at 500 files |

### Two cycles

Path-derived signals require scanning the whole repo and running `git log` per spec. Coupling
that to the file watcher would blow the 200ms budget on every keystroke.

| Cycle | Trigger | Computes |
|---|---|---|
| **Fast** | File change, 300ms debounce | Everything parsed from `Docs/` and `.work/` |
| **Slow** | On demand + every 5 min | `drift_days`, `file_count`, `unspecified`, `dead_spec` |

Slow-cycle values are cached and carry their own `paths_scanned_at` timestamp, displayed on
Issues. A stale slow cycle degrades one column; it never blocks the page.

Pages render `index.json` and hold no logic.

---

## 3. `index.json` schema

```json
{
  "indexed_at": "2026-08-05T14:22:31Z",
  "paths_scanned_at": "2026-08-05T14:19:02Z",
  "repo": {"branch": "phase-007", "clean": false, "ahead": 3, "behind": 0},

  "phases": [{
    "id": "PHASE-007",
    "title": "Translation provider integration",
    "type": "build",
    "proof_kind": "visual",
    "state": "active",
    "order": 7,
    "owner": "founder",
    "outcome": "Learner sees Spanish translation on the practice page",
    "proof": "Screenshot + passing integration test",
    "non_goals": ["caching", "offline mode"],
    "amends_specs": ["SPEC-F-TRANSLATION", "SPEC-A-AI"],
    "opened": "2026-08-05", "closed": null, "lessons": null,
    "age_days": 3,
    "activity_count": 6
  }],

  "specs": [{
    "id": "SPEC-F-TRANSLATION",
    "kind": "feature",
    "title": "Translation",
    "status": "active",
    "superseded_by": null,
    "depends_on": ["SPEC-A-AI", "SPEC-A-API"],
    "vendor": null,
    "decisions": ["D-012"],
    "built_by": ["PHASE-007"],
    "last_amended": "PHASE-007",
    "research": ["R-004"],
    "paths": ["apps/web/app/practice/**"],
    "used_by": [],
    "blast_radius": 0,
    "drift_days": null,
    "file_count": 12
  }],

  "decisions": [{
    "id": "D-012", "title": "Translation provider: DeepL",
    "date": "2026-08-05", "phase": "PHASE-007", "from": "R-004",
    "affects": ["SPEC-A-AI"], "chose": "DeepL over Google, GPT-4o",
    "why": "…", "revisit_if": "…", "supersedes": null, "superseded_by": null
  }],

  "research": [{
    "id": "R-004", "question": "Best EN→ES translation API",
    "verdict": "DeepL", "status": "fresh", "informed": ["D-012"],
    "affects": ["SPEC-A-AI"], "phase": "PHASE-007",
    "date": "2026-08-05", "age_days": 0
  }],

  "work": [{
    "id": "W-031", "kind": "fix", "summary": "Practice page crashes on empty input",
    "status": "open", "feature": "SPEC-F-TRANSLATION", "area": null,
    "phase": null, "opened": "2026-08-05", "age_days": 0
  }],

  "releases": [{
    "id": "RELEASE-004", "date": "2026-08-05",
    "phase": "PHASE-007", "summary": "Translation live"
  }],

  "activity": {
    "current_month": [{
      "ts": "2026-08-05T14:22:00Z", "type": "research", "actor": "agent",
      "cmd": "/research", "phase": "PHASE-007", "ref": "R-004",
      "status": "complete", "duration_s": 94,
      "summary": "Best EN→ES translation API → DeepL"
    }],
    "months": ["2026-06", "2026-07", "2026-08"],
    "total": 412
  },

  "issues": [{
    "kind": "fix | blocked | contested | broken_link | parse_error | drift | unspecified | dead_spec | stale_research",
    "ref": "FIX-031", "summary": "…", "spec": "SPEC-F-TRANSLATION",
    "age_days": 2, "severity": "high | medium | low"
  }],

  "handoff": {"updated_at": "2026-08-05T09:10:00Z"},
  "last_check": {"status": "pass", "ts": "2026-08-05T13:55:00Z"},
  "in_production": {"release": "RELEASE-004", "date": "2026-08-05"},
  "next_command": "/run",
  "projection_roots": {
    "primary": "/path/to/repo",
    "overlay": "/path/to/repo/.worktrees/phase-007",
    "overlay_phase": "PHASE-007",
    "overlay_branch": "phase/007-command-system-audit"
  },
  "overlay_doc_paths": [
    "Handoffs/HANDOFF.md",
    "Roadmap/Phases/PHASE-007-command-system-audit.md",
    "Research/R-003.md",
    "WORK.yaml"
  ]
}
```

### Derived fields

Computed by the indexer; never authored.

| Field | Derivation |
|---|---|
| `used_by`, `blast_radius` | Reverse of every feature's `depends_on` |
| `drift_days` | Days since git last touched a file matching `paths`, minus `last_amended` phase close |
| `file_count` | Files matching `paths` |
| `age_days` | Today minus `opened` / `date` |
| `activity_count` | Events with matching `phase` |
| `work[]` | Authored `WORK.yaml` ledger |
| `issues[]` | Derived health signals only (see §5 Signals) |
| `next_command` | From active phase state (see §5) |
| `in_production` | Last `ship` event / last `RELEASES.md` entry |
| `projection_roots` | Primary worktree path + optional active-phase overlay (D-018) |
| `overlay_doc_paths` | Docs-relative paths read from the overlay root |

---

## 4. Shell

```
┌────────┬─────────────────────────────────────────────────┐
│ Praxis │ Active · Work · Roadmap · Activity · Knowledge   │
│ Active │                    indexed 3s ago [⟳]            │
│ Work   ├─────────────────────────────────────────────────┤
│ …      │ search + filters (one row) · table (header + Sort) │
│ ⚠ 📄 ◐ │  ← foot icons: Signals · Docs · Theme (not nav)  │
└────────┴─────────────────────────────────────────────────┘
        detail pane (resizable) slides from right on row click
```

- Every page except **Active** is a table (Knowledge and Docs are document viewers).
- Row click → detail pane: frontmatter fields on top, markdown body fetched and rendered on
  demand via `/api/doc?id=`. Bodies are never embedded in `index.json`.
- Cross-links: any id in any cell is clickable and routes to its artifact.
- Stale heartbeat (>60s) turns the indicator amber.
- **Signals** and **Docs** are not main-nav tabs. Open them from the sidebar-foot icon row.
- Sidebar-foot: one horizontal **icon-only** row — Signals · Docs · Theme (matched chrome;
  labels via `title` / `aria-label` only).

### Visual register

| | |
|---|---|
| Type | System sans for UI; monospace for ids, paths, timestamps, page titles, and panel titles |
| Density | ~32px rows, no card padding, table-first |
| Status | Colored dot **plus** text label — never color alone |
| Chrome | Sidebar nav + table pages. No charts / analytics widgets in V1 |
| Light theme | Cream shell (`#ebe6df`) + warm paper panels (`#f3efe7`); no pure white / cool blue-grey |
| Chrome fill | Nav / detail / Knowledge TOC = page `--bg`; tables + elevated cards = `--surface` |

Phase state colors (Status pills + Roadmap State chips; unique hues):
active blue · ready cyan · proposed amber · blocked purple · closed green · canceled red.

Other statuses: done/complete/ok/fixed/fresh green · open/contested/stale amber ·
failed/dropped red · superseded grey · promoted blue.

Status/severity filter chips use the same hues: Work Open amber / Closed green;
Signals Open amber / Closed(fixed) green; severity high red · medium amber · low muted.

**Table toolbar (Roadmap, Activity, Work, Signals):**
- Primary row keeps search + status/kind/type chips only — do **not** add Feature/Area as
  chips on that row.
- **Filters** control opens a pop-up panel for deeper filters: Feature and Area (All + values
  present on that page’s rows; optional Untagged). Badge when either is active.
- **Reset** restores that page’s filters, search, sort, and sort direction to defaults.
- Column header click sorts; **second click on the same column reverses** direction (▴ asc /
  ▾ desc). Persists as `sort` + `sortDir` with page filters.
- Activity Feature/Area resolve from the event’s phase row when present.

Preferences (localStorage): last page; each table page’s chips + sort + sortDir + Feature/Area
(survive refresh). **Search `q` is not persisted** (F-008) — leftover search hid new Work rows
while Activity still showed them.

---

## 5. Pages

### Active

The only non-table overview page (formerly Now). Opened every morning. Layout stacks
one card per `active`/`blocked` phase so parallel phases do not collapse into one hero.
**Active and the Roadmap detail pane share one `renderPhaseView` layout.**

| Block | Content |
|---|---|
| Header | id + title + `outcome` (state/type live in Status only) |
| Status | Two-column glance (4+4) — left: state, type, owner, opened · right: proof_kind, git, check, issues |
| Phase card | One card, sections: **Brief** (`## Brief` else `## Context` + out of scope), **Context** (`context_paths`, honest empty), Plan, Proof, Dependencies (`depends_on`), Specs amended (`amends_specs`), Inputs (body), Files (ownership trees), Work/Signals, **Activity** (events with phase/ref), **Audits** (latest `/audit` activity for phase or honest “not run”), **Tests** (`last_check` or “not run”; build always, design when a check exists). **Tables vs lists:** authored `\|` markdown → real `.md-table`. Numbered Plan / proof checklist → row+divider lists. Out of scope → plain bullets. (D-024) |
| Commands panel | Header icon **left of** reindex opens a read-only command map (class + does + May invoke). Copy-to-clipboard cmd names only — no run buttons (D-019). |
| Handoff | Below the phase stack on Active only — `HANDOFF.md` with `updated_at` |

**Index vs body:** `index.json` is frontmatter-only (D-006). Named body sections load on demand via
`/api/doc`. Do not show empty Audits/Tests slots until derive projects them. Schema heading
renames wait until real phase + spec data exists.

**Blocked phases** show their reason (from the phase file's Context) in place of the next
command, and also appear on Issues as `kind: blocked`, severity high.

`next_command` remains in `index.json` for `/status` and agents. **It is not shown in the
Active UI** (founder removed the command bar / suggested-next box).

### Roadmap

| ID | Order | Kind | Summary | Feature | Area | Status | Age |

- **Order** = 1-based schedule step from `depends_on` depth → frontmatter `order` → id (not the raw `order` field)
- **Default sort: schedule** — **active phase(s) first**, then remaining phases by that Order
  ranking; click ID or Order to restore it
- **Sortable headers:** every column except Summary (ID, Order, Kind, Feature, Area, Status, Age)
- Design phases visually distinct from build
- Canceled rows show `lessons` inline
- Filters: state, type (`design` | `build`); Feature/Area via Filters panel; Reset

### Activity

| ID | Kind | Summary | Feature | Area | Status | Age |

- Projects `.work/activity/*.jsonl` only (D-008). UI label stays **Activity**.
- **Page job (D-023): process / ops spine** — not the outcome flight recorder.
  Outcome trails live on **Work** / **Phase** detail (D-022). Journal file still stores all events.
- **Allowlist (hard):** page never lists outcome types (`fix`, `task`, `log`, `research`,
  `design`, `decide`, `spec`, `plan`, `build`, `audit`, `capture`, …).
  - **Default (Type All):** `handoff`, `close`, `check`, `ship` only
  - **Type chips ⊆** `{handoff, close, check, ship, launch, dashboard, status, triage, system}`
    — optional ops chips are not included in default All; no outcome-type chips from raw journal
- Reverse chronological; toolbar = search + Type chips on one row (no Actor/Phase filters; no Sort select)
- Summary is plain text (no actor sub-line); capped at 80 chars with full tooltip
- **Status column:** when `ref` matches a Work id, show **current** `WORK.yaml` status (ledger
  SSOT) — not the historical event status. Prevents a start event with `status: active` from
  staying “active” after the Work row is `done`. Non-work events map `complete` → `done`.
  Tooltip keeps the raw event status.
- **Sortable headers:** every column except Summary
- ID shows ref (phase as secondary when different)
- Feature/Area columns + panel filters resolve from the event phase when present
- Empty: “No process events yet. Outcome work → Work; phase runs → Active detail.”
- **Per-feature timeline** — later: selecting a spec filters its ref chain

### Knowledge

Artifact browser (PHASE-006): fixed toolbar (search + Type chips) + left **TOC** grouped
**Product · Feature Specs · Area Specs · Decisions · Research · Releases** + full-page
phase-view detail via `/api/doc` (Status glance + Brief / Connections / Files / …). Not four
tabbed tables. Feature Specs ≠ Area Specs. Mock fixtures (`SPEC-*-MOCK-KNOWLEDGE`,
`RELEASE-000`) prove connections until PHASE-008 molds land.

`PRODUCT.md` / Product map is the default document when Knowledge opens.
Behavior SSOT: `SPEC-F-DEV-DASHBOARD` Knowledge rules.

### Docs

Beginner Praxis guide (D-026 chrome + D-027 content). **Not** Knowledge (artifact browser).
**Not** `COMMANDS.md` (agent SSOT / Commands panel).

| | |
|---|---|
| Page id | `docs` (title **Docs**) |
| Entry | Sidebar-foot Docs control only (not main nav) |
| Content | Customer-facing `START.md` + `COMMANDS-OVERVIEW.md` via `/api/doc` (TOC titles only) |
| Non-goals | Edit from UI; project `System/COMMANDS.md`; replace Commands panel; ship full `system.md` |

Detail pane stays closed on Docs (full-page reader, same class as Knowledge).

### Work

Authored **outcome** ledger from `WORK.yaml`. Separate from Signals (D-011) and from Activity’s
process spine (D-023). Plan/design/research/audit are outcome work (correct homes), not Activity-page rows.

| ID | Kind | Summary | Feature | Area | Status | Age |

Kinds: `fix` · `task` · `proposal` · `research` · `question` · `audit` · `design` (`S-nnn`).
Status filters: Open = `open`+`active`; Closed = `done`+`promoted`+`dropped`.
Table summaries capped at 80 chars (tooltip = full). **Default sort: Age newest-first**
(`sort: age`, `sortDir: desc`). **Sortable headers:** every column except Summary (ID, Kind,
Feature, Area, Status, Age). Click toggles **asc/desc** (▴/▾); persists with filters until the
user changes them or Reset. No Sort select.
**Age:** prefer `opened` as UTC ISO datetime (real relative time). Date-only `YYYY-MM-DD`
(legacy) shows calendar days (`today` / `Nd ago`) — never hours-from-midnight.
`/fix` `/task` `/audit` `/research` `/design` write `status: active` + ISO `opened` **before** other edits.
Feature/Area via Filters panel; Reset restores defaults.

Detail pane: glance fields + optional `note` + **Open questions** + **Done summary** +
**Activity** (derived: `.work/activity` events with `ref === work.id`, newest first — includes
outcome types excluded from the Activity page). Clarifications live on the row — not as sibling
`question` rows. Durable outcome commands must upsert a Work row so their trail appears here (D-022).

### Signals

Derived health only. This page is where `paths` visibly pays off.
**UI label is Signals** (supersedes D-007 Issues-for-everything).
**Entry:** sidebar-foot Signals control only (not main nav). Always visible; alert style when open high-severity > 0.

| Kind | Ref | Summary | Spec | Age | Severity | Status |

| Kind | Source | Severity | Status |
|---|---|---|---|
| `blocked` | Phase `state` | high | `open` |
| `contested` | Spec `status` | high | `open` |
| `broken_link` | Unresolvable id reference | high | `open` |
| `parse_error` | Malformed frontmatter/YAML | high | `open` |
| `drift` | Code changed since `last_amended` | medium | `open` |
| `unspecified` | File matched by no spec's `paths` | medium | `open` |
| `dead_spec` | `paths` match no files | low | `open` |
| `stale_research` | `Research/` older than 90 days | low | `open` |

Rows from the slow cycle (`drift`, `unspecified`, `dead_spec`) display `paths_scanned_at`.

Default sort: severity, then age (severity via filter chips — not via Summary header).
**Sortable headers:** every column except Summary (ID, Kind, Feature, Area, Status, Age).
Filters: status (All / Open / Closed=fixed), kind, severity; Feature/Area via Filters panel; Reset.
Foot controls: Signals · Docs · Theme — one icon-only row, matched badge chrome (bordered, same
height/icon slot). Visible text labels omitted; `title`/`aria-label` required. Signals alert
style when open high-severity > 0; accessible name may include count (e.g. `3 signals`).

---

## 6. Empty states

Day one has no specs, no decisions, no activity, and no `paths` anywhere. Without handling, Issues
would list every source file as `unspecified` and the dashboard would look broken on first run.

| Condition | Behavior |
|---|---|
| No artifacts of a type | Panel naming the command that creates it — "No specs yet. Run `/design`." |
| No spec declares `paths` | Suppress `unspecified` and `dead_spec` entirely |
| No activity yet | "Commands will appear here as they run" |
| No phase active | Now shows `/plan` or `/run`, whichever applies |

Empty is a valid state, not an error state. It should read as a system waiting, not a system
failing.

---

## 7. Build order

| Step | Delivers |
|---|---|
| 1 | Indexer + `index.json` + heartbeat |
| 2 | Shell, routing, detail pane |
| 3 | Now |
| 4 | Roadmap |
| 5 | Activity |
| 6 | Knowledge |
| 7 | Issues + slow cycle (the largest step — full repo scan and git log) |

Steps 1–4 are independently useful. Step 7 depends on specs having populated `paths`.

---

## 8. Acceptance

- Save a spec in the IDE → row updates in under 1s
- Run `/fix` in the terminal → row appears on Issues in under 1s
- `git checkout` another branch → exactly one rebuild
- Malformed frontmatter → one `parse_error` row, dashboard still renders
- Kill the watcher → heartbeat goes amber within 60s
- First run on an empty repo → every page shows a named next command, no false `unspecified` rows
- Slow cycle stale → drift column marked, page still renders
- Roadmap answers "what is the state of this project" in three seconds, no clicks

### Projection proof (PHASE-004)

- Active / Roadmap / Detail fields come from phase frontmatter, `/api/doc`, or index — no hardcoded phase payloads in dashboard JS
- Issues: open FIX rows under Open; fixed FIX rows under Closed; other kinds remain
- Activity: events from `.work/activity/`; new command appends a line and appears after reindex
- Time: "ago" / age columns match source timestamps (`ts`, `opened`, `indexed_at`)
- Sort/filter chips and clickable column headers on Roadmap, Activity, Work, Signals change the visible rows correctly; Summary never sortable; all other columns sortable
- `PHASE-099` appears only because its phase `.md` exists (never mocked in JS)
- `specs/Dashboard-spec.md` stays under `Docs/System/` until a later promote-to-`SPEC-*` decision (D-009)
- Schema/derive module changes require restarting `/dashboard` (file watch re-derives data, not reloaded Zod enums)