import { describe, expect, it } from "vitest";

import { POST } from "./route";

describe("retired prototype Practice grader", () => {
  it("directs answers through the authenticated session command", async () => {
    const response = await POST();
    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toEqual({
      error: "session_command_required",
      message: "Submit answers through the active Practice session.",
    });
  });
});
