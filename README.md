# AIdioma

AIdioma is a Spanish-learning app built around one chat-centric practice panel. The app deals a
guided arc of cards — a short explainer, a quick multiple-choice check, vocabulary, sentences,
and a story — and you type your Spanish. Answers are graded instantly and for free against
authored alternates; an AI tutor is called only when your answer matches nothing on file, and the
same input bar lets you ask the tutor a question at any point. Your weak items and unconfirmed
lessons re-serve automatically until you genuinely master them. Launch scope: 12 A1 lessons, two
modalities (typed translation in both directions by default + flashcards).

## How development runs here

This repo uses a docs-as-memory dev process (imported from the Praxis project). The agent's
operating rules live in `CLAUDE.md`; the full machine is `Docs/PROCESS.md`. The short version:

- **`Docs/ROADMAP.yaml`** is the plan. Work runs in **waves** made of **slices**, across **two
  parallel lanes**: **Lane A (the app)** and **Lane C (lesson content)**.
- Five commands drive work, plus one Production approval:
  - **`/feature <idea>`** — researches (if needed), writes a spec, plans it into the roadmap.
  - **`/run`** — builds the next runnable roadmap slice through the full lifecycle
    (build → deterministic gates → isolated audit → code review → prove-on-screen → record).
  - **`/fix <bug or tweak>`** — small corrective loop with a regression test and a register row.
  - **`/close`** — ends a wave: full quality pass, then automatically adds a deployable App wave
    to one cumulative Git-backed Preview batch. Non-deploying waves close without a Preview.
  - **`SHIP`** — after you test the exact cumulative Preview, releases every queued wave in that
    batch to Production. You can close several waves before choosing to SHIP.
- **`Docs/STATE.md`** always says where the project is (<=60 lines, rewritten in place).
- Defects, follow-ups, and dying code live as rows in `Docs/Registers/` — never in prose.
- Nothing is development-complete until it is proven with real data on a real screen. `/close`
  authorizes Preview publication; Production remains blocked until the operator says `SHIP`.

## Where things live

- `Docs/` — application-design and process SSOT, including specs, decisions, registers, and history.
- `apps/web/` — responsive Next.js production app, linked to Vercel and Neon.
- `apps/prototype/` — temporary static design reference, retired after the real A4 flow replaces it.
- `packages/lesson-schema/` — shared executable lesson/app contract.
- `content/` — authored lessons, curriculum, style, reviews, and content-lane working records.
- `tooling/` — content validation and the temporary prototype export adapter.
- `Archive/Legacy-Apps/` — ignored, sensitive local V1/V2 evidence; never stage or push it.

New session? Read `Docs/STATE.md`, then `Docs/INDEX.md`.
