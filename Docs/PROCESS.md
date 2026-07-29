# PROCESS — the machine

> How every unit of work runs. Five commands drive it; everything between is automatic.
> A deployable App wave has four explicit gates: approve the plan · PREVIEW GO · VERIFIED pass ·
> Production GO. Non-deploying waves omit PREVIEW GO; no gate is inferred from another.
> Hard cap 150 lines. Any process change is an edit to THIS file, never a new convention doc.

## Two lanes
Work runs in two parallel lanes under one ROADMAP.yaml: **Lane A (App)** and **Lane C (Content)**.
Only ONE wave per lane is active at a time. Lanes coordinate through files, never chat. Each lane
has its own `verify:` gate set (Content's are real and running; App's are set when the app
scaffolds in wave A1). A slice belongs to exactly one lane and runs the lifecycle below.

## The commands
- **/run** — pick the next runnable slice from ROADMAP.yaml and drive it through the lifecycle.
- **/fix** — corrective loop: register row → failing regression test → fix → gates → record.
- **/feature** — idea → (research) → spec → operator approval → slices added to ROADMAP.yaml.
- **/close** — wave close: hygiene + full suite + review + recap + runsheet + GO push.
- **/status** — read-only position report. Never does work.

## The slice lifecycle (🧑 = operator; everything else is automatic)

