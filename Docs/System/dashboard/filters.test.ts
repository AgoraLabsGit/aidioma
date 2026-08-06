import { describe, expect, it } from "vitest";

/**
 * Predicate contracts mirroring Docs/System/dashboard/public/app.js filters.
 * If UI filter wiring drifts, update both sides in the same change.
 */

type Phase = { id: string; title: string; type: string; state: string; order: number; age_days: number; outcome?: string };
type Event = { ts: string; type: string; actor: string; phase: string | null; ref: string | null; summary: string; cmd?: string };
type Issue = { kind: string; ref: string; summary: string; spec: string | null; severity: string; status: string; age_days: number | null };

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

function filterIssues(
  issues: Issue[],
  filters: { severity: string; kind: string; status: string; q: string },
): Issue[] {
  return issues
    .filter((issue) => !filters.severity || issue.severity === filters.severity)
    .filter((issue) => !filters.kind || issue.kind === filters.kind)
    .filter((issue) => !filters.status || issue.status === filters.status)
    .filter((issue) =>
      matchesQuery(`${issue.kind} ${issue.ref} ${issue.summary} ${issue.spec ?? ""} ${issue.status}`, filters.q),
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

const issues: Issue[] = [
  { kind: "fix", ref: "FIX-001", summary: "A", spec: null, severity: "low", status: "fixed", age_days: 1 },
  { kind: "fix", ref: "FIX-003", summary: "B", spec: null, severity: "high", status: "open", age_days: 0 },
  { kind: "parse_error", ref: "x.md", summary: "bad", spec: null, severity: "high", status: "open", age_days: null },
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

describe("Issues filters", () => {
  it("defaults conceptually to open; closed maps to status fixed", () => {
    expect(filterIssues(issues, { severity: "", kind: "", status: "open", q: "" }).map((i) => i.ref)).toEqual([
      "FIX-003",
      "x.md",
    ]);
    expect(filterIssues(issues, { severity: "", kind: "", status: "fixed", q: "" }).map((i) => i.ref)).toEqual([
      "FIX-001",
    ]);
    expect(filterIssues(issues, { severity: "high", kind: "fix", status: "open", q: "" }).map((i) => i.ref)).toEqual([
      "FIX-003",
    ]);
  });
});
