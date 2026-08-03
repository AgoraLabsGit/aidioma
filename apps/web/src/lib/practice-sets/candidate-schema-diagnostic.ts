import { TypeValidationError } from "ai";

const MAX_SCHEMA_DIAGNOSTIC_ISSUES = 8;

const SAFE_FINISH_REASONS = new Set([
  "stop",
  "length",
  "content-filter",
  "tool-calls",
  "error",
  "other",
]);

const SAFE_SCHEMA_PATH_SEGMENTS = new Set([
  "answers",
  "candidates",
  "capability",
  "communicative",
  "coverageKeys",
  "cue",
  "difficulty",
  "english",
  "focus",
  "grammarTags",
  "id",
  "level",
  "prompt",
  "spanish",
  "target",
]);

export type PracticeSchemaDiagnostic = {
  finishReason?: string;
  issues: Array<{ path: string; code: string }>;
};

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object"
    ? value as Record<string, unknown>
    : undefined;
}

function validationIssues(cause: unknown): unknown[] {
  if (Array.isArray(cause)) return cause;
  const causeRecord = record(cause);
  return Array.isArray(causeRecord?.issues) ? causeRecord.issues : [];
}

function safeIssueCode(value: unknown): string {
  return typeof value === "string" && /^[a-z][a-z0-9_-]{0,63}$/u.test(value)
    ? value
    : "unknown";
}

function safeIssuePath(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) return "$";
  const segments = value.slice(0, 12).map((segment) => {
    if (typeof segment === "number" && Number.isSafeInteger(segment) && segment >= 0) {
      return String(segment);
    }
    if (typeof segment === "string" && SAFE_SCHEMA_PATH_SEGMENTS.has(segment)) return segment;
    return "?";
  });
  return segments.join(".").slice(0, 240);
}

/**
 * Extracts only bounded schema coordinates. It never reads validation values,
 * generated text, provider bodies, error messages, or credential-bearing fields.
 */
export function summarizePracticeSchemaFailure(error: {
  cause?: unknown;
  finishReason?: unknown;
}): PracticeSchemaDiagnostic {
  const finishReason =
    typeof error.finishReason === "string" && SAFE_FINISH_REASONS.has(error.finishReason)
      ? error.finishReason
      : undefined;
  const issues = TypeValidationError.isInstance(error.cause)
    ? validationIssues(error.cause.cause)
        .slice(0, MAX_SCHEMA_DIAGNOSTIC_ISSUES)
        .map((issue) => {
          const issueRecord = record(issue);
          return {
            path: safeIssuePath(issueRecord?.path),
            code: safeIssueCode(issueRecord?.code),
          };
        })
    : [];

  return {
    ...(finishReason && { finishReason }),
    issues,
  };
}

export function formatPracticeSchemaDiagnostic(diagnostic: PracticeSchemaDiagnostic): string {
  const parts = [
    diagnostic.finishReason ? `finishReason=${diagnostic.finishReason}` : undefined,
    diagnostic.issues.length > 0
      ? `issues=${diagnostic.issues.map((issue) => `${issue.path}:${issue.code}`).join(",")}`
      : undefined,
  ].filter((part): part is string => part !== undefined);
  return parts.length > 0 ? `; ${parts.join("; ")}` : "";
}
