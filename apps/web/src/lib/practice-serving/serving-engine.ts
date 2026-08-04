export const PRACTICE_SERVING_STATE_SCHEMA_VERSION = 1 as const;
export const PRACTICE_SERVING_POLICY_VERSION = "practice-policy-v1" as const;

const WORKING_SET_TARGET = 5;
const RETRY_LAG = 3;
const MISSES_BEFORE_PARKING = 3;
const PARKING_COOLDOWN = 5;

export type ServingDirection = "en-es" | "es-en";
export type RequestedServingDirection = ServingDirection | "both";
export type ServingCommand =
  | "retrieved"
  | "needs_reinforcement"
  | "defer_without_evidence";
export type ServingOrderingMode = "authored" | "seeded";

export interface FrozenServingScope {
  sourceKind: "collection" | "saved";
  scopeId: string;
  collectionId: string;
  collectionVersion: string;
  learnerStage: string;
  activity: string;
  focusIds: string[];
}

export interface ServingSourceIdentity {
  collectionId: string;
  collectionVersion: string;
  itemId: string;
  itemVersion: string;
}

export interface ServingCandidate extends ServingSourceIdentity {
  allowedDirections: ServingDirection[];
  authoredOrdinal: number;
}

interface DirectionProgress {
  offered: boolean;
  resolved: boolean;
  missCount: number;
  retryOtherTransitions: number | null;
  retryRequiredLag: number | null;
}

interface ActiveItem {
  source: ServingCandidate;
  requiredDirections: ServingDirection[];
  preferredDirection: ServingDirection;
  lockedDirection: ServingDirection | null;
  directions: Record<ServingDirection, DirectionProgress>;
}

interface ParkedItem extends ActiveItem {
  parkedDirection: ServingDirection;
  parkedOrder: number;
  cooldownOtherTransitions: number;
  cooldownRequired: number;
}

export type ServingOfferReason =
  | "new_in_scope"
  | "worth_another_try"
  | "other_direction"
  | "reviewed_repeat";

export type ServingShortfall = "working_set_shortfall" | "spacing_shortfall";

export interface ServingAvailability {
  workingSetSize: number;
  workingSetTarget: number;
  novelty: "new_in_scope" | "reviewed_repeat";
  shortfalls: ServingShortfall[];
}

export interface ServingOffer {
  source: ServingSourceIdentity;
  direction: ServingDirection;
  ordinal: number;
  reason: ServingOfferReason;
  policyVersion: typeof PRACTICE_SERVING_POLICY_VERSION;
  availability: ServingAvailability;
}

export type RecoverableServingReason =
  | "no_spaced_retry_available"
  | "all_active_items_parked";

export type ServingUnavailableReason =
  | "no_eligible_reviewed_items"
  | "source_version_unavailable"
  | "resume_incompatible"
  | RecoverableServingReason;

export type ServingRejectionReason =
  | "stale_offer_ordinal"
  | "invalid_recovery_token"
  | "recovery_not_available";

interface BlockedServingState {
  reason: RecoverableServingReason;
  recoveryToken: string;
}

/**
 * Browser-safe, JSON-serializable checkpoint state. It deliberately contains no
 * prompt text, answer authority, learner response, verdict, or provider data.
 */
export interface PracticeServingState {
  stateSchemaVersion: typeof PRACTICE_SERVING_STATE_SCHEMA_VERSION;
  policyVersion: typeof PRACTICE_SERVING_POLICY_VERSION;
  seed: string;
  scope: FrozenServingScope;
  requestedDirection: RequestedServingDirection;
  orderingMode: ServingOrderingMode;
  candidates: ServingCandidate[];
  cycleIndex: number;
  revision: number;
  offerOrdinal: number;
  nextActivationOrdinal: number;
  nextParkedOrder: number;
  active: ActiveItem[];
  reserve: ServingCandidate[];
  parked: ParkedItem[];
  releasedItemKeys: string[];
  lastTransitionItemKey: string | null;
  currentOffer: ServingOffer | null;
  blocked: BlockedServingState | null;
}

export interface StartPracticeServingInput {
  stateSchemaVersion: number;
  policyVersion: string;
  seed: string;
  scope: FrozenServingScope;
  requestedDirection: RequestedServingDirection;
  orderingMode: ServingOrderingMode;
  candidates: readonly ServingCandidate[];
}

