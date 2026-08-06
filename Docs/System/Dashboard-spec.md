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
Docs/**/*.md ─┐
Docs/FIXES.yaml ─┼─→ chokidar ─→ debounce 300ms ─→ derive() ─→ projection
.work/activity/*.jsonl ─┘                                              │
                                                                       ▼
                                         dashboard UI ←── SSE /api/events
```

**One `derive()` module** (V3 §7). `/status`, other commands, and the dashboard all call it.
The dashboard watches files, re-runs `derive()`, and serves the projection. It does not invent a
second derivation engine. Authored `Docs/` files are never written by the dashboard.

- Lives under `Docs/System/dashboard/` with shared `Docs/System/derive/`; launched by `/dashboard`
- Local single process, no database; stack may stay the existing server or move to Next — decide in PHASE-001
- Parsers: frontmatter + YAML + markdown body render + `chokidar` (watch)
- Port fixed; `/dashboard` stops stale servers before starting (V3 §7 runtime hygiene)

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

  "fixes": [{
    "id": "FIX-031", "summary": "Practice page crashes on empty input",
    "status": "open", "spec": "SPEC-F-TRANSLATION",
    "opened": "2026-08-05", "age_days": 0
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
  "next_command": "/run"
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
| `issues[]` | Union of `FIXES.yaml` plus derived signals (see §5 Issues) |
| `next_command` | From active phase state (see §5) |
| `in_production` | Last `ship` event / last `RELEASES.md` entry |

---

## 4. Shell

```
┌────────┬─────────────────────────────────────────────────┐
│ AIdioma│ Active · Roadmap · Activity · Knowledge · Issues │
│ Active │                          indexed 3s ago [Refresh]│
│ Roadmap├─────────────────────────────────────────────────┤
│ …      │ search + filters (one row) · sortable table      │
└────────┴─────────────────────────────────────────────────┘
        detail pane (resizable) slides from right on row click
```

- Every page except **Active** is a table (Knowledge is a document viewer).
- Row click → detail pane: frontmatter fields on top, markdown body fetched and rendered on
  demand via `/api/doc?id=`. Bodies are never embedded in `index.json`.
- Cross-links: any id in any cell is clickable and routes to its artifact.
- Stale heartbeat (>60s) turns the indicator amber.

### Visual register

| | |
|---|---|
| Type | System sans for UI, monospace for ids, paths, timestamps |
| Density | ~32px rows, no card padding, table-first |
| Status | Colored dot **plus** text label — never color alone |
| Chrome | Sidebar nav + table pages. No charts / analytics widgets in V1 |

Status colors: active/fresh green · blocked/contested amber · canceled/superseded grey ·
failing/drift red.

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
| Phase card | One card, sections: Context (+ out of scope), Plan, Proof, Dependencies (`depends_on`), Specs amended (`amends_specs`), Inputs (body), Files, Issues, Audits (stub), Tests (stub, build only). **Tables vs lists:** authored `\|` markdown → real `.md-table` (key→value maps like Inputs). Numbered Plan / proof checklist → row+divider lists. Out of scope → plain bullets (no table chrome). Never `display:grid`/`flex` on prose `<li>` with mixed inline nodes (breaks `code`). |
| Handoff | Below the phase stack on Active only — `HANDOFF.md` with `updated_at` |

**Index vs body:** `index.json` is frontmatter-only (D-006). Named body sections load on demand via
`/api/doc`. Do not show empty Audits/Tests slots until derive projects them. Schema heading
renames wait until real phase + spec data exists.

**Blocked phases** show their reason (from the phase file's Context) in place of the next
command, and also appear on Issues as `kind: blocked`, severity high.

`next_command` remains in `index.json` for `/status` and agents. **It is not shown in the
Active UI** (founder removed the command bar / suggested-next box).

### Roadmap

| ID | Title | Type | State | Proof kind | Specs | Age |

- Ordered by `order`; grouped by state: active → ready → proposed → closed → canceled
- Design phases visually distinct from build
- Canceled rows show `lessons` inline — the highest-value column
- Blocked rows pinned below active
- Filters: state, type (`design` | `build`)

### Activity

| Time | Type | Actor | Ref | Summary | Phase |

- Projects `.work/activity/*.jsonl` only (D-008). UI label stays **Activity**.
- Reverse chronological, virtualized, paged by month partition
- Filters: `type`, `actor`, `phase`, date range
- **Agent/user toggle** — answers "what did the agent do while I was away"
- **Ref vs Phase** — show both when they differ; merge into one cell when identical
- **Per-feature timeline** — selecting a spec filters to its ref chain in chronological order:
  research → decision → spec → build → ship → fix

The per-feature timeline is the view that justifies the event log.

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

### Issues

One table, all signals. This page is where `paths` visibly pays off.
**UI label is Issues** (D-007); `FIXES.yaml` remains the authored fix ledger.

| Kind | Ref | Summary | Spec | Age | Severity | Status |

| Kind | Source | Severity | Status |
|---|---|---|---|
| `fix` | `FIXES.yaml` open | high | `open` |
| `fix` | `FIXES.yaml` fixed | low | `fixed` (Closed filter) |
| `blocked` | Phase `state` | high | `open` |
| `contested` | Spec `status` | high | `open` |
| `broken_link` | Unresolvable id reference | high | `open` |
| `parse_error` | Malformed frontmatter/YAML | high | `open` |
| `drift` | Code changed since `last_amended` | medium | `open` |
| `unspecified` | File matched by no spec's `paths` | medium | `open` |
| `dead_spec` | `paths` match no files | low | `open` |
| `stale_research` | `Research/` older than 90 days | low | `open` |

Rows from the slow cycle (`drift`, `unspecified`, `dead_spec`) display `paths_scanned_at`.

Default sort: severity, then age. Filters: status (Open default / Closed=fixed / All), kind, severity.
Header issue pill counts **open** high-severity only.

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
- Sort/filter chips on Roadmap, Activity, Issues change the visible rows correctly
- `PHASE-099` appears only because its phase `.md` exists (never mocked in JS)
- `Dashboard-spec.md` stays under `Docs/System/` until a later promote-to-`SPEC-*` decision (D-009)