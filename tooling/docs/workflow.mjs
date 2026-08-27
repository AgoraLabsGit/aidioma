#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const PREFIX = {
  fix: 'F',
  task: 'T',
  proposal: 'P',
  research: 'R',
  question: 'Q',
  audit: 'A',
  design: 'S',
};

const BASE_LENSES = ['Claims / Proof evidence', 'Code quality / Standards', 'MCOO'];

function fail(message) {
  throw new Error(message);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function parseInput(argv) {
  const positionals = [];
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) fail(`Missing value for --${key}`);
    index += 1;
    if (key === 'path' || key === 'scope' || key === 'non-goal') {
      options[key] = [...(options[key] ?? []), value];
    } else {
      options[key] = value;
    }
  }
  return { positionals, options };
}

function loadWork(root) {
  const path = join(root, 'Docs', 'WORK.yaml');
  const document = YAML.parseDocument(readFileSync(path, 'utf8'));
  if (!document.contents || document.contents.type === 'MAP') fail('Docs/WORK.yaml must be a YAML array');
  return { path, document, rows: document.toJS() };
}

function saveWork(path, document) {
  writeFileSync(path, String(document));
}

function nextWorkId(kind, rows) {
  const prefix = PREFIX[kind];
  if (!prefix) fail(`Unsupported work kind: ${kind}`);
  const highest = rows.reduce((max, row) => {
    const match = new RegExp(`^${prefix}-(\\d{3})$`).exec(row.id ?? '');
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}-${String(highest + 1).padStart(3, '0')}`;
}

function commandLog(root, args) {
  const { positionals, options } = parseInput(args);
  const [kind, summary] = positionals;
  if (!kind || !summary) fail('Usage: log <kind> <summary> [--note text] [--feature ID] [--area ID] [--phase ID]');
  const { path, document, rows } = loadWork(root);
  const id = nextWorkId(kind, rows);
  const entry = {
    id,
    kind,
    summary,
    status: 'open',
    feature: options.feature ?? null,
    area: options.area ?? null,
    phase: options.phase ?? null,
    promoted_to: null,
    blocked_by: null,
    note: options.note ?? null,
    context_paths: null,
    open_questions: null,
    done_summary: null,
    opened: today(),
  };
  document.add(entry);
  saveWork(path, document);
  return `Logged ${id}: ${summary}`;
}

function assertNewPath(path) {
  if (existsSync(path)) fail(`Refusing to overwrite existing file: ${path}`);
  mkdirSync(dirname(path), { recursive: true });
}

function commandSpec(root, args) {
  const { positionals, options } = parseInput(args);
  const [kind, id, title] = positionals;
  if (!['feature', 'area'].includes(kind) || !id || !title || !options.path?.length) {
    fail('Usage: spec <feature|area> <SPEC-ID> <title> --path <owned/glob> [--path <owned/glob>]');
  }
  const expected = kind === 'feature' ? /^SPEC-F-[A-Z0-9-]+$/ : /^SPEC-A-[A-Z0-9-]+$/;
  if (!expected.test(id)) fail(`${id} does not match ${kind} spec IDs`);
  const folder = kind === 'feature' ? 'Features' : 'Areas';
  const path = join(root, 'Docs', 'Specs', folder, `${id}.md`);
  assertNewPath(path);
  const shared = [
    '---',
    `id: ${id}`,
    `kind: ${kind}`,
    `title: ${JSON.stringify(title)}`,
    'status: active',
    'superseded_by: null',
  ];
  if (kind === 'feature') shared.push('depends_on: []');
  else shared.push('vendor: null');
  shared.push('decisions: []', 'built_by: []', 'last_amended: null', 'research: []', 'paths:');
  for (const ownedPath of options.path) shared.push(`  - ${JSON.stringify(ownedPath)}`);
  shared.push(
    '---',
    '',
    `# ${title}`,
    '',
    '## Purpose',
    '',
    kind === 'feature' ? 'What this lets the learner do and why it matters.' : 'What this shared capability provides to its feature consumers.',
    '',
    '## Behavior',
    '',
    '- Rule: Replace with a present-tense, observable, testable behavior.',
    '- Failure mode: Replace with the visible failure behavior.',
    '',
    '## Boundaries',
    '',
    'Replace with explicit ownership boundaries.',
    '',
  );
  if (kind === 'feature') shared.push('## Dependencies', '', 'Name each area dependency and what it provides.', '');
  else shared.push('## Vendor', '', 'Complete only when `vendor` is not null.', '');
  writeFileSync(path, `${shared.join('\n')}\n`);
  return `Created ${relative(root, path)}`;
}

function phaseLenses(tier, provider) {
  const lenses = [...BASE_LENSES];
  if (tier >= 2) lenses.push('Seams / Integration');
  if (tier >= 3) lenses.push('Security / Privacy');
  if (provider) lenses.push('API / Provider usage');
  if (tier >= 2) lenses.push('Product / Learner journey');
  return lenses;
}

