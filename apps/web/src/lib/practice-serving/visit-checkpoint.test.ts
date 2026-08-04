import { describe, expect, it } from "vitest";

import {
  PRACTICE_SERVING_POLICY_VERSION,
  PRACTICE_SERVING_STATE_SCHEMA_VERSION,
  advancePracticeServing,
  startPracticeServing,
  type ServingCandidate,
} from "./serving-engine";
import {
  checkpointPracticeVisit,
  restorePracticeVisit,
} from "./visit-checkpoint";

const candidates: ServingCandidate[] = Array.from({ length: 5 }, (_, index) => ({
  allowedDirections: ["en-es", "es-en"],
  authoredOrdinal: index,
  collectionId: "intermediate-restaurant",
  collectionVersion: "reviewed-prototype-v1",
  itemId: `restaurant-${index}`,
  itemVersion: "v1",
}));

function startedVisit() {
  const result = startPracticeServing({
    candidates,
    orderingMode: "authored",
    policyVersion: PRACTICE_SERVING_POLICY_VERSION,
    requestedDirection: "both",
    scope: {
      activity: "type",
      collectionId: "intermediate-restaurant",
      collectionVersion: "reviewed-prototype-v1",
      focusIds: ["recommended"],
      learnerStage: "intermediate",
      scopeId: "saved:restaurant",
      sourceKind: "saved",
    },
    seed: "42",
    stateSchemaVersion: PRACTICE_SERVING_STATE_SCHEMA_VERSION,
  });
  expect(result.status).toBe("ready");
  if (result.status !== "ready") throw new Error("Expected a ready visit");
  return result;
}

describe("current-page Practice visit checkpoints", () => {
  it("restores the application envelope and exact next serving transition", () => {
    const started = startedVisit();
    const missed = advancePracticeServing(
      started.state,
      started.offer.ordinal,
      "needs_reinforcement",
    );
    expect(missed.status).toBe("ready");
    if (missed.status !== "ready") return;
    const serialized = checkpointPracticeVisit(
      { completedCount: 1, draft: "still typing" },
      missed.state,
    );

    const restored = restorePracticeVisit<{ completedCount: number; draft: string }>(
      serialized,
      candidates,
    );
    expect(restored.status).toBe("restored");
    if (restored.status !== "restored") return;
    expect(restored.applicationState).toEqual({ completedCount: 1, draft: "still typing" });
    expect(restored.decision).toEqual({
      status: "ready",
      state: missed.state,
      offer: missed.offer,
      effect: null,
      availability: missed.availability,
    });
    if (restored.decision.status !== "ready") return;
    expect(
      advancePracticeServing(
        restored.decision.state,
        restored.decision.offer.ordinal,
        "retrieved",
      ),
    ).toEqual(advancePracticeServing(missed.state, missed.offer.ordinal, "retrieved"));
  });

  it("fails closed for malformed, application-version, policy, and source drift", () => {
    const started = startedVisit();
    expect(restorePracticeVisit("not-json", candidates)).toEqual({
      status: "unavailable",
      reason: "resume_incompatible",
    });
    expect(restorePracticeVisit(JSON.stringify({
      applicationSchemaVersion: 2,
      applicationState: {},
      servingState: started.state,
    }), candidates)).toEqual({
      status: "unavailable",
      reason: "resume_incompatible",
    });

    const policyDrift = checkpointPracticeVisit(
      {},
      { ...started.state, policyVersion: "future-policy" } as never,
    );
    expect(restorePracticeVisit(policyDrift, candidates)).toMatchObject({
      status: "restored",
      decision: { status: "unavailable", reason: "resume_incompatible" },
    });
    expect(restorePracticeVisit(
      checkpointPracticeVisit({}, started.state),
      candidates.slice(1),
    )).toMatchObject({
      status: "restored",
      decision: { status: "unavailable", reason: "source_version_unavailable" },
    });
  });
});
