---
title: Module spec — the session panel + app screens
type: feature-spec
status: active
updated: 2026-07-28
---

# Module spec — the session panel + app screens

> A0-1 **UI decisions settled and proven** (2026-07-28). Settled decisions below **win**
> over archived pre-A0 proposals. Current authorities are mapped in `Docs/INDEX.md`.

## Settled (operator 2026-07-28)

### Mode-smart help (OI-024)
| Mode | Help |
|---|---|
| **Multiple choice** | No pre-answer hint. After pick → authored `explanation`. |
| **Word typing / flash type** | One on-demand cue (blanked `exampleEs` or light cue) → Reveal or Ask tutor. |
| **Sentence / story segment** | Reveal (re-queue) + Ask tutor — not the 3-hint ladder UI. |
| **Typed attempts** | Credit-for-trying floor (never score a real attempt at 0). |

Schema may still store `hints.length(3)`; UI need not show all three. Authoring rewrite → `Registers/post-mvp.md`.

### Panel controls
- **Direction (OI-001) — keep.** Control: EN→ES / ES→EN / Both. **Launch default = Both** (ADR-0005 / OI-007).
- **Lesson multi-select (OI-002) — drop.** Continue + Blend + Review/Saved only. Picker → post-mvp.
- **Daily goal (OI-003) — one slider** (default 50, ~5–150). No presets, no custom field, no Reminders row.

### Home / Lessons / feedback (OI-004 closed)
- **004a Keep both:** Home = Continue + stats + compact path; Lessons = catalog by level.
- **004b Review · N due** on Home (tap → Review; hide/0 when empty).
- **004c Word-level error diff** on typed answers (`wordDiff` from evaluate).
- **004d First-run zero state** — real zeros; no seeded fake streak/demo stats.
- **004e Path/catalog status vocabulary** — only **done / current / locked**. Learning outcomes **Completed / Mastered** remain separate (ADR-0004).
- **004f Lesson detail** — always from real lesson data (no hardcoded Ser-vs-Estar page).
- **004g Quieter card furniture** — less chrome; one job per card.

## Screen map (MVP)

### Session panel (Practice)
Mix arc: **Learn → Quiz(MC) → Words → Sentences → Story**. Dual-duty input (answer or ask tutor). Side panel: Blend, Saved, mode/unit filters, Direction, missed-this-session, end-session — **no** multi-lesson picker. Modes: Type (words/sentences) + flashcards; Voice grayed “soon.”

### Home
Continue (dominant) · stat tiles · **Review · N due** · compact path (done / current / locked) · weekly vs goal. Progress may separately show Completed / Mastered. First run: zeros + land toward Lesson 1 fast.

### Lessons tab
Level sections (A1 Foundations “you are here”; locked teasers). Status: done / current / locked only. Tap an available lesson → data-driven lesson detail (objective, explainer, activities, mastery, **study/reference cards** when present — ADR-0012). Locked future lessons may show labeled previews, but never expose Quiz/Practice on material that has not been taught.

### Settings
Goal **slider** · theme (Auto/Light/Dark) · reset data. **No** reminder/notifications row (ADR-0010).

### Confirmed session capabilities (MVP)
- **Ask tutor** in the dual-duty input (any time in Practice).
- **Saved / Review** practice outside the current lesson path (saved words/sentences).
- **Save affordance** on every eligible vocab/sentence surface; save is not confined to Review UI.
- **Study cards** on lesson detail when authored (not in Mix arc).

## Experience + visual contract

- Warm editorial identity: paper-like ground, one restrained sienna accent, quiet card chrome,
  uppercase micro-labels, and Avenir or the closest approved web-safe/licensed equivalent.
- Theme control: Auto / Light / Dark; contrast must meet the accessibility spec.
- First journey: sign up → choose start level → Lesson 1 explainer → first evaluated answer in
  under 90 seconds. Never strand first run on an empty dashboard.
- Shuffle items per session; emit a clear “daily goal met” feed marker when the threshold crosses.
- Motion is subtle and reduced-motion safe. Correctness and status never depend on color alone.

## Sources (read, don’t copy)
Archived design handoff/consensus · `apps/prototype/index.html` · closed open-items · ADRs 0003–0013.

## Still owned elsewhere
- Proficiency → [Areas/proficiency.md](../Areas/proficiency.md) (OI-019).
- Data model → [Areas/data-model.md](../Areas/data-model.md) (OI-020).
- Evaluation trust/failure contract → [Areas/evaluation.md](../Areas/evaluation.md).
- SessionEngine → [Areas/session-engine.md](../Areas/session-engine.md) (OI-021).
- Progress surface → [progress.md](progress.md); accessibility → [accessibility.md](accessibility.md).
- Lesson shape → `@aidioma/lesson-schema` (`packages/lesson-schema`).
