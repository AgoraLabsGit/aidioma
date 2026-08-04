import {
  resumePracticeServing,
  type PracticeServingState,
  type ServingSourceIdentity,
  type ServingStartResult,
} from "./serving-engine";

export const IN_MEMORY_PRACTICE_VISIT_SCHEMA_VERSION = 1 as const;

type VisitCheckpointEnvelope<ApplicationState> = {
  applicationSchemaVersion: typeof IN_MEMORY_PRACTICE_VISIT_SCHEMA_VERSION;
  applicationState: ApplicationState;
  servingState: PracticeServingState;
};

export type DecodedPracticeVisit<ApplicationState> =
  | {
      applicationState: ApplicationState;
      servingState: PracticeServingState;
      status: "decoded";
    }
  | {
      reason: "resume_incompatible";
      status: "unavailable";
    };

export type RestoredPracticeVisit<ApplicationState> =
  | {
      applicationState: ApplicationState;
      decision: ServingStartResult;
      status: "restored";
    }
  | {
      reason: "resume_incompatible";
      status: "unavailable";
    };

/**
 * A serialized, current-page-only boundary. Ownership stays in React memory; this helper never
 * writes browser storage and therefore makes no refresh, device, or durable-resume promise.
 */
export function checkpointPracticeVisit<ApplicationState>(
  applicationState: ApplicationState,
  servingState: PracticeServingState,
): string {
  return JSON.stringify({
    applicationSchemaVersion: IN_MEMORY_PRACTICE_VISIT_SCHEMA_VERSION,
    applicationState,
    servingState,
  } satisfies VisitCheckpointEnvelope<ApplicationState>);
}

export function restorePracticeVisit<ApplicationState>(
  serialized: string,
  availableSources: readonly ServingSourceIdentity[],
): RestoredPracticeVisit<ApplicationState> {
  const decoded = readPracticeVisitCheckpoint<ApplicationState>(serialized);
  if (decoded.status === "unavailable") return decoded;
  return {
    status: "restored",
    applicationState: decoded.applicationState,
    decision: resumePracticeServing(decoded.servingState, availableSources),
  };
}

export function readPracticeVisitCheckpoint<ApplicationState>(
  serialized: string,
): DecodedPracticeVisit<ApplicationState> {
  try {
    const parsed = JSON.parse(serialized) as Partial<VisitCheckpointEnvelope<ApplicationState>>;
    if (
      parsed.applicationSchemaVersion !== IN_MEMORY_PRACTICE_VISIT_SCHEMA_VERSION ||
      parsed.applicationState === undefined ||
      !parsed.servingState ||
      typeof parsed.servingState !== "object"
    ) {
      return { status: "unavailable", reason: "resume_incompatible" };
    }

    return {
      status: "decoded",
      applicationState: parsed.applicationState,
      servingState: parsed.servingState,
    };
  } catch {
    return { status: "unavailable", reason: "resume_incompatible" };
  }
}
