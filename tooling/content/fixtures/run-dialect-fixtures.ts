/** Counter-examples for the Phase 2 dialect promotion gate. */

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import {
  DIALECT_PROFILES,
} from '@aidioma/lesson-schema';
import {
  DEFAULT_DIALECT_PATHS,
  gradeDialectAnswer,
  renderDialectContentUnit,
  verifyDialectPackage,
  type DialectPackagePaths,
} from '../dialect-contract.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const TMP = resolvePath(HERE, `.dialect-gen-${process.pid}`);
const CONTRACT = resolvePath(HERE, '..', 'dialect-contract.ts');
const TSX_CLI = createRequire(import.meta.url).resolve('tsx/cli');
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const read = (path: string): any => JSON.parse(readFileSync(path, 'utf8'));

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean) {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}`);
  }
}

interface PackageData {
  unit: any;
  identity: any;
  authority: any;
  report: any;
  review: any;
  receipt: any;
}

function writePackage(name: string, data: PackageData): DialectPackagePaths {
  const dir = join(TMP, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const paths = {
    unit: join(dir, 'unit.json'),
    identity: join(dir, 'identity.json'),
    authority: join(dir, 'authority.json'),
    report: join(dir, 'report.json'),
    review: join(dir, 'review.json'),
    receipt: join(dir, 'receipt.json'),
  };
  writeFileSync(paths.unit, JSON.stringify(data.unit, null, 2));
  writeFileSync(paths.identity, JSON.stringify(data.identity, null, 2));
  writeFileSync(paths.authority, JSON.stringify(data.authority, null, 2));
  writeFileSync(paths.report, JSON.stringify(data.report, null, 2));
  writeFileSync(paths.review, JSON.stringify(data.review, null, 2));
  writeFileSync(paths.receipt, JSON.stringify(data.receipt, null, 2));
  return paths;
}

function hasCode(paths: DialectPackagePaths, code: string): boolean {
  return verifyDialectPackage(paths).findings.some((finding) => finding.code === code);
}

function runCli(args: string[]): { exitCode: number; output: any; raw: string } {
  let exitCode = 0;
  let raw = '';
  try {
    raw = execFileSync(process.execPath, [TSX_CLI, CONTRACT, ...args], { encoding: 'utf8' });
  } catch (error: any) {
    exitCode = error.status ?? 1;
    raw = error.stdout ?? '';
  }
  let output: any = {};
  try { output = JSON.parse(raw); } catch { /* assertion below reports malformed output */ }
  return { exitCode, output, raw };
}

function main() {
  rmSync(TMP, { recursive: true, force: true });
  const base: PackageData = {
    unit: read(DEFAULT_DIALECT_PATHS.unit),
    identity: read(DEFAULT_DIALECT_PATHS.identity),
    authority: read(DEFAULT_DIALECT_PATHS.authority),
    report: read(DEFAULT_DIALECT_PATHS.report),
    review: read(DEFAULT_DIALECT_PATHS.review),
    receipt: read(DEFAULT_DIALECT_PATHS.receipt),
  };

  console.log('Dialect contract fixtures\n');
  const baseline = verifyDialectPackage(DEFAULT_DIALECT_PATHS);
  check('promoted package verifies', baseline.ok && !!baseline.unit);
  const renderedCli = runCli(['render', '--profile', 'es-AR']);
  check(
    'successful render names its promotion receipt',
    renderedCli.exitCode === 0 &&
      renderedCli.output.promotion?.status === 'promoted' &&
      renderedCli.output.promotion?.receiptId === base.receipt.receiptId,
  );

  if (baseline.unit) {
    for (const profile of DIALECT_PROFILES) {
      check(
        `${profile} renders retained canonical text`,
        renderDialectContentUnit(baseline.unit, profile).text === base.report.renderProof[profile],
      );
      const canonical = gradeDialectAnswer(baseline.unit, profile, baseline.unit.renderings[profile].text);
      check(`${profile} canonical answer grades correct`, canonical.outcome === 'correct' && canonical.match === 'canonical');
      for (const [acceptedIndex, accepted] of baseline.unit.renderings[profile].acceptedAnswers.entries()) {
        const acceptedGrade = gradeDialectAnswer(baseline.unit, profile, accepted.text);
        check(
          `${profile} explicit alternative ${acceptedIndex + 1} grades correct`,
          acceptedGrade.outcome === 'correct' && acceptedGrade.match === accepted.kind,
        );
      }
    }
    check(
      'wrong-profile tú answer is flagged for es-AR',
      gradeDialectAnswer(baseline.unit, 'es-AR', 'Tú vives aquí.').outcome === 'dialect-mismatch',
    );
    const latamVoseo = gradeDialectAnswer(baseline.unit, 'es-419', 'Vos vivís acá.');
    check(
      'es-419 accepts documented regional voseo',
      latamVoseo.outcome === 'correct' && latamVoseo.match === 'regional-alternative',
    );
    check(
      'wrong-profile vos answer is flagged for es-ES',
      gradeDialectAnswer(baseline.unit, 'es-ES', 'Vos vivís acá.').outcome === 'dialect-mismatch',
    );
    check(
      'unrelated answer is incorrect',
      gradeDialectAnswer(baseline.unit, 'es-ES', 'Yo vivo aquí.').outcome === 'incorrect',
    );
  }

  {
    const data = clone(base);
    delete data.unit.renderings['es-ES'];
    check('missing required profile fails schema', hasCode(writePackage('missing-profile', data), 'UNIT_SCHEMA'));
  }
  {
    const data = clone(base);
    data.unit.meaning.id = 'meaning.en.changed-after-promotion';
    const paths = writePackage('changed-meaning', data);
    check(
      'changed meaning id breaks retained identity',
      hasCode(paths, 'RECEIPT_MEANING_IDENTITY') && hasCode(paths, 'RECEIPT_CONTENT_DIGEST'),
    );
  }
  {
    const data = clone(base);
    data.identity.meaningId = 'meaning.en.forged-history';
    const paths = writePackage('forged-identity', data);
    check(
      'retained identity snapshot is exact and report-bound',
      hasCode(paths, 'IDENTITY_STABILITY') && hasCode(paths, 'REPORT_IDENTITY_DIGEST'),
    );
  }
  {
    const data = clone(base);
    data.unit.renderings['es-AR'].acceptedAnswers.push({ text: 'VIVÍS, ACÁ!', kind: 'equivalent' });
    check('normalized duplicate answer fails schema', hasCode(writePackage('duplicate-answer', data), 'UNIT_SCHEMA'));
  }
  {
    const data = clone(base);
    data.report.renderProof['es-AR'] = 'Stale rendering';
    const paths = writePackage('stale-report', data);
    check(
      'stale deterministic report blocks promotion',
      hasCode(paths, 'REPORT_RENDER_PROOF') && hasCode(paths, 'RECEIPT_REPORT_DIGEST'),
    );
  }
  {
    const data = clone(base);
    data.review.result = 'fail';
    data.review.lenses.dialectConsistency.result = 'fail';
    const paths = writePackage('failed-review', data);
    check(
      'failed adversarial review blocks promotion',
      hasCode(paths, 'REVIEW_RESULT') && hasCode(paths, 'RECEIPT_REVIEW_DIGEST'),
    );
  }
  {
    const data = clone(base);
    data.review.revocation = { status: 'revoked' };
    check('unknown review evidence cannot be stripped before hashing', hasCode(writePackage('extra-review-field', data), 'REVIEW_SCHEMA'));
  }
  {
    const data = clone(base);
    data.authority.acceptedRevision = 1;
    check('forged governed run receipt breaks authority binding', hasCode(writePackage('forged-authority', data), 'RECEIPT_AUTHORITY_LINK'));
  }
  {
    const data = clone(base);
    data.receipt.adversarialEvidence.push({
      reviewId: 'review.fake.v1',
      reviewDigest: `sha256:${'0'.repeat(64)}`,
    });
    check('unverified adversarial evidence blocks promotion', hasCode(writePackage('fake-review-evidence', data), 'RECEIPT_SCHEMA'));
  }
  {
    const data = clone(base);
    data.report.gradeProof[0].answer = 'SECRET STALE ANSWER';
    const paths = writePackage('stale-grade-proof', data);
    const denied = runCli([
      'render', '--profile', 'es-AR',
      '--unit', paths.unit,
      '--identity', paths.identity,
      '--authority', paths.authority,
      '--report', paths.report,
      '--review', paths.review,
      '--receipt', paths.receipt,
    ]);
    check(
      'stale grade denial does not leak proof answers',
      denied.exitCode === 1 && denied.output.gate === 'denied' &&
        !denied.raw.includes('SECRET STALE ANSWER') && !denied.raw.includes('Vos vivís acá'),
    );
  }
  {
    const paths = writePackage('missing-receipt', clone(base));
    paths.receipt = join(TMP, 'missing-receipt', 'absent.json');
    check('missing promotion receipt fails closed', hasCode(paths, 'RECEIPT_READ'));
    const denied = runCli([
      'render',
      '--profile',
      'es-AR',
      '--unit', paths.unit,
      '--identity', paths.identity,
      '--authority', paths.authority,
      '--report', paths.report,
      '--review', paths.review,
      '--receipt', paths.receipt,
    ]);
    check(
      'denied render withholds learner content and gives recovery',
      denied.exitCode === 1 && denied.output.gate === 'denied' &&
        typeof denied.output.nextAction === 'string' &&
        !denied.raw.includes('Vos vivís acá') && !denied.raw.includes('renderings'),
    );
  }

  console.log(`\n${passed} passed, ${failed} failed.`);
  rmSync(TMP, { recursive: true, force: true });
  process.exit(failed === 0 ? 0 : 1);
}

main();
