import { z } from "zod";

const identifierSchema = z
  .string()
  .trim()
  .min(1)
  .regex(
    /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/u,
    "must be an uppercase, hyphen-separated identifier",
  );

const titleSchema = z.string().trim().min(1);
const areaSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, "must be a lowercase slug");
const descriptionSchema = z.string().trim().min(1);
const referenceListSchema = z.array(identifierSchema);
const evidenceListSchema = z.array(z.string().trim().min(1));
const specPathSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^Specs\/[^/\\]+\.md$/u, "must be a Docs-relative Specs/*.md path");

export const workStatusSchema = z.enum([
  "open",
  "planning",
  "planned",
  "active",
  "blocked",
  "deferred",
  "complete",
]);

export const workKindSchema = z.enum(["process", "feature", "system", "research"]);
export const founderApprovalSchema = z.enum(["required", "approved"]);

export const workItemSchema = z
  .object({
    id: identifierSchema,
    title: titleSchema,
    area: areaSchema,
    status: workStatusSchema,
    kind: workKindSchema,
    founder_approval: founderApprovalSchema,
    summary: descriptionSchema,
    spec: specPathSchema.nullable(),
    dependencies: referenceListSchema,
    blocked_by: referenceListSchema,
    reusable_by: z.array(areaSchema),
    next_slice: descriptionSchema,
    evidence: evidenceListSchema,
  })
  .strict();

export const workRegistrySchema = z
  .object({
    version: z.literal(1),
    work: z.array(workItemSchema),
  })
  .strict();

export const fixStatusSchema = z.enum(["open", "active", "blocked", "complete"]);

export const fixItemSchema = z
  .object({
    id: identifierSchema,
    title: titleSchema,
    area: areaSchema,
    status: fixStatusSchema,
    summary: descriptionSchema,
    related_work: identifierSchema,
    reproduction: descriptionSchema.optional(),
    expected: descriptionSchema.optional(),
    actual: descriptionSchema.optional(),
    evidence: evidenceListSchema,
  })
  .strict();

export const fixRegistrySchema = z
  .object({
    version: z.literal(1),
    fixes: z.array(fixItemSchema),
  })
  .strict();

export const specStatusSchema = z.enum([
  "draft",
  "review",
  "planned",
  "active",
  "implemented",
  "superseded",
]);

export const specImplementationSchema = z.enum(["none", "partial", "mixed", "implemented"]);
export const founderReviewSchema = founderApprovalSchema;

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/u, "must use YYYY-MM-DD")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
  }, "must be a valid calendar date");

export const specFrontmatterSchema = z
  .object({
    id: identifierSchema,
    title: titleSchema,
    area: areaSchema,
    status: specStatusSchema,
    implementation: specImplementationSchema,
    founder_review: founderReviewSchema,
    updated: isoDateSchema,
  })
  .strict();

export const productFrontmatterSchema = specFrontmatterSchema.superRefine((value, context) => {
  if (value.id !== "PRODUCT-001") {
    context.addIssue({ code: "custom", message: "must use id PRODUCT-001", path: ["id"] });
  }
  if (value.area !== "product") {
    context.addIssue({ code: "custom", message: "must use area product", path: ["area"] });
  }
});

const repositoryRelativePathSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) =>
      !value.startsWith("/") &&
      !value.startsWith("git:") &&
      !value.includes("\\") &&
      !value.split("/").includes(".."),
    "must be a contained repository-relative path",
  );
const gitSourceSchema = z
  .string()
  .regex(/^git:[0-9a-f]{40}:[^/\\][^\\]*$/u, "must use git:<40sha>:<path> syntax");

export const migrationSourceClassificationSchema = z.enum([
  "implemented",
  "legacy-accepted",
  "candidate",
  "research",
  "conflicting",
  "rejected",
]);
export const migrationTargetDispositionSchema = z.enum([
  "preserve-for-disposition",
  "preserve-deferred-for-disposition",
  "retain-as-candidate",
  "retain-as-planning-input",
  "retain-as-research",
  "retain-as-blocking-requirement",
  "retain-implemented",
  "retain-implemented-with-scope",
  "retain-implemented-with-limitation",
  "retain-implemented-with-practice-conflict",
  "retain-implemented-prototype-behavior",
  "register-current-conflict",
  "correct-to-implemented-truth",
  "reopen-policy",
  "record-current-rejection",
]);
export const migrationFounderDecisionStateSchema = z.enum([
  "pending",
  "pending-policy-review",
  "not-required-for-current-truth",
  "approved",
  "revised",
  "deferred",
  "rejected",
]);
export const migrationEntrySchema = z
  .object({
    id: z.string().regex(/^MIG-[0-9]{3,}$/u, "must use MIG-### syntax"),
    domain: areaSchema,
    claim: descriptionSchema,
    source_classification: migrationSourceClassificationSchema,
    target_disposition: migrationTargetDispositionSchema,
    founder_decision_state: migrationFounderDecisionStateSchema,
    sources: z.array(z.union([gitSourceSchema, repositoryRelativePathSchema])).min(1),
    target: z.union([z.literal("PRODUCT.md"), specPathSchema]),
  })
  .strict();
export const migrationRegistrySchema = z
  .object({
    temporary: z.literal(true),
    source_commit: z.string().regex(/^[0-9a-f]{40}$/u, "must be a full 40-character commit SHA"),
    disposition_required: z.literal("founder-review"),
    classification_note: descriptionSchema,
    entries: z.array(migrationEntrySchema),
  })
  .strict()
  .superRefine((value, context) => {
    const seen = new Set<string>();
    value.entries.forEach((entry, index) => {
      if (seen.has(entry.id)) {
        context.addIssue({
          code: "custom",
          message: `duplicate migration id ${entry.id}`,
          path: ["entries", index, "id"],
        });
      }
      seen.add(entry.id);
    });
  });

export type WorkStatus = z.infer<typeof workStatusSchema>;
export type WorkKind = z.infer<typeof workKindSchema>;
export type FounderApproval = z.infer<typeof founderApprovalSchema>;
export type WorkItem = z.infer<typeof workItemSchema>;
export type WorkRegistry = z.infer<typeof workRegistrySchema>;
export type FixStatus = z.infer<typeof fixStatusSchema>;
export type FixItem = z.infer<typeof fixItemSchema>;
export type FixRegistry = z.infer<typeof fixRegistrySchema>;
export type SpecStatus = z.infer<typeof specStatusSchema>;
export type SpecImplementation = z.infer<typeof specImplementationSchema>;
export type SpecFrontmatter = z.infer<typeof specFrontmatterSchema>;
export type ProductFrontmatter = z.infer<typeof productFrontmatterSchema>;
export type MigrationEntry = z.infer<typeof migrationEntrySchema>;
export type MigrationRegistry = z.infer<typeof migrationRegistrySchema>;
