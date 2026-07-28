# STATE — where AIdioma is right now

> Rewritten in place every time it changes. Never appended. Hard cap 60 lines.
> If this file disagrees with ROADMAP.yaml, ROADMAP.yaml wins.

**Updated:** 2026-07-28 (C2 opened; A1 approval is the remaining kickoff call)

## Position

**Lane A — App (greenfield Next.js, not yet scaffolded)**
- **A0 Design Close CLOSED.** Operator gave design VERIFIED + close GO on 2026-07-28.
- A0-1…A0-H proven: design, legacy review, Docs SSOT, archive, and directory cleanup complete.
- **A1 is pending and may now be opened.** `apps/web/` is still README-only; no app code yet.
- No remote or first commit exists, so A0 produced no commit/push.

**Lane C — Content (ACTIVE: C2-1)**
- C1 proven. Operator gave the formal C2 GO on 2026-07-28; OI-023 is closed.
- OI-025 is the mandatory first gate: P-003 accept sets + `setId` validation + Both-direction guidance.
- After OI-025 proves, draft and independently L2-QA a1-04…a1-12. Keep wordfreq lesson checks; no top-N deck now.

## Next
1. Local A0 baseline exists at `5d81ba8`; no remote/push configured.
2. Run OI-025 as C2-1's first bounded content change.
3. Present the A1 briefing, then open A1 and run it beside C2 if approved; never push without wave-close GO.

## Standing decisions (highlights)
- A1-first · vocab 12–15 / sentences 18–20 · Completed/Mastered · Direction default Both.
- Gateway + GPT-5 mini · no eval cache · streak yes / notifications no · 4-layer QA.
- Platform: Next.js web MVP; Expo native later; Gradio internal-only; Realtime SDK only with voice scope.
- Mode-smart help · Ask tutor + Saved/Review · study cards · Mix + size-10 blend.
- Live today’s accuracy ≠ next-day confirmed proficiency.
- Quiz/MC → evaluations with modality `multipleChoice` (no AI).
- Responsive web (phone + desktop); no native stores in MVP.
- P-004 dialect shape only · **frequency decks = post-MVP (PM-015)**; wordfreq stays the lesson vocab check.
