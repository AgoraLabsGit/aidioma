import { describe, expect, it } from "vitest";

import {
  PRACTICE_SERVING_POLICY_VERSION,
  PRACTICE_SERVING_STATE_SCHEMA_VERSION,
  startPracticeServing,
} from "./serving-engine";
import {
  applyTypedEvaluationOutcome,
  deferTypedEvaluationWithoutEvidence,
  servingCommandForTypedVerdict,
} from "./typed-outcome-adapter";

function started() {
  const result = startPracticeServing({
    candidates: [
      {
        allowedDirections: ["en-es"],
        authoredOrdinal: 0,
        collectionId: "restaurant",
        collectionVersion: "v1",
        itemId: "item-1",
        itemVersion: "v1",
      },
      {
        allowedDirections: ["en-es"],
        authoredOrdinal: 1,
        collectionId: "restaurant",
        collectionVersion: "v1",
        itemId: "item-2",
        itemVersion: "v1",
      },
    ],
    orderingMode: "authored",
    policyVersion: PRACTICE_SERVING_POLICY_VERSION,
    requestedDirection: "en-es",
    scope: {
      activity: "type",
      collectionId: "restaurant",
      collectionVersion: "v1",
      focusIds: ["recommended"],
      learnerStage: "intermediate",
      scopeId: "restaurant:intermediate:type:recommended",
      sourceKind: "collection",
    },
    seed: "adapter-test",
    stateSchemaVersion: PRACTICE_SERVING_STATE_SCHEMA_VERSION,
  });
  expect(result.status).toBe("ready");
  if (result.status !== "ready") throw new Error("Expected a ready serving result");
  return result;
}

describe("typed Practice serving adapter", () => {
  it.each([
    ["correct", "retrieved"],
    ["close", "needs_reinforcement"],
    ["wrong", "needs_reinforcement"],
  ] as const)("maps %s to %s", (verdict, command) => {
    expect(servingCommandForTypedVerdict(verdict)).toBe(command);
  });

  it("passes only the normalized verdict into the serving transition", () => {
    const current = started();
    const result = applyTypedEvaluationOutcome(
      current.state,
      current.offer.ordinal,
      "correct",
    );

    expect(result.status).toBe("ready");
    expect(result.status === "ready" ? result.effect?.command : null).toBe("retrieved");
    expect(JSON.stringify(result)).not.toMatch(/answer|feedback|provider|score/iu);
  });

  it("defers explicitly without positive or negative evidence", () => {
    const current = started();
    const result = deferTypedEvaluationWithoutEvidence(
      current.state,
      current.offer.ordinal,
    );

    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.effect).toMatchObject({
      command: "defer_without_evidence",
      parked: true,
      released: false,
      resolved: false,
    });
  });
});
