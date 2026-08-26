import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  LessonJourneyAction,
  LessonJourneyResponse,
  LessonJourneyView,
} from "@/lib/learning-journey/lesson-api-contract";

import { LearningWorkspace, type LessonJourneyClient } from "./learning-workspace";

expect.extend(toHaveNoViolations);

const answeredAt = "2026-08-25T20:00:00.000Z";

function lesson(overrides: Partial<LessonJourneyView> = {}): LessonJourneyView {
  return {
    attempts: [],
    availableCollections: [],
    cefr: "A1",
    current: {
      cue: "Translate into Spanish.",
      itemId: "unit.a1.you-live-here",
      prompt: "You live here.",
    },
    exchanges: [],
    hints: [],
    objective: "Say where someone lives",
    position: "teaching",
    profile: "es-AR",
    recommendation: null,
    revision: 1,
    sessionId: "lesson-session-1",
    teaching: {
      body: "With vos, regular -ir verbs use an accented ís ending.",
      example: "Vos vivís acá.",
      note: "This is the active Argentine Spanish profile.",
      title: "Use vos with vivís",
    },
    title: "Saying where you live",
    ...overrides,
  };
}

class LessonClient implements LessonJourneyClient {
  response: LessonJourneyResponse = { lesson: null };
  readonly actions: LessonJourneyAction[] = [];
  readonly reviewStarts: string[] = [];

  async load() {
    return structuredClone(this.response);
  }

  async command(action: LessonJourneyAction) {
    this.actions.push(structuredClone(action));
    const current = this.response.lesson ?? lesson();
    if (action.action === "lesson-start") {
      this.response = { lesson: lesson() };
    } else if (action.action === "lesson-continue") {
      this.response = { lesson: { ...current, position: "check", revision: current.revision + 1 } };
    } else if (action.action === "lesson-hint") {
      this.response = {
        lesson: {
          ...current,
          hints: [...current.hints, "Start with vos, then use the accented -ís ending."],
          revision: current.revision + 1,
        },
      };
    } else if (action.action === "lesson-question") {
      this.response = {
        lesson: {
          ...current,
          exchanges: [...current.exchanges, {
            answer: "Vivís agrees with vos in Argentine Spanish.",
            answeredAt,
            kind: "ai-explanation",
            question: action.question,
            requestId: action.requestId,
          }],
          revision: current.revision + 1,
        },
      };
    } else {
      const correct = action.answer === "Vos vivís acá.";
      const attempt = {
        answer: action.answer,
        assisted: current.hints.length > 0 || current.exchanges.length > 0,
        attemptedAt: correct ? "2026-08-25T20:02:00.000Z" : "2026-08-25T20:01:00.000Z",
        feedback: correct ? "Correct." : "Use the active Argentine form.",
        score: correct ? 100 : 35,
        target: "Vos vivís acá.",
        verdict: correct ? "correct" as const : "wrong" as const,
        ...(correct ? {} : {
          correction: {
            text: "Vos vivís acá.",
            highlights: [{ start: 4, end: 9, kind: "spelling" as const }],
          },
        }),
      };
      this.response = {
        lesson: {
          ...current,
          attempts: [...current.attempts, attempt],
          availableCollections: correct ? [
            { description: "Strengthen the vos verb form.", id: "collection.a1.present-regular-ir", kind: "concept", title: "Present -ir with vos" },
            { description: "Review useful language about home.", id: "collection.a1.home", kind: "topic", title: "At home" },
          ] : [],
          position: correct ? "complete" : "check",
          recommendation: correct ? {
            collectionId: "collection.a1.present-regular-ir",
            reason: "Recommended because this form needed a correction in your lesson.",
            title: "Present -ir with vos",
          } : null,
          revision: current.revision + 1,
        },
      };
    }
    return structuredClone(this.response);
  }

  async startReview(collectionId: string) {
    this.reviewStarts.push(collectionId);
  }
}

