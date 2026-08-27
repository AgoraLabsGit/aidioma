# Close gates — AIdioma

This is the shared files-first contract for `/close` and `/phase-close`. An ordinary item `/close` stops at an
immutable local receipt unless the founder requests publication. A roadmap `/phase-close` is a
release command: after the receipt verifies, it publishes that exact receipt through a PR, merges
it, deploys the merged `main` revision to production, and smoke-checks the production alias. Neither
path stages the user's index. The fingerprint helper creates an internal synthetic candidate commit
and private retention ref so the audited bytes survive Git cleanup.

The candidate helper is supported on the repository's declared Node version on local POSIX
filesystems (macOS/Linux). It stops on Windows or when repository attributes could transform bytes;
do not downgrade those failures to warnings.

## Binding sequence

0. Confirm the target's declared acceptance already passed in the active development session. Close
   does not begin with missing implementation, a failing required check, an unresolved product
   choice, or an unrun learner browser journey. Return those targets to `/run`.
1. Resolve the one `Docs/Evidence/<target>/target.json` created with the work. For a task/fix it owns
   outcome, proof, non-goals, risk tier, required lenses, and exact scopes. For a phase it owns the
   phase-authority path, risk tier, required lenses, and exact scopes while the phase file owns product intent. Both kinds include the target JSON in
   their scopes; a phase also includes its phase file. `Docs/NOW.md` is only an optional local status
   pointer. Never scope a shared NOW/roadmap file merely to capture one item when it contains
   unrelated dirty work.
2. Pin one immutable, GC-reachable Git candidate and retain its manifest outside every candidate
   scope. Scopes are always explicit and each remediation round gets a new manifest path:
   `node .claude/skills/close/scripts/candidate-fingerprint.mjs --output Docs/Evidence/<target>/candidate-round-<n>.json -- <scoped paths>`.
3. Materialize the manifest's `commit` in a detached temporary Git worktree and run the relevant
   deterministic `/check` proof there. The proof must not use mutable deliverable bytes from the
   live tree. Runtime secrets may be supplied only through the candidate-bound `check_environment`
   name allowlist; exact allowlisted values are redacted from captured output before evidence is
   written. Every command uses the candidate-bound hard timeout.
   Rerun the fingerprint from the live tree with the same scopes afterward; a changed candidate is
   a failed check, not a warning.
4. Confirm every planned `yes` lens is candidate-bound in `target.json.required_lenses`; every other
   gate gets `n/a — <concrete reason>`. Dispatch independent, read-only auditors against the same candidate.
5. Retain every complete response once under `Docs/Evidence/<target>/audits/`, then append a compact
   linked row to `close-audits.md` before making edits. The response file is canonical; the report is
   its human history/index. Phase files keep the preselected gate matrix but do not duplicate
   post-candidate result history.
6. Classify findings before editing. A blocker contradicts the promised outcome/proof, fails a
   required check, creates material security/data-integrity risk, or violates an enforceable
   ownership rule. Log other improvements immediately with a named owner; they do not expand this
   close. One bounded blocker-repair pass is allowed. Create one new candidate and rerun only the
   affected checks and lens verdicts. If that repaired candidate exposes another fundamental
   blocker, stop close, return the target to `active`, and re-plan it instead of starting another
   audit/repair loop.
7. Run a final deterministic check on the final candidate and append it to the complete report.
   A phase may now change only frontmatter `state`, `closed`, and `lessons`. Write the versioned
   one full response file per required lens under `audits/`, and `audit-results.json` binding
   those responses, auditors, verdicts, and candidate. Write `close-record.json` with the final
   candidate, check, all seven gate verdicts, accepted WARN details, authority comparison, evidence
   paths, and publication status. `audit-results.json` selects the final response file for every
   required lens; `check-results.json` binds every retained check attempt to that attempt's manifest
   and proof, with the last check PASS on the final candidate. The report links both structured
   indexes and every retained response and check proof exactly once. Then create the bundle and immutable receipt below. Do not edit
   any bundled file afterward.
8. The evidence gate passes only when the final check is PASS, `close-bundle.mjs verify` passes, its receipt ref is
   retained, and each latest binding verdict on that candidate is PASS or an explicitly
   founder-accepted WARN retained with its risk and reason. A local NOW pointer may then move to
   Done and add receipt links.
