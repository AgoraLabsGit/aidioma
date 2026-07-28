import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DesktopSidebar, MobileTabBar } from "./navigation";

const { route } = vi.hoisted(() => ({ route: { pathname: "/lessons" } }));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
}));

describe("route-aware navigation", () => {
  beforeEach(() => {
    route.pathname = "/lessons";
  });

  it("marks only the active destination as the current page", () => {
    render(
      <>
        <DesktopSidebar account={null} />
        <MobileTabBar />
      </>,
    );

    const lessonLinks = screen.getAllByRole("link", { name: "Lessons" });
    expect(lessonLinks).toHaveLength(2);
    expect(lessonLinks.every((link) => link.getAttribute("aria-current") === "page")).toBe(true);

    for (const label of ["Home", "Practice", "Settings"]) {
      expect(
        screen
          .getAllByRole("link", { name: label })
          .every((link) => !link.hasAttribute("aria-current")),
      ).toBe(true);
    }
  });

  it("does not mark prefix lookalikes as current routes", () => {
    route.pathname = "/lessons-old";
    render(<DesktopSidebar account={null} />);

    expect(
      screen.getByRole("link", { name: "Lessons" }),
    ).not.toHaveAttribute("aria-current");
  });
});
