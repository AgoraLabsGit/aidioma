#!/usr/bin/env node

import { existsSync, lstatSync, readFileSync, readdirSync, readlinkSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export const COMMANDS = [
  'task',
  'fix',
  'log',
  'spec',
  'phase-spec',
  'decision',
  'research',
  'plan',
  'run',
  'check',
  'handoff',
  'close',
  'phase-close',
  'publish',
  'release',
  'status',
];

const WORK_KINDS = new Set(['fix', 'task', 'proposal', 'research', 'question', 'audit', 'design']);
const WORK_STATUSES = new Set(['open', 'active', 'done', 'promoted', 'dropped']);
const KIND_PREFIX = { fix: 'F', task: 'T', proposal: 'P', research: 'R', question: 'Q', audit: 'A', design: 'S' };
const REQUIRED_LENSES = new Set([
  'Claims / Proof evidence',
  'Code quality / Standards',
  'MCOO',
  'Seams / Integration',
  'Security / Privacy',
  'API / Provider usage',
  'Product / Learner journey',
]);

function readYaml(path) {
  return YAML.parse(readFileSync(path, 'utf8'));
}

export function parseFrontmatter(text, path = '<document>') {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!match) throw new Error(`${path}: missing YAML frontmatter`);
  const value = YAML.parse(match[1]);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${path}: frontmatter must be a map`);
  return value;
}

export function validateWork(rows) {
  const errors = [];
  if (!Array.isArray(rows)) return ['Docs/WORK.yaml must be a YAML array'];
  const ids = new Set();
  for (const [index, row] of rows.entries()) {
    const at = `Docs/WORK.yaml entry ${index + 1}`;
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      errors.push(`${at} must be a map`);
      continue;
    }
    if (!WORK_KINDS.has(row.kind)) errors.push(`${at}: invalid kind ${row.kind}`);
    const prefix = KIND_PREFIX[row.kind];
    if (!new RegExp(`^${prefix ?? '[A-Z]'}-\\d{3}$`).test(row.id ?? '')) errors.push(`${at}: ID ${row.id} does not match kind ${row.kind}`);
    if (ids.has(row.id)) errors.push(`${at}: duplicate ID ${row.id}`);
    ids.add(row.id);
    if (!WORK_STATUSES.has(row.status)) errors.push(`${at}: invalid status ${row.status}`);
    if (typeof row.summary !== 'string' || !row.summary.trim()) errors.push(`${at}: summary is required`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(row.opened ?? ''))) errors.push(`${at}: opened must be YYYY-MM-DD`);
    if (row.status === 'done' && (typeof row.done_summary !== 'string' || !row.done_summary.trim())) {
      errors.push(`${at}: done work needs done_summary`);
    }
    if (row.status === 'active' && (typeof row.target !== 'string' || !row.target.trim())) {
      errors.push(`${at}: active work needs target`);
    }
    if (row.status === 'promoted' && (typeof row.promoted_to !== 'string' || !row.promoted_to.trim())) {
      errors.push(`${at}: promoted work needs promoted_to`);
    }
  }
  return errors;
}

export function validatePhaseLifecycle(path, phase, closeRecordExists) {
  const errors = [];
  if (phase.workflow_version !== 2) return errors;
  if (phase.state === 'closed') {
    if (!/^\d{4}-\d{2}-\d{2}/.test(String(phase.closed ?? ''))) {
      errors.push(`${path}: workflow-version 2 closed phase needs a closed date`);
    }
    if (typeof phase.lessons !== 'string' || !phase.lessons.trim()) {
      errors.push(`${path}: workflow-version 2 closed phase needs retained lessons`);
    }
    if (!closeRecordExists) {
      errors.push(`${path}: workflow-version 2 closed phase needs its close record`);
    }
  } else if (phase.closed != null || phase.lessons != null) {
    errors.push(`${path}: non-closed workflow-version 2 phase cannot claim closed metadata`);
  }
  return errors;
}

export function phaseNeedsTarget(phase) {
  return phase.workflow_version === 2 && ['proposed', 'ready', 'active', 'blocked'].includes(phase.state);
}

export function validateRoadmapStates(text, phaseStates) {
  const errors = [];
  const indexed = new Set();
  const pattern = /\[(PHASE-\d{3})[^\]]*\]\(Phases\/\1\.md\)\s*\|\s*(?:design|build)\s*\|\s*([a-z]+)\s*\|/g;
  for (const match of text.matchAll(pattern)) {
    indexed.add(match[1]);
    const actual = phaseStates.get(match[1]);
    if (!actual) errors.push(`Docs/Roadmap/Roadmap.md: ${match[1]} has no canonical phase`);
    else if (actual.state !== match[2]) {
      errors.push(`Docs/Roadmap/Roadmap.md: ${match[1]} says ${match[2]} but phase says ${actual.state}`);
    }
  }
  for (const [id, phase] of phaseStates) {
    if (phase.workflow_version === 2 && !indexed.has(id)) {
      errors.push(`Docs/Roadmap/Roadmap.md: workflow-version 2 ${id} is missing from the index`);
    }
  }
  return errors;
}

function validateSpec(path, frontmatter) {
  const errors = [];
  const fileId = path.slice(path.lastIndexOf('/') + 1, -3);
  if (frontmatter.id !== fileId) errors.push(`${path}: frontmatter id must match filename`);
  if (!['feature', 'area'].includes(frontmatter.kind)) errors.push(`${path}: kind must be feature or area`);
  const expected = frontmatter.kind === 'feature' ? /^SPEC-F-[A-Z0-9-]+$/ : /^SPEC-A-[A-Z0-9-]+$/;
  if (!expected.test(frontmatter.id ?? '')) errors.push(`${path}: invalid spec ID`);
  if (!['active', 'superseded', 'contested'].includes(frontmatter.status)) errors.push(`${path}: invalid status`);
  if (!Array.isArray(frontmatter.paths) || frontmatter.paths.length === 0) errors.push(`${path}: paths must be non-empty`);
  if (frontmatter.kind === 'feature' && !Array.isArray(frontmatter.depends_on)) errors.push(`${path}: feature needs depends_on`);
  if (frontmatter.kind === 'area' && Object.hasOwn(frontmatter, 'depends_on')) errors.push(`${path}: area must not declare depends_on`);
  if (frontmatter.status === 'superseded' && !frontmatter.superseded_by) errors.push(`${path}: superseded spec needs superseded_by`);
  return errors;
}

function validateTarget(path, target) {
  const errors = [];
  if (target.version !== 1) errors.push(`${path}: version must be 1`);
  if (!['task', 'fix', 'phase'].includes(target.kind)) errors.push(`${path}: invalid kind`);
  if (![0, 1, 2, 3].includes(target.risk_tier)) errors.push(`${path}: risk_tier must be 0-3`);
  if (!Array.isArray(target.required_lenses) || target.required_lenses.some((lens) => !REQUIRED_LENSES.has(lens))) {
    errors.push(`${path}: required_lenses contains an unknown lens`);
  }
  if (!Array.isArray(target.check_commands) || target.check_commands.some((command) => !Array.isArray(command) || !command.length || command.some((part) => typeof part !== 'string'))) {
    errors.push(`${path}: check_commands must be ordered argv arrays`);
  }
  if (!Array.isArray(target.check_environment) || target.check_environment.some((name) => !/^[A-Z][A-Z0-9_]*$/.test(name))) {
    errors.push(`${path}: check_environment must contain variable names only`);
  }
  if (!Number.isInteger(target.check_timeout_ms) || target.check_timeout_ms < 1000 || target.check_timeout_ms > 3600000) {
    errors.push(`${path}: check_timeout_ms must be between 1000 and 3600000`);
  }
  if (!Array.isArray(target.scopes) || !target.scopes.includes(path)) errors.push(`${path}: scopes must include the target itself`);
  if (target.kind === 'phase' && (!target.authority || !target.scopes?.includes(target.authority))) errors.push(`${path}: phase target must scope its authority`);
  if (target.kind !== 'phase') {
    if (!target.outcome || !Array.isArray(target.proof) || !Array.isArray(target.non_goals)) errors.push(`${path}: task/fix target needs outcome, proof, and non_goals`);
  }
  return errors;
}

function walkMarkdown(folder) {
  if (!existsSync(folder)) return [];
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    return entry.isDirectory() ? walkMarkdown(path) : entry.name.endsWith('.md') ? [path] : [];
  });
}

export function validateRepository(root) {
  const errors = [];
  const relativePath = (path) => path.slice(root.length + 1);
  let workRows = [];
  try {
    workRows = readYaml(join(root, 'Docs', 'WORK.yaml'));
    errors.push(...validateWork(workRows));
  } catch (error) {
    errors.push(`Docs/WORK.yaml: ${error.message}`);
  }

  for (const row of workRows.filter((entry) => entry?.status === 'active' && entry.target)) {
    const absolute = join(root, row.target);
    if (!existsSync(absolute)) {
      errors.push(`Docs/WORK.yaml ${row.id}: active target ${row.target} does not exist`);
      continue;
    }
    try {
      const target = JSON.parse(readFileSync(absolute, 'utf8'));
      if (target.id !== row.id) errors.push(`Docs/WORK.yaml ${row.id}: target id is ${target.id}`);
      if (target.kind !== row.kind) errors.push(`Docs/WORK.yaml ${row.id}: target kind is ${target.kind}`);
    } catch (error) {
      errors.push(`Docs/WORK.yaml ${row.id}: cannot read target: ${error.message}`);
    }
  }

  for (const folder of ['Areas', 'Features']) {
    for (const absolute of walkMarkdown(join(root, 'Docs', 'Specs', folder))) {
      const path = relativePath(absolute);
      try {
        errors.push(...validateSpec(path, parseFrontmatter(readFileSync(absolute, 'utf8'), path)));
      } catch (error) {
        errors.push(error.message);
      }
    }
  }

  const researchFolder = join(root, 'Docs', 'Research');
  if (existsSync(researchFolder)) {
    for (const entry of readdirSync(researchFolder)) {
      if (entry === '.gitkeep') continue;
      if (!/^R-\d{3}\.md$/.test(entry)) {
        errors.push(`Docs/Research/${entry}: research files must use the canonical R-nnn.md name`);
        continue;
      }
      const path = `Docs/Research/${entry}`;
      try {
        const research = parseFrontmatter(readFileSync(join(root, path), 'utf8'), path);
        if (research.id !== entry.slice(0, -3)) errors.push(`${path}: frontmatter id must match filename`);
        if (!research.question || !research.verdict) errors.push(`${path}: question and verdict are required`);
        if (!['fresh', 'stale', 'superseded'].includes(research.status)) errors.push(`${path}: invalid status`);
        if (!Array.isArray(research.informed) || !Array.isArray(research.affects)) errors.push(`${path}: informed and affects must be arrays`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(research.date ?? ''))) errors.push(`${path}: date must be YYYY-MM-DD`);
      } catch (error) {
        errors.push(error.message);
      }
    }
  }

  const decisionsPath = join(root, 'Docs', 'DECISIONS.md');
  if (existsSync(decisionsPath)) {
    const decisionIds = [...readFileSync(decisionsPath, 'utf8').matchAll(/^## (D-\d{3}) — /gm)].map((match) => match[1]);
    const duplicates = decisionIds.filter((id, index) => decisionIds.indexOf(id) !== index);
    for (const id of new Set(duplicates)) errors.push(`Docs/DECISIONS.md: duplicate decision ${id}`);
  }

  const phaseFolder = join(root, 'Docs', 'Roadmap', 'Phases');
  const phaseStates = new Map();
  if (existsSync(phaseFolder)) {
    for (const entry of readdirSync(phaseFolder)) {
      if (!entry.endsWith('.md')) continue;
      if (!/^PHASE-\d{3}\.md$/.test(entry)) {
        errors.push(`Docs/Roadmap/Phases/${entry}: phase files must use the canonical PHASE-nnn.md name`);
        continue;
      }
      const path = `Docs/Roadmap/Phases/${entry}`;
      try {
        const source = readFileSync(join(root, path), 'utf8');
        const phase = parseFrontmatter(source, path);
        const id = entry.slice(0, -3);
        phaseStates.set(id, phase);
        if (phase.id !== id) errors.push(`${path}: frontmatter id must match filename`);
        if (!['design', 'build'].includes(phase.type)) errors.push(`${path}: invalid type`);
        if (!['proposed', 'ready', 'active', 'closed', 'blocked', 'canceled'].includes(phase.state)) errors.push(`${path}: invalid state`);
        if (phase.type === 'design' && phase.proof_kind !== 'spec') errors.push(`${path}: design phases require proof_kind spec`);
        if (!phase.outcome || !phase.proof || !Array.isArray(phase.non_goals)) errors.push(`${path}: outcome, proof, and non_goals are required`);
        const closeRecord = join(root, 'Docs', 'Evidence', id.toLowerCase(), 'close-record.json');
        errors.push(...validatePhaseLifecycle(path, phase, existsSync(closeRecord)));
        if (phaseNeedsTarget(phase)) {
          const target = join(root, 'Docs', 'Evidence', id.toLowerCase(), 'target.json');
          if (!existsSync(target)) {
            errors.push(`${path}: live phase needs Docs/Evidence/${id.toLowerCase()}/target.json`);
          } else {
            const contract = JSON.parse(readFileSync(target, 'utf8'));
            const selectedTier = /\*\*Risk tier:\*\*\s*([1-3])/.exec(source)?.[1];
            if (Number(selectedTier) !== contract.risk_tier) errors.push(`${path}: audit risk tier must match target.json`);
            for (const lens of REQUIRED_LENSES) {
              if (!source.includes(`| ${lens} |`)) errors.push(`${path}: audit table is missing ${lens}`);
            }
          }
        }
      } catch (error) {
        errors.push(error.message);
      }
    }
  }

  const roadmapPath = join(root, 'Docs', 'Roadmap', 'Roadmap.md');
  if (existsSync(roadmapPath)) {
    errors.push(...validateRoadmapStates(readFileSync(roadmapPath, 'utf8'), phaseStates));
  }

  const evidenceFolder = join(root, 'Docs', 'Evidence');
  if (existsSync(evidenceFolder)) {
    for (const entry of readdirSync(evidenceFolder, { withFileTypes: true })) {
      const absolute = join(evidenceFolder, entry.name, 'target.json');
      if (!entry.isDirectory() || !existsSync(absolute)) continue;
      const path = relativePath(absolute);
      try {
        errors.push(...validateTarget(path, JSON.parse(readFileSync(absolute, 'utf8'))));
      } catch (error) {
        errors.push(`${path}: ${error.message}`);
      }
    }
  }

  for (const command of COMMANDS) {
    const skill = join(root, '.claude', 'skills', command, 'SKILL.md');
    const cursor = join(root, '.cursor', 'commands', `${command}.md`);
    const agent = join(root, '.agents', 'skills', command);
    if (!existsSync(skill)) {
      errors.push(`Missing native skill: .claude/skills/${command}/SKILL.md`);
    } else {
      try {
        const metadata = parseFrontmatter(readFileSync(skill, 'utf8'), `.claude/skills/${command}/SKILL.md`);
        if (metadata.name !== command) errors.push(`.claude/skills/${command}/SKILL.md: skill name must be ${command}`);
      } catch (error) {
        errors.push(error.message);
      }
    }
    if (!existsSync(cursor)) {
      errors.push(`Missing Cursor command: .cursor/commands/${command}.md`);
    } else if (!readFileSync(cursor, 'utf8').includes(`.claude/skills/${command}/SKILL.md`)) {
      errors.push(`.cursor/commands/${command}.md: must route to the matching native skill`);
    }
    if (!existsSync(agent)) {
      errors.push(`Missing Codex skill link: .agents/skills/${command}`);
    } else if (!lstatSync(agent).isSymbolicLink() || readlinkSync(agent) !== `../../.claude/skills/${command}`) {
      errors.push(`.agents/skills/${command}: must link to the matching native skill`);
    }
  }

  for (const hooksPath of ['.claude/settings.json', '.cursor/hooks.json', '.codex/hooks.json']) {
    try {
      const config = JSON.parse(readFileSync(join(root, hooksPath), 'utf8'));
      if (Object.keys(config.hooks ?? {}).length) errors.push(`${hooksPath}: repository mutation hooks must remain empty`);
    } catch (error) {
      errors.push(`${hooksPath}: ${error.message}`);
    }
  }

  const forbiddenPaths = ['.praxis', '.work', 'Docs/System'];
  for (const path of forbiddenPaths) if (existsSync(join(root, path))) errors.push(`${path}: obsolete development-system path must be removed`);
  const tools = join(root, 'tools');
  if (existsSync(tools)) {
    for (const entry of readdirSync(tools)) if (/praxis/i.test(entry)) errors.push(`tools/${entry}: obsolete development package must be removed`);
  }
  const agentSkills = join(root, '.agents', 'skills');
  if (existsSync(agentSkills)) {
    for (const entry of readdirSync(agentSkills)) if (/^praxis-/i.test(entry)) errors.push(`.agents/skills/${entry}: obsolete skill alias must be removed`);
  }

  const activeTextPaths = [
    'AGENTS.md', 'CLAUDE.md', 'README.md', 'Docs/AGENTS.md', 'Docs/START.md', 'Docs/NOW.md',
    'Docs/WORK.yaml', 'Docs/COMMANDS-OVERVIEW.md', 'Docs/CLOSE.md',
  ];
  for (const command of COMMANDS) {
    activeTextPaths.push(`.claude/skills/${command}/SKILL.md`, `.cursor/commands/${command}.md`);
  }
  for (const path of activeTextPaths) {
    if (!existsSync(join(root, path))) continue;
    if (/\bpraxis\b/i.test(readFileSync(join(root, path), 'utf8'))) errors.push(`${path}: references the removed development extension`);
  }

  const nowPath = join(root, 'Docs', 'NOW.md');
  if (existsSync(nowPath)) {
    const activeSection = /## Active\s+([\s\S]*?)(?=\n## |$)/.exec(readFileSync(nowPath, 'utf8'))?.[1] ?? '';
    for (const match of activeSection.matchAll(/\*\*((?:F|T)-\d{3})\s+—/g)) {
      const row = workRows.find((entry) => entry.id === match[1]);
      if (!row) errors.push(`Docs/NOW.md: active pointer ${match[1]} is not in WORK.yaml`);
      else if (row.status !== 'active') errors.push(`Docs/NOW.md: active pointer ${match[1]} has status ${row.status}`);
    }
  }

  return errors;
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = validateRepository(ROOT);
  if (errors.length) {
    console.error(`docs:check failed with ${errors.length} problem${errors.length === 1 ? '' : 's'}:`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log('docs:check passed');
  }
}
