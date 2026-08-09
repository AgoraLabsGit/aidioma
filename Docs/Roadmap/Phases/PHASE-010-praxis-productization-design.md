---
id: PHASE-010
title: Praxis productization design
type: design
proof_kind: spec
state: ready
order: 10
depends_on:
  - PHASE-011
from_backlog: P-002
owner: founder
outcome: "Locked Product + Area + Feature specs describe productized Praxis (extension UI + praxis CLI foreman + pluggable agent runners + auth/hosting posture) so a later build phase can implement without re-deriving architecture from chat."
proof: "Docs/PRODUCT.md filled for Praxis; new/amended SPEC-A-* and SPEC-F-* listed in Plan exist with Behavior Rules; D-032–D-049 remain consistent; Required Adv on Product + core Areas including auth/hosting/distribution."
non_goals:
  - Implementing the VS Code extension or praxis CLI packages
  - Publishing to Marketplace / Open VSX
  - Theia/Electron desktop ship
  - Mastra/Temporal/Gateway in-process agent spine
  - Primary Praxis chat product or Option B (webview + vscode.lm)
  - Per-IDE SDK adapter matrix as product spine
  - React rewrite of the dashboard
  - Implementing Clerk/Auth0 or production hosting (spec only)
  - Shared Docs CMS or full enterprise ACL product
  - Learner AIdioma curriculum map (PHASE-002) — deferred; do not block on it
  - Hard parallel active-phase runtime (W-015)
  - Running this phase from AIdioma Docs home after PHASE-011 — run in Praxis.v2
amends_specs:
  - SPEC-A-PRAXIS
feature: null
area: SPEC-A-PRAXIS
context_paths:
  - Docs/PRODUCT.md
  - Docs/Research/R-006.md
  - Docs/DECISIONS.md
  - Docs/Roadmap/Phases/PHASE-010-praxis-productization-design.md
  - Docs/Specs/
opened: 2026-08-08
closed: null
lessons: null
---

# PHASE-010 — Praxis productization design

## Context

PHASE-011 extracts Praxis into **Praxis.v2**. A founding session locked the productized shape:
IDE extension + CLI foreman (+ optional web control plane). This design phase (run **in
Praxis.v2**) turns that seed into Product / Area / Feature specs. No product code.

## Inputs

- Decisions: D-032–D-047 (from R-006 + auth/hosting)
- Research: R-006
- Prerequisite: PHASE-011 closed (Praxis.v2 repo)
- Specs touched: SPEC-A-PRAXIS (relationship to productized Areas); new specs listed below
- Anchors: AIDLC (`aidlc-io/aidlc`), Zygen Cursor AI SDLC, Spec Kit, OpenSpec; S-008 / SPEC-F-PRAXIS-ACTIVE-FLUSH

## Design seed (from founding session 2026-08-08)

Locked unless marked **OPEN**. `/run` authors full specs from this seed — do not re-derive from chat.

### Product wedge

- Product = **workflow harness / foreman**, not coding-agent or chat brand.
- Ship **VS Code-compatible extension first**; Theia = contingency later (D-032).
- Primary UVP: **proof/close + Work ledger (+ activity)** (D-042).
- Secondary later: cost gates; shared Docs; team audit; SSO/ACL.
- Diff vs comps: multi-runner ABI + durable Work + audited close + decisions bind work
  (not Claude-only pipelines or Cursor-prompt wizards).
- Primary UX = **in-IDE panels**; no user-facing CLI/TUI; `praxis` may run invisibly (D-043).
- **OPEN:** Cursor-first vs VS Code day-one; Marketplace vs Open VSX; v1 SSOT FS/SQLite/remote.

### Architecture (keep vs outsource)

```
IDE panels (extension) → praxis CLI (foreman) → DB/files → agent CLI runners
                         optional host hooks (bouncers)
```

| Keep | Outsource |
|---|---|
| Panels, `praxis` core, ledger, stages/gates/proof/close, activity, Runner ABI, optional `praxis-hook` | IDE shell; coding via `agent` / `claude` / `codex` CLIs + their billing |

- **Avoid as spine:** per-IDE SDKs (D-035). FS + subprocess.
- **ACP** optional later — not core ABI (D-045).
- **Gateway in-process agents** = later escape hatch, not v1 (D-037).

### Component map

