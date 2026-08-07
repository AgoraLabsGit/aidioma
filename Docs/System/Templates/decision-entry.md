# DECISIONS.md — entry format

`DECISIONS.md` is prose, not frontmatter, so it has no JSON Schema. `derive()` parses it by the
heading pattern below and reports malformed entries as Issues rows — keep the shape exact.

Append only. Never edit a past entry. Superseding creates a new entry that names the old one.

```markdown
## D-000 — <subject>: <choice>
Date: YYYY-MM-DD · Phase: PHASE-XXX · From: R-XXX · Affects: [SPEC-A-XXX]
Chose: <option> over <alternatives>
Why: <the one or two reasons that decided it>
Revisit if: <concrete, checkable condition>
```

Optional fields, used only when they apply:

```
Supersedes: D-XXX
Superseded by: D-XXX
```

## Rules

- `From` is null for decisions made without research.
- `Affects` names the specs the decision constrains. Vendor decisions belong to area specs.
- A decision that affects nothing is a preference, not a decision — do not log it.
- One decision per entry. If it splits into two choices, it is two entries.

## What goes here vs elsewhere

| | Home |
|---|---|
| "We chose Postgres over SQLite" | Here — a decision |
| "Always validate AI output" | Spec Behavior — a checkable rule |
| "Never use `any`" | A lint rule |
| "We build for self-directed learners" | `PRODUCT.md` |

---

# Fixes / backlog (retired)

`FIXES.yaml` and `Roadmap/Backlog.md` are retired. Log defects and unscheduled ideas in
`Docs/WORK.yaml` (`kind: fix` / `proposal` / …). See `Templates/work-entry.md`.
