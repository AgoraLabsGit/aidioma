import { mkdir, readdir, readFile, realpath, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { readGitStatus, type GitStatus } from "./git.js";
import {
  ParseError,
  parseDecisions,
  parseFixes,
  parseFrontmatter,
  parseReleases,
  parseResearchFrontmatter,
  parseSpecFrontmatter,
  type DecisionEntry,
  type ReleaseEntry,
} from "./parser.js";
import {
  phaseSchema,
  type FixItem,
  type PhaseFrontmatter,
  type ResearchFrontmatter,
  type SpecFrontmatter,
} from "./schema.js";

const defaultRepositoryRoot = fileURLToPath(new URL("../..", import.meta.url));

export type IssueSeverity = "high" | "medium" | "low";
export type IssueKind =
  | "fix"
  | "blocked"
  | "contested"
  | "broken_link"
  | "parse_error"
  | "drift"
  | "unspecified"
  | "dead_spec"
  | "stale_research";

export type IndexIssue = {
  kind: IssueKind;
  ref: string;
  summary: string;
  spec: string | null;
  age_days: number | null;
  severity: IssueSeverity;
};

export type ActivityEvent = {
  ts: string;
  type: string;
  actor: string;
  cmd: string;
  phase: string | null;
  ref: string | null;
  status: string;
  duration_s: number | null;
  summary: string;
};

export type ProjectedPhase = PhaseFrontmatter & {
  age_days: number;
  activity_count: number;
  sourcePath: string;
};

export type ProjectedSpec = SpecFrontmatter & {
  used_by: string[];
  blast_radius: number;
  drift_days: number | null;
  file_count: number | null;
  sourcePath: string;
};

export type ProjectedResearch = ResearchFrontmatter & {
  age_days: number;
  sourcePath: string;
};

export type ProjectedFix = FixItem & {
  age_days: number;
};

export type DeriveIndex = {
  indexed_at: string;
  paths_scanned_at: string | null;
  repo: GitStatus;
  phases: ProjectedPhase[];
  specs: ProjectedSpec[];
  decisions: DecisionEntry[];
  research: ProjectedResearch[];
  fixes: ProjectedFix[];
  releases: ReleaseEntry[];
  activity: {
    current_month: ActivityEvent[];
    months: string[];
    total: number;
  };
  issues: IndexIssue[];
  handoff: { updated_at: string | null; body: string };
  last_check: { status: string | null; ts: string | null };
  in_production: { release: string | null; date: string | null };
  next_command: string | null;
  product: { body: string };
  blocked_reason: string | null;
  active_proof_checklist: string[];
};

export type DeriveOptions = {
  repositoryRoot?: string;
  docsRoot?: string;
  now?: () => Date;
  writeIndex?: boolean;
};

function isContained(parent: string, candidate: string): boolean {
  const relative = path.relative(parent, candidate);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))
  );
}

async function containedRealPath(repositoryRoot: string, candidate: string): Promise<string> {
  const resolved = await realpath(candidate);
  if (!isContained(repositoryRoot, resolved)) {
    throw new Error(`Path must remain inside the repository: ${candidate}`);
  }
  return resolved;
}

function dayDiff(from: string, now: Date): number {
  const start = Date.parse(`${from}T00:00:00.000Z`);
  if (Number.isNaN(start)) return 0;
  const ms = now.getTime() - start;
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function listMarkdownFiles(directory: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => path.join(directory, entry.name))
      .sort((left, right) => left.localeCompare(right));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function listMarkdownRecursive(directory: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(current: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
      throw error;
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
    }
  }
  await walk(directory);
  return out;
}

