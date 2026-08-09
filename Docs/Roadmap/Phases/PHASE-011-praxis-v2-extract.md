---
id: PHASE-011
title: Extract Praxis to Praxis.v2 repo
type: build
proof_kind: terminal
state: ready
order: 9
depends_on:
  - PHASE-009
from_backlog: P-003
owner: founder
outcome: "Praxis process + dashboard + agent substrate live in a new local git repo Praxis.v2; AIdioma retains learner product and thin pointers only."
proof: "Directory Praxis.v2 exists as its own git repo (git status clean or documented); npm run work:validate and work:dashboard succeed from Praxis.v2; AIdioma root AGENTS.md points at Praxis or documents consumer mode; no learner apps/packages/content moved."
non_goals:
  - GitHub remote publish / org transfer (local repo only unless founder asks)
  - Implementing extension, auth SaaS, or hosted control plane
  - Rewriting Praxis architecture (that is PHASE-010)
  - Moving AIdioma learner specs, apps/, packages/, content/
  - Deleting AIdioma Docs history without founder ack (prefer leave stubs / COPY then strip)
  - Perfect WORK.yaml scrub in one pass (seed + document residuals OK)
amends_specs:
  - SPEC-A-PRAXIS
feature: null
area: SPEC-A-PRAXIS
context_paths:
  - Docs/Roadmap/Phases/PHASE-011-praxis-v2-extract.md
  - Docs/System/
  - Docs/Specs/
  - Docs/WORK.yaml
  - AGENTS.md
  - CLAUDE.md
  - .claude/skills/
  - .cursor/hooks.json
  - .cursor/hooks/
  - tooling/run-dashboard.sh
  - tooling/ensure-docs-home.sh
  - package.json
  - .github/workflows/work.yml
opened: 2026-08-08
closed: null
lessons: null
---

# PHASE-011 — Extract Praxis to Praxis.v2 repo

## Context

Praxis (Dev System + dashboard + skills/hooks) still lives inside the AIdioma monorepo.
Productization design (PHASE-010) and later builds must happen in a **dedicated repo** so
learner product and Praxis product do not share one Docs/System SSOT. This phase **extracts**
first; PHASE-010 then designs against Praxis.v2.

## Inputs

- Inventory (founding session + extract farm): MOVE/COPY/STAY table below
- D-020 Docs home, D-025 desks, SPEC-A-PRAXIS, PHASE-009 closed
- PHASE-010 depends on this phase

## Extract map

Target path (default): sibling of AIdioma —  
`/Users/mike/Documents/Coding/Projects/Praxis.v2`  
(Confirm with founder if different.)

| Action | Path | Notes |
|---|---|---|
| **MOVE or COPY→own** | `Docs/System/**` | system, COMMANDS, dashboard, derive, schemas, Templates, protocols, Dashboard-spec |
| **MOVE or COPY→own** | `tooling/run-dashboard.sh`, `tooling/ensure-docs-home.sh` | |
| **MOVE or COPY→own** | `.claude/skills/**` | Drop or stub `/launch` learner-only bits |
| **MOVE or COPY→own** | `.cursor/hooks.json`, `.cursor/hooks/**` | Active-flush |
| **MOVE or COPY→own** | `.github/workflows/work.yml` | |
| **MOVE or COPY→own** | Root `AGENTS.md`, `CLAUDE.md` (process) | AIdioma keeps thin consumer pointer |
| **MOVE or COPY→own** | `Docs/AGENTS.md`, `Docs/START.md`, `Docs/COMMANDS-OVERVIEW.md` | |
| **MOVE or COPY→own** | Specs: `SPEC-A-PRAXIS`, `SPEC-A-DEVSYSTEM`, `SPEC-F-PRAXIS-*`, `SPEC-F-DEV-DASHBOARD`, mock-knowledge if Praxis-only | |
| **MOVE or COPY→own** | Phases: `PHASE-000`, `001`, `004`–`011` (Praxis history + this extract + leave 010 file in both or only Praxis) | PHASE-002/003 stay AIdioma |
| **MOVE or COPY→own** | Research: `R-003`–`R-006` | R-001/R-002 stay AIdioma |
| **COPY then filter** | `Docs/DECISIONS.md` | Praxis decisions → Praxis.v2; Lexicon D-014/D-015 stay AIdioma |
| **COPY then scrub** | `Docs/WORK.yaml`, `.work/**` | Seed Praxis ledger; strip obvious learner rows when cheap |
| **COPY then rewrite** | `Docs/Roadmap/Roadmap.md`, `Docs/Handoffs/HANDOFF.md` | |
| **COPY / split** | Root `package.json` `work:*` scripts + deps (`tsx`, `vitest`, `yaml`, `zod`, `chokidar`, …) | New Praxis.v2 `package.json` — not full AIdioma workspaces |
| **STAY AIdioma** | `apps/**`, `packages/**`, `content/**`, learner specs, `PHASE-002`/`003`, `R-001`/`R-002`, app CI workflows, `Docs.2/**`, `PRESERVE.md`, learner `PRODUCT.md` mold if still empty | |

**Prefer COPY-then-delete-from-AIdioma** over blind `git mv` across repos when history split is hard — document choice in Close record. Founder may accept `git filter-repo` later (non-goal unless asked).

### Also include (easy to miss)

- `Docs/System/dashboard/public/**` (static UI assets)
- `Docs/System/derive/**` tests + `tsconfig`
- Any `.gitignore` / `.npmrc` snippets needed for work:* 
- `CLAUDE.md` + skill stubs that reference AIdioma paths → retarget
- Optional: copy `~/.codex/skills/aidioma-development` notes into Praxis.v2 `AGENTS.md` pointer (do not require global skill move)

## Plan

1. Create `Praxis.v2` directory; `git init`; baseline README (“Praxis — workflow harness”).
2. Populate tree per Extract map; new root `package.json` with `work:validate|test|dashboard|docs-home` only.
3. Make `work:validate` + `work:test` green in Praxis.v2; `work:dashboard` starts.
4. AIdioma cleanup: remove or stub moved Praxis SSOT; root `AGENTS.md` → “Praxis lives in Praxis.v2”; keep learner boot.
5. Leave PHASE-010 (and productization artifacts R-006 / D-032+) **in Praxis.v2** as the next phase to `/run` there.
6. Document dual-repo operator rule in both READMEs.

**Complexity cost:** Repo split + ledger scrub. Cut: remote GitHub, filter-repo perfection, auth/hosting implementation.

## Proof

- [ ] `Praxis.v2` is a git repo with Praxis System/dashboard/skills/hooks/work scripts
- [ ] `npm run work:validate` and `work:test` pass in Praxis.v2
- [ ] `work:dashboard` serves Praxis UI from Praxis.v2
- [ ] AIdioma no longer treats `Docs/System` as living Praxis SSOT (moved or clearly stubbed)
- [ ] Inventory table residuals listed in Close record

## Close record

- Result:
- Specs amended:
- Journal line:

## Kickoff

```text
/run PHASE-011

Extract Praxis into /Users/mike/Documents/Coding/Projects/Praxis.v2 per phase Extract map. Build phase — copy/move files, new package.json, prove work:validate + dashboard. Do not implement extension/auth. PHASE-010 runs after this closes, in Praxis.v2.
```
