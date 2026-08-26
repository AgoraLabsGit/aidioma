"use client";

import { Check, CircleAlert, Lightbulb, LoaderCircle, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { correctionSegments } from "@/lib/practice-serving/correction-segments";
import {
  LessonJourneyErrorSchema,
  LessonJourneyResponseSchema,
  type LessonJourneyAction,
  type LessonJourneyResponse,
  type LessonJourneyView,
} from "@/lib/learning-journey/lesson-api-contract";

import { Button, Card, IconButton } from "./primitives";
import { PrototypeContextHeader } from "./prototype-context-header";

export interface LessonJourneyClient {
  load(signal?: AbortSignal): Promise<LessonJourneyResponse>;
  command(action: LessonJourneyAction, signal?: AbortSignal): Promise<LessonJourneyResponse>;
  startReview(collectionId: string, signal?: AbortSignal): Promise<void>;
}

class LessonJourneyClientError extends Error {
  constructor(message: string, readonly retryable = false) {
    super(message);
    this.name = "LessonJourneyClientError";
  }
}

async function readResponse(response: Response): Promise<LessonJourneyResponse> {
  let body: unknown;
  try {
    body = (await response.json()) as unknown;
  } catch {
    throw new LessonJourneyClientError("This lesson is temporarily unavailable.", true);
  }
  if (!response.ok) {
    const parsedError = LessonJourneyErrorSchema.safeParse(body);
    throw new LessonJourneyClientError(
      parsedError.success ? parsedError.data.message : "This lesson is temporarily unavailable.",
      parsedError.success ? (parsedError.data.retryable ?? false) : response.status >= 500,
    );
  }
  const parsed = LessonJourneyResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new LessonJourneyClientError("The lesson returned an unsafe response.", true);
  }
  return parsed.data;
}

export const browserLessonJourneyClient: LessonJourneyClient = {
  async load(signal) {
    return readResponse(await fetch("/api/practice/session/lesson", {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal,
    }));
  },
  async command(action, signal) {
    return readResponse(await fetch("/api/practice/session/lesson", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(action),
      signal,
    }));
  },
  async startReview(collectionId, signal) {
    const response = await fetch("/api/practice/session", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", sourceId: collectionId, sourceKind: "collection" }),
      signal,
    });
    if (!response.ok) throw new LessonJourneyClientError("Recommended review is temporarily unavailable.", response.status >= 500);
  },
};

function verdictTitle(verdict: "correct" | "close" | "wrong") {
  return verdict === "correct" ? "Correct" : verdict === "close" ? "Almost" : "Keep working";
}

function AttemptFeedback({ attempt }: { attempt: LessonJourneyView["attempts"][number] }) {
  const title = verdictTitle(attempt.verdict);
  const Icon = attempt.verdict === "correct" ? Check : CircleAlert;
  return (
    <section className="practice-turn">
      <div aria-label="Your answer" className="practice-message answer-message">{attempt.answer}</div>
      <div
        aria-label={`Feedback: ${title}`}
        className={`practice-message feedback-message feedback-${attempt.verdict}${attempt.verdict === "correct" ? " is-compact" : ""}`}
      >
        <div className="feedback-heading"><Icon aria-hidden="true" /><strong>{title}</strong></div>
        {attempt.feedback.trim().toLocaleLowerCase() !== `${title.toLocaleLowerCase()}.` ? <p>{attempt.feedback}</p> : null}
        {attempt.verdict !== "correct" ? (
          <div className="feedback-reference-block">
            <span className="feedback-reference-label">A correct answer</span>
            <div aria-label={`A correct answer: ${attempt.target}`} className="feedback-reference-answer" lang="es">
              {(attempt.correction ? correctionSegments(attempt.correction) : [{ key: "plain-0", value: attempt.target }]).map((segment) => (
                <span className={segment.className} key={segment.key}>{segment.value}</span>
              ))}
            </div>
          </div>
        ) : null}
        {attempt.assisted ? <small className="lesson-assistance-note">Completed with help; this attempt does not raise mastery.</small> : null}
      </div>
    </section>
  );
}

function ContextualExchange({ exchange }: { exchange: LessonJourneyView["exchanges"][number] }) {
  const label = exchange.kind === "authored-hint" ? "Authored hint" : "AI explanation";
  return (
    <section className="practice-turn contextual-exchange">
      <div aria-label="Your question" className="practice-message answer-message">{exchange.question}</div>
      <div className="practice-message feedback-message ai-explanation-message">
        <div className="feedback-heading"><Sparkles aria-hidden="true" /><strong>{label}</strong></div>
        <p>{exchange.answer}</p>
        {exchange.kind === "authored-hint" ? <small>Uses the next authored lesson hint.</small> : null}
      </div>
    </section>
  );
}

