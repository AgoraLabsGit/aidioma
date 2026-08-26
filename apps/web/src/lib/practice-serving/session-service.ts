import { randomUUID } from "node:crypto";

import type { DialectProfile } from "@aidioma/lesson-schema";

import type { PracticeGradedEvaluation } from "@/lib/practice-sets/evaluation-contract";

import {
  advanceAdaptivePracticeSession,
  startAdaptivePracticeSession,
  type AdaptivePracticeSession,
  type LearnerItemEvidence,
  type PracticeAttemptEvidence,
  type PracticeSourceScope,
} from "./adaptive-session";
import {
  DEFAULT_PROMOTED_COLLECTION_ID,
  resolvePromotedPracticeSource,
  resolvePromotedPracticeCollection,
  type PromotedPracticeItem,
  type PromotedPracticeSourceResult,
} from "./promoted-source";

export type RetainedSessionStatus = "active" | "paused" | "ended";

export type RetainedAdaptiveSession = {
  learnerId: string;
  revision: number;
  session: AdaptivePracticeSession;
  status: RetainedSessionStatus;
};

export type CommitPracticeAnswerInput = {
  attempt: PracticeAttemptEvidence;
  evidence: LearnerItemEvidence;
  expectedOfferOrdinal: number;
  expectedRevision: number;
  learnerId: string;
  nextSession: AdaptivePracticeSession;
  sessionId: string;
};

export interface PracticeSessionRepository {
  commitAnswer(input: CommitPracticeAnswerInput): Promise<RetainedAdaptiveSession | "conflict">;
  createSession(record: RetainedAdaptiveSession): Promise<RetainedAdaptiveSession>;
  findResumable(learnerId: string): Promise<RetainedAdaptiveSession | null>;
  findSession(learnerId: string, sessionId: string): Promise<RetainedAdaptiveSession | null>;
  learnerEvidence(
    learnerId: string,
    itemIds: readonly string[],
  ): Promise<Record<string, LearnerItemEvidence>>;
  savedItemIds(learnerId: string): Promise<string[]>;
  unlockedCollectionIds(learnerId: string): Promise<string[]>;
  setStatus(
    learnerId: string,
    sessionId: string,
    expectedRevision: number,
    status: RetainedSessionStatus,
  ): Promise<RetainedAdaptiveSession | "conflict" | null>;
  setSaved(
    learnerId: string,
    item: PromotedPracticeItem,
    source: PracticeSourceScope,
    saved: boolean,
  ): Promise<string[]>;
}

export type PracticeSessionEvaluation =
  | { status: "graded"; evaluation: PracticeGradedEvaluation }
  | { status: "ungraded"; message: string; retryable: boolean };

export interface PracticeSessionEvaluator {
  evaluate(input: {
    answer: string;
    item: PromotedPracticeItem;
    learnerId: string;
    signal?: AbortSignal;
  }): Promise<PracticeSessionEvaluation>;
}

export type PracticeSessionFailure =
  | "answer_ungraded"
  | "empty_saved_scope"
  | "no_promoted_content"
  | "session_conflict"
  | "session_not_found"
  | "session_not_resumable";

export type PracticeSessionCommandResult<T> =
  | { ok: true; value: T }
  | { ok: false; failure: PracticeSessionFailure; message: string; retryable?: boolean };

function fail(
  failure: PracticeSessionFailure,
  message: string,
  retryable?: boolean,
): PracticeSessionCommandResult<never> {
  return { ok: false, failure, message, ...(retryable === undefined ? {} : { retryable }) };
}

function matchesRequestedSession(
  record: RetainedAdaptiveSession,
  proposed: RetainedAdaptiveSession,
): boolean {
  return record.learnerId === proposed.learnerId &&
    record.session.profile === proposed.session.profile &&
    record.session.source.kind === proposed.session.source.kind &&
    record.session.source.id === proposed.session.source.id;
}

export class PracticeSessionService {
  constructor(
    private readonly repository: PracticeSessionRepository,
    private readonly evaluator: PracticeSessionEvaluator,
    private readonly options: {
      now?: () => Date;
      randomId?: () => string;
      resolveCollection?: (
        profile: DialectProfile,
        collectionId?: string,
      ) => PromotedPracticeSourceResult;
      resolveSource?: (profile: DialectProfile) => PromotedPracticeSourceResult;
      seed?: () => string;
    } = {},
  ) {}

  private now(): Date {
    return this.options.now?.() ?? new Date();
  }

  private resolveFor(
    profile: DialectProfile,
    source: PracticeSourceScope,
  ): PromotedPracticeSourceResult {
    return source.kind === "collection"
      ? (this.options.resolveCollection ?? resolvePromotedPracticeCollection)(profile, source.id)
      : (this.options.resolveSource ?? resolvePromotedPracticeSource)(profile);
  }

