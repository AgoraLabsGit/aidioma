# STATE — where AIdioma is right now

> Rewritten in place every time it changes. Never appended. Hard cap 60 lines.
> If this file disagrees with ROADMAP.yaml, ROADMAP.yaml wins.

**Updated:** 2026-07-28 (prototype UI alignment is next; C2 a1-04 L2-passed)

## Position

**Lane A — App (ACTIVE: A1-1R next)**
- **A0 Design Close CLOSED.** Operator gave design VERIFIED + close GO on 2026-07-28.
- A0-1…A0-H proven: design, legacy review, Docs SSOT, archive, and directory cleanup complete.
- A1-1's framework/auth/database foundations are proven, but its editorial shell diverged from the approved prototype layout.
- Mike chose the prototype UI over the new shell and approved porting its styling exactly. A1-1R corrects UI fidelity before A1-2.
- A1-2 shared-contract import plus idempotent Neon content seed follows the UI correction.
- OI-026 tracks unpatched upstream Next/ESLint dependency advisories before deployment.
- Local A0 baseline exists; no remote or push is configured.

**Lane C — Content (ACTIVE: C2-1)**
- C1 proven. Operator gave the formal C2 GO on 2026-07-28; OI-023 is closed.
- OI-025 is proven and closed: P-003 accept sets + `setId` validation + Both-direction guidance, with clean audit/re-audit.
- a1-04 is merged and L2-PASS (r3): 13 active vocab, 18 active sentences, version 2, all gates green.
- Continue a1-05…a1-12 one lesson at a time through independent L2 QA.

## Next
1. Run A1-1R: port the prototype's exact visual system into componentized Next.js screens.
2. After A1-1R proof, start A1-2 while C2 drafts and independently L2-QAs a1-05.
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
