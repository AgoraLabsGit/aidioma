import { asSchema } from "ai";
import { describe, expect, it, vi } from "vitest";

import {
  CandidateCheckpointError,
  CandidateRunEnvelopeSchema,
  CollectionBriefSchema,
  ModelCandidatePracticePromptSchema,
  candidateBatchSchema,
  configuredPracticeGeneration,
  contentHash,
  currentPracticeGenerationContractHash,
  generateCandidateRun,
  transformModelCandidateBatch,
  type CandidatePracticePrompt,
  type CandidateRunEnvelope,
  type CollectionBrief,
  type HumanReviewManifest,
  type IndependentCriticArtifact,
} from "./candidate-generation";
import {
  CandidatePromotionError,
  candidateRunContentHash,
  promoteCandidateRun,
  validateCandidateRun,
  verifyPromotionPair,
} from "./candidate-validation";
import { PracticePromptSchema, type PracticePrompt } from "./practice-prompt-contract";

function prompt(
  id: string,
  english: string,
  spanish: string,
  overrides: Partial<PracticePrompt> = {},
): PracticePrompt {
  return {
    id,
    level: "intermediate",
    focus: ["time-phrases"],
    capability: "Use a restaurant phrase naturally",
    cue: "Respond to the restaurant situation.",
    english,
    spanish,
    answers: {
      english: { target: [], communicative: [] },
      spanish: { target: [], communicative: [] },
    },
    difficulty: 3,
    grammarTags: ["formula.courtesy"],
    ...overrides,
  };
}

const existing = prompt("restaurant-existing", "A table, please.", "Una mesa, por favor.", {
  level: "foundation",
  difficulty: 1,
});

function brief(overrides: Partial<CollectionBrief> = {}): CollectionBrief {
  return CollectionBriefSchema.parse({
    schemaVersion: 1,
    briefId: "restaurant-test-v1",
    collectionId: "intermediate-restaurant",
    promptIdPrefix: "restaurant",
    promptVersion: "v1",
    targetTotal: 3,
    batchSize: 2,
    allowedFocus: ["time-phrases"],
    allowedGrammarTags: ["formula.courtesy"],
    allowedGrammarTagsByLevel: {
      foundation: ["formula.courtesy"],
      intermediate: ["formula.courtesy"],
    },
    levelQuotas: {
      foundation: { minimum: 1, maximum: 1 },
      intermediate: { minimum: 2, maximum: 2 },
    },
    difficultyQuotas: {
      "1": { minimum: 1, maximum: 1 },
      "2": { minimum: 1, maximum: 1 },
      "3": { minimum: 1, maximum: 1 },
      "4": { minimum: 0, maximum: 0 },
      "5": { minimum: 0, maximum: 0 },
    },
    focusMinimums: { "time-phrases": 2 },
    coverageGroups: [
      { key: "ordering", label: "Ordering", minimum: 2, guidance: "Order two distinct items." },
    ],
    bannedSpanishTerms: ["vosotros", "vale"],
    registerGuidance: "Use neutral Latin American Spanish.",
    contentGuidance: ["Keep every unit distinct."],
    ...overrides,
  });
}

function candidates(): CandidatePracticePrompt[] {
  return [
    {
      coverageKeys: ["ordering"],
      prompt: prompt("restaurant-order-water", "I would like water.", "Quisiera agua.", {
        difficulty: 2,
      }),
    },
    {
      coverageKeys: ["ordering"],
      prompt: prompt("restaurant-order-soup", "Could I have the soup?", "¿Me trae la sopa?"),
    },
  ];
}

function additionalCandidates(): CandidatePracticePrompt[] {
  return [
    {
      coverageKeys: ["ordering"],
      prompt: prompt("restaurant-order-coffee", "A coffee, please.", "Un café, por favor."),
    },
    {
      coverageKeys: ["ordering"],
      prompt: prompt("restaurant-order-dessert", "Could I see the desserts?", "¿Me muestra los postres?"),
    },
  ];
}

