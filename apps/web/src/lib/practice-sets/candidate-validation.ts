import { acceptedText } from "@aidioma/lesson-schema";

import {
  CandidateRunEnvelopeSchema,
  CollectionBriefSchema,
  HumanReviewManifestSchema,
  IndependentCriticArtifactSchema,
  PromotionReviewSidecarSchema,
  PRACTICE_EVALUATION_INPUT_MAX_CHARACTERS,
  contentHash,
  normalizeCandidateText,
  type CandidatePracticePrompt,
  type CandidateRunEnvelope,
  type CollectionBrief,
  type HumanReviewManifest,
  type IndependentCriticArtifact,
  type PromotionReviewSidecar,
} from "./candidate-generation";
import {
  PracticePromptSchema,
  type PracticePrompt,
  type PracticePromptFocus,
} from "./practice-prompt-contract";
import {
  PromotedPrototypePromptsSchema,
  promotionContentHash,
  type PromotedPrototypePrompts,
} from "./promoted-practice-prompts";

export type CandidateFindingSeverity = "error" | "warning";

export type CandidateFinding = {
  code: string;
  key: string;
  severity: CandidateFindingSeverity;
  message: string;
  itemId?: string;
  relatedItemId?: string;
};

export type CandidateValidationReport = {
  candidateHash: string;
  counts: {
    candidates: number;
    errors: number;
    warnings: number;
  };
  findings: CandidateFinding[];
};

export type ValidateCandidateRunOptions = {
  brief: CollectionBrief;
  run: CandidateRunEnvelope;
  collectionPrompts: readonly PracticePrompt[];
  globalPrompts: readonly PracticePrompt[];
};

function normalize(value: string): string {
  return normalizeCandidateText(value);
}

function findingKey(code: string, itemId?: string, relatedItemId?: string) {
  return [code, itemId, relatedItemId].filter(Boolean).join(":");
}

function finding(
  severity: CandidateFindingSeverity,
  code: string,
  message: string,
  itemId?: string,
  relatedItemId?: string,
): CandidateFinding {
  return {
    severity,
    code,
    key: findingKey(code, itemId, relatedItemId),
    message,
    ...(itemId && { itemId }),
    ...(relatedItemId && { relatedItemId }),
  };
}

function answerTexts(prompt: PracticePrompt, language: "english" | "spanish") {
  const group = prompt.answers[language];
  return [...group.target, ...group.communicative].map(acceptedText);
}

function repeatsCanonicalTarget(prompt: PracticePrompt, language: "english" | "spanish") {
  const canonical = language === "english" ? prompt.english : prompt.spanish;
  return prompt.answers[language].target.some(
    (entry) => normalize(acceptedText(entry)) === normalize(canonical),
  );
}

function duplicateAnswer(prompt: PracticePrompt, language: "english" | "spanish") {
  const seen = new Set<string>();
  for (const text of answerTexts(prompt, language)) {
    const normalized = normalize(text);
    if (seen.has(normalized)) return text;
    seen.add(normalized);
  }
  return undefined;
}

function wordBigrams(value: string): Set<string> {
  const words = normalize(value).split(" ").filter(Boolean);
  if (words.length < 2) return new Set(words);
  return new Set(words.slice(0, -1).map((word, index) => `${word} ${words[index + 1]}`));
}

