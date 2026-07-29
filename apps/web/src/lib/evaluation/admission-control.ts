import "server-only";

export const EVALUATION_RATE_WINDOW_MS = 60_000;
export const EVALUATION_RATE_MAX_REQUESTS = 30;
export const EVALUATION_MAX_CONCURRENT_REQUESTS = 2;
const EVALUATION_ADMISSION_MAX_USERS = 10_000;

type UserAdmissionState = {
  windowStartedAt: number;
  requestCount: number;
  activeCount: number;
  activeFingerprints: Set<string>;
  lastSeenAt: number;
};

export type EvaluationAdmission =
  | { allowed: false; retryAfterSeconds: number }
  | { allowed: true; release: () => void };

export type EvaluationAdmitter = (
  userKey: string,
  requestFingerprint: string,
) => EvaluationAdmission;

type EvaluationAdmissionControllerOptions = {
  now?: () => number;
  windowMs?: number;
  maxRequests?: number;
  maxConcurrent?: number;
  maxUsers?: number;
};

/**
 * A per-instance abuse and duplicate-work guard. The production perimeter must
 * also enforce a distributed Gateway or WAF quota because serverless instances
 * do not share memory.
 */
export class EvaluationAdmissionController {
  readonly #now: () => number;
  readonly #windowMs: number;
  readonly #maxRequests: number;
  readonly #maxConcurrent: number;
  readonly #maxUsers: number;
  readonly #users = new Map<string, UserAdmissionState>();

  constructor(options: EvaluationAdmissionControllerOptions = {}) {
    this.#now = options.now ?? Date.now;
    this.#windowMs = options.windowMs ?? EVALUATION_RATE_WINDOW_MS;
    this.#maxRequests = options.maxRequests ?? EVALUATION_RATE_MAX_REQUESTS;
    this.#maxConcurrent = options.maxConcurrent ?? EVALUATION_MAX_CONCURRENT_REQUESTS;
    this.#maxUsers = options.maxUsers ?? EVALUATION_ADMISSION_MAX_USERS;
  }

  #prune(now: number): void {
    if (this.#users.size < this.#maxUsers) return;

    for (const [userKey, state] of this.#users) {
      if (state.activeCount === 0 && now - state.lastSeenAt >= this.#windowMs) {
        this.#users.delete(userKey);
      }
    }

    while (this.#users.size >= this.#maxUsers) {
      const oldestIdle = [...this.#users.entries()]
        .filter(([, state]) => state.activeCount === 0)
        .sort((left, right) => left[1].lastSeenAt - right[1].lastSeenAt)[0];
      if (!oldestIdle) break;
      this.#users.delete(oldestIdle[0]);
    }
  }

  admit(userKey: string, requestFingerprint: string): EvaluationAdmission {
    const now = this.#now();
    this.#prune(now);

    let state = this.#users.get(userKey);
    if (!state) {
      if (this.#users.size >= this.#maxUsers) {
        return { allowed: false, retryAfterSeconds: 1 };
      }
      state = {
        windowStartedAt: now,
        requestCount: 0,
        activeCount: 0,
        activeFingerprints: new Set(),
        lastSeenAt: now,
      };
      this.#users.set(userKey, state);
    }

    if (now - state.windowStartedAt >= this.#windowMs) {
      state.windowStartedAt = now;
      state.requestCount = 0;
    }
    state.lastSeenAt = now;

    if (
      state.activeCount >= this.#maxConcurrent ||
      state.activeFingerprints.has(requestFingerprint)
    ) {
      return { allowed: false, retryAfterSeconds: 1 };
    }

    if (state.requestCount >= this.#maxRequests) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((state.windowStartedAt + this.#windowMs - now) / 1_000),
        ),
      };
    }

    state.requestCount += 1;
    state.activeCount += 1;
    state.activeFingerprints.add(requestFingerprint);
    let released = false;

    return {
      allowed: true,
      release: () => {
        if (released) return;
        released = true;
        state.activeCount = Math.max(0, state.activeCount - 1);
        state.activeFingerprints.delete(requestFingerprint);
      },
    };
  }
}

const sharedController = new EvaluationAdmissionController();

export const admitEvaluation: EvaluationAdmitter = (userKey, requestFingerprint) =>
  sharedController.admit(userKey, requestFingerprint);
