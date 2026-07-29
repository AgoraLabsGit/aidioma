import { fireEvent, render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { beforeEach, describe, expect, it } from "vitest";

import { LessonPracticePreview } from "./lesson-practice-preview";
import { PracticeWorkspace } from "./practice-workspace";

expect.extend(toHaveNoViolations);

function openEssentialVerbsOptions() {
  fireEvent.click(screen.getByRole("button", { name: "Customize Essential Verbs" }));
}

describe("Collections fixture prototype", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("opens directly on the collection catalog with Saved as a filter", () => {
    render(<PracticeWorkspace />);

    expect(screen.getByRole("heading", { name: "Practice" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Saved" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Start Essential Verbs" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Current lesson/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Your practice/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Popular right now/i)).not.toBeInTheDocument();
  });

  it("preserves the lesson-mix preview for the Lessons route", () => {
    render(<LessonPracticePreview />);

    expect(screen.getByRole("heading", { name: "Lesson 1" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "End preview and return to Lessons" })).toHaveAttribute(
      "href",
      "/lessons",
    );
    expect(screen.getByText("Lesson mix · 1 of 10")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Type a prototype answer"), {
      target: { value: "Hola, me llamo Ana." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Preview feedback" }));
    expect(screen.getByRole("status")).toHaveTextContent("Representative feedback state");
  });

  it("filters saved collections without adding a separate page", () => {
    render(<PracticeWorkspace />);

    fireEvent.click(screen.getByRole("button", { name: "Save Essential Verbs" }));
    expect(screen.getByRole("button", { name: "Remove Essential Verbs from saved" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: "Saved" }));
    expect(screen.getByRole("button", { name: "Start Essential Verbs" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start Essential Verbs" }));
    fireEvent.click(screen.getByRole("button", { name: "End preview and return to Practice" }));
    expect(screen.getByRole("button", { name: "Saved" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove Essential Verbs from saved" }));
    expect(screen.getByRole("heading", { name: "No saved collections" })).toBeInTheDocument();
  });

  it("filters overlapping facets without a popularity category", () => {
    render(<PracticeWorkspace />);

    fireEvent.click(screen.getByRole("button", { name: "Situations" }));
    expect(screen.getByRole("button", { name: /Start Everyday Phrases/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Start Ordering at a Restaurant/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Popular" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "My Sets" })).not.toBeInTheDocument();
  });

  it("starts a collection directly and keeps unsupported activity explanations in options", async () => {
    render(<PracticeWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "Start Essential Verbs" }));

    expect(screen.getByLabelText("Type a prototype answer")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "End preview and return to Practice" }));
    fireEvent.click(screen.getByRole("button", { name: "Customize Ordering at a Restaurant" }));
    await screen.findByRole("dialog", { name: "Practice options" });
    expect(
      screen.getByText(/This prototype set has no reviewed standalone card backs\./),
    ).toBeInTheDocument();
    expect(screen.getByText(/Needs a reviewed restaurant scenario\./)).toBeInTheDocument();
  });

  it("disables invalid Essential Verbs intersections without repairing the configuration", () => {
    render(<PracticeWorkspace />);
    openEssentialVerbsOptions();

    const imperative = screen.getByRole("button", { name: "Imperative" });
    expect(imperative).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "5" }));
    expect(imperative).toBeEnabled();
    fireEvent.click(imperative);
    expect(screen.getByRole("button", { name: "I · yo" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "EN → ES" }));
    expect(screen.getByRole("button", { name: "Recognize form" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Produce form" }));
    expect(screen.getByRole("button", { name: "Both" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "EN → ES" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("freezes a session preview and preserves remembered choices when reconfiguring", () => {
    render(<PracticeWorkspace />);
    openEssentialVerbsOptions();
    fireEvent.click(screen.getByRole("button", { name: "Flashcards" }));
    fireEvent.click(screen.getByRole("button", { name: "Start practice" }));

    expect(screen.getByRole("button", { name: "Reveal flashcard answer" })).toBeInTheDocument();
    expect(
      screen.getByText("This preview creates no session, evaluation, proficiency, or lesson-progress record."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reconfigure session" }));
    expect(screen.getByRole("button", { name: "Flashcards" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("shows the representative Type feedback state without grading or persistence", () => {
    render(<PracticeWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "Start Essential Verbs" }));

    fireEvent.change(screen.getByLabelText("Type a prototype answer"), {
      target: { value: "soy" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Preview feedback" }));

    expect(screen.getByRole("status")).toHaveTextContent("Representative feedback state");
    expect(screen.getByRole("status")).toHaveTextContent("No answer was evaluated or saved");
  });

  it("keeps capability-aware options accessible", async () => {
    const { container } = render(<PracticeWorkspace />);
    openEssentialVerbsOptions();

    expect(await axe(container)).toHaveNoViolations();
  });
});
