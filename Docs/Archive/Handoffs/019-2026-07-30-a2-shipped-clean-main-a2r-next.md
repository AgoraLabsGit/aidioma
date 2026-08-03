---
title: Handoff — A2 shipped; clean protected main; A2R next
type: handoff
status: active
updated: 2026-07-30
---

# Handoff — A2 shipped; clean protected main; A2R next

**Role:** App coordinator on protected `main`
**Next command:** `/run`
**Fresh-session prompt:** `Continue AIdioma from Handoff 019; open A2R from current origin/main.`

## Shipped position

- PR #2 merged A2 and its reconciled documentation into `origin/main` at
  `c3f50be2ad45f858398727c16bf0a1cb4fe37786`. Production deployment
  `dpl_6w6W9iQewZbf3VFb7UWu1EjN4dME` is READY at
  `https://aidioma-1mtnsr5x3-agoralabs.vercel.app` and owns the public aliases.
- Full local App/Content gates and final PR `app-validate`, `content-validate`, and Vercel checks
  passed. Production `/` and `/lessons` returned 200; signed-out `/api/evaluate` returned learner-safe
  401 with `no-store`/`nosniff`; the bounded deployment error-log scan was empty.
- Preview and Production `aidioma-evaluate-user` rules are live at 30 requests / 60 seconds with no
  draft. The evaluation-only Gateway key retains its active $1 monthly budget and opaque reporting.
- GitHub `main` requires an up-to-date PR with App/Content checks, includes administrators, blocks
  force-push/deletion, and requires zero approving reviews for the solo-founder workflow.

## Workspace position

- The primary checkout is synchronized from `origin/main`. Completed A2/process worktrees and their
  local/remote refs are removed; the merged release PR/branch is closed/deleted.
- `.worktrees/c2` remains because it contains active uncommitted a1-05 Content work. Its owner must
  reconcile from current `origin/main` before `/close`; do not remove or edit it from App work.
- Completed docs now merge promptly. Deployable worker branches remain isolated only while active,
  then the coordinator integrates exact SHAs, removes their worktrees, and deletes merged refs.

## Next

Run `/run` for A2R: audit the shipped application baseline and conduct the founder phone/desktop UI
review before A3 persistence. Keep A2R's file ownership disjoint from the active C2 content work.
