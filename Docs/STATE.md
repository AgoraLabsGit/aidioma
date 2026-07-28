# STATE — where AIdioma is right now

> Rewritten in place every time it changes. Never appended. Hard cap 60 lines.
> If this file disagrees with ROADMAP.yaml, ROADMAP.yaml wins.

**Updated:** 2026-07-28 (A0 Design Close closed; next calls are C2 and A1)

## Position

**Lane A — App (greenfield Next.js, not yet scaffolded)**
- **A0 Design Close CLOSED.** Operator gave design VERIFIED + close GO on 2026-07-28.
- A0-1…A0-H proven: design, legacy review, Docs SSOT, archive, and directory cleanup complete.
- **A1 is pending and may now be opened.** `apps/web/` is still README-only; no app code yet.
- No remote or first commit exists, so A0 produced no commit/push.

**Lane C — Content (PARKED)**
- C1 proven. C2 waits A0 close + formal OI-023 go. OI-025 = P-003 + Both-direction prep.
- Operator intent (2026-07-28): **GO on C2 after A0** — keep wordfreq checks; no top-N deck now.

## Next
1. New-session coordinator handoff: `Docs/Handoffs/003-2026-07-28-a1-c2-parallel-kickoff.md`.
2. Establish the local Git baseline, then formally un-pause C2 with OI-025 first.
3. Open A1 and run it beside C2; never push without wave-close GO.

## Standing decisions (highlights)
- A1-first · vocab 12–15 / sentences 18–20 · Completed/Mastered · Direction default Both.
- Gateway + GPT-5 mini · no eval cache · streak yes / notifications no · 4-layer QA.
- Platform: Next.js web MVP; Expo native later; Gradio internal-only; Realtime SDK only with voice scope.
- Mode-smart help · Ask tutor + Saved/Review · study cards · Mix + size-10 blend.
- Live today’s accuracy ≠ next-day confirmed proficiency.
- Quiz/MC → evaluations with modality `multipleChoice` (no AI).
- Responsive web (phone + desktop); no native stores in MVP.
- P-004 dialect shape only · **frequency decks = post-MVP (PM-015)**; wordfreq stays the lesson vocab check.