export interface ServingEffect {
  command: ServingCommand | "repeat_now";
  source: ServingSourceIdentity;
  direction: ServingDirection;
  resolved: boolean;
  corrected: boolean;
  released: boolean;
  parked: boolean;
  cycleRestarted: boolean;
}

export interface ServingReadyResult {
  status: "ready";
  state: PracticeServingState;
  offer: ServingOffer;
  effect: ServingEffect | null;
  availability: ServingAvailability;
}

export interface ServingUnavailableResult {
  status: "unavailable";
  reason: ServingUnavailableReason;
  state?: PracticeServingState;
  recoveryToken?: string;
}

export interface ServingRejectedResult {
  status: "rejected";
  reason: ServingRejectionReason;
  state: PracticeServingState;
}

export type ServingStartResult = ServingReadyResult | ServingUnavailableResult;
export type ServingTransitionResult =
  | ServingReadyResult
  | ServingUnavailableResult
  | ServingRejectedResult;

function sourceKey(source: ServingSourceIdentity): string {
  return [
    source.collectionId,
    source.collectionVersion,
    source.itemId,
    source.itemVersion,
  ].join("\u001f");
}

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function cloneState(state: PracticeServingState): PracticeServingState {
  return JSON.parse(JSON.stringify(state)) as PracticeServingState;
}

function canonicalCandidate(candidate: ServingCandidate): ServingCandidate {
  return {
    collectionId: candidate.collectionId,
    collectionVersion: candidate.collectionVersion,
    itemId: candidate.itemId,
    itemVersion: candidate.itemVersion,
    allowedDirections: [...new Set(candidate.allowedDirections)].sort(),
    authoredOrdinal: candidate.authoredOrdinal,
  };
}

function requiredDirections(
  requested: RequestedServingDirection,
  source: ServingCandidate,
): ServingDirection[] {
  const requestedDirections: ServingDirection[] =
    requested === "both" ? ["en-es", "es-en"] : [requested];
  return requestedDirections.filter((direction) =>
    source.allowedDirections.includes(direction),
  );
}

function orderedCandidates(
  candidates: readonly ServingCandidate[],
  seed: string,
  orderingMode: ServingOrderingMode,
  cycleIndex: number,
): ServingCandidate[] {
  const canonical = candidates.map(canonicalCandidate);
  return canonical.sort((left, right) => {
    const leftKey = sourceKey(left);
    const rightKey = sourceKey(right);
    if (orderingMode === "authored") {
      return left.authoredOrdinal - right.authoredOrdinal || leftKey.localeCompare(rightKey);
    }
    const leftHash = hash(
      `${PRACTICE_SERVING_POLICY_VERSION}\u001f${seed}\u001f${cycleIndex}\u001f${leftKey}`,
    );
    const rightHash = hash(
      `${PRACTICE_SERVING_POLICY_VERSION}\u001f${seed}\u001f${cycleIndex}\u001f${rightKey}`,
    );
    return leftHash - rightHash || leftKey.localeCompare(rightKey);
  });
}

function newProgress(): DirectionProgress {
  return {
    offered: false,
    resolved: false,
    missCount: 0,
    retryOtherTransitions: null,
    retryRequiredLag: null,
  };
}

function activateSource(
  state: PracticeServingState,
  source: ServingCandidate,
): ActiveItem {
  const directions = requiredDirections(state.requestedDirection, source);
  const bothOffset =
    hash(`${state.seed}\u001f${state.cycleIndex}\u001fdirection`) % 2;
  const preferredDirection =
    directions.length === 1
      ? directions[0]
      : directions[(state.nextActivationOrdinal + bothOffset) % directions.length];
  state.nextActivationOrdinal += 1;
  return {
    source,
    requiredDirections: directions,
    preferredDirection,
    lockedDirection: null,
    directions: {
      "en-es": newProgress(),
      "es-en": newProgress(),
    },
  };
}

