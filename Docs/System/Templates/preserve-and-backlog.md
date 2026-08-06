# PRESERVE.md — format

Work-in-progress that lives outside the artifact model and must not be deleted. Stashes, parked
branches, uncommitted experiments.

Handoffs are overwritten every session. Anything recorded only there is lost. This file is the
only place that state survives.

```markdown
# Preserve

Do not delete anything listed here. `/close` and `/status --repair` skip these.

| What | Where | Why kept | Released when |
|---|---|---|---|
| Lexicon WIP | `stash@{0}` | Proof exists but was never phased | Re-phased and closed |
| Spike branch | `spike/auth-poc` | Reference implementation | SPEC-A-AUTH written |
```

## Rules

- One row per item. If you cannot say what would release it, it is not preserved — it is
  abandoned, and should be deleted.
- Review at every `/close`. An entry whose release condition is met gets removed.
- Never more than a handful of rows. A long list means work is being parked instead of finished.

---

# Backlog.md — format

Unscheduled candidates. Not a second registry — nothing here is live work.

```markdown
# Backlog

| ID | Title | Type | Blocked by | Note |
|---|---|---|---|---|
| BL-001 | Offline mode | build | — | Needs sync model first |
| BL-002 | Repo cleanup | design | BL-001 | Depends on the sync decision |
```

## Rules

- Own id namespace (`BL-nnn`). A backlog item is not a phase and does not take a phase id.
- `/plan` promotes a row: creates the phase with `from_backlog: BL-001`, then deletes the row.
- An item is never in both `Backlog.md` and `Roadmap/Phases/`.
- `blocked_by` names another backlog id. Cross-references to phases go in the note.
- If it is broken rather than unbuilt, it belongs in `FIXES.yaml`.