| # | Stage | What happens | Pass rule |
|---|---|---|---|
| 0 | SPEC | Draft `Waves/<id>.md` from TEMPLATE: goal, touched files/areas, verify plan | 🧑 approves only if scope is new/changed |
| 1 | BUILD | Work on a branch (`slice/<id>`), never directly on main. Follow existing patterns. Delegate heavy implementation to sub-agents; keep the main thread for triage + decisions | code complete on the branch |
| 2 | GATE | Deterministic checks BEFORE any judgment, from ROADMAP `verify:` (the lane's set): typecheck 0 · lint 0-new · tests green vs the recorded baseline · build 0 · smoke | all green or back to 1 |
| 3 | AUDIT | Isolated read-only audit sub-agent(s), sized to risk — additive/read-only change → 1 light auditor · mutating/schema/security-touching → fuller audit (2–3). The auditor gets ONLY the diff + the criteria, no history. Triage findings yourself; fix criticals; then a **delta re-audit** of just the fixes | 0 critical; every warning fixed or dispositioned in the wave file |
| 4 | REVIEW | `/code-review` on the slice diff (medium effort). Findings triaged like audit findings | criticals fixed; rest → register rows |
| 5 | HANDOFF | Keep the slice on its isolated branch. Worker `/close` commits/pushes one draft-PR handoff; it never merges. One release coordinator integrates approved SHAs | clean branch + exact SHA |
| 6 | PROVE | Real data through the user's actual path: local headless proof for deterministic UI; the exact Git-backed Vercel Preview for auth, data, Gateway, Firewall, and deployment behavior. Backend/content slices use a real end-to-end run/validate. **Not proven = not done** | proof artifact recorded in the wave file |
| 7 | CLEAN | Code this slice replaced is DELETED in-slice, **or** gets a deprecations-register row with a named trigger. No third option | register or diff shows it |
| 8 | RECORD | Wave file closed · ROADMAP status flipped · STATE rewritten · every touched Spec updated to the new truth. **A slice that changed structure or behavior cannot close on stale specs** | all four done |

> Design-only slices (e.g. Lane A wave A0) have no code: BUILD produces a spec/ADR, GATE is a
> peer-review read for internal consistency + no-conflict-with-frozen-docs, PROVE = the written
> decision is recorded and cross-referenced. The lifecycle shape is otherwise identical.

## The wave lifecycle
PLAN (operator approves a <=5-bullet briefing) → slices → **HYGIENE SLICE** → **/close** →
for a deployable App wave: 🧑 PREVIEW GO → release Preview → 🧑 VERIFIED → 🧑 Production GO →
`main`; a non-deploying wave omits the Preview stage.
- Every wave has >=1 slice the operator can SEE working (`operator_sees` in ROADMAP). For a
  design wave, "see" = the finished decision record / spec they approve.
- Mid-wave ideas NEVER join the active wave — they become `Registers/open-items.md` rows
  (feature freeze). /feature turns them into future roadmap slices later.
- Every session ends with `/close`. A session ending mid-wave writes
  `Handoffs/NNN-<date>-<slug>.md`: branch/SHA, in-flight work, checks, exact next actions, and
  anything owed. At a wave boundary, STATE + the wave records ARE the handoff.

## The hygiene slice (every wave ends with one, no exceptions)
1. **Residue scan:** dead code nothing imports · one concept stored in two places · docs whose
   subject no longer exists · specs contradicting merged code · register rows gone stale.
   Output = a one-page report.
2. **Execute every deprecations row whose trigger fired this wave** — archive first where
   auditability requires it, then delete; the gate suite verifies nothing still imports it.
   Anything archived gets a one-line row in `Archive/CATALOG.md` in the same act.
3. Anything the scan found with no register row is a process failure — file it AND note how it
   escaped stage 7.
4. A wave **cannot close** with a fired trigger unexecuted or a scan finding unowned.

## Wave close (/close) — the full quality pass
1. Hygiene slice complete (above).
2. **Full gate suite, cache-free** — a gate that didn't RUN counts as FAILED. Record the new
   test-count baselines in the wave record.
3. **/code-review at high effort on the whole wave diff** (main vs the last pushed state).
4. Docs reconcile: ROADMAP statuses · STATE rewritten · specs current · registers clean.
5. One coordinator builds `release/<wave>-<date>` from current `origin/main` and approved worker
   SHAs. Batch and gate locally; push once only after explicit PREVIEW GO. Vercel creates the
   canonical Preview from that exact commit; App CI and required external proofs must pass there.
6. Give the operator a plain-language recap and written Preview testing script with exact URL,
   clicks, and expected results. That script IS the 🧑 VERIFIED pass.
7. Merge/push `main` ONLY on explicit GO after VERIFIED. Verify the Production deployment for the
   same tree, run a bounded post-deploy sanity check, then remove only branches/worktrees proven
   contained in `origin/main`.

## Strategic application reviews
- **A2R:** baseline architecture, security, integration, and UI review before persistence work begins.
- **A4-H:** repeat the cross-component seam review after the real SessionEngine and UI exist.
- **A7-2:** repeat the whole-app audit and browser-to-data smoke before MVP launch.
- Founder UI review decisions update the specs and roadmap before their implementation wave opens.

## Standing rules
- Deterministic checks always run before agent judgment (cheaper, and they don't lie).
- Every /fix REQUIRES a regression test proven to fail without the fix.
- An audit/review finding is owned by a register row, never by memory. A recurring bug gets its
  `↻` count bumped — recurrence is a visible signal.
- Browser verification = headless scripts printing compact PASS/FAIL; screenshots to files.
  Never drive a browser interactively through agent context (token discipline).
- Sub-agent tiering: strongest model for coordination and audits/judgment; mid-tier for
  building; small models for mechanical scans and scripted sweeps.
- After 3 consecutive failures on the same step, stop and ask the operator rather than looping.
- Environment ladder is fixed: localhost uses Development credentials/data; non-main Git branches
  are local/CI-only unless named `release/**`; release branches use Vercel Preview credentials/data;
  `main`, `aidioma.io`, and the project production alias are Production only. CLI Preview URLs are
  diagnostics, never the canonical acceptance target.
- Invoking `/close` authorizes a clean ordinary worker-branch push and draft PR. It never authorizes
  a release/Preview push, `main` push, live-infrastructure mutation, force push, or deletion of
  uncontained work. Those gates remain explicit in the `/close` command.
- Every repo-owned long-lived dev/preview server is stopped before final `/close` preflight; the
  preflight reports and fails on residue instead of killing an ambiguous process automatically.
