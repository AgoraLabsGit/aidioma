---
name: fix
description: Reproduce and fix an AIdioma defect or small product regression, then prove it through the affected user path. Use when the operator says /fix or reports broken behavior.
---

# /fix — reproduce, correct, prove

1. Read `Docs/INDEX.md` and the highest-numbered handoff, inspect Git status, and reproduce the report
   in the current app. Do not open a register row or wave file as routine setup.
2. Explain the root cause and bound the fix. If the request is a new capability, a content-authoring
   project, or a schema change, use `/feature` and keep that scope explicit.
3. Create or continue a short-lived `fix/<slug>` branch. Preserve unrelated user changes.
4. Add the smallest meaningful regression test when the behavior is testable, confirm it catches the
   defect, and implement the minimal correction.
5. Run focused tests plus the relevant typecheck, lint, suite, build, content validation, and browser
   proof. Re-exercise the same learner path that failed.
6. Update an active spec only when the tested product contract changed. Otherwise record concise
   continuity in the current handoff if the work will pause.
7. Report what broke, why, what changed, and the exact evidence that it is fixed. Use `/close` to
   commit intentionally and publish through a PR.
