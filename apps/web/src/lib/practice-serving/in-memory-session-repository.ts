import type { LearnerItemEvidence } from "./adaptive-session";
import type {
  CommitPracticeAnswerInput,
  PracticeSessionRepository,
  RetainedAdaptiveSession,
  RetainedSessionStatus,
} from "./session-service";
import type { PromotedPracticeItem } from "./promoted-source";
import type { PracticeSourceScope } from "./adaptive-session";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class InMemoryPracticeSessionRepository implements PracticeSessionRepository {
  readonly attempts = new Map<string, CommitPracticeAnswerInput["attempt"]>();
  readonly evidence = new Map<string, LearnerItemEvidence>();
  readonly saved = new Map<string, Set<string>>();
  readonly sessions = new Map<string, RetainedAdaptiveSession>();
  readonly unlocked = new Map<string, Set<string>>();

  private sessionKey(learnerId: string, sessionId: string): string {
    return `${learnerId}\u001f${sessionId}`;
  }

  private evidenceKey(learnerId: string, itemId: string): string {
    return `${learnerId}\u001f${itemId}`;
  }

  async createSession(record: RetainedAdaptiveSession): Promise<RetainedAdaptiveSession> {
    const value = clone(record);
    this.sessions.set(this.sessionKey(record.learnerId, record.session.sessionId), value);
    return clone(value);
  }

  async findResumable(learnerId: string): Promise<RetainedAdaptiveSession | null> {
    const match = [...this.sessions.values()].find(
      (record) => record.learnerId === learnerId && record.status !== "ended",
    );
    return match ? clone(match) : null;
  }

  async findSession(learnerId: string, sessionId: string): Promise<RetainedAdaptiveSession | null> {
    const match = this.sessions.get(this.sessionKey(learnerId, sessionId));
    return match ? clone(match) : null;
  }

  async learnerEvidence(
    learnerId: string,
    itemIds: readonly string[],
  ): Promise<Record<string, LearnerItemEvidence>> {
    return Object.fromEntries(
      itemIds.flatMap((itemId) => {
        const evidence = this.evidence.get(this.evidenceKey(learnerId, itemId));
        return evidence ? [[itemId, clone(evidence)] as const] : [];
      }),
    );
  }

  async commitAnswer(input: CommitPracticeAnswerInput): Promise<RetainedAdaptiveSession | "conflict"> {
    const key = this.sessionKey(input.learnerId, input.sessionId);
    const current = this.sessions.get(key);
    const attemptKey = `${input.sessionId}\u001f${input.expectedOfferOrdinal}`;
    if (
      !current ||
      current.revision !== input.expectedRevision ||
      current.status !== "active" ||
      current.session.currentOffer.ordinal !== input.expectedOfferOrdinal ||
      this.attempts.has(attemptKey)
    ) {
      return "conflict";
    }
    this.attempts.set(attemptKey, clone(input.attempt));
    this.evidence.set(
      this.evidenceKey(input.learnerId, input.attempt.itemId),
      clone(input.evidence),
    );
    const next: RetainedAdaptiveSession = {
      ...current,
      revision: current.revision + 1,
      session: clone(input.nextSession),
    };
    this.sessions.set(key, next);
    return clone(next);
  }

  async setStatus(
    learnerId: string,
    sessionId: string,
    expectedRevision: number,
    status: RetainedSessionStatus,
  ): Promise<RetainedAdaptiveSession | "conflict" | null> {
    const key = this.sessionKey(learnerId, sessionId);
    const current = this.sessions.get(key);
    if (!current) return null;
    if (current.revision !== expectedRevision) return "conflict";
    const next = { ...current, revision: current.revision + 1, status };
    this.sessions.set(key, next);
    return clone(next);
  }

  async savedItemIds(learnerId: string): Promise<string[]> {
    return [...(this.saved.get(learnerId) ?? new Set())].sort();
  }

  async unlockedCollectionIds(learnerId: string): Promise<string[]> {
    return [...(this.unlocked.get(learnerId) ?? new Set())].sort();
  }

  async setSaved(
    learnerId: string,
    item: PromotedPracticeItem,
    _source: PracticeSourceScope,
    saved: boolean,
  ): Promise<string[]> {
    const items = new Set(this.saved.get(learnerId) ?? []);
    if (saved) items.add(item.itemId);
    else items.delete(item.itemId);
    this.saved.set(learnerId, items);
    return [...items].sort();
  }
}