| Component | Role |
|---|---|
| **UI** | Webview panels (Work/Run/Close/status). MVP wrap vanilla `Docs/System/dashboard/public` + host bridge (D-041). Not React-required. |
| **CLI/core** | Foreman: claim→stages→gates→spawn runner→proof/close→ledger/activity. Thin `AgentRunner` (~20–50 LOC/CLI). |
| **State** | Work/runs/proofs/activity in SQLite and/or remote DB; repo artifacts may stay on FS. Host/CLI = authority; webview never sole truth writer. |
| **Runners** | Config-driven (`agent -p`, `claude -p`, …). **Availability = PATH + auth probe** (D-056), not chat picker. Shared cwd; wait exit + artifacts. Multi-runner = ABI; prove one first (D-044). |
| **Hooks** | Optional bouncers (S-008 Active-flush lineage). Deny mutations without active Work; **not** the engine (D-040). Force gates without `@praxis`. |
| **IDE** | Folder + buttons/`child_process` → `praxis …`. |

### Runtime clarification

- Workflow runtime = **thin custom stage machine in `praxis` CLI/core** (AIDLC-like), **not** Mastra/LangGraph/Temporal for v1 (D-036, D-037).
- Determinism = next stage + gate pass/fail — not model output truth.
- Steal AIDLC mechanism (`@aidlc/core` + CLI + thin ext); do not copy Claude-only product surface.

### Chat / trigger UX (D-050; revises D-039)

**Founder preference:** use **native IDE chat** as the primary operator surface (one less component to maintain). Dashboard/panels remain **projection / visibility** (as today’s prototype) — **do not assume** in-UI Run/Claim/Close command buttons unless separately specified.

| Option | What it is | Maintain | Determinism |
|---|---|---|---|
| **A. Native chat (preferred MVP)** | User works in Cursor/Claude/VS Code Agent chat; Praxis via skills/`AGENTS.md` + **hooks** (gates) + optional `praxis` CLI invoked by agent or thin glue | Low — no Praxis chat UI | Stage/gate enforcement via hooks + CLI/state; not via a Praxis chat product |
| **B. Lookalike Praxis chat** | Extension webview that **feels like** native chat but send/receive via **agent CLIs** (not `vscode.lm`) | Higher — own chat chrome + stream UX | Same foreman underneath; chat is a skin that shells CLI |

- **Rejected as primary:** Option B from earlier notes that meant webview + `vscode.lm` without CLI; also rejected inventing panel command buttons as the MVP trigger.
- **Routing modes (D-051) — feature, not a bug:**
  - **Auto (default intent):** Agent may classify intent and enter the right Praxis action (`/task`, `/fix`, `/plan`, …) / ledger updates **without** the user typing an explicit slash command. Intelligent auto-route is desired.
  - **Manual:** User must explicitly name the command/action; agent does not auto-pick workflow verbs.
  - Setting lives in Praxis config (project and/or user); enforce via skills + hooks + optional `praxis` checks.
- **OPEN:** MVP ships Auto-only vs both modes; whether `@praxis` Chat Participant (VS Code) is worth it; lookalike chat (B) later or never.
- Coding still happens through **native agent and/or agent CLIs**; Praxis owns ledger/gates/proof + routing policy.

### Distribution — how Praxis gets on the machine (D-049)

**Product route: Extension and/or CLI install.** Web-only cannot put the foreman or agent runners into the IDE.

| Channel | Lands on machine | IDE integration |
|---|---|---|
| **Extension install** (preferred UX) | Bundles or fetches `praxis` on activate; panels in IDE | Yes |
| **CLI install** (`npm i -g` / brew / curl) | `praxis` binary on PATH | Terminal / user wiring; optional thin ext later |
| **Web-only (no ext/CLI)** | Nothing local | **Cannot** spawn local agents or IDE-integrate — control plane only |

- Extension may **bundle** CLI or **download** it — still an on-box install path.
- Repo-local `npx praxis` is a variant of CLI, not a third product surface.
- **Chosen product path:** ship **Extension** (primary) and support **CLI** (CI/power users). Do **not** plan web-only as the way to “get Praxis into the IDE.”

### Hooks — who enforces, how they get installed

**Enforcement runtime = the IDE/agent host** (Cursor / Claude Code / Codex), not the Praxis UI. Host loads hook config and runs hook scripts on tool/session events. Praxis supplies the **policy scripts** (e.g. Active-flush) and optionally a `praxis-hook` helper.

| Install channel | How hooks land |
|---|---|
| **Extension** (primary) | On activate / “Enable Praxis in workspace”: write or merge `.cursor/hooks.json` + `.cursor/hooks/*` (and Claude/Codex equivalents when supported); point commands at bundled/`praxis` hook entrypoints |
| **CLI** | `praxis init` / `praxis hooks install` writes the same project (or user) hook files |
| **Repo template** | Hooks committed in the repo (works even before ext); ext/CLI can refresh/repair |

