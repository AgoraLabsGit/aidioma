import { parseDocument } from "yaml";
import { z, type ZodType } from "zod";

import {
  fixesSchema,
  phaseSchema,
  researchSchema,
  specSchema,
  workSchema,
  type FixItem,
  type PhaseFrontmatter,
  type ResearchFrontmatter,
  type SpecFrontmatter,
  type WorkItem,
} from "./schema.js";

/** Phase id or Work id (F/T/P/R/Q/A/S-nnn or legacy W-*). */
const handoffRefSchema = z
  .string()
  .regex(/^(PHASE-[0-9]{3}|[FTPRQAS]-[0-9]{3}|W-[0-9]+)$/u);

const handoffFrontmatterSchema = z.object({
  ref: handoffRefSchema,
});

export class ParseError extends Error {
  readonly sourcePath: string;
  readonly details: string[];

  constructor(sourcePath: string, details: string[]) {
    super(`${sourcePath}: ${details.join("; ")}`);
    this.name = "ParseError";
    this.sourcePath = sourcePath;
    this.details = details;
  }
}

function formatSchemaPath(path: Array<PropertyKey>): string {
  if (path.length === 0) return "root";
  return path
    .map((part) => (typeof part === "number" ? `[${part}]` : String(part)))
    .join(".")
    .replace(/\.\[/gu, "[");
}

export function extractFrontmatter(source: string, sourcePath: string): {
  yaml: string;
  body: string;
} {
  const normalized = source.replaceAll("\r\n", "\n");
  if (!normalized.startsWith("---\n")) {
    throw new ParseError(sourcePath, ["file must begin with YAML frontmatter"]);
  }
  const closingDelimiter = normalized.indexOf("\n---\n", 4);
  if (closingDelimiter === -1) {
    throw new ParseError(sourcePath, ["frontmatter is missing its closing delimiter"]);
  }
  return {
    yaml: normalized.slice(4, closingDelimiter),
    body: normalized.slice(closingDelimiter + 5),
  };
}

export function parseYamlValue<T>(source: string, sourcePath: string, schema: ZodType<T>): T {
  const document = parseDocument(source, {
    prettyErrors: true,
    strict: true,
    uniqueKeys: true,
  });
  if (document.errors.length > 0) {
    throw new ParseError(
      sourcePath,
      document.errors.map((error: { message: string }) => error.message),
    );
  }

  let value: unknown;
  try {
    value = document.toJS({ maxAliasCount: 100 });
  } catch (error) {
    throw new ParseError(sourcePath, [
      error instanceof Error ? error.message : "YAML could not be decoded",
    ]);
  }

  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ParseError(
      sourcePath,
      result.error.issues.map((issue) => `${formatSchemaPath(issue.path)}: ${issue.message}`),
    );
  }
  return result.data;
}

export function parseFrontmatter<T>(
  source: string,
  sourcePath: string,
  schema: ZodType<T>,
): { data: T; body: string } {
  const { yaml, body } = extractFrontmatter(source, sourcePath);
  return { data: parseYamlValue(yaml, sourcePath, schema), body };
}

export function parsePhaseFrontmatter(source: string, sourcePath: string): PhaseFrontmatter {
  return parseFrontmatter(source, sourcePath, phaseSchema as ZodType<PhaseFrontmatter>).data;
}

export function parseSpecFrontmatter(source: string, sourcePath: string): SpecFrontmatter {
  return parseFrontmatter(source, sourcePath, specSchema as ZodType<SpecFrontmatter>).data;
}

export function parseResearchFrontmatter(
  source: string,
  sourcePath: string,
): ResearchFrontmatter {
  return parseFrontmatter(source, sourcePath, researchSchema as ZodType<ResearchFrontmatter>)
    .data;
}

/**
 * HANDOFF.md — optional YAML frontmatter with required `ref` when present.
 * Missing/invalid frontmatter → `ref: null` (unscoped; Active does not project).
 */
export function parseHandoffDocument(
  source: string,
  sourcePath = "Handoffs/HANDOFF.md",
): { ref: string | null; body: string } {
  const normalized = source.replaceAll("\r\n", "\n");
  if (!normalized.startsWith("---\n")) {
    return { ref: null, body: source };
  }
  try {
    const { data, body } = parseFrontmatter(
      source,
      sourcePath,
      handoffFrontmatterSchema as ZodType<{ ref: string }>,
    );
    return { ref: data.ref, body };
  } catch {
    return { ref: null, body: source };
  }
}

export function parseWork(source: string, sourcePath = "WORK.yaml"): WorkItem[] {
  const trimmed = source.trim();
  if (trimmed.length === 0 || trimmed === "[]") return [];
  return parseYamlValue(source, sourcePath, workSchema as ZodType<WorkItem[]>);
}

