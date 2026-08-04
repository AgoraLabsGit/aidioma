import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { practiceSetFixtures } from "@/lib/practice-sets/prototype-fixtures";
import { savedPracticeReference } from "@/lib/practice-sets/saved-practice-references";
import {
  resolveRestaurantPracticeSource,
} from "@/lib/practice-serving/restaurant-source";

import { IntermediateLessonPilot } from "./intermediate-lesson-pilot";
import { LessonPracticePreview } from "./lesson-practice-preview";
import { PracticeWorkspace } from "./practice-workspace";

expect.extend(toHaveNoViolations);

const fetchMock = vi.fn<typeof fetch>();

function gradedResponse(
  verdict: "correct" | "close" | "wrong",
  feedback: string,
  correctionText: string,
  score = verdict === "correct" ? 100 : verdict === "close" ? 74 : 35,
  correctionHighlights: Array<{
    start: number;
    end: number;
    kind: "spelling" | "different";
  }> = [],
) {
  return Response.json({
    status: "graded",
    score,
    verdict,
    feedback,
    errorTags: [],
    evalSource: verdict === "correct" ? "comparison" : "ai",
    ...(verdict !== "correct" && {
      correction: { text: correctionText, highlights: correctionHighlights },
    }),
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
        request.userInput === "Suelo cocinar en domingo."
      ) {
        return gradedResponse(
          "close",
          "Use los domingos for a habitual action, not en domingos.",
          "Suelo cocinar los domingos.",
          undefined,
          [
            { start: 14, end: 17, kind: "different" },
            { start: 18, end: 26, kind: "spelling" },
          ],
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

    const feedback = await screen.findByRole("status", { name: "Feedback: Correct" });
    expect(feedback).toHaveTextContent("Correct");
    expect(feedback).toHaveClass("feedback-correct");
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

  it("returns a missed Restaurant direction after three other prompts", async () => {
    fetchMock.mockResolvedValueOnce(
      gradedResponse(
        "wrong",
        "Use the reviewed target for this prompt.",
        "Reviewed target answer.",
      ),
    );
    const { container } = renderPracticeWorkspace(42);
    startRestaurantPractice();
    const missedPrompt = currentPromptText(container);
    const missedDirection = container.querySelector(
      ".active-practice-turn .activity-label",
    )?.textContent;
    expect(missedDirection).toMatch(/^(EN → ES|ES → EN)$/);

    await answerCurrentPrompt("First miss");
    await waitFor(() =>
      expect(screen.getByLabelText("Completed practice cards: 1")).toBeInTheDocument(),
    );
    const intervening = [currentPromptText(container)];
    for (let completed = 2; completed <= 4; completed += 1) {
      await answerCurrentPrompt(`Retrieved ${completed}`);
      await waitFor(() =>
        expect(
          screen.getByLabelText(`Completed practice cards: ${completed}`),
        ).toBeInTheDocument(),
      );
      if (completed < 4) intervening.push(currentPromptText(container));
    }

    expect(new Set(intervening)).toHaveLength(3);
    expect(intervening).not.toContain(missedPrompt);
    expect(currentPromptText(container)).toBe(missedPrompt);
    expect(
      container.querySelector(".active-practice-turn .activity-label"),
    ).toHaveTextContent(missedDirection as string);
  });

  it("shows exact-scope unavailability without widening or crashing", async () => {
    const unavailableResolver: typeof resolveRestaurantPracticeSource = (request) => ({
      status: "unavailable",
      reason: "no_eligible_reviewed_items",
      request,
    });
    const practice = render(
      <PracticeWorkspace resolveRestaurantSource={unavailableResolver} />,
    );
    startRestaurantPractice();

    expect(
      screen.getByRole("heading", { name: "No reviewed practice matches these settings" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/instead of quietly broadening it/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Type your answer")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Adjust settings" })).toBeInTheDocument();
    expect(await axe(practice.container)).toHaveNoViolations();
  });

  it("requires an explicit repeat choice when a singleton cannot be spaced", async () => {
    const resolved = resolveRestaurantPracticeSource({
      activity: "type",
      collectionId: "intermediate-restaurant",
      direction: "both",
      focus: "recommended",
      stage: "intermediate",
    });
    expect(resolved.status).toBe("ready");
    if (resolved.status !== "ready") return;
    const singletonResolver: typeof resolveRestaurantPracticeSource = () => ({
      status: "ready",
      source: {
        ...resolved.source,
        candidates: resolved.source.candidates.slice(0, 1),
        prompts: resolved.source.prompts.slice(0, 1),
      },
    });
    fetchMock.mockResolvedValueOnce(
      gradedResponse("wrong", "Try this reviewed prompt again.", "Reviewed answer."),
    );
    const practice = render(
      <PracticeWorkspace resolveRestaurantSource={singletonResolver} />,
    );
    startRestaurantPractice();
    const prompt = currentPromptText(practice.container);
    await answerCurrentPrompt("Missed singleton");

    expect(
      await screen.findByRole("heading", {
        name: "More spacing is not available in this scope",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Type your answer")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pause practice on this page" }));
    fireEvent.click(screen.getByRole("button", { name: "Resume practice" }));
    expect(
      screen.getByRole("heading", { name: "More spacing is not available in this scope" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Repeat now" }));

    expect(currentPromptText(practice.container)).toBe(prompt);
    expect(screen.getByLabelText("Type your answer")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Repeat now" })).not.toBeInTheDocument();
    expect(await axe(practice.container)).toHaveNoViolations();
  });

  it("shows live-grader feedback for a plausible non-matching answer", async () => {
    renderPracticeWorkspace();
    fireEvent.click(
      screen.getByRole("button", { name: "Adjust Time, Habits, and Plans settings" }),
    );
    fireEvent.click(screen.getByRole("checkbox", { name: /Vary the order/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start practice" }));
    await answerCurrentPrompt("Suelo cocinar en domingo.");

    const feedback = await screen.findByRole("status", { name: "Feedback: Almost" });
    expect(feedback).toHaveClass("feedback-close");
    expect(feedback).toHaveTextContent(
      "Use los domingos for a habitual action, not en domingos.",
    );
    const correction = screen.getByLabelText("A correct answer: Suelo cocinar los domingos.");
    expect(correction).toHaveTextContent("Suelo cocinar los domingos.");
    expect(correction.querySelector(".correction-close")).toHaveTextContent("domingos");
    expect(correction.querySelector(".correction-changed")).toHaveTextContent("los");
    expect(screen.queryByLabelText("Correction key")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Answer details")).not.toBeInTheDocument();
  });

  it("shows one complete reviewed answer instead of correction chips", async () => {
    fetchMock.mockResolvedValueOnce(
      gradedResponse(
        "wrong",
        "Use the completed event requested by the prompt.",
        "Ayer pedí sopa, pero me trajeron una ensalada.",
        35,
        [{ start: 0, end: 4, kind: "different" }],
      ),
    );
    renderPracticeWorkspace();
    startRestaurantPractice();
    await answerCurrentPrompt("Quiero sopa.");

    const feedback = await screen.findByRole("status", { name: "Feedback: Keep working" });
    expect(feedback).toHaveClass("feedback-wrong");
    expect(
      screen.getByLabelText(
        "A correct answer: Ayer pedí sopa, pero me trajeron una ensalada.",
      ),
    ).toHaveTextContent("Ayer pedí sopa, pero me trajeron una ensalada.");
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

  it("explicitly continues without evidence after a non-retryable grading failure", async () => {
    fetchMock.mockResolvedValueOnce(
      ungradedResponse(
        false,
        "Automatic grading isn’t available for this answer. Your response is still here, but retrying won’t help right now.",
      ),
    );
    const { container } = renderPracticeWorkspace();
    startRestaurantPractice();
    const deferredPrompt = currentPromptText(container);
    await answerCurrentPrompt("Quiero sopa.");

    expect(await screen.findByRole("alert")).toHaveTextContent("retrying won’t help right now");
    expect(screen.getByLabelText("Type your answer")).toHaveValue("Quiero sopa.");
    expect(screen.queryByRole("button", { name: "Try grading again" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Completed practice cards: 0")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continue without grading" }));

    expect(currentPromptText(container)).not.toBe(deferredPrompt);
    expect(screen.getByLabelText("Type your answer")).toHaveValue("");
    expect(screen.getByLabelText("Completed practice cards: 0")).toBeInTheDocument();
    expect(screen.queryByLabelText("Your answer")).not.toBeInTheDocument();
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

  it("does not loop when the local grading route is unavailable", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    renderPracticeWorkspace();
    startRestaurantPractice();
    await answerCurrentPrompt("Quiero sopa.");

    expect(await screen.findByRole("alert")).toHaveTextContent("retrying won’t help right now");
    expect(screen.queryByRole("button", { name: "Try grading again" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue without grading" })).toBeInTheDocument();
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
    fireEvent.click(await screen.findByRole("button", { name: "Start new session" }));
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

  it("uses a fresh seed for a new varied Practice visit", async () => {
    const createSessionSeed = vi.fn()
      .mockReturnValueOnce(42)
      .mockReturnValueOnce(43);
    const { container } = render(
      <PracticeWorkspace createSessionSeed={createSessionSeed} />,
    );
    startRestaurantPractice();
    const firstSessionPrompt = currentPromptText(container);
    await answerCurrentPrompt("Ayer pedí sopa, pero me trajeron una ensalada.");
    await screen.findByRole("status", { name: "Feedback: Correct" });

    fireEvent.click(
      screen.getByRole("button", { name: "End practice and review this session" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Practice again" }));

    expect(createSessionSeed).toHaveBeenCalledTimes(2);
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

  it.each(["Close", "Escape"])(
    "%s discards draft settings without writing local storage",
    async (dismissal) => {
      const storageSetSpy = vi.spyOn(Storage.prototype, "setItem");
      renderPracticeWorkspace();
      fireEvent.click(screen.getByRole("button", { name: "Adjust Restaurant Spanish settings" }));
      const dialog = await screen.findByRole("dialog", { name: "Practice settings" });

      fireEvent.click(screen.getByRole("button", { name: /Time phrases/ }));
      expect(screen.getByRole("button", { name: /Time phrases/ })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      if (dismissal === "Close") {
        fireEvent.click(screen.getByRole("button", { name: "Close practice settings" }));
      } else {
        fireEvent(dialog, new Event("cancel", { bubbles: true, cancelable: true }));
      }

      expect(screen.queryByRole("dialog", { name: "Practice settings" })).not.toBeInTheDocument();
      expect(storageSetSpy).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "Adjust Restaurant Spanish settings" }));
      expect(await screen.findByRole("button", { name: /Recommended mix/ })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.getByRole("button", { name: /Time phrases/ })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      storageSetSpy.mockRestore();
    },
  );

  it("commits and persists options only when practice starts", async () => {
    const storageSetSpy = vi.spyOn(Storage.prototype, "setItem");
    renderPracticeWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Adjust Restaurant Spanish settings" }));
    fireEvent.click(await screen.findByRole("button", { name: /Time phrases/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start practice" }));

    expect(storageSetSpy).toHaveBeenCalledTimes(1);
    const stored = JSON.parse(String(storageSetSpy.mock.calls[0]?.[1])) as Record<
      string,
      Record<string, unknown>
    >;
    expect(stored["intermediate-restaurant"]).toMatchObject({
      activity: "type",
      direction: "both",
      focus: "time-phrases",
      shuffle: true,
    });
    expect(stored["intermediate-restaurant"]).not.toHaveProperty("difficulty");
    storageSetSpy.mockRestore();
  });

  it("starts in-session changes as a fully reset, freshly ordered session", async () => {
    const createSessionSeed = vi.fn()
      .mockReturnValueOnce(42)
      .mockReturnValueOnce(43);
    const { container } = render(<PracticeWorkspace createSessionSeed={createSessionSeed} />);
    startRestaurantPractice();
    const firstPrompt = currentPromptText(container);
    await answerCurrentPrompt("Ayer pedí sopa, pero me trajeron una ensalada.");
    await screen.findByRole("status", { name: "Feedback: Correct" });

    fireEvent.click(screen.getByRole("button", { name: "Adjust practice settings" }));
    expect(await screen.findByRole("button", { name: "Start new session" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "EN → ES" }));
    expect(screen.getByLabelText("Completed practice cards: 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Session score: 100% correct")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start new session" }));

    expect(createSessionSeed).toHaveBeenCalledTimes(2);
    expect(currentPromptText(container)).not.toBe(firstPrompt);
    expect(screen.getByLabelText("Completed practice cards: 0")).toBeInTheDocument();
    expect(screen.queryByLabelText("Session score: 100% correct")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Your answer")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Type your answer")).toHaveValue("");
  });

  it("falls back safely when remembered settings are corrupt", async () => {
    window.localStorage.setItem(
      "aidioma-intermediate-pilot-configurations:v2",
      JSON.stringify({
        "intermediate-restaurant": {
          activity: "story",
          direction: { unexpected: true },
          focus: "unknown-focus",
          shuffle: "yes",
        },
      }),
    );
    renderPracticeWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Adjust Restaurant Spanish settings" }));

    expect(await screen.findByRole("button", { name: "Type" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Both" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Recommended mix/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("checkbox", { name: /Vary the order/ })).toBeChecked();
  });

  it("migrates old support settings without retaining their difficulty field", async () => {
    window.localStorage.setItem(
      "aidioma-intermediate-pilot-configurations:v1",
      JSON.stringify({
        "intermediate-restaurant": {
          activity: "type",
          difficulty: "guided",
          direction: "en-es",
          focus: "time-phrases",
          shuffle: false,
        },
      }),
    );
    const { container } = renderPracticeWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Adjust Restaurant Spanish settings" }));

    expect(await screen.findByRole("button", { name: "EN → ES" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Time phrases/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.queryByRole("group", { name: "Support" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start practice" }));

    const stored = JSON.parse(
      window.localStorage.getItem("aidioma-intermediate-pilot-configurations:v2") ?? "{}",
    ) as Record<string, Record<string, unknown>>;
    expect(stored["intermediate-restaurant"]).not.toHaveProperty("difficulty");
    expect(
      window.localStorage.getItem("aidioma-intermediate-pilot-configurations:v1"),
    ).toBeNull();
    expect(screen.getByLabelText("Active practice settings")).toHaveTextContent(
      "EN → ES only · Time phrases · Fixed order",
    );
    expect(container.querySelector(".active-practice-turn .activity-label")).toBeNull();
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

  it("removes the repeated prompt tag for a fixed ES to EN session", () => {
    const { container } = renderPracticeWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Adjust Restaurant Spanish settings" }));
    fireEvent.click(screen.getByRole("button", { name: "ES → EN" }));
    fireEvent.click(screen.getByRole("button", { name: "Start practice" }));

    expect(screen.getByLabelText("Active practice settings")).toHaveTextContent("ES → EN only");
    expect(container.querySelector(".active-practice-turn .activity-label")).toBeNull();
    expect(container.querySelector(".active-practice-turn .prompt-message")).toHaveClass(
      "has-no-context",
    );
  });

  it("keeps Saved as lightweight local organization", () => {
    renderPracticeWorkspace();

    fireEvent.click(screen.getByRole("button", { name: "Save Restaurant Spanish" }));
    fireEvent.click(screen.getByRole("button", { name: "Saved" }));

    expect(screen.getByText("1 collection · Saved")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Restaurant Spanish" })).toBeInTheDocument();
  });

  it("separates truthful Saved empty states for collections and personal material", () => {
    renderPracticeWorkspace();

    fireEvent.click(screen.getByRole("button", { name: "Saved" }));

    expect(screen.getByRole("heading", { name: "Bookmarked collections" })).toBeInTheDocument();
    expect(screen.getByText("No bookmarked collections for this visit.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Personal saved material" })).toBeInTheDocument();
    expect(
      screen.getByText(/No personal saved material yet/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Practice saved material" })).not.toBeInTheDocument();
  });

  it("saves and removes a prompt from typed feedback without persisting it", async () => {
    renderPracticeWorkspace();
    startRestaurantPractice();
    await answerCurrentPrompt("Ayer pedí sopa, pero me trajeron una ensalada.");
    await screen.findByRole("status", { name: "Feedback: Correct" });

    const savePrompt = screen.getByRole("button", {
      name: "Save this prompt to personal saved material",
    });
    fireEvent.click(savePrompt);
    expect(
      screen.getByRole("button", {
        name: "Remove this prompt from personal saved material",
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Saved for this visit")).toBeInTheDocument();
    expect(window.localStorage.length).toBe(0);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove this prompt from personal saved material",
      }),
    );
    expect(
      screen.getByRole("button", { name: "Save this prompt to personal saved material" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("recognizes one saved prompt across both practice directions", async () => {
    renderPracticeWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Adjust Restaurant Spanish settings" }));
    fireEvent.click(screen.getByRole("button", { name: "EN → ES" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Vary the order/ }));
    fireEvent.click(screen.getByRole("button", { name: "Start practice" }));
    await answerCurrentPrompt("First direction answer");
    await screen.findByRole("status", { name: "Feedback: Correct" });
    fireEvent.click(
      screen.getByRole("button", { name: "Save this prompt to personal saved material" }),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "End practice and review this session" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Browse collections" }));
    fireEvent.click(screen.getByRole("button", { name: "Adjust Restaurant Spanish settings" }));
    fireEvent.click(screen.getByRole("button", { name: "ES → EN" }));
    fireEvent.click(screen.getByRole("button", { name: "Start practice" }));
    fetchMock.mockClear();
    await answerCurrentPrompt("Second direction answer");
    await screen.findByRole("status", { name: "Feedback: Correct" });

    expect(
      screen.getByRole("button", {
        name: "Remove this prompt from personal saved material",
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps collection bookmarks separate and practices only current saved prompts", async () => {
    renderPracticeWorkspace();
    startRestaurantPractice();
    await answerCurrentPrompt("Save this one");
    await screen.findByRole("status", { name: "Feedback: Correct" });
    const firstRequest = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      itemRef: string;
    };
    const savedRecord = practiceSetFixtures
      .flatMap((collection) =>
        collection.prompts.map((prompt) => ({ collection, prompt })),
      )
      .find(({ prompt }) => prompt.id === firstRequest.itemRef);
    expect(savedRecord).toBeDefined();
    fireEvent.click(
      screen.getByRole("button", { name: "Save this prompt to personal saved material" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save Restaurant Spanish" }));
    fireEvent.click(
      screen.getByRole("button", { name: "End practice and review this session" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Browse collections" }));
    fireEvent.click(screen.getByRole("button", { name: "Saved" }));

    expect(screen.getByRole("button", { name: "Start Restaurant Spanish" })).toBeInTheDocument();
    expect(screen.getByText(savedRecord?.prompt.english ?? "missing")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Practice saved Restaurant prompts" }));
    expect(screen.getByRole("heading", { name: "Saved Restaurant prompts" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Adjust practice settings" })).not.toBeInTheDocument();

    fetchMock.mockClear();
    await answerCurrentPrompt("Only saved material");
    await screen.findByRole("status", { name: "Feedback: Correct" });
    const savedQueueRequest = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      itemRef: string;
    };
    expect(savedQueueRequest.itemRef).toBe(firstRequest.itemRef);

    fireEvent.click(
      screen.getByRole("button", { name: "End practice and review this session" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Browse collections" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: `Remove “${savedRecord?.prompt.english}” from personal saved material`,
      }),
    );
    expect(screen.getByText(/No personal saved material yet/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Practice saved material" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Restaurant Spanish" })).toBeInTheDocument();
  });

  it("pauses and restores the exact reinforced Saved Restaurant journey in memory", async () => {
    const practice = renderPracticeWorkspace(42);
    startRestaurantPractice();

    for (let completed = 1; completed <= 4; completed += 1) {
      await answerCurrentPrompt(`Save Restaurant prompt ${completed}`);
      await screen.findByRole("status", { name: "Feedback: Correct" });
      const saveButtons = screen.getAllByRole("button", {
        name: "Save this prompt to personal saved material",
      });
      fireEvent.click(saveButtons[saveButtons.length - 1]);
    }
    fireEvent.click(screen.getByRole("button", { name: "End practice and review this session" }));
    fireEvent.click(screen.getByRole("button", { name: "Browse collections" }));
    fireEvent.click(screen.getByRole("button", { name: "Saved" }));
    fireEvent.click(screen.getByRole("button", { name: "Practice saved Restaurant prompts" }));

    fetchMock.mockResolvedValueOnce(
      gradedResponse("wrong", "Use the reviewed target.", "Reviewed target."),
    );
    const missedPrompt = currentPromptText(practice.container);
    const missedDirection = practice.container.querySelector(
      ".active-practice-turn .activity-label",
    )?.textContent;
    await answerCurrentPrompt("Saved miss");
    await waitFor(() =>
      expect(screen.getByLabelText("Completed practice cards: 1")).toBeInTheDocument(),
    );
    const nextPrompt = currentPromptText(practice.container);
    fireEvent.change(screen.getByLabelText("Type your answer"), {
      target: { value: "Draft kept during this page pause" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Pause practice on this page" }));

    expect(screen.getByRole("heading", { name: "Saved Restaurant practice is paused" })).toBeInTheDocument();
    expect(screen.getByText(/only while this page stays open/i)).toBeInTheDocument();
    expect(window.localStorage.length).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Resume practice" }));

    expect(currentPromptText(practice.container)).toBe(nextPrompt);
    expect(screen.getByLabelText("Completed practice cards: 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Type your answer")).toHaveValue(
      "Draft kept during this page pause",
    );
    for (let completed = 2; completed <= 4; completed += 1) {
      fireEvent.change(screen.getByLabelText("Type your answer"), {
        target: { value: `Saved retrieved ${completed}` },
      });
      fireEvent.click(screen.getByRole("button", { name: "Send answer" }));
      await waitFor(() =>
        expect(screen.getByLabelText(`Completed practice cards: ${completed}`)).toBeInTheDocument(),
      );
    }
    expect(currentPromptText(practice.container)).toBe(missedPrompt);
    expect(
      practice.container.querySelector(".active-practice-turn .activity-label"),
    ).toHaveTextContent(missedDirection as string);
    expect(await axe(practice.container)).toHaveNoViolations();
  });

  it("fails closed when a paused source changes and offers an explicit updated visit", () => {
    const resolved = resolveRestaurantPracticeSource({
      activity: "type",
      collectionId: "intermediate-restaurant",
      direction: "both",
      focus: "recommended",
      stage: "intermediate",
    });
    expect(resolved.status).toBe("ready");
    if (resolved.status !== "ready") return;
    const resolver = vi.fn<typeof resolveRestaurantPracticeSource>()
      .mockReturnValueOnce(resolved)
      .mockReturnValueOnce({
        status: "ready",
        source: {
          ...resolved.source,
          candidates: resolved.source.candidates.slice(1),
          prompts: resolved.source.prompts.slice(1),
        },
      })
      .mockReturnValue(resolved);
    render(<PracticeWorkspace resolveRestaurantSource={resolver} />);
    startRestaurantPractice();
    fireEvent.click(screen.getByRole("button", { name: "Pause practice on this page" }));
    fireEvent.click(screen.getByRole("button", { name: "Resume practice" }));

    expect(
      screen.getByRole("heading", { name: "This reviewed source version is unavailable" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/will not substitute different material/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start an updated visit" }));
    expect(screen.getByLabelText("Type your answer")).toBeInTheDocument();
    expect(resolver).toHaveBeenCalledTimes(3);
  });

  it("ignores a late grading result across pause and preserves the answer as a draft", async () => {
    let finishGrading: ((response: Response) => void) | undefined;
    fetchMock.mockImplementationOnce(() => new Promise<Response>((resolve) => {
      finishGrading = resolve;
    }));
    renderPracticeWorkspace();
    startRestaurantPractice();
    fireEvent.change(screen.getByLabelText("Type your answer"), {
      target: { value: "Keep this ungraded draft" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send answer" }));
    await screen.findByText("Checking your answer…");
    fireEvent.click(screen.getByRole("button", { name: "Pause practice on this page" }));
    fireEvent.click(screen.getByRole("button", { name: "Resume practice" }));

    expect(screen.getByLabelText("Type your answer")).toHaveValue("Keep this ungraded draft");
    await act(async () => {
      finishGrading?.(gradedResponse("correct", "Correct.", "Reviewed target."));
      await Promise.resolve();
    });
    expect(screen.getByLabelText("Completed practice cards: 0")).toBeInTheDocument();
    expect(screen.getByLabelText("Type your answer")).toHaveValue("Keep this ungraded draft");
  });

  it("explains unavailable Saved Restaurant references without substituting or showing Flashcards", () => {
    const unavailableReference = savedPracticeReference(
      "intermediate-restaurant",
      "withdrawn-restaurant-prompt",
    );
    const practice = render(
      <PracticeWorkspace initialSavedPromptReferences={[unavailableReference]} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Saved" }));

    expect(screen.getByText(/1 saved prompt is no longer available/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove unavailable saved material" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Practice saved Restaurant prompts" }));

    expect(
      screen.getByRole("heading", { name: "No saved Restaurant prompts are available" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/did not replace them with other prompts/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review saved material" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Type your answer")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset card" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next card" })).not.toBeInTheDocument();
    expect(practice.container.querySelector(".active-practice-turn")).toBeNull();
  });

  it("keeps other Saved collections on their named existing path", () => {
    const restaurantPrompt = practiceSetFixtures[0].prompts[0];
    const otherCollection = practiceSetFixtures[1];
    const otherPrompt = otherCollection.prompts[0];
    const practice = render(
      <PracticeWorkspace
        initialSavedPromptReferences={[
          savedPracticeReference(practiceSetFixtures[0].id, restaurantPrompt.id),
          savedPracticeReference(otherCollection.id, otherPrompt.id),
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Saved" }));

    expect(screen.getByRole("button", { name: "Practice saved Restaurant prompts" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Practice other saved material" }));
    expect(currentPromptText(practice.container)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Pause practice on this page" })).not.toBeInTheDocument();
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
    fireEvent.click(screen.getByRole("button", { name: "Saved" }));
    expect(await axe(practice.container)).toHaveNoViolations();
    practice.unmount();

    const lesson = render(<IntermediateLessonPilot />);
    expect(await axe(lesson.container)).toHaveNoViolations();
  });
});
