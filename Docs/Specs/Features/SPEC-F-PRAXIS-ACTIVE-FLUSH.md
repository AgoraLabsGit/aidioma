---
id: SPEC-F-PRAXIS-ACTIVE-FLUSH
kind: feature
title: Active Work write gate
status: active
superseded_by: null
depends_on:
  - SPEC-A-DEVSYSTEM
decisions: []
built_by: []
last_amended: null
research: []
paths:
  - .cursor/hooks.json
  - .cursor/hooks/**
---

# Active Work write gate

## Purpose

Stops Cursor Agent file-mutation tools from changing the repo when no Work row is
`status: active`, so Open Work stays honest during do-now commands. This is an advisory
Agent-path gate (not a full filesystem lockdown).

## Behavior

- Rule: When Docs-home `Docs/WORK.yaml` has **zero** rows with `status: active`, Cursor Agent
  `preToolUse` **denies** file-mutation tools whose `tool_name` is `Write`, `Delete`, or
  `StrReplace` (and any additional edit tool names the shipped hook lists in its allow-check)
- Rule: Docs-home root is resolved once per hook run: prefer `AIDIOMA_DOCS_HOME` if set;
  else `.worktrees/docs` under the workspace root when that directory exists; else the
  workspace root. The gate reads **only** `{docsHome}/Docs/WORK.yaml`
- Rule: Always allow (even with zero active Work): `{docsHome}/Docs/WORK.yaml` and
  `{docsHome}/.work/activity/**` (and the same paths relative to workspace when docsHome is
  the workspace root)
- Rule: Mutating `.cursor/hooks.json` or `.cursor/hooks/**` requires ≥1 `status: active` Work
  row (same as other gated paths) — the gate cannot permanently allowlist itself
- Rule: On deny, the hook returns `permission: "deny"` and an `agent_message` that tells the
  agent to upsert a Work row `status: active` + activity event before retrying
- Rule: If WORK.yaml is missing, unreadable, or YAML-parse fails → **deny** with
  `agent_message` naming the resolve path (no silent fail-open)
- Rule: Hook config uses `failClosed: true`. Recovery when the hook is broken is **human-only**:
  edit or unload hooks in Cursor IDE / disable project hooks — agents must not rely on a
  hooks allowlist to self-repair
- Rule: Closing implementation Work for this Feature requires a fresh-subagent Adv PASS or
  WARN-with-founder-ack on the shipped hook script + `hooks.json` (process proof; recorded in
  that Work `done_summary`)

## Boundaries

- Does not gate human IDE edits, Tab completions, MCP writers, or Shell redirections (v1
  non-goal). Agents can still bypass via Shell; CI/Signals may cover skip-active later.
- Does not prove the active row belongs to this session or enforces `context_paths` leases
  (D-024) — any `status: active` row unlocks Agent file-mutation tools.
- Does not replace skill text or `/close` audits; complements them.
- Does not move Praxis to another repo (PHASE-009 rename may retarget `depends_on` to
  `SPEC-A-PRAXIS`).

## Dependencies

Needs SPEC-A-DEVSYSTEM (process / Docs home / Work ledger). Cursor project hooks under
`.cursor/` at the workspace root that agents use for Docs-home work.
