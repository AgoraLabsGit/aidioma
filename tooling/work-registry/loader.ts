import { readdir, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  parseFixRegistry,
  parseMigrationRegistry,
  parseProductFrontmatter,
  parseSpecFrontmatter,
  parseWorkRegistry,
} from "./parser.js";
import type {
  FixItem,
  FixRegistry,
  MigrationRegistry,
  SpecFrontmatter,
  WorkItem,
  WorkKind,
  WorkRegistry,
} from "./schema.js";

export type RegistryWarning = {
  code: string;
  message: string;
  severity: "error" | "warning";
  sourcePath: string;
};

export type RegistryRow = {
  entity: "work" | "fix" | "spec" | "migration";
  kind: WorkKind | "bug" | "spec" | "migration";
  id: string;
  title: string;
  area: string;
  status: string;
  summary: string;
  sourceRoot: string;
  sourcePath: string;
  relatedWork: string | null;
  specPath: string | null;
  nextAction: string | null;
  blockedBy: string[];
};

export type LoadedSpec = {
  metadata: SpecFrontmatter;
  sourcePath: string;
};

export type RegistrySnapshot = {
  version: 1;
  generatedAt: string;
  sourceRoot: string;
  valid: boolean;
  migrationPresent: boolean;
  migrationReady: boolean;
  rows: RegistryRow[];
  warnings: RegistryWarning[];
  counts: {
    work: number;
    fixes: number;
    specs: number;
    migrations: number;
    pendingMigrationDecisions: number;
    errors: number;
    warnings: number;
  };
};

export type LoadRegistryOptions = {
  repositoryRoot?: string;
  docsRoot?: string;
  now?: () => Date;
};

const defaultRepositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const docsSpine = [
  { path: "INDEX.md", type: "file" },
  { path: "WORK.yaml", type: "file" },
  { path: "FIXES.yaml", type: "file" },
  { path: "HANDOFF.md", type: "file" },
  { path: "PRODUCT.md", type: "file" },
  { path: "Specs", type: "directory" },
] as const;

function isContained(parent: string, candidate: string): boolean {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

async function containedRealPath(repositoryRoot: string, candidate: string): Promise<string> {
  const resolved = await realpath(candidate);
  if (!isContained(repositoryRoot, resolved)) {
    throw new Error(`Configured Docs path must remain inside the repository: ${candidate}`);
  }
  return resolved;
}

type ResolvedDocsRoot = {
  label: string;
  path: string;
};

async function missingDocsSpineEntries(
  repositoryRoot: string,
  docsCandidate: string,
): Promise<string[]> {
  if (!isContained(repositoryRoot, docsCandidate)) {
    throw new Error(`Configured Docs path must remain inside the repository: ${docsCandidate}`);
  }

  const missing: string[] = [];
  for (const entry of docsSpine) {
    const candidate = path.join(docsCandidate, entry.path);
    try {
      const resolved = await containedRealPath(repositoryRoot, candidate);
      const metadata = await stat(resolved);
      const matchesType = entry.type === "file" ? metadata.isFile() : metadata.isDirectory();
      if (!matchesType) missing.push(entry.path);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "ENOENT" || code === "ENOTDIR") {
        missing.push(entry.path);
      } else {
        throw error;
      }
    }
  }
  return missing;
}

async function resolveDocsRoot(
  repositoryRoot: string,
  configuredDocsRoot: string | undefined,
): Promise<ResolvedDocsRoot> {
  const candidates = configuredDocsRoot ? [configuredDocsRoot] : ["Docs", "Docs.next"];
  const incomplete: string[] = [];

  for (const configuredCandidate of candidates) {
    const candidate = path.isAbsolute(configuredCandidate)
      ? path.normalize(configuredCandidate)
      : path.resolve(repositoryRoot, configuredCandidate);
    const missing = await missingDocsSpineEntries(repositoryRoot, candidate);
    const label = path.relative(repositoryRoot, candidate).split(path.sep).join("/") || ".";
    if (missing.length === 0) {
      return { label, path: await containedRealPath(repositoryRoot, candidate) };
    }
    incomplete.push(`${label} (missing ${missing.join(", ")})`);
  }

  const qualifier = configuredDocsRoot ? "Configured Docs root is incomplete" : "No complete Docs spine found";
  throw new Error(`${qualifier}: ${incomplete.join("; ")}.`);
}