function jaccard(left: Set<string>, right: Set<string>): number {
  if (left.size === 0 && right.size === 0) return 1;
  let intersection = 0;
  for (const value of left) if (right.has(value)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
}

function nearDuplicate(left: PracticePrompt, right: PracticePrompt) {
  return (
    jaccard(wordBigrams(left.english), wordBigrams(right.english)) >= 0.8 ||
    jaccard(wordBigrams(left.spanish), wordBigrams(right.spanish)) >= 0.8
  );
}

function exactPair(prompt: PracticePrompt) {
  return `${normalize(prompt.english)}\u0000${normalize(prompt.spanish)}`;
}

function countBy<T extends string | number>(values: readonly T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return counts;
}

function quotaFindings(
  brief: CollectionBrief,
  collection: readonly CandidatePracticePrompt[],
): CandidateFinding[] {
  const findings: CandidateFinding[] = [];
  const prompts = collection.map((candidate) => candidate.prompt);
  const levels = countBy(prompts.map((prompt) => prompt.level));
  for (const level of ["foundation", "intermediate"] as const) {
    const count = levels.get(level) ?? 0;
    const quota = brief.levelQuotas[level];
    if (count < quota.minimum || count > quota.maximum) {
      findings.push(
        finding(
          "error",
          "QUOTA_LEVEL",
          `${level} count ${count} is outside ${quota.minimum}-${quota.maximum}`,
          level,
        ),
      );
    }
  }

  const difficulties = countBy(prompts.map((prompt) => prompt.difficulty));
  for (const difficulty of [1, 2, 3, 4, 5] as const) {
    const count = difficulties.get(difficulty) ?? 0;
    const quota = brief.difficultyQuotas[String(difficulty) as "1" | "2" | "3" | "4" | "5"];
    if (count < quota.minimum || count > quota.maximum) {
      findings.push(
        finding(
          "error",
          "QUOTA_DIFFICULTY",
          `difficulty ${difficulty} count ${count} is outside ${quota.minimum}-${quota.maximum}`,
          String(difficulty),
        ),
      );
    }
  }

  const focusCounts = new Map<PracticePromptFocus, number>();
  prompts.forEach((prompt) =>
    prompt.focus.forEach((focus) => focusCounts.set(focus, (focusCounts.get(focus) ?? 0) + 1)),
  );
  for (const [focus, minimum] of Object.entries(brief.focusMinimums) as [PracticePromptFocus, number][]) {
    const count = focusCounts.get(focus) ?? 0;
    if (count < minimum) {
      findings.push(
        finding("error", "QUOTA_FOCUS", `${focus} count ${count} is below ${minimum}`, focus),
      );
    }
  }

  const coverageCounts = new Map<string, number>();
  collection.forEach((candidate) =>
    candidate.coverageKeys.forEach((key) =>
      coverageCounts.set(key, (coverageCounts.get(key) ?? 0) + 1),
    ),
  );
  for (const group of brief.coverageGroups) {
    const count = coverageCounts.get(group.key) ?? 0;
    if (count < group.minimum) {
      findings.push(
        finding(
          "error",
          "QUOTA_COVERAGE",
          `${group.key} count ${count} is below ${group.minimum}`,
          group.key,
        ),
      );
    }
  }
  return findings;
}

export function candidateRunContentHash(run: CandidateRunEnvelope): string {
  return contentHash(CandidateRunEnvelopeSchema.parse(run));
}

export function validateCandidateRun(options: ValidateCandidateRunOptions): CandidateValidationReport {
  const brief = CollectionBriefSchema.parse(options.brief);
  const run = CandidateRunEnvelopeSchema.parse(options.run);
  const collectionPrompts = options.collectionPrompts.map((prompt) => PracticePromptSchema.parse(prompt));
  const globalPrompts = options.globalPrompts.map((prompt) => PracticePromptSchema.parse(prompt));
  const findings: CandidateFinding[] = [];
  const candidateIds = new Set<string>();
  const globalIds = new Set(globalPrompts.map((prompt) => prompt.id));
  const allowedCoverage = new Set(brief.coverageGroups.map((group) => group.key));
  const allowedFocus = new Set(brief.allowedFocus);
  const allowedGrammarTags = new Set(brief.allowedGrammarTags);

  if (run.status !== "complete") {
    findings.push(finding("error", "RUN_INCOMPLETE", "candidate run is incomplete"));
  }
  if (run.briefHash !== contentHash(brief) || run.brief.briefId !== brief.briefId) {
    findings.push(finding("error", "BRIEF_MISMATCH", "candidate run does not match the brief"));
  }
  if (
    run.collectionInputHash !== contentHash(collectionPrompts) ||
    run.globalInputHash !== contentHash(globalPrompts)
  ) {
    findings.push(
      finding("error", "INPUT_MISMATCH", "candidate run does not match the current prompt inventory"),
    );
  }
  if (collectionPrompts.length + run.candidates.length !== brief.targetTotal) {
    findings.push(
      finding(
        "error",
        "COUNT_TARGET",
        `combined prompt count must equal ${brief.targetTotal}`,
      ),
    );
  }
  if (
    run.candidates.length > 0 &&
    !run.candidates.some((candidate) =>
      candidate.prompt.answers.english.target.length > 0 ||
      candidate.prompt.answers.spanish.target.length > 0,
    )
  ) {
    findings.push(
      finding(
        "warning",
        "TARGET_ALTERNATES_SYSTEMICALLY_EMPTY",
        "generated run has no noncanonical target alternates and requires human review",
      ),
    );
  }

  for (const candidate of run.candidates) {
    const prompt = candidate.prompt;
    if (!prompt.id.startsWith(`${brief.promptIdPrefix}-`)) {
      findings.push(
        finding("error", "ID_PREFIX", `id must start with ${brief.promptIdPrefix}-`, prompt.id),
      );
    }
    if (candidateIds.has(prompt.id) || globalIds.has(prompt.id)) {
      findings.push(finding("error", "ID_DUPLICATE", "prompt id is not globally unique", prompt.id));
    }
    candidateIds.add(prompt.id);
    candidate.coverageKeys.forEach((key) => {
      if (!allowedCoverage.has(key)) {
        findings.push(
          finding("error", "COVERAGE_UNKNOWN", `unknown coverage key ${key}`, prompt.id),
        );
      }
    });
    prompt.focus.forEach((focus) => {
      if (!allowedFocus.has(focus)) {
        findings.push(
          finding("error", "FOCUS_NOT_ALLOWED", `focus ${focus} is outside the brief`, prompt.id),
        );
      }
    });
    prompt.grammarTags.forEach((tag) => {
      if (
        !allowedGrammarTags.has(tag) ||
        !brief.allowedGrammarTagsByLevel[prompt.level].includes(tag)
      ) {
        findings.push(
          finding(
            "error",
            "GRAMMAR_TAG_NOT_ALLOWED",
            `grammar tag ${tag} is outside the brief`,
            prompt.id,
          ),
        );
      }
    });
    for (const language of ["english", "spanish"] as const) {
      if (repeatsCanonicalTarget(prompt, language)) {
        findings.push(
          finding(
            "error",
            "ANSWER_CANONICAL_DUPLICATED",
            `${language} canonical text must not be repeated in target answers`,
            prompt.id,
          ),
        );
      }
      const duplicate = duplicateAnswer(prompt, language);
      if (duplicate !== undefined) {
        findings.push(
          finding(
            "error",
            "ANSWER_DUPLICATE",
            `${language} answer is duplicated after normalization: ${duplicate}`,
            prompt.id,
          ),
        );
      }
      const evaluationTexts = [
        language === "english" ? prompt.english : prompt.spanish,
        ...prompt.answers[language].target.map(acceptedText),
      ];
      if (
        prompt.answers[language].target.length > 10 ||
        evaluationTexts.reduce((total, value) => total + value.length, 0) >
          PRACTICE_EVALUATION_INPUT_MAX_CHARACTERS
      ) {
        findings.push(
          finding(
            "error",
            "EVALUATION_INPUT_BUDGET",
            `${language} canonical and target answers exceed the evaluation input budget`,
            prompt.id,
          ),
        );
      }
    }
    if (normalize(prompt.english) === normalize(prompt.spanish)) {
      findings.push(
        finding("error", "BILINGUAL_IDENTICAL", "English and Spanish cannot be identical", prompt.id),
      );
    }

    const spanishText = [prompt.spanish, ...answerTexts(prompt, "spanish")].join(" ");
    for (const term of brief.bannedSpanishTerms) {
      const normalizedTerm = normalize(term);
      const paddedText = ` ${normalize(spanishText)} `;
      if (normalizedTerm && paddedText.includes(` ${normalizedTerm} `)) {
        findings.push(
          finding(
            "error",
            "SPANISH_TERM_BANNED",
            `neutral Latin American Spanish excludes “${term}”`,
            prompt.id,
          ),
        );
      }
    }
  }

  const candidatesWithCoverage: CandidatePracticePrompt[] = [
    ...collectionPrompts.map((prompt) => ({ coverageKeys: [], prompt })),
    ...run.candidates,
  ];
  findings.push(...quotaFindings(brief, candidatesWithCoverage));

  const all = [
    ...globalPrompts.map((prompt) => ({ prompt, candidate: false })),
    ...run.candidates.map((candidate) => ({ prompt: candidate.prompt, candidate: true })),
  ];
  for (let leftIndex = 0; leftIndex < all.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < all.length; rightIndex += 1) {
      const left = all[leftIndex];
      const right = all[rightIndex];
      if (!left.candidate && !right.candidate) continue;
      if (left.prompt.id === right.prompt.id) continue;
      const [firstId, secondId] = [left.prompt.id, right.prompt.id].sort();
      if (exactPair(left.prompt) === exactPair(right.prompt)) {
        findings.push(
          finding(
            "error",
            "CONTENT_DUPLICATE_EXACT",
            "canonical bilingual pair duplicates another prompt",
            firstId,
            secondId,
          ),
        );
      } else if (nearDuplicate(left.prompt, right.prompt)) {
        findings.push(
          finding(
            "warning",
            "CONTENT_DUPLICATE_NEAR",
            "canonical text is near another prompt and requires human review",
            firstId,
            secondId,
          ),
        );
      }
    }
  }

  const unique = new Map<string, CandidateFinding>();
  findings.forEach((entry) => unique.set(entry.key, entry));
  const sorted = [...unique.values()].sort((left, right) =>
    [left.severity, left.code, left.itemId ?? "", left.relatedItemId ?? ""].join("\u0000").localeCompare(
      [right.severity, right.code, right.itemId ?? "", right.relatedItemId ?? ""].join("\u0000"),
    ),
  );
  return {
    candidateHash: candidateRunContentHash(run),
    counts: {
      candidates: run.candidates.length,
      errors: sorted.filter((entry) => entry.severity === "error").length,
      warnings: sorted.filter((entry) => entry.severity === "warning").length,
    },
    findings: sorted,
  };
}