function commandPhase(root, args) {
  const { positionals, options } = parseInput(args);
  const [id, title] = positionals;
  if (!/^PHASE-\d{3}$/.test(id ?? '') || !title || !options.outcome || !options.proof) {
    fail('Usage: phase <PHASE-nnn> <title> --outcome <observable result> --proof <proof> [--type build|design] [--risk 1|2|3]');
  }
  const type = options.type ?? 'build';
  if (!['build', 'design'].includes(type)) fail('--type must be build or design');
  const risk = Number(options.risk ?? 1);
  if (![1, 2, 3].includes(risk)) fail('--risk must be 1, 2, or 3');
  const order = Number(options.order ?? Number(id.slice(-3)));
  if (!Number.isInteger(order) || order < 0) fail('--order must be a non-negative integer');
  const phasePath = join(root, 'Docs', 'Roadmap', 'Phases', `${id}.md`);
  const evidenceDir = join(root, 'Docs', 'Evidence', id.toLowerCase());
  const targetPath = join(evidenceDir, 'target.json');
  assertNewPath(phasePath);
  assertNewPath(targetPath);
  const opened = today();
  const proofKind = type === 'design' ? 'spec' : 'test';
  const provider = options.provider === 'yes';
  const auditRows = [
    '| Claims / Proof evidence | yes | every phase | assigned at close |',
    '| Code quality / Standards | yes | every phase | assigned at close |',
    '| MCOO | yes | every phase | assigned at close |',
    risk >= 2
      ? '| Seams / Integration | yes | Tier 2–3 | assigned at close |'
      : '| Seams / Integration | n/a | Tier 1 with no changed boundary | — |',
    risk >= 3
      ? '| Security / Privacy | yes | Tier 3 | assigned at close |'
      : '| Security / Privacy | n/a | no changed trust or personal-data boundary | — |',
    provider
      ? '| API / Provider usage | yes | external provider is in scope | assigned at close |'
      : '| API / Provider usage | n/a | no external provider is in scope | — |',
    risk >= 2
      ? '| Product / Learner journey | yes | Tier 2–3 | assigned at close |'
      : '| Product / Learner journey | n/a | Tier 1 with no learner-visible change | — |',
  ].join('\n');
  const templatePath = join(root, 'Docs', 'Development', 'Templates', 'phase-spec.md');
  if (!existsSync(templatePath)) fail('Missing canonical phase template: Docs/Development/Templates/phase-spec.md');
  let phase = readFileSync(templatePath, 'utf8');
  const replacements = [
    [/^id: PHASE-000$/m, `id: ${id}`],
    [/^title: Outcome-shaped title$/m, `title: ${JSON.stringify(title)}`],
    [/^type: build$/m, `type: ${type}`],
    [/^proof_kind: test$/m, `proof_kind: ${proofKind}`],
    [/^order: 0$/m, `order: ${order}`],
    [/^outcome: "One observable result"$/m, `outcome: ${JSON.stringify(options.outcome)}`],
    [/^proof: "The exact learner journey, test, artifact, or state that proves it"$/m, `proof: ${JSON.stringify(options.proof)}`],
    [/^opened: YYYY-MM-DD$/m, `opened: ${opened}`],
    [/^# PHASE-000 — Outcome-shaped title$/m, `# ${id} — ${title}`],
    [/^- \[ \] One named proof artifact or command\.$/m, `- [ ] ${options.proof}`],
    [/^\*\*Risk tier:\*\* 1$/m, `**Risk tier:** ${risk}`],
    [/^\/run PHASE-000$/m, `/run ${id}`],
  ];
  for (const [pattern, replacement] of replacements) phase = phase.replace(pattern, replacement);
  phase = phase.replace(
    /\| Lens \| Run\? \| Why \/ N\/A \| Sub-agent \|\n\|---\|---\|---\|---\|\n[\s\S]*?(?=\n\n## Kickoff)/u,
    `| Lens | Run? | Why / N/A | Sub-agent |\n|---|---|---|---|\n${auditRows}`,
  );
  const phaseRel = relative(root, phasePath);
  const targetRel = relative(root, targetPath);
  const target = {
    version: 1,
    id,
    kind: 'phase',
    evidence_dir: relative(root, evidenceDir),
    risk_tier: risk,
    authority: phaseRel,
    required_lenses: phaseLenses(risk, provider),
    check_commands: [['npm', 'run', 'docs:check']],
    check_environment: [],
    check_timeout_ms: 120000,
    scopes: [phaseRel, targetRel].sort(),
  };
  writeFileSync(phasePath, phase);
  writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`);
  return `Created ${phaseRel} and ${targetRel}`;
}

function commandStatus(root) {
  const { rows } = loadWork(root);
  const open = rows.filter((row) => ['open', 'active'].includes(row.status));
  if (!open.length) return 'No open work.';
  return open.map((row) => `${row.id}\t${row.status}\t${row.phase ?? '-'}\t${row.summary}`).join('\n');
}

export function runWorkflow(argv, root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')) {
  const [command, ...args] = argv;
  if (command === 'log') return commandLog(root, args);
  if (command === 'spec') return commandSpec(root, args);
  if (command === 'phase' || command === 'phase-spec') return commandPhase(root, args);
  if (command === 'status') return commandStatus(root);
  fail('Commands: log, spec, phase, phase-spec, status');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(runWorkflow(process.argv.slice(2)));
  } catch (error) {
    console.error(`docs:work failed: ${error.message}`);
    process.exitCode = 1;
  }
}
