# STATE — where AIdioma is right now

> Rewritten in place every time it changes. Never appended. Hard cap 60 lines.
> If this file disagrees with ROADMAP.yaml, ROADMAP.yaml wins.

**Updated:** 2026-07-28 (A1 and C2 opened in parallel)

## Position

**Lane A — App (ACTIVE: A1-1)**
- **A0 Design Close CLOSED.** Operator gave design VERIFIED + close GO on 2026-07-28.
- A0-1…A0-H proven: design, legacy review, Docs SSOT, archive, and directory cleanup complete.
- Operator approved A1 on 2026-07-28. A1-1 now scaffolds the real responsive Next.js shell with Clerk, Neon, Vercel boundaries, and app gates.
- Local A0 baseline exists; no remote or push is configured.

**Lane C — Content (ACTIVE: C2-1)**
- C1 proven. Operator gave the formal C2 GO on 2026-07-28; OI-023 is closed.
- OI-025 is the mandatory first gate: P-003 accept sets + `setId` validation + Both-direction guidance.
- After OI-025 proves, draft and independently L2-QA a1-04…a1-12. Keep wordfreq lesson checks; no top-N deck now.

## Next
1. Run A1-1 and C2's OI-025 preparation in parallel with non-overlapping ownership.
2. Integrate root workspace/gates centrally, audit both lane diffs, and record proof.
3. Continue C2 drafting only after OI-025 proves; never push without wave-close GO.

## Standing decisions (highlights)
- A1-first · vocab 12–15 / sentences 18–20 · Completed/Mastered · Direction default Both.
- Gateway + GPT-5 mini · no eval cache · streak yes / notifications no · 4-layer QA.
- Platform: Next.js web MVP; Expo native later; Gradio internal-only; Realtime SDK only with voice scope.
- Mode-smart help · Ask tutor + Saved/Review · study cards · Mix + size-10 blend.
- Live today’s accuracy ≠ next-day confirmed proficiency.
- Quiz/MC → evaluations with modality `multipleChoice` (no AI).
- Responsive web (phone + desktop); no native stores in MVP.
- P-004 dialect shape only · **frequency decks = post-MVP (PM-015)**; wordfreq stays the lesson vocab check.