/** @deprecated Use parseWork */
export function parseFixes(source: string, sourcePath = "FIXES.yaml"): FixItem[] {
  const trimmed = source.trim();
  if (trimmed.length === 0 || trimmed === "[]") return [];
  return parseYamlValue(source, sourcePath, fixesSchema as ZodType<FixItem[]>);
}

export type DecisionEntry = {
  id: string;
  title: string;
  date: string;
  phase: string | null;
  from: string | null;
  affects: string[];
  chose: string;
  why: string;
  revisit_if: string;
  supersedes: string | null;
  superseded_by: string | null;
};

const decisionHeading =
  /^##\s+(D-\d{3})\s+[—-]\s+(.+?)\s*$/u;
const decisionMeta =
  /^Date:\s*(\d{4}-\d{2}-\d{2})\s*·\s*Phase:\s*(\S+)\s*·\s*From:\s*(\S+)\s*·\s*Affects:\s*\[([^\]]*)\]\s*$/u;

export function parseDecisions(source: string, sourcePath = "DECISIONS.md"): {
  decisions: DecisionEntry[];
  errors: string[];
} {
  const decisions: DecisionEntry[] = [];
  const errors: string[] = [];
  const blocks = source.split(/\n(?=##\s+D-\d{3}\b)/u);

  for (const block of blocks) {
    const lines = block.split("\n");
    const heading = lines[0]?.match(decisionHeading);
    if (!heading) continue;

    const id = heading[1]!;
    const title = heading[2]!.trim();
    const metaLine = lines.find((line) => line.startsWith("Date:"));
    const meta = metaLine?.match(decisionMeta);
    if (!meta) {
      errors.push(`${id}: missing or malformed Date/Phase/From/Affects line`);
      continue;
    }

    const field = (prefix: string): string | null => {
      const line = lines.find((candidate) => candidate.startsWith(prefix));
      if (!line) return null;
      return line.slice(prefix.length).trim();
    };

    const chose = field("Chose:");
    const why = field("Why:");
    const revisit = field("Revisit if:");
    if (!chose || !why || !revisit) {
      errors.push(`${id}: missing Chose/Why/Revisit if`);
      continue;
    }

    const affectsRaw = meta[4]!.trim();
    const affects =
      affectsRaw.length === 0
        ? []
        : affectsRaw.split(",").map((part) => part.trim()).filter(Boolean);

    decisions.push({
      id,
      title,
      date: meta[1]!,
      phase: meta[2] === "null" ? null : meta[2]!,
      from: meta[3] === "null" ? null : meta[3]!,
      affects,
      chose,
      why,
      revisit_if: revisit,
      supersedes: field("Supersedes:"),
      superseded_by: field("Superseded by:"),
    });
  }

  return { decisions, errors };
}

/** Slice one `## D-nnn — …` block from DECISIONS.md (living home for all decisions). */
export function extractDecisionSection(source: string, id: string): string | null {
  if (!/^D-\d{3}$/u.test(id)) return null;
  const blocks = source.replaceAll("\r\n", "\n").split(/\n(?=##\s+D-\d{3}\b)/u);
  for (const block of blocks) {
    const heading = block.split("\n")[0]?.match(decisionHeading);
    if (heading?.[1] === id) return block.replace(/\n+$/u, "\n");
  }
  return null;
}

export type ReleaseEntry = {
  id: string;
  date: string;
  phase: string | null;
  summary: string;
};

const releaseHeading = /^##\s+(RELEASE-\d{3})\s+[—-]\s+(.+?)\s*$/u;

/** Slice one `## RELEASE-nnn — …` block from RELEASES.md. */
export function extractReleaseSection(source: string, id: string): string | null {
  if (!/^RELEASE-\d{3}$/u.test(id)) return null;
  const blocks = source.replaceAll("\r\n", "\n").split(/\n(?=##\s+RELEASE-\d{3}\b)/u);
  for (const block of blocks) {
    const heading = block.split("\n")[0]?.match(releaseHeading);
    if (heading?.[1] === id) return block.replace(/\n+$/u, "\n");
  }
  return null;
}

export function parseReleases(source: string): ReleaseEntry[] {
  const releases: ReleaseEntry[] = [];
  const blocks = source.split(/\n(?=##\s+RELEASE-\d{3}\b)/u);
  for (const block of blocks) {
    const lines = block.split("\n");
    const heading = lines[0]?.match(releaseHeading);
    if (!heading) continue;
    const dateLine = lines.find((line) => line.startsWith("Date:"));
    const phaseLine = lines.find((line) => line.startsWith("Phase:"));
    const date = dateLine?.replace(/^Date:\s*/u, "").trim();
    if (!date) continue;
    releases.push({
      id: heading[1]!,
      date,
      phase: phaseLine ? phaseLine.replace(/^Phase:\s*/u, "").trim() || null : null,
      summary: heading[2]!.trim(),
    });
  }
  return releases;
}
