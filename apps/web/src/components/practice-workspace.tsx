"use client";

import { Check, CircleAlert, LoaderCircle, Pause, Send, Sparkles, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { adaptiveOfferExplanation } from "@/lib/practice-serving/adaptive-session";
import { correctionSegments } from "@/lib/practice-serving/correction-segments";
import {
  PracticeSessionErrorSchema,
  PracticeSessionResponseSchema,
  type PracticeSessionAction,
  type PracticeSessionResponse,
  type PracticeSessionView,
} from "@/lib/practice-serving/session-api-contract";

import { Button, Card, IconButton } from "./primitives";
import { PrototypeContextHeader } from "./prototype-context-header";

const draftStorageKey = "aidioma:practice-draft:v1";

export interface PracticeSessionClient {
  load(signal?: AbortSignal): Promise<PracticeSessionResponse>;
  command(action: PracticeSessionAction, signal?: AbortSignal): Promise<PracticeSessionResponse>;
}

class PracticeSessionClientError extends Error {
  constructor(message: string, readonly retryable = false) {
    super(message);
    this.name = "PracticeSessionClientError";
  }
}

async function readResponse(response: Response): Promise<PracticeSessionResponse> {
  let body: unknown;
  try {
    body = (await response.json()) as unknown;
  } catch {
    throw new PracticeSessionClientError("Practice is temporarily unavailable.", true);
  }
  if (!response.ok) {
    const parsedError = PracticeSessionErrorSchema.safeParse(body);
    throw new PracticeSessionClientError(
      parsedError.success ? parsedError.data.message : "Practice is temporarily unavailable.",
      parsedError.success ? (parsedError.data.retryable ?? false) : response.status >= 500,
    );
  }
  const parsed = PracticeSessionResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new PracticeSessionClientError("Practice returned an unsafe response.", true);
  }
  return parsed.data;
}

export const browserPracticeSessionClient: PracticeSessionClient = {
  async load(signal) {
    return readResponse(
      await fetch("/api/practice/session", {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal,
      }),
    );
  },
  async command(action, signal) {
    return readResponse(
      await fetch("/api/practice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(action),
        signal,
      }),
    );
  },
};

type PracticeView = "catalog" | "session" | "recap";

function readDraft(sessionId: string): string {
  try {
    const raw = window.localStorage.getItem(draftStorageKey);
    if (!raw) return "";
    const value = JSON.parse(raw) as { sessionId?: unknown; answer?: unknown };
    return value.sessionId === sessionId && typeof value.answer === "string" ? value.answer : "";
  } catch {
    return "";
  }
}

function retainDraft(sessionId: string, answer: string): void {
  try {
    if (!answer) window.localStorage.removeItem(draftStorageKey);
    else window.localStorage.setItem(draftStorageKey, JSON.stringify({ sessionId, answer }));
  } catch {
    // The account-backed session survives even when this optional unsent draft cannot persist.
  }
}

function verdictTitle(verdict: "correct" | "close" | "wrong") {
  return verdict === "correct" ? "Correct" : verdict === "close" ? "Almost" : "Keep working";
}

function AttemptFeedback({ attempt, isSaved, onSave }: {
  attempt: PracticeSessionView["attempts"][number];
  isSaved: boolean;
  onSave: () => void;
}) {
  const title = verdictTitle(attempt.verdict);
  const Icon = attempt.verdict === "correct" ? Check : CircleAlert;
  return (
    <section className="practice-turn">
      <article className="practice-message prompt-message has-no-context">
        <h2>{attempt.prompt}</h2>
      </article>
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
              {(attempt.correction ? correctionSegments(attempt.correction) : [{ key: "plain-0", value: attempt.target }]).map(
                (segment) => (
                  <span className={segment.className} key={segment.key}>{segment.value}</span>
                ),
              )}
            </div>
          </div>
        ) : null}
        <button
          aria-label={isSaved ? "Remove this item from All saved" : "Save this item to All saved"}
          aria-pressed={isSaved}
          className={`feedback-save-action saved-toggle${isSaved ? " is-saved" : ""}`}
          onClick={onSave}
          type="button"
        >
          <Star aria-hidden="true" />{isSaved ? "Saved in All saved" : "Save to All saved"}
        </button>
      </div>
    </section>
  );
}

