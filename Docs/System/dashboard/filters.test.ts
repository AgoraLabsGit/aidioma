import { describe, expect, it } from "vitest";

/**
 * Predicate contracts mirroring Docs/System/dashboard/public/app.js filters.
 * If UI filter wiring drifts, update both sides in the same change.
 */

type Phase = {
  id: string;
  title: string;
  type: string;
  state: string;
  order: number;
  age_days: number;
  feature?: string | null;
  area?: string | null;
  outcome?: string;
};
type Event = { ts: string; type: string; actor: string; phase: string | null; ref: string | null; summary: string; cmd?: string };
type Signal = { kind: string; ref: string; summary: string; spec: string | null; severity: string; status: string; age_days: number | null };
type Work = { id: string; kind: string; summary: string; status: string; feature: string | null; area: string | null; age_days: number };

function matchesQuery(haystack: string, q: string): boolean {
  if (!q) return true;
  return haystack.toLowerCase().includes(q.toLowerCase());
}

function matchesSpecFilter(value: string | null | undefined, filter: string): boolean {
  if (!filter) return true;
  if (filter === "__none__") return value == null || value === "";
  return value === filter;
}

function filterPhases(
  phases: Phase[],
  filters: { state: string; type: string; feature?: string; area?: string; q: string },
): Phase[] {
  return phases
    .filter((phase) => (!filters.state || phase.state === filters.state) && (!filters.type || phase.type === filters.type))
    .filter((phase) => matchesSpecFilter(phase.feature, filters.feature ?? "") && matchesSpecFilter(phase.area, filters.area ?? ""))
    .filter((phase) => matchesQuery(`${phase.id} ${phase.title}`, filters.q));
}

/** Mirrors Activity page process spine in public/app.js (D-023). */
const ACTIVITY_PROCESS_ALWAYS = ["handoff", "close", "check", "ship"];
const ACTIVITY_PROCESS_OPTIONAL = ["launch", "dashboard", "status", "triage", "system"];
const ACTIVITY_PROCESS_ALLOWLIST = [...ACTIVITY_PROCESS_ALWAYS, ...ACTIVITY_PROCESS_OPTIONAL];

function filterActivityPageEvents(events: Event[], type: string): Event[] {
  const scoped = events.filter((event) => ACTIVITY_PROCESS_ALLOWLIST.includes(event.type));
  if (!type) return scoped.filter((event) => ACTIVITY_PROCESS_ALWAYS.includes(event.type));
  if (!ACTIVITY_PROCESS_ALLOWLIST.includes(type)) return [];
  return scoped.filter((event) => event.type === type);
}

function filterEvents(
  events: Event[],
  filters: { actor: string; type: string; phase: string; q: string },
): Event[] {
  return filterActivityPageEvents(events, filters.type)
    .filter((event) => !filters.actor || event.actor === filters.actor)
    .filter((event) => !filters.phase || event.phase === filters.phase)
    .filter((event) =>
      matchesQuery(`${event.type} ${event.summary} ${event.ref ?? ""} ${event.phase ?? ""} ${event.cmd ?? ""}`, filters.q),
    );
}

function featureAreaFromSpecId(specId: string | null): { feature: string | null; area: string | null } {
  if (!specId) return { feature: null, area: null };
  if (specId.startsWith("SPEC-A-")) return { feature: null, area: specId };
  if (specId.startsWith("SPEC-F-")) return { feature: specId, area: null };
  return { feature: specId, area: null };
}

/** Mirrors activityTags() in public/app.js */
function activityTags(
  index: { phases?: Phase[]; work?: Work[] },
  event: { phase?: string | null; ref?: string | null },
): { feature: string | null; area: string | null } {
  const phaseId = event.phase ?? null;
  if (phaseId) {
    const phase = (index.phases ?? []).find((row) => row.id === phaseId);
    if (phase) return { feature: phase.feature ?? null, area: phase.area ?? null };
  }
  const ref = event.ref ?? null;
  if (ref) {
    const work = (index.work ?? []).find((row) => row.id === ref);
    if (work) return { feature: work.feature ?? null, area: work.area ?? null };
    const phase = (index.phases ?? []).find((row) => row.id === ref);
    if (phase) return { feature: phase.feature ?? null, area: phase.area ?? null };
  }
  return { feature: null, area: null };
}

