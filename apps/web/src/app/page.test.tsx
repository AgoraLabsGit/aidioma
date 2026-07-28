import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "@/components/app-shell";

import HomePage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

expect.extend(toHaveNoViolations);

describe("HomePage", () => {
  it("renders the canonical first lesson with truthful first-run values", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "Hola." })).toBeInTheDocument();
    expect(screen.getAllByText("0")).toHaveLength(3);
    expect(screen.getByText("0 due")).toBeInTheDocument();
    expect(
      screen.getByText("Lesson 1 · Hola: greetings and introducing yourself"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No weak areas yet", { exact: true }),
    ).toBeInTheDocument();

    expect(screen.queryByText("Hola, Mike")).not.toBeInTheDocument();
    expect(screen.queryByText("47")).not.toBeInTheDocument();
    expect(screen.queryByText("23")).not.toBeInTheDocument();
    expect(screen.queryByText("58%", { exact: false })).not.toBeInTheDocument();
  });

  it("has no detectable axe violations in the application shell", async () => {
    const { container } = render(
      <AppShell>
        <HomePage />
      </AppShell>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
