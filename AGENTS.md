# AIdioma agent rules

Use these rules for every repository session. Repository files are memory; never assume prior chat
context.

## Start here

1. Resolve one `DOCS_ROOT` for the whole session. Use `Docs/` only when `INDEX.md`, `PRODUCT.md`,
   `WORK.yaml`, `FIXES.yaml`, `HANDOFF.md`, and `Specs/` all exist there; otherwise use the complete
   `Docs.next/` migration candidate. Never mix roots.
2. Read `$DOCS_ROOT/INDEX.md`, `WORK.yaml`, `FIXES.yaml`, and `HANDOFF.md` completely.
3. Inspect Git status, branch/worktrees, the selected work entry, its spec, and relevant executable
   behavior before acting.
4. Treat `apps/web/`, `packages/lesson-schema/`, `content/`, migrations, and tests as proof of current
   implementation. A draft or research claim is never implementation authority.

## Commands

- `/plan <work-id or idea>` — discuss outcome/non-goals; audit current evidence; run an independent
  2-4-agent design panel; write a draft spec; run a fresh adversarial audit; revise; record decisions
  and discovered bugs at the bottom; obtain founder approval before status `planned`. Do not
  implement product code.
- `/feat <work-id>` — advance one planned/active work item of any kind. Require an approved spec for
  product/system behavior; an approved process item may use `spec: null`. Implement one coherent
  `next_slice` with tests and real-path proof.
- `/fix <fix-id or report>` — reproduce and correct one bounded defect with regression proof. Promote
  systemic or multi-session work to `WORK.yaml` and `/plan`.
- `/status` — read-only counts and rows for every work/fix status, spec, Git/PR, runtime, evidence,
  and next-command report.
- `/close` — explicitly authorizes committing the reviewed scope, opening its PR, and merging that
  exact unchanged head after required gates pass. It does not authorize production data/config work.
  Reconcile SSOT, overwrite `HANDOFF.md`, validate, publish, then clean only refs contained in fetched
  `origin/main` and return to clean `main`.

## One home per fact

- `PRODUCT.md` owns durable product principles.
- `WORK.yaml` is the only roadmap, feature registry, and systemic open-work queue.
- `FIXES.yaml` owns bounded bugs/tasks.
- `Specs/*.md` own reviewed capability contracts and distinguish implemented, accepted,
  legacy-accepted, candidate, research, deferred, superseded, rejected, and conflicting claims.
- `HANDOFF.md` owns current continuity and is overwritten; Git/merged PRs preserve history.
- Do not create waves, numbered handoffs, parallel roadmaps, open-item logs, panel transcripts, or a
  checked-in historical archive. Create a spec only when `/plan` begins. The one-time SSOT migration
  may create consolidated draft dossiers as `/plan` inputs; they cannot authorize implementation.

## Application boundaries

- `apps/web/` is the real learner application. Keep internal developer tooling out of its routes,
  imports, and deployment output.
- `content/` owns canonical authored curriculum; `packages/lesson-schema/` is its executable contract.
- Design Practice engines/components for explicit Lessons reuse without erasing their different
  progression promises or generalizing before a real second consumer.
- Search the canonical component/token library before adding UI. Keep domain engines independent of
  React/routes; keep pages focused on composition. Prove accessibility and responsive states.
- Never expose secrets, learner text, provider payloads, or internal work registries in public output.

## Git and collaboration

Keep `origin/main` as the sole durable branch. Use short-lived branches and non-overlapping sub-agent
scopes. Preserve unrelated changes, never force-push or destructively reset, publish via PR, and
delete only clean refs proven contained in fetched `origin/main`.
