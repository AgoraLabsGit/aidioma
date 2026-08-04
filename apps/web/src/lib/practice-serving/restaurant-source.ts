import { hash as sha256 } from "fast-sha256";

import {
  practiceSetFixtures,
  type PracticeActivity,
  type PracticeDirection,
  type PracticeFocus,
  type PracticePrompt,
  type PrototypeLearnerStage,
} from "../practice-sets/prototype-fixtures";
import restaurantPromptsJson from "../practice-sets/prototype-content/restaurant-prompts.json";
import { loadPromotedPrototypePrompts } from "../practice-sets/promoted-practice-prompts";

export const RESTAURANT_COLLECTION_ID = "intermediate-restaurant" as const;
export const RESTAURANT_COLLECTION_VERSION = "reviewed-prototype-v1" as const;
export const RESTAURANT_ITEM_VERSION = "v1" as const;

const restaurantOriginalPromptIds = [
  "restaurant-foundation-bill",
  "restaurant-past-mistake",
  "restaurant-recent-bill",
  "restaurant-connected-review",
] as const;

export const RESTAURANT_SERVING_MANIFEST = {
  schemaVersion: 1,
  collectionId: RESTAURANT_COLLECTION_ID,
  collectionVersion: RESTAURANT_COLLECTION_VERSION,
  lifecycle: "active",
  publicationAuthority: {
    kind: "reviewed-prototype",
    prototypeOnly: true,
    canonical: false,
    launchApproved: false,
    originalReviewedPromptIds: restaurantOriginalPromptIds,
    promotedPromptCount: 46,
    sourceRunId: "run-2026-08-03t20-25-10-234z",
    sourceCandidateHash: "81a209f1b9731b918fed882f2039a8df2d8e2debcca820862d345889762fee00",
    reviewedContentHash: "656b27814cdbdb24d41bedf7b4e30e0486ad02ffd2df3cf96bd941d0068497ac",
    promotedContentHash: "cf286c8f1ea83111798b58e4b38531542aab838eaec649bb1221283dad65197d",
  },
  expectedPromptCount: 50,
  minimumPublishedCollectionPrompts: 50,
  minimumAdvertisedScopePrompts: 10,
  promptPayloadSha256: "d687eb214aa5a486f61b138d4d18b73f789281a5cc6173541e7f18d28f820d8c",
  advertisedDirections: ["en-es", "es-en", "both"],
  advertisedScopes: {
    foundation: ["recommended", "time-phrases", "connectors"],
    intermediate: ["recommended", "completed-past", "time-phrases", "connectors"],
  },
} as const;

export type RestaurantServingManifest = typeof RESTAURANT_SERVING_MANIFEST;

export type PracticeServingDirection = Exclude<PracticeDirection, "both">;

export type PracticeServingSourceRequest = {
  activity: PracticeActivity;
  collectionId: string;
  direction: PracticeDirection;
  focus: PracticeFocus;
  stage: PrototypeLearnerStage;
};

export type PracticeServingCandidate = {
  allowedDirections: PracticeServingDirection[];
  authoredOrdinal: number;
  collectionId: typeof RESTAURANT_COLLECTION_ID;
  collectionVersion: typeof RESTAURANT_COLLECTION_VERSION;
  itemId: string;
  itemVersion: typeof RESTAURANT_ITEM_VERSION;
  lifecycle: "active";
  publicationAuthority: "reviewed-prototype";
};

export type ResolvedPracticeSource = {
  candidates: PracticeServingCandidate[];
  collectionLifecycle: "active";
  manifestSchemaVersion: 1;
  promptPayloadSha256: string;
  prompts: PracticePrompt[];
  publication: {
    authority: "reviewed-prototype";
    canonical: false;
    launchApproved: false;
    prototypeOnly: true;
  };
  scope: PracticeServingSourceRequest & {
    collectionId: typeof RESTAURANT_COLLECTION_ID;
    collectionVersion: typeof RESTAURANT_COLLECTION_VERSION;
  };
};

