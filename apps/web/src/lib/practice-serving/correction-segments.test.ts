import { describe, expect, it } from "vitest";

import { correctionSegments } from "./correction-segments";

describe("correctionSegments", () => {
  it("marks spelling and changed spans on the reference answer", () => {
    expect(
      correctionSegments({
        text: "Vos vivís acá.",
        highlights: [
          { start: 4, end: 9, kind: "spelling" },
          { start: 10, end: 13, kind: "different" },
        ],
      }),
    ).toEqual([
      { key: "plain-0", value: "Vos " },
      { className: "correction-segment correction-close", key: "mark-0-4", value: "vivís" },
      { key: "plain-9", value: " " },
      { className: "correction-segment correction-changed", key: "mark-1-10", value: "acá" },
      { key: "plain-13", value: "." },
    ]);
  });
});
