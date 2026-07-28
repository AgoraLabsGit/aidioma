---
title: Legacy review and SSOT consolidation
type: audit
status: closed
updated: 2026-07-28
---

# Legacy review and SSOT consolidation

## Scope

Read-only parallel review of the former `MVP-DESIGN/`, V1, V2, old documentation,
`lesson-content/`, and `prototype/` trees before archival/reorganization.

## Findings that must enter the current design

| Finding | Current home / disposition |
|---|---|
| Browser evaluation input could expose authored answers | `Specs/Areas/evaluation.md`: browser sends item identity + learner input only; server resolves answers |
| Session completion was not persistable | ADR-0013 + data-model/session-engine/evaluation specs |
| Exact blend defaults existed only in the old consensus | `Specs/Areas/session-engine.md` |
| Full DB/evaluation fields delegated to an external baseline | `Specs/Areas/data-model.md` + `evaluation.md` |
| AI outage fallback must never invent a score | `evaluation.md` |
| `wordDiff` marks were unspecified | `evaluation.md`: correct/close/wrong/missing/extra |
| Accessibility had no current acceptance contract | `Specs/Features/accessibility.md` |
| Progress and visual direction were underspecified | `Specs/Features/progress.md` + `module-spec.md` |
| App-facing content pipeline/governance was external | `Specs/Areas/content-pipeline.md` |

## Post-MVP material retained

The register keeps: reviewed KB growth/alternate promotion; five-level mastery candidate; SRS;
audio/listen; deeper lessons; constrained conversations; assistance telemetry; richer reading;
user-content import; offline continuity; later placement; structural difficulty checks.

## Archive-only conclusions

- Do not port V1/V2 implementation. Legacy AI fallbacks can fabricate grades; old schemas,
  cache, Supabase choice, XP/badges, punitive hints, and completion claims are superseded.
- Preserve V1/V2 as sensitive local evidence: V1 has nested Git history/stash/dirty work and
  both trees contain `.env` files. Never stage or push these archives.
- The old documentation is historical only; extract requirements, then retain its meaningful files.
- `MVP-DESIGN` becomes historical once its live contracts are migrated into `Docs`.

## Target layout

```text
Docs/                         application-design + process SSOT
apps/web/                     future production Next.js app (A1)
apps/prototype/               temporary A0 static reference until replaced
packages/lesson-schema/       shared executable contract
content/                      lessons, curriculum, style, reviews, authoring history
tooling/content/              content validator + fixtures/config
tooling/prototype/            temporary prototype export adapter
Archive/Legacy-Apps/          ignored, secret-bearing V1/V2 source vault
Docs/Archive/Design/          tracked historical design baseline
Docs/Archive/Legacy/          tracked historical documentation
```

## Safety constraints

- Add archive ignore rules before moving V1/V2.
- Preserve nested Git and secret-bearing files only inside the ignored local vault.
- Generated dependencies/builds are reproducible and should not be archived.
- Move governance into Docs; move executable schema into a real package export.
- Historical logs keep old paths as evidence; active files use only the new layout.

## Review evidence

Three parallel read-only audits completed: MVP design, legacy apps/docs, and content/app boundary.
No source tree was mutated during review. Pre-move curated inventories were recorded as:

- V1: 250 files, SHA-256 inventory `e1eaf29dc8f86d144673b341b06bd0d9a2bad7fdaca35d202bed1f8a0eb6f751`
- V2: 146 files, `5c62165823e78895926296a25bc1c6ffac30c717d6e6f8cae0694e16b1236811`
- old docs: 39 files, `bbb78ebe581fbc6e76c30da31153b0df30347551255cf6bf8f09d72269a04661`
- MVP design: 8 files, `29d7b236651442735ef84b0e3465803ad812ef8c57829b52eecbdf6517078c89`

Execution complete: current design facts were migrated, V1/V2 moved into the ignored local vault,
historical design/docs moved under `Docs/Archive`, two live-looking legacy connection examples were
redacted, and generated dependencies/build/log/OS debris was removed (about 671 MB). V1/V2 `.env`
files and V1 nested Git evidence remain protected in the ignored archive. Post-move commands and
residue evidence are recorded in A0-H.