export type PracticeSourceUnavailableReason =
  | "no_eligible_reviewed_items"
  | "source_integrity_failed"
  | "unsupported_activity"
  | "unsupported_collection";

export type ResolvePracticeSourceResult =
  | { status: "ready"; source: ResolvedPracticeSource }
  | {
      reason: PracticeSourceUnavailableReason;
      request: PracticeServingSourceRequest;
      status: "unavailable";
    };

type RestaurantPublicationValidation =
  | {
      manifest: RestaurantServingManifest;
      prompts: PracticePrompt[];
      status: "valid";
    }
  | { reason: "source_integrity_failed"; status: "invalid" };

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function restaurantPromptPayloadHash(prompts: readonly PracticePrompt[]): string {
  const payload = {
    schemaVersion: RESTAURANT_SERVING_MANIFEST.schemaVersion,
    collectionId: RESTAURANT_SERVING_MANIFEST.collectionId,
    collectionVersion: RESTAURANT_SERVING_MANIFEST.collectionVersion,
    items: prompts.map((prompt, authoredOrdinal) => ({
      authoredOrdinal,
      itemVersion: RESTAURANT_ITEM_VERSION,
      lifecycle: "active",
      prompt,
    })),
  };
  return bytesToHex(sha256(new TextEncoder().encode(canonicalJson(payload))));
}

function eligibleAtStage(prompt: PracticePrompt, stage: PrototypeLearnerStage): boolean {
  return stage === "intermediate" || prompt.level === "foundation";
}

function eligibleForFocus(prompt: PracticePrompt, focus: PracticeFocus): boolean {
  return focus === "recommended" || prompt.focus.includes(focus);
}

function publishedScopeCount(
  prompts: readonly PracticePrompt[],
  stage: PrototypeLearnerStage,
  focus: PracticeFocus,
): number {
  return prompts.filter(
    (prompt) => eligibleAtStage(prompt, stage) && eligibleForFocus(prompt, focus),
  ).length;
}

/**
 * Validates the learner-safe publication boundary without importing its operator review sidecar.
 * The manifest pins the sidecar-bound hashes that were accepted for the 46 promoted prompts and
 * separately names the four original reviewed prototype prompts.
 */
export function validateRestaurantSourcePublication(
  prompts: readonly PracticePrompt[],
  promotedArtifact: unknown = restaurantPromptsJson,
): RestaurantPublicationValidation {
  try {
    const promoted = loadPromotedPrototypePrompts(promotedArtifact);
    const authority = RESTAURANT_SERVING_MANIFEST.publicationAuthority;
    if (
      promoted.state !== "promoted" ||
      !promoted.prototypeOnly ||
      promoted.collectionId !== RESTAURANT_SERVING_MANIFEST.collectionId ||
      promoted.prompts.length !== authority.promotedPromptCount ||
      promoted.sourceRunId !== authority.sourceRunId ||
      promoted.sourceCandidateHash !== authority.sourceCandidateHash ||
      promoted.reviewedContentHash !== authority.reviewedContentHash ||
      promoted.promotedContentHash !== authority.promotedContentHash
    ) {
      return { status: "invalid", reason: "source_integrity_failed" };
    }

    const promptIds = prompts.map((prompt) => prompt.id);
    const uniqueIds = new Set(promptIds);
    const promotedIds = new Set(promoted.prompts.map((prompt) => prompt.id));
    const originalIds = new Set<string>(authority.originalReviewedPromptIds);
    if (
      prompts.length !== RESTAURANT_SERVING_MANIFEST.expectedPromptCount ||
      uniqueIds.size !== prompts.length ||
      promptIds.some((id) => !promotedIds.has(id) && !originalIds.has(id)) ||
      [...promotedIds].some((id) => !uniqueIds.has(id)) ||
      [...originalIds].some((id) => !uniqueIds.has(id)) ||
      restaurantPromptPayloadHash(prompts) !== RESTAURANT_SERVING_MANIFEST.promptPayloadSha256
    ) {
      return { status: "invalid", reason: "source_integrity_failed" };
    }

    if (uniqueIds.size < RESTAURANT_SERVING_MANIFEST.minimumPublishedCollectionPrompts) {
      return { status: "invalid", reason: "source_integrity_failed" };
    }

    for (const [stage, focuses] of Object.entries(RESTAURANT_SERVING_MANIFEST.advertisedScopes) as [
      PrototypeLearnerStage,
      readonly PracticeFocus[],
    ][]) {
      for (const focus of focuses) {
        // Every Restaurant prompt supports each typed direction, so the underlying count is the
        // exact per-direction count. `both` never doubles the publication depth.
        if (
          publishedScopeCount(prompts, stage, focus) <
          RESTAURANT_SERVING_MANIFEST.minimumAdvertisedScopePrompts
        ) {
          return { status: "invalid", reason: "source_integrity_failed" };
        }
      }
    }

    return { status: "valid", manifest: RESTAURANT_SERVING_MANIFEST, prompts: [...prompts] };
  } catch {
    return { status: "invalid", reason: "source_integrity_failed" };
  }
}

