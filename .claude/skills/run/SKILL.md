---
name: run
description: Build the next runnable roadmap slice through the full lifecycle (gates, audit, review, prove, record). Use when the operator says /run or asks to continue the roadmap.
---

# /run — advance the roadmap

1. **Boot:** read `Docs/STATE.md`, `Docs/ROADMAP.yaml`, and `Docs/Registers/*.md`. Identify the
   active wave in each lane (App / Content) and the next runnable slice (first `pending`/`active`
   slice with no unmet dependency, in the lane the operator is advancing — default to the App
   lane's active wave unless told otherwise). Skip `parked` slices. If a Handoff newer than STATE
   exists, honor it.
2. **Wave open (if no wave is active):** give the operator a <=5-bullet plain-language briefing
   of the next wave and get approval before any code. Sweep the registers: every row naming
   this wave is claimed by a slice or explicitly re-homed.
3. **Slice spec (stage 0):** draft `Docs/Waves/<id>-<slug>.md` from TEMPLATE (set the Lane).
   Ask the operator only if scope is new or changed from the roadmap entry; otherwise proceed.
   For a **design-only slice** (e.g. A0), the "build" is the decision/spec itself — surface each
   open decision as ONE plain yes/no block, record the ruling, don't batch them.
4. **Build (stage 1):** branch `slice/<id>`. Follow existing project patterns. Delegate heavy
   implementation to sub-agents with compact briefs; you triage and integrate.
5. **Gates (stage 2):** run every command in the lane's ROADMAP `verify:` set — typecheck 0,
   lint 0-new, tests green vs the recorded baseline, build 0, smoke. All green or return to
   stage 1. Record results in the wave file. (Design slices: peer-review read for internal
   consistency + no conflict with accepted Docs specs/ADRs.)
6. **Audit (stage 3):** spawn isolated read-only auditor(s) sized to risk with ONLY the diff +
   criteria. Triage; fix criticals + warnings; delta re-audit the fixes. Record in the wave file.
7. **Review (stage 4):** run /code-review (medium) on the slice diff; triage the same way.
8. **Merge (stage 5):** merge to main locally. NEVER push.
9. **Prove (stage 6):** exercise the real user path — headless PASS/FAIL script + screenshot
   for UI; real end-to-end run/validate for backend/content. Record the proof. Not proven = not
   done. (Design slices: the recorded, cross-referenced decision IS the proof.)
10. **Clean + record (stages 7–8):** delete superseded code or file a DEP row; flip ROADMAP
    status to `proven`; rewrite STATE; update touched specs; close the wave file.
11. **Report** in plain language: what got built, what the operator can see, what's next. If
    this was the wave's last content slice, say the wave is ready for `/close`.
