import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";

import { LessonCatalog } from "./lesson-catalog";
import { LessonPracticePreview } from "./lesson-practice-preview";
import { PracticeWorkspace } from "./practice-workspace";

expect.extend(toHaveNoViolations);

describe("prototype-aligned screen semantics", () => {
  it("keeps the lesson catalog accessible", async () => {
    const { container } = render(<LessonCatalog />);
    expect(
      screen.getByRole("link", { name: /Start lesson/i }),
    ).toHaveAttribute("href", "/lessons/intermediate/tell-what-happened");
    expect(
      screen.getByRole("link", { name: /Hola: greetings and introducing yourself/i }),
    ).toHaveAttribute("href", "/lessons/1");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps the lesson practice preview accessible", async () => {
    const { container } = render(<LessonPracticePreview />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps the practice workspace accessible", async () => {
    const { container } = render(<PracticeWorkspace />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
