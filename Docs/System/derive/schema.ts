import { z } from "zod";

export const phaseStateSchema = z.enum([
  "proposed",
  "ready",
  "active",
  "closed",
  "blocked",
  "canceled",
]);

const phaseObjectSchema = z.object({
  id: z.string().regex(/^PHASE-[0-9]{3}$/),
  title: z.string().min(1),
  type: z.enum(["design", "build"]),
  proof_kind: z.enum(["test", "visual", "terminal", "state", "spec"]),
  state: phaseStateSchema,
  order: z.number().int().nonnegative(),
  depends_on: z.array(z.string().regex(/^PHASE-[0-9]{3}$/)),
  from_backlog: z.union([z.string(), z.null()]).default(null),
  owner: z.string().min(1),
  outcome: z.string().min(1),
  proof: z.string().min(1),
  non_goals: z.array(z.string()),
  amends_specs: z.array(z.string().regex(/^SPEC-[FA]-[A-Z0-9-]+$/)),
  /** Declared paths that informed the phase (D-024) — not an automatic read log. */
  context_paths: z.union([z.array(z.string().min(1)), z.null()]).default(null),
  opened: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  closed: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.null()]).default(null),
  lessons: z.union([z.string(), z.null()]).default(null),
  feature: z
    .union([z.string().regex(/^SPEC-F-[A-Z0-9-]+$/), z.null()])
    .default(null),
  area: z.union([z.string().regex(/^SPEC-A-[A-Z0-9-]+$/), z.null()]).default(null),
});

export const phaseSchema = phaseObjectSchema.superRefine((value, context) => {
  if (value.type === "design" && value.proof_kind !== "spec") {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "design phases require proof_kind: spec",
      path: ["proof_kind"],
    });
  }
  if (value.state === "canceled" && (!value.lessons || value.lessons.length === 0)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "canceled phases require lessons",
      path: ["lessons"],
    });
  }
  if (value.state === "closed" && !value.closed) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "closed phases require closed date",
      path: ["closed"],
    });
  }
});

const specObjectSchema = z.object({
  id: z.string().regex(/^SPEC-[FA]-[A-Z0-9-]+$/),
  kind: z.enum(["feature", "area"]),
  title: z.string().min(1),
  status: z.enum(["active", "superseded", "contested"]),
  superseded_by: z.union([z.string().regex(/^SPEC-[FA]-[A-Z0-9-]+$/), z.null()]).default(null),
  depends_on: z.array(z.string().regex(/^SPEC-A-[A-Z0-9-]+$/)).optional(),
  vendor: z.union([z.string(), z.null()]).default(null),
  decisions: z.array(z.string().regex(/^D-[0-9]{3}$/)),
  built_by: z.array(z.string().regex(/^PHASE-[0-9]{3}$/)),
  last_amended: z.union([z.string().regex(/^PHASE-[0-9]{3}$/), z.null()]).default(null),
  research: z.array(z.string().regex(/^R-[0-9]{3}$/)),
  paths: z.array(z.string().min(1)).min(1),
});

export const specSchema = specObjectSchema.superRefine((value, context) => {
  if (value.kind === "feature" && value.depends_on === undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "feature specs require depends_on",
      path: ["depends_on"],
    });
  }
  if (value.kind === "area" && value.depends_on !== undefined) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "area specs must not declare depends_on",
      path: ["depends_on"],
    });
  }
  if (value.status === "superseded" && !value.superseded_by) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "superseded specs require superseded_by",
      path: ["superseded_by"],
    });
  }
});

export const researchSchema = z.object({
  id: z.string().regex(/^R-[0-9]{3}$/),
  question: z.string().min(1),
  verdict: z.string().min(1),
  status: z.enum(["fresh", "stale", "superseded"]),
  informed: z.array(z.string().regex(/^D-[0-9]{3}$/)),
  affects: z.array(z.string().regex(/^SPEC-[FA]-[A-Z0-9-]+$/)),
  phase: z.union([z.string().regex(/^PHASE-[0-9]{3}$/), z.null()]).default(null),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const workKindSchema = z.enum([
  "fix",
  "task",
  "proposal",
  "research",
  "question",
  "audit",
  "design",
]);

/** Legacy W-nnn or kind-prefixed F/T/P/R/Q/A/S-nnn. S=design (D- reserved for decisions). */
export const workIdSchema = z.string().regex(/^(W|F|T|P|R|Q|A|S)-[0-9]{3}$/);

export const WORK_KIND_ID_PREFIX: Record<
  z.infer<typeof workKindSchema>,
  "F" | "T" | "P" | "R" | "Q" | "A" | "S"
> = {
  fix: "F",
  task: "T",
  proposal: "P",
  research: "R",
  question: "Q",
  audit: "A",
  design: "S",
};

export const workStatusSchema = z.enum([
  "open",
  "active",
  "done",
  "promoted",
  "dropped",
]);

export const workOpenQuestionSchema = z.object({
  q: z.string().min(1),
  answer: z.union([z.string(), z.null()]).default(null),
  asked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const workItemSchema = z.object({
  id: workIdSchema,
  kind: workKindSchema,
  summary: z.string().min(1),
  status: workStatusSchema,
  feature: z
    .union([z.string().regex(/^SPEC-F-[A-Z0-9-]+$/), z.null()])
    .default(null),
  area: z.union([z.string().regex(/^SPEC-A-[A-Z0-9-]+$/), z.null()]).default(null),
  phase: z.union([z.string().regex(/^PHASE-[0-9]{3}$/), z.null()]).default(null),
  promoted_to: z.union([z.string(), z.null()]).default(null),
  blocked_by: z.union([workIdSchema, z.null()]).default(null),
  note: z.union([z.string(), z.null()]).default(null),
  /** Declared paths that informed the work (D-024) — fill at done; not a tool-read log. */
  context_paths: z.union([z.array(z.string().min(1)), z.null()]).default(null),
  open_questions: z
    .union([z.array(workOpenQuestionSchema), z.null()])
    .default(null),
  done_summary: z.union([z.string(), z.null()]).default(null),
  /** Date-only (legacy) or UTC ISO datetime — datetime preferred so Age is real. */
  opened: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/,
    ),
});

export const workSchema = z.array(workItemSchema);

/** Next kind-prefixed id (F/T/P/R/Q/A/S). Legacy W-* ids are ignored for the series. */
export function nextWorkId(
  kind: z.infer<typeof workKindSchema>,
  existingIds: readonly string[],
): string {
  const prefix = WORK_KIND_ID_PREFIX[kind];
  let max = 0;
  const pattern = new RegExp(`^${prefix}-([0-9]{3})$`);
  for (const id of existingIds) {
    const match = pattern.exec(id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

/** @deprecated Use workItemSchema — kept for test fixtures during migration */
export const fixItemSchema = z.object({
  id: z.string().regex(/^FIX-[0-9]{3}$/),
  summary: z.string().min(1),
  status: z.enum(["open", "fixed"]),
  spec: z.union([z.string().regex(/^SPEC-[FA]-[A-Z0-9-]+$/), z.null()]).default(null),
  opened: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const fixesSchema = z.array(fixItemSchema);

export type PhaseFrontmatter = z.output<typeof phaseObjectSchema>;
export type SpecFrontmatter = z.output<typeof specObjectSchema>;
export type ResearchFrontmatter = z.output<typeof researchSchema>;
export type WorkItem = z.output<typeof workItemSchema>;
export type FixItem = z.output<typeof fixItemSchema>;