function filterSignals(
  signals: Signal[],
  filters: { severity: string; kind: string; status: string; feature?: string; area?: string; q: string },
): Signal[] {
  return signals
    .filter((issue) => !filters.severity || issue.severity === filters.severity)
    .filter((issue) => !filters.kind || issue.kind === filters.kind)
    .filter((issue) => !filters.status || issue.status === filters.status)
    .filter((issue) => {
      const tags = featureAreaFromSpecId(issue.spec);
      return matchesSpecFilter(tags.feature, filters.feature ?? "") && matchesSpecFilter(tags.area, filters.area ?? "");
    })
    .filter((issue) =>
      matchesQuery(`${issue.kind} ${issue.ref} ${issue.summary} ${issue.spec ?? ""} ${issue.status}`, filters.q),
    );
}

function workBucket(status: string): "open" | "closed" {
  return status === "open" || status === "active" ? "open" : "closed";
}

function filterWork(
  rows: Work[],
  filters: { kind: string; status: string; feature?: string; area?: string; q: string },
): Work[] {
  return rows
    .filter((row) => !filters.kind || row.kind === filters.kind)
    .filter((row) => !filters.status || workBucket(row.status) === filters.status)
    .filter((row) => matchesSpecFilter(row.feature, filters.feature ?? "") && matchesSpecFilter(row.area, filters.area ?? ""))
    .filter((row) =>
      matchesQuery(
        `${row.id} ${row.kind} ${row.summary} ${row.status} ${row.feature ?? ""} ${row.area ?? ""}`,
        filters.q,
      ),
    );
}

const DEFAULT_FILTERS = {
  roadmap: { state: "", type: "", feature: "", area: "", q: "", sort: "schedule", sortDir: "asc" },
  activity: { type: "", feature: "", area: "", q: "", sort: "time", sortDir: "desc" },
  work: { kind: "", status: "", feature: "", area: "", q: "", sort: "age", sortDir: "desc" },
  signals: { severity: "", kind: "", status: "open", feature: "", area: "", q: "", sort: "severity", sortDir: "asc" },
} as const;

function filtersAreDefault(page: keyof typeof DEFAULT_FILTERS, filters: Record<string, string>): boolean {
  const defaults = DEFAULT_FILTERS[page];
  return Object.keys(defaults).every((key) => (filters[key] ?? "") === (defaults as Record<string, string>)[key]);
}

function workBucketRank(status: string): number {
  return workBucket(status) === "open" ? 0 : 1;
}

/** Asc = older first via age_days (higher age_days = older). orient(desc) ⇒ newest first. */
function sortWork(rows: Work[], sort: string, sortDir = "asc"): Work[] {
  const orient = (cmp: number) => (cmp === 0 ? 0 : sortDir === "asc" ? cmp : -cmp);
  return [...rows].sort((left, right) => {
    let cmp = 0;
    if (sort === "kind") {
      cmp = workBucketRank(left.status) - workBucketRank(right.status)
        || left.kind.localeCompare(right.kind)
        || right.age_days - left.age_days;
    } else if (sort === "status") {
      cmp = workBucketRank(left.status) - workBucketRank(right.status)
        || left.status.localeCompare(right.status)
        || right.age_days - left.age_days;
    } else if (sort === "id") {
      cmp = workBucketRank(left.status) - workBucketRank(right.status) || left.id.localeCompare(right.id);
    } else if (sort === "age") {
      cmp = right.age_days - left.age_days;
    } else {
      // open-first legacy
      cmp = workBucketRank(left.status) - workBucketRank(right.status) || right.age_days - left.age_days;
    }
    return orient(cmp);
  });
}

function stateRank(value: string): number {
  return ({ active: 0, blocked: 1, ready: 2, proposed: 3, closed: 4, canceled: 5 } as Record<string, number>)[value] ?? 9;
}

