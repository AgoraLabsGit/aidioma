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
| "which X should we use?" | `/research` |
| "how should X behave?" | `/design` |
| "let's add X" | `/plan` |
| "where are we?" | `/status` |
| "push it live" | `/ship` |

Always report which command ran and what id it produced: *"Logged FIX-031."*

## Never load

- `.work/activity/**` — grows unbounded, contains nothing you need
- Closed phase bodies, the full decision log, unrelated specs
- Any frozen legacy root

## Where things go

Specs describe behavior. Decisions record why. Research records options. Phases are temporary.
Never create a folder that isn't in `Docs/System/system.md`.
