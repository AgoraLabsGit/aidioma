import { describe, expect, it } from "vitest";

import {
  PRACTICE_SERVING_POLICY_VERSION,
  PRACTICE_SERVING_STATE_SCHEMA_VERSION,
  advancePracticeServing,
  recoverPracticeServing,
  resumePracticeServing,
  startPracticeServing,
  type PracticeServingState,
  type ServingCandidate,
  type ServingReadyResult,
  type ServingStartResult,
  type ServingTransitionResult,
} from "./serving-engine";

function candidates(count: number): ServingCandidate[] {
  return Array.from({ length: count }, (_, index) => ({
    collectionId: "restaurant",
    collectionVersion: "2026-08-03",
    itemId: `item-${String(index + 1).padStart(2, "0")}`,
    itemVersion: "1",
    allowedDirections: ["en-es", "es-en"],
    authoredOrdinal: index + 1,
  }));
}

function input(
  count: number,
  overrides: Partial<Parameters<typeof startPracticeServing>[0]> = {},
): Parameters<typeof startPracticeServing>[0] {
  return {
    stateSchemaVersion: PRACTICE_SERVING_STATE_SCHEMA_VERSION,
    policyVersion: PRACTICE_SERVING_POLICY_VERSION,
    seed: "golden-seed",
    scope: {
      sourceKind: "collection",
      scopeId: "restaurant:intermediate:typed:all",
      collectionId: "restaurant",
      collectionVersion: "2026-08-03",
      learnerStage: "intermediate",
      activity: "typed",
      focusIds: [],
    },
    requestedDirection: "en-es",
    orderingMode: "authored",
    candidates: candidates(count),
    ...overrides,
  };
}

function ready(
  result: ServingStartResult | ServingTransitionResult,
): ServingReadyResult {
  expect(result.status).toBe("ready");
  if (result.status !== "ready") throw new Error(`Expected ready, got ${result.status}`);
  return result;
}

function advance(
  result: ServingReadyResult,
  command: Parameters<typeof advancePracticeServing>[2] = "retrieved",
): ServingReadyResult {
  return ready(advancePracticeServing(result.state, result.offer.ordinal, command));
}

function sourceKeys(state: PracticeServingState): string[] {
  return state.active.map(({ source }) => source.itemId);
}