9. For an ordinary item, stop here unless the founder requested `/publish`. For a roadmap phase,
   publish the exact retained receipt commit to a dedicated release branch, open a PR to `main`,
   wait for every required repository and preview check, and merge without rewriting the receipt
   commit. Never rebuild a publication commit from the dirty live tree.
10. A phase is closed only after the merged `main` commit has a `READY` production deployment,
    Vercel metadata names that exact commit and the `main` ref, and the production home and lessons
    routes pass HTTP smoke checks. Retain PR, merge, deployment, alias, candidate, receipt, and UTC
    time in `Docs/Evidence/<phase>/publication.md`. A failed merge or deployment leaves the phase
    release incomplete; report it instead of claiming closure.

Do not audit a moving tree. The fingerprint script records a deterministic commit and keeps it
reachable at `refs/aidioma/close/<candidate>`. Auditors inspect that commit using
`git diff <head> <commit>`, `git show <commit>:<path>`, or a detached temporary worktree; they verify
the manifest, ref, commit, and tree before and after review. Finish an audit wave before remediation.
A candidate change invalidates every verdict whose reviewed paths, contracts, or proof changed.

Close receipts are necessarily written after the deliverable is audited. The retained receipt
commit overlays only the exact paths listed in the verified bundle plus the bundle itself. Its
roles are the target contract, optional closed phase authority, final close record, check results, audit results,
every retained audit response and check proof, final and historical candidate manifests, audit/check
report, and listed additional
artifacts. A later
`Docs/Evidence/<target>/publication.md` remains outside that receipt. For a phase, its one
`**Risk tier:**` planning selection must equal the target JSON tier, and only frontmatter `state`,
`closed`, and `lessons` may differ from the candidate. Every target JSON stays byte- and
mode-identical. Moving a NOW pointer is local status only. After the final verdict, verify that scoped product, test, script, spec, outcome, proof,
non-goal, and scope content still matches the immutable tree and that any phase mutation is confined
to the allowlist. Any other mutation creates a new candidate and requires affected audits again.

The bundle tool mechanically requires exact target-schema and manifest-scope equality, target
byte/mode equality with the candidate, and—for a phase—a matching target/frontmatter/filename ID
and risk tier plus no authority change except valid closed `state`, a real ISO calendar `closed` date, and a
non-empty JSON double-quoted YAML string `lessons`. The canonical quoted form removes YAML scalar
ambiguity without making the standalone close tool depend on installed packages. The close record
retains that PASS comparison.

## Final evidence bundle and receipt

The only supported bundle is canonical schema version 1, created and verified by the repository
tool. Run it after the final check and audit responses are already appended:

```bash
node .claude/skills/close/scripts/close-bundle.mjs create \
  --manifest Docs/Evidence/<target>/candidate-round-<n>.json \
  --target Docs/Evidence/<target>/target.json \
  --close-record Docs/Evidence/<target>/close-record.json \
  --check-results Docs/Evidence/<target>/check-results.json \
  --audit-results Docs/Evidence/<target>/audit-results.json \
  --report Docs/Evidence/<target>/close-audits.md \
  --output Docs/Evidence/<target>/close-bundle.json \
  [--artifact Docs/Evidence/<target>/<proof-file> ...]
node .claude/skills/close/scripts/close-bundle.mjs verify \
  --bundle Docs/Evidence/<target>/close-bundle.json \
  --replay-checks yes
```

The bundle contains exactly `version`, `target`, `candidate`, `candidate_manifest`, and a
canonically sorted `files` array. Each file has exactly `role`, repository-relative `path`, byte
count, and SHA-256, ordered by locale-independent UTF-8 bytes. Exactly one `target_contract`,
`close_record`, `check_results`, `audit_results`, `candidate_manifest`, and `audit_report` are required.
Every non-final historical candidate referenced by an audit or check attempt has one `history_manifest`, every
structured check proof has one `check_proof`, every structured audit attempt has one
`audit_response`, and a phase also has exactly one
`phase_authority`, and zero or more
`artifact` records are allowed. Evidence other than a phase authority remains under the target
evidence directory. Paths are canonical regular files with no symlink component;
duplicates, extra keys, non-canonical JSON, private-key material, changed bytes, and output/scope
overlap fail verification.

