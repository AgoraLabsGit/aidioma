# AIdioma

AIdioma is a Spanish-learning app centered on two connected surfaces:

- **Practice** (`/practice`) — browse curated practice collections, choose session options, answer
  typed prompts, and receive concise correction-first feedback.
- **Lessons** (`/lessons`) — browse the lesson catalog and exercise lesson material through the same
  interaction patterns being proven in Practice.

The tested application is the product truth. `Docs/` records decisions that the live experience has
earned; speculative documents do not override working behavior.

## Start here

Requirements: Node.js `>=22.22.2` and npm.

```bash
npm install
npm run dev --workspace @aidioma/web -- --hostname 127.0.0.1 --port 3217
```

Open:

- <http://127.0.0.1:3217/practice>
- <http://127.0.0.1:3217/lessons>

Local secrets belong in `apps/web/.env.local`; never commit them. The app can be exercised without
production credentials, although provider-backed evaluation, authentication, and persistence need
their corresponding local configuration.

## Validation

Run the checks relevant to the changed area. For application changes, the normal full pass is:

```bash
npm run app:typecheck
npm run app:lint
npm run app:test
npm run app:build
npm run app:smoke
npm run smoke:practice-sets --workspace @aidioma/web
```

Both browser smokes write screenshots under the ignored `apps/web/artifacts/` directory.

For lesson content or its executable contract:

```bash
npm run contract:typecheck
npm run contract:smoke
npm run content:typecheck
npm run content:validate
npm run content:fixtures
```

## Working in the repository

Read `AGENTS.md`, then run `npx praxis status --json` and follow its `nextAction`. The V2 Praxis
ledger at `.praxis/state.sqlite` owns Work, phases, checks, and generated projections. `Docs/WORK.yaml`
is generated evidence, not an authored queue. Confirm product claims in executable code and the
running app before changing a spec.

- `apps/web/` — responsive Next.js application and browser proofs.
- `content/` — authored curriculum, lessons, reviews, and content evidence.
- `packages/lesson-schema/` — executable lesson contract.
- `tooling/` — content validation and supporting scripts.
- `Docs/` — current product, work, specification, fix, and handoff sources.

Keep application work, authored content, and schema changes as deliberate scopes. Do not treat
research as publishable lesson material or change the lesson contract incidentally.

Work on a short-lived branch, preserve unrelated changes, validate the real user path, and publish
through a pull request. Protected `main` requires `app-validate` and `content-validate`. Delete a
branch or worktree only after its exact tip is clean and contained in fetched `origin/main`.

Use the Praxis Activity Bar workbench in Cursor for the dashboard, Work, Roadmap, Activity, and
Knowledge views. Cursor and Claude Code expose the generated `/plan`, `/run`, `/task`, `/fix`,
`/log`, `/check`, `/handoff`, `/close`, and `/publish` workflows. In Codex, load the matching generated
skill (for example `$task`) or ask in plain English. The CLI remains the direct status and diagnostic
surface:

```bash
npx praxis status --json
npx praxis doctor --json
```
