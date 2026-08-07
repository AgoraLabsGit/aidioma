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
                                  │                                      │
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

### Watcher contract

| Requirement | Rule |
|---|---|
| Rebuild strategy | Full re-derive on any change. No incremental invalidation. |
| Debounce | 300ms — a branch switch must produce one rebuild, not hundreds |
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
│ AIdioma│ Active · Work · Roadmap · Activity · Knowledge   │
│ Active │                    indexed 3s ago [⟳]            │
│ Work   ├─────────────────────────────────────────────────┤
│ …      │ search + filters (one row) · table (header + Sort) │
│ ● N    │  ← foot pill opens Signals (not in main nav)     │
└────────┴─────────────────────────────────────────────────┘
        detail pane (resizable) slides from right on row click
```

- Every page except **Active** is a table (Knowledge is a document viewer).
- Row click → detail pane: frontmatter fields on top, markdown body fetched and rendered on
  demand via `/api/doc?id=`. Bodies are never embedded in `index.json`.
- Cross-links: any id in any cell is clickable and routes to its artifact.
- Stale heartbeat (>60s) turns the indicator amber.
- **Signals** is not a main-nav tab. Open it from the sidebar-foot status pill.

### Visual register

| | |
|---|---|
| Type | System sans for UI, monospace for ids, paths, timestamps |
| Density | ~32px rows, no card padding, table-first |
| Status | Colored dot **plus** text label — never color alone |
| Chrome | Sidebar nav + table pages. No charts / analytics widgets in V1 |

Phase state colors (Status pills + Roadmap State chips; unique hues):
active blue · ready cyan · proposed amber · blocked purple · closed green · canceled red.

Other statuses: done/complete/ok/fixed/fresh green · open/contested/stale amber ·
failed/dropped red · superseded grey · promoted blue.

Status/severity filter chips use the same hues: Work Open amber / Closed green;
Signals Open amber / Closed(fixed) green; severity high red · medium amber · low muted.

Preferences (localStorage): last page; each table page’s filters + sort (survive refresh).

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
| Phase card | One card, sections: Context (+ out of scope), Plan, Proof, Dependencies (`depends_on`), Specs amended (`amends_specs`), Inputs (body), Files, Work/Signals, **Audits** (latest `/audit` activity for phase or honest “not run”), **Tests** (`last_check` or “not run”; build always, design when a check exists). **Tables vs lists:** authored `\|` markdown → real `.md-table`. Numbered Plan / proof checklist → row+divider lists. Out of scope → plain bullets. |
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
- **Default sort: schedule** — same ranking; click ID or Order to restore it
- Status / Kind / Age column headers still sort
- Design phases visually distinct from build
- Canceled rows show `lessons` inline
- Filters: state, type (`design` | `build`)

### Activity

| ID | Kind | Summary | Feature | Area | Status | Age |

- Projects `.work/activity/*.jsonl` only (D-008). UI label stays **Activity**.
- Reverse chronological; toolbar = search + Type chips on one row (no Actor/Phase filters; no Sort select)
- Summary is plain text (no actor sub-line); capped at 80 chars with full tooltip
- Clickable column headers sort (Kind, Age); ID shows ref (phase as secondary when different)
- **Per-feature timeline** — later: selecting a spec filters its ref chain

### Knowledge

Four tables on one page, tab-switched. Hold the line at four.

**Specs**

| ID | Kind | Title | Status | Depends on | Used by | Decisions | Last amended | Drift |

- Features and Areas filterable; areas show `blast_radius` in Used by
- Contested rows flagged amber, superseded greyed and hidden by default

**Decisions**

| ID | Date | Title | Chose | Affects | Phase | From |

**Research**

| ID | Date | Question | Verdict | Status | Affects | Phase |

- `phase: null` rows grouped as *Unassigned findings*
- `stale` (>90d) badged amber

**Releases**

| ID | Date | Phase | Summary |

`PRODUCT.md` renders as a header panel above the tabs — who it's for, what it does, what it never
does.

### Work

Authored ledger from `WORK.yaml`. Separate from Signals (D-011).

| ID | Kind | Summary | Feature | Area | Status | Age |

Kinds: `fix` · `task` · `proposal` · `research` · `question` · `audit`.
Status filters: Open = `open`+`active`; Closed = `done`+`promoted`+`dropped`.
Table summaries capped at 80 chars (tooltip = full). Sort via column headers (no Sort select).

Detail pane: glance fields + optional `note` + **Open questions** (`open_questions`) + **Done
summary** (`done_summary`). Clarifications live on the row — not as sibling `question` rows.

### Signals

Derived health only. This page is where `paths` visibly pays off.
**UI label is Signals** (supersedes D-007 Issues-for-everything).
**Entry:** sidebar-foot pill only (not main nav). Always visible; alert style when open high-severity > 0.

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

Default sort: severity, then age. Filters: status (All / Open / Closed=fixed), kind, severity.
Foot pill label: `● Signals` when no open high-severity; `● N signal(s)` when N > 0.

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
- Sort/filter chips and clickable column headers on Roadmap, Activity, Work, Signals change the visible rows correctly
- `PHASE-099` appears only because its phase `.md` exists (never mocked in JS)
- `specs/Dashboard-spec.md` stays under `Docs/System/` until a later promote-to-`SPEC-*` decision (D-009)
- Schema/derive module changes require restarting `/dashboard` (file watch re-derives data, not reloaded Zod enums)