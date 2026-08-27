# F-006 implementation proof

## Result

AIdioma now uses one repository-native development workflow. `Docs/WORK.yaml` is the live backlog;
`Docs/NOW.md` is a short handoff; specs, canonical phase files, and target JSON own durable behavior,
planning, scope, and proof.

The supported command set is mirrored across Claude, Cursor, and Codex: task, fix, log, spec,
phase-spec, decision, research, plan, run, check, status, handoff, close, phase-close, publish, and
release. Terminal scaffolding supports backlog logging, status, feature/area specs, and canonical
phase/target pairs.

Obsolete dashboard/derive/protocol/schema files, generated work state, mutation hooks, old skill
aliases, packaged CLI archives, duplicate phase files, and installed runtime package remnants were
removed. Ignored local state and the two locally modified retired files were moved to the
recoverable macOS Trash folder `AIdioma-native-workflow-20260826`.

## Proof

- `npm run docs:check` — PASS; 15 tests cover exact native command routing, coordinator rules,
  backlog IDs, unsafe state-shortcut refusal, overwrite refusal, spec scaffolding, canonical
  version-2 phase/target scaffolding, and invalid metadata detection.
- `npm run close:test` — PASS; 27 tests cover candidate pinning, check capture, audit allocation,
  receipt creation, immutable verification, and publication replay.
- `npm run contract:typecheck` — PASS.
- `npm run content:fixtures` — PASS; the promoted dialect package remains valid with canonical
  phase-file approval and no generated work-state dependency.
- `git diff --check 54370cc3a6bf20b1e2996000129fd3de8cad6d4e HEAD` — PASS across the complete F-006 change.
- Explicit absence checks — PASS for the retired local-state directories, support tree, packages,
  installed binary/scope, and old skill aliases.

The pre-existing dirty PHASE-005 learner implementation was excluded from this target and was not
closed or deployed.
