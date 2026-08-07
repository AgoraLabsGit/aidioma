import { describe, expect, it } from "vitest";

/**
 * Predicate contracts mirroring Docs/System/dashboard/public/app.js filters.
 * If UI filter wiring drifts, update both sides in the same change.
 */

type Phase = { id: string; title: string; type: string; state: string; order: number; age_days: number; outcome?: string };
type Event = { ts: string; type: string; actor: string; phase: string | null; ref: string | null; summary: string; cmd?: string };
type Signal = { kind: string; ref: string; summary: string; spec: string | null; severity: string; status: string; age_days: number | null };
type Work = { id: string; kind: string; summary: string; status: string; feature: string | null; area: string | null; age_days: number };

function matchesQuery(haystack: string, q: string): boolean {
  if (!q) return true;
  return haystack.toLowerCase().includes(q.toLowerCase());
}

function filterPhases(
  phases: Phase[],
  filters: { state: string; type: string; q: string },
): Phase[] {
  return phases
    .filter((phase) => (!filters.state || phase.state === filters.state) && (!filters.type || phase.type === filters.type))
    .filter((phase) => matchesQuery(`${phase.id} ${phase.title}`, filters.q));
}

function filterEvents(
  events: Event[],
  filters: { actor: string; type: string; phase: string; q: string },
): Event[] {
  return events
    .filter((event) => !filters.actor || event.actor === filters.actor)
    .filter((event) => !filters.type || event.type === filters.type)
    .filter((event) => !filters.phase || event.phase === filters.phase)
    .filter((event) =>
      matchesQuery(`${event.type} ${event.summary} ${event.ref ?? ""} ${event.phase ?? ""} ${event.cmd ?? ""}`, filters.q),
    );
}

function filterSignals(
  signals: Signal[],
  filters: { severity: string; kind: string; status: string; q: string },
): Signal[] {
  return signals
    .filter((issue) => !filters.severity || issue.severity === filters.severity)
    .filter((issue) => !filters.kind || issue.kind === filters.kind)
    .filter((issue) => !filters.status || issue.status === filters.status)
    .filter((issue) =>
      matchesQuery(`${issue.kind} ${issue.ref} ${issue.summary} ${issue.spec ?? ""} ${issue.status}`, filters.q),
    );
}

function workBucket(status: string): "open" | "closed" {
  return status === "open" || status === "active" ? "open" : "closed";
}

function filterWork(
  rows: Work[],
  filters: { kind: string; status: string; q: string },
): Work[] {
  return rows
    .filter((row) => !filters.kind || row.kind === filters.kind)
    .filter((row) => !filters.status || workBucket(row.status) === filters.status)
    .filter((row) =>
      matchesQuery(
        `${row.id} ${row.kind} ${row.summary} ${row.status} ${row.feature ?? ""} ${row.area ?? ""}`,
        filters.q,
      ),
    );
}

function workBucketRank(status: string): number {
  return workBucket(status) === "open" ? 0 : 1;
}

function sortWork(rows: Work[], sort: string): Work[] {
  return [...rows].sort((left, right) => {
    if (sort === "kind") {
      return workBucketRank(left.status) - workBucketRank(right.status)
        || left.kind.localeCompare(right.kind)
        || right.age_days - left.age_days;
    }
    if (sort === "status") {
      return workBucketRank(left.status) - workBucketRank(right.status)
        || left.status.localeCompare(right.status)
        || right.age_days - left.age_days;
    }
    if (sort === "id") {
      return workBucketRank(left.status) - workBucketRank(right.status) || left.id.localeCompare(right.id);
    }
    if (sort === "age") {
      return right.age_days - left.age_days;
    }
    return workBucketRank(left.status) - workBucketRank(right.status) || right.age_days - left.age_days;
  });
}

function stateRank(value: string): number {
  return ({ active: 0, blocked: 1, ready: 2, proposed: 3, closed: 4, canceled: 5 } as Record<string, number>)[value] ?? 9;
}

