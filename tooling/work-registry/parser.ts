import { parseDocument } from "yaml";
import type { ZodType } from "zod";

import {
  fixRegistrySchema,
  migrationRegistrySchema,
  productFrontmatterSchema,
  specFrontmatterSchema,
  workRegistrySchema,
  type FixRegistry,
  type MigrationRegistry,
  type ProductFrontmatter,
  type SpecFrontmatter,
  type WorkRegistry,
} from "./schema.js";

export class RegistryParseError extends Error {
  readonly sourcePath: string;

  constructor(sourcePath: string, details: string[]) {
    super(`${sourcePath}: ${details.join("; ")}`);
    this.name = "RegistryParseError";
    this.sourcePath = sourcePath;
  }
}

function formatSchemaPath(path: Array<PropertyKey>): string {
  if (path.length === 0) return "root";
  return path
    .map((part) => (typeof part === "number" ? `[${part}]` : String(part)))
    .join(".")
    .replace(/\.\[/gu, "[");
}

function parseYaml<T>(source: string, sourcePath: string, schema: ZodType<T>): T {
  const document = parseDocument(source, {
    prettyErrors: true,
    strict: true,
    uniqueKeys: true,
  });

  if (document.errors.length > 0) {
    throw new RegistryParseError(
      sourcePath,
      document.errors.map((error: { message: string }) => error.message),
    );
  }

  let value: unknown;
  try {
    value = document.toJS({ maxAliasCount: 100 });
  } catch (error) {
    throw new RegistryParseError(sourcePath, [
      error instanceof Error ? error.message : "YAML could not be decoded",
    ]);
  }

  const result = schema.safeParse(value);
  if (!result.success) {
    throw new RegistryParseError(
      sourcePath,
      result.error.issues.map(
        (issue) => `${formatSchemaPath(issue.path)}: ${issue.message}`,
      ),
    );
  }

  return result.data;
}

export function parseWorkRegistry(source: string, sourcePath = "WORK.yaml"): WorkRegistry {
  return parseYaml(source, sourcePath, workRegistrySchema);
}

export function parseFixRegistry(source: string, sourcePath = "FIXES.yaml"): FixRegistry {
  return parseYaml(source, sourcePath, fixRegistrySchema);
}

export function parseMigrationRegistry(
  source: string,
  sourcePath = "MIGRATION.yaml",
): MigrationRegistry {
  return parseYaml(source, sourcePath, migrationRegistrySchema);
}

function extractFrontmatter(source: string, sourcePath: string): string {
  const normalized = source.replaceAll("\r\n", "\n");
  if (!normalized.startsWith("---\n")) {
    throw new RegistryParseError(sourcePath, ["spec must begin with YAML frontmatter"]);
  }

  const closingDelimiter = normalized.indexOf("\n---\n", 4);
  if (closingDelimiter === -1) {
    throw new RegistryParseError(sourcePath, ["spec frontmatter is missing its closing delimiter"]);
  }

  return normalized.slice(4, closingDelimiter);
}

export function parseSpecFrontmatter(source: string, sourcePath: string): SpecFrontmatter {
  return parseYaml(extractFrontmatter(source, sourcePath), sourcePath, specFrontmatterSchema);
}

export function parseProductFrontmatter(source: string, sourcePath = "PRODUCT.md"): ProductFrontmatter {
  return parseYaml(extractFrontmatter(source, sourcePath), sourcePath, productFrontmatterSchema);
}
