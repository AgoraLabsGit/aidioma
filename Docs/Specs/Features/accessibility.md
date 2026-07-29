---
title: Accessibility — MVP acceptance contract
type: feature-spec
status: active
updated: 2026-07-29
---

# Accessibility — MVP acceptance contract

AIdioma targets WCAG 2.2 AA for the production web app.

## Required behavior

- Every action is keyboard-operable with a logical focus order and visible focus indicator.
- Interactive targets are at least 44×44 CSS pixels where practical.
- Labels, errors, correctness, status, and charts never rely on color alone.
- Semantic landmarks/headings and accessible names make session cards and feedback readable by
  screen readers; dynamic feedback uses appropriate live-region behavior without chatter.
- Text scales to 200% without lost content or horizontal page scrolling at phone widths.
- Motion respects `prefers-reduced-motion`; no learning-critical information depends on animation.
- Light/dark themes maintain AA contrast, including sienna accents and word-diff marks.
- Error recovery preserves learner input and moves focus to useful feedback/retry controls.
- Voice controls expose keyboard-operable record/stop/retry/play/mute actions, visible recording and
  permission state, captions/transcripts, and a typed fallback. No instruction, correction, or
  progress signal exists only in audio; autoplay never starts a microphone without a user gesture.

## Gate

A1 establishes automated lint/axe coverage. Each user-visible wave adds keyboard + screen-reader
semantics to its browser smoke path. A7 launch audit includes phone/desktop zoom, contrast,
reduced-motion, keyboard-only, and a manual screen-reader pass. A10 adds microphone denial, recording
timeout, transcript edit/retry, audio-disabled, and screen-reader announcement paths to its proof.
