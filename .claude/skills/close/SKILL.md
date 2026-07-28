---
name: close
description: Close the active wave — hygiene slice, full cache-free gate suite, high-effort code review of the wave diff, docs reconcile, plain-language recap + human-testing script, then push on operator GO.
---

# /close — wave close (the full quality pass)

0. Preconditions: every content slice of the wave (in the lane being closed) is `proven` in
   ROADMAP.yaml. If not, list what's unfinished and stop.
1. **Hygiene slice** (a real slice with its own wave file):
   - Residue scan: dead code nothing imports · duplicated concepts (incl. anything now copied
     from an External Authority instead of linked) · docs/specs contradicting merged code ·
     stale register rows. One-page report.
   - Execute every `Registers/deprecations.md` row whose trigger fired this wave (archive
     first where auditability requires, then delete; CATALOG row in the same act).
   - File any scan finding that has no register row + note how it escaped stage 7.
   - A wave CANNOT close with a fired trigger unexecuted or a finding unowned.
2. **Full gate suite, cache-free** — every command in the lane's ROADMAP `verify:` set actually
   runs; a gate that didn't run counts as failed. Record new test-count baselines in the hygiene
   record.
3. **/code-review at high effort** on the whole wave diff (main vs last pushed state). Triage;
   criticals fixed now + delta re-audit; the rest become register rows.
4. **Docs reconcile:** ROADMAP statuses true · STATE rewritten · touched specs current ·
   registers clean · wave files closed. If this wave settled decisions the content lane needs
   (e.g. A0-3 schema rulings), reflect the rulings in `Docs/Registers/schema-proposals.md`.
5. **Operator deliverables (plain language):**
   - "What got done" recap mirroring the wave-open briefing.
   - A **written human-testing script** — exact clicks and expected results for every finished
     user-visible slice. This IS their VERIFIED pass; walk them through it. (For a design wave,
     the deliverable is the decision recap + the specs to sign off, not clicks.)
6. On the operator's VERIFIED + explicit **GO**: push. Flip the wave to `closed`, rewrite
   STATE with the next wave's position. Without GO, everything stays local.