export class CandidatePromotionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CandidatePromotionError";
  }
}

function canonicalModelIdentity(value: string): string {
  return value.trim().toLocaleLowerCase("en-US");
}

export function verifyPromotionPair(promotedValue: unknown, sidecarValue: unknown) {
  const promoted = PromotedPrototypePromptsSchema.parse(promotedValue);
  const sidecar = PromotionReviewSidecarSchema.parse(sidecarValue);
  if (
    promoted.state !== "promoted" ||
    promoted.collectionId !== sidecar.collectionId ||
    promoted.sourceRunId !== sidecar.sourceRunId ||
    promoted.sourceCandidateHash !== sidecar.sourceCandidateHash ||
    promoted.reviewedContentHash !== sidecar.reviewedContentHash ||
    sidecar.critic.candidateHash !== sidecar.sourceCandidateHash ||
    sidecar.critic.reviewedContentHash !== sidecar.reviewedContentHash ||
    sidecar.review.candidateHash !== sidecar.sourceCandidateHash ||
    promoted.promotedContentHash !== sidecar.promotedContentHash ||
    promoted.promotedContentHash !== promotionContentHash(promoted)
  ) {
    throw new CandidatePromotionError("promoted content and review sidecar are not bound");
  }
  return { promoted, sidecar };
}

