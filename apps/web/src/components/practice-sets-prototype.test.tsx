import { fireEvent, render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { beforeEach, describe, expect, it } from "vitest";

import type {
  PracticeSessionAction,
  PracticeSessionResponse,
  PracticeSessionView,
} from "@/lib/practice-serving/session-api-contract";

import { IntermediateLessonPilot } from "./intermediate-lesson-pilot";
import { LessonPracticePreview } from "./lesson-practice-preview";
import { PracticeWorkspace, type PracticeSessionClient } from "./practice-workspace";

expect.extend(toHaveNoViolations);

const attemptedAt = "2026-08-24T20:00:00.000Z";

function session(overrides: Partial<PracticeSessionView> = {}): PracticeSessionView {
  return {
    attempts: [],
    current: {
      cefr: "A1",
      cue: "Translate into Spanish.",
      itemId: "unit.a1.you-live-here",
      ordinal: 1,
      prompt: "You live here.",
      reason: "new_in_scope",
    },
    profile: "es-AR",
    revision: 1,
    sessionId: "session-1",
    source: {
      id: "collection.a1.everyday-location",
      kind: "collection",
      title: "Everyday location",
      version: "unit.a1.you-live-here@1",
    },
    status: "active",
    ...overrides,
  };
}

class JourneyClient implements PracticeSessionClient {
  response: PracticeSessionResponse = { savedItemIds: [], session: null };
  readonly actions: PracticeSessionAction[] = [];

  async load() {
    return structuredClone(this.response);
  }

  async command(action: PracticeSessionAction) {
    this.actions.push(structuredClone(action));
    if (action.action === "start") {
      this.response = { savedItemIds: this.response.savedItemIds, session: session({
        source: action.sourceKind === "saved"
          ? { id: "saved.all", kind: "saved", title: "All saved", version: "unit.a1.you-live-here@1" }
          : session().source,
      }) };
    } else if (action.action === "answer") {
      const previous = this.response.session ?? session();
      const wrong = previous.attempts.length === 0;
      this.response = {
        savedItemIds: this.response.savedItemIds,
        session: session({
          attempts: [
            ...previous.attempts,
            {
              answer: action.answer,
              attemptedAt,
              evalSource: "comparison",
              feedback: wrong ? "Use the active Argentine form." : "Correct.",
              itemId: "unit.a1.you-live-here",
              prompt: "You live here.",
              score: wrong ? 35 : 100,
              target: "Vos vivís acá.",
              verdict: wrong ? "wrong" : "correct",
              ...(wrong
                ? {
                    correction: {
                      text: "Vos vivís acá.",
                      highlights: [{ start: 4, end: 9, kind: "spelling" as const }],
                    },
                  }
                : {}),
            },
          ],
          current: {
            ...previous.current,
            ordinal: previous.current.ordinal + 1,
            reason: wrong ? "retry_after_miss" : "continue_review",
          },
          revision: previous.revision + 1,
        }),
      };
    } else if (action.action === "save") {
      this.response = {
        ...this.response,
        savedItemIds: action.saved ? [action.itemId] : [],
      };
    } else if (action.action === "pause" || action.action === "resume") {
      const current = this.response.session ?? session();
      this.response = {
        ...this.response,
        session: { ...current, revision: current.revision + 1, status: action.action === "pause" ? "paused" : "active" },
      };
    } else {
      this.response = { ...this.response, session: null };
    }
    return structuredClone(this.response);
  }
}

describe("shared adaptive Practice journey", () => {
  beforeEach(() => window.localStorage.clear());

  it("offers only the production-first promoted collection contract", async () => {
    const client = new JourneyClient();
    render(<PracticeWorkspace client={client} />);

    expect(await screen.findByRole("button", { name: "Start Everyday location" })).toBeInTheDocument();
    expect(screen.getByText(/promoted, dialect-aware collection/i)).toBeInTheDocument();
    expect(screen.queryByText("Direction")).not.toBeInTheDocument();
    expect(screen.queryByText("Flashcards")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start Everyday location" }));
    expect(await screen.findByRole("heading", { name: "You live here." })).toBeInTheDocument();
    expect(screen.getByText("English → Spanish")).toBeInTheDocument();
    expect(screen.getByText(/New in this collection/)).toBeInTheDocument();
    expect(screen.getByLabelText("Type your Spanish answer")).toBeInTheDocument();
  });

  it("retains a miss, explains the retry, saves it, and resumes after remount", async () => {
    const client = new JourneyClient();
    const first = render(<PracticeWorkspace client={client} />);
    fireEvent.click(await screen.findByRole("button", { name: "Start Everyday location" }));
    fireEvent.change(await screen.findByLabelText("Type your Spanish answer"), { target: { value: "Tú vives aquí." } });
    fireEvent.click(screen.getByRole("button", { name: "Send answer" }));

    expect(await screen.findByLabelText("Feedback: Keep working")).toHaveTextContent("Use the active Argentine form");
    expect(screen.getByLabelText("A correct answer: Vos vivís acá.")).toContainHTML("correction-close");
    expect(screen.getByText(/most recent miss/)).toBeInTheDocument();
    expect(client.actions.find((action) => action.action === "answer")).toEqual({
      action: "answer",
      answer: "Tú vives aquí.",
      offerOrdinal: 1,
      sessionId: "session-1",
    });

    fireEvent.click(screen.getByRole("button", { name: "Save this item to All saved" }));
    expect(await screen.findByRole("button", { name: "Remove this item from All saved" })).toHaveTextContent("Saved in All saved");
    fireEvent.click(screen.getByRole("button", { name: "Pause practice" }));
    expect(await screen.findByRole("heading", { name: "Everyday location is paused" })).toBeInTheDocument();
    first.unmount();

    render(<PracticeWorkspace client={client} />);
    expect(await screen.findByRole("heading", { name: "Everyday location is paused" })).toBeInTheDocument();
    expect(screen.getByText(/learning evidence are ready on return/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Resume practice" }));
    expect(await screen.findByText(/most recent miss/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove this item from All saved" })).toBeInTheDocument();
  });

  it("completes the retry and ends with an evidence-backed recap", async () => {
    const client = new JourneyClient();
    render(<PracticeWorkspace client={client} />);
    fireEvent.click(await screen.findByRole("button", { name: "Start Everyday location" }));
    const input = await screen.findByLabelText("Type your Spanish answer");
    fireEvent.change(input, { target: { value: "Tú vives aquí." } });
    fireEvent.click(screen.getByRole("button", { name: "Send answer" }));
    await screen.findByText(/most recent miss/);
    fireEvent.change(screen.getByLabelText("Type your Spanish answer"), { target: { value: "Vos vivís acá." } });
    fireEvent.click(screen.getByRole("button", { name: "Send answer" }));
    expect(await screen.findByLabelText("Feedback: Correct")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "End practice and review this session" }));
    expect(await screen.findByRole("heading", { name: "Everyday location" })).toBeInTheDocument();
    expect(screen.getByText(/2 answers; 1 was correct/i)).toBeInTheDocument();
    expect(screen.getByText(/without a separate direction score/i)).toBeInTheDocument();
  });

  it("keeps the collection, paused state, and lesson components accessible", async () => {
    const client = new JourneyClient();
    const practice = render(<PracticeWorkspace client={client} />);
    await screen.findByRole("button", { name: "Start Everyday location" });
    expect(await axe(practice.container)).toHaveNoViolations();
    fireEvent.click(screen.getByRole("button", { name: "Start Everyday location" }));
    await screen.findByLabelText("Type your Spanish answer");
    fireEvent.click(screen.getByRole("button", { name: "Pause practice" }));
    await screen.findByRole("heading", { name: "Everyday location is paused" });
    expect(await axe(practice.container)).toHaveNoViolations();
    practice.unmount();

    const lesson = render(<IntermediateLessonPilot />);
    expect(await axe(lesson.container)).toHaveNoViolations();
  });
});

describe("retained lesson prototypes", () => {
  it("preserves the canonical A1 lesson preview", () => {
    render(<LessonPracticePreview />);
    expect(screen.getByRole("heading", { name: "Lesson 1" })).toBeInTheDocument();
    expect(screen.getByText("Lesson mix · 1 of 10")).toBeInTheDocument();
  });

  it("keeps the first intermediate lesson finite", () => {
    render(<IntermediateLessonPilot />);
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Type a lesson answer"), { target: { value: "pedí" } });
    fireEvent.click(screen.getByRole("button", { name: "Check lesson answer" }));
    expect(screen.getByRole("status")).toHaveTextContent("Correct");
    fireEvent.click(screen.getByRole("button", { name: "Next lesson step" }));
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
  });
});
