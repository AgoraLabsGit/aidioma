# Native commands

AIdioma's development system is made of authored repository files. Plain English works in every
host; the slash names below are concise aliases. Claude skills are canonical, Cursor commands point
to them, and Codex skill links expose the same instructions.

| Command | Use it for | Durable result |
|---|---|---|
| `/log` | Park unscheduled work | New `open` row in `Docs/WORK.yaml` |
| `/task` | Do one bounded task now | Active/done work row + `Docs/Evidence/<target>/target.json` |
| `/fix` | Reproduce and repair one defect | Active/done fix row + target + regression proof |
| `/spec` | Create or amend durable behavior | `Docs/Specs/Features/` or `Docs/Specs/Areas/` |
| `/phase-spec` | Define one roadmap outcome | Canonical `PHASE-nnn.md` + matching target JSON |
| `/decision` | Choose among real alternatives | New `Docs/DECISIONS.md` entry + affected contracts |
| `/research` | Compare options before a choice | `Docs/Research/R-nnn.md` and resulting decision/work |
| `/plan` | Turn registered work into one executable learner journey or bounded internal target | Completed intent, failure behavior, proof, ownership, scope, and review contract |
| `/run` | Coordinate one ready target or phase | Walking learner proof, failure/retry behavior, ownership check, acceptance, and status updates |
| `/check` | Run candidate-bound proof | Retained deterministic check evidence |
| `/status` | Read current state | Read-only summary from authored files |
| `/handoff` | Make the next session obvious | Concise `Docs/NOW.md` pointers |
| `/close` | Audit and close one task/fix | Verified local close receipt |
| `/phase-close` | Audit and release one phase | Receipt, PR, merge, deployment, smoke proof |
| `/publish` | Publish a closed non-phase target | Founder-authorized receipt publication |
| `/release` | Record a verified production ship | Append-only `Docs/RELEASES.md` entry |

Rules that prevent drift:

- `WORK.yaml` is the only backlog. `NOW.md` is never used to park unscheduled work.
- One phase ID has one canonical `Docs/Roadmap/Phases/PHASE-nnn.md` file.
- A started task/fix/phase has one target contract under `Docs/Evidence/`.
- Learner-visible work follows `Docs/Development/DELIVERY.md` and contains one primary journey.
- Learner-visible behavior belongs in PRODUCT/specs/decisions and gains an executable check.
- Acceptance passes before close begins; close never absorbs adjacent improvements.
- Run `npm run docs:check` before handoff or close.

Terminal helpers are documented in `Docs/Development/README.md`. Close behavior lives in
`Docs/CLOSE.md`.
