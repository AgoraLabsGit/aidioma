# Backlog

Unscheduled candidates. Nothing here is live work.

`/plan` promotes a row: creates the phase with `from_backlog: BL-XXX`, then deletes the row.
An item is never in both places. If it is broken rather than unbuilt, it belongs in `FIXES.yaml`.

Farmed from Docs.3 Roadmap backlog (originally Docs.2/WORK.yaml evidence).

| ID | Title | Type | Blocked by | Note |
|---|---|---|---|---|
| BL-001 | Reviewed word/phrase directory (Lexicon) | implementation | — | Proof on dirty stash; see PRESERVE.md. Re-phase when ready. |
| BL-002 | Server-authoritative Practice evaluation | implementation | — | Deployed grading source migration. |
| BL-003 | Practice page composition | implementation | — | Docs.2 specs as evidence. |
| BL-004 | Progress and saved material | implementation | — | Deferred until product map. |
| BL-005 | Target-aware adaptive serving | implementation | BL-001 | Depends on profile/lexicon consumers. |
| BL-006 | Broader practice assistance | implementation | — | Beyond current Lexicon proof. |
| BL-007 | Replace static lesson-review surface | design | — | Blocks BL-008. |
| BL-008 | Remove obsolete static prototype | design | BL-007 | Repo cleanup. |
| BL-009 | Content generation pipeline | implementation | — | Docs.2 evidence until scheduled. |
| BL-010 | UI system hardening | implementation | — | On demand. |
| BL-011 | Parallel active phases | design | PHASE-001+ | Lift one-active / one-branch / one-worktree rule; dashboard Active stack + agent routing; process contract change in system.md. |