function fillWorkingSet(state: PracticeServingState): void {
  const target = Math.min(WORKING_SET_TARGET, state.candidates.length);
  while (state.active.length < target && state.reserve.length > 0) {
    const source = state.reserve.shift();
    if (source) state.active.push(activateSource(state, source));
  }

  if (state.reserve.length > 0) return;
  state.parked.sort((left, right) => left.parkedOrder - right.parkedOrder);
  while (state.active.length < target) {
    const parkedIndex = state.parked.findIndex(
      (item) => item.cooldownOtherTransitions >= item.cooldownRequired,
    );
    if (parkedIndex < 0) break;
    const [parked] = state.parked.splice(parkedIndex, 1);
    for (const direction of parked.requiredDirections) {
      if (!parked.directions[direction].resolved) {
        parked.directions[direction].missCount = 0;
        parked.directions[direction].retryOtherTransitions = null;
        parked.directions[direction].retryRequiredLag = null;
      }
    }
    const retry = parked.directions[parked.parkedDirection];
    retry.retryOtherTransitions = parked.cooldownOtherTransitions;
    retry.retryRequiredLag = parked.cooldownRequired;
    parked.lockedDirection = parked.parkedDirection;
    state.active.push(parked);
  }
}

function startCycle(state: PracticeServingState, cycleIndex: number): void {
  state.cycleIndex = cycleIndex;
  state.nextActivationOrdinal = 0;
  state.nextParkedOrder = 0;
  state.active = [];
  state.parked = [];
  state.releasedItemKeys = [];
  state.reserve = orderedCandidates(
    state.candidates,
    state.seed,
    state.orderingMode,
    cycleIndex,
  );
  fillWorkingSet(state);
}

function unresolvedOtherTransitions(
  state: PracticeServingState,
  excludedItemKey: string,
): number {
  let count = 0;
  for (const item of state.active) {
    if (sourceKey(item.source) === excludedItemKey) continue;
    if (
      item.requiredDirections.some(
        (direction) => !item.directions[direction].resolved,
      )
    ) {
      count += 1;
    }
  }
  for (const source of state.reserve) {
    if (sourceKey(source) === excludedItemKey) continue;
    if (requiredDirections(state.requestedDirection, source).length > 0) count += 1;
  }
  return count;
}

function incrementOtherItemTransitions(
  state: PracticeServingState,
  transitionedItemKey: string,
): void {
  for (const item of state.active) {
    if (sourceKey(item.source) === transitionedItemKey) continue;
    for (const direction of item.requiredDirections) {
      const progress = item.directions[direction];
      if (progress.retryOtherTransitions !== null) {
        progress.retryOtherTransitions += 1;
      }
    }
  }
  for (const item of state.parked) {
    if (sourceKey(item.source) !== transitionedItemKey) {
      item.cooldownOtherTransitions += 1;
    }
  }
}

interface OfferCandidate {
  item: ActiveItem;
  direction: ServingDirection;
  kind: "retry" | "unoffered";
}

function offerCandidates(state: PracticeServingState): OfferCandidate[][] {
  const due: OfferCandidate[] = [];
  const pristineItems: OfferCandidate[] = [];
  const otherDirections: OfferCandidate[] = [];
  for (const item of state.active) {
    for (const direction of item.requiredDirections) {
      const progress = item.directions[direction];
      if (progress.resolved) continue;
      if (
        progress.retryOtherTransitions !== null &&
        progress.retryRequiredLag !== null &&
        progress.retryOtherTransitions >= progress.retryRequiredLag
      ) {
        due.push({ item, direction, kind: "retry" });
      }
    }

    if (item.lockedDirection !== null) continue;
    const directionOrder = [
      item.preferredDirection,
      ...item.requiredDirections.filter(
        (direction) => direction !== item.preferredDirection,
      ),
    ];
    const direction = directionOrder.find((candidateDirection) => {
      const progress = item.directions[candidateDirection];
      return !progress.resolved && !progress.offered;
    });
    if (direction) {
      const hasPriorActivity = item.requiredDirections.some(
        (candidateDirection) =>
          item.directions[candidateDirection].offered ||
          item.directions[candidateDirection].resolved,
      );
      (hasPriorActivity ? otherDirections : pristineItems).push({
        item,
        direction,
        kind: "unoffered",
      });
    }
  }
  return [due, pristineItems, otherDirections];
}

function chooseOfferCandidate(state: PracticeServingState): OfferCandidate | null {
  const groups = offerCandidates(state);
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
    const group = groups[groupIndex];
    const spaced = group.find(
      ({ item }) => sourceKey(item.source) !== state.lastTransitionItemKey,
    );
    if (spaced) return spaced;

    const laterHasSpaced = groups
      .slice(groupIndex + 1)
      .some((later) =>
        later.some(
          ({ item }) => sourceKey(item.source) !== state.lastTransitionItemKey,
        ),
      );
    if (!laterHasSpaced && group[0]) return group[0];
  }
  return null;
}

