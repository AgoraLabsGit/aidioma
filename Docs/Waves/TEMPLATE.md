---
title: <Wave-Slice — plain title>
type: wave-slice
status: draft
updated: YYYY-MM-DD
---

# <ID> — <title>

## Brief
- **Lane:** <App | Content>
- **Goal:** <what exists when this is done, in one sentence>
- **Touches:** <files/areas this slice may modify — its declared territory>
- **Out of scope:** <explicitly not this slice>
- **Verify plan:** <which gates (the lane's set) + what the PROVE will show on screen>

## Gates (stage 2 — record actual results)
| Gate | Command | Result |
|---|---|---|
| typecheck | | |
| lint | | |
| tests (baseline: <n> passing) | | |
| build | | |
| smoke | | |

## Audit (stage 3)
- Auditors: <1 light / 2–3 full — why this sizing>
- Findings: <critical: … / warnings: … / dispositions>
- Delta re-audit: <result after fixes>

## Review (stage 4)
- /code-review findings + dispositions.

## Proof (stage 6)
- <PASS/FAIL script output line + screenshot path or run transcript reference>

## Clean (stage 7)
- <what was deleted, or the DEP-row filed>

## Decisions
- <any decision made inside this slice worth remembering; big ones become ADRs>
