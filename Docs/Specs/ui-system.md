---
id: UI-SYSTEM-001
title: UI system and accessibility
area: ui
status: draft
implementation: partial
founder_review: required
updated: 2026-08-03
---

# UI system and accessibility

This migration dossier inventories the reusable UI foundation that exists and defines questions for
a future system plan. It is a founder-approved temporary exception to normal spec creation timing,
remains `status: draft`, and does not approve the current Practice Settings design or freeze current
visuals. `legacy-accepted` preserves a prior decision pending migration disposition; `accepted` is
reserved for current founder approval.

## Outcome

AIdioma presents a coherent, accessible learning experience through a small set of reviewed tokens,
primitives, patterns, and page templates that Practice and Lessons can reuse without erasing their
different learner promises.

## Non-goals

- Do not preserve obsolete prototype styling or V1 component prescriptions.
- Do not treat every current class or component as canonical.
- Do not make a component library redesign a substitute for product and interaction decisions.
- Do not expose engine policy, curriculum internals, or unsupported capability as learner settings.
- Do not claim full WCAG conformance from automated checks alone.

## Classification

| Class | Meaning |
|---|---|
| `implemented` | Present in rendered components, CSS, tests, or smoke checks. |
| `legacy-accepted` | Previously accepted product/accessibility principle preserved pending disposition. |
| `accepted` | Current founder approval in the new SSOT; none is implied by this draft. |
| `candidate` | Proposed system rule requiring `/plan`. |
| `research` | Useful design analysis, not approved product behavior. |
| `superseded` | Historical visual or component guidance contradicted by the current app. |
| `conflicting` | Current implementation and stated acceptance contract differ. |

## Implemented foundation

### Shell and navigation

- `apps/web/src/components/app-shell.tsx` provides a skip link, desktop sidebar, mobile tab bar, and
  focusable main landmark.
- `navigation.tsx` exposes one route-aware primary navigation model in desktop and mobile layouts.
- `ScreenContainer`, responsive widths, and mobile/desktop breakpoints constrain reading and learning
  surfaces in `apps/web/src/app/globals.css`.

### Tokens and themes

- `globals.css` defines light/dark color, typography, spacing, radius, width, and breakpoint tokens.
- `ThemeProvider` and `theme-control.tsx` support Auto, Light, and Dark with device-local persistence.
- Focus styles, minimum control sizes, overflow behavior, and reduced-motion overrides exist globally.

### Reusable primitives

`apps/web/src/components/primitives.tsx` currently supplies:

- buttons, button links, and icon buttons;
- card, badge, progress, and stat-tile display primitives;
- section heading, screen container, and empty state;
- segmented control and form-field structure.

Home, lessons, Practice, Settings, and theme controls reuse portions of this layer. The inventory is
an implemented baseline, not a declaration that every API or visual treatment is final.

## Accessibility baseline

The historical accessibility contract targets WCAG 2.2 AA. Current automated evidence includes:
- semantic landmarks, heading tests, accessible names, route-aware `aria-current`, and a skip link;
- visible `:focus-visible` behavior and keyboard smoke for the skip link and selected Practice flows;
- 44px targets for core controls where practical;
- axe checks using WCAG A/AA tags across application states;
- phone/desktop overflow checks and simulated 200% root text;
- `prefers-reduced-motion` CSS and reduced-motion browser contexts;
- light/dark render checks and accessible failure/status semantics in tested flows.

Evidence lives in `apps/web/scripts/smoke.mjs`, the Practice smoke script, component axe tests, and
`globals.css`. There is no recorded full manual screen-reader pass, complete keyboard traversal, or
measured contrast audit for every state. Voice accessibility is unimplemented and deferred.

## Legacy-accepted principles awaiting migration disposition

- The next useful action should be obvious and the learning content should dominate the page.
- Mobile-first layouts must remain usable at desktop widths rather than becoming a separate product.
- Feedback, status, and correctness must never rely on color alone.
- Learner input should survive recoverable failures, with focus returned to the useful next action.
- Lessons and Practice should reuse prompt, answer, feedback, progress, and session patterns when the
  behavior is genuinely shared.
