# PRODUCT.md — format (SSOT)

Living content: `Docs/PRODUCT.md`. This file owns the **section mold** (D-029).
Keep the living file under one page. Detail belongs in a Feature spec.

```markdown
# Product

## Who it's for

One paragraph. A specific person with a specific problem — not a market segment.
Narrower = more decisions settled.

## What it does

Capability map. One row each. Link `SPEC-F-*` when the Feature stub exists.
If it is not in this table, it is not in scope.

| Capability | Spec |
|---|---|
| <capability> | SPEC-F-XXX |

## What it will never do

At least three concrete non-goals that actually rule work out.
"Won't be a social network" is real; "won't be bloated" is not.

- <non-goal>
- <non-goal>
- <non-goal>

## Principles

Optional. Only product principles that change what gets built.
Not process rules (`System/`), not lints, not preferences.
```

**Changing the living Product file is a decision** — append `DECISIONS.md` (what changed, why).

Do not invent capabilities just to fill the table — empty rows mean unscoped work stays out.