function sortPhases(rows: Phase[], sort: string): Phase[] {
  return [...rows].sort((left, right) => {
    if (sort === "schedule") {
      const leftActive = left.state === "active" ? 0 : 1;
      const rightActive = right.state === "active" ? 0 : 1;
      return leftActive - rightActive || left.order - right.order || left.id.localeCompare(right.id);
    }
    if (sort === "order") return left.order - right.order;
    if (sort === "age") return right.age_days - left.age_days;
    if (sort === "title") return left.title.localeCompare(right.title);
    if (sort === "type") return left.type.localeCompare(right.type) || left.order - right.order;
    if (sort === "feature") {
      return String(left.feature ?? "").localeCompare(String(right.feature ?? "")) || left.order - right.order;
    }
    if (sort === "area") {
      return String(left.area ?? "").localeCompare(String(right.area ?? "")) || left.order - right.order;
    }
    return stateRank(left.state) - stateRank(right.state) || left.order - right.order;
  });
}

function sortEvents(rows: Event[], sort: string): Event[] {
  return [...rows].sort((left, right) => {
    if (sort === "type") return left.type.localeCompare(right.type) || right.ts.localeCompare(left.ts);
    if (sort === "phase") {
      return String(left.phase ?? "").localeCompare(String(right.phase ?? "")) || right.ts.localeCompare(left.ts);
    }
    return right.ts.localeCompare(left.ts);
  });
}

function sortSignals(rows: Signal[], sort: string): Signal[] {
  const severityRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
  return [...rows].sort((left, right) => {
    if (sort === "age") return (right.age_days ?? 0) - (left.age_days ?? 0);
    if (sort === "kind") return left.kind.localeCompare(right.kind);
    if (sort === "status") {
      return left.status.localeCompare(right.status) || (right.age_days ?? 0) - (left.age_days ?? 0);
    }
    return (severityRank[left.severity] ?? 9) - (severityRank[right.severity] ?? 9)
      || (right.age_days ?? 0) - (left.age_days ?? 0);
  });
}

/** Header column → sort key (mirrors TABLE_SORT_KEYS in app.js). */
const TABLE_SORT_KEYS = {
  roadmap: {
    id: "schedule",
    order: "schedule",
    kind: "type",
    feature: "feature",
    area: "area",
    status: "state",
    age: "age",
  },
  activity: {
    id: "id",
    kind: "type",
    feature: "feature",
    area: "area",
    status: "status",
    age: "time",
  },
  work: {
    id: "id",
    kind: "kind",
    feature: "feature",
    area: "area",
    status: "status",
    age: "age",
  },
  signals: {
    id: "id",
    kind: "kind",
    feature: "feature",
    area: "area",
    status: "status",
    age: "age",
  },
} as const;

const phases: Phase[] = [
  { id: "PHASE-004", title: "Dash", type: "build", state: "active", order: 2, age_days: 1, feature: "SPEC-F-DEV-DASHBOARD", area: "SPEC-A-DEVSYSTEM" },
  { id: "PHASE-002", title: "Product", type: "design", state: "proposed", order: 3, age_days: 1, feature: "SPEC-F-LEXICON", area: "SPEC-A-CONTENT" },
  { id: "PHASE-001", title: "Old", type: "build", state: "closed", order: 1, age_days: 2, feature: null, area: null },
];

const events: Event[] = [
  { ts: "2026-08-05T10:00:00Z", type: "build", actor: "agent", phase: "PHASE-004", ref: "PHASE-004", summary: "Activated" },
  { ts: "2026-08-05T11:00:00Z", type: "plan", actor: "agent", phase: "PHASE-004", ref: "PHASE-004", summary: "Proposed" },
  { ts: "2026-08-05T12:00:00Z", type: "close", actor: "user", phase: "PHASE-001", ref: "PHASE-001", summary: "Closed" },
  { ts: "2026-08-05T12:30:00Z", type: "check", actor: "agent", phase: "PHASE-001", ref: "PHASE-001", summary: "Tests green" },
  { ts: "2026-08-05T13:00:00Z", type: "handoff", actor: "agent", phase: null, ref: null, summary: "Session handoff" },
  { ts: "2026-08-05T13:30:00Z", type: "dashboard", actor: "agent", phase: null, ref: null, summary: "Opened dashboard" },
  { ts: "2026-08-05T14:00:00Z", type: "fix", actor: "agent", phase: null, ref: "F-001", summary: "Fixed bug" },
];

