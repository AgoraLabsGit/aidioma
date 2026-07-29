import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { EvaluationAdmissionController } from "./admission-control";

describe("EvaluationAdmissionController", () => {
  it("limits each user within a fixed window and reports a retry delay", () => {
    let now = 1_000;
    const controller = new EvaluationAdmissionController({
      now: () => now,
      windowMs: 10_000,
      maxRequests: 2,
    });

    const first = controller.admit("user-a", "request-1");
    expect(first.allowed).toBe(true);
    if (first.allowed) first.release();
    const second = controller.admit("user-a", "request-2");
    expect(second.allowed).toBe(true);
    if (second.allowed) second.release();

    expect(controller.admit("user-a", "request-3")).toEqual({
      allowed: false,
      retryAfterSeconds: 10,
    });
    expect(controller.admit("user-b", "request-1").allowed).toBe(true);

    now += 10_000;
    expect(controller.admit("user-a", "request-4").allowed).toBe(true);
  });

  it("rejects excess concurrency and identical in-flight work, then releases safely", () => {
    const controller = new EvaluationAdmissionController({
      maxConcurrent: 2,
      maxRequests: 10,
    });
    const first = controller.admit("user-a", "same");
    const second = controller.admit("user-a", "different");

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(controller.admit("user-a", "same").allowed).toBe(false);
    expect(controller.admit("user-a", "third").allowed).toBe(false);

    if (first.allowed) {
      first.release();
      first.release();
    }
    expect(controller.admit("user-a", "same").allowed).toBe(true);
  });

  it("fails closed for new users when only active entries fill its memory bound", () => {
    const controller = new EvaluationAdmissionController({ maxUsers: 1 });
    const active = controller.admit("user-a", "request-1");
    expect(active.allowed).toBe(true);
    expect(controller.admit("user-b", "request-1")).toEqual({
      allowed: false,
      retryAfterSeconds: 1,
    });
  });
});
