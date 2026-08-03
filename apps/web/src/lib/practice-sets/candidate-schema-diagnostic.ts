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
  shape?: {
    candidateKeys: string[];
    promptKind: string;
    promptKeys: string[];
    answersKind: string;
    answersKeys: string[];
    englishKind: string;
    englishKeys: string[];
    spanishKind: string;
    spanishKeys: string[];
  };
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

function safeKind(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return ["object", "string", "number", "boolean", "undefined"].includes(typeof value)
    ? typeof value
    : "unknown";
}

function safeShapeKeys(value: unknown): string[] {
  const valueRecord = record(value);
  if (!valueRecord) return [];
  return Object.keys(valueRecord)
    .filter((key) => SAFE_SCHEMA_PATH_SEGMENTS.has(key))
    .sort()
    .slice(0, 20);
}

function safeFirstCandidateShape(value: unknown): PracticeSchemaDiagnostic["shape"] {
  const root = record(value);
  const candidates = Array.isArray(root?.candidates) ? root.candidates : [];
  const candidate = candidates[0];
  const candidateRecord = record(candidate);
  if (!candidateRecord) return undefined;
  const prompt = candidateRecord.prompt;
  const promptRecord = record(prompt);
  const answers = promptRecord?.answers;
  const answersRecord = record(answers);
  const english = answersRecord?.english;
  const spanish = answersRecord?.spanish;
  return {
    candidateKeys: safeShapeKeys(candidate),
    promptKind: safeKind(prompt),
    promptKeys: safeShapeKeys(prompt),
    answersKind: safeKind(answers),
    answersKeys: safeShapeKeys(answers),
    englishKind: safeKind(english),
    englishKeys: safeShapeKeys(english),
    spanishKind: safeKind(spanish),
    spanishKeys: safeShapeKeys(spanish),
  };
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
  const typeValidationError = TypeValidationError.isInstance(error.cause)
    ? error.cause
    : undefined;
  const issues = typeValidationError
    ? validationIssues(typeValidationError.cause)
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
    ...(typeValidationError && {
      shape: safeFirstCandidateShape(typeValidationError.value),
    }),
  };
}

export function formatPracticeSchemaDiagnostic(diagnostic: PracticeSchemaDiagnostic): string {
  const shape = diagnostic.shape;
  const parts = [
    diagnostic.finishReason ? `finishReason=${diagnostic.finishReason}` : undefined,
    diagnostic.issues.length > 0
      ? `issues=${diagnostic.issues.map((issue) => `${issue.path}:${issue.code}`).join(",")}`
      : undefined,
    shape
      ? `shape=candidate[${shape.candidateKeys.join(",")}]` +
        `|prompt:${shape.promptKind}[${shape.promptKeys.join(",")}]` +
        `|answers:${shape.answersKind}[${shape.answersKeys.join(",")}]` +
        `|english:${shape.englishKind}[${shape.englishKeys.join(",")}]` +
        `|spanish:${shape.spanishKind}[${shape.spanishKeys.join(",")}]`
      : undefined,
  ].filter((part): part is string => part !== undefined);
  return parts.length > 0 ? `; ${parts.join("; ")}` : "";
}