  private async validateRetained(
    record: RetainedAdaptiveSession,
  ): Promise<PracticeSessionCommandResult<RetainedAdaptiveSession>> {
    const promoted = this.resolveFor(record.session.profile, record.session.source);
    if (promoted.status !== "ready") {
      return fail("no_promoted_content", "This reviewed practice is no longer available.");
    }
    const expectedSource: PracticeSourceScope = record.session.source.kind === "saved"
      ? {
          ...promoted.source,
          id: "saved.all",
          kind: "saved",
          title: "All saved",
        }
      : { ...promoted.source, kind: record.session.source.kind };
    const sourceMatches =
      record.session.source.id === expectedSource.id &&
      record.session.source.kind === expectedSource.kind &&
      record.session.source.version === expectedSource.version;
    const promotedById = new Map(promoted.items.map((item) => [item.itemId, item]));
    const retainedItemsMatch = record.session.items.every((item) => {
      const current = promotedById.get(item.itemId);
      return current !== undefined && JSON.stringify(item) === JSON.stringify(current);
    });
    const completeScope =
      record.session.source.kind === "saved" ||
      record.session.items.length === promoted.items.length;
    if (!sourceMatches || !retainedItemsMatch || !completeScope) {
      return fail("no_promoted_content", "This reviewed practice has changed and cannot be resumed.");
    }
    if (
      record.session.source.kind === "collection" &&
      record.session.source.id !== DEFAULT_PROMOTED_COLLECTION_ID
    ) {
      const unlocked = await this.repository.unlockedCollectionIds(record.learnerId);
      if (!unlocked.includes(record.session.source.id)) {
        return fail(
          "no_promoted_content",
          "Complete its current lesson before continuing this review collection.",
        );
      }
    }
    return { ok: true, value: record };
  }

  async current(
    learnerId: string,
  ): Promise<PracticeSessionCommandResult<RetainedAdaptiveSession | null>> {
    const record = await this.repository.findResumable(learnerId);
    return record ? this.validateRetained(record) : { ok: true, value: null };
  }

  async start(input: {
    learnerId: string;
    profile: DialectProfile;
    sourceId?: string;
    sourceKind: PracticeSourceScope["kind"];
  }): Promise<PracticeSessionCommandResult<RetainedAdaptiveSession>> {
    const promoted = input.sourceKind === "collection"
      ? (this.options.resolveCollection ?? resolvePromotedPracticeCollection)(input.profile, input.sourceId)
      : (this.options.resolveSource ?? resolvePromotedPracticeSource)(input.profile);
    if (promoted.status === "unavailable") {
      return fail("no_promoted_content", "Reviewed practice is unavailable right now.");
    }
    let items = promoted.items;
    let source: PracticeSourceScope = { ...promoted.source, kind: input.sourceKind };
    if (input.sourceId && input.sourceId !== DEFAULT_PROMOTED_COLLECTION_ID) {
      const unlocked = await this.repository.unlockedCollectionIds(input.learnerId);
      if (!unlocked.includes(input.sourceId)) {
        return fail("no_promoted_content", "Complete its lesson before starting this review collection.");
      }
    }
    if (input.sourceKind === "saved") {
      const savedIds = new Set(await this.repository.savedItemIds(input.learnerId));
      items = items.filter((item) => savedIds.has(item.itemId));
      source = {
        ...source,
        id: "saved.all",
        title: "All saved",
        version: promoted.source.version,
      };
      if (items.length === 0) {
        return fail("empty_saved_scope", "Save an item before starting All saved practice.");
      }
    }
    const existing = await this.repository.findResumable(input.learnerId);
    if (
      existing &&
      existing.session.profile === input.profile &&
      existing.session.source.kind === source.kind &&
      existing.session.source.id === source.id
    ) {
      const retained = await this.validateRetained(existing);
      if (retained.ok) return retained;
    }
    if (existing) {
      const ended = await this.repository.setStatus(
        input.learnerId,
        existing.session.sessionId,
        existing.revision,
        "ended",
      );
      if (ended === "conflict") {
        return fail("session_conflict", "Practice changed in another request. Refresh and continue.");
      }
      if (!ended) return fail("session_not_found", "This practice session is unavailable.");
    }
    const evidenceByItemId = await this.repository.learnerEvidence(
      input.learnerId,
      items.map((item) => item.itemId),
    );
    const session = startAdaptivePracticeSession({
      evidenceByItemId,
      items,
      now: this.now().toISOString(),
      profile: input.profile,
      seed: this.options.seed?.() ?? randomUUID(),
      sessionId: this.options.randomId?.() ?? randomUUID(),
      source,
    });
    const proposed: RetainedAdaptiveSession = {
        learnerId: input.learnerId,
        revision: 1,
        session,
        status: "active",
      };
    let created = await this.repository.createSession(proposed);
    if (!matchesRequestedSession(created, proposed)) {
      return fail("session_conflict", "Another practice session started first. Refresh and continue.");
    }
    let retained = await this.validateRetained(created);
    if (!retained.ok) {
      const ended = await this.repository.setStatus(
        input.learnerId,
        created.session.sessionId,
        created.revision,
        "ended",
      );
      if (ended === "conflict" || !ended) {
        return fail("session_conflict", "Another practice session started first. Refresh and continue.");
      }
      created = await this.repository.createSession(proposed);
      if (!matchesRequestedSession(created, proposed)) {
        return fail("session_conflict", "Another practice session started first. Refresh and continue.");
      }
      retained = await this.validateRetained(created);
    }
    return retained;
  }