Creation retains
`refs/aidioma/close-receipts/<candidate>/<bundle-sha256>`. Its deterministic commit has the candidate
commit as parent and overlays only the bundle plus its listed files. Verification derives the same
commit/tree, requires that exact ref, and never recreates a missing receipt. The tool enforces byte
and path integrity; the Security/Privacy auditor and coordinator remain responsible for rejecting
learner PII, auth tickets, raw learner prompts, or other secrets that no filename/content heuristic
can reliably identify.

`close-record.json` schema version 1 has exactly: `target`, `candidate`, `final_check: "PASS"`, a
`gates` object containing all seven canonical lenses, `accepted_warnings`,
`authority_comparison: "PASS"`, `report`, `bundle`, and
`publication_at_close: "not_requested"`. A verdict is `PASS`, `WARN`, or
`n/a — <concrete reason>`; every target-required lens must be PASS or accepted WARN, and every
unselected lens must be concrete N/A. FAIL,
whitespace reasons, unselected required gates, and unaccepted WARN cannot be bundled. Each accepted WARN names its
lens, candidate, substantive risk/reason/founder acceptance statement, and real UTC timestamp. The record cannot
contain its derived bundle digest/ref without becoming self-referential; the verifier deterministically
returns those identities from the finalized record and bundle.

`audit-results.json` schema version 1 has exactly `target`, final `candidate`, `report`, canonically
ordered `attempts`, and canonical `results`. Every file under `audits/` appears in exactly one
numeric/UTC-ordered attempt with id, time, lens, declared auditor, PASS/WARN/FAIL verdict, candidate,
retained manifest path/hash, response path, and response SHA-256. Each manifest must authenticate a
candidate containing the same target id, kind, evidence directory, and target scope. Each result has exactly `lens` and selected `attempt`, and must
select the last attempt for that required lens. That last attempt must be PASS/WARN on the bundled
candidate and match the close record. A later FAIL cannot be relabeled as superseded.

Response files contain exactly one ordered complete response block, name the target contract (or
phase authority), and agree with their attempt. PASS/WARN must say `BLOCKERS: none`; FAIL needs
substantive blockers; findings must be substantive; a PASS remediation is `none`. The report must
index each attempt's exact ID, time, lens, verdict, full candidate, and response path once. Missing,
duplicate, conflicting, malformed, wrong-target, wrong-candidate, allocation-violating, non-latest,
or tampered results block both close and publish. The Markdown report remains the human-readable
index without duplicating response prose.

The `auditor` value is declared provenance, not cryptographic identity. The bundle can reject an
allocation whose declared labels violate the candidate-bound tier; it cannot authenticate a host
session or prove who produced a file. The coordinator/runtime must actually dispatch the independent
read-only agents, retain their unedited responses, and use their real agent identifiers. False
provenance is a failed Claims/Proof and Security/Privacy gate.

`check-results.json` schema version 1 has exactly `target`, final `candidate`, `report`, ordered
`attempts`, and `final_attempt`. Structured attempts across all retained candidates use increasing
`C<number>` ids and UTC times, candidate, manifest path and hash, PASS/WARN/FAIL verdict, hashed proof
references, and disposition. `final_attempt` must be the last entry and PASS on the bundled candidate.
Every file under `checks/` appears in exactly one attempt and exactly once in the report; unindexed
or duplicate proof files block close. Each proof is captured by `check-proof.mjs` from a
detached materialization and records the exact candidate commit/tree, command arguments, times,
exit code/signal, stdout, and stderr. Each attempt is validated against the target contract inside
its own retained candidate; copied manifests for another target are rejected. That candidate's
`check_commands` declares the exact ordered argv contract and is checked before any command executes.
PASS/WARN attempts must cover every command with zero exits; FAIL attempts are the ordered
prefix ending at the first nonzero exit. Bundle creation authenticates and hashes every retained
attempt without re-executing commands. Explicit verification replays only the selected final PASS
attempt, in order, in one isolated materialization with one dependency installation and a minimal
fixed environment plus only the named `check_environment` variables. Each command stops at
`check_timeout_ms` using uncatchable termination and must reproduce the same exit code and signal. Missing
named variables block proof; exact allowlisted values are redacted before stdout/stderr are serialized. Captured stdout/stderr stay
hashed for inspection but may contain legitimate timing or ordering variance and are not compared
byte-for-byte. Verification authenticates the immutable receipt ref before running any proof command.
The report links the structured file once and indexes each attempt's exact ID, time, verdict, full
candidate, and every proof path once.

Capture a deterministic proof without a shell:

