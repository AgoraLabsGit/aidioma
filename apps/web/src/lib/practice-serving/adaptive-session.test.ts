import { describe, expect, it } from "vitest";

import {
  adaptiveOfferExplanation,
  advanceAdaptivePracticeSession,
  startAdaptivePracticeSession,
  type LearnerItemEvidence,
} from "./adaptive-session";
import { resolvePromotedPracticeSource, type PromotedPracticeItem } from "./promoted-source";

const now = "2026-08-24T20:00:00.000Z";
const promoted = resolvePromotedPracticeSource("es-AR");
if (promoted.status !== "ready") throw new Error("Promoted fixture unavailable.");
const base = promoted.items[0];

function item(id: string): PromotedPracticeItem {
  return { ...base, itemId: id, meaningId: `meaning.${id}`, conceptIds: [`concept.${id}`] };
}

function evidence(overrides: Partial<LearnerItemEvidence>): LearnerItemEvidence {
  return {
    confidence: 0,
    dueAt: null,
    lastAttemptAt: null,
    seenCount: 0,
    unresolvedMisses: 0,
    ...overrides,
  };
}

function start(evidenceByItemId: Record<string, LearnerItemEvidence> = {}) {
  return startAdaptivePracticeSession({
    evidenceByItemId,
    items: [item("weak"), item("due"), item("new"), item("steady")],
    now,
    profile: "es-AR",
    seed: "deterministic",
    sessionId: "session-1",
    source: { id: "collection", kind: "collection", title: "Collection", version: "v1" },
  });
}

describe("production-first adaptive policy", () => {
  it("prioritizes unresolved misses, due, weak, new, then continuing review", () => {
    const all = {
      weak: evidence({ confidence: 0.2, seenCount: 2 }),
      due: evidence({ confidence: 0.8, dueAt: "2026-08-23T20:00:00.000Z", seenCount: 3 }),
      new: evidence({}),
      steady: evidence({ confidence: 0.9, dueAt: "2026-09-01T20:00:00.000Z", seenCount: 3 }),
    };
    expect(start({ ...all, weak: evidence({ ...all.weak, unresolvedMisses: 1 }) }).currentOffer)
      .toMatchObject({ itemId: "weak", reason: "retry_after_miss" });
    expect(start(all).currentOffer).toMatchObject({ itemId: "due", reason: "due_for_review" });
    expect(start({ ...all, due: evidence({ ...all.due, dueAt: "2026-09-01T20:00:00.000Z" }) }).currentOffer)
      .toMatchObject({ itemId: "weak", reason: "strengthen_weak_item" });
    expect(start({
      ...all,
      due: evidence({ confidence: 0.9, dueAt: "2026-09-01T20:00:00.000Z", seenCount: 3 }),
      weak: evidence({ confidence: 0.9, seenCount: 2 }),
    }).currentOffer).toMatchObject({ itemId: "new", reason: "new_in_scope" });
  });

  it("retains undirected attempt evidence and turns a miss into an explained retry", () => {
    const initial = startAdaptivePracticeSession({
      items: [base],
      now,
      profile: "es-AR",
      seed: "one",
      sessionId: "session-1",
      source: { id: "collection", kind: "collection", title: "Collection", version: "v1" },
    });
    const missed = advanceAdaptivePracticeSession(
      initial,
      initial.currentOffer.ordinal,
      "Tú vives aquí.",
      {
        status: "graded",
        score: 35,
        verdict: "wrong",
        feedback: "Use the active Argentine form.",
        errorTags: [],
        evalSource: "comparison",
        correction: { text: "Vos vivís acá.", highlights: [] },
      },
      now,
    );
    expect(missed.currentOffer.reason).toBe("retry_after_miss");
    expect(adaptiveOfferExplanation(missed.currentOffer.reason)).toMatch(/most recent miss/);
    expect(missed.evidenceByItemId[base.itemId]).toMatchObject({ seenCount: 1, unresolvedMisses: 1 });
    expect(missed.attempts[0]).toMatchObject({
      activity: "typed-production",
      verdict: "wrong",
      correction: { text: "Vos vivís acá.", highlights: [] },
    });
    expect(JSON.stringify(missed)).not.toMatch(/direction/i);
  });

  it("is deterministic across candidate caller order", () => {
    const canonical = start();
    const reversed = startAdaptivePracticeSession({
      items: [...canonical.items].reverse(),
      now,
      profile: "es-AR",
      seed: canonical.seed,
      sessionId: canonical.sessionId,
      source: canonical.source,
    });
    expect(reversed.currentOffer).toEqual(canonical.currentOffer);
  });
});
