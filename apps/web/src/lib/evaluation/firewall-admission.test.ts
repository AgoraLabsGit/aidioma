import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  EVALUATION_FIREWALL_RATE_LIMIT_ID,
  EVALUATION_FIREWALL_RETRY_AFTER_SECONDS,
  createFirewallEvaluationAdmitter,
  type FirewallRateLimitCheck,
} from "./firewall-admission";

const userKey = "usr_0123456789abcdef0123456789abcdef";
const headers = new Headers({ "x-vercel-id": "safe-request-metadata" });

describe("Firewall evaluation admission", () => {
  it("allows and keys the configured Firewall rule by opaque user", async () => {
    const check = vi.fn<FirewallRateLimitCheck>().mockResolvedValue({ rateLimited: false });

    await expect(createFirewallEvaluationAdmitter(check)(userKey, headers)).resolves.toEqual({
      allowed: true,
    });
    expect(check).toHaveBeenCalledWith(EVALUATION_FIREWALL_RATE_LIMIT_ID, {
      rateLimitKey: userKey,
      headers,
    });
  });

  it("returns a bounded retry window when the Firewall counter limits the user", async () => {
    const check = vi.fn<FirewallRateLimitCheck>().mockResolvedValue({ rateLimited: true });

    await expect(createFirewallEvaluationAdmitter(check)(userKey, headers)).resolves.toEqual({
      allowed: false,
      kind: "rate-limited",
      retryAfterSeconds: EVALUATION_FIREWALL_RETRY_AFTER_SECONDS,
    });
  });

  it.each(["not-found", "blocked"] as const)(
    "fails closed when the Firewall SDK reports %s",
    async (failure) => {
      const check = vi
        .fn<FirewallRateLimitCheck>()
        .mockResolvedValue({ rateLimited: false, error: failure });

      await expect(createFirewallEvaluationAdmitter(check)(userKey, headers)).resolves.toEqual({
        allowed: false,
        kind: "unavailable",
        failure,
      });
    },
  );

  it("fails closed without exposing a thrown SDK error", async () => {
    const check = vi
      .fn<FirewallRateLimitCheck>()
      .mockRejectedValue(new Error("sensitive perimeter detail"));

    const result = await createFirewallEvaluationAdmitter(check)(userKey, headers);

    expect(result).toEqual({ allowed: false, kind: "unavailable", failure: "sdk-error" });
    expect(JSON.stringify(result)).not.toContain("sensitive perimeter detail");
  });

  it.each([null, {}, { rateLimited: "no" }, { rateLimited: false, error: "other" }])(
    "fails closed on an unexpected SDK result: %j",
    async (sdkResult) => {
      const check = vi.fn<FirewallRateLimitCheck>().mockResolvedValue(sdkResult);

      await expect(createFirewallEvaluationAdmitter(check)(userKey, headers)).resolves.toEqual({
        allowed: false,
        kind: "unavailable",
        failure: "unexpected",
      });
    },
  );
});