async function readOptional(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function addParseIssue(issues: IndexIssue[], sourcePath: string, summary: string): void {
  issues.push({
    kind: "parse_error",
    ref: sourcePath,
    summary,
    spec: null,
    age_days: null,
    severity: "high",
  });
}

function suggestNextCommand(
  phases: PhaseFrontmatter[],
  git: GitStatus,
  blockedReason: string | null,
): string | null {
  const active = phases.find((phase) => phase.state === "active");
  const blocked = phases.find((phase) => phase.state === "blocked");
  if (blocked && !active) return null;
  if (blockedReason && active?.state === "blocked") return null;
  if (!active) {
    if (phases.some((phase) => phase.state === "ready")) return "/run";
    return "/plan";
  }
  if (active.state === "blocked") return null;
  // Proof capture is human-declared; without that signal, keep suggesting /run.
  if (git.clean) return "/run";
  return "/run";
}

function extractBlockedReason(body: string): string | null {
  const match = body.match(/##\s*Context\s*\n+([\s\S]*?)(?:\n##\s|\n*$)/u);
  return match?.[1]?.trim() || null;
}

function extractProofChecklist(body: string): string[] {
  const match = body.match(/##\s*Proof\s*\n+([\s\S]*?)(?:\n##\s|\n*$)/u);
  if (!match) return [];
  return match[1]!
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- ["));
}

async function loadActivity(
  repositoryRoot: string,
  now: Date,
): Promise<DeriveIndex["activity"]> {
  const activityDir = path.join(repositoryRoot, ".work", "activity");
  let files: string[] = [];
  try {
    files = (await readdir(activityDir))
      .filter((name) => /^\d{4}-\d{2}\.jsonl$/u.test(name))
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { current_month: [], months: [], total: 0 };
    }
    throw error;
  }

  const months = files.map((name) => name.replace(/\.jsonl$/u, ""));
  const current = monthKey(now);
  const currentFile = path.join(activityDir, `${current}.jsonl`);
  const raw = await readOptional(currentFile);
  const current_month: ActivityEvent[] = [];
  if (raw) {
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line) as ActivityEvent;
        current_month.push(parsed);
      } catch {
        // Skip malformed activity lines; they surface elsewhere if needed.
      }
    }
  }
  current_month.sort((left, right) => right.ts.localeCompare(left.ts));

  let total = 0;
  for (const file of files) {
    const content = await readFile(path.join(activityDir, file), "utf8");
    total += content.split("\n").filter((line) => line.trim()).length;
  }

  return { current_month, months, total };
}