function sortPhases(rows: Phase[], sort: string): Phase[] {
  return [...rows].sort((left, right) => {
    if (sort === "order") return left.order - right.order;
    if (sort === "age") return right.age_days - left.age_days;
    if (sort === "title") return left.title.localeCompare(right.title);
    if (sort === "type") return left.type.localeCompare(right.type) || left.order - right.order;
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
  roadmap: { id: "schedule", order: "schedule", kind: "type", summary: "title", status: "state", age: "age" },
  activity: { kind: "type", age: "time" },
  work: { id: "id", kind: "kind", status: "status", age: "age" },
  signals: { kind: "kind", summary: "severity", status: "status", age: "age" },
} as const;

const phases: Phase[] = [
  { id: "PHASE-004", title: "Dash", type: "build", state: "active", order: 2, age_days: 1 },
  { id: "PHASE-002", title: "Product", type: "design", state: "proposed", order: 3, age_days: 1 },
  { id: "PHASE-001", title: "Old", type: "build", state: "closed", order: 1, age_days: 2 },
];

const events: Event[] = [
  { ts: "2026-08-05T10:00:00Z", type: "build", actor: "agent", phase: "PHASE-004", ref: "PHASE-004", summary: "Activated" },
  { ts: "2026-08-05T11:00:00Z", type: "plan", actor: "agent", phase: "PHASE-004", ref: "PHASE-004", summary: "Proposed" },
  { ts: "2026-08-05T12:00:00Z", type: "close", actor: "user", phase: "PHASE-001", ref: "PHASE-001", summary: "Closed" },
];

const signals: Signal[] = [
  { kind: "parse_error", ref: "x.md", summary: "bad", spec: null, severity: "high", status: "open", age_days: null },
  { kind: "drift", ref: "SPEC-F-X", summary: "drifted", spec: "SPEC-F-X", severity: "medium", status: "open", age_days: 2 },
  { kind: "broken_link", ref: "PHASE-001", summary: "missing", spec: null, severity: "high", status: "open", age_days: 1 },
];

const work: Work[] = [
  { id: "W-001", kind: "fix", summary: "A", status: "done", feature: null, area: null, age_days: 1 },
  { id: "W-003", kind: "task", summary: "B", status: "open", feature: null, area: null, age_days: 0 },
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
  it("filters actor, type, phase, and search", () => {
    expect(filterEvents(events, { actor: "user", type: "", phase: "", q: "" }).map((e) => e.type)).toEqual(["close"]);
    expect(filterEvents(events, { actor: "", type: "build", phase: "", q: "" })).toHaveLength(1);
    expect(filterEvents(events, { actor: "", type: "", phase: "PHASE-004", q: "" })).toHaveLength(2);
    expect(filterEvents(events, { actor: "", type: "", phase: "", q: "Proposed" })).toHaveLength(1);
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

  it("open-first sort puts open/active above done", () => {
    expect(sortWork(work, "open-first").map((w) => w.id)).toEqual(["W-003", "W-004", "W-001"]);
  });

  it("header sort keys match Work column clicks (id/kind/status/age)", () => {
    expect(TABLE_SORT_KEYS.work).toEqual({ id: "id", kind: "kind", status: "status", age: "age" });
    expect(sortWork(work, TABLE_SORT_KEYS.work.id).map((w) => w.id)).toEqual(["W-003", "W-004", "W-001"]);
    expect(sortWork(work, TABLE_SORT_KEYS.work.kind).map((w) => w.kind)).toEqual(["proposal", "task", "fix"]);
    expect(sortWork(work, TABLE_SORT_KEYS.work.age).map((w) => w.id)).toEqual(["W-001", "W-003", "W-004"]);
  });
});

describe("Column-header sort keys", () => {
  it("Roadmap ID/Order/Kind/Summary/Status/Age map to schedule/type/title/state/age", () => {
    expect(TABLE_SORT_KEYS.roadmap).toEqual({
      id: "schedule",
      order: "schedule",
      kind: "type",
      summary: "title",
      status: "state",
      age: "age",
    });
    expect(TABLE_SORT_KEYS.roadmap.id).toBe("schedule");
    expect(TABLE_SORT_KEYS.roadmap.order).toBe("schedule");
    expect(sortPhases(phases, TABLE_SORT_KEYS.roadmap.kind).map((p) => p.id)).toEqual([
      "PHASE-001",
      "PHASE-004",
      "PHASE-002",
    ]);
    expect(sortPhases(phases, TABLE_SORT_KEYS.roadmap.summary).map((p) => p.title)).toEqual([
      "Dash",
      "Old",
      "Product",
    ]);
    expect(sortPhases(phases, TABLE_SORT_KEYS.roadmap.status).map((p) => p.state)).toEqual([
      "active",
      "proposed",
      "closed",
    ]);
  });

  it("Activity Kind/Age map to type/time", () => {
    expect(TABLE_SORT_KEYS.activity).toEqual({ kind: "type", age: "time" });
    expect(sortEvents(events, TABLE_SORT_KEYS.activity.age).map((e) => e.ts)).toEqual([
      "2026-08-05T12:00:00Z",
      "2026-08-05T11:00:00Z",
      "2026-08-05T10:00:00Z",
    ]);
    expect(sortEvents(events, TABLE_SORT_KEYS.activity.kind).map((e) => e.type)).toEqual([
      "build",
      "close",
      "plan",
    ]);
  });

  it("Signals Kind/Summary/Status/Age map to kind/severity/status/age", () => {
    expect(TABLE_SORT_KEYS.signals).toEqual({
      kind: "kind",
      summary: "severity",
      status: "status",
      age: "age",
    });
    expect(sortSignals(signals, TABLE_SORT_KEYS.signals.summary).map((s) => s.severity)).toEqual([
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
