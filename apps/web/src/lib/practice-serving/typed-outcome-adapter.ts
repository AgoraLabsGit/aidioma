import {
  advancePracticeServing,
  type PracticeServingState,
  type ServingCommand,
  type ServingTransitionResult,
} from "./serving-engine";

export type TypedEvaluationVerdict = "correct" | "close" | "wrong";

export function servingCommandForTypedVerdict(
  verdict: TypedEvaluationVerdict,
): ServingCommand {
  return verdict === "correct" ? "retrieved" : "needs_reinforcement";
}

export function applyTypedEvaluationOutcome(
  state: PracticeServingState,
  offerOrdinal: number,
  verdict: TypedEvaluationVerdict,
): ServingTransitionResult {
  return advancePracticeServing(
    state,
    offerOrdinal,
    servingCommandForTypedVerdict(verdict),
  );
}

export function deferTypedEvaluationWithoutEvidence(
  state: PracticeServingState,
  offerOrdinal: number,
): ServingTransitionResult {
  return advancePracticeServing(state, offerOrdinal, "defer_without_evidence");
}
