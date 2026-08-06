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

function sortWorkOpenFirst(rows: Work[]): Work[] {
  const openRank = (row: Work) => (workBucket(row.status) === "open" ? 0 : 1);
  return [...rows].sort(
    (left, right) => openRank(left) - openRank(right) || right.age_days - left.age_days,
  );
}

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
    expect(sortWorkOpenFirst(work).map((w) => w.id)).toEqual(["W-003", "W-004", "W-001"]);
  });
});
