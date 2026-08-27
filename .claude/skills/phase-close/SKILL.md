---
name: phase-close
description: Close an AIdioma roadmap phase after full candidate-pinned checks and independent multi-agent audits. Use for /phase-close or when /close targets an active phase.
---

# /phase-close

1. Read `AGENTS.md`, `Docs/AGENTS.md`, local `Docs/NOW.md` when present, the phase, its target JSON,
   owning specs, and `Docs/CLOSE.md` completely.
2. Confirm all phase work is represented, unrelated dirty files are excluded, every local item is
   done or explicitly out of scope, and the phase outcome/proof/non-goals still match the product.
3. Require risk Tier 1, 2, or 3 (never Tier 0) and a filled `## Audit` selection table using the
   exact gate-matrix lens names. Claims/Proof evidence, Code quality/Standards, and MCOO are always
   selected. Tiers 2–3 also select Seams/Integration and Product/Learner journey; Tier 3 also
   selects Security/Privacy. Select API/Provider usage and other path lenses whenever applicable;
   every skip needs a concrete
   `n/a` reason. Allocate the proportional reviewer groups from `Docs/CLOSE.md`, with separate
   verdict blocks for every bundled lens.
4. Require `Docs/Evidence/<phase>/target.json` to name the same risk tier, phase authority, exact
   ordered check command argv arrays, and exact scopes including
   both files. Pin that full phase candidate with the close
   fingerprint script, run the baseline `/check` in an isolated materialization of its retained commit, then
   deploy the named independent read-only agents in audit waves against that exact candidate.
5. Append every audit and check result to the external `close-audits.md`, never the phase authority.
   Preserve FAIL/WARN attempts and remediation pointers. Route non-blockers to named work. Allow
   one bounded blocker repair outside auditors, then fingerprint again and rerun affected checks
   and lenses. A second fundamental blocker returns the phase to active planning rather than
   starting another close loop.
6. After every selected lens and the final check pass, change only phase frontmatter `state: closed`,
   real ISO calendar `closed`, and non-empty JSON double-quoted `lessons`. Retain each full response
   once under `audits/`; write `audit-results.json` selecting the hashed final responses,
   `check-results.json` selecting the final candidate PASS and retaining every attempt's manifest
   and proofs, and
   `close-record.json` with the final candidate, check, all
   seven gate verdicts, accepted WARNs, comparison PASS, evidence paths, and publication status.
   Do not edit the report, target, close record, or phase again.
7. Create and verify `Docs/Evidence/<phase>/close-bundle.json` with `close-bundle.mjs`. Close is not
   effective until the verifier returns the exact retained receipt ref, commit, and tree. Then move
   a local phase pointer from Doing to Done in `Docs/NOW.md` when present. Accepted WARN details live
   only in the validated close record, never in the phase authority.
8. Re-run explicit bundle verification immediately before publication. Publish the exact receipt
   commit to a dedicated release branch, open a PR to `main`, wait for all required GitHub and
   preview checks, and merge it without reconstructing or rebasing the receipt from the dirty tree.
9. Wait for the merged `main` revision's production deployment. Verify Vercel reports `READY`,
   production aliases include the public learner domain, and deployment metadata names the exact
   merged commit and `main` ref. Smoke-check the production home and lessons routes.
10. Write `Docs/Evidence/<phase>/publication.md` with the candidate, receipt, PR, merge commit,
    deployment ID/URL, production alias, smoke results, and UTC time. If publish, merge, deployment,
    or smoke verification fails, the phase release is incomplete and must not be reported closed.

An explicit phase-close request authorizes this bounded commit, PR, merge, and production-deploy
sequence. The fingerprint's internal synthetic candidate commit/private ref remains evidence only;
publish the verified receipt commit. Ordinary item closes still require a separate founder request
before publication.