function addDuplicateWarnings(
  items: Array<{ id: string }>,
  sourcePath: string,
  warnings: RegistryWarning[],
): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) {
      warnings.push({
        code: "duplicate_id",
        message: `Duplicate identifier ${item.id}.`,
        severity: "error",
        sourcePath,
      });
    }
    seen.add(item.id);
  }
}

function warning(
  warnings: RegistryWarning[],
  code: string,
  message: string,
  sourcePath: string,
  severity: RegistryWarning["severity"] = "warning",
): void {
  warnings.push({ code, message, severity, sourcePath });
}

const pendingMigrationStates = new Set(["pending", "pending-policy-review"]);

async function validateMigrationPaths(
  migration: MigrationRegistry,
  repositoryRoot: string,
  docsRoot: string,
  warnings: RegistryWarning[],
): Promise<void> {
  for (const entry of migration.entries) {
    for (const source of entry.sources) {
      if (source.startsWith("git:")) {
        const [, commit] = source.split(":", 3);
        if (commit !== migration.source_commit) {
          warning(
            warnings,
            "migration_source_commit_mismatch",
            `${entry.id} source ${source} does not use source_commit ${migration.source_commit}.`,
            "MIGRATION.yaml",
            "error",
          );
        }
        continue;
      }
      try {
        await containedRealPath(repositoryRoot, path.resolve(repositoryRoot, source));
      } catch (error) {
        if (["ENOENT", "ENOTDIR"].includes((error as NodeJS.ErrnoException).code ?? "")) {
          warning(
            warnings,
            "missing_migration_source",
            `${entry.id} references missing current source ${source}.`,
            "MIGRATION.yaml",
            "error",
          );
        } else {
          throw error;
        }
      }
    }
    try {
      await containedRealPath(docsRoot, path.resolve(docsRoot, entry.target));
    } catch (error) {
      if (["ENOENT", "ENOTDIR"].includes((error as NodeJS.ErrnoException).code ?? "")) {
        warning(
          warnings,
          "missing_migration_target",
          `${entry.id} references missing target ${entry.target}.`,
          "MIGRATION.yaml",
          "error",
        );
      } else {
        throw error;
      }
    }
  }
}

