"use client";

import {
  Check,
  CircleAlert,
  LoaderCircle,
  RotateCcw,
  Send,
  SlidersHorizontal,
  Sparkles,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { WordDiffEntry } from "@/lib/evaluation/contracts";
import {
  PracticeEvaluationResponseSchema,
  type PracticeGradedEvaluation,
} from "@/lib/practice-sets/evaluation-contract";
import {
  describePracticeOverrides,
  practiceDirectionLabels,
  practiceSetFacets,
  practiceSetFixtures,
  promptsForConfiguration,
  type PracticeDirection,
  type PracticePrompt,
  type PracticeSetConfiguration,
  type PracticeSetFacet,
  type PracticeSetFixture,
} from "@/lib/practice-sets/prototype-fixtures";

import { PracticeSetOptionsPanel } from "./practice-set-options-panel";
import { Button, Card, IconButton } from "./primitives";
import { PrototypeContextHeader } from "./prototype-context-header";

type PracticeView = "catalog" | "session" | "recap";
type CatalogFilter = "All" | "Saved" | PracticeSetFacet;
type Configurations = Record<string, PracticeSetConfiguration>;
type PracticeTurn = {
  answer: string;
  direction: Exclude<PracticeDirection, "both">;
  evaluation: PracticeGradedEvaluation;
  prompt: PracticePrompt;
};
type CollectionSessionSummary = {
  completedCards: number;
  correctRate: number;
};
type PracticeUnit = {
  direction: Exclude<PracticeDirection, "both">;
  prompt: PracticePrompt;
};

const storageKey = "aidioma-intermediate-pilot-configurations:v1";
const learnerStage = "intermediate" as const;

function defaultConfigurations(): Configurations {
  return Object.fromEntries(
    practiceSetFixtures.map((set) => [set.id, { ...set.defaultConfiguration }]),
  );
}

function rememberedConfigurations(): Configurations {
  const defaults = defaultConfigurations();
  if (typeof window === "undefined") return defaults;

  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? { ...defaults, ...(JSON.parse(stored) as Configurations) } : defaults;
  } catch {
    return defaults;
  }
}

function filterCollections(filter: CatalogFilter, savedSetIds: string[]) {
  if (filter === "All") return practiceSetFixtures;
  if (filter === "Saved") {
    return practiceSetFixtures.filter((set) => savedSetIds.includes(set.id));
  }
  return practiceSetFixtures.filter((set) => set.facets.includes(filter));
}

function summarizeSession(turns: PracticeTurn[]): CollectionSessionSummary | null {
  if (turns.length === 0) return null;

  return {
    completedCards: turns.length,
    correctRate: Math.round(
      (turns.filter((turn) => turn.evaluation.verdict === "correct").length / turns.length) * 100,
    ),
  };
}

function stableOrderValue(value: string) {
  return Array.from(value).reduce((hash, character) => (hash * 31 + character.codePointAt(0)!) >>> 0, 0);
}

