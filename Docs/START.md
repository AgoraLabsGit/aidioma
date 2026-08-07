# Start here

**Don't know what to do? Run `/status`.**

It prints where the project is and what command comes next.

---

## What this is

A process for moving work from idea to production, and a dashboard that shows it.

Two ideas carry the whole system:

1. **One phase at a time.** One outcome, one branch, one merge.
2. **Write it down or it didn't happen.** Behavior change requires a spec change — enforced at
   close, not by discipline.

---

## File formats — read this once

Everything you write is **markdown**. The `.json` files only check your work.

| You open | Format | What it is |
|---|---|---|
| `Docs/Specs/**`, `Roadmap/Phases/**`, `Research/**` | `.md` | The real artifacts |
| `System/Templates/**` | `.md` | Blank forms you copy |
| `System/schemas/**` | `.json` | Validators. CI reads them. You never edit them by hand |

The structured fields at the top of each markdown file (between `---` lines) are what the
dashboard and agents read. The prose below is for people.

---

## Commands

| You want to | Run |
|---|---|
| Know where things stand | `/status` |
| Start new work | `/plan` |
| Do the work | `/run` |
| Fix something broken | `/fix` |
| Decide between options | `/research` |
| Define how something behaves | `/design` |
| Finish a phase | `/close` |
| Go live | `/ship` |
| Run tests | `/check` |
| See the project | `/dashboard` |
| Stop for now | `/handoff` |

**Docs home (D-020):** When `.worktrees/docs` exists, all living `Docs/`, `.work/`, and agent-skill
writes happen there (`docs/ssot`). Phase/task trees are for product code. `/dashboard` reads that
tree — if the footer shows a `task/*` or `phase/*` branch, restart `/dashboard`.

**You don't have to memorize these.** Describe the problem in plain language — "button x is too
large", "which translation API should we use" — and the agent fires the right one and tells you
which it was.

Full definitions: [`System/COMMANDS.md`](System/COMMANDS.md).

---

## Where everything lives

| Question | File |
|---|---|
| What are we building? | `PRODUCT.md` |
| How does this behave? | `Specs/Features/`, `Specs/Areas/` |
| Why did we choose this? | `DECISIONS.md` |
| What were the options? | `Research/` |
| What's happening now? | `Roadmap/` |
| What's broken? | `FIXES.yaml` |
| What's next, unscheduled? | `Roadmap/Backlog.md` |
| What shipped? | `RELEASES.md` |
| What must never be deleted? | `PRESERVE.md` |
| Where did I leave off? | `Handoffs/HANDOFF.md` |
| What are the rules? | `System/system.md` |

Every question has exactly one home. If you're unsure where something goes, it probably belongs
in one of these — not a new folder.

---

## Your first hour

1. Read `PRODUCT.md` — what this is and who it's for
2. Run `/status`
3. Run `/dashboard` and leave it open
4. Run whatever `/status` suggested

---

## Two things that will save you

**Phases hold many activities.** Research, a spec update, a bug found mid-build — all of it
happens *inside* the active phase. Don't open a new phase for each. Open one when the outcome
itself changes.

**Nothing is lost by stopping.** `/handoff` writes down where you are. `PRESERVE.md` protects
work in progress. `/status --repair` cleans up a session that ended badly.