- Hooks are **host-specific** (Cursor `.cursor/hooks.json` ≠ Claude `settings.json` hooks). Multi-host = multiple installers or adapters.
- Without ext **and** without CLI init, hooks are not auto-present unless the repo already contains them.
- Extension is the low-friction path to “hooks on”; CLI covers headless/CI and non-extension users.

### Per-host install format + model routing (D-053, D-054)

**Goal:** One Praxis product; install artifacts and model routing adapt to the user’s IDE + available models. User can map Praxis actions (`task`, `fix`, `plan`, `close`, …) → preferred model (and/or runner).

**Host install adapters (format correctly per IDE):**

| Detected host | What `praxis init` / Extension writes |
|---|---|
| **Cursor** | `.cursor/hooks.json` + `.cursor/hooks/*`, skills/rules as needed, runner default `agent` |
| **VS Code + Copilot** | VS Code–compatible hooks when available; optional Chat Participant later; skills in supported locations |
| **Claude Code** | Claude hooks/settings + `.claude/skills` / agents as needed; runner default `claude` |
| **Codex** | Codex hooks/config; runner default `codex` |

- Detection: IDE name / which CLIs exist on PATH / user override in `praxis.config`.
- Core policy (Active-flush, routing mode) is **shared**; **file layout is per-host** (thin adapters — not full IDE SDKs).

**Models — two layers:**

| Layer | Where models come from | Praxis control |
|---|---|---|
| **Native chat (MVP path)** | Whatever the IDE model picker exposes | Soft: skills say “prefer X for /fix”; hard pin often **limited** (host owns picker). Document per-host capabilities. |
| **CLI runners** | `agent --model`, `claude --model`, etc. | **Hard:** `praxis.config` action→model (and action→runner) is authoritative when Praxis spawns the CLI |

**Config shape (illustrative — lock in SPEC-F-PRAXIS-CONFIG):**

```toml
[routing]
mode = "auto"  # auto | manual

[models]
# action → model id as understood by the chosen runner
fix = "composer-2.5"          # or claude-… / gpt-…
task = "claude-sonnet-4"
plan = "o3"
default = "auto"                 # defer to IDE/CLI default

[runners]
fix = "cursor"                  # cursor | claude | codex
task = "claude"
default = "cursor"
```

- **Ideal:** tap any model the IDE/CLI makes available; refresh model list via `agent models` / host APIs when present.
- **Honest limit:** “Any IDE model” in **native chat** ≠ guaranteed API to force model per action on every host; **CLI-spawned** steps are where action→model is reliable.
- Extension Settings UI can edit the same `praxis.config` (or sync from hosted).

**Dashboard model list projection (D-055):**

- Dashboard (and Extension settings) can show a **live/refreshable list** of models for action→model pickers.
- **Bridge required** — UI does not read the IDE picker directly:
  - Primary: `praxis models list` → spawn runner CLIs (`agent models` / `--list-models`, Claude/Codex equivalents) → JSON to Dashboard API/webview.
  - When running inside VS Code Extension Host: optionally merge `vscode.lm.selectChatModels()` (Copilot / registered providers).
  - Cursor: do **not** depend on a public “Composer picker” extension API; use CLI list.
- Empty/stale lists: show auth/install hints (`agent login`, CLI missing).
- Spec: fold into `SPEC-F-PRAXIS-CONFIG` and/or `SPEC-F-PRAXIS-MODELS` (list + refresh + bind to action map).

**IDE / host auto-detection (for install adapters):**

| Signal | What it tells us |
|---|---|
| Extension Host `vscode.env.appName` / uiKind | Cursor vs VS Code vs VSCodium / web |
| CLIs on PATH (`agent`, `claude`, `codex`) | Which **runners** can be installed/defaulted |
| User override in `praxis.config` | Force host/runner when detection is wrong |

- Extension **can auto-recognize the IDE** it is running inside (Cursor vs VS Code, etc.) and prefer matching hook/skill layout.
- “Host” for Claude Code / Codex as **separate apps** is not the same as “extension inside Cursor”: detect those primarily via **CLI presence** + user setting, not only `appName`.
- Always allow manual override.

### Runner availability discovery (D-056) — required Feature behavior

**How Praxis knows which runners are available:** probe the **machine**, not the native chat UI.

