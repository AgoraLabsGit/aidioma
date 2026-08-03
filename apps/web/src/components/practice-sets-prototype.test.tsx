import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { practiceSetFixtures } from "@/lib/practice-sets/prototype-fixtures";

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
  wordDiff?: Array<{
    mark: "close" | "correct" | "extra" | "missing" | "wrong";
    suggestion?: string;
    text: string;
  }>,
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

function ungradedResponse(retryable: boolean, message: string) {
  return Response.json({ status: "ungraded", retryable, message }, { status: 503 });
}

function startRestaurantPractice() {
  fireEvent.click(screen.getByRole("button", { name: "Start Restaurant Spanish" }));
}

function renderPracticeWorkspace(sessionSeed = 42) {
  return render(<PracticeWorkspace createSessionSeed={() => sessionSeed} />);
}

function currentPromptText(container: HTMLElement) {
  const headings = container.querySelectorAll(".prompt-message h2");
  return headings.item(headings.length - 1).textContent;
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
    renderPracticeWorkspace();

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
    renderPracticeWorkspace();

    expect(screen.getByRole("button", { name: "Save Restaurant Spanish" })).toHaveTextContent("");
    expect(
      screen.getByRole("button", { name: "Adjust Restaurant Spanish settings" }),
    ).toHaveTextContent("");
    expect(screen.queryByText("Start", { selector: ".set-start-label" })).not.toBeInTheDocument();
  });

  it("starts intermediate Restaurant practice without a fixed item cap", () => {
    const { container } = renderPracticeWorkspace();
    startRestaurantPractice();

    expect(currentPromptText(container)).toBeTruthy();
    expect(screen.getByLabelText("Completed practice cards: 0")).toHaveTextContent("0");
    expect(screen.queryByLabelText("Active practice settings")).not.toBeInTheDocument();
    expect(screen.queryByText("Recommended mix")).not.toBeInTheDocument();
    expect(screen.queryByText(/1 \/ 10/)).not.toBeInTheDocument();
    expect(screen.queryByText("Session size")).not.toBeInTheDocument();
  });

  it("sends only the prompt identity, direction, and learner answer", async () => {
    renderPracticeWorkspace();
    startRestaurantPractice();
    await answerCurrentPrompt("Quiero sopa, no ensalada.");

    await screen.findByRole("status", { name: "Feedback: Almost" });
    const [, request] = fetchMock.mock.calls[0];
    const requestBody = JSON.parse(String(request?.body)) as Record<string, unknown>;
    const restaurantPromptIds = practiceSetFixtures[0].prompts.map((prompt) => prompt.id);
    expect(Object.keys(requestBody).sort()).toEqual(["direction", "itemRef", "userInput"]);
    expect(restaurantPromptIds).toContain(requestBody.itemRef);
    expect(["en-es", "es-en"]).toContain(requestBody.direction);
    expect(requestBody.userInput).toBe("Quiero sopa, no ensalada.");
  });

  it("appends feedback and the next prompt while keeping the composer", async () => {
    const { container } = renderPracticeWorkspace();
    startRestaurantPractice();
    const firstPrompt = currentPromptText(container);
    await answerCurrentPrompt("Ayer pedí sopa, pero me trajeron una ensalada.");

    expect(await screen.findByRole("status", { name: "Feedback: Correct" })).toHaveTextContent(
      "Correct",
    );
    expect(screen.getByLabelText("Your answer")).toHaveTextContent(
      "Ayer pedí sopa, pero me trajeron una ensalada.",
    );
    expect(currentPromptText(container)).not.toBe(firstPrompt);
    expect(screen.getByLabelText("Type your answer")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next practice" })).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("Session score: 100% correct"),
    ).toHaveTextContent("100% correct");
    expect(screen.getByLabelText("Completed practice cards: 1")).toHaveTextContent("1");
  });

  it("shows live-grader feedback for a plausible non-matching answer", async () => {
    renderPracticeWorkspace();
    fireEvent.click(
      screen.getByRole("button", { name: "Adjust Time, Habits, and Plans settings" }),
    );
    fireEvent.click(screen.getByRole("checkbox", { name: /Vary the order/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start practice" }));
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

  it.each([
    ["empty", []],
    ["all-correct", [{ mark: "correct" as const, text: "Quiero" }]],
    ["suggestion-less", [{ mark: "wrong" as const, text: "Quiero" }]],
  ])("falls back to the full model answer for a %s word diff", async (_label, wordDiff) => {
    fetchMock.mockResolvedValueOnce(
      gradedResponse(
        "wrong",
        "Use the completed event requested by the prompt.",
        "Ayer pedí sopa, pero me trajeron una ensalada.",
        35,
        wordDiff,
      ),
    );
    renderPracticeWorkspace();
    startRestaurantPractice();
    await answerCurrentPrompt("Quiero sopa.");

    const feedback = await screen.findByRole("status", { name: "Feedback: Keep working" });
    expect(feedback).toHaveTextContent("Ayer pedí sopa, pero me trajeron una ensalada.");
    expect(screen.queryByLabelText("Answer details")).not.toBeInTheDocument();
  });

  it("retries a retryable grading failure with the preserved answer and restores focus", async () => {
    fetchMock
      .mockResolvedValueOnce(
        ungradedResponse(
          true,
          "I couldn’t grade that answer right now. Your response is still here—try again.",
        ),
      )
      .mockResolvedValueOnce(
        gradedResponse(
          "correct",
          "Correct.",
          "Ayer pedí sopa, pero me trajeron una ensalada.",
        ),
      );
    renderPracticeWorkspace();
    startRestaurantPractice();
    await answerCurrentPrompt("Ayer pedí sopa, pero me trajeron una ensalada.");

    expect(await screen.findByRole("alert")).toHaveTextContent("Your response is still here");
    expect(screen.getByLabelText("Type your answer")).toHaveValue(
      "Ayer pedí sopa, pero me trajeron una ensalada.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Try grading again" }));

    expect(await screen.findByRole("status", { name: "Feedback: Correct" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(screen.getByLabelText("Type your answer")).toHaveFocus());
  });

  it("preserves a non-retryable answer without offering a misleading retry", async () => {
    fetchMock.mockResolvedValueOnce(
      ungradedResponse(
        false,
        "Automatic grading isn’t available for this answer. Your response is still here, but retrying won’t help right now.",
      ),
    );
    renderPracticeWorkspace();
    startRestaurantPractice();
    await answerCurrentPrompt("Quiero sopa.");

    expect(await screen.findByRole("alert")).toHaveTextContent("retrying won’t help right now");
    expect(screen.getByLabelText("Type your answer")).toHaveValue("Quiero sopa.");
    expect(screen.queryByRole("button", { name: "Try grading again" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Completed practice cards: 0")).toBeInTheDocument();
  });

  it("treats a malformed grading response as retryable and preserves the answer", async () => {
    fetchMock.mockResolvedValueOnce(new Response("not-json", { status: 502 }));
    renderPracticeWorkspace();
    startRestaurantPractice();
    await answerCurrentPrompt("Quiero sopa.");

    expect(await screen.findByRole("alert")).toHaveTextContent("Your response is still here");
    expect(screen.getByRole("button", { name: "Try grading again" })).toBeInTheDocument();
    expect(screen.getByLabelText("Type your answer")).toHaveValue("Quiero sopa.");
  });

  it("ignores an evaluation result after ending and restarting the session", async () => {
    let resolveEvaluation: ((response: Response) => void) | undefined;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveEvaluation = resolve;
        }),
    );
    const { container } = renderPracticeWorkspace();
    startRestaurantPractice();
    await answerCurrentPrompt("Ayer pedí sopa, pero me trajeron una ensalada.");

    fireEvent.click(
      screen.getByRole("button", { name: "End practice and review this session" }),
    );
    startRestaurantPractice();
    const restartedPrompt = currentPromptText(container);
    await act(async () => {
      resolveEvaluation?.(
        gradedResponse(
          "correct",
          "Correct.",
          "Ayer pedí sopa, pero me trajeron una ensalada.",
        ),
      );
      await Promise.resolve();
    });

    expect(currentPromptText(container)).toBe(restartedPrompt);
    expect(screen.getByLabelText("Completed practice cards: 0")).toBeInTheDocument();
    expect(screen.queryByLabelText("Your answer")).not.toBeInTheDocument();
    expect(screen.queryByRole("status", { name: "Feedback: Correct" })).not.toBeInTheDocument();
  });

  it("ignores an evaluation result after applying a new session configuration", async () => {
    let resolveEvaluation: ((response: Response) => void) | undefined;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveEvaluation = resolve;
        }),
    );
    renderPracticeWorkspace();
    startRestaurantPractice();
    await answerCurrentPrompt("Ayer pedí sopa, pero me trajeron una ensalada.");

    fireEvent.click(screen.getByRole("button", { name: "Adjust practice settings" }));
    fireEvent.click(await screen.findByRole("button", { name: "Apply settings" }));
    await act(async () => {
      resolveEvaluation?.(
        gradedResponse(
          "correct",
          "Correct.",
          "Ayer pedí sopa, pero me trajeron una ensalada.",
        ),
      );
      await Promise.resolve();
    });

    expect(screen.getByLabelText("Completed practice cards: 0")).toBeInTheDocument();
    expect(screen.queryByLabelText("Your answer")).not.toBeInTheDocument();
    expect(screen.queryByRole("status", { name: "Feedback: Correct" })).not.toBeInTheDocument();
  });

  it("ends only when the learner chooses and summarizes the visit", async () => {
    renderPracticeWorkspace();
    startRestaurantPractice();
    await answerCurrentPrompt("Ayer pedí sopa, pero me trajeron una ensalada.");
    await screen.findByRole("status", { name: "Feedback: Correct" });

    fireEvent.click(
      screen.getByRole("button", { name: "End practice and review this session" }),
    );

    expect(screen.getByRole("heading", { name: "Practice recap" })).toBeInTheDocument();
    expect(screen.getByText("You answered 1 prompt.")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("shows the latest session score on the collection row for this visit", async () => {
    renderPracticeWorkspace();
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
    renderPracticeWorkspace();
    startRestaurantPractice();
    await answerCurrentPrompt("Ayer pedí sopa, pero me trajeron ensalada.");

    await screen.findByRole("status", { name: "Feedback: Correct" });
    expect(screen.getByLabelText("Session score: 100% correct")).toBeInTheDocument();
  });

  it("does not start Practice again with the same shuffled prompt", async () => {
    const { container } = renderPracticeWorkspace(42);
    startRestaurantPractice();
    const firstSessionPrompt = currentPromptText(container);
    await answerCurrentPrompt("Ayer pedí sopa, pero me trajeron una ensalada.");
    await screen.findByRole("status", { name: "Feedback: Correct" });

    fireEvent.click(
      screen.getByRole("button", { name: "End practice and review this session" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Practice again" }));

    expect(currentPromptText(container)).not.toBe(firstSessionPrompt);
  });

  it("keeps repeated fixed-order sessions fixed", () => {
    const { container } = renderPracticeWorkspace(42);
    fireEvent.click(screen.getByRole("button", { name: "Adjust Restaurant Spanish settings" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Vary the order/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start practice" }));
    const firstSessionPrompt = currentPromptText(container);

    fireEvent.click(
      screen.getByRole("button", { name: "End practice and review this session" }),
    );
    startRestaurantPractice();

    expect(currentPromptText(container)).toBe(firstSessionPrompt);
  });

  it("offers optional focus controls without exposing unavailable work", async () => {
    const { container } = renderPracticeWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Adjust Restaurant Spanish settings" }));

    expect(await screen.findByRole("dialog", { name: "Practice settings" })).toBeInTheDocument();
    expect(screen.queryByText(/not in this pilot/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no reviewed/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Time phrases/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start practice" }));

    expect(screen.getByLabelText("Active practice settings")).toHaveTextContent("Time phrases");
    expect(currentPromptText(container)).toBeTruthy();
  });

  it("keeps Saved as lightweight local organization", () => {
    renderPracticeWorkspace();

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
    const practice = renderPracticeWorkspace();
    expect(await axe(practice.container)).toHaveNoViolations();
    practice.unmount();

    const lesson = render(<IntermediateLessonPilot />);
    expect(await axe(lesson.container)).toHaveNoViolations();
  });
});