export function PracticeWorkspace({ client = browserPracticeSessionClient }: { client?: PracticeSessionClient } = {}) {
  const [view, setView] = useState<PracticeView>("catalog");
  const [session, setSession] = useState<PracticeSessionView | null>(null);
  const [recap, setRecap] = useState<PracticeSessionView | null>(null);
  const [savedItemIds, setSavedItemIds] = useState<string[]>([]);
  const [availableCollectionIds, setAvailableCollectionIds] = useState<string[]>([]);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<{ message: string; retryable: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    requestRef.current = controller;
    void client.load(controller.signal).then((response) => {
      setSavedItemIds(response.savedItemIds);
      setAvailableCollectionIds(response.availableCollectionIds ?? []);
      if (response.session) {
        setSession(response.session);
        setTypedAnswer(readDraft(response.session.sessionId));
        setView(response.session.status === "paused" ? "catalog" : "session");
      }
    }).catch((caught: unknown) => {
      if (controller.signal.aborted) return;
      setError({
        message: caught instanceof Error ? caught.message : "Practice is temporarily unavailable.",
        retryable: caught instanceof PracticeSessionClientError ? caught.retryable : true,
      });
    }).finally(() => {
      if (!controller.signal.aborted) setBusy(false);
    });
    return () => controller.abort();
  }, [client]);

  useEffect(() => {
    if (session) retainDraft(session.sessionId, typedAnswer);
  }, [session, typedAnswer]);

  async function run(action: PracticeSessionAction): Promise<PracticeSessionResponse | null> {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setBusy(true);
    setError(null);
    try {
      const response = await client.command(action, controller.signal);
      setSavedItemIds(response.savedItemIds);
      setAvailableCollectionIds(response.availableCollectionIds ?? []);
      return response;
    } catch (caught) {
      if (controller.signal.aborted) return null;
      setError({
        message: caught instanceof Error ? caught.message : "Practice is temporarily unavailable.",
        retryable: caught instanceof PracticeSessionClientError ? caught.retryable : true,
      });
      return null;
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  async function start(sourceKind: "collection" | "saved", sourceId?: string) {
    const response = await run({ action: "start", sourceKind, ...(sourceId ? { sourceId } : {}) });
    if (!response?.session) return;
    setSession(response.session);
    setTypedAnswer(readDraft(response.session.sessionId));
    setPendingAnswer(null);
    setView(response.session.status === "paused" ? "catalog" : "session");
  }

  async function submitAnswer() {
    const answer = typedAnswer.trim();
    if (!answer || !session || busy) return;
    setPendingAnswer(answer);
    const response = await run({ action: "answer", answer, offerOrdinal: session.current.ordinal, sessionId: session.sessionId });
    if (!response?.session) {
      setPendingAnswer(null);
      return;
    }
    setSession(response.session);
    setTypedAnswer("");
    setPendingAnswer(null);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function changeStatus(action: "pause" | "resume" | "end") {
    if (!session) return;
    const completed = session;
    const response = await run({ action, sessionId: session.sessionId });
    if (action === "end" && response) {
      retainDraft(session.sessionId, "");
      setRecap(completed);
      setSession(null);
      setView("recap");
      return;
    }
    if (!response?.session) return;
    setSession(response.session);
    setView(response.session.status === "paused" ? "catalog" : "session");
    if (action === "resume") window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function toggleSaved(itemId: string) {
    if (!session) return;
    const response = await run({ action: "save", itemId, saved: !savedItemIds.includes(itemId), sessionId: session.sessionId });
    if (response?.session) setSession(response.session);
  }

  if (busy && !session && !recap) {
    return (
      <div className="practice-workspace">
        <PrototypeContextHeader title="Practice" titleStyle="screen" />
        <div className="practice-feed prototype-feed">
          <Card aria-live="polite" className="saved-section-empty" role="status"><LoaderCircle aria-hidden="true" /> Loading your practice…</Card>
        </div>
      </div>
    );
  }

  if (view === "recap" && recap) {
    const correctCount = recap.attempts.filter((attempt) => attempt.verdict === "correct").length;
    return (
      <div className="practice-workspace">
        <PrototypeContextHeader title="Practice recap" />
        <div className="practice-feed recap-feed">
          <Card className="recap-hero-card">
            <span className="eyebrow">Session complete</span><h2>{recap.source.title}</h2>
            <p>You completed {recap.attempts.length} {recap.attempts.length === 1 ? "answer" : "answers"}; {correctCount} {correctCount === 1 ? "was" : "were"} correct.</p>
          </Card>
          <Card className="evidence-preview-card">
            <div className="feedback-heading"><Sparkles aria-hidden="true" /><strong>Your next visit will adapt</strong></div>
            <p>Misses, confidence, and due timing were retained without a separate direction score.</p>
          </Card>
          <div className="recap-actions">
            <Button onClick={() => void start("collection")}>Practice again</Button>
            <Button onClick={() => { setRecap(null); setView("catalog"); }} variant="quiet">Browse practice</Button>
          </div>
        </div>
      </div>
    );
  }

  if (session?.status === "paused") {
    return (
      <div className="practice-workspace">
        <PrototypeContextHeader title="Practice" titleStyle="screen" />
        <div className="practice-feed paused-practice-feed">
          <Card aria-live="polite" className="paused-practice-card" role="status">
            <Pause aria-hidden="true" />
            <div><span className="eyebrow">Saved to your account</span><h2>{session.source.title} is paused</h2><p>{session.attempts.length} completed {session.attempts.length === 1 ? "answer" : "answers"}, your next item, and your learning evidence are ready on return.</p></div>
            <div className="paused-practice-actions">
              <Button disabled={busy} onClick={() => void changeStatus("resume")}>Resume practice</Button>
              <Button disabled={busy} onClick={() => void changeStatus("end")} variant="quiet">End session</Button>
            </div>
          </Card>
          {error ? <p role="alert">{error.message}</p> : null}
        </div>
      </div>
    );
  }

  if (view === "catalog" || !session) {
    return (
      <div className="practice-workspace">
        <PrototypeContextHeader title="Practice" titleStyle="screen" />
        <div className="practice-feed prototype-feed">
          {error ? <Card aria-live="polite" className="serving-unavailable-card" role="alert"><CircleAlert aria-hidden="true" /><div><h2>Practice is unavailable</h2><p>{error.message}</p></div></Card> : null}
          <p className="filter-result-count">{1 + availableCollectionIds.length} reviewed {1 + availableCollectionIds.length === 1 ? "collection" : "collections"}</p>
          <div className="practice-set-grid">
            <article className="practice-set-card">
              <button aria-label="Start Everyday location" className="practice-set-start" disabled={busy} onClick={() => void start("collection")} type="button">
                <span className="set-card-topline"><span className="set-level">A1</span></span><strong>Everyday location</strong><span className="set-description">A promoted, dialect-aware collection for saying where someone lives.</span>
              </button>
            </article>
            {availableCollectionIds.includes("collection.a1.present-regular-ir") ? (
              <article className="practice-set-card">
                <button aria-label="Start Present -ir forms" className="practice-set-start" disabled={busy} onClick={() => void start("collection", "collection.a1.present-regular-ir")} type="button">
                  <span className="set-card-topline"><span className="set-level">A1 · Concept</span></span><strong>Present -ir forms</strong><span className="set-description">Recommended review for the form introduced in Living here.</span>
                </button>
              </article>
            ) : null}
            {availableCollectionIds.includes("collection.a1.home-location") ? (
              <article className="practice-set-card">
                <button aria-label="Start Home & location" className="practice-set-start" disabled={busy} onClick={() => void start("collection", "collection.a1.home-location")} type="button">
                  <span className="set-card-topline"><span className="set-level">A1 · Topic</span></span><strong>Home &amp; location</strong><span className="set-description">Review useful language for saying where someone lives.</span>
                </button>
              </article>
            ) : null}
            <article className="practice-set-card">
              <button aria-label="Start All saved" className="practice-set-start" disabled={busy || savedItemIds.length === 0} onClick={() => void start("saved")} type="button">
                <span className="set-card-topline"><span className="set-level">Saved</span></span><strong>All saved</strong><span className="set-description">{savedItemIds.length === 0 ? "Save an item from feedback to practice it here." : `${savedItemIds.length} saved ${savedItemIds.length === 1 ? "item" : "items"}.`}</span>
              </button>
            </article>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-workspace">
      <PrototypeContextHeader
        backLabel="End practice and review this session"
        onBack={() => void changeStatus("end")}
        title={session.source.title}
        trailing={<><span aria-label={`Completed answers: ${session.attempts.length}`} className="session-count-chip">{session.attempts.length}</span><IconButton aria-label="Pause practice" disabled={busy} onClick={() => void changeStatus("pause")}><Pause aria-hidden="true" /></IconButton></>}
      />
      <div aria-label="Practice conversation" className="practice-feed chat-practice-feed" role="log">
        <div aria-live="polite" className="session-customization-note" role="status"><Sparkles aria-hidden="true" /><span>{adaptiveOfferExplanation(session.current.reason)}</span></div>
        {session.attempts.map((attempt, index) => <AttemptFeedback attempt={attempt} isSaved={savedItemIds.includes(attempt.itemId)} key={`${attempt.itemId}-${attempt.attemptedAt}-${index}`} onSave={() => void toggleSaved(attempt.itemId)} />)}
        <section className="practice-turn active-practice-turn">
          <article className="practice-message prompt-message">
            <div className="prompt-context-row"><p className="prompt-cue">{session.current.cue}</p><div className="activity-label"><span>English → Spanish</span></div></div><h2>{session.current.prompt}</h2>
          </article>
          {pendingAnswer ? <div aria-label="Your answer" className="practice-message answer-message">{pendingAnswer}</div> : null}
          {busy && pendingAnswer ? <div aria-live="polite" className="practice-message grading-message" role="status"><LoaderCircle aria-hidden="true" /> Checking and retaining your answer…</div> : null}
          {error ? <div aria-live="polite" className="practice-message grading-error" role="alert"><CircleAlert aria-hidden="true" /><span>{error.message}</span>{error.retryable ? <span>Your answer is still in the composer.</span> : null}</div> : null}
        </section>
      </div>
      <form className="practice-composer prototype-composer" onSubmit={(event) => { event.preventDefault(); void submitAnswer(); }}>
        <label className="visually-hidden" htmlFor="practice-answer">Type your Spanish answer</label>
        <input disabled={busy} id="practice-answer" onChange={(event) => { setTypedAnswer(event.target.value); setError(null); }} placeholder={busy ? "Checking answer…" : "Type your Spanish answer"} ref={inputRef} spellCheck="false" type="text" value={typedAnswer} />
        <IconButton aria-label="Send answer" disabled={busy || !typedAnswer.trim()} type="submit"><Send aria-hidden="true" /></IconButton>
      </form>
    </div>
  );
}