async function startAndReachCheck() {
  fireEvent.click(await screen.findByRole("button", { name: "Start lesson" }));
  expect(await screen.findByText("Vos vivís acá.")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Continue to check" }));
  expect(await screen.findByRole("heading", { name: "You live here." })).toBeInTheDocument();
}

describe("finite lesson workspace", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("teaches, continues to the check, and exposes only authored hints", { timeout: 20_000 }, async () => {
    const client = new LessonClient();
    render(<LearningWorkspace client={client} />);

    await startAndReachCheck();
    fireEvent.click(screen.getByRole("button", { name: "Show a hint" }));
    expect(await screen.findByText(/accented -ís ending/i)).toBeInTheDocument();
    expect(client.actions.at(-1)).toMatchObject({
      action: "lesson-hint",
      expectedRevision: 2,
      sessionId: "lesson-session-1",
    });
  });

  it("uses the same composer for a contextual question and restores its AI explanation", { timeout: 20_000 }, async () => {
    const client = new LessonClient();
    const first = render(<LearningWorkspace client={client} />);
    await startAndReachCheck();

    fireEvent.click(screen.getByRole("button", { name: "Ask AIdioma" }));
    const question = screen.getByLabelText("Ask AIdioma about this lesson");
    fireEvent.change(question, { target: { value: "Why does vivís have an accent?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send question" }));

    expect(await screen.findByText("Vivís agrees with vos in Argentine Spanish.")).toBeInTheDocument();
    expect(screen.getByText("AI explanation")).toBeInTheDocument();
    expect(screen.getByLabelText("Type your Spanish answer")).toBeInTheDocument();
    expect(client.actions.at(-1)).toMatchObject({
      action: "lesson-question",
      expectedRevision: 2,
      question: "Why does vivís have an accent?",
    });

    first.unmount();
    render(<LearningWorkspace client={client} />);
    expect(await screen.findByText("Vivís agrees with vos in Argentine Spanish.")).toBeInTheDocument();
    expect(screen.getByText("AI explanation")).toBeInTheDocument();
  });

  it("shows a miss and correction, completes, unlocks both collections, and starts the recommendation", { timeout: 20_000 }, async () => {
    const client = new LessonClient();
    const onReviewStarted = vi.fn();
    render(<LearningWorkspace client={client} onReviewStarted={onReviewStarted} />);
    await startAndReachCheck();

    const answer = screen.getByLabelText("Type your Spanish answer");
    fireEvent.change(answer, { target: { value: "Tú vives aquí." } });
    fireEvent.click(screen.getByRole("button", { name: "Send answer" }));
    expect(await screen.findByLabelText("Feedback: Keep working")).toHaveTextContent("Use the active Argentine form");
    expect(screen.getByLabelText("A correct answer: Vos vivís acá.")).toContainHTML("correction-close");

    fireEvent.change(screen.getByLabelText("Type your Spanish answer"), { target: { value: "Vos vivís acá." } });
    fireEvent.click(screen.getByRole("button", { name: "Send answer" }));
    expect(await screen.findByText("Lesson complete")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Newly available review collections" })).toHaveTextContent("Present -ir with vos");
    expect(screen.getByRole("list", { name: "Newly available review collections" })).toHaveTextContent("At home");
    expect(screen.getByText(/needed a correction/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start recommended review" }));
    await waitFor(() => expect(client.reviewStarts).toEqual(["collection.a1.present-regular-ir"]));
    expect(onReviewStarted).toHaveBeenCalledOnce();
  });

  it("keeps the lesson start and active check accessible", { timeout: 20_000 }, async () => {
    const client = new LessonClient();
    const rendered = render(<LearningWorkspace client={client} />);
    await screen.findByRole("button", { name: "Start lesson" });
    expect(await axe(rendered.container)).toHaveNoViolations();
    await startAndReachCheck();
    expect(await axe(rendered.container)).toHaveNoViolations();
  });
});
