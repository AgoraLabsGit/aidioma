import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import YAML from 'yaml';
import { runWorkflow } from './workflow.mjs';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'aidioma-docs-workflow-'));
  mkdirSync(join(root, 'Docs', 'Development', 'Templates'), { recursive: true });
  writeFileSync(
    join(root, 'Docs', 'Development', 'Templates', 'phase-spec.md'),
    readFileSync(new URL('../../Docs/Development/Templates/phase-spec.md', import.meta.url), 'utf8'),
  );
  writeFileSync(join(root, 'Docs', 'WORK.yaml'), '# Work\n- id: T-001\n  kind: task\n  summary: Existing\n  status: done\n  feature: null\n  area: null\n  phase: null\n  promoted_to: null\n  blocked_by: null\n  note: null\n  context_paths: null\n  open_questions: null\n  done_summary: Complete\n  opened: 2026-08-01\n');
  return root;
}

test('log allocates the next kind-specific ID and preserves the register comment', () => {
  const root = fixture();
  assert.equal(runWorkflow(['log', 'task', 'New task'], root), 'Logged T-002: New task');
  const source = readFileSync(join(root, 'Docs', 'WORK.yaml'), 'utf8');
  const rows = YAML.parse(source);
  assert.match(source, /^# Work/);
  assert.equal(rows.at(-1).id, 'T-002');
  assert.equal(rows.at(-1).status, 'open');
});

test('spec scaffolding refuses overwrite and creates valid frontmatter', () => {
  const root = fixture();
  runWorkflow(['spec', 'feature', 'SPEC-F-TEST', 'Test feature', '--path', 'apps/web/src/test/**'], root);
  const path = join(root, 'Docs', 'Specs', 'Features', 'SPEC-F-TEST.md');
  assert.match(readFileSync(path, 'utf8'), /id: SPEC-F-TEST/);
  assert.throws(() => runWorkflow(['spec', 'feature', 'SPEC-F-TEST', 'Again', '--path', 'x/**'], root), /Refusing to overwrite/);
});

test('phase scaffolding creates one canonical phase and target pair', () => {
  const root = fixture();
  runWorkflow(['phase', 'PHASE-010', 'Native workflow', '--outcome', 'The workflow works', '--proof', 'docs:check passes', '--risk', '2'], root);
  const target = JSON.parse(readFileSync(join(root, 'Docs', 'Evidence', 'phase-010', 'target.json'), 'utf8'));
  const phase = readFileSync(join(root, 'Docs', 'Roadmap', 'Phases', 'PHASE-010.md'), 'utf8');
  assert.equal(target.authority, 'Docs/Roadmap/Phases/PHASE-010.md');
  assert.equal(target.risk_tier, 2);
  assert.deepEqual(target.check_commands, [['npm', 'run', 'docs:check']]);
  assert.match(phase, /workflow_version: 2/);
  assert.match(phase, /Coordinate the\nphase in this session/);
  assert.match(phase, /\| Seams \/ Integration \| yes \| Tier 2–3 \|/);
  assert.match(phase, /\| Security \/ Privacy \| n\/a \|/);
});

test('unsupported state shortcuts cannot create invalid work-register state', () => {
  const root = fixture();
  const before = readFileSync(join(root, 'Docs', 'WORK.yaml'), 'utf8');
  assert.throws(() => runWorkflow(['start', 'T-001'], root), /Commands: log, spec, phase, phase-spec, status/);
  assert.throws(() => runWorkflow(['done', 'T-001', '--summary', 'Skipped proof'], root), /Commands: log, spec, phase, phase-spec, status/);
  assert.equal(readFileSync(join(root, 'Docs', 'WORK.yaml'), 'utf8'), before);
});
