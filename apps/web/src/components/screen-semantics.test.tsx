import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";

import { LessonCatalog } from "./lesson-catalog";
import { LessonPracticePreview } from "./lesson-practice-preview";
import { PracticeWorkspace, type PracticeSessionClient } from "./practice-workspace";

const idlePracticeClient: PracticeSessionClient = {
  async load() {
    return { savedItemIds: [], session: null };
  },
  async command() {
    return { savedItemIds: [], session: null };
  },
};

expect.extend(toHaveNoViolations);

describe("prototype-aligned screen semantics", () => {
  it("keeps the lesson catalog accessible", async () => {
    const { container } = render(<LessonCatalog />);
    expect(
      screen.getByRole("link", { name: /Start lesson/i }),
    ).toHaveAttribute("href", "/lessons/intermediate/tell-what-happened");
    expect(
      screen.getByRole("link", { name: /Living here/i }),
    ).toHaveAttribute("href", "/lessons/1");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps the lesson practice preview accessible", async () => {
    const { container } = render(<LessonPracticePreview />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps the practice workspace accessible", async () => {
    const { container } = render(<PracticeWorkspace client={idlePracticeClient} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
