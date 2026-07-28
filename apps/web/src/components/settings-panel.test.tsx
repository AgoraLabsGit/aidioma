import { fireEvent, render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { SettingsPanel } from "./settings-panel";

const { setTheme } = vi.hoisted(() => ({ setTheme: vi.fn() }));

vi.mock("next-themes", () => ({
  useTheme: () => ({ setTheme, theme: "system" }),
}));

expect.extend(toHaveNoViolations);

describe("SettingsPanel", () => {
  it("offers one daily-goal slider and Auto, Light, and Dark theme choices", () => {
    render(<SettingsPanel />);

    const slider = screen.getByRole("slider", { name: "Daily goal" });
    expect(slider).toHaveValue("50");
    expect(screen.getByText("50 exercises")).toBeInTheDocument();
    expect(screen.getByText("Preview only", { exact: false })).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: "75" } });
    expect(screen.getByText("75 exercises")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Auto" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    expect(setTheme).toHaveBeenCalledWith("dark");

    expect(screen.queryByText("Reminders")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("custom…")).not.toBeInTheDocument();
  });

  it("has no detectable axe violations", async () => {
    const { container } = render(<SettingsPanel />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