export function promoteCandidateRun(options: ValidateCandidateRunOptions & {
  review: HumanReviewManifest;
  critic: IndependentCriticArtifact;
  acknowledgePrototypeOnly: boolean;
}): { promoted: PromotedPrototypePrompts; sidecar: PromotionReviewSidecar } {
  if (!options.acknowledgePrototypeOnly) {
    throw new CandidatePromotionError("explicit prototype-only acknowledgement is required");
  }
  const review = HumanReviewManifestSchema.parse(options.review);
  const sourceCandidateHash = candidateRunContentHash(options.run);
  if (review.candidateHash !== sourceCandidateHash) {
    throw new CandidatePromotionError("review candidateHash does not match the candidate run");
  }
  const decisions = new Map(review.decisions.map((decision) => [decision.candidateId, decision]));
  if (decisions.size !== options.run.candidates.length) {
    throw new CandidatePromotionError("review must contain exactly one decision for every candidate");
  }
  for (const candidate of options.run.candidates) {
    if (!decisions.has(candidate.prompt.id)) {
      throw new CandidatePromotionError(`candidate ${candidate.prompt.id} has no review decision`);
    }
  }
  for (const id of decisions.keys()) {
    if (!options.run.candidates.some((candidate) => candidate.prompt.id === id)) {
      throw new CandidatePromotionError(`review contains unknown candidate ${id}`);
    }
  }
  const reviewedCandidates = options.run.candidates.flatMap((candidate) => {
    const decision = decisions.get(candidate.prompt.id);
    if (!decision || decision.decision === "reject") return [];
    const selected = decision.decision === "edit" ? decision.editedPrompt : candidate.prompt;
    if (!selected || selected.id !== candidate.prompt.id) {
      throw new CandidatePromotionError(`edited prompt id must remain ${candidate.prompt.id}`);
    }
    return [{ coverageKeys: decision.reviewedCoverageKeys, prompt: selected }];
  });

  if (reviewedCandidates.length !== options.run.candidates.length) {
    throw new CandidatePromotionError("prototype promotion cannot contain rejected candidates");
  }

  const reviewedRun = CandidateRunEnvelopeSchema.parse({
    ...options.run,
    candidates: reviewedCandidates,
  });
  const report = validateCandidateRun({ ...options, run: reviewedRun });
  if (report.counts.errors > 0) {
    throw new CandidatePromotionError("reviewed candidate validation has errors");
  }
  const acknowledgedWarnings = new Set(review.acknowledgedWarnings);
  for (const warning of report.findings.filter((entry) => entry.severity === "warning")) {
    if (!acknowledgedWarnings.has(warning.key)) {
      throw new CandidatePromotionError(`warning ${warning.key} is not acknowledged`);
    }
  }

  const reviewedContentHash = contentHash(reviewedCandidates);
  const critic = IndependentCriticArtifactSchema.parse(options.critic);
  if (
    critic.candidateHash !== sourceCandidateHash ||
    critic.reviewedContentHash !== reviewedContentHash
  ) {
    throw new CandidatePromotionError("critic hashes do not match raw and reviewed content");
  }
  if (canonicalModelIdentity(critic.model) === canonicalModelIdentity(options.run.model)) {
    throw new CandidatePromotionError("critic model must differ from the generator model");
  }
  if (critic.reviewer.toLocaleLowerCase() === review.reviewer.toLocaleLowerCase()) {
    throw new CandidatePromotionError("critic reviewer must differ from the human reviewer");
  }
  if (
    critic.verdict !== "pass" ||
    critic.findings.some((entry) => entry.severity === "major" || entry.severity === "critical")
  ) {
    throw new CandidatePromotionError("critic must pass without major or critical findings");
  }

  const prompts = reviewedCandidates.map((candidate) =>
    PracticePromptSchema.parse(candidate.prompt),
  );

  if (options.collectionPrompts.length + prompts.length !== options.brief.targetTotal) {
    throw new CandidatePromotionError(
      `promotion must produce exactly ${options.brief.targetTotal} combined prompts`,
    );
  }

  const promotedPayload = {
    schemaVersion: 1,
    state: "promoted",
    prototypeOnly: true,
    collectionId: options.brief.collectionId,
    sourceRunId: options.run.runId,
    sourceCandidateHash,
    reviewedContentHash,
    prompts,
  } as const;
  const promotedContentHash = promotionContentHash(promotedPayload);
  const promoted = PromotedPrototypePromptsSchema.parse({
    ...promotedPayload,
    promotedContentHash,
  });
  const sidecar = PromotionReviewSidecarSchema.parse({
    schemaVersion: 1,
    prototypeOnly: true,
    collectionId: options.brief.collectionId,
    sourceRunId: options.run.runId,
    sourceCandidateHash,
    reviewedContentHash,
    promotedContentHash,
    review,
    critic,
  });
  return verifyPromotionPair(promoted, sidecar);
}