function validateWorkReferences(
  work: WorkItem[],
  fixes: FixItem[],
  specs: LoadedSpec[],
  warnings: RegistryWarning[],
): void {
  const workById = new Map(work.map((item) => [item.id, item]));
  const specByPath = new Map(specs.map((spec) => [spec.sourcePath, spec]));
  const specReferences = new Map<string, string[]>();

  for (const item of work) {
    if (
      item.spec === null &&
      item.kind !== "process" &&
      ["planning", "planned", "active", "complete"].includes(item.status)
    ) {
      warning(
        warnings,
        "missing_required_spec",
        `${item.id} is ${item.status} ${item.kind} work and must reference a specification. Only process work may advance without one.`,
        "WORK.yaml",
        "error",
      );
    }

    if (["planned", "active", "complete"].includes(item.status) && item.founder_approval !== "approved") {
      warning(
        warnings,
        "work_requires_founder_approval",
        `${item.id} is ${item.status} but founder_approval is not approved.`,
        "WORK.yaml",
        "error",
      );
    }

    if (["active", "complete"].includes(item.status) && item.evidence.length === 0) {
      warning(
        warnings,
        "work_requires_evidence",
        `${item.id} is ${item.status} but has no evidence.`,
        "WORK.yaml",
        "error",
      );
    }

    for (const dependency of item.dependencies) {
      if (dependency === item.id) {
        warning(
          warnings,
          "self_dependency",
          `${item.id} cannot depend on itself.`,
          "WORK.yaml",
          "error",
        );
        continue;
      }
      if (!workById.has(dependency)) {
        warning(
          warnings,
          "missing_dependency",
          `${item.id} depends on missing work item ${dependency}.`,
          "WORK.yaml",
          "error",
        );
      }
    }

    for (const blocker of item.blocked_by) {
      if (blocker === item.id) {
        warning(
          warnings,
          "self_blocker",
          `${item.id} cannot be blocked by itself.`,
          "WORK.yaml",
          "error",
        );
        continue;
      }
      if (!workById.has(blocker)) {
        warning(
          warnings,
          "missing_blocker",
          `${item.id} is blocked by missing work item ${blocker}.`,
          "WORK.yaml",
          "error",
        );
      } else if (workById.get(blocker)?.status === "complete") {
        warning(
          warnings,
          "completed_blocker",
          `${item.id} is blocked by completed work item ${blocker}. Remove the stale blocker.`,
          "WORK.yaml",
          "error",
        );
      }
    }

    if (item.status === "blocked" && item.blocked_by.length === 0) {
      warning(
        warnings,
        "blocked_without_blocker",
        `${item.id} is blocked but has no blocked_by entries.`,
        "WORK.yaml",
      );
    }

    if (item.spec) {
      specReferences.set(item.spec, [...(specReferences.get(item.spec) ?? []), item.id]);
      const spec = specByPath.get(item.spec);
      if (!spec) {
        warning(
          warnings,
          "missing_spec",
          `${item.id} references missing spec ${item.spec}.`,
          "WORK.yaml",
          "error",
        );
      } else {
        if (spec.metadata.id !== item.id) {
          warning(
            warnings,
            "spec_id_mismatch",
            `${item.spec} uses id ${spec.metadata.id}, while its owning work item uses ${item.id}.`,
            item.spec,
            "error",
          );
        }
        if (spec.metadata.area !== item.area) {
          warning(
            warnings,
            "spec_area_mismatch",
            `${item.spec} uses area ${spec.metadata.area}, while ${item.id} uses ${item.area}.`,
            item.spec,
            "error",
          );
        }
        if (spec.metadata.founder_review !== item.founder_approval) {
          warning(
            warnings,
            "founder_approval_mismatch",
            `${item.id} uses founder_approval ${item.founder_approval}, while ${item.spec} uses founder_review ${spec.metadata.founder_review}.`,
            item.spec,
            "error",
          );
        }

        const compatibleSpecStatuses: Record<WorkItem["status"], SpecFrontmatter["status"][]> = {
          open: ["draft"],
          planning: ["draft", "review"],
          planned: ["planned"],
          active: ["active"],
          blocked: ["draft", "review", "planned", "active"],
          deferred: ["draft", "review", "planned", "active"],
          complete: ["implemented", "superseded"],
        };
        if (!compatibleSpecStatuses[item.status].includes(spec.metadata.status)) {
          warning(
            warnings,
            "work_spec_lifecycle_mismatch",
            `${item.id} is ${item.status}, but ${item.spec} is ${spec.metadata.status}.`,
            item.spec,
            "error",
          );
        }

        if (
          ["planned", "active", "implemented", "superseded"].includes(spec.metadata.status) &&
          spec.metadata.founder_review !== "approved"
        ) {
          warning(
            warnings,
            "spec_requires_founder_approval",
            `${item.spec} is ${spec.metadata.status} but founder_review is not approved.`,
            item.spec,
            "error",
          );
        }
      }
    }
  }

  for (const fix of fixes) {
    if (["active", "complete"].includes(fix.status) && fix.evidence.length === 0) {
      warning(
        warnings,
        "fix_requires_evidence",
        `${fix.id} is ${fix.status} but has no evidence.`,
        "FIXES.yaml",
        "error",
      );
    }
    if (!workById.has(fix.related_work)) {
      warning(
        warnings,
        "missing_related_work",
        `${fix.id} references missing work item ${fix.related_work}.`,
        "FIXES.yaml",
        "error",
      );
    }
  }

  for (const spec of specs) {
    const references = specReferences.get(spec.sourcePath) ?? [];
    if (references.length === 0) {
      warning(
        warnings,
        "orphan_spec",
        `${spec.metadata.id} is not referenced by any WORK.yaml entry.`,
        spec.sourcePath,
        "error",
      );
    } else if (references.length > 1) {
      warning(
        warnings,
        "shared_spec",
        `${spec.metadata.id} is referenced by multiple work items: ${references.join(", ")}.`,
        spec.sourcePath,
        "error",
      );
    }
  }
}

