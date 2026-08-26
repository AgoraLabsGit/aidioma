---
name: close
description: Close the current Docs/NOW.md item or active roadmap phase only after candidate-pinned checks and independent adversarial audits. Use when the founder says /close or asks to finish and close work.
---

# /close

Close is a files-first product gate. Never run Praxis, sqlite, hooks, workbench, or a second agent
runner. Multi-agent audit sub-agents in this session are required when the selected risk tier calls
for them.

1. Read `AGENTS.md`, `Docs/AGENTS.md`, local `Docs/NOW.md` when present, and the active phase when present.
2. Read `Docs/CLOSE.md` completely.
3. Resolve exactly one existing `Docs/Evidence/<target>/target.json` and inventory its intended files
   separately from unrelated dirty work. For a task/fix that file already owns outcome, proof,
   non-goals, and exact scopes. For a phase it owns exact scopes and points to the phase authority.
   Include the target JSON—not shared `Docs/NOW.md`—in all scopes. If the target is a roadmap phase,
   follow `../phase-close/SKILL.md` as the full phase path.
4. Pin the candidate and retain its immutable Git-tree manifest with the command in `Docs/CLOSE.md`.
   All checks and auditors in a round must verify and name that manifest.
5. Run the relevant deterministic `/check` proof before audits. FAIL blocks close.
6. Select every gate as `yes` or `n/a — <concrete reason>`, then assign fresh read-only sub-agents
   exactly as the selected risk tier groups them in `Docs/CLOSE.md`.
7. Record each PASS/WARN/FAIL before remediation. Never replace or delete an earlier result.
8. Remediate outside the audit agents, use a new round-manifest path, and rerun affected lenses plus
   the final deterministic check. WARN blocks unless the founder explicitly accepts its retained
   risk and reason for that candidate.
9. Close only when the final check is PASS and each latest selected-lens verdict on that candidate is
   PASS or an explicitly founder-accepted WARN. After the complete report and authority are final,
   retain each unedited full response once under `audits/`, link it from the compact report, and
   write validated `audit-results.json` selecting one final response per required lens,
   candidate-bound `check-results.json` with every attempt's retained manifest and proof, the
   target-declared ordered command contract, and the final PASS, plus
   `close-record.json`, then create and verify the bundle/receipt with
   `close-bundle.mjs` exactly as documented, including explicit authenticated check replay. The verifier
   must return the retained receipt ref, commit, and tree. Do not edit bundled files afterward.
   A local NOW pointer may move to Done with report, bundle, and receipt links. The tool requires a
   byte/mode-identical target, exact target/manifest scopes, and only `state`/`closed`/`lessons`
   changes in a phase authority.

For an ordinary item, `/close` never advances a branch, stages the user's index, opens a PR, merges,
or deploys; `/publish` remains a separate founder-authorized action. When the resolved target is a
roadmap phase, the explicit close request dispatches to `/phase-close`, whose required terminal
sequence publishes the verified receipt, merges it, deploys the merged `main` revision, and verifies
production. The fingerprint helper's internal synthetic candidate commit/private ref is retention
evidence, not a publication commit.
