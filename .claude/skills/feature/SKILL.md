---
name: feature
description: Take a new feature idea through research (if needed), a written spec, operator approval, and planning into the roadmap. Use when the operator says /feature or proposes new capability.
---

# /feature — idea → spec → roadmap

1. Read `Docs/STATE.md`, `Docs/ROADMAP.yaml`, `Docs/Registers/open-items.md` (the idea may
   already be a row), and any touched `Docs/Specs/` files. Check the current authorities in
   `Docs/INDEX.md` — the idea may already be mapped in FEATURES-ROADMAP.md.
2. **Clarify with the operator in plain language** (max 3–5 questions): what problem, for whom,
   what does success look like on screen. No jargon.
3. **Research only if genuinely unfamiliar** (new subsystem, external API, architecture
   question): spawn a read-only research sub-agent, findings only. If findings contradict the
   idea's assumptions, surface that FIRST — one plain-language call.
4. **Spec:** write/update `Docs/Specs/Features/<feature>.md` (<=120 lines, CONVENTIONS
   frontmatter): what it does, how it behaves at the edges, what it explicitly does NOT do,
   which Areas + which lane it touches. Architecture-shaping choices become an ADR. A lesson-
   schema change is a proposal in `Docs/Registers/schema-proposals.md`, not an ADR.
5. **Plan:** break into slices sized <=1 session each, tagged to a lane, every wave keeping
   >=1 operator-visible slice. Present the operator a briefing: what they'll see, rough effort,
   where it slots (this wave never — feature freeze; next wave or later), any ONE strategic
   trade-off as a flat yes/no.
6. On approval: add slices to `Docs/ROADMAP.yaml` (status `pending`), close/link the OI row,
   set spec `status: active`. Do NOT start building — /run picks it up in its wave.
7. Report: the spec path, where it landed in the roadmap, what /run will do first.
