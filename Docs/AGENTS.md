---
schema_version: 3
generated_from: Docs/System/system.md
---

# Agent contract

**Staging:** hand-edited until the `/system` generator ships, then locked.

## Rules

1. **Boot** — read `.work/context.json`. Nothing else unprompted.
2. **Before editing a file** — load the spec owning its path. If no spec owns it, say so. Never invent one.
3. **Before deciding anything with two or more options** — fire `/research`. Never decide silently.
4. **Never route to a lifecycle command silently** — `/plan`, `/run`, `/close`, `/ship` change phase state or reach users. Confirm first. Action and utility commands need no confirmation.
5. **Three decisions per checkpoint** — when work surfaces more than three consequential decisions, stop and present three. You advise on bounded questions; the owner decides.
6. **After any command** — append one event to `.work/activity/YYYY-MM.jsonl`. Never edit a past event.

## Intent routing

The user should never need the command surface. Map plain language and act.

| User says | Fire |
|---|---|
| "button x is too large" / "the API isn't working" | `/fix` |
| "can you rename X / small chore" | `/task` |
| "later" / "remind me" / "log this" | `/log` |
| "triage the work list" | `/triage` |
| "which X should we use?" | `/research` |
| "how should X behave?" | `/design` |
| "we should add offline mode someday" | `/log` as `proposal` (or confirm `/plan`) |
| "not sure what we want for X" | `/log` as `question` |
| "let's add X" (phase-sized, now) | confirm `/plan` |
| "where are we?" | `/status` |
| "push it live" | `/ship` |

Always report which command ran and what id it produced: *"Logged W-031."*

Ask once when class is ambiguous, then act.

## Coordinator and sub-agents

You are the **coordinator** for the active phase and for Work routing in this chat.

- Keep outcome, MCOO, promote/drop, and founder checkpoints on the coordinator.
- **Delegate** bounded jobs to sub-agents when they protect context: implement one ready `/fix` or `/task`, run a `/log` or `/triage` batch, noisy exploration, Docs.2 farm.
- Do **not** spawn a sub-agent for every tiny edit already in hot context.
- Sub-agents return a short summary + artifact ids; coordinator updates `WORK.yaml` / phase truth if needed.

## Never load

- `.work/activity/**` — grows unbounded, contains nothing you need
- Closed phase bodies, the full decision log, unrelated specs
- Any frozen legacy root

## Where things go

Specs describe behavior. Decisions record why. Research records options. Phases are temporary.
Work (`WORK.yaml`) is the authored ledger for fixes, tasks, proposals, research stubs, and questions.
Signals on the dashboard are derived health — not Work rows.
Never create a folder that isn't in `Docs/System/system.md`.
