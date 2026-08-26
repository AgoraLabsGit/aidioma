import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  DialectContentUnit,
  DialectPromotionReceipt,
  PromotedLessonPlacement,
} from "../../packages/lesson-schema/src/index.js";
import { hash as sha256 } from "fast-sha256";

const root = resolve(import.meta.dirname, "..", "..");

function read(path: string): unknown {
  return JSON.parse(readFileSync(resolve(root, path), "utf8")) as unknown;
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function digest(value: unknown): string {
  const bytes = sha256(new TextEncoder().encode(canonicalJson(value)));
  return `sha256:${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

const rawUnit = read("content/units/a1/unit.a1.you-live-here.json");
const rawPromotion = read("content/promotions/promotion.unit-a1-you-live-here.v1.json");
const rawPlacement = read("content/placements/placement.a1.you-live-here.json");
const unit = DialectContentUnit.parse(rawUnit);
const promotion = DialectPromotionReceipt.parse(rawPromotion);
const placement = PromotedLessonPlacement.parse(rawPlacement);
const errors: string[] = [];

if (promotion.contentDigest !== digest(rawUnit)) errors.push("promotion digest does not match the unit");
if (placement.source.unitId !== unit.id || placement.source.contentVersion !== unit.contentVersion) {
  errors.push("lesson placement does not reference the promoted unit version");
}
if (placement.source.promotionReceiptId !== promotion.receiptId) {
  errors.push("lesson placement does not reference the unit promotion receipt");
}
const concepts = new Set(unit.concepts.map((concept) => concept.id));
const topics = new Set(unit.topicalTags);
for (const collection of placement.collections) {
  if (collection.kind === "concept" && !concepts.has(collection.referenceId)) {
    errors.push(`concept collection ${collection.id} has an unresolved reference`);
  }
  if (collection.kind === "topic" && !topics.has(collection.referenceId)) {
    errors.push(`topic collection ${collection.id} has an unresolved reference`);
  }
}
for (const profile of unit.supportedProfiles) {
  const canonical = unit.renderings[profile].text.toLocaleLowerCase("es");
  const firstHint = placement.check.hints[profile][0].toLocaleLowerCase("es");
  if (firstHint.includes(canonical)) errors.push(`${profile} first hint reveals the canonical answer`);
}

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR journey-content: ${error}`);
  process.exit(1);
}
console.log(`Promoted journey content valid: ${placement.id}@${placement.contentVersion}`);