```bash
node .claude/skills/close/scripts/check-proof.mjs \
  --manifest Docs/Evidence/<target>/candidate-round-<n>.json \
  --output Docs/Evidence/<target>/checks/C<n>-01.json \
  -- node --test <candidate-owned-test-files>
```

Final-attempt replay is strong evidence against an accidental or fabricated PASS, not remote attestation
against a malicious coordinator. Superseded attempts remain authenticated history and are never
re-executed; live-provider failures are observations, not reproducibility requirements. Migrated history must be promoted into structured attempts with
its retained manifest and proof; report-only rows do not satisfy close.

Task/fix target schema version 1 has exactly `id`, kind, `evidence_dir`, `risk_tier`, outcome, proof,
`non_goals`, canonical `required_lenses`, exact ordered `check_commands`, a safe
`check_environment` name allowlist, bounded `check_timeout_ms`, and canonical scopes. Phase targets replace the three
intent fields with the phase `authority` path and declare the same check contract. Risk tier is an integer 0–3. Tier 0 selects no
required lenses. Tier 1 requires Claims, Standards, and MCOO; Tier 2 also requires Seams and
Product; Tier 3 also requires Security. Provider remains path-triggered. Required lenses are unique and
follow the canonical gate order; the bundle rejects N/A for any of them.

## Risk tiers

| Tier | Work | Minimum independent review |
|---|---|---|
| 0 | Non-phase task only: semantic-neutral typo/link/format; no policy, spec, behavior, config, or executable change | Coordinator check; every audit row explicitly `n/a` |
| 1 | Tests, internal refactor, substantive docs/spec/process | One independent reviewer may cover Claims, Standards, and MCOO; add a separate safety reviewer only when sensitive paths trigger it. |
| 2 | Learner UI, content behavior, serving, evaluation, persistence | At least two independent reviewers: Product/Claims and Code/Standards/Integration. A triggered safety/provider review stays separate from both. |
| 3 | Auth, learner data, migration, grading, prompts/logging, external providers | Three independent reviewers: Product/Claims, Code/Data/Integration, and Security/Provider. Each selected lens still receives its own verdict block. |

Substantive changes to `AGENTS.md`, skills, command routing, decisions, specs, or close gates are
never Tier 0. A provably semantic-neutral typo in those files may remain Tier 0.
Roadmap phases are never Tier 0; even semantic-neutral phase maintenance uses Tier 1 so Claims/Proof
and MCOO retain independent review.

## Gate matrix

Every close record lists all rows. If applicability is uncertain, run the lens.

| Lens | Binding when | Attack objective |
|---|---|---|
| Claims / Proof evidence | Always except Tier 0 wording-only work | Overclaim, proof≠outcome, silent scope, false always/never, missing counterexample, weak real-path evidence |
| Code quality / Standards | Every Tier 1–3 close; emphasize code, tests, schema, config, scripts, and substantive governance/process/spec | Correctness, error handling, maintainability, dead code, test quality, repository rules and internal consistency |
| MCOO | Every phase, code change, or governance/process change | Unconsumed abstraction, future-proof layer, duplicate authority, non-goal work, avoidable machinery |
| Seams / Integration | Every Tier 2–3 close; otherwise when a module/API/UI-server/persistence/auth/content/shared-contract boundary changed | Ownership, coupling, duplicated logic, failure propagation, extension without a current consumer |
| Security / Privacy | Every Tier 3 close; otherwise when auth, session, permissions, identity/data, secrets, prompts, logs, cookies, or network trust changed | AuthN/AuthZ, leak paths, unsafe defaults, PII/secret retention, denial/failure behavior |
| API / Provider usage | Clerk, Neon, AI Gateway, Vercel, or another external API touched or claimed | D-024, explicit credentials/targets, API contract, timeouts/errors, cost/rate limits, no synthetic proof |
| Product / Learner journey | Every Tier 2–3 close; otherwise when learner-visible behavior, state, content, grading, save/resume, or interactive UI changed | Journey completion, honest failure, accessibility, understandable feedback, state continuity |

Add focused migration, performance, accessibility, UI/UX, agent-context, licensing, or AI-token-cost
lenses when the changed paths or outcome make them material. Do not hide them inside a generic pass.
Any lens explicitly requested by the founder is mandatory and cannot be marked `n/a`.

## Auditor independence