function availabilityFor(
  state: PracticeServingState,
  spacingShortfall: boolean,
): ServingAvailability {
  const shortfalls: ServingShortfall[] = [];
  if (state.candidates.length < WORKING_SET_TARGET) {
    shortfalls.push("working_set_shortfall");
  }
  if (spacingShortfall) shortfalls.push("spacing_shortfall");
  return {
    workingSetSize: state.active.length,
    workingSetTarget: WORKING_SET_TARGET,
    novelty: state.cycleIndex === 0 ? "new_in_scope" : "reviewed_repeat",
    shortfalls,
  };
}

function createOffer(
  state: PracticeServingState,
  candidate: OfferCandidate,
  forcedSpacingShortfall = false,
): ServingOffer {
  const progress = candidate.item.directions[candidate.direction];
  const hadOtherDirectionActivity = candidate.item.requiredDirections.some(
    (direction) =>
      direction !== candidate.direction &&
      (candidate.item.directions[direction].offered ||
        candidate.item.directions[direction].resolved),
  );
  const spacingShortfall =
    forcedSpacingShortfall ||
    (candidate.kind === "retry" &&
      (progress.retryRequiredLag ?? RETRY_LAG) < RETRY_LAG);
  let reason: ServingOfferReason;
  if (candidate.kind === "retry" || forcedSpacingShortfall) {
    reason = "worth_another_try";
  } else if (hadOtherDirectionActivity) {
    reason = "other_direction";
  } else if (state.cycleIndex > 0) {
    reason = "reviewed_repeat";
  } else {
    reason = "new_in_scope";
  }
  progress.offered = true;
  state.offerOrdinal += 1;
  const availability = availabilityFor(state, spacingShortfall);
  const offer: ServingOffer = {
    source: {
      collectionId: candidate.item.source.collectionId,
      collectionVersion: candidate.item.source.collectionVersion,
      itemId: candidate.item.source.itemId,
      itemVersion: candidate.item.source.itemVersion,
    },
    direction: candidate.direction,
    ordinal: state.offerOrdinal,
    reason,
    policyVersion: PRACTICE_SERVING_POLICY_VERSION,
    availability,
  };
  state.currentOffer = offer;
  state.blocked = null;
  return offer;
}

function recoveryTokenFor(
  state: PracticeServingState,
  reason: RecoverableServingReason,
): string {
  return `rt1_${hash(
    [
      state.seed,
      state.scope.scopeId,
      state.revision,
      state.cycleIndex,
      state.offerOrdinal,
      reason,
    ].join("\u001f"),
  ).toString(36)}`;
}

function unavailableFromState(
  state: PracticeServingState,
  reason: RecoverableServingReason,
): ServingUnavailableResult {
  state.currentOffer = null;
  const recoveryToken = recoveryTokenFor(state, reason);
  state.blocked = { reason, recoveryToken };
  return { status: "unavailable", reason, state, recoveryToken };
}

function nextDecision(
  state: PracticeServingState,
  effect: ServingEffect | null,
): ServingReadyResult | ServingUnavailableResult {
  if (
    state.active.length === 0 &&
    state.reserve.length === 0 &&
    state.parked.length === 0 &&
    state.releasedItemKeys.length === state.candidates.length
  ) {
    startCycle(state, state.cycleIndex + 1);
    if (effect) effect.cycleRestarted = true;
  }

  if (
    state.active.length === 0 &&
    state.reserve.length === 0 &&
    state.parked.length > 0
  ) {
    return unavailableFromState(state, "all_active_items_parked");
  }
  fillWorkingSet(state);
  const candidate = chooseOfferCandidate(state);
  if (candidate) {
    const offer = createOffer(state, candidate);
    return {
      status: "ready",
      state,
      offer,
      effect,
      availability: offer.availability,
    };
  }

  return unavailableFromState(state, "no_spaced_retry_available");
}

