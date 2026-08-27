# Target contract

Create `Docs/Evidence/<slug>/target.json` when a task, fix, or phase starts.

```json
{
  "version": 1,
  "id": "T-014",
  "kind": "task",
  "evidence_dir": "Docs/Evidence/t-014",
  "risk_tier": 1,
  "outcome": "Observable result",
  "proof": ["Exact command or learner journey"],
  "non_goals": ["Explicit boundary"],
  "required_lenses": [
    "Claims / Proof evidence",
    "Code quality / Standards",
    "MCOO"
  ],
  "check_commands": [["npm", "run", "docs:check"]],
  "check_environment": [],
  "check_timeout_ms": 120000,
  "scopes": [
    "Docs/Evidence/t-014/target.json",
    "path/owned/by/the/task"
  ]
}
```

Phase targets use `kind: "phase"` and `authority` instead of outcome/proof/non-goals; those fields
remain in the phase file. Scopes are exact and include the target itself. Do not include shared
`Docs/NOW.md` or `Docs/WORK.yaml` just to capture a status change.