- The implementing coordinator cannot issue the final independent PASS.
- Give every auditor the same retained manifest, target outcome, proof, non-goals, and one audit
  assignment. Do not include other auditors' conclusions.
- Bundling is an agent allocation, never a merged verdict. A bundled auditor returns one complete
  response block for each assigned gate-matrix lens.
- Tier 1 uses at least one independent reviewer. Tier 2 uses at least two: Product/Claims and
  Code/Standards/Integration. Tier 3 uses at least three: Product/Claims,
  Code/Data/Integration, and Security/Provider. Security and Provider may share the safety reviewer
  but never share an auditor with a non-sensitive lens. Claims and Standards use different
  reviewers for Tier 2–3 work. Bundled assignments still return one verdict block per lens.
- These allocation rules are checked against candidate-bound declared agent identifiers during
  bundle create and verify. The coordinator remains responsible for real dispatch and provenance.
- Ask what can fail, not whether the work “looks good.” Auditors cannot edit.
- After the one permitted blocker repair, only affected lenses rerun against the new candidate.

Required response:

```text
TARGET: <target.json or phase file path>
LENS: <name>
RESULT: PASS | WARN | FAIL
CANDIDATE: <fingerprint>
BLOCKERS: none | bullets
FINDINGS: immutable-tree file:line evidence + learner/product impact
REMEDIATION: none | required change
```

PASS must identify what was inspected. One lens cannot cancel another lens's FAIL.
The seven headings appear exactly once and in the shown order. `FINDINGS:` contains substantive
inspection evidence before `REMEDIATION:`. Final PASS/WARN files cannot contain stated blockers.

## Verdicts and remediation

- **FAIL:** blocks close.
- **WARN:** blocks until the founder explicitly accepts the retained risk and reason. The close
  record must name the lens, candidate, risk, reason, acceptance statement, and UTC time.
- **PASS:** no material blocker for that lens on that candidate.
- Required in-scope work cannot be parked to evade a gate. Out-of-scope improvements go to
  `Docs/WORK.yaml` with a named owner, not `Docs/NOW.md`.
- Append the initial verdict and the one permitted repair verdict. A second fundamental failure
  exits close and returns the target to active planning.

## Retained evidence

Retain every auditor's complete response once under `Docs/Evidence/<target>/audits/` and every audit
and check attempt as a linked row in `close-audits.md`. A phase file keeps only the gate-selection
matrix fixed in its candidate; do not append result history to a candidate authority. The report is
a compact history/index, not a second copy of response prose:

```markdown
## Audit

| Lens | Run? | Why / N/A | Sub-agent |
|---|---|---|---|

### Audit history

| Attempt | At (UTC) | Lens | Result | Candidate | Brief | Canonical response | Remediation |
|---|---|---|---|---|---|---|---|

### Check history

| Check | At (UTC) | Result | Candidate | Proof | Disposition |
|---|---|---|---|---|---|
```

For every target, `close-record.json` is the immutable final decision. A local Done pointer may link
the full report, finalized bundle, and receipt ref but is not the publishable authority. Larger screenshots/logs belong under the same evidence
directory; never retain secrets, auth tickets, raw prompts containing learner data, or learner PII.
All responses represented in `audit-results.json` are included automatically as `audit_response`
roles, including superseded failures. Creation and verification enumerate the entire `audits/` tree
and reject any response absent from ordered history or linked other than exactly once in the report.
The same exhaustive rule applies to every file under `checks/`; every historical check manifest and
proof is authenticated and bundled, including failed candidates.

The close record stores the final gate vector, final candidate, accepted warnings (normally none),
the finalized evidence-bundle path, and publication status **at close**. An accepted WARN remains WARN; it is never
rewritten as PASS.

Publication happens on a later founder request for an ordinary item and automatically as the final
part of an explicitly requested roadmap phase close. After the external action succeeds, retain its
action, PR/merge/deployment URLs or refs, published commit, final candidate, and UTC time in
`Docs/Evidence/<target>/publication.md`. Do not mutate bundled target/phase/record evidence. The
publication record necessarily follows the immutable receipt; it may be committed separately and
must never cause the audited candidate or receipt to be reconstructed.

The evidence bundle and receipt ref are part of the publishable close receipt, not the audited
deliverable candidate. `/publish` verifies the bundle with the repository tool and publishes the
exact retained receipt commit rather than reconstructing it from mutable live files. Missing,
extra, changed, non-canonical, or unretained evidence blocks publication.
