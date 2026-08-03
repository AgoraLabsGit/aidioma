# Deprecations — dying code and data

> Anything superseded-but-not-yet-deleted. Each row names a TRIGGER (an event, not a date).
> The wave-close hygiene slice EXECUTES every row whose trigger has fired — a wave cannot
> close with a fired trigger unexecuted.
>
> V1/V2 are archived reference, not ported code. Their old evaluation services die by omission
> when A2 builds the single endpoint. The temporary prototype remains only for current visual and
> content proof, with its deletion trigger owned below.

| ID | What dies | Replaced by | Deletion trigger | Status |
|---|---|---|---|---|
| DEP-001 | `apps/prototype/` + `tooling/prototype/` | Real data-driven practice and lesson-detail flow in `apps/web/` | A4-2 proves the production flow covers the prototype’s required states | pending |