function unavailable(
  request: PracticeServingSourceRequest,
  reason: PracticeSourceUnavailableReason,
): ResolvePracticeSourceResult {
  return { status: "unavailable", reason, request: { ...request } };
}

/** Resolve the only integrated source in this slice. Other prototype collections stay unsupported. */
export function resolveRestaurantPracticeSource(
  request: PracticeServingSourceRequest,
): ResolvePracticeSourceResult {
  if (request.collectionId !== RESTAURANT_COLLECTION_ID) {
    return unavailable(request, "unsupported_collection");
  }
  if (request.activity !== "type") {
    return unavailable(request, "unsupported_activity");
  }

  const restaurant = practiceSetFixtures.find((set) => set.id === RESTAURANT_COLLECTION_ID);
  if (!restaurant || RESTAURANT_SERVING_MANIFEST.lifecycle !== "active") {
    return unavailable(request, "source_integrity_failed");
  }
  const publication = validateRestaurantSourcePublication(restaurant.prompts);
  if (publication.status === "invalid") {
    return unavailable(request, publication.reason);
  }

  const eligible = publication.prompts
    .map((prompt, authoredOrdinal) => ({ prompt, authoredOrdinal }))
    .filter(
      ({ prompt }) =>
        eligibleAtStage(prompt, request.stage) && eligibleForFocus(prompt, request.focus),
    );
  if (eligible.length === 0) {
    return unavailable(request, "no_eligible_reviewed_items");
  }

  const candidates = eligible.map(({ prompt, authoredOrdinal }): PracticeServingCandidate => ({
    allowedDirections: ["en-es", "es-en"],
    authoredOrdinal,
    collectionId: RESTAURANT_COLLECTION_ID,
    collectionVersion: RESTAURANT_COLLECTION_VERSION,
    itemId: prompt.id,
    itemVersion: RESTAURANT_ITEM_VERSION,
    lifecycle: "active",
    publicationAuthority: "reviewed-prototype",
  }));

  return {
    status: "ready",
    source: {
      candidates,
      collectionLifecycle: "active",
      manifestSchemaVersion: RESTAURANT_SERVING_MANIFEST.schemaVersion,
      promptPayloadSha256: RESTAURANT_SERVING_MANIFEST.promptPayloadSha256,
      prompts: eligible.map(({ prompt }) => prompt),
      publication: {
        authority: "reviewed-prototype",
        canonical: false,
        launchApproved: false,
        prototypeOnly: true,
      },
      scope: {
        ...request,
        collectionId: RESTAURANT_COLLECTION_ID,
        collectionVersion: RESTAURANT_COLLECTION_VERSION,
      },
    },
  };
}