function parkItem(
  state: PracticeServingState,
  item: ActiveItem,
  parkedDirection: ServingDirection,
): void {
  const itemKey = sourceKey(item.source);
  const activeIndex = state.active.findIndex(
    (active) => sourceKey(active.source) === itemKey,
  );
  if (activeIndex >= 0) state.active.splice(activeIndex, 1);
  const honestCooldown = unresolvedOtherTransitions(state, itemKey);
  state.parked.push({
    ...item,
    parkedDirection,
    parkedOrder: state.nextParkedOrder,
    cooldownOtherTransitions: 0,
    cooldownRequired: Math.max(1, Math.min(PARKING_COOLDOWN, honestCooldown)),
  });
  state.nextParkedOrder += 1;
}

function releaseItem(state: PracticeServingState, item: ActiveItem): void {
  const itemKey = sourceKey(item.source);
  state.active = state.active.filter(
    (active) => sourceKey(active.source) !== itemKey,
  );
  state.releasedItemKeys.push(itemKey);
}

function versionsSupported(stateSchemaVersion: number, policyVersion: string): boolean {
  return (
    stateSchemaVersion === PRACTICE_SERVING_STATE_SCHEMA_VERSION &&
    policyVersion === PRACTICE_SERVING_POLICY_VERSION
  );
}

export function startPracticeServing(
  input: StartPracticeServingInput,
): ServingStartResult {
  if (!versionsSupported(input.stateSchemaVersion, input.policyVersion)) {
    return { status: "unavailable", reason: "resume_incompatible" };
  }
  const candidates = input.candidates
    .map(canonicalCandidate)
    .filter(
      (candidate) =>
        requiredDirections(input.requestedDirection, candidate).length > 0,
    )
    .sort((left, right) => sourceKey(left).localeCompare(sourceKey(right)));
  if (candidates.length === 0) {
    return { status: "unavailable", reason: "no_eligible_reviewed_items" };
  }

  const state: PracticeServingState = {
    stateSchemaVersion: PRACTICE_SERVING_STATE_SCHEMA_VERSION,
    policyVersion: PRACTICE_SERVING_POLICY_VERSION,
    seed: input.seed,
    scope: {
      ...input.scope,
      focusIds: [...input.scope.focusIds].sort(),
    },
    requestedDirection: input.requestedDirection,
    orderingMode: input.orderingMode,
    candidates,
    cycleIndex: 0,
    revision: 0,
    offerOrdinal: 0,
    nextActivationOrdinal: 0,
    nextParkedOrder: 0,
    active: [],
    reserve: [],
    parked: [],
    releasedItemKeys: [],
    lastTransitionItemKey: null,
    currentOffer: null,
    blocked: null,
  };
  startCycle(state, 0);
  return nextDecision(state, null);
}

export function advancePracticeServing(
  checkpoint: PracticeServingState,
  currentOfferOrdinal: number,
  command: ServingCommand,
): ServingTransitionResult {
  if (
    checkpoint.currentOffer === null ||
    checkpoint.blocked !== null ||
    checkpoint.currentOffer.ordinal !== currentOfferOrdinal
  ) {
    return {
      status: "rejected",
      reason: "stale_offer_ordinal",
      state: checkpoint,
    };
  }

  const state = cloneState(checkpoint);
  const offer = state.currentOffer;
  if (!offer) {
    return {
      status: "rejected",
      reason: "stale_offer_ordinal",
      state: checkpoint,
    };
  }
  const itemKey = sourceKey(offer.source);
  const item = state.active.find(
    (active) => sourceKey(active.source) === itemKey,
  );
  if (!item) {
    return {
      status: "rejected",
      reason: "stale_offer_ordinal",
      state: checkpoint,
    };
  }

  state.revision += 1;
  state.currentOffer = null;
  const progress = item.directions[offer.direction];
  const effect: ServingEffect = {
    command,
    source: offer.source,
    direction: offer.direction,
    resolved: false,
    corrected: false,
    released: false,
    parked: false,
    cycleRestarted: false,
  };

  if (command === "retrieved") {
    effect.corrected = progress.missCount > 0;
    progress.resolved = true;
    progress.retryOtherTransitions = null;
    progress.retryRequiredLag = null;
    item.lockedDirection = null;
    effect.resolved = true;
    if (
      item.requiredDirections.every(
        (direction) => item.directions[direction].resolved,
      )
    ) {
      releaseItem(state, item);
      effect.released = true;
    }
  } else if (command === "needs_reinforcement") {
    progress.missCount += 1;
    if (progress.missCount >= MISSES_BEFORE_PARKING) {
      parkItem(state, item, offer.direction);
      effect.parked = true;
    } else {
      const honestLag = unresolvedOtherTransitions(state, itemKey);
      progress.retryOtherTransitions = 0;
      progress.retryRequiredLag = Math.max(1, Math.min(RETRY_LAG, honestLag));
      item.lockedDirection = offer.direction;
    }
  } else {
    parkItem(state, item, offer.direction);
    effect.parked = true;
  }

  incrementOtherItemTransitions(state, itemKey);
  state.lastTransitionItemKey = itemKey;
  return nextDecision(state, effect);
}