- Accessibility is part of feature acceptance, not a cleanup step.

## Research retained

The archived Settings audit provides a useful five-way distinction:

1. global/device preference;
2. session request;
3. adaptive or engine-owned policy;
4. content capability/filter;
5. account/data action.

This taxonomy is research input. Its old controls and defaults are not approved. Current founder
feedback rejects the rendered Practice Settings information architecture and learner-facing focus
labels, so that feature requires its own `/plan` after serving capabilities are understood.

## Superseded guidance

- The archived Strike-inspired ultra-dark palette, old font rules, and V1 component structure are
  historical only. Current CSS uses a warm sienna accent, light/dark themes, and a different type stack.
- Static-prototype screenshots and styling are not current UI authority.
- Old module/wave documents may supply design rationale but cannot override rendered behavior or a
  founder-reviewed clean-room spec.

## Candidate UI-system work

- Reduce the current 2,800+ line global stylesheet into a reviewed token layer, primitives, shared
  patterns, and feature/page composition without premature abstraction.
- Define canonical page templates for catalog, session, settings/form, detail, empty, loading, error,
  and recap states.
- Audit primitive APIs for disabled/loading/destructive states, icons, labels, live feedback, form
  errors, and responsive behavior.
- Establish a small visual-regression and manual-accessibility evidence set.
- Remove obsolete prototype classes only after executable usage is inventoried.
- Define which Practice interactions become reusable learning components for Lessons.

None of this candidate work freezes current Practice Settings or authorizes a broad rewrite.

## Reuse boundaries

- Tokens express durable visual roles, not feature-specific names.
- Primitives own semantics and basic interaction states; patterns compose primitives for learning jobs.
- Page components own product copy, data loading, and feature-specific decisions.
- Shared learning interactions may be reused by Practice and Lessons; scheduling and curriculum policy
  remain in their domain engines.
- Web UI is not forced into a future native component tree.

## Acceptance evidence for a planned UI slice

- Founder-reviewed screenshots or live states at phone and desktop widths.
- Semantic and axe tests for all new states, including empty, loading, error, and disabled behavior.
- Keyboard-only operation with visible focus and intentional restoration after dialogs/errors.
- 200% text without lost content or unintended horizontal page scrolling.
- Light/dark contrast evidence and no color-only meaning.
- Reduced-motion behavior and no learning-critical animation.
- Screen-reader verification for dynamic prompt, grading, and error updates where affected.
- Proof that the new component replaces duplication in at least one real consumer without coupling
  unrelated feature logic.

## Open questions

1. Should UI-system planning precede Practice Settings or be its first dependency slice?
2. Which current primitives are canonical enough to retain unchanged?
3. Which shared learning patterns should Practice prove before Lessons adopts them?
4. What manual accessibility evidence is required per feature versus only before launch?
5. Should token and pattern documentation live solely here or also in executable examples/tests?
6. Which global CSS regions are obsolete after static-prototype removal?

## Decisions and discovered issues

### Decisions

| ID | Classification | Decision or candidate | Status |
|---|---|---|---|
| UI-D001 | implemented | Responsive shell, navigation, theme tokens, and basic primitives are current. | retained |
| UI-D002 | legacy-accepted | WCAG 2.2 AA remains the review target. | pending |
| UI-D003 | legacy-accepted | Practice and Lessons may reuse proven learning interactions, not policy. | pending |
| UI-D004 | research | Settings taxonomy separates preference, request, policy, capability, and data action. | retain for `/plan` |
| UI-D005 | candidate | Establish canonical tokens, primitives, patterns, and templates incrementally. | unresolved |

### Canonical work references

- `UI-SYSTEM-001` — define the evidence bar and incrementally establish canonical tokens,
  primitives, patterns, and templates.
- `PRACTICE-SETTINGS-001` — own the rejected/unapproved Practice Settings information architecture.
- `LESSONS-001` — provide the real second consumer before shared learning patterns are generalized.