function multiBatchBrief(): CollectionBrief {
  return brief({
    targetTotal: 5,
    levelQuotas: {
      foundation: { minimum: 1, maximum: 1 },
      intermediate: { minimum: 4, maximum: 4 },
    },
    difficultyQuotas: {
      "1": { minimum: 1, maximum: 1 },
      "2": { minimum: 1, maximum: 1 },
      "3": { minimum: 3, maximum: 3 },
      "4": { minimum: 0, maximum: 0 },
      "5": { minimum: 0, maximum: 0 },
    },
    focusMinimums: { "time-phrases": 4 },
    coverageGroups: [
      { key: "ordering", label: "Ordering", minimum: 4, guidance: "Order four distinct items." },
    ],
  });
}

function runEnvelope(
  selectedBrief = brief(),
  items = candidates(),
  status: "incomplete" | "complete" = "complete",
  batches = [{
    batchIndex: 0,
    candidateCount: items.length,
    requestedModel: "openai/gpt-5.6-terra",
  }],
): CandidateRunEnvelope {
  return CandidateRunEnvelopeSchema.parse({
    schemaVersion: 1,
    kind: "prototype-practice-candidates",
    status,
    prototypeOnly: true,
    runId: "run-test",
    generatedAt: "2026-08-03T12:00:00.000Z",
    brief: selectedBrief,
    briefHash: contentHash(selectedBrief),
    collectionInputHash: contentHash([existing]),
    globalInputHash: contentHash([existing]),
    generationContractHash: currentPracticeGenerationContractHash(),
    basePromptCount: 1,
    targetCandidateCount: selectedBrief.targetTotal - 1,
    promptVersion: selectedBrief.promptVersion,
    model: "openai/gpt-5.6-terra",
    batches,
    candidates: items,
  });
}

function reviewFor(run: CandidateRunEnvelope): HumanReviewManifest {
  return {
    schemaVersion: 1,
    prototypeOnly: true,
    candidateHash: candidateRunContentHash(run),
    reviewer: "Prototype operator",
    reviewedAt: "2026-08-03T13:00:00.000Z",
    acknowledgedWarnings: [],
    decisions: run.candidates.map((candidate) => ({
      candidateId: candidate.prompt.id,
      decision: "accept",
      reviewedCoverageKeys: candidate.coverageKeys,
    })),
  };
}

function criticFor(
  run: CandidateRunEnvelope,
  review = reviewFor(run),
  overrides: Partial<IndependentCriticArtifact> = {},
): IndependentCriticArtifact {
  const decisions = new Map(review.decisions.map((decision) => [decision.candidateId, decision]));
  const reviewed = run.candidates.flatMap((candidate) => {
    const decision = decisions.get(candidate.prompt.id);
    if (!decision || decision.decision === "reject") return [];
    return [{
      coverageKeys: decision.reviewedCoverageKeys,
      prompt: decision.decision === "edit" ? decision.editedPrompt! : candidate.prompt,
    }];
  });
  return {
    schemaVersion: 1,
    prototypeOnly: true,
    candidateHash: candidateRunContentHash(run),
    reviewedContentHash: contentHash(reviewed),
    model: "codex/gpt-5.6-sol",
    reviewer: "Independent critic",
    reviewedAt: "2026-08-03T14:00:00.000Z",
    verdict: "pass",
    findings: [],
    ...overrides,
  };
}