function practiceUnitsForSession(
  prompts: PracticePrompt[],
  configuration: PracticeSetConfiguration,
  sessionOrderSeed: number,
): PracticeUnit[] {
  const [firstPrompt, ...remainingPrompts] = prompts;
  const orderedPrompts = configuration.shuffle
    ? [
        firstPrompt,
        ...remainingPrompts.sort(
          (left, right) =>
            stableOrderValue(`${left.id}:${sessionOrderSeed}`) -
            stableOrderValue(`${right.id}:${sessionOrderSeed}`),
        ),
      ]
    : prompts;
  const availablePrompts = orderedPrompts.filter(
    (prompt): prompt is PracticePrompt => prompt !== undefined,
  );

  if (configuration.direction !== "both") {
    const direction: Exclude<PracticeDirection, "both"> = configuration.direction;
    return availablePrompts.map((prompt) => ({ prompt, direction }));
  }

  return [0, 1].flatMap((directionRound) =>
    availablePrompts.map((prompt, promptPosition) => ({
      prompt,
      direction: (promptPosition + directionRound) % 2 === 0 ? "en-es" : "es-en",
    })),
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`filter-chip${active ? " is-selected" : ""}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function CollectionCard({
  isSaved,
  latestSession,
  onOpenOptions,
  onStart,
  onToggleSaved,
  set,
}: {
  isSaved: boolean;
  latestSession: CollectionSessionSummary | null;
  onOpenOptions: () => void;
  onStart: () => void;
  onToggleSaved: () => void;
  set: PracticeSetFixture;
}) {
  return (
    <article className="practice-set-card">
      <button
        aria-label={`Start ${set.title}`}
        className="practice-set-start"
        onClick={onStart}
        type="button"
      >
        <span className="set-card-topline">
          <span className="set-level">{set.level}</span>
          {latestSession ? (
            <span aria-label={`Latest session score: ${latestSession.correctRate}% correct`} className="set-session-score">
              {latestSession.correctRate}% latest
            </span>
          ) : null}
        </span>
        <strong>{set.title}</strong>
        <span className="set-description">{set.description}</span>
      </button>
      <div className="set-card-actions">
        <button
          aria-label={isSaved ? `Remove ${set.title} from saved` : `Save ${set.title}`}
          aria-pressed={isSaved}
          className={`set-card-action saved-toggle${isSaved ? " is-saved" : ""}`}
          onClick={onToggleSaved}
          title={isSaved ? "Remove from saved" : "Save"}
          type="button"
        >
          <Star aria-hidden="true" />
        </button>
        <button
          aria-label={`Adjust ${set.title} settings`}
          className="set-card-action set-options-button"
          onClick={onOpenOptions}
          title="Practice settings"
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

function PromptMessage({
  direction,
  prompt,
}: {
  direction: Exclude<PracticeDirection, "both">;
  prompt: PracticePrompt;
}) {
  const displayedPrompt = direction === "en-es" ? prompt.english : prompt.spanish;
  const hasCue = direction === "en-es";
  return (
    <article className={`practice-message prompt-message${hasCue ? "" : " has-direction-only"}`}>
      {hasCue ? (
        <div className="prompt-context-row">
          <p className="prompt-cue">{prompt.cue}</p>
          <div className="activity-label">
            <span>{practiceDirectionLabels[direction]}</span>
          </div>
        </div>
      ) : (
        <div className="activity-label">
          <span>{practiceDirectionLabels[direction]}</span>
        </div>
      )}
      <h2>{displayedPrompt}</h2>
    </article>
  );
}

function AnswerMessage({ answer }: { answer: string }) {
  return (
    <div aria-label="Your answer" className="practice-message answer-message">
      {answer}
    </div>
  );
}

function WordDiff({ entries }: { entries: WordDiffEntry[] }) {
  const changed = entries.filter((entry) => entry.mark !== "correct");
  if (changed.length === 0) return null;

  return (
    <div aria-label="Answer details" className="feedback-diff">
      {changed.map((entry, index) => (
        <span className={`diff-token diff-${entry.mark}`} key={`${entry.text}-${index}`}>
          <span className="diff-original">{entry.text}</span>
          {entry.suggestion ? (
            <>
              <span aria-hidden="true" className="diff-arrow">→</span>
              <span className="diff-suggestion">{entry.suggestion}</span>
            </>
          ) : null}
        </span>
      ))}
    </div>
  );
}

function normalizedFeedbackAnswer(value: string) {
  return value.trim().toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

function FeedbackMessage({
  announce,
  evaluation,
}: {
  announce: boolean;
  evaluation: PracticeGradedEvaluation;
}) {
  const title =
    evaluation.verdict === "correct"
      ? "Correct"
      : evaluation.verdict === "close"
        ? "Almost"
        : "Keep working";
  const Icon = evaluation.verdict === "correct" ? Check : CircleAlert;
  const showCoaching =
    evaluation.verdict !== "correct" &&
    evaluation.feedback.trim().toLocaleLowerCase() !== `${title.toLocaleLowerCase()}.`;
  const wholeAnswerReplacement = evaluation.wordDiff?.some(
    (entry) =>
      entry.suggestion !== undefined &&
      normalizedFeedbackAnswer(entry.suggestion) === normalizedFeedbackAnswer(evaluation.modelAnswer),
  );
  const showWordDiff = evaluation.verdict !== "correct" && !!evaluation.wordDiff && !wholeAnswerReplacement;
  const showReferenceAnswer = evaluation.verdict !== "correct" && !showWordDiff;

  return (
    <article
      aria-label={`Feedback: ${title}`}
      aria-live={announce ? "polite" : undefined}
      className={`practice-message feedback-message feedback-${evaluation.verdict}${
        evaluation.verdict === "correct" ? " is-compact" : ""
      }`}
      role={announce ? "status" : undefined}
    >
      <div className="feedback-heading">
        <Icon aria-hidden="true" />
        <strong>{title}</strong>
      </div>
      {showCoaching ? <p>{evaluation.feedback}</p> : null}
      {showWordDiff && evaluation.wordDiff ? (
        <WordDiff entries={evaluation.wordDiff} />
      ) : null}
      {showReferenceAnswer ? (
        <p className="feedback-reference-answer">{evaluation.modelAnswer}</p>
      ) : null}
    </article>
  );
}

async function gradeAnswer(
  prompt: PracticePrompt,
  direction: Exclude<PracticeDirection, "both">,
  userInput: string,
) {
  const response = await fetch("/api/practice/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemRef: prompt.id, direction, userInput }),
  });
  const body = (await response.json()) as unknown;
  const parsed = PracticeEvaluationResponseSchema.safeParse(body);
  if (!parsed.success) throw new Error("I couldn’t grade that answer right now. Please try again.");
  return parsed.data;
}

export function PracticeWorkspace() {
  const [view, setView] = useState<PracticeView>("catalog");
  const [practiceOptionsOpen, setPracticeOptionsOpen] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>("All");
  const [selectedSetId, setSelectedSetId] = useState(practiceSetFixtures[0].id);
  const [savedSetIds, setSavedSetIds] = useState<string[]>([]);
  const [latestCollectionSessions, setLatestCollectionSessions] = useState<
    Record<string, CollectionSessionSummary>
  >({});
  const [configurations, setConfigurations] = useState<Configurations>(rememberedConfigurations);
  const [sessionSnapshot, setSessionSnapshot] = useState<{
    configuration: PracticeSetConfiguration;
    setId: string;
  } | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [turns, setTurns] = useState<PracticeTurn[]>([]);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null);
  const [sessionOrderSeed, setSessionOrderSeed] = useState(0);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [flashcardRevealed, setFlashcardRevealed] = useState(false);
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(configurations));
    } catch {
      // Remembering these display preferences is optional.
    }
  }, [configurations]);

  useEffect(() => {
    if (view !== "session") return;
    const frame = window.requestAnimationFrame(() => {
      feedEndRef.current?.scrollIntoView?.({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "nearest",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [evaluationError, isEvaluating, turns.length, view]);

  const selectedSet =
    practiceSetFixtures.find((set) => set.id === selectedSetId) ?? practiceSetFixtures[0];
  const selectedConfiguration = configurations[selectedSet.id];
  const filteredSets = filterCollections(catalogFilter, savedSetIds);

  function updateConfiguration(patch: Partial<PracticeSetConfiguration>) {
    setConfigurations((current) => ({
      ...current,
      [selectedSet.id]: { ...current[selectedSet.id], ...patch },
    }));
  }

  function openOptions(set: PracticeSetFixture) {
    setSelectedSetId(set.id);
    setPracticeOptionsOpen(true);
  }

  function startPractice(set: PracticeSetFixture, configuration: PracticeSetConfiguration) {
    setSelectedSetId(set.id);
    setSessionSnapshot({ configuration: { ...configuration }, setId: set.id });
    setPromptIndex(0);
    setSessionOrderSeed((current) => current + 1);
    setTurns([]);
    setTypedAnswer("");
    setPendingAnswer(null);
    setEvaluationError(null);
    setFlashcardRevealed(false);
    setPracticeOptionsOpen(false);
    setView("session");
  }

  function applyPracticeSettings() {
    setSessionSnapshot({
      configuration: { ...configurations[selectedSet.id] },
      setId: selectedSet.id,
    });
    setPracticeOptionsOpen(false);
  }

  function toggleSaved(setId: string) {
    setSavedSetIds((current) =>
      current.includes(setId) ? current.filter((id) => id !== setId) : [...current, setId],
    );
  }

  function returnToCatalog() {
    setPracticeOptionsOpen(false);
    setSessionSnapshot(null);
    setView("catalog");
  }

  if (view === "catalog") {
    return (
      <div className="practice-workspace">
        <PrototypeContextHeader title="Practice" titleStyle="screen" />
        <div className="practice-feed prototype-feed">
          <div aria-label="Filter collections" className="filter-strip">
            {(["All", "Saved", ...practiceSetFacets] as CatalogFilter[]).map((filter) => (
              <FilterButton
                active={catalogFilter === filter}
                key={filter}
                onClick={() => setCatalogFilter(filter)}
              >
                {filter}
              </FilterButton>
            ))}
          </div>
          <p aria-live="polite" className="filter-result-count">
            {filteredSets.length === 1 ? "1 collection" : `${filteredSets.length} collections`}
            {catalogFilter === "All" ? "" : ` · ${catalogFilter}`}
          </p>
          {filteredSets.length === 0 ? (
            <Card className="saved-empty-state">
              <h2>No matching collections</h2>
              <p>Change the filter to see more collections.</p>
              <Button onClick={() => setCatalogFilter("All")} variant="quiet">
                Browse collections
              </Button>
            </Card>
          ) : (
            <div className="practice-set-grid">
              {filteredSets.map((set) => (
                <CollectionCard
                  isSaved={savedSetIds.includes(set.id)}
                  key={set.id}
                  latestSession={latestCollectionSessions[set.id] ?? null}
                  onOpenOptions={() => openOptions(set)}
                  onStart={() => startPractice(set, configurations[set.id])}
                  onToggleSaved={() => toggleSaved(set.id)}
                  set={set}
                />
              ))}
            </div>
          )}
        </div>
        {practiceOptionsOpen ? (
          <PracticeSetOptionsPanel
            configuration={selectedConfiguration}
            learnerStage={learnerStage}
            onClose={() => setPracticeOptionsOpen(false)}
            onStart={() => startPractice(selectedSet, selectedConfiguration)}
            onUpdate={updateConfiguration}
            set={selectedSet}
            startLabel="Start practice"
          />
        ) : null}
      </div>
    );
  }

  const snapshot = sessionSnapshot ?? {
    configuration: selectedConfiguration,
    setId: selectedSet.id,
  };
  const sessionSet =
    practiceSetFixtures.find((set) => set.id === snapshot.setId) ?? selectedSet;
  const sessionConfiguration = snapshot.configuration;
  const practiceOverrides = describePracticeOverrides(sessionConfiguration, sessionSet);
  const sessionSummary = summarizeSession(turns);
  const matchingPrompts = promptsForConfiguration(sessionSet, sessionConfiguration, learnerStage);
  const practiceUnits = practiceUnitsForSession(
    matchingPrompts,
    sessionConfiguration,
    sessionOrderSeed,
  );
  const practiceUnit = practiceUnits[promptIndex % practiceUnits.length];
  const prompt = practiceUnit.prompt;
  const resolvedDirection = practiceUnit.direction;
  const strengthenedCapabilities = [
    ...new Set(
      turns
        .filter((turn) => turn.evaluation.verdict === "correct")
        .map((turn) => turn.prompt.capability),
    ),
  ];

  if (view === "recap") {
    return (
      <div className="practice-workspace">
        <PrototypeContextHeader
          backLabel="Return to collections"
          onBack={returnToCatalog}
          title="Practice recap"
        />
        <div className="practice-feed recap-feed">
          <Card className="recap-hero-card">
            <span className="eyebrow">Session complete</span>
            <h2>{sessionSet.title}</h2>
            <p>
              You answered {turns.length} {turns.length === 1 ? "prompt" : "prompts"}.
            </p>
          </Card>
          <Card className="evidence-preview-card">
            <div className="feedback-heading">
              <Sparkles aria-hidden="true" />
              <strong>What went well</strong>
            </div>
            {strengthenedCapabilities.length > 0 ? (
              <ul>
                {strengthenedCapabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            ) : (
              <p>Keep practicing this collection to strengthen the current skills.</p>
            )}
          </Card>
          <div className="recap-actions">
            <Button onClick={() => startPractice(sessionSet, sessionConfiguration)}>
              Practice again
            </Button>
            <Button onClick={returnToCatalog} variant="quiet">
              Browse collections
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const promptIsSpanish = resolvedDirection === "es-en";
  const flashcardFront = promptIsSpanish ? prompt.spanish : prompt.english;
  const flashcardBack = promptIsSpanish ? prompt.english : prompt.spanish;

  async function submitAnswer() {
    const answer = typedAnswer.trim();
    if (!answer || isEvaluating) return;

    setPendingAnswer(answer);
    setEvaluationError(null);
    setIsEvaluating(true);
    try {
      const evaluation = await gradeAnswer(prompt, resolvedDirection, answer);
      if (evaluation.status === "ungraded") {
        setEvaluationError(evaluation.message);
        return;
      }

      setTurns((current) => {
        const nextTurns = [...current, { answer, direction: resolvedDirection, evaluation, prompt }];
        const nextSummary = summarizeSession(nextTurns);
        if (nextSummary) {
          setLatestCollectionSessions((sessions) => ({
            ...sessions,
            [sessionSet.id]: nextSummary,
          }));
        }
        return nextTurns;
      });
      setPromptIndex((current) => current + 1);
      setTypedAnswer("");
      setPendingAnswer(null);
    } catch (error) {
      setEvaluationError(
        error instanceof Error
          ? error.message
          : "I couldn’t grade that answer right now. Please try again.",
      );
    } finally {
      setIsEvaluating(false);
    }
  }

  return (
    <div className="practice-workspace">
      <PrototypeContextHeader
        backLabel="End practice and review this session"
        onBack={() => setView(turns.length > 0 ? "recap" : "catalog")}
        title={sessionSet.title}
        trailing={
          <>
            {sessionSummary ? (
              <span
                aria-label={`Session score: ${sessionSummary.correctRate}% correct`}
                className="session-score-chip"
              title="Uses the feedback verdict for each completed practice card."
            >
                <strong>
                  <span>{sessionSummary.correctRate}%</span>
                  <span className="session-score-label"> correct</span>
                </strong>
              </span>
            ) : null}
            <span
              aria-label={`Completed practice cards: ${turns.length}`}
              className="session-count-chip"
              title="Completed practice cards"
            >
              {turns.length}
            </span>
            <IconButton
              aria-label={
                savedSetIds.includes(sessionSet.id)
                  ? `Remove ${sessionSet.title} from saved`
                  : `Save ${sessionSet.title}`
              }
              aria-pressed={savedSetIds.includes(sessionSet.id)}
              className={`saved-toggle${savedSetIds.includes(sessionSet.id) ? " is-saved" : ""}`}
              onClick={() => toggleSaved(sessionSet.id)}
            >
              <Star aria-hidden="true" />
            </IconButton>
            <IconButton
              aria-label="Adjust practice settings"
              onClick={() => setPracticeOptionsOpen(true)}
            >
              <SlidersHorizontal aria-hidden="true" />
            </IconButton>
          </>
        }
      />

      <div aria-label="Practice conversation" className="practice-feed chat-practice-feed" role="log">
        {practiceOverrides ? (
          <div aria-label="Active practice settings" className="session-customization-note">
            <SlidersHorizontal aria-hidden="true" />
            <span>{practiceOverrides}</span>
          </div>
        ) : null}

        {sessionConfiguration.activity === "type" ? (
          <>
            {turns.map((turn, index) => (
              <section className="practice-turn" key={`${turn.prompt.id}-${index}`}>
                <PromptMessage direction={turn.direction} prompt={turn.prompt} />
                <AnswerMessage answer={turn.answer} />
                <FeedbackMessage
                  announce={index === turns.length - 1}
                  evaluation={turn.evaluation}
                />
              </section>
            ))}
            <section className="practice-turn active-practice-turn">
              <PromptMessage direction={resolvedDirection} prompt={prompt} />
              {pendingAnswer ? <AnswerMessage answer={pendingAnswer} /> : null}
              {isEvaluating ? (
                <div aria-live="polite" className="practice-message grading-message" role="status">
                  <LoaderCircle aria-hidden="true" /> Checking your answer…
                </div>
              ) : null}
              {evaluationError ? (
                <div aria-live="polite" className="practice-message grading-error" role="alert">
                  <CircleAlert aria-hidden="true" /> {evaluationError}
                </div>
              ) : null}
            </section>
          </>
        ) : (
          <Card className="activity-card flashcard-preview-card">
            <div className="activity-label">
              <span>{flashcardRevealed ? "Answer" : "Prompt"}</span>
            </div>
            <button
              aria-label={flashcardRevealed ? "Hide flashcard answer" : "Reveal flashcard answer"}
              aria-pressed={flashcardRevealed}
              className="flashcard-face"
              onClick={() => setFlashcardRevealed((revealed) => !revealed)}
              type="button"
            >
              <span>{flashcardRevealed ? flashcardBack : flashcardFront}</span>
              <small>{flashcardRevealed ? "Tap to show the prompt" : "Tap to reveal"}</small>
            </button>
          </Card>
        )}
        <div aria-hidden="true" ref={feedEndRef} />
      </div>

      {sessionConfiguration.activity === "type" ? (
        <form
          className="practice-composer prototype-composer"
          onSubmit={(event) => {
            event.preventDefault();
            void submitAnswer();
          }}
        >
          <label className="visually-hidden" htmlFor="practice-set-answer">
            Type your answer
          </label>
          <input
            aria-describedby={evaluationError ? "practice-evaluation-error" : undefined}
            disabled={isEvaluating}
            id="practice-set-answer"
            onChange={(event) => {
              setTypedAnswer(event.target.value);
              if (evaluationError) {
                setEvaluationError(null);
                setPendingAnswer(null);
              }
            }}
            placeholder={isEvaluating ? "Checking answer…" : "Type your answer"}
            spellCheck="false"
            type="text"
            value={typedAnswer}
          />
          {evaluationError ? (
            <span className="visually-hidden" id="practice-evaluation-error">
              {evaluationError}
            </span>
          ) : null}
          <IconButton aria-label="Send answer" disabled={!typedAnswer.trim() || isEvaluating} type="submit">
            <Send aria-hidden="true" />
          </IconButton>
        </form>
      ) : (
        <div className="practice-composer flashcard-controls">
          <Button onClick={() => setFlashcardRevealed(false)} variant="quiet">
            <RotateCcw aria-hidden="true" /> Reset card
          </Button>
          <Button
            onClick={() => {
              setPromptIndex((current) => current + 1);
              setFlashcardRevealed(false);
            }}
          >
            Next card
          </Button>
        </div>
      )}
      {practiceOptionsOpen ? (
        <PracticeSetOptionsPanel
          configuration={selectedConfiguration}
          learnerStage={learnerStage}
          onClose={() => setPracticeOptionsOpen(false)}
          onStart={applyPracticeSettings}
          onUpdate={updateConfiguration}
          set={sessionSet}
          startLabel="Apply settings"
        />
      ) : null}
    </div>
  );
}
