import { describe, expect, it } from "vitest";

import { acceptedPracticeAnswerTexts } from "./practice-prompt-contract";

describe("practice prompt answer consumption", () => {
  it("joins canonical and AcceptedEntry target text while removing normalized duplicates", () => {
    expect(
      acceptedPracticeAnswerTexts("The check, please.", [
        "The check, please.",
        { text: "The bill, please.", region: "US" },
      ]),
    ).toEqual(["The check, please."]);
    expect(
      acceptedPracticeAnswerTexts(
        "The check, please.",
        [{ text: "The bill, please.", region: "US" }],
        "US",
      ),
    ).toEqual(["The check, please.", "The bill, please."]);
  });
});