const signals: Signal[] = [
  { kind: "parse_error", ref: "x.md", summary: "bad", spec: null, severity: "high", status: "open", age_days: null },
  { kind: "drift", ref: "SPEC-F-X", summary: "drifted", spec: "SPEC-F-X", severity: "medium", status: "open", age_days: 2 },
  { kind: "broken_link", ref: "PHASE-001", summary: "missing", spec: null, severity: "high", status: "open", age_days: 1 },
];

const work: Work[] = [
  { id: "W-001", kind: "fix", summary: "A", status: "done", feature: "SPEC-F-DEV-DASHBOARD", area: "SPEC-A-DEVSYSTEM", age_days: 1 },
  { id: "W-003", kind: "task", summary: "B", status: "open", feature: "SPEC-F-LEXICON", area: "SPEC-A-CONTENT", age_days: 0 },
  { id: "W-004", kind: "proposal", summary: "C", status: "active", feature: null, area: null, age_days: 0 },
];

describe("Roadmap filters", () => {
  it("filters by state and type enums (build, not implementation)", () => {
    expect(filterPhases(phases, { state: "active", type: "", q: "" }).map((p) => p.id)).toEqual(["PHASE-004"]);
    expect(filterPhases(phases, { state: "", type: "build", q: "" }).map((p) => p.id)).toEqual([
      "PHASE-004",
      "PHASE-001",
    ]);
    expect(filterPhases(phases, { state: "", type: "design", q: "" }).map((p) => p.id)).toEqual(["PHASE-002"]);
    expect(filterPhases(phases, { state: "ready", type: "", q: "" })).toEqual([]);
    expect(filterPhases(phases, { state: "canceled", type: "", q: "" })).toEqual([]);
  });

  it("searches id and title", () => {
    expect(filterPhases(phases, { state: "", type: "", q: "product" }).map((p) => p.id)).toEqual(["PHASE-002"]);
  });
});

describe("Activity filters", () => {
  it("D-023: default All is process always-set; excludes outcome types", () => {
    expect(filterEvents(events, { actor: "", type: "", phase: "", q: "" }).map((e) => e.type).sort()).toEqual([
      "check",
      "close",
      "handoff",
    ]);
    expect(filterEvents(events, { actor: "", type: "", phase: "", q: "" }).some((e) => e.type === "build")).toBe(false);
    expect(filterEvents(events, { actor: "", type: "", phase: "", q: "" }).some((e) => e.type === "fix")).toBe(false);
    expect(filterEvents(events, { actor: "", type: "", phase: "", q: "" }).some((e) => e.type === "dashboard")).toBe(false);
  });

  it("optional process chips work; outcome type chips yield nothing", () => {
    expect(filterEvents(events, { actor: "", type: "dashboard", phase: "", q: "" }).map((e) => e.type)).toEqual([
      "dashboard",
    ]);
    expect(filterEvents(events, { actor: "", type: "build", phase: "", q: "" })).toHaveLength(0);
    expect(filterEvents(events, { actor: "user", type: "", phase: "", q: "" }).map((e) => e.type)).toEqual(["close"]);
    expect(filterEvents(events, { actor: "", type: "", phase: "PHASE-001", q: "" }).map((e) => e.type).sort()).toEqual([
      "check",
      "close",
    ]);
    expect(filterEvents(events, { actor: "", type: "", phase: "", q: "handoff" })).toHaveLength(1);
  });
});

describe("Signals filters", () => {
  it("filters severity, kind, status (derived health only)", () => {
    expect(filterSignals(signals, { severity: "", kind: "", status: "", q: "" }).map((i) => i.ref)).toEqual([
      "x.md",
      "SPEC-F-X",
      "PHASE-001",
    ]);
    expect(filterSignals(signals, { severity: "high", kind: "", status: "open", q: "" }).map((i) => i.ref)).toEqual([
      "x.md",
      "PHASE-001",
    ]);
    expect(filterSignals(signals, { severity: "", kind: "drift", status: "", q: "" }).map((i) => i.ref)).toEqual([
      "SPEC-F-X",
    ]);
  });
});