  async answer(input: {
    answer: string;
    learnerId: string;
    offerOrdinal: number;
    sessionId: string;
    signal?: AbortSignal;
  }): Promise<PracticeSessionCommandResult<{
    evaluation: PracticeGradedEvaluation;
    record: RetainedAdaptiveSession;
  }>> {
    const record = await this.repository.findSession(input.learnerId, input.sessionId);
    if (!record) return fail("session_not_found", "This practice session is unavailable.");
    if (record.status !== "active") {
      return fail("session_not_resumable", "Resume this session before answering.");
    }
    const validated = await this.validateRetained(record);
    if (!validated.ok) return validated;
    if (record.session.currentOffer.ordinal !== input.offerOrdinal) {
      return fail("session_conflict", "Practice moved forward in another request. Refresh and continue.");
    }
    const item = record.session.items.find(
      (candidate) => candidate.itemId === record.session.currentOffer.itemId,
    );
    if (!item) return fail("no_promoted_content", "The reviewed item is unavailable.");
    const evaluationResult = await this.evaluator.evaluate({
      answer: input.answer,
      item,
      learnerId: input.learnerId,
      signal: input.signal,
    });
    if (evaluationResult.status === "ungraded") {
      return fail(
        "answer_ungraded",
        evaluationResult.message,
        evaluationResult.retryable,
      );
    }
    const nextSession = advanceAdaptivePracticeSession(
      record.session,
      input.offerOrdinal,
      input.answer,
      evaluationResult.evaluation,
      this.now().toISOString(),
    );
    const attempt = nextSession.attempts.at(-1);
    const evidence = nextSession.evidenceByItemId[item.itemId];
    if (!attempt || !evidence) {
      return fail("session_conflict", "Practice evidence could not be retained.");
    }
    const committed = await this.repository.commitAnswer({
      attempt,
      evidence,
      expectedOfferOrdinal: input.offerOrdinal,
      expectedRevision: record.revision,
      learnerId: input.learnerId,
      nextSession,
      sessionId: input.sessionId,
    });
    if (committed === "conflict") {
      return fail("session_conflict", "Practice moved forward in another request. Refresh and continue.");
    }
    return {
      ok: true,
      value: { evaluation: evaluationResult.evaluation, record: committed },
    };
  }

  async changeStatus(input: {
    learnerId: string;
    sessionId: string;
    status: RetainedSessionStatus;
  }): Promise<PracticeSessionCommandResult<RetainedAdaptiveSession>> {
    const record = await this.repository.findSession(input.learnerId, input.sessionId);
    if (!record) return fail("session_not_found", "This practice session is unavailable.");
    const transitionAllowed =
      (input.status === "paused" && record.status === "active") ||
      (input.status === "active" && record.status === "paused") ||
      (input.status === "ended" && record.status !== "ended");
    if (!transitionAllowed) {
      return fail("session_not_resumable", "That session transition is no longer available.");
    }
    if (input.status === "active") {
      const validated = await this.validateRetained(record);
      if (!validated.ok) return validated;
    }
    const next = await this.repository.setStatus(
      input.learnerId,
      input.sessionId,
      record.revision,
      input.status,
    );
    if (next === "conflict") {
      return fail("session_conflict", "Practice changed in another request. Refresh and continue.");
    }
    if (!next) return fail("session_not_found", "This practice session is unavailable.");
    return { ok: true, value: next };
  }

  async setSaved(input: {
    itemId: string;
    learnerId: string;
    saved: boolean;
    sessionId: string;
  }): Promise<PracticeSessionCommandResult<string[]>> {
    const record = await this.repository.findSession(input.learnerId, input.sessionId);
    if (!record) return fail("session_not_found", "This practice session is unavailable.");
    const validated = await this.validateRetained(record);
    if (!validated.ok) return validated;
    const item = record.session.items.find((candidate) => candidate.itemId === input.itemId);
    if (!item) return fail("no_promoted_content", "The reviewed item is unavailable.");
    return {
      ok: true,
      value: await this.repository.setSaved(
        input.learnerId,
        item,
        record.session.source,
        input.saved,
      ),
    };
  }

  async savedItemIds(learnerId: string): Promise<string[]> {
    return this.repository.savedItemIds(learnerId);
  }

  async unlockedCollectionIds(learnerId: string): Promise<string[]> {
    return this.repository.unlockedCollectionIds(learnerId);
  }
}
