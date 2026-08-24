---
description: Publish one exact audited head through PR, CI, and merge.
---

# /publish

This is the native-chat adapter for canonical action `publication.execute` (registry version 6).

1. Gather the canonical publication input for one committed non-main candidate and its pinned Docs audit evidence.
2. Run `praxis publish preflight` with those inputs before requesting or accepting confirmation.
3. Review the normalized request, exact candidate head, repository findings, provider enforcement, required checks, and every audit whose pinned phase Audit table says `Run? yes`; stop on any blocked or omitted item.
4. Invoke `praxis publish execute` with the same normalized inputs only after explicit confirmation of that exact head.
5. Inspect the retained publication with `praxis publish status --publication <id>` and report its receipt state and `nextAction`.
6. Use `praxis publish cancel|retry|reconcile --publication <id> --confirm` only when the retained state and `nextAction` call for that recovery; never invent or skip a lifecycle transition.
7. Never invoke raw Git or GitHub merge commands, and never hand-edit generated Work, Activity, handoff, audit, or publication projections.