| Step | Behavior |
|---|---|
| 1. Binary | `command -v` / resolve `agent` (and `cursor-agent`), `claude`, `codex` (names configurable) |
| 2. Health | Run lightweight `--version` / `status` / equivalent; classify **missing** / **present** / **present needs auth** |
| 3. Models (optional) | If healthy, `praxis models list` may call that runner’s model list |
| 4. Override | `praxis.config` can force enable/disable/default runner even when probe differs |
| 5. Surface | `praxis runners list` → JSON; Dashboard + Extension Settings show status (installed / needs login / missing) with install hints |

**Rules for `/run` when authoring `SPEC-F-PRAXIS-RUNNERS`:**

- Rule: Availability is defined by CLI binary discoverability + auth health, **not** by which model is selected in IDE chat.
- Rule: Extension Host probes must document PATH parity with the integrated terminal (login-shell PATH issues).
- Rule: UI must not claim a runner is available if the binary is missing; may show “needs auth” separately from missing.
- Rule: Action→runner routing (D-054) only targets runners that are available **or** explicitly forced with a clear error if spawn fails.

### Auth + web hosting (D-046, D-047) — flush in this phase

**Can the UI run on the web?** Yes, optionally — same dashboard/panels surface. Orthogonal to distribution.

**Install × UI host matrix (all valid combos):**

| On-box install ↓ / UI → | **Local web** (`localhost` dashboard) | **Extension UI** (webview) | **Hosted web** (HTTPS + auth) |
|---|---|---|---|
| **Extension** | Ext can open/embed local server | **Default MVP** — panels; spawn local `praxis` | Ext as client of hosted API + local runners |
| **CLI only** | `praxis dashboard` / browser | N/A (no ext) | Browser → hosted API; CLI still local for runs |
| **Neither** | — | — | Hosted UI only — **no** local agent/IDE foreman |

Notes:

- Extension UI can project data from **local** `praxis`/DB **or** **hosted** API (or both later).
- Local web UI and Extension UI can share the same backend (local HTTP or hosted).
- Hosted UI does **not** replace Extension/CLI for IDE + agent runners.

**Auth posture (spec in this phase, implement later):**

- Gate product UI/API (hosted) with identity provider (candidate: Clerk — **OPEN** confirm).
- Extension stores session/token via `SecretStorage`; never in webview.
- Local-only mode may use “trust workspace” / no SaaS auth for v1 dogfood (**OPEN**).
- Permissions/RBAC beyond login = later (not wedge).

**Specs to add/expand:**

| Id | One-liner |
|---|---|
| `SPEC-A-PRAXIS-HOSTING` | Local vs hosted deploy; API boundary; what stays on device; install channels |
| `SPEC-F-PRAXIS-AUTH` | Login, session, extension secret storage, local-dev bypass rules |
| `SPEC-F-PRAXIS-DISTRIBUTION` | Extension bundle/fetch CLI; standalone CLI install; non-goal web-only IDE |

**OPEN for founder at `/run`:** localhost-only MVP vs hosted-from-day-one; IdP choice; whether extension always talks HTTP API (even local) vs direct CLI spawn; bundle vs download CLI inside extension.

### Comparison anchors

| Anchor | Steal | Avoid |
|---|---|---|
| **AIDLC** | core+CLI+thin ext, stage machine, shell-out, run-state | Claude-only; epic identity over Work/proof-close |
| **Zygen SDLC** | ticket trackers, WIP lock, stage-gate UX | Clipboard/`/sdlc` into host chat as execution |
| **Spec Kit** | spec→plan→tasks molds | Spec without audited close |
| **OpenSpec** | propose→apply→archive ledger | Archive without proof/close + activity |
| **Cline/Continue** | webview↔host messaging patterns only | Fork as day-one scaffold |

### Specs this phase must create

**Product:** Fill `Docs/PRODUCT.md` for **Praxis** (operator/eng workflow harness). Note: PHASE-002 learner map remains deferred; if learner Product is needed later, split to `PRODUCT-LEARNER.md` rather than blocking this phase.

**Areas (create):**

| Id | One-liner |
|---|---|
| `SPEC-A-PRAXIS-EXTENSION` | Extension host, webview bridge, panel packaging |
| `SPEC-A-PRAXIS-CORE` | `praxis` CLI, stage machine, gates, Runner ABI, config |
| `SPEC-A-PRAXIS-STATE` | Work/runs/proofs/activity persistence (FS/SQLite/remote) |
| `SPEC-A-PRAXIS-HOSTING` | Localhost vs hosted control plane; API boundary; device-local runners |

**Amend:** `SPEC-A-PRAXIS` — clarify internal process substrate vs productized Areas (no dual authority).

**Features (create):**

