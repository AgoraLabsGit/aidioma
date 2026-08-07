# Commands overview

You can say what you want in plain language. The assistant picks a command and tells you which one it ran. This page is the map of those moves — not a technical reference.

---

## Everyday moves

| You want to… | Command | In plain words |
|---|---|---|
| See where things stand | `/status` | Snapshot + suggested next step |
| Open this dashboard | `/dashboard` | Keep it open while you work |
| Pause and leave a note | `/handoff` | Write “where I left off” for the next session |
| Run checks / tests | `/check` | Prove things still work |
| Finish and publish | `/close` | Merge reviewed work (full review in a phase; lighter without one) |
| Go live | `/ship` | Production — separate from publishing |

---

## Bigger outcomes (phases)

| You want to… | Command | In plain words |
|---|---|---|
| Schedule a new outcome | `/plan` | Put it on the Roadmap as a phase |
| Do the phase work | `/run` | Build toward the outcome |
| Choose between options | `/research` | Compare choices, pick a direction |
| Lock how something should behave | `/design` | Decisions and/or specs |

A phase can take several sessions. Between sessions, use **`/handoff`** so you (or the next person) can pick up cleanly. You only **`/close`** when the outcome is done and ready to publish — not every evening.

---

## Small work (no phase required)

| You want to… | Command | In plain words |
|---|---|---|
| Fix something broken | `/fix` | Bounded defect + proof |
| Do a small intentional chore | `/task` | One-session change that isn’t a bug |
| Park something for later | `/log` | Put it on the Work list without doing it now |
| Clear / batch the Work list | `/triage` | Sort and do clear items |
| Review a scope | `/audit` | Findings only — not a merge |

These show up on **Work**. When the session is done, **`/close`** still publishes (lighter review when there’s no active phase).

---

## Handy utilities

| Command | When |
|---|---|
| `/launch` | Run the app locally |
| `/system` | Change how Praxis itself works (meta — not product features) |

---

## Remember

- **Handoff ≠ close.** Handoff pauses. Close publishes.
- **Ship ≠ close.** Close lands work on main. Ship puts it in production.
- You don’t have to type slash commands — describing the need is enough.
