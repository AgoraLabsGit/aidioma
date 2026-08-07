---
schema_version: 3
id: ADV-PROTOCOL
title: Adversarial review protocol
status: approved
owner: founder
---

# Adversarial review protocol

Used whenever COMMANDS says **Required Adv** (`/research`, `/design`, `/close` claims).
Independent pass (sub-agent OK). Fresh context preferred. Not a merge gate by itself —
FAIL under Proof/Scope still blocks via `/close`.

Inspired by red-team practice: define **objectives**, not one-off clever prompts; log
prompt → finding → disposition (see LLM red-team checklists / OWASP-style finding shape).

## 1. Extract claims

| Artifact | Extract |
|---|---|
| `Research/R-*` | Options considered, verdict, revisit-if |
| Decision / spec | Chose/Behavior, non-goals, depends_on |
| Phase (close) | `outcome`, `proof`, `non_goals`, Plan promises, Close-record claims |

## 2. Attack questions (run all that apply)

1. **Overclaim** — Does any claim exceed the evidence / artifact?
2. **Missing alternative** — Was a credible option skipped without reason?
3. **Unconsumed complexity** — Abstraction, dependency, or foundation with no current consumer?
4. **Proof ≠ outcome** — Would the declared proof pass while the outcome is unmet?
5. **Silent scope** — Behavior or paths outside non_goals / phase contract?
6. **False always** — “Always/never” rules that fail on an obvious edge case?
7. **Self-audit bias** — Would a stranger with only the artifact disagree?

## 3. Output (required)

```text
ADV: PASS | WARN | FAIL
Blockers: (none | bullets)
Notes: (optional one line)
```

| Result | Meaning |
|---|---|
| FAIL | Blocks lock (`/research`/`/design` done) or `/close` Proof |
| WARN | Needs founder ack; record on Work/phase |
| PASS | No material blockers |

Attach Adv result in the Research body, decision note, or close audit activity summary.