describe("Work filters", () => {
  it("Open includes open+active; Closed includes done/promoted/dropped", () => {
    expect(filterWork(work, { kind: "", status: "", q: "" }).map((w) => w.id)).toEqual([
      "W-001",
      "W-003",
      "W-004",
    ]);
    expect(filterWork(work, { kind: "", status: "open", q: "" }).map((w) => w.id)).toEqual([
      "W-003",
      "W-004",
    ]);
    expect(filterWork(work, { kind: "", status: "closed", q: "" }).map((w) => w.id)).toEqual(["W-001"]);
    expect(filterWork(work, { kind: "proposal", status: "", q: "" }).map((w) => w.id)).toEqual(["W-004"]);
  });

  it("default Age desc is newest-first", () => {
    expect(DEFAULT_FILTERS.work.sort).toBe("age");
    expect(DEFAULT_FILTERS.work.sortDir).toBe("desc");
    expect(sortWork(work, "age", "desc").map((w) => w.id)).toEqual(["W-003", "W-004", "W-001"]);
  });

  it("open-first legacy puts open/active above done", () => {
    expect(sortWork(work, "open-first").map((w) => w.id)).toEqual(["W-003", "W-004", "W-001"]);
  });

  it("header sort keys match Work column clicks (id/kind/status/age)", () => {
    expect(TABLE_SORT_KEYS.work).toEqual({
      id: "id",
      kind: "kind",
      feature: "feature",
      area: "area",
      status: "status",
      age: "age",
    });
    expect(sortWork(work, TABLE_SORT_KEYS.work.id).map((w) => w.id)).toEqual(["W-003", "W-004", "W-001"]);
    expect(sortWork(work, TABLE_SORT_KEYS.work.kind).map((w) => w.kind)).toEqual(["proposal", "task", "fix"]);
    expect(sortWork(work, TABLE_SORT_KEYS.work.age, "asc").map((w) => w.id)).toEqual(["W-001", "W-003", "W-004"]);
  });
});

describe("Column-header sort keys", () => {
  it("Roadmap sortable columns exclude Summary; include Feature/Area", () => {
    expect(TABLE_SORT_KEYS.roadmap).toEqual({
      id: "schedule",
      order: "schedule",
      kind: "type",
      feature: "feature",
      area: "area",
      status: "state",
      age: "age",
    });
    expect("summary" in TABLE_SORT_KEYS.roadmap).toBe(false);
    expect(sortPhases(phases, TABLE_SORT_KEYS.roadmap.kind).map((p) => p.id)).toEqual([
      "PHASE-001",
      "PHASE-004",
      "PHASE-002",
    ]);
    expect(sortPhases(phases, TABLE_SORT_KEYS.roadmap.status).map((p) => p.state)).toEqual([
      "active",
      "proposed",
      "closed",
    ]);
  });

  it("Roadmap schedule default pins active first, then Order", () => {
    expect(DEFAULT_FILTERS.roadmap.sort).toBe("schedule");
    // active PHASE-004 (order 2) before closed PHASE-001 (order 1) and proposed PHASE-002 (order 3)
    expect(sortPhases(phases, "schedule").map((p) => p.id)).toEqual([
      "PHASE-004",
      "PHASE-001",
      "PHASE-002",
    ]);
  });

  it("Activity Kind/Age map to type/time; Summary not sortable", () => {
    expect(TABLE_SORT_KEYS.activity).toEqual({
      id: "id",
      kind: "type",
      feature: "feature",
      area: "area",
      status: "status",
      age: "time",
    });
    expect("summary" in TABLE_SORT_KEYS.activity).toBe(false);
    expect(sortEvents(events, TABLE_SORT_KEYS.activity.age).map((e) => e.ts)).toEqual([
      "2026-08-05T14:00:00Z",
      "2026-08-05T13:30:00Z",
      "2026-08-05T13:00:00Z",
      "2026-08-05T12:30:00Z",
      "2026-08-05T12:00:00Z",
      "2026-08-05T11:00:00Z",
      "2026-08-05T10:00:00Z",
    ]);
    expect(sortEvents(events, TABLE_SORT_KEYS.activity.kind).map((e) => e.type)).toEqual([
      "build",
      "check",
      "close",
      "dashboard",
      "fix",
      "handoff",
      "plan",
    ]);
  });

  it("Signals sortable columns exclude Summary; severity remains default sort only", () => {
    expect(TABLE_SORT_KEYS.signals).toEqual({
      id: "id",
      kind: "kind",
      feature: "feature",
      area: "area",
      status: "status",
      age: "age",
    });
    expect("summary" in TABLE_SORT_KEYS.signals).toBe(false);
    expect(sortSignals(signals, "severity").map((s) => s.severity)).toEqual([
      "high",
      "high",
      "medium",
    ]);
    expect(sortSignals(signals, TABLE_SORT_KEYS.signals.kind).map((s) => s.kind)).toEqual([
      "broken_link",
      "drift",
      "parse_error",
    ]);
  });
});

