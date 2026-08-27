/**
 * Deterministic proof gate for one promoted dialect-aware semantic unit.
 *
 * Commands:
 *   npx tsx tooling/content/dialect-contract.ts check
 *   npx tsx tooling/content/dialect-contract.ts verify
 *   npx tsx tooling/content/dialect-contract.ts render --profile es-AR
 *   npx tsx tooling/content/dialect-contract.ts grade --profile es-AR --answer "Vos vivís acá."
 *
 * Rendering and grading fail closed unless the unit, independent review, and
 * promotion receipt all validate and bind to the same canonical content digest.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DIALECT_DETERMINISTIC_CHECKS,
  DIALECT_PROFILES,
  DialectAdversarialReview,
  DialectContentUnit,
  DialectDeterministicReport,
  DialectIdentitySnapshot,
  DialectProfile,
  DialectPromotionReceipt,
  GovernedPhaseRunAcceptance,
  type DialectContentUnit as DialectContentUnitT,
  type DialectProfile as DialectProfileT,
} from '@aidioma/lesson-schema';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolvePath(HERE, '..', '..');

export const DEFAULT_DIALECT_PATHS = {
  unit: resolvePath(REPO, 'content', 'units', 'a1', 'unit.a1.you-live-here.json'),
  identity: resolvePath(REPO, 'tooling', 'content', 'config', 'dialect-id-snapshot.json'),
  authority: resolvePath(REPO, 'content', 'promotions', 'authority.phase-002.json'),
  report: resolvePath(REPO, 'content', 'review', 'qa', 'report.unit-a1-you-live-here.deterministic.json'),
  review: resolvePath(REPO, 'content', 'review', 'qa', 'review.unit-a1-you-live-here.adversarial.json'),
  receipt: resolvePath(REPO, 'content', 'promotions', 'promotion.unit-a1-you-live-here.v1.json'),
};

export interface DialectPackagePaths {
  unit: string;
  identity: string;
  authority: string;
  report: string;
  review: string;
  receipt: string;
}

export interface DialectVerificationFinding {
  code: string;
  message: string;
}

export interface DialectVerification {
  ok: boolean;
  unit?: DialectContentUnitT;
  contentDigest?: string;
  findings: DialectVerificationFinding[];
  evidence: {
    deterministicChecks: string[];
    adversarialReviewIds: string[];
    promotionReceiptId: string | null;
  };
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function dialectContentDigest(value: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}

export type DialectGrade =
  | { outcome: 'correct'; match: 'canonical' | 'equivalent' | 'regional-alternative' }
  | { outcome: 'dialect-mismatch'; expected: string; matchedProfiles: DialectProfileT[] }
  | { outcome: 'incorrect'; expected: string };

function normalizeDialectAnswer(value: string): string {
  return value
    .normalize('NFC')
    .toLocaleLowerCase('es')
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Developer-tool rendering; callers reach it only after verifyDialectPackage succeeds. */
export function renderDialectContentUnit(unit: DialectContentUnitT, profile: DialectProfileT) {
  const rendering = unit.renderings[profile];
  return {
    unitId: unit.id,
    contentVersion: unit.contentVersion,
    meaningId: unit.meaning.id,
    conceptIds: unit.concepts.map((concept) => concept.id),
    cefr: unit.cefr,
    profile,
    source: unit.meaning.source.text,
    sourceContext: unit.meaning.context,
    targetLanguage: unit.targetLanguage,
    text: rendering.text,
    register: rendering.register,
    note: rendering.note ?? null,
  };
}