function validateReferenceCycles(
  work: WorkItem[],
  field: "dependencies" | "blocked_by",
  code: "dependency_cycle" | "blocked_by_cycle",
  label: string,
  warnings: RegistryWarning[],
): void {
  const workById = new Map(work.map((item) => [item.id, item]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const reported = new Set<string>();

  function visit(id: string, trail: string[]): void {
    if (visiting.has(id)) {
      const cycleStart = trail.indexOf(id);
      const cycle = [...trail.slice(cycleStart), id];
      const key = [...new Set(cycle)].sort().join("|");
      if (!reported.has(key)) {
        reported.add(key);
        warning(
          warnings,
          code,
          `Work ${label} cycle: ${cycle.join(" -> ")}.`,
          "WORK.yaml",
          "error",
        );
      }
      return;
    }
    if (visited.has(id)) return;

    visiting.add(id);
    const item = workById.get(id);
    for (const reference of item?.[field] ?? []) {
      if (workById.has(reference)) visit(reference, [...trail, id]);
    }
    visiting.delete(id);
    visited.add(id);
  }

  for (const item of work) visit(item.id, []);
}

function projectRows(
  work: WorkItem[],
  fixes: FixItem[],
  specs: LoadedSpec[],
  migration: MigrationRegistry | null,
  sourceRoot: string,
): RegistryRow[] {
  const workRows: RegistryRow[] = work.map((item) => ({
    entity: "work",
    kind: item.kind,
    id: item.id,
    title: item.title,
    area: item.area,
    status: item.status,
    summary: item.summary,
    sourceRoot,
    sourcePath: "WORK.yaml",
    relatedWork: null,
    specPath: item.spec,
    nextAction: item.next_slice,
    blockedBy: item.blocked_by,
  }));
  const fixRows: RegistryRow[] = fixes.map((item) => ({
    entity: "fix",
    kind: "bug",
    id: item.id,
    title: item.title,
    area: item.area,
    status: item.status,
    summary: item.summary,
    sourceRoot,
    sourcePath: "FIXES.yaml",
    relatedWork: item.related_work,
    specPath: null,
    nextAction: item.reproduction ?? null,
    blockedBy: [],
  }));
  const specRows: RegistryRow[] = specs.map((item) => {
    const relatedWork = work.find((candidate) => candidate.spec === item.sourcePath);
    return {
      entity: "spec",
      kind: "spec",
      id: item.metadata.id,
      title: item.metadata.title,
      area: item.metadata.area,
      status: item.metadata.status,
      summary: relatedWork ? `Specification for ${relatedWork.title}.` : "Unlinked specification.",
      sourceRoot,
      sourcePath: item.sourcePath,
      relatedWork: relatedWork?.id ?? null,
      specPath: item.sourcePath,
      nextAction:
        item.metadata.founder_review === "required" ? "Founder review required." : null,
      blockedBy: [],
    };
  });
  const migrationRows: RegistryRow[] = (migration?.entries ?? []).map((item) => ({
    entity: "migration",
    kind: "migration",
    id: item.id,
    title: item.claim,
    area: item.domain,
    status: item.founder_decision_state,
    summary: `${item.source_classification} → ${item.target_disposition}`,
    sourceRoot,
    sourcePath: "MIGRATION.yaml",
    relatedWork: null,
    specPath: item.target.startsWith("Specs/") ? item.target : null,
    nextAction: pendingMigrationStates.has(item.founder_decision_state)
      ? `Founder disposition required: ${item.target_disposition}.`
      : item.target_disposition,
    blockedBy: [],
  }));

  return [...workRows, ...fixRows, ...specRows, ...migrationRows].sort((left, right) =>
    left.id.localeCompare(right.id) || left.entity.localeCompare(right.entity),
  );
}

async function loadSpecs(docsRoot: string): Promise<LoadedSpec[]> {
  const specsDirectory = path.join(docsRoot, "Specs");
  let entries;
  try {
    entries = await readdir(specsDirectory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const specs: LoadedSpec[] = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const candidate = path.join(specsDirectory, entry.name);
    const resolved = await containedRealPath(docsRoot, candidate);
    const sourcePath = path.posix.join("Specs", entry.name);
    specs.push({
      metadata: parseSpecFrontmatter(await readFile(resolved, "utf8"), sourcePath),
      sourcePath,
    });
  }
  return specs;
}

async function loadMigration(docsRoot: string): Promise<MigrationRegistry | null> {
  const migrationPath = path.join(docsRoot, "MIGRATION.yaml");
  try {
    const resolved = await containedRealPath(docsRoot, migrationPath);
    return parseMigrationRegistry(await readFile(resolved, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function loadRegistry(options: LoadRegistryOptions = {}): Promise<RegistrySnapshot> {
  const repositoryRoot = await realpath(options.repositoryRoot ?? defaultRepositoryRoot);
  const resolvedDocsRoot = await resolveDocsRoot(repositoryRoot, options.docsRoot);
  const docsRoot = resolvedDocsRoot.path;

  const workPath = await containedRealPath(docsRoot, path.join(docsRoot, "WORK.yaml"));
  const fixesPath = await containedRealPath(docsRoot, path.join(docsRoot, "FIXES.yaml"));
  const productPath = await containedRealPath(docsRoot, path.join(docsRoot, "PRODUCT.md"));
  const [workRegistry, fixRegistry, specs, migration] = await Promise.all([
    readFile(workPath, "utf8").then((source) => parseWorkRegistry(source, "WORK.yaml")),
    readFile(fixesPath, "utf8").then((source) => parseFixRegistry(source, "FIXES.yaml")),
    loadSpecs(docsRoot),
    loadMigration(docsRoot),
    readFile(productPath, "utf8").then((source) => parseProductFrontmatter(source)),
  ]);
  const migrationWarnings: RegistryWarning[] = [];
  if (migration) {
    await validateMigrationPaths(migration, repositoryRoot, docsRoot, migrationWarnings);
  }

  return buildRegistrySnapshot(
    workRegistry,
    fixRegistry,
    specs,
    migration,
    options.now,
    resolvedDocsRoot.label,
    migrationWarnings,
  );
}

export function buildRegistrySnapshot(
  workRegistry: WorkRegistry,
  fixRegistry: FixRegistry,
  specs: LoadedSpec[],
  migration: MigrationRegistry | null = null,
  now: () => Date = () => new Date(),
  sourceRoot = "Docs",
  initialWarnings: RegistryWarning[] = [],
): RegistrySnapshot {
  const warnings: RegistryWarning[] = [...initialWarnings];
  addDuplicateWarnings(workRegistry.work, "WORK.yaml", warnings);
  addDuplicateWarnings(fixRegistry.fixes, "FIXES.yaml", warnings);
  addDuplicateWarnings(
    specs.map((spec) => spec.metadata),
    "Specs",
    warnings,
  );
  if (migration) addDuplicateWarnings(migration.entries, "MIGRATION.yaml", warnings);
  validateWorkReferences(workRegistry.work, fixRegistry.fixes, specs, warnings);
  validateReferenceCycles(workRegistry.work, "dependencies", "dependency_cycle", "dependency", warnings);
  validateReferenceCycles(workRegistry.work, "blocked_by", "blocked_by_cycle", "blocked_by", warnings);
  warnings.sort(
    (left, right) =>
      left.severity.localeCompare(right.severity) ||
      left.sourcePath.localeCompare(right.sourcePath) ||
      left.code.localeCompare(right.code),
  );

  const errorCount = warnings.filter((item) => item.severity === "error").length;
  const pendingMigrationDecisions = (migration?.entries ?? []).filter((item) =>
    pendingMigrationStates.has(item.founder_decision_state),
  ).length;
  return {
    version: 1,
    generatedAt: now().toISOString(),
    sourceRoot,
    valid: errorCount === 0,
    migrationPresent: migration !== null,
    migrationReady: migration !== null && errorCount === 0 && pendingMigrationDecisions === 0,
    rows: projectRows(workRegistry.work, fixRegistry.fixes, specs, migration, sourceRoot),
    warnings,
    counts: {
      work: workRegistry.work.length,
      fixes: fixRegistry.fixes.length,
      specs: specs.length,
      migrations: migration?.entries.length ?? 0,
      pendingMigrationDecisions,
      errors: errorCount,
      warnings: warnings.length - errorCount,
    },
  };
}
