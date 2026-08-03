import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, open, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { dirname, extname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createGateway } from "@ai-sdk/gateway";
import { APICallError, NoObjectGeneratedError, Output, generateText } from "ai";

import {
  CandidateRunEnvelopeSchema,
  CollectionBriefSchema,
  HumanReviewManifestSchema,
  IndependentCriticArtifactSchema,
  PromotionReviewSidecarSchema,
  contentHash,
  configuredPracticeGeneration,
  candidateBatchSchema,
  generateCandidateRun,
  type GenerateCandidateBatch,
} from "../src/lib/practice-sets/candidate-generation";
import {
  promoteCandidateRun,
  validateCandidateRun,
  verifyPromotionPair,
} from "../src/lib/practice-sets/candidate-validation";
import {
  assertReplaceablePromotionPlaceholder,
  loadPromotedPrototypePrompts,
} from "../src/lib/practice-sets/promoted-practice-prompts";
import { practiceSetFixtures } from "../src/lib/practice-sets/prototype-fixtures";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = resolve(SCRIPT_DIR, "..");
const ARTIFACT_ROOT = resolve(WEB_ROOT, "artifacts", "practice-candidates");
const PROMOTION_ROOT = resolve(
  WEB_ROOT,
  "src",
  "lib",
  "practice-sets",
  "prototype-content",
);
const RESTAURANT_PROMOTION_PATH = resolve(PROMOTION_ROOT, "restaurant-prompts.json");

const GENERATION_MAX_OUTPUT_TOKENS = 8_000;
const GENERATION_TIMEOUT_MS = 60_000;

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function flag(name: string) {
  return process.argv.includes(name);
}

function resolvedInput(value: string | undefined, label: string) {
  if (!value) throw new Error(`${label} is required`);
  return isAbsolute(value) ? value : resolve(process.cwd(), value);
}

function requireJsonPath(path: string, label: string) {
  if (extname(path).toLocaleLowerCase() !== ".json") {
    throw new Error(`${label} must use a .json path`);
  }
}

function assertInside(path: string, root: string, label: string) {
  const rel = relative(root, path);
  if (rel === "" || rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(`${label} must be inside ${root}`);
  }
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8")) as unknown;
}

async function writeJsonAtomic(path: string, value: unknown) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  await rename(temporary, path);
}

function collectionContext(collectionId: string) {
  const collection = practiceSetFixtures.find((set) => set.id === collectionId);
  if (!collection) throw new Error(`unknown collection ${collectionId}`);
  return {
    collectionPrompts: collection.prompts,
    globalPrompts: practiceSetFixtures.flatMap((set) => set.prompts),
  };
}

function safeGenerationId(value: unknown): string | undefined {
  return typeof value === "string" && /^gen_[A-Za-z0-9]+$/u.test(value) ? value : undefined;
}

function gatewayGenerator(apiKey: string): GenerateCandidateBatch {
  const gateway = createGateway({ apiKey });
  return async (request) => {
    let result;
    try {
      result = await generateText({
        model: gateway(request.model),
        system: request.system,
        prompt: request.prompt,
        output: Output.object({ schema: candidateBatchSchema(request.expectedCount) }),
        reasoning: "minimal",
        maxRetries: 0,
        maxOutputTokens: GENERATION_MAX_OUTPUT_TOKENS,
        timeout: { totalMs: GENERATION_TIMEOUT_MS },
        providerOptions: { gateway: { tags: request.tags } },
      });
    } catch (error) {
      const category = NoObjectGeneratedError.isInstance(error)
        ? "schema"
        : APICallError.isInstance(error)
          ? `provider-${error.statusCode ?? "unknown"}`
          : error instanceof Error && /timeout/iu.test(error.name)
            ? "timeout"
            : "provider";
      throw new Error(`Practice candidate provider request failed (${category})`);
    }
    return {
      output: result.output,
      responseModel: result.finalStep.response.modelId,
      generationId: safeGenerationId(result.finalStep.providerMetadata?.gateway?.generationId),
      usage: {
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        totalTokens: result.usage.totalTokens,
      },
    };
  };
}

function configuredGenerator() {
  const { apiKey, model } = configuredPracticeGeneration(process.env);
  return { generate: gatewayGenerator(apiKey), model };
}