function expectEveryObjectPropertyRequired(value: unknown): void {
  if (Array.isArray(value)) return value.forEach(expectEveryObjectPropertyRequired);
  if (value === null || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  if (record.type === "object" && record.properties && typeof record.properties === "object") {
    const properties = Object.keys(record.properties as Record<string, unknown>).sort();
    expect([...((record.required as string[] | undefined) ?? [])].sort()).toEqual(properties);
  }
  Object.values(record).forEach(expectEveryObjectPropertyRequired);
}

describe("practice candidate generation", () => {
  it("runs a quota-aware schema-bound batch and checkpoints only semantically valid content", async () => {
    const generate = vi.fn().mockResolvedValue({ output: { candidates: candidates() } });
    const checkpoints: CandidateRunEnvelope[] = [];
    const run = await generateCandidateRun({
      brief: brief(),
      existingPrompts: [existing],
      globalPrompts: [existing],
      generate,
      model: "openai/gpt-5.6-terra",
      runId: "run-test",
      generatedAt: "2026-08-03T12:00:00.000Z",
      onCheckpoint: (checkpoint) => { checkpoints.push(checkpoint); },
    });
    expect(generate).toHaveBeenCalledOnce();
    expect(generate.mock.calls[0][0]).toMatchObject({ expectedCount: 2, batchIndex: 0 });
    expect(JSON.parse(generate.mock.calls[0][0].prompt)).toHaveProperty("remainingMinimumDeficits");
    expect(run).toMatchObject({ status: "complete", targetCandidateCount: 2 });
    expect(checkpoints.map((checkpoint) => checkpoint.status)).toEqual(["incomplete", "complete"]);
  });

  it("stops before another generator call when a batch is semantically invalid", async () => {
    const invalid = candidates().map((candidate) => ({
      ...candidate,
      prompt: { ...candidate.prompt, focus: ["spatial-language" as const] },
    }));
    const generate = vi.fn().mockResolvedValue({ output: { candidates: invalid } });
    await expect(generateCandidateRun({
      brief: multiBatchBrief(),
      existingPrompts: [existing],
      globalPrompts: [existing],
      generate,
      model: "openai/gpt-5.6-terra",
      runId: "run-test",
      generatedAt: "2026-08-03T12:00:00.000Z",
    })).rejects.toBeInstanceOf(CandidateCheckpointError);
    expect(generate).toHaveBeenCalledOnce();
  });

  it.each([
    ["ID_PREFIX", (items: CandidatePracticePrompt[]) => { items[0].prompt.id = "outside-id"; }],
    ["ID_DUPLICATE", (items: CandidatePracticePrompt[]) => { items[0].prompt.id = existing.id; }],
    ["COVERAGE_UNKNOWN", (items: CandidatePracticePrompt[]) => { items[0].coverageKeys = ["unknown"]; }],
    ["FOCUS_NOT_ALLOWED", (items: CandidatePracticePrompt[]) => { items[0].prompt.focus = ["spatial-language"]; }],
    ["GRAMMAR_TAG_NOT_ALLOWED", (items: CandidatePracticePrompt[]) => { items[0].prompt.grammarTags = ["article"]; }],
    ["ANSWER_CANONICAL_DUPLICATED", (items: CandidatePracticePrompt[]) => {
      items[0].prompt.answers.english.target = [items[0].prompt.english];
    }],
    ["ANSWER_DUPLICATE", (items: CandidatePracticePrompt[]) => {
      items[0].prompt.answers.english.target = ["I want some water."];
      items[0].prompt.answers.english.communicative = ["I want some water."];
    }],
    ["EVALUATION_INPUT_BUDGET", (items: CandidatePracticePrompt[]) => {
      items[0].prompt.answers.english.target = Array.from(
        { length: 6 },
        (_, index) => `${index}${"x".repeat(999)}`,
      );
    }],
    ["BILINGUAL_IDENTICAL", (items: CandidatePracticePrompt[]) => {
      items[0].prompt.spanish = items[0].prompt.english;
    }],
    ["SPANISH_TERM_BANNED", (items: CandidatePracticePrompt[]) => {
      items[0].prompt.spanish = "Vale, quisiera agua.";
    }],
    ["CONTENT_DUPLICATE_EXACT", (items: CandidatePracticePrompt[]) => {
      items[0].prompt.english = existing.english;
      items[0].prompt.spanish = existing.spanish;
    }],
    ["QUOTA_LEVEL", (items: CandidatePracticePrompt[]) => { items[0].prompt.level = "foundation"; }],
    ["QUOTA_DIFFICULTY", (items: CandidatePracticePrompt[]) => { items[0].prompt.difficulty = 1; }],
  ] as const)("keeps checkpoint parity for %s and never requests batch two", async (code, mutate) => {
    const firstBatch = structuredClone(candidates());
    mutate(firstBatch);
    const selectedBrief = multiBatchBrief();
    const completedItems = [...firstBatch, ...additionalCandidates()];
    const completedRun = runEnvelope(selectedBrief, completedItems, "complete", [
      { batchIndex: 0, candidateCount: 2, requestedModel: "openai/gpt-5.6-terra" },
      { batchIndex: 1, candidateCount: 2, requestedModel: "openai/gpt-5.6-terra" },
    ]);
    const report = validateCandidateRun({
      brief: selectedBrief,
      run: completedRun,
      collectionPrompts: [existing],
      globalPrompts: [existing],
    });
    expect(report.findings.map((entry) => entry.code)).toContain(code);

    const generate = vi.fn().mockResolvedValue({ output: { candidates: firstBatch } });
    await expect(generateCandidateRun({
      brief: selectedBrief,
      existingPrompts: [existing],
      globalPrompts: [existing],
      generate,
      model: "openai/gpt-5.6-terra",
      runId: "run-test",
      generatedAt: "2026-08-03T12:00:00.000Z",
    })).rejects.toThrow(`${code}:`);
    expect(generate).toHaveBeenCalledOnce();
  });

  it("resumes a valid checkpoint at the next contiguous batch", async () => {
    const selectedBrief = multiBatchBrief();
    const resume = runEnvelope(selectedBrief, candidates(), "incomplete", [{
      batchIndex: 0,
      candidateCount: 2,
      requestedModel: "openai/gpt-5.6-terra",
    }]);
    const generate = vi.fn().mockResolvedValue({ output: { candidates: additionalCandidates() } });
    const result = await generateCandidateRun({
      brief: selectedBrief,
      existingPrompts: [existing],
      globalPrompts: [existing],
      generate,
      model: "openai/gpt-5.6-terra",
      runId: "run-test",
      generatedAt: resume.generatedAt,
      resume,
    });
    expect(generate).toHaveBeenCalledOnce();
    expect(generate.mock.calls[0][0]).toMatchObject({ batchIndex: 1, expectedCount: 2 });
    expect(result.status).toBe("complete");
    expect(result.candidates).toHaveLength(4);
  });

  it("rejects tampered or inventory-stale resumes before a generator call", async () => {
    const generate = vi.fn();
    const tampered = { ...runEnvelope(), briefHash: "0".repeat(64) } as CandidateRunEnvelope;
    await expect(generateCandidateRun({
      brief: brief(), existingPrompts: [existing], globalPrompts: [existing], generate,
      model: "openai/gpt-5.6-terra", runId: "run-test", generatedAt: tampered.generatedAt,
      resume: tampered,
    })).rejects.toThrow();
    expect(generate).not.toHaveBeenCalled();

    const valid = runEnvelope();
    const changedGlobal = [...[existing], prompt("restaurant-new-base", "Menu.", "Menú.")];
    await expect(generateCandidateRun({
      brief: brief(), existingPrompts: [existing], globalPrompts: changedGlobal, generate,
      model: "openai/gpt-5.6-terra", runId: "run-test", generatedAt: valid.generatedAt,
      resume: valid,
    })).rejects.toThrow(/resume artifact/u);
    expect(generate).not.toHaveBeenCalled();
  });

  it("rejects schema-valid forged prompt counts before a generator call", async () => {
    const selectedBrief = multiBatchBrief();
    const forged = CandidateRunEnvelopeSchema.parse({
      ...runEnvelope(selectedBrief, candidates(), "incomplete"),
      basePromptCount: 2,
      targetCandidateCount: 3,
    });
    const generate = vi.fn();
    await expect(generateCandidateRun({
      brief: selectedBrief,
      existingPrompts: [existing],
      globalPrompts: [existing],
      generate,
      model: "openai/gpt-5.6-terra",
      runId: "run-test",
      generatedAt: forged.generatedAt,
      resume: forged,
    })).rejects.toThrow(/current prompt counts/u);
    expect(generate).not.toHaveBeenCalled();
  });

  it("rejects a resume from a stale executable generation contract before a model call", async () => {
    const stale = {
      ...runEnvelope(),
      generationContractHash: contentHash({
        contractVersion: "practice-candidates-v2",
        systemPrompt: "previous system prompt",
        providerSchemaRevision: "practice-model-output-v0",
        promptBuilderRevision: "practice-batch-prompt-v0",
      }),
    } as CandidateRunEnvelope;
    const generate = vi.fn();
    await expect(generateCandidateRun({
      brief: brief(),
      existingPrompts: [existing],
      globalPrompts: [existing],
      generate,
      model: "openai/gpt-5.6-terra",
      runId: "run-test",
      generatedAt: stale.generatedAt,
      resume: stale,
    })).rejects.toThrow();
    expect(generate).not.toHaveBeenCalled();
  });

  it("rejects impossible batch partitions and zero-batch completed runs", () => {
    const valid = runEnvelope();
    expect(CandidateRunEnvelopeSchema.safeParse({
      ...valid,
      batches: [{ ...valid.batches[0], candidateCount: 1 }],
    }).success).toBe(false);
    expect(CandidateRunEnvelopeSchema.safeParse({
      ...valid,
      batches: [],
      candidates: [],
    }).success).toBe(false);
  });

  it("uses a fully required provider schema and transforms string-only answers", async () => {
    const generated = candidates()[0];
    expect(ModelCandidatePracticePromptSchema.safeParse(generated).success).toBe(true);
    expect(ModelCandidatePracticePromptSchema.safeParse({
      ...generated,
      prompt: {
        ...generated.prompt,
        answers: {
          ...generated.prompt.answers,
          english: { target: [{ text: "Water", region: "US" }], communicative: [] },
        },
      },
    }).success).toBe(false);
    expect(ModelCandidatePracticePromptSchema.safeParse({
      ...generated,
      prompt: { ...generated.prompt, provenance: { source: "model", license: "x" } },
    }).success).toBe(false);
    const jsonSchema = await asSchema(candidateBatchSchema(1)).jsonSchema;
    expect(JSON.stringify(jsonSchema)).not.toMatch(/provenance|region/u);
    expectEveryObjectPropertyRequired(jsonSchema);
    expect(transformModelCandidateBatch({ candidates: [generated] }, 1)).toEqual([generated]);
  });

  it("requires unique prompt/brief arrays and the dedicated allowlisted model/key", () => {
    expect(PracticePromptSchema.safeParse(
      prompt("x", "x", "y", { grammarTags: ["article", "article"] }),
    ).success).toBe(false);
    expect(PracticePromptSchema.safeParse(
      prompt("x", "x", "y", { focus: ["time-phrases", "time-phrases"] }),
    ).success).toBe(false);
    expect(ModelCandidatePracticePromptSchema.safeParse({
      ...candidates()[0], coverageKeys: ["ordering", "ordering"],
    }).success).toBe(false);
    expect(CollectionBriefSchema.safeParse({
      ...brief(), bannedSpanishTerms: ["Vale", "válé"],
    }).success).toBe(false);
    expect(CollectionBriefSchema.safeParse({
      ...brief(), allowedFocus: ["time-phrases", "time-phrases"],
    }).success).toBe(false);
    expect(CollectionBriefSchema.safeParse({
      ...brief(), allowedGrammarTags: ["formula.courtesy", "formula.courtesy"],
    }).success).toBe(false);
    expect(() => configuredPracticeGeneration({ AI_GATEWAY_API_KEY: "ambient" })).toThrow();
    expect(configuredPracticeGeneration({ PRACTICE_GENERATION_AI_GATEWAY_API_KEY: "key" })).toEqual({
      apiKey: "key", model: "openai/gpt-5.6-terra",
    });
  });
});

describe("candidate validation and critic-bound promotion", () => {
  it("enforces per-level grammar tag allowlists", () => {
    const selectedBrief = brief({
      allowedGrammarTags: ["formula.courtesy", "preterite.irregular"],
      allowedGrammarTagsByLevel: {
        foundation: ["formula.courtesy"],
        intermediate: ["formula.courtesy", "preterite.irregular"],
      },
    });
    const invalid = candidates();
    invalid[0] = {
      ...invalid[0],
      prompt: { ...invalid[0].prompt, level: "foundation", grammarTags: ["preterite.irregular"] },
    };
    const raw = { ...runEnvelope(), brief: selectedBrief, briefHash: contentHash(selectedBrief) };
    const parsed = CandidateRunEnvelopeSchema.parse(raw);
    const report = validateCandidateRun({
      brief: selectedBrief, run: { ...parsed, candidates: invalid } as CandidateRunEnvelope,
      collectionPrompts: [existing], globalPrompts: [existing],
    });
    expect(report.findings.map((finding) => finding.code)).toContain("GRAMMAR_TAG_NOT_ALLOWED");
  });

  it("promotes only content bound to complete human review and an independent passing critic", () => {
    const run = runEnvelope();
    const review = reviewFor(run);
    const critic = criticFor(run, review);
    const base = {
      brief: brief(), run, review, critic,
      collectionPrompts: [existing], globalPrompts: [existing],
    };
    expect(() => promoteCandidateRun({ ...base, acknowledgePrototypeOnly: false })).toThrow(
      CandidatePromotionError,
    );
    const result = promoteCandidateRun({ ...base, acknowledgePrototypeOnly: true });
    expect(result.promoted).toMatchObject({ state: "promoted", sourceRunId: "run-test" });
    expect(result.promoted.prompts).toHaveLength(2);
    expect(result.sidecar).toMatchObject({
      reviewedContentHash: critic.reviewedContentHash,
      critic: { reviewer: "Independent critic" },
    });
    if (result.promoted.state !== "promoted") throw new Error("expected promoted artifact");
    const { promotedContentHash, ...promotedPayload } = result.promoted;
    expect(promotedContentHash).toBe(contentHash(promotedPayload));
    expect(result.sidecar.promotedContentHash).toBe(promotedContentHash);
    expect(verifyPromotionPair(result.promoted, result.sidecar).promoted).toEqual(
      result.promoted,
    );
    expect(() => verifyPromotionPair(result.promoted, {
      ...result.sidecar,
      promotedContentHash: "0".repeat(64),
    })).toThrow(/not bound/u);
    expect(() => verifyPromotionPair(result.promoted, {
      ...result.sidecar,
      review: { ...result.sidecar.review, candidateHash: "0".repeat(64) },
    })).toThrow(/not bound/u);
  });

  it("rejects stale, non-independent, failing, or materially adverse critics", () => {
    const run = runEnvelope();
    const review = reviewFor(run);
    const base = {
      brief: brief(), run, review,
      collectionPrompts: [existing], globalPrompts: [existing],
      acknowledgePrototypeOnly: true,
    };
    expect(() => promoteCandidateRun({
      ...base, critic: criticFor(run, review, { reviewedContentHash: "0".repeat(64) }),
    })).toThrow(/critic hashes/u);
    expect(() => promoteCandidateRun({
      ...base,
      critic: { ...criticFor(run, review), model: run.model } as unknown as IndependentCriticArtifact,
    })).toThrow();
    expect(() => promoteCandidateRun({
      ...base,
      critic: {
        ...criticFor(run, review),
        model: "CODEX/GPT-5.6-SOL",
      } as unknown as IndependentCriticArtifact,
    })).toThrow();
    expect(() => promoteCandidateRun({
      ...base, critic: criticFor(run, review, { reviewer: review.reviewer }),
    })).toThrow(/reviewer must differ/u);
    expect(() => promoteCandidateRun({
      ...base,
      critic: criticFor(run, review, {
        verdict: "pass",
        findings: [{ severity: "major", code: "translation-error", message: "Material issue." }],
      }),
    })).toThrow(/major or critical/u);
    const metadataChangedRun = CandidateRunEnvelopeSchema.parse({
      ...run,
      generatedAt: "2026-08-03T15:00:00.000Z",
    });
    expect(() => promoteCandidateRun({
      ...base,
      run: metadataChangedRun,
      critic: criticFor(run, review),
    })).toThrow(/review candidateHash/u);
  });
});
