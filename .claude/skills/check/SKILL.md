---
name: check
description: Run path-relevant deterministic proof and retain the result in the target evidence report.
---

# /check

Run the tests, type checks, lint, validation, browser proof, or real-provider proof warranted by the
changed paths and claimed outcome. Before running, create or verify the retained candidate manifest
using `Docs/CLOSE.md`. Materialize its retained commit in a detached temporary Git worktree and run
deterministic commands there; install candidate-declared dependencies when needed. Never let mutable
live-tree files influence a candidate PASS. A real-provider/browser proof may receive ignored local
environment variables ephemerally, but never retain their values.

Declare the exact ordered argv list in `target.json.check_commands`, only the required ephemeral
variable names in `check_environment`, and a bounded `check_timeout_ms`. Capture deterministic command
results with `check-proof.mjs`; it materializes the retained commit, runs argv without a shell in a
minimal fixed environment plus those named values, and writes exit/output evidence under the target's `checks/` directory.
It authorizes argv before execution, applies an uncatchable timeout, and redacts exact allowlisted
values from captured output before writing proof.
Bundle create and explicit verify replay that command and compare exit/signal; stdout/stderr remain
hashed evidence but are not required to be byte-identical. After proof, rerun the fingerprint from the live tree
with exactly the manifest scopes and output path. It must reproduce the same candidate, commit, and
tree. A change fails the check. Do not fix failures during `/check`.

Record PASS/WARN/FAIL, UTC time, candidate fingerprint, commands/proof, and disposition in
the compact `Docs/Evidence/<target>/close-audits.md` index and versioned `check-results.json`. Index
every proof path once. Select only the last structured attempt as final; it must PASS on the final
candidate and reference the captured proof files. Do not mutate a candidate target or phase authority.
Never erase a failed or superseded round. Retain and hash each attempt's manifest and proof, not temporary
dependencies or secrets. For development-metadata work, `npm run docs:check` is the baseline proof.