async function generateCommand() {
  const briefPath = resolvedInput(argument("--brief"), "--brief");
  requireJsonPath(briefPath, "brief");
  const brief = CollectionBriefSchema.parse(await readJson(briefPath));
  const context = collectionContext(brief.collectionId);
  const resumePathValue = argument("--resume");
  const resumePath = resumePathValue ? resolvedInput(resumePathValue, "--resume") : undefined;
  if (resumePath) assertInside(resumePath, ARTIFACT_ROOT, "resume artifact");
  if (resumePath) requireJsonPath(resumePath, "resume artifact");
  const resume = resumePath
    ? CandidateRunEnvelopeSchema.parse(await readJson(resumePath))
    : undefined;
  const runId = resume?.runId ?? `run-${new Date().toISOString().replace(/[^0-9a-z]+/giu, "-").toLowerCase()}`;
  const outputPath = resumePath ?? resolve(ARTIFACT_ROOT, brief.briefId, `${runId}.json`);
  assertInside(outputPath, ARTIFACT_ROOT, "candidate artifact");
  if (!resume && existsSync(outputPath)) throw new Error(`candidate artifact already exists: ${outputPath}`);
  const { generate, model } = configuredGenerator();
  const run = await generateCandidateRun({
    brief,
    existingPrompts: context.collectionPrompts,
    globalPrompts: context.globalPrompts,
    generate,
    model,
    runId,
    generatedAt: resume?.generatedAt ?? new Date().toISOString(),
    resume,
    onCheckpoint: (checkpoint) => writeJsonAtomic(outputPath, checkpoint),
  });
  const report = validateCandidateRun({ brief, run, ...context });
  const reportPath = outputPath.replace(/\.json$/u, ".validation.json");
  if (reportPath === outputPath) throw new Error("validation report path must differ from candidate");
  await writeJsonAtomic(reportPath, report);
  console.log(JSON.stringify({ artifact: outputPath, report }, null, 2));
  if (report.counts.errors > 0) process.exitCode = 1;
}

async function validateCommand() {
  const candidatePath = resolvedInput(argument("--candidate"), "--candidate");
  requireJsonPath(candidatePath, "candidate artifact");
  assertInside(candidatePath, ARTIFACT_ROOT, "candidate artifact");
  const run = CandidateRunEnvelopeSchema.parse(await readJson(candidatePath));
  const context = collectionContext(run.brief.collectionId);
  const report = validateCandidateRun({ brief: run.brief, run, ...context });
  console.log(JSON.stringify(report, null, 2));
  if (report.counts.errors > 0) process.exitCode = 1;
}

async function promoteCommand() {
  const candidatePath = resolvedInput(argument("--candidate"), "--candidate");
  const reviewPath = resolvedInput(argument("--review"), "--review");
  const criticPath = resolvedInput(argument("--critic"), "--critic");
  const outputPath = resolvedInput(argument("--output"), "--output");
  requireJsonPath(candidatePath, "candidate artifact");
  requireJsonPath(reviewPath, "review artifact");
  requireJsonPath(criticPath, "critic artifact");
  requireJsonPath(outputPath, "promoted prototype output");
  assertInside(candidatePath, ARTIFACT_ROOT, "candidate artifact");
  assertInside(outputPath, PROMOTION_ROOT, "promoted prototype output");
  if (outputPath !== RESTAURANT_PROMOTION_PATH) {
    throw new Error(`promoted output must be the tracked Restaurant placeholder`);
  }
  const sidecarPath = outputPath.replace(/\.json$/u, ".review.json");
  const run = CandidateRunEnvelopeSchema.parse(await readJson(candidatePath));
  const review = HumanReviewManifestSchema.parse(await readJson(reviewPath));
  const critic = IndependentCriticArtifactSchema.parse(await readJson(criticPath));
  const context = collectionContext(run.brief.collectionId);
  const result = promoteCandidateRun({
    brief: run.brief,
    run,
    review,
    critic,
    acknowledgePrototypeOnly: flag("--acknowledge-prototype-only"),
    ...context,
  });
  verifyPromotionPair(result.promoted, result.sidecar);
  const lockPath = resolve(ARTIFACT_ROOT, ".locks", "restaurant-promotion.lock");
  await mkdir(dirname(lockPath), { recursive: true });
  let lock;
  try {
    lock = await open(lockPath, "wx");
  } catch {
    throw new Error("another Restaurant promotion is active");
  }
  try {
    assertReplaceablePromotionPlaceholder(await readJson(outputPath), run.brief.collectionId);
    if (existsSync(sidecarPath)) {
      const existingSidecar = PromotionReviewSidecarSchema.parse(await readJson(sidecarPath));
      if (contentHash(existingSidecar) !== contentHash(result.sidecar)) {
        throw new Error("existing review sidecar does not match this promotion");
      }
    } else {
      await writeJsonAtomic(sidecarPath, result.sidecar);
    }
    await writeJsonAtomic(outputPath, result.promoted);
    const installed = loadPromotedPrototypePrompts(await readJson(outputPath));
    verifyPromotionPair(installed, await readJson(sidecarPath));
  } finally {
    await lock.close();
    await unlink(lockPath).catch(() => undefined);
  }
  console.log(JSON.stringify({ output: outputPath, review: sidecarPath }, null, 2));
}

async function main() {
  const command = process.argv[2];
  if (command === "generate") return generateCommand();
  if (command === "validate") return validateCommand();
  if (command === "promote") return promoteCommand();
  throw new Error("usage: practice-candidates <generate|validate|promote> [options]");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "practice candidate command failed");
  process.exitCode = 1;
});