export function LearningWorkspace({
  client = browserLessonJourneyClient,
  onReviewStarted = () => window.location.assign("/practice"),
}: {
  client?: LessonJourneyClient;
  onReviewStarted?: () => void;
} = {}) {
  const [lesson, setLesson] = useState<LessonJourneyView | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<{ message: string; retryable: boolean } | null>(null);
  const [composerMode, setComposerMode] = useState<"answer" | "question">("answer");
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const history = lesson
    ? [
        ...lesson.attempts.map((attempt, index) => ({
          at: attempt.attemptedAt,
          attempt,
          kind: "attempt" as const,
          key: `attempt-${attempt.attemptedAt}-${index}`,
        })),
        ...lesson.exchanges.map((exchange) => ({
          at: exchange.answeredAt,
          exchange,
          kind: "exchange" as const,
          key: `exchange-${exchange.requestId}`,
        })),
      ].sort((left, right) => left.at.localeCompare(right.at))
    : [];

  useEffect(() => {
    const controller = new AbortController();
    requestRef.current = controller;
    void client.load(controller.signal).then((response) => {
      setLesson(response.lesson);
    }).catch((caught: unknown) => {
      if (controller.signal.aborted) return;
      setError({
        message: caught instanceof Error ? caught.message : "This lesson is temporarily unavailable.",
        retryable: caught instanceof LessonJourneyClientError ? caught.retryable : true,
      });
    }).finally(() => {
      if (!controller.signal.aborted) {
        setBusy(false);
        setLoaded(true);
      }
    });
    return () => controller.abort();
  }, [client]);

  async function run(action: LessonJourneyAction): Promise<LessonJourneyResponse | null> {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setBusy(true);
    setError(null);
    try {
      const response = await client.command(action, controller.signal);
      setLesson(response.lesson);
      return response;
    } catch (caught) {
      if (controller.signal.aborted) return null;
      setError({
        message: caught instanceof Error ? caught.message : "This lesson is temporarily unavailable.",
        retryable: caught instanceof LessonJourneyClientError ? caught.retryable : true,
      });
      return null;
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  async function sessionCommand(action: "lesson-continue" | "lesson-hint") {
    if (!lesson || busy) return;
    await run({ action, expectedRevision: lesson.revision, sessionId: lesson.sessionId });
  }

  async function submitComposer() {
    const value = draft.trim();
    if (!lesson || !value || busy) return;
    const action: LessonJourneyAction = composerMode === "question"
      ? {
          action: "lesson-question",
          expectedRevision: lesson.revision,
          question: value,
          requestId: crypto.randomUUID(),
          sessionId: lesson.sessionId,
        }
      : {
          action: "lesson-answer",
          answer: value,
          expectedRevision: lesson.revision,
          sessionId: lesson.sessionId,
        };
    const response = await run(action);
    if (!response?.lesson) return;
    setDraft("");
    if (composerMode === "question") setComposerMode("answer");
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  function switchComposer(mode: "answer" | "question") {
    setComposerMode(mode);
    setDraft("");
    setError(null);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function startRecommendedReview() {
    if (!lesson?.recommendation || busy) return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setBusy(true);
    setError(null);
    try {
      await client.startReview(lesson.recommendation.collectionId, controller.signal);
      onReviewStarted();
    } catch (caught) {
      if (controller.signal.aborted) return;
      setError({
        message: caught instanceof Error ? caught.message : "Recommended review is temporarily unavailable.",
        retryable: caught instanceof LessonJourneyClientError ? caught.retryable : true,
      });
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  if (busy && !loaded) {
    return (
      <div className="practice-workspace learning-workspace">
        <PrototypeContextHeader backHref="/lessons" backLabel="Back to lessons" title="Lesson 1" />
        <div className="practice-feed"><Card aria-live="polite" className="saved-section-empty" role="status"><LoaderCircle aria-hidden="true" /> Loading your lesson…</Card></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="practice-workspace learning-workspace">
        <PrototypeContextHeader backHref="/lessons" backLabel="Back to lessons" title="Lesson 1" />
        <div className="practice-feed lesson-start-feed">
          {error ? (
            <Card aria-live="polite" className="serving-unavailable-card" role="alert"><CircleAlert aria-hidden="true" /><div><h2>Lesson unavailable</h2><p>{error.message}</p></div></Card>
          ) : (
            <Card className="lesson-complete-card">
              <span className="eyebrow">A1 · Lesson 1</span>
              <h2>Saying where you live</h2>
              <p>Learn one useful pattern in your Spanish profile, then complete a short check.</p>
              <Button disabled={busy} onClick={() => void run({ action: "lesson-start" })}>Start lesson</Button>
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (lesson.position === "complete") {
    return (
      <div className="practice-workspace learning-workspace">
        <PrototypeContextHeader backHref="/lessons" backLabel="Back to lessons" title={lesson.title} />
        <div className="practice-feed lesson-complete-feed">
          <Card className="lesson-complete-card">
            <span className="lesson-complete-icon"><Check aria-hidden="true" /></span>
            <span className="eyebrow">Lesson complete</span>
            <h2>{lesson.title}</h2>
            <p>Your progress is saved, and two review collections are now available.</p>
          </Card>
          <Card className="evidence-preview-card lesson-collection-card">
            <div className="feedback-heading"><Sparkles aria-hidden="true" /><strong>Newly available</strong></div>
            <ul aria-label="Newly available review collections">
              {lesson.availableCollections.map((collection) => <li key={collection.id}><strong>{collection.title}</strong> · {collection.description}</li>)}
            </ul>
          </Card>
          {lesson.recommendation ? (
            <Card className="evidence-preview-card recommendation-card">
              <span className="eyebrow">Recommended review</span>
              <h2>{lesson.recommendation.title}</h2>
              <p>{lesson.recommendation.reason}</p>
            </Card>
          ) : null}
          {error ? <div aria-live="polite" className="practice-message grading-error" role="alert"><CircleAlert aria-hidden="true" /><span>{error.message}</span></div> : null}
          <div className="recap-actions">
            <Button disabled={busy || !lesson.recommendation} onClick={() => void startRecommendedReview()}>Start recommended review</Button>
            <Link className="button button-quiet" href="/practice">Browse practice</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-workspace learning-workspace">
      <PrototypeContextHeader
        backHref="/lessons"
        backLabel="Back to lessons"
        title={lesson.title}
        trailing={<span aria-label={`Lesson stage: ${lesson.position === "teaching" ? "Learn" : "Check"}`} className="session-score-chip">{lesson.position === "teaching" ? "Learn" : "Check"}</span>}
      />
      <div aria-label="Lesson conversation" className="practice-feed chat-practice-feed" role="log">
        {lesson.position === "teaching" ? (
          <section className="practice-turn active-practice-turn">
            <article className="practice-message prompt-message lesson-teaching-card">
              <div className="activity-label"><span>{lesson.cefr} · {lesson.objective}</span><span>Teaching example</span></div>
              <h2>{lesson.teaching.title}</h2>
              <p>{lesson.teaching.body}</p>
              <div className="lesson-example" lang="es">{lesson.teaching.example}</div>
              {lesson.teaching.note ? <small>{lesson.teaching.note}</small> : null}
            </article>
            {lesson.exchanges.map((exchange) => <ContextualExchange exchange={exchange} key={exchange.requestId} />)}
            {error ? <div aria-live="polite" className="practice-message grading-error" role="alert"><CircleAlert aria-hidden="true" /><span>{error.message}</span></div> : null}
            <Button disabled={busy} onClick={() => void sessionCommand("lesson-continue")}>Continue to check</Button>
          </section>
        ) : (
          <>
            {history.map((entry) => entry.kind === "attempt"
              ? <AttemptFeedback attempt={entry.attempt} key={entry.key} />
              : <ContextualExchange exchange={entry.exchange} key={entry.key} />)}
            <section className="practice-turn active-practice-turn">
              <article className="practice-message prompt-message">
                <div className="prompt-context-row"><p className="prompt-cue">{lesson.current.cue}</p><div className="activity-label"><span>English → Spanish</span></div></div>
                <h2>{lesson.current.prompt}</h2>
                <button className="lesson-hint-action" disabled={busy || lesson.hints.length >= 3} onClick={() => void sessionCommand("lesson-hint")} type="button"><Lightbulb aria-hidden="true" />{lesson.hints.length ? "Another hint" : "Show a hint"}</button>
                {lesson.hints.length ? <ul className="lesson-hints" aria-label="Authored hints">{lesson.hints.map((hint, index) => <li key={`${index}-${hint}`}>{hint}</li>)}</ul> : null}
              </article>
              {error ? <div aria-live="polite" className="practice-message grading-error" role="alert"><CircleAlert aria-hidden="true" /><span>{error.message}</span>{error.retryable ? <span>Your text is still in the composer.</span> : null}</div> : null}
            </section>
          </>
        )}
      </div>
      <form className={`practice-composer prototype-composer${composerMode === "question" ? " is-question-mode" : ""}`} onSubmit={(event) => { event.preventDefault(); void submitComposer(); }}>
        <Button className="composer-mode-action" disabled={busy} onClick={() => switchComposer(composerMode === "question" ? "answer" : "question")} variant="quiet">{composerMode === "question" ? "Cancel question" : "Ask AIdioma"}</Button>
        <label className="visually-hidden" htmlFor="lesson-composer">{composerMode === "question" ? "Ask AIdioma about this lesson" : "Type your Spanish answer"}</label>
        <input
          disabled={busy}
          id="lesson-composer"
          maxLength={composerMode === "question" ? 500 : 1000}
          onChange={(event) => { setDraft(event.target.value); setError(null); }}
          placeholder={composerMode === "question" ? "Ask about this lesson" : lesson.position === "teaching" ? "Ask about this example" : "Type your Spanish answer"}
          ref={inputRef}
          spellCheck={composerMode === "question"}
          type="text"
          value={draft}
        />
        <IconButton aria-label={composerMode === "question" ? "Send question" : "Send answer"} disabled={busy || !draft.trim() || (composerMode === "answer" && lesson.position !== "check")} type="submit"><Send aria-hidden="true" /></IconButton>
      </form>
    </div>
  );
}