| Id | One-liner |
|---|---|
| `SPEC-F-PRAXIS-PANELS` | Work/Run/Close/status; MVP wrap existing dashboard assets |
| `SPEC-F-PRAXIS-FOREMAN` | claim/run/close stage machine + gates |
| `SPEC-F-PRAXIS-LEDGER` | Productized Work ledger (ids, status, proof binding) |
| `SPEC-F-PRAXIS-RUNNERS` | Pluggable CLI runners; **discover via PATH+auth probe** (`praxis runners list`); action→runner; one-runner MVP OK |
| `SPEC-F-PRAXIS-PROOF-CLOSE` | Audited close / proof artifacts as product law |
| `SPEC-F-PRAXIS-ACTIVITY-PRODUCT` | Activity/audit journal as product surface (name may fold into ACTIVITY if cleaner) |
| `SPEC-F-PRAXIS-HOOKS-PRODUCT` | Optional host bouncers (S-008 lineage); not engine |
| `SPEC-F-PRAXIS-CONFIG` | `praxis.config`: routing mode, action→model, action→runner, host detect |
| `SPEC-F-PRAXIS-MODELS` | `praxis models list` → Dashboard/Ext pickers; CLI + optional `vscode.lm`; refresh/empty states |
| `SPEC-F-PRAXIS-AUTH` | Auth gate for hosted UI/API; extension secrets; local bypass |
| `SPEC-F-PRAXIS-CHAT-PARTICIPANT` | Optional VS Code `@praxis`; **deferred OK** with stub + non-goal |

Ids may be renamed at `/run` if Knowledge naming conflicts — preserve meaning.

## Plan

1. Confirm open questions with founder (≤3/checkpoint): day-one host, distribution channel, v1 SSOT.
2. `/design` Product (`PRODUCT.md`) from wedge + never-list; Required Adv.
3. `/design` Areas (EXTENSION, CORE, STATE) + amend SPEC-A-PRAXIS boundaries; Required Adv.
4. `/design` Features from table; each with Behavior Rules; wire `depends_on` Areas.
5. Optional `/research` R-* for OSS mapping + Marketplace/ToS (may park as Work if not needed to lock specs).
6. Knowledge/Roadmap consistency; no implementation packages.

**Complexity cost:** Many new Specs + Product fill. Cut: implementation, Marketplace, chat product, multi-runner day-one matrix, React rewrite, Theia, Mastra.

**MCOO:** One observable result = locked spec set. Foundations only if a Feature/`PRODUCT` capability consumes them in this phase.

## Proof

- [ ] `Docs/PRODUCT.md` describes Praxis who/what/never + capability→Feature map
- [ ] Areas EXTENSION, CORE, STATE live (or renamed equivalents) with Boundaries
- [ ] Features from seed table live (CHAT-PARTICIPANT may be stub/deferred)
- [ ] SPEC-A-PRAXIS amended for substrate vs product split (no dual SSOT)
- [ ] D-032–D-045 cited from specs; no contradictory Rules
- [ ] Required Adv PASS/WARN-with-ack on Product + CORE/EXTENSION/STATE

## Close record

Filled at `/close`.

- Result:
- Specs amended:
- Journal line:

## Open questions (founder)

1. Cursor-only day-one vs VS Code (+ Cursor) from the start?
2. Marketplace first vs Open VSX first (or both at build phase)?
3. v1 state SSOT: local SQLite vs remote DB (FS artifacts still OK)?
4. Forever CLI-orchestrate agents, or eventually own a Gateway agent loop? (default: CLI; revisit D-033/D-037)
5. When do shared Docs + permissions/SSO enter the roadmap (not this phase)?
6. Hosted control plane day-one vs localhost-only MVP? IdP (Clerk vs other)?
7. Extension talks HTTP API always (local server) vs spawn `praxis` CLI directly?

## Follow-on research (during `/run` or later build)

| Priority | Topic |
|---|---|
| P0 | OSS: AIDLC core runner/run-state; vscode webview samples; Continue/Cline messaging (ref only); Spec Kit/OpenSpec molds + licenses |
| P0 | Marketplace/ToS: extension spawn CLIs + project hooks allowed? |
| P0 | Security: ext+hooks blast radius; fail-closed vs Shell bypass |
| P1 | Cost metering across CLIs; moat if “thin glue” |
| P2 | Offline; JetBrains CLI-only; provider ToS for driving CLIs |

## Kickoff

```text
/run PHASE-010

Run from Praxis.v2 after PHASE-011. Design-only: PRODUCT.md + Areas/Features from Design seed and D-032–D-047 / R-006 (include AUTH + HOSTING). No extension/CLI/auth implementation. Confirm ≤3 open questions then /design.
```