/** Developer-tool grading; production code does not import tooling modules. */
export function gradeDialectAnswer(
  unit: DialectContentUnitT,
  profile: DialectProfileT,
  answer: string,
): DialectGrade {
  const normalized = normalizeDialectAnswer(answer);
  const active = unit.renderings[profile];
  if (normalized === normalizeDialectAnswer(active.text)) {
    return { outcome: 'correct', match: 'canonical' };
  }
  const accepted = active.acceptedAnswers.find(
    (candidate) => normalizeDialectAnswer(candidate.text) === normalized,
  );
  if (accepted) return { outcome: 'correct', match: accepted.kind };
  const matchedProfiles = DIALECT_PROFILES.filter((candidateProfile) => {
    if (candidateProfile === profile) return false;
    const candidate = unit.renderings[candidateProfile];
    return normalizeDialectAnswer(candidate.text) === normalized || candidate.acceptedAnswers.some(
      (entry) => normalizeDialectAnswer(entry.text) === normalized,
    );
  });
  if (matchedProfiles.length > 0) {
    return { outcome: 'dialect-mismatch', expected: active.text, matchedProfiles };
  }
  return { outcome: 'incorrect', expected: active.text };
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function sameOrderedValues(actual: readonly string[], expected: readonly string[]): boolean {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

export function verifyDialectPackage(paths: DialectPackagePaths = DEFAULT_DIALECT_PATHS): DialectVerification {
  const findings: DialectVerificationFinding[] = [];
  const fail = (code: string, message: string) => findings.push({ code, message });
  let rawUnit: unknown;
  let rawIdentity: unknown;
  let rawAuthority: unknown;
  let rawReport: unknown;
  let rawReview: unknown;
  let rawReceipt: unknown;

  try {
    rawUnit = readJson(paths.unit);
  } catch (error) {
    fail('UNIT_READ', `Could not read the content unit: ${(error as Error).message}`);
  }
  try {
    rawIdentity = readJson(paths.identity);
  } catch (error) {
    fail('IDENTITY_READ', `Could not read the dialect identity snapshot: ${(error as Error).message}`);
  }
  try {
    rawAuthority = readJson(paths.authority);
  } catch (error) {
    fail('AUTHORITY_READ', `Could not read governed run acceptance: ${(error as Error).message}`);
  }
  try {
    rawReport = readJson(paths.report);
  } catch (error) {
    fail('REPORT_READ', `Could not read the deterministic report: ${(error as Error).message}`);
  }
  try {
    rawReview = readJson(paths.review);
  } catch (error) {
    fail('REVIEW_READ', `Could not read the adversarial review: ${(error as Error).message}`);
  }
  try {
    rawReceipt = readJson(paths.receipt);
  } catch (error) {
    fail('RECEIPT_READ', `Could not read the promotion receipt: ${(error as Error).message}`);
  }

  const parsedUnit = DialectContentUnit.safeParse(rawUnit);
  if (!parsedUnit.success) {
    for (const issue of parsedUnit.error.issues) {
      fail('UNIT_SCHEMA', `${issue.path.join('.') || '(root)'}: ${issue.message}`);
    }
  }
  const parsedReview = DialectAdversarialReview.safeParse(rawReview);
  if (!parsedReview.success) {
    for (const issue of parsedReview.error.issues) {
      fail('REVIEW_SCHEMA', `${issue.path.join('.') || '(root)'}: ${issue.message}`);
    }
  }
  const parsedAuthority = GovernedPhaseRunAcceptance.safeParse(rawAuthority);
  if (!parsedAuthority.success) {
    for (const issue of parsedAuthority.error.issues) {
      fail('AUTHORITY_SCHEMA', `${issue.path.join('.') || '(root)'}: ${issue.message}`);
    }
  }
  const parsedIdentity = DialectIdentitySnapshot.safeParse(rawIdentity);
  if (!parsedIdentity.success) {
    for (const issue of parsedIdentity.error.issues) {
      fail('IDENTITY_SCHEMA', `${issue.path.join('.') || '(root)'}: ${issue.message}`);
    }
  }
  const parsedReport = DialectDeterministicReport.safeParse(rawReport);
  if (!parsedReport.success) {
    for (const issue of parsedReport.error.issues) {
      fail('REPORT_SCHEMA', `${issue.path.join('.') || '(root)'}: ${issue.message}`);
    }
  }
  const parsedReceipt = DialectPromotionReceipt.safeParse(rawReceipt);
  if (!parsedReceipt.success) {
    for (const issue of parsedReceipt.error.issues) {
      fail('RECEIPT_SCHEMA', `${issue.path.join('.') || '(root)'}: ${issue.message}`);
    }
  }

  const unit = parsedUnit.success ? parsedUnit.data : undefined;
  const identity = parsedIdentity.success ? parsedIdentity.data : undefined;
  const authority = parsedAuthority.success ? parsedAuthority.data : undefined;
  const report = parsedReport.success ? parsedReport.data : undefined;
  const review = parsedReview.success ? parsedReview.data : undefined;
  const receipt = parsedReceipt.success ? parsedReceipt.data : undefined;
  const contentDigest = unit && rawUnit !== undefined ? dialectContentDigest(rawUnit) : undefined;

  if (unit && identity) {
    if (identity.unitId !== unit.id || identity.meaningId !== unit.meaning.id ||
        !sameOrderedValues(identity.conceptIds, unit.concepts.map((concept) => concept.id)) ||
        identity.firstContentVersion > unit.contentVersion) {
      fail('IDENTITY_STABILITY', 'Unit, meaning, or concept identity diverges from retained history.');
    }
  }

  if (unit && receipt) {
    if (receipt.unitId !== unit.id || receipt.contentVersion !== unit.contentVersion) {
      fail('RECEIPT_UNIT_IDENTITY', 'Promotion receipt does not match the unit id and content version.');
    }
    if (receipt.meaningId !== unit.meaning.id) {
      fail('RECEIPT_MEANING_IDENTITY', 'Promotion receipt does not retain the unit meaning id.');
    }
    if (!sameOrderedValues(receipt.conceptIds, unit.concepts.map((concept) => concept.id))) {
      fail('RECEIPT_CONCEPT_IDENTITY', 'Promotion receipt does not retain the ordered concept ids.');
    }
    if (!sameOrderedValues(receipt.requiredProfiles, DIALECT_PROFILES)) {
      fail('RECEIPT_DIALECT_COVERAGE', 'Promotion receipt does not require all MVP dialect profiles.');
    }
    if (receipt.contentDigest !== contentDigest) {
      fail('RECEIPT_CONTENT_DIGEST', 'Promotion receipt digest does not match canonical unit content.');
    }
  }

  if (unit && report) {
    if (report.unitId !== unit.id || report.contentVersion !== unit.contentVersion) {
      fail('REPORT_UNIT_IDENTITY', 'Deterministic report does not match the unit id and content version.');
    }
    if (report.contentDigest !== contentDigest) {
      fail('REPORT_CONTENT_DIGEST', 'Deterministic report digest does not match canonical unit content.');
    }
    if (rawIdentity !== undefined && report.identitySnapshotDigest !== dialectContentDigest(rawIdentity)) {
      fail('REPORT_IDENTITY_DIGEST', 'Deterministic report does not bind the retained identity snapshot.');
    }
    if (new Set(DIALECT_PROFILES.map((profile) => normalizeDialectAnswer(unit.renderings[profile].text))).size === 1) {
      fail('UNIT_DIALECT_DIFFERENCE', 'The Phase 2 proof unit must exercise at least one regional rendering difference.');
    }
    if (!sameOrderedValues(report.checks.map((check) => check.id), DIALECT_DETERMINISTIC_CHECKS)) {
      fail('REPORT_DETERMINISTIC_CHECKS', 'Deterministic report is missing or reordering required checks.');
    }
    for (const profile of DIALECT_PROFILES) {
      const rendered = renderDialectContentUnit(unit, profile);
      if (report.renderProof[profile] !== rendered.text) {
        fail('REPORT_RENDER_PROOF', `Retained render proof does not match ${profile}.`);
      }
      const canonicalCase = report.gradeProof.find(
        (proof) => proof.profile === profile && proof.answer === unit.renderings[profile].text,
      );
      if (!canonicalCase || canonicalCase.expectedOutcome !== 'correct' || canonicalCase.expectedMatch !== 'canonical') {
        fail('REPORT_CANONICAL_GRADE_PROOF', `Retained grade proof lacks the canonical ${profile} answer.`);
      }
      for (const accepted of unit.renderings[profile].acceptedAnswers) {
        if (!report.gradeProof.some(
          (proof) => proof.profile === profile && proof.answer === accepted.text &&
            proof.expectedOutcome === 'correct' && proof.expectedMatch === accepted.kind,
        )) {
          fail('REPORT_ACCEPTED_GRADE_PROOF', `Retained grade proof lacks one accepted ${profile} alternative.`);
        }
      }
      if (!report.gradeProof.some((proof) => proof.profile === profile && proof.expectedOutcome === 'incorrect')) {
        fail('REPORT_INCORRECT_GRADE_PROOF', `Retained grade proof lacks an incorrect ${profile} case.`);
      }
    }
    for (const [proofIndex, proof] of report.gradeProof.entries()) {
      const actual = gradeDialectAnswer(unit, proof.profile, proof.answer);
      if (actual.outcome !== proof.expectedOutcome ||
          (proof.expectedMatch !== undefined &&
            (actual.outcome !== 'correct' || actual.match !== proof.expectedMatch))) {
        fail('REPORT_GRADE_PROOF', `Retained grade proof case ${proofIndex + 1} is stale for ${proof.profile}.`);
      }
    }
  }

  if (unit && review) {
    if (review.unitId !== unit.id || review.contentVersion !== unit.contentVersion) {
      fail('REVIEW_UNIT_IDENTITY', 'Adversarial review does not match the unit id and content version.');
    }
    if (review.contentDigest !== contentDigest) {
      fail('REVIEW_CONTENT_DIGEST', 'Adversarial review digest does not match canonical unit content.');
    }
    if (review.result !== 'pass' || Object.values(review.lenses).some((lens) => lens.result !== 'pass')) {
      fail('REVIEW_RESULT', 'Every adversarial lens must pass before promotion.');
    }
    if (review.findings.some((finding) => finding.severity === 'critical' || finding.severity === 'major')) {
      fail('REVIEW_BLOCKING_FINDING', 'Critical or major adversarial findings block promotion.');
    }
  }

  if (review && receipt) {
    const reviewEvidence = receipt.adversarialEvidence.find((entry) => entry.reviewId === review.reviewId);
    if (!reviewEvidence) {
      fail('RECEIPT_REVIEW_LINK', 'Promotion receipt does not retain the supplied adversarial review id.');
    } else if (rawReview !== undefined && reviewEvidence.reviewDigest !== dialectContentDigest(rawReview)) {
      fail('RECEIPT_REVIEW_DIGEST', 'Promotion receipt does not match the retained adversarial review.');
    }
    if (new Date(review.reviewedAt) > new Date(receipt.promotedAt)) {
      fail('REVIEW_AFTER_PROMOTION', 'Adversarial review must finish before promotion.');
    }
  }

  if (report && review && new Date(report.checkedAt) > new Date(review.reviewedAt)) {
    fail('REVIEW_BEFORE_CHECK', 'Independent review must follow deterministic validation.');
  }

  if (report && receipt) {
    if (receipt.deterministicEvidence.reportId !== report.reportId) {
      fail('RECEIPT_REPORT_LINK', 'Promotion receipt does not retain the deterministic report id.');
    }
    if (rawReport !== undefined && receipt.deterministicEvidence.reportDigest !== dialectContentDigest(rawReport)) {
      fail('RECEIPT_REPORT_DIGEST', 'Promotion receipt does not match the retained deterministic report.');
    }
    if (new Date(report.checkedAt) > new Date(receipt.promotedAt)) {
      fail('CHECK_AFTER_PROMOTION', 'Deterministic checks must finish before promotion.');
    }
  }

  if (authority) {
    try {
      const phasePath = resolvePath(REPO, authority.approvalEvidence.path);
      const phase = readFileSync(phasePath, 'utf8');
      const phaseId = /^id:\s*(PHASE-\d{3})$/m.exec(phase)?.[1];
      const phaseState = /^state:\s*([a-z]+)$/m.exec(phase)?.[1];
      if (phaseId !== authority.phaseId || phaseState !== authority.approvalEvidence.state) {
        fail('PROMOTION_AUTHORITY', 'Phase approval does not match the canonical closed phase file.');
      }
    } catch (error) {
      fail('PROMOTION_AUTHORITY_READ', `Could not verify canonical phase approval: ${(error as Error).message}`);
    }
  }

  if (authority && receipt) {
    if (receipt.authority.acceptanceId !== authority.authorityId ||
        rawAuthority === undefined || receipt.authority.acceptanceDigest !== dialectContentDigest(rawAuthority)) {
      fail('RECEIPT_AUTHORITY_LINK', 'Promotion receipt does not bind the exact governed run acceptance.');
    }
  }

  return {
    ok: findings.length === 0,
    unit,
    contentDigest,
    findings,
    evidence: {
      deterministicChecks: report?.checks.map((check) => check.id) ?? [],
      adversarialReviewIds: receipt?.adversarialEvidence.map((entry) => entry.reviewId) ?? [],
      promotionReceiptId: receipt?.receiptId ?? null,
    },
  };
}

/** Validate only the unit + retained deterministic report, before promotion exists. */
export function verifyDialectDeterministic(paths: DialectPackagePaths = DEFAULT_DIALECT_PATHS): DialectVerification {
  const verification = verifyDialectPackage(paths);
  const findings = verification.findings.filter(
    (finding) => finding.code.startsWith('UNIT_') || finding.code.startsWith('IDENTITY_') ||
      finding.code.startsWith('REPORT_'),
  );
  return {
    ...verification,
    ok: findings.length === 0,
    findings,
    evidence: {
      deterministicChecks: verification.evidence.deterministicChecks,
      adversarialReviewIds: [],
      promotionReceiptId: null,
    },
  };
}

interface CliOptions {
  command: 'check' | 'verify' | 'render' | 'grade';
  paths: DialectPackagePaths;
  profile?: string;
  answer?: string;
}

function parseCli(argv: string[]): CliOptions {
  const first = argv[0];
  const command = first === 'check' || first === 'render' || first === 'grade' || first === 'verify' ? first : 'verify';
  const offset = first === command ? 1 : 0;
  const options: CliOptions = { command, paths: { ...DEFAULT_DIALECT_PATHS } };
  for (let index = offset; index < argv.length; index++) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (flag === '--unit' && value) options.paths.unit = resolvePath(value), index++;
    else if (flag === '--identity' && value) options.paths.identity = resolvePath(value), index++;
    else if (flag === '--authority' && value) options.paths.authority = resolvePath(value), index++;
    else if (flag === '--report' && value) options.paths.report = resolvePath(value), index++;
    else if (flag === '--review' && value) options.paths.review = resolvePath(value), index++;
    else if (flag === '--receipt' && value) options.paths.receipt = resolvePath(value), index++;
    else if (flag === '--profile' && value) options.profile = value, index++;
    else if (flag === '--answer' && value !== undefined) options.answer = value, index++;
    else throw new Error(`Unknown or incomplete argument: ${flag}`);
  }
  return options;
}

function runCli() {
  let options: CliOptions;
  try {
    options = parseCli(process.argv.slice(2));
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: (error as Error).message }, null, 2));
    process.exit(2);
    return;
  }

  const verification = options.command === 'check'
    ? verifyDialectDeterministic(options.paths)
    : verifyDialectPackage(options.paths);
  if (!verification.ok || !verification.unit) {
    console.log(JSON.stringify({
      ...verification,
      unit: undefined,
      gate: 'denied',
      nextAction: options.command === 'check'
        ? verification.findings.some((finding) => finding.code.startsWith('IDENTITY_'))
          ? 'Repair or restore the retained identity snapshot, then rerun check.'
          : 'Repair the unit or deterministic report, then rerun check.'
        : 'Repair or restore the retained evidence chain, then rerun verify.',
    }, null, 2));
    process.exit(1);
    return;
  }
  if (options.command === 'check' || options.command === 'verify') {
    console.log(JSON.stringify({ ...verification, unit: undefined }, null, 2));
    return;
  }

  const parsedProfile = DialectProfile.safeParse(options.profile);
  if (!parsedProfile.success) {
    console.error(JSON.stringify({ ok: false, error: 'Provide --profile es-AR, es-419, or es-ES.' }, null, 2));
    process.exit(2);
    return;
  }
  if (options.command === 'render') {
    console.log(JSON.stringify({
      ok: true,
      promotion: {
        status: 'promoted',
        receiptId: verification.evidence.promotionReceiptId,
      },
      rendered: renderDialectContentUnit(verification.unit, parsedProfile.data),
    }, null, 2));
    return;
  }
  if (options.answer === undefined) {
    console.error(JSON.stringify({ ok: false, error: 'Provide --answer for grading.' }, null, 2));
    process.exit(2);
    return;
  }
  console.log(JSON.stringify({
    ok: true,
    promotion: {
      status: 'promoted',
      receiptId: verification.evidence.promotionReceiptId,
    },
    profile: parsedProfile.data,
    answer: options.answer,
    grade: gradeDialectAnswer(verification.unit, parsedProfile.data, options.answer),
  }, null, 2));
}

if (fileURLToPath(import.meta.url) === resolvePath(process.argv[1] ?? '')) runCli();
