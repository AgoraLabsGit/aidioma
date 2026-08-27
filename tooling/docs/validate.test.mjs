import assert from 'node:assert/strict';
import test from 'node:test';
import { COMMANDS, parseFrontmatter, phaseNeedsTarget, validatePhaseLifecycle, validateRoadmapStates, validateWork } from './validate.mjs';

test('frontmatter parser accepts the canonical delimiter shape', () => {
  const frontmatter = parseFrontmatter('---\nid: SPEC-F-TEST\nkind: feature\n---\n\n# Test\n');
  assert.equal(frontmatter.id, 'SPEC-F-TEST');
});

test('native command routing has one canonical command list', () => {
  assert.deepEqual(COMMANDS, [
    'task', 'fix', 'log', 'spec', 'phase-spec', 'decision', 'research', 'plan', 'run', 'check',
    'handoff', 'close', 'phase-close', 'publish', 'release', 'status',
  ]);
});

test('work validation catches duplicate IDs and unfinished done entries', () => {
  const errors = validateWork([
    { id: 'T-001', kind: 'task', summary: 'One', status: 'done', opened: '2026-08-01', done_summary: null },
    { id: 'T-001', kind: 'task', summary: 'Two', status: 'open', opened: '2026-08-02' },
  ]);
  assert.ok(errors.some((error) => error.includes('done work needs done_summary')));
  assert.ok(errors.some((error) => error.includes('duplicate ID T-001')));
});

test('work validation requires authority for active and promoted work', () => {
  const errors = validateWork([
    { id: 'F-001', kind: 'fix', summary: 'Active', status: 'active', opened: '2026-08-01' },
    { id: 'T-001', kind: 'task', summary: 'Promoted', status: 'promoted', opened: '2026-08-01' },
  ]);
  assert.ok(errors.some((error) => error.includes('active work needs target')));
  assert.ok(errors.some((error) => error.includes('promoted work needs promoted_to')));
});

test('workflow-version 2 phase state cannot claim closure without proof authority', () => {
  const errors = validatePhaseLifecycle('PHASE-100.md', {
    workflow_version: 2,
    state: 'closed',
    closed: null,
    lessons: null,
  }, false);
  assert.ok(errors.some((error) => error.includes('needs a closed date')));
  assert.ok(errors.some((error) => error.includes('needs retained lessons')));
  assert.ok(errors.some((error) => error.includes('needs its close record')));
});

test('workflow-version 2 active phase cannot carry closed metadata', () => {
  const errors = validatePhaseLifecycle('PHASE-100.md', {
    workflow_version: 2,
    state: 'active',
    closed: '2026-08-27',
    lessons: 'claimed',
  }, true);
  assert.ok(errors.some((error) => error.includes('cannot claim closed metadata')));
});

test('only native workflow-version 2 live phases require target authority', () => {
  assert.equal(phaseNeedsTarget({ state: 'active' }), false);
  assert.equal(phaseNeedsTarget({ workflow_version: 2, state: 'active' }), true);
  assert.equal(phaseNeedsTarget({ workflow_version: 2, state: 'closed' }), false);
});

test('roadmap index must agree with canonical workflow-version 2 phase state', () => {
  const phases = new Map([
    ['PHASE-100', { workflow_version: 2, state: 'ready' }],
    ['PHASE-101', { workflow_version: 2, state: 'proposed' }],
  ]);
  const errors = validateRoadmapStates(
    '| 1 | [PHASE-100 — Test](Phases/PHASE-100.md) | build | active | Test |\n',
    phases,
  );
  assert.ok(errors.some((error) => error.includes('says active but phase says ready')));
  assert.ok(errors.some((error) => error.includes('PHASE-101 is missing from the index')));
});
