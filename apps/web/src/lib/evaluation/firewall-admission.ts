import "server-only";

import { checkRateLimit } from "@vercel/firewall";

export const EVALUATION_FIREWALL_RATE_LIMIT_ID = "aidioma-evaluate-user";
export const EVALUATION_FIREWALL_RETRY_AFTER_SECONDS = 60;

export type EvaluationPerimeterAdmission =
  | { allowed: true }
  | { allowed: false; kind: "rate-limited"; retryAfterSeconds: number }
  | {
      allowed: false;
      kind: "unavailable";
      failure: "not-found" | "blocked" | "sdk-error" | "unexpected";
    };

export type EvaluationPerimeterAdmitter = (
  userKey: string,
  headers: Headers,
) => Promise<EvaluationPerimeterAdmission>;

export type FirewallRateLimitCheck = (
  rateLimitId: string,
  options: { rateLimitKey: string; headers: Headers },
) => Promise<unknown>;

type FirewallRateLimitResult = {
  rateLimited: boolean;
  error?: "not-found" | "blocked";
};

function isFirewallRateLimitResult(value: unknown): value is FirewallRateLimitResult {
  if (typeof value !== "object" || value === null || !("rateLimited" in value)) {
    return false;
  }
  if (typeof value.rateLimited !== "boolean") return false;
  if (!("error" in value) || value.error === undefined) return true;
  return value.error === "not-found" || value.error === "blocked";
}

/**
 * Checks the Vercel Firewall's user-keyed regional counter. The local
 * admission controller remains a separate burst/concurrency/duplicate guard.
 */
export function createFirewallEvaluationAdmitter(
  check: FirewallRateLimitCheck = checkRateLimit,
): EvaluationPerimeterAdmitter {
  return async (userKey, headers) => {
    let result: unknown;
    try {
      result = await check(EVALUATION_FIREWALL_RATE_LIMIT_ID, {
        rateLimitKey: userKey,
        headers,
      });
    } catch {
      return { allowed: false, kind: "unavailable", failure: "sdk-error" };
    }

    if (!isFirewallRateLimitResult(result)) {
      return { allowed: false, kind: "unavailable", failure: "unexpected" };
    }
    if (result.error !== undefined) {
      return { allowed: false, kind: "unavailable", failure: result.error };
    }
    if (result.rateLimited) {
      return {
        allowed: false,
        kind: "rate-limited",
        retryAfterSeconds: EVALUATION_FIREWALL_RETRY_AFTER_SECONDS,
      };
    }
    return { allowed: true };
  };
}

export const admitEvaluationAtPerimeter = createFirewallEvaluationAdmitter();
