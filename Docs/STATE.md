# STATE — where AIdioma is right now

> Rewritten in place every time it changes. Never appended. Hard cap 60 lines.
> If this file disagrees with ROADMAP.yaml, ROADMAP.yaml wins.

**Updated:** 2026-07-28 (A1-1R proven; C2 a1-04 L2-passed)

## Position

**Lane A — App (ACTIVE: A1-2 next)**
- **A0 Design Close CLOSED.** Operator gave design VERIFIED + close GO on 2026-07-28.
- A0-1…A0-H proven: design, legacy review, Docs SSOT, archive, and directory cleanup complete.
- A1-1R is proven: the four responsive screens now use the approved prototype shell, tokens, density, and navigation with truthful zero states.
- Proof covers 16 route/theme/viewport states, axe, keyboard focus, reduced motion, 200% text, exact route state, and no horizontal overflow.
- A1-2 shared-contract import plus idempotent Neon content seed follows the UI correction.
- OI-026 tracks unpatched upstream Next/ESLint dependency advisories before deployment.
- Fresh public remote `AgoraLabsGit/aidioma` is live; proven `main` was pushed on 2026-07-28 for Vercel/Neon setup.

**Lane C — Content (ACTIVE: C2-1)**
- C1 proven. Operator gave the formal C2 GO on 2026-07-28; OI-023 is closed.
- OI-025 is proven and closed: P-003 accept sets + `setId` validation + Both-direction guidance, with clean audit/re-audit.
- a1-04 is merged and L2-PASS (r3): 13 active vocab, 18 active sentences, version 2, all gates green.
- Continue a1-05…a1-12 one lesson at a time through independent L2 QA.

## Next
1. Link `AgoraLabsGit/aidioma` to Vercel and provide the Neon `DATABASE_URL` for real seed proof.
2. Start A1-2 while C2 drafts and independently L2-QAs a1-05.
3. Keep both lanes isolated; merge only after deterministic gates, audit/re-QA, and proof. Never push without wave-close GO.

## Standing decisions (highlights)
- A1-first · vocab 12–15 / sentences 18–20 · Completed/Mastered · Direction default Both.
- Gateway + GPT-5 mini · no eval cache · streak yes / notifications no · 4-layer QA.
- Platform: Next.js web MVP; Expo native later; Gradio internal-only; Realtime SDK only with voice scope.
- Mode-smart help · Ask tutor + Saved/Review · study cards · Mix + size-10 blend.
- Live today’s accuracy ≠ next-day confirmed proficiency.
- Quiz/MC → evaluations with modality `multipleChoice` (no AI).
- Responsive web (phone + desktop); no native stores in MVP.
- P-004 dialect shape only · **frequency decks = post-MVP (PM-015)**; wordfreq stays the lesson vocab check.
