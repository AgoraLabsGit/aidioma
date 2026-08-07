# Welcome to Praxis

Praxis is how we run AIdioma: a simple way of working, plus a dashboard that shows what’s going on.

You don’t need to memorize commands. Describe what you want in plain language — the assistant picks the right move and tells you what it ran.

**First move:** ask *where are we?* (or run `/status`). You’ll get the current picture and a suggested next step. Keep `/dashboard` open while you work.

---

## Two kinds of work

### Big work — a phase

A **phase** is a scheduled outcome on the Roadmap: one clear result you can check when it’s done.

- **Today:** at most one phase is “in flight” at a time.
- **Later:** we may allow more than one in parallel (planned; not live yet).
- While a phase is active, research, design tweaks, and fixes that serve *that* outcome usually stay inside it — you don’t open a new phase for every small step.

### Small work — outside a phase

Not everything needs a phase. Fixes, chores, research, and design decisions can run on their own.

- They show up on the **Work** list.
- When you’re done for the session, finish with a lighter publish step (still called `/close`) so changes land safely.
- Use a phase when the outcome is big enough to schedule — not for every bug or polish pass.

---

## How to ask for help

| You want to… | Say something like… |
|---|---|
| See where things stand | “Where are we?” |
| Start a bigger outcome | “Let’s plan …” |
| Do the planned work | “Continue the phase” / “Run it” |
| Fix something broken | “This is broken: …” |
| Choose between options | “Which should we use for …?” |
| Decide how something should behave | “How should … work?” |
| Finish and publish | “Close this out” |
| Ship to production | “Ship it” |
| Pause until next time | “Handoff for now” / “Write a handoff” |
| Open the dashboard | “Open the dashboard” |
| See the command map | Open **Docs → Commands** |

More detail: **Commands** in this Docs sidebar.

---

## Multi-session phases and handoffs

Most phases take more than one sitting. That’s normal.

1. Work on the phase (`/run`, or just keep going in chat).
2. When you stop for the day — **before** the outcome is finished — run **`/handoff`** (or ask for a handoff).
3. Next session: open the dashboard (**Active** shows the phase + your note), ask where things stand, continue.
4. When the outcome is actually done, **`/close`** to publish. Don’t close just because the day ended.

**What `/handoff` does:** overwrites a short “where I left off” note (`Handoffs/HANDOFF.md`). It does **not** merge, ship, or end the phase. The next agent (or you) reads that note first.

**What `/close` does:** finishes and publishes. With an active phase, that’s the full review + merge. Without a phase, a lighter publish for the session’s work.

---

## What you’ll see on the dashboard

| Page | What it’s for |
|---|---|
| **Active** | The phase in flight (if any) and your latest handoff note |
| **Work** | The list of fixes, chores, research, designs, and proposals |
| **Roadmap** | Scheduled phases and their state |
| **Activity** | Recent process events (checks, closes, handoffs, …) |
| **Knowledge** | Deep library: product, specs, decisions, research |
| **Docs** | Welcome + Commands overview |
| **Signals** (bottom icon) | Health warnings derived from the project |

---

## Pause, finish, go live

- **Pause (`/handoff`)** — leave a note for the next session. Use this between days on the same phase.
- **Finish (`/close`)** — publish when the work (or phase outcome) is ready. Not the same as pausing.
- **Go live (`/ship`)** — production, only after main is verified. Publishing is not shipping.

---

## Simple map of homes

| Question | Look here |
|---|---|
| What are we building? | `PRODUCT.md` |
| How should this behave? | Specs |
| Why did we choose this? | Decisions |
| What were the options? | Research |
| What’s scheduled? | Roadmap |
| What’s on the to-do / fix list? | Work (`WORK.yaml`) |
| What shipped? | Releases |
| What must never be deleted? | Preserve |
| Where did I leave off? | Handoff |

If you’re unsure where something belongs, it probably fits one of these — not a new folder.

---

## Your first ten minutes

1. Skim `PRODUCT.md` — who it’s for and what it never does.
2. Ask where things stand (`/status`).
3. Open the dashboard and leave it open.
4. Do the suggested next step — or describe the problem in plain language.

**Nothing is lost by stopping.** Use `/handoff` between sessions. Preserve protects rare work-in-progress that must not be deleted.