export function recoverPracticeServing(
  checkpoint: PracticeServingState,
  recoveryToken: string,
  command: "repeat_now",
): ServingTransitionResult {
  const blocked = checkpoint.blocked;
  if (!blocked) {
    return {
      status: "rejected",
      reason: "recovery_not_available",
      state: checkpoint,
    };
  }
  if (blocked.recoveryToken !== recoveryToken) {
    return {
      status: "rejected",
      reason: "invalid_recovery_token",
      state: checkpoint,
    };
  }

  const state = cloneState(checkpoint);
  state.revision += 1;
  state.blocked = null;
  let item: ActiveItem | undefined;
  let direction: ServingDirection | undefined;

  if (blocked.reason === "all_active_items_parked") {
    state.parked.sort((left, right) => left.parkedOrder - right.parkedOrder);
    const parked = state.parked.shift();
    if (parked) {
      direction = parked.parkedDirection;
      for (const requiredDirection of parked.requiredDirections) {
        if (!parked.directions[requiredDirection].resolved) {
          parked.directions[requiredDirection].missCount = 0;
          parked.directions[requiredDirection].retryOtherTransitions = null;
          parked.directions[requiredDirection].retryRequiredLag = null;
        }
      }
      parked.lockedDirection = null;
      item = parked;
      state.active.push(parked);
    }
  } else {
    item = state.active.find((active) => active.lockedDirection !== null);
    direction = item?.lockedDirection ?? undefined;
    if (item && direction) {
      for (const requiredDirection of item.requiredDirections) {
        if (!item.directions[requiredDirection].resolved) {
          item.directions[requiredDirection].missCount = 0;
          item.directions[requiredDirection].retryOtherTransitions = null;
          item.directions[requiredDirection].retryRequiredLag = null;
        }
      }
      item.lockedDirection = null;
    }
  }

  if (!item || !direction) {
    return {
      status: "rejected",
      reason: "recovery_not_available",
      state: checkpoint,
    };
  }

  const offer = createOffer(
    state,
    { item, direction, kind: "retry" },
    true,
  );
  const effect: ServingEffect = {
    command,
    source: offer.source,
    direction: offer.direction,
    resolved: false,
    corrected: false,
    released: false,
    parked: false,
    cycleRestarted: false,
  };
  return {
    status: "ready",
    state,
    offer,
    effect,
    availability: offer.availability,
  };
}

export function resumePracticeServing(
  checkpoint: PracticeServingState,
  availableSources: readonly ServingSourceIdentity[],
): ServingStartResult {
  if (
    !versionsSupported(checkpoint.stateSchemaVersion, checkpoint.policyVersion)
  ) {
    return {
      status: "unavailable",
      reason: "resume_incompatible",
      state: checkpoint,
    };
  }
  const availableKeys = new Set(availableSources.map(sourceKey));
  if (
    checkpoint.candidates.some(
      (candidate) => !availableKeys.has(sourceKey(candidate)),
    )
  ) {
    return {
      status: "unavailable",
      reason: "source_version_unavailable",
      state: checkpoint,
    };
  }
  if (checkpoint.blocked) {
    return {
      status: "unavailable",
      reason: checkpoint.blocked.reason,
      state: checkpoint,
      recoveryToken: checkpoint.blocked.recoveryToken,
    };
  }
  if (!checkpoint.currentOffer) {
    return {
      status: "unavailable",
      reason: "resume_incompatible",
      state: checkpoint,
    };
  }
  return {
    status: "ready",
    state: checkpoint,
    offer: checkpoint.currentOffer,
    effect: null,
    availability: checkpoint.currentOffer.availability,
  };
}
