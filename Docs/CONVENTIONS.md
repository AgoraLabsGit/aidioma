# CONVENTIONS — how we write things down

> Hard cap 60 lines. Process questions belong in PROCESS.md, not here.

## Frontmatter (required on every Specs/, Waves/, Lessons/ file — four keys, no more)
---
title: <plain title>
type: area-spec | feature-spec | adr | wave-slice | lesson
status: draft | active | accepted | superseded | closed
updated: YYYY-MM-DD
---
`accepted` is for ADRs; `closed` is for completed wave/lesson records. ADRs add `supersedes:` /
`superseded_by:` when applicable (lifecycle: draft → accepted → superseded).

## Naming
- Files: kebab-case; no dates in canonical spec filenames.
- ADRs: `ADR-NNNN-<slug>.md`, numbered, append-only.
- Wave records: `<wave>-<slice>-<slug>.md` (e.g. `A0-1-ui-decisions.md`). Wave IDs are lane-tagged
  (`A#` = App lane, `C#` = Content lane) — see ROADMAP.yaml.
- Handoffs: `NNN-YYYY-MM-DD-<slug>.md`; highest NNN is latest.
- Register IDs: `BUG-nnn` · `OI-nnn` · `DEP-nnn`, never reused.
- Lesson-schema proposals keep their own IDs in `Docs/Registers/schema-proposals.md`
  (`P-nnn`); ADRs cross-link that register.

## Write rules
1. STATE.md is rewritten, never appended. History lives in Handoffs and git.
2. One home per fact — check INDEX.md before writing; the second location gets a link, not a copy.
   `Docs/` owns current application design; executable/content artifacts are linked from there.
3. Supersede, don't delete: canonical docs get `status: superseded` + `superseded_by:` and move
   to `Archive/` with a CATALOG.md row. (Lessons that are simply wrong are deleted.)
4. Hard caps are edit triggers — a file over cap gets tightened, split, or archived in the same
   slice that overflowed it.
5. Registers own follow-ups — a finding, defect, or deferred deletion is a register row with an
   owner/trigger, never only prose.

## Caps
STATE 60 · PROCESS 150 · CONVENTIONS 60 · specs 120 each · wave records 150 · lessons one page.
