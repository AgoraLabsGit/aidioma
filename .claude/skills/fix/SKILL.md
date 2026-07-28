---
name: fix
description: Fix a bug or make a small product update through a corrective loop with a regression test and register row. Use when the operator says /fix or reports something broken or wanted-changed.
---

# /fix — bug fix or small product update

1. Read `Docs/STATE.md` + `Docs/Registers/bugs.md`. If the report matches an existing row,
   bump its `↻` count (recurrence is a signal). Otherwise file a new BUG row (or an OI row if
   it's an update, not a defect) BEFORE touching code.
2. **Scope check:** if this is really a feature in disguise (new capability, schema change,
   >~1 session of work), stop and tell the operator it should go through /feature instead.
   A content or lesson-schema change goes through the content lane's pipeline, not here.
3. Reproduce and diagnose. State the root cause in the register row, not just the symptom.
4. **Regression test first:** write a test that FAILS without the fix. No fix merges without one.
5. Fix on branch `fix/<id>`, minimal blast radius, following existing patterns.
6. Run the full lane `verify:` gate set. For risky/mutating fixes add 1 light audit pass.
7. Prove the fix at the user level (the same path the operator saw it break on) — PASS/FAIL
   script or screenshot evidence.
8. Merge locally; move the register row to Closed with the proof reference; rewrite STATE if
   position changed. NEVER push — fixes ride the next /close.
9. Report plainly: what was broken, why, what proves it's fixed.
