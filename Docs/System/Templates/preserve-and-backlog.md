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

# Unscheduled work (retired Backlog / FIXES)

`Roadmap/Backlog.md` and `FIXES.yaml` are **retired** (D-012 / PHASE-005). Park unscheduled
ideas and defects in `Docs/WORK.yaml`:

| Need | Work kind | Id prefix |
|---|---|---|
| Broken / wrong behavior | `fix` | `F-` |
| One-session chore | `task` | `T-` |
| Phase-sized idea | `proposal` | `P-` |

See `Templates/work-entry.md`. Promote a proposal with `/plan` → phase + `promoted_to`.