describe("practice serving policy v1", () => {
  it("creates a five-item working set and balances Both first directions", () => {
    let result = ready(
      startPracticeServing(input(8, { requestedDirection: "both" })),
    );
    const firstOffers = [result.offer];

    for (let index = 0; index < 4; index += 1) {
      result = advance(result);
      firstOffers.push(result.offer);
    }

    expect(result.state.active).toHaveLength(5);
    expect(new Set(firstOffers.map((offer) => offer.source.itemId))).toHaveLength(5);
    const enEsCount = firstOffers.filter(
      (offer) => offer.direction === "en-es",
    ).length;
    expect(Math.abs(enEsCount - (firstOffers.length - enEsCount))).toBe(1);
    expect(
      firstOffers.some(
        (offer, index) =>
          index > 0 && offer.source.itemId === firstOffers[index - 1].source.itemId,
      ),
    ).toBe(false);
  });

  it("is structurally independent of candidate caller order", () => {
    const canonical = candidates(9);
    const reversed = [...canonical].reverse();
    let first = ready(startPracticeServing(
      input(9, {
        orderingMode: "seeded",
        requestedDirection: "both",
        candidates: canonical,
      }),
    ));
    let second = ready(startPracticeServing(
      input(9, {
        orderingMode: "seeded",
        requestedDirection: "both",
        candidates: reversed,
      }),
    ));

    expect(second).toEqual(first);
    const commands = [
      "retrieved",
      "needs_reinforcement",
      "retrieved",
      "defer_without_evidence",
      "retrieved",
      "retrieved",
    ] as const;
    for (const command of commands) {
      first = advance(first, command);
      second = advance(second, command);
      expect(second).toEqual(first);
    }
  });

  it("returns a missed direction after exactly three other-item transitions", () => {
    let result = ready(startPracticeServing(input(8)));
    const missed = result.offer;
    result = advance(result, "needs_reinforcement");

    const intervening: string[] = [];
    for (let index = 0; index < 3; index += 1) {
      intervening.push(result.offer.source.itemId);
      expect(result.offer.source.itemId).not.toBe(missed.source.itemId);
      result = advance(result);
    }

    expect(new Set(intervening)).toHaveLength(3);
    expect(result.offer).toMatchObject({
      source: { itemId: missed.source.itemId },
      direction: missed.direction,
      reason: "worth_another_try",
    });
    expect(result.offer.availability.shortfalls).not.toContain("spacing_shortfall");
  });

  it("uses the maximum available spacing and reports a two-item shortfall", () => {
    let result = ready(startPracticeServing(input(2)));
    const missed = result.offer;
    result = advance(result, "needs_reinforcement");
    expect(result.offer.source.itemId).not.toBe(missed.source.itemId);
    result = advance(result);

    expect(result.offer.source.itemId).toBe(missed.source.itemId);
    expect(result.offer.availability.shortfalls).toEqual([
      "working_set_shortfall",
      "spacing_shortfall",
    ]);
  });

  it("counts distinct other items rather than direction units for a narrow Both pool", () => {
    let result = ready(
      startPracticeServing(input(2, { requestedDirection: "both" })),
    );
    const missed = result.offer;
    result = advance(result, "needs_reinforcement");
    const intervening = result.offer;

    expect(intervening.source.itemId).not.toBe(missed.source.itemId);
    result = advance(result);
    expect(result.offer).toMatchObject({
      source: { itemId: missed.source.itemId },
      direction: missed.direction,
      reason: "worth_another_try",
    });
    expect(result.offer.availability.shortfalls).toContain("spacing_shortfall");
  });

  it("keeps Both directions independent and releases only after both retrievals", () => {
    let result = ready(
      startPracticeServing(input(6, { requestedDirection: "both" })),
    );
    const itemId = result.offer.source.itemId;
    const firstDirection = result.offer.direction;
    result = advance(result);

    expect(sourceKeys(result.state)).toContain(itemId);
    while (result.offer.source.itemId !== itemId) result = advance(result);
    expect(result.offer.direction).not.toBe(firstDirection);
    expect(result.offer.reason).toBe("other_direction");
    result = advance(result);

    expect(sourceKeys(result.state)).not.toContain(itemId);
    expect(result.state.releasedItemKeys).toHaveLength(1);
  });

  it("parks on a third miss and immediately refills from never-active reserve", () => {
    let result = ready(startPracticeServing(input(10)));
    const repeatedlyMissed = result.offer.source.itemId;

    for (let miss = 1; miss <= 3; miss += 1) {
      const transitioned = advancePracticeServing(
        result.state,
        result.offer.ordinal,
        "needs_reinforcement",
      );
      if (miss === 3) {
        result = ready(transitioned);
        expect(result.effect).toMatchObject({ parked: true, released: false });
        break;
      }
      result = ready(transitioned);
      while (result.offer.source.itemId !== repeatedlyMissed) result = advance(result);
    }

    expect(result.state.parked.map(({ source }) => source.itemId)).toContain(
      repeatedlyMissed,
    );
    expect(sourceKeys(result.state)).not.toContain(repeatedlyMissed);
    expect(result.offer.source.itemId).not.toBe(repeatedlyMissed);
    expect(
      [...result.state.active, ...result.state.parked].some(
        ({ source }) => source.itemId === "item-10",
      ) || result.state.releasedItemKeys.some((key) => key.includes("item-10")),
    ).toBe(true);
  });

  it("preserves a resolved Both direction when deferring the other without evidence", () => {
    let result = ready(
      startPracticeServing(input(7, { requestedDirection: "both" })),
    );
    const itemId = result.offer.source.itemId;
    const resolvedDirection = result.offer.direction;
    result = advance(result);
    while (result.offer.source.itemId !== itemId) result = advance(result);
    const deferredDirection = result.offer.direction;
    result = advance(result, "defer_without_evidence");

    const parked = result.state.parked.find(
      ({ source }) => source.itemId === itemId,
    );
    expect(parked?.directions[resolvedDirection].resolved).toBe(true);
    expect(parked?.directions[deferredDirection].resolved).toBe(false);
    expect(parked?.directions[deferredDirection].missCount).toBe(0);
  });

  it("preserves a resolved Both direction through third-miss parking and re-entry", () => {
    let result = ready(
      startPracticeServing(input(10, { requestedDirection: "both" })),
    );
    const itemId = result.offer.source.itemId;
    const resolvedDirection = result.offer.direction;
    result = advance(result);
    while (result.offer.source.itemId !== itemId) result = advance(result);
    const reinforcedDirection = result.offer.direction;

    for (let miss = 1; miss <= 3; miss += 1) {
      result = advance(result, "needs_reinforcement");
      if (miss < 3) {
        while (result.offer.source.itemId !== itemId) result = advance(result);
      }
    }

    const parked = result.state.parked.find(
      ({ source }) => source.itemId === itemId,
    );
    expect(parked?.directions[resolvedDirection].resolved).toBe(true);
    expect(parked?.directions[reinforcedDirection].resolved).toBe(false);

    let guard = 0;
    while (result.offer.source.itemId !== itemId && guard < 80) {
      result = advance(result);
      guard += 1;
    }
    expect(guard).toBeLessThan(80);
    expect(result.offer).toMatchObject({
      source: { itemId },
      direction: reinforcedDirection,
      reason: "worth_another_try",
    });
    const reentered = result.state.active.find(
      ({ source }) => source.itemId === itemId,
    );
    expect(reentered?.directions[resolvedDirection].resolved).toBe(true);
    expect(reentered?.directions[reinforcedDirection].missCount).toBe(0);
  });

  it("continues into a labeled reviewed-repetition cycle", () => {
    let result = ready(startPracticeServing(input(2)));
    result = advance(result);
    result = advance(result);

    expect(result.state.cycleIndex).toBe(1);
    expect(result.offer.reason).toBe("reviewed_repeat");
    expect(result.offer.availability.novelty).toBe("reviewed_repeat");
  });

  it("blocks a singleton miss and requires a fresh single-use recovery token", () => {
    const started = ready(startPracticeServing(input(1)));
    const blocked = advancePracticeServing(
      started.state,
      started.offer.ordinal,
      "needs_reinforcement",
    );
    expect(blocked).toMatchObject({
      status: "unavailable",
      reason: "no_spaced_retry_available",
    });
    if (blocked.status !== "unavailable" || !blocked.state || !blocked.recoveryToken) {
      throw new Error("Expected recoverable singleton block");
    }

    const recovered = ready(
      recoverPracticeServing(blocked.state, blocked.recoveryToken, "repeat_now"),
    );
    expect(recovered.offer).toMatchObject({
      source: { itemId: started.offer.source.itemId },
      direction: started.offer.direction,
      reason: "worth_another_try",
    });
    expect(recovered.offer.availability.shortfalls).toContain("spacing_shortfall");
    expect(
      recoverPracticeServing(recovered.state, blocked.recoveryToken, "repeat_now"),
    ).toMatchObject({ status: "rejected", reason: "recovery_not_available" });
    expect(
      recoverPracticeServing(blocked.state, "client-invented", "repeat_now"),
    ).toMatchObject({ status: "rejected", reason: "invalid_recovery_token" });
  });

  it("parks a full working set behind unused reserve without starving it", () => {
    let result: ServingStartResult | ServingTransitionResult = startPracticeServing(
      input(10),
    );
    const firstWorkingSet: string[] = [];
    for (let index = 0; index < 5; index += 1) {
      const current = ready(result);
      firstWorkingSet.push(current.offer.source.itemId);
      result = advancePracticeServing(
        current.state,
        current.offer.ordinal,
        "defer_without_evidence",
      );
    }

    const afterParking = ready(result);
    expect(
      afterParking.state.parked.map(({ source }) => source.itemId).sort(),
    ).toEqual([...firstWorkingSet].sort());
    expect(firstWorkingSet).not.toContain(afterParking.offer.source.itemId);
    expect(afterParking.state.active).toHaveLength(5);
  });

  it("blocks when all five items are parked and recovers the oldest deterministically", () => {
    let result: ServingStartResult | ServingTransitionResult = startPracticeServing(
      input(5),
    );
    const parkedInOrder: string[] = [];
    for (let index = 0; index < 5; index += 1) {
      const current = ready(result);
      parkedInOrder.push(current.offer.source.itemId);
      result = advancePracticeServing(
        current.state,
        current.offer.ordinal,
        "defer_without_evidence",
      );
    }

    expect(result).toMatchObject({
      status: "unavailable",
      reason: "all_active_items_parked",
    });
    if (result.status !== "unavailable" || !result.state || !result.recoveryToken) {
      throw new Error("Expected all-parked recovery state");
    }
    const recovered = ready(
      recoverPracticeServing(result.state, result.recoveryToken, "repeat_now"),
    );
    expect(recovered.offer.source.itemId).toBe(parkedInOrder[0]);
    expect(recovered.effect?.command).toBe("repeat_now");
    expect(recovered.state.parked).toHaveLength(4);
  });

  it("rejects stale and duplicate offer ordinals without mutation", () => {
    const started = ready(startPracticeServing(input(6)));
    const advanced = advance(started);
    const stale = advancePracticeServing(
      advanced.state,
      started.offer.ordinal,
      "retrieved",
    );

    expect(stale).toEqual({
      status: "rejected",
      reason: "stale_offer_ordinal",
      state: advanced.state,
    });
  });

  it("resumes an exact serialized checkpoint and fails closed on version/source drift", () => {
    let uninterrupted = ready(startPracticeServing(input(6)));
    uninterrupted = advance(uninterrupted, "needs_reinforcement");
    const restored = JSON.parse(
      JSON.stringify(uninterrupted.state),
    ) as PracticeServingState;
    const availableSources = candidates(6);

    const resumed = ready(resumePracticeServing(restored, availableSources));
    expect(resumed).toEqual({
      status: "ready",
      state: uninterrupted.state,
      offer: uninterrupted.offer,
      effect: null,
      availability: uninterrupted.availability,
    });
    expect(
      advancePracticeServing(
        resumed.state,
        resumed.offer.ordinal,
        "retrieved",
      ),
    ).toEqual(
      advancePracticeServing(
        uninterrupted.state,
        uninterrupted.offer.ordinal,
        "retrieved",
      ),
    );

    expect(resumePracticeServing(restored, availableSources.slice(1))).toMatchObject({
      status: "unavailable",
      reason: "source_version_unavailable",
    });
    const incompatible = {
      ...restored,
      policyVersion: "future-policy",
    } as unknown as PracticeServingState;
    expect(resumePracticeServing(incompatible, availableSources)).toMatchObject({
      status: "unavailable",
      reason: "resume_incompatible",
    });
  });

  it("returns explicit empty and incompatible-start failures", () => {
    expect(startPracticeServing(input(0))).toEqual({
      status: "unavailable",
      reason: "no_eligible_reviewed_items",
    });
    expect(
      startPracticeServing(input(3, { policyVersion: "future-policy" })),
    ).toEqual({ status: "unavailable", reason: "resume_incompatible" });
  });
});
