import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";

import { LessonCatalog } from "./lesson-catalog";
import { PracticeWorkspace } from "./practice-workspace";

expect.extend(toHaveNoViolations);

describe("prototype-aligned screen semantics", () => {
  it("keeps the lesson catalog accessible", async () => {
    const { container } = render(<LessonCatalog />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps the practice workspace accessible", async () => {
    const { container } = render(<PracticeWorkspace />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