export async function derive(options: DeriveOptions = {}): Promise<DeriveIndex> {
  const now = options.now?.() ?? new Date();
  const repositoryRoot = await realpath(options.repositoryRoot ?? defaultRepositoryRoot);
  const docsCandidate = options.docsRoot
    ? path.isAbsolute(options.docsRoot)
      ? options.docsRoot
      : path.resolve(repositoryRoot, options.docsRoot)
    : path.join(repositoryRoot, "Docs");
  const docsRoot = await containedRealPath(repositoryRoot, docsCandidate);

  const issues: IndexIssue[] = [];
  const phases: ProjectedPhase[] = [];
  const specs: ProjectedSpec[] = [];
  const research: ProjectedResearch[] = [];
  let decisions: DecisionEntry[] = [];
  let fixes: ProjectedFix[] = [];
  let releases: ReleaseEntry[] = [];
  let handoffBody = "";
  let handoffUpdatedAt: string | null = null;
  let productBody = "";
  let blockedReason: string | null = null;
  const phaseBodies = new Map<string, string>();

  const phaseFiles = await listMarkdownFiles(path.join(docsRoot, "Roadmap", "Phases"));
  for (const filePath of phaseFiles) {
    const relative = path.relative(docsRoot, filePath).split(path.sep).join("/");
    if (path.basename(filePath) === ".gitkeep") continue;
    try {
      const source = await readFile(filePath, "utf8");
      const { data, body } = parseFrontmatter(
        source,
        relative,
        phaseSchema as import("zod").ZodType<PhaseFrontmatter>,
      );
      phaseBodies.set(data.id, body);
      if (data.state === "blocked") {
        blockedReason = extractBlockedReason(body);
      }
      phases.push({
        ...data,
        age_days: dayDiff(data.opened, now),
        activity_count: 0,
        sourcePath: relative,
      });
    } catch (error) {
      const summary =
        error instanceof ParseError
          ? error.details.join("; ")
          : error instanceof Error
            ? error.message
            : "Unknown parse error";
      addParseIssue(issues, relative, summary);
    }
  }

  const specFiles = [
    ...(await listMarkdownRecursive(path.join(docsRoot, "Specs", "Features"))),
    ...(await listMarkdownRecursive(path.join(docsRoot, "Specs", "Areas"))),
  ];
  for (const filePath of specFiles) {
    const relative = path.relative(docsRoot, filePath).split(path.sep).join("/");
    try {
      const source = await readFile(filePath, "utf8");
      const data = parseSpecFrontmatter(source, relative);
      specs.push({
        ...data,
        depends_on: data.depends_on ?? [],
        used_by: [],
        blast_radius: 0,
        drift_days: null,
        file_count: null,
        sourcePath: relative,
      });
    } catch (error) {
      const summary =
        error instanceof ParseError
          ? error.details.join("; ")
          : error instanceof Error
            ? error.message
            : "Unknown parse error";
      addParseIssue(issues, relative, summary);
    }
  }

  const researchFiles = await listMarkdownFiles(path.join(docsRoot, "Research"));
  for (const filePath of researchFiles) {
    const relative = path.relative(docsRoot, filePath).split(path.sep).join("/");
    try {
      const source = await readFile(filePath, "utf8");
      const data = parseResearchFrontmatter(source, relative);
      const age = dayDiff(data.date, now);
      research.push({ ...data, age_days: age, sourcePath: relative });
      if (age > 90 && data.status === "fresh") {
        issues.push({
          kind: "stale_research",
          ref: data.id,
          summary: `${data.id} is older than 90 days`,
          spec: data.affects[0] ?? null,
          age_days: age,
          severity: "low",
        });
      }
    } catch (error) {
      const summary =
        error instanceof ParseError
          ? error.details.join("; ")
          : error instanceof Error
            ? error.message
            : "Unknown parse error";
      addParseIssue(issues, relative, summary);
    }
  }

  const decisionsSource = await readOptional(path.join(docsRoot, "DECISIONS.md"));
  if (decisionsSource) {
    const parsed = parseDecisions(decisionsSource, "DECISIONS.md");
    decisions = parsed.decisions;
    for (const error of parsed.errors) {
      addParseIssue(issues, "DECISIONS.md", error);
    }
  }

  const fixesSource = await readOptional(path.join(docsRoot, "FIXES.yaml"));
  if (fixesSource !== null) {
    try {
      const parsed = parseFixes(fixesSource, "FIXES.yaml");
      fixes = parsed.map((item) => ({ ...item, age_days: dayDiff(item.opened, now) }));
      for (const item of fixes) {
        if (item.status === "open") {
          issues.push({
            kind: "fix",
            ref: item.id,
            summary: item.summary,
            spec: item.spec,
            age_days: item.age_days,
            severity: "high",
          });
        }
      }
    } catch (error) {
      const summary =
        error instanceof ParseError
          ? error.details.join("; ")
          : error instanceof Error
            ? error.message
            : "Unknown parse error";
      addParseIssue(issues, "FIXES.yaml", summary);
    }
  }

  const releasesSource = await readOptional(path.join(docsRoot, "RELEASES.md"));
  if (releasesSource) releases = parseReleases(releasesSource);

  const handoffPath = path.join(docsRoot, "Handoffs", "HANDOFF.md");
  const handoffSource = await readOptional(handoffPath);
  if (handoffSource !== null) {
    handoffBody = handoffSource;
    try {
      const metadata = await stat(handoffPath);
      handoffUpdatedAt = metadata.mtime.toISOString();
    } catch {
      handoffUpdatedAt = null;
    }
  }

  const productSource = await readOptional(path.join(docsRoot, "PRODUCT.md"));
  if (productSource) {
    productBody = productSource.replace(/^---[\s\S]*?\n---\n?/u, "").trim();
  }

  // Reverse depends_on → used_by / blast_radius
  const usedBy = new Map<string, string[]>();
  for (const spec of specs) {
    for (const dependency of spec.depends_on ?? []) {
      usedBy.set(dependency, [...(usedBy.get(dependency) ?? []), spec.id]);
    }
  }
  for (const spec of specs) {
    const dependents = usedBy.get(spec.id) ?? [];
    spec.used_by = dependents;
    spec.blast_radius = spec.kind === "area" ? dependents.length : 0;
    if (spec.status === "contested") {
      issues.push({
        kind: "contested",
        ref: spec.id,
        summary: `${spec.id} is contested`,
        spec: spec.id,
        age_days: null,
        severity: "high",
      });
    }
  }

  const phaseIds = new Set(phases.map((phase) => phase.id));
  const specIds = new Set(specs.map((spec) => spec.id));
  const decisionIds = new Set(decisions.map((decision) => decision.id));
  const researchIds = new Set(research.map((item) => item.id));

  for (const phase of phases) {
    for (const dependency of phase.depends_on) {
      if (!phaseIds.has(dependency)) {
        issues.push({
          kind: "broken_link",
          ref: phase.id,
          summary: `${phase.id} depends_on missing ${dependency}`,
          spec: null,
          age_days: phase.age_days,
          severity: "high",
        });
      }
    }
    for (const specId of phase.amends_specs) {
      if (!specIds.has(specId)) {
        issues.push({
          kind: "broken_link",
          ref: phase.id,
          summary: `${phase.id} amends_specs missing ${specId}`,
          spec: specId,
          age_days: phase.age_days,
          severity: "high",
        });
      }
    }
    if (phase.state === "blocked") {
      issues.push({
        kind: "blocked",
        ref: phase.id,
        summary: blockedReason ?? `${phase.id} is blocked`,
        spec: null,
        age_days: phase.age_days,
        severity: "high",
      });
    }
  }

  for (const spec of specs) {
    for (const dependency of spec.depends_on ?? []) {
      if (!specIds.has(dependency)) {
        issues.push({
          kind: "broken_link",
          ref: spec.id,
          summary: `${spec.id} depends_on missing ${dependency}`,
          spec: spec.id,
          age_days: null,
          severity: "high",
        });
      }
    }
    for (const decisionId of spec.decisions) {
      if (!decisionIds.has(decisionId)) {
        issues.push({
          kind: "broken_link",
          ref: spec.id,
          summary: `${spec.id} decisions missing ${decisionId}`,
          spec: spec.id,
          age_days: null,
          severity: "high",
        });
      }
    }
    for (const researchId of spec.research) {
      if (!researchIds.has(researchId)) {
        issues.push({
          kind: "broken_link",
          ref: spec.id,
          summary: `${spec.id} research missing ${researchId}`,
          spec: spec.id,
          age_days: null,
          severity: "high",
        });
      }
    }
  }

  for (const decision of decisions) {
    for (const specId of decision.affects) {
      if (!specIds.has(specId)) {
        issues.push({
          kind: "broken_link",
          ref: decision.id,
          summary: `${decision.id} affects missing ${specId}`,
          spec: specId,
          age_days: dayDiff(decision.date, now),
          severity: "high",
        });
      }
    }
  }

  const activity = await loadActivity(repositoryRoot, now);
  const activityByPhase = new Map<string, number>();
  for (const event of activity.current_month) {
    if (!event.phase) continue;
    activityByPhase.set(event.phase, (activityByPhase.get(event.phase) ?? 0) + 1);
  }
  // Count older months cheaply from current file only for V1 fast cycle.
  for (const phase of phases) {
    phase.activity_count = activityByPhase.get(phase.id) ?? 0;
  }

  const repo = await readGitStatus(repositoryRoot);
  const sortedPhases = [...phases].sort((left, right) => left.order - right.order);
  const next_command = suggestNextCommand(sortedPhases, repo, blockedReason);
  const latestRelease = [...releases].sort((left, right) => right.date.localeCompare(left.date))[0];

  const severityRank: Record<IssueSeverity, number> = { high: 0, medium: 1, low: 2 };
  issues.sort(
    (left, right) =>
      severityRank[left.severity] - severityRank[right.severity] ||
      (right.age_days ?? -1) - (left.age_days ?? -1) ||
      left.ref.localeCompare(right.ref),
  );

  const index: DeriveIndex = {
    indexed_at: now.toISOString(),
    paths_scanned_at: null,
    repo,
    phases: sortedPhases,
    specs,
    decisions,
    research,
    fixes,
    releases,
    activity,
    issues,
    handoff: { updated_at: handoffUpdatedAt, body: handoffBody },
    last_check: { status: null, ts: null },
    in_production: {
      release: latestRelease?.id ?? null,
      date: latestRelease?.date ?? null,
    },
    next_command,
    product: { body: productBody },
    blocked_reason: blockedReason,
    active_proof_checklist: (() => {
      const active = sortedPhases.find((phase) => phase.state === "active");
      if (!active) return [];
      return extractProofChecklist(phaseBodies.get(active.id) ?? "");
    })(),
  };

  if (options.writeIndex !== false) {
    const workDir = path.join(repositoryRoot, ".work");
    await mkdir(workDir, { recursive: true });
    await writeFile(path.join(workDir, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
  }

  return index;
}

/** Scoped agent boot manifest — subset of derive(). */
export async function writeContextJson(
  index: DeriveIndex,
  repositoryRoot?: string,
): Promise<void> {
  const root = repositoryRoot ?? defaultRepositoryRoot;
  const active = index.phases.find((phase) => phase.state === "active") ?? null;
  const ready = index.phases.find((phase) => phase.state === "ready") ?? null;
  const context = {
    generated_at: index.indexed_at,
    schema_version: 3,
    active_phase: active
      ? {
          id: active.id,
          title: active.title,
          state: active.state,
          type: active.type,
          outcome: active.outcome,
          sourcePath: active.sourcePath,
        }
      : null,
    next_phase: ready
      ? { id: ready.id, title: ready.title, state: ready.state }
      : null,
    next_command: index.next_command,
    repo: index.repo,
    open_issues: index.issues.filter((issue) => issue.severity === "high").length,
    do_not_load: [".work/activity/**", "Docs.2/**"],
  };
  await mkdir(path.join(root, ".work"), { recursive: true });
  await writeFile(path.join(root, ".work", "context.json"), `${JSON.stringify(context, null, 2)}\n`);
}

export type { PhaseFrontmatter, SpecFrontmatter, ResearchFrontmatter, FixItem };
