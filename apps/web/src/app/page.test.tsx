import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";

import { AppShell } from "@/components/app-shell";

import HomePage from "./page";

expect.extend(toHaveNoViolations);

describe("HomePage", () => {
  it("renders truthful first-run values", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Buenos días." }),
    ).toBeInTheDocument();
    expect(screen.getByText("0 days")).toBeInTheDocument();
    expect(screen.getAllByText("0")).toHaveLength(2);
    expect(screen.getByText("0 of 50 points")).toBeInTheDocument();
    expect(
      screen.getByText("No sample progress has been added for you.", {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("has no detectable axe violations", async () => {
    const { container } = render(
      <AppShell>
        <HomePage />
      </AppShell>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
