import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { IntermediateLessonPilot } from "./intermediate-lesson-pilot";
import { LessonPracticePreview } from "./lesson-practice-preview";
import { PracticeWorkspace } from "./practice-workspace";

expect.extend(toHaveNoViolations);

const fetchMock = vi.fn<typeof fetch>();

function gradedResponse(
  verdict: "correct" | "close" | "wrong",
  feedback: string,
  modelAnswer: string,
  score = verdict === "correct" ? 100 : verdict === "close" ? 74 : 35,
  wordDiff?: Array<{ mark: "close" | "extra" | "missing" | "wrong"; suggestion?: string; text: string }>,
) {
  return Response.json({
    status: "graded",
    score,
    verdict,
    feedback,
    errorTags: [],
    evalSource: verdict === "correct" ? "comparison" : "ai",
    modelAnswer,
    ...(wordDiff && { wordDiff }),
  });
}

function startRestaurantPractice() {
  fireEvent.click(screen.getByRole("button", { name: "Start Restaurant Spanish" }));
}

async function answerCurrentPrompt(answer: string) {
  fireEvent.change(screen.getByLabelText("Type your answer"), {
    target: { value: answer },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send answer" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalled());
}

describe("Intermediate learning pilot", () => {
  beforeEach(() => {
    window.localStorage.clear();
    fetchMock.mockReset();
    fetchMock.mockImplementation(async (_input, init) => {
      const request = JSON.parse(String(init?.body)) as { itemRef: string; userInput: string };
      if (request.userInput === "Ayer pedí sopa, pero me trajeron una ensalada.") {
        return gradedResponse(
          "correct",
          "The completed event and contrast are both clear.",
          "Ayer pedí sopa, pero me trajeron una ensalada.",
        );
      }
      if (request.userInput === "Ayer pedí sopa, pero me trajeron ensalada.") {
        return gradedResponse(
          "correct",
          "Correct.",
          "Ayer pedí sopa, pero me trajeron una ensalada.",
          85,
        );
      }
      if (request.userInput === "Quiero sopa, no ensalada.") {
        return gradedResponse(
          "close",
          "Your meaning is useful in the situation, but it does not recount the completed event.",
          "Ayer pedí sopa, pero me trajeron una ensalada.",
        );
      }
      if (
        request.itemRef === "time-used-to" &&
        request.userInput === "Suelo cocinar en domingos."
      ) {
        return gradedResponse(
          "close",
          "Use los domingos for a habitual action, not en domingos.",
          "Suelo cocinar los domingos.",
          undefined,
          [{ mark: "close", text: "en domingos", suggestion: "los domingos" }],
        );
      }
      return gradedResponse("correct", "Correct.", "I just finished. The bill, please.");
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  it("shows four intermediate collections without development chrome", () => {
    render(<PracticeWorkspace />);

    expect(screen.getByRole("heading", { name: "Practice" })).toBeInTheDocument();
    expect(screen.getByText("4 collections")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Restaurant Spanish" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Getting Around" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Time, Habits, and Plans" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Start Stories and Explaining Problems" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/working prototype/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/prototype lens/i)).not.toBeInTheDocument();
  });

  it("uses icon-only collection actions and no redundant start label", () => {
    render(<PracticeWorkspace />);

    expect(screen.getByRole("button", { name: "Save Restaurant Spanish" })).toHaveTextContent("");
    expect(
      screen.getByRole("button", { name: "Adjust Restaurant Spanish settings" }),
    ).toHaveTextContent("");
    expect(screen.queryByText("Start", { selector: ".set-start-label" })).not.toBeInTheDocument();
  });

  it("starts intermediate Restaurant practice without a fixed item cap", () => {
    render(<PracticeWorkspace />);
    startRestaurantPractice();

    expect(
      screen.getByRole("heading", {
        name: "Yesterday I ordered soup, but they brought me a salad.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Completed practice cards: 0")).toHaveTextContent("0");
    expect(screen.queryByLabelText("Active practice settings")).not.toBeInTheDocument();
    expect(screen.queryByText("Recommended mix")).not.toBeInTheDocument();
    expect(screen.queryByText(/1 \/ 10/)).not.toBeInTheDocument();
    expect(screen.queryByText("Session size")).not.toBeInTheDocument();
  });

  it("sends only the prompt identity, direction, and learner answer", async () => {
    render(<PracticeWorkspace />);
    startRestaurantPractice();
    await answerCurrentPrompt("Quiero sopa, no ensalada.");

    await screen.findByRole("status", { name: "Feedback: Almost" });
    const [, request] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(request?.body))).toEqual({
      itemRef: "restaurant-past-mistake",
      direction: "en-es",
      userInput: "Quiero sopa, no ensalada.",
    });
  });

  it("appends feedback and the next prompt while keeping the composer", async () => {
    render(<PracticeWorkspace />);
    startRestaurantPractice();
    await answerCurrentPrompt("Ayer pedí sopa, pero me trajeron una ensalada.");

    expect(await screen.findByRole("status", { name: "Feedback: Correct" })).toHaveTextContent(
      "Correct",
    );
    expect(screen.getByLabelText("Your answer")).toHaveTextContent(
      "Ayer pedí sopa, pero me trajeron una ensalada.",
    );
    expect(
      screen.getByRole("heading", { name: "Aunque la comida estuvo buena, el servicio fue lento." }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Type your answer")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next practice" })).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("Session score: 100% correct"),
    ).toHaveTextContent("100% correct");
    expect(screen.getByLabelText("Completed practice cards: 1")).toHaveTextContent("1");
  });

  it("shows live-grader feedback for a plausible non-matching answer", async () => {
    render(<PracticeWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "Start Time, Habits, and Plans" }));
    await answerCurrentPrompt("Suelo cocinar en domingos.");

    const feedback = await screen.findByRole("status", { name: "Feedback: Almost" });
    expect(feedback).toHaveTextContent(
      "Use los domingos for a habitual action, not en domingos.",
    );
    expect(feedback).toHaveTextContent("en domingos");
    expect(feedback).toHaveTextContent("los domingos");
    expect(feedback).not.toHaveTextContent("Suelo cocinar los domingos.");
    expect(feedback).not.toHaveTextContent("Model answer:");
  });

  it("ends only when the learner chooses and summarizes the visit", async () => {
    render(<PracticeWorkspace />);
    startRestaurantPractice();
    await answerCurrentPrompt("Ayer pedí sopa, pero me trajeron una ensalada.");
    await screen.findByRole("status", { name: "Feedback: Correct" });

    fireEvent.click(
      screen.getByRole("button", { name: "End practice and review this session" }),
    );

    expect(screen.getByRole("heading", { name: "Practice recap" })).toBeInTheDocument();
    expect(screen.getByText("You answered 1 prompt.")).toBeInTheDocument();
    expect(screen.getByText("Recount a completed restaurant mistake")).toBeInTheDocument();
  });

  it("shows the latest session score on the collection row for this visit", async () => {
    render(<PracticeWorkspace />);
    startRestaurantPractice();
    await answerCurrentPrompt("Ayer pedí sopa, pero me trajeron una ensalada.");
    await screen.findByRole("status", { name: "Feedback: Correct" });

    fireEvent.click(
      screen.getByRole("button", { name: "End practice and review this session" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Browse collections" }));

    expect(screen.getByLabelText("Latest session score: 100% correct")).toHaveTextContent(
      /^100% latest$/,
    );
  });

  it("counts a learner-facing correct verdict even when its numeric score is below 90", async () => {
    render(<PracticeWorkspace />);
    startRestaurantPractice();
    await answerCurrentPrompt("Ayer pedí sopa, pero me trajeron ensalada.");

    await screen.findByRole("status", { name: "Feedback: Correct" });
    expect(screen.getByLabelText("Session score: 100% correct")).toBeInTheDocument();
  });

  it("serves each prompt-direction unit before repeating a prompt", async () => {
    render(<PracticeWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "Start Time, Habits, and Plans" }));
    await answerCurrentPrompt("Suelo cocinar los domingos.");
    await screen.findByRole("status", { name: "Feedback: Correct" });
    await answerCurrentPrompt("I am about to leave.");

    expect(
      await screen.findByRole("heading", { name: "Suelo cocinar los domingos." }),
    ).toBeInTheDocument();
  });

  it("offers optional focus controls without exposing unavailable work", async () => {
    render(<PracticeWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "Adjust Restaurant Spanish settings" }));

    expect(await screen.findByRole("dialog", { name: "Practice settings" })).toBeInTheDocument();
    expect(screen.queryByText(/not in this pilot/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no reviewed/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Time phrases/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start practice" }));

    expect(screen.getByLabelText("Active practice settings")).toHaveTextContent("Time phrases");
    expect(
      screen.getByRole("heading", { name: "I just finished. The bill, please." }),
    ).toBeInTheDocument();
  });

  it("keeps Saved as lightweight local organization", () => {
    render(<PracticeWorkspace />);

    fireEvent.click(screen.getByRole("button", { name: "Save Restaurant Spanish" }));
    fireEvent.click(screen.getByRole("button", { name: "Saved" }));

    expect(screen.getByText("1 collection · Saved")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Restaurant Spanish" })).toBeInTheDocument();
  });

  it("preserves the canonical A1 lesson preview separately", () => {
    render(<LessonPracticePreview />);
    expect(screen.getByRole("heading", { name: "Lesson 1" })).toBeInTheDocument();
    expect(screen.getByText("Lesson mix · 1 of 10")).toBeInTheDocument();
  });

  it("makes the first intermediate lesson a finite teaching arc", () => {
    render(<IntermediateLessonPilot />);

    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByText(/Mark a completed action/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Type a lesson answer"), {
      target: { value: "pedí" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Check lesson answer" }));
    expect(screen.getByRole("status")).toHaveTextContent("Correct");
    fireEvent.click(screen.getByRole("button", { name: "Next lesson step" }));
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
  });

  it("keeps the lesson and collection experiences accessible", async () => {
    const practice = render(<PracticeWorkspace />);
    expect(await axe(practice.container)).toHaveNoViolations();
    practice.unmount();

    const lesson = render(<IntermediateLessonPilot />);
    expect(await axe(lesson.container)).toHaveNoViolations();
  });
});