describe("Activity Feature/Area join", () => {
  it("joins Work ledger tags for Work-ref events; keeps phase tags when phase is set", () => {
    const index = {
      phases: [
        {
          id: "PHASE-004",
          title: "Dash",
          type: "build",
          state: "ready",
          order: 4,
          age_days: 1,
          feature: "SPEC-F-DEV-DASHBOARD",
          area: "SPEC-A-DEVSYSTEM",
        },
      ],
      work: [
        {
          id: "F-010",
          kind: "fix",
          summary: "tags",
          status: "active",
          feature: "SPEC-F-DEV-DASHBOARD",
          area: "SPEC-A-DEVSYSTEM",
          age_days: 0,
        },
      ],
    };
    expect(activityTags(index, { phase: null, ref: "F-010" })).toEqual({
      feature: "SPEC-F-DEV-DASHBOARD",
      area: "SPEC-A-DEVSYSTEM",
    });
    expect(activityTags(index, { phase: "PHASE-004", ref: "F-010" })).toEqual({
      feature: "SPEC-F-DEV-DASHBOARD",
      area: "SPEC-A-DEVSYSTEM",
    });
    expect(activityTags(index, { phase: null, ref: "PHASE-004" })).toEqual({
      feature: "SPEC-F-DEV-DASHBOARD",
      area: "SPEC-A-DEVSYSTEM",
    });
    expect(activityTags(index, { phase: null, ref: "PR-25" })).toEqual({
      feature: null,
      area: null,
    });
  });
});

describe("Feature/Area panel filters", () => {
  it("filters Work and Roadmap by feature/area and Untagged", () => {
    expect(filterWork(work, { kind: "", status: "", feature: "SPEC-F-LEXICON", area: "", q: "" }).map((w) => w.id)).toEqual([
      "W-003",
    ]);
    expect(filterWork(work, { kind: "", status: "", feature: "", area: "SPEC-A-DEVSYSTEM", q: "" }).map((w) => w.id)).toEqual([
      "W-001",
    ]);
    expect(filterWork(work, { kind: "", status: "", feature: "__none__", area: "", q: "" }).map((w) => w.id)).toEqual([
      "W-004",
    ]);
    expect(filterPhases(phases, { state: "", type: "", feature: "SPEC-F-DEV-DASHBOARD", area: "", q: "" }).map((p) => p.id)).toEqual([
      "PHASE-004",
    ]);
  });

  it("filters Signals feature from issue.spec", () => {
    expect(filterSignals(signals, { severity: "", kind: "", status: "", feature: "SPEC-F-X", area: "", q: "" }).map((i) => i.ref)).toEqual([
      "SPEC-F-X",
    ]);
    expect(filterSignals(signals, { severity: "", kind: "", status: "", feature: "__none__", area: "", q: "" }).map((i) => i.ref)).toEqual([
      "x.md",
      "PHASE-001",
    ]);
  });

  it("Reset defaults are dirty when feature/area or chips diverge", () => {
    expect(filtersAreDefault("work", { ...DEFAULT_FILTERS.work })).toBe(true);
    expect(filtersAreDefault("work", { ...DEFAULT_FILTERS.work, feature: "SPEC-F-LEXICON" })).toBe(false);
    expect(filtersAreDefault("signals", { ...DEFAULT_FILTERS.signals, status: "" })).toBe(false);
    expect(filtersAreDefault("roadmap", { ...DEFAULT_FILTERS.roadmap, sort: "age" })).toBe(false);
  });
});
