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
import { z } from "zod";

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
import {
  practiceUnitsForSession,
  randomSessionOrderSeed,
} from "@/lib/practice-sets/session-order";
import {
  addSavedPracticeReference,
  hasSavedPracticeReference,
  removeSavedPracticeReference,
  savedPracticeReference,
  savedPracticeReferenceKey,
  type SavedPracticeReference,
} from "@/lib/practice-sets/saved-practice-references";

import { PracticeSetOptionsPanel } from "./practice-set-options-panel";
import { Button, Card, IconButton } from "./primitives";
import { PrototypeContextHeader } from "./prototype-context-header";

type PracticeView = "catalog" | "session" | "recap";
type CatalogFilter = "All" | "Saved" | PracticeSetFacet;
type Configurations = Record<string, PracticeSetConfiguration>;
type PracticeTurn = {
  answer: string;
  collectionId: string;
  direction: Exclude<PracticeDirection, "both">;
  evaluation: PracticeGradedEvaluation;
  prompt: PracticePrompt;
};
type CollectionSessionSummary = {
  completedCards: number;
  correctRate: number;
};
type PracticeEvaluationFailure = {
  message: string;
  retryable: boolean;
};
type SavedPromptRecord = {
  collection: PracticeSetFixture;
  prompt: PracticePrompt;
  reference: SavedPracticeReference;
};
type SessionSnapshotBase = {
  avoidFirstPromptId?: string;
  configuration: PracticeSetConfiguration;
  orderSeed: number;
};
type SessionSnapshot =
  | (SessionSnapshotBase & {
      kind: "collection";
      setId: string;
    })
  | (SessionSnapshotBase & {
      kind: "saved-material";
      promptReferences: SavedPracticeReference[];
    });
const storageKey = "aidioma-intermediate-pilot-configurations:v2";
const legacyStorageKey = "aidioma-intermediate-pilot-configurations:v1";
const learnerStage = "intermediate" as const;
const storedConfigurationShape = {
  activity: z.enum(["type", "flashcards"]),
  direction: z.enum(["en-es", "es-en", "both"]),
  focus: z.enum([
    "recommended",
    "completed-past",
    "time-phrases",
    "spatial-language",
    "haber",
    "connectors",
  ]),
  shuffle: z.boolean(),
} as const;
const StoredConfigurationSchema = z.object(storedConfigurationShape).strict();
const LegacyStoredConfigurationSchema = z
  .object({
    ...storedConfigurationShape,
    difficulty: z.enum(["guided", "standard", "stretch"]),
  })
  .strict();
const StoredConfigurationsSchema = z.record(z.unknown());

function defaultConfigurations(): Configurations {
  return Object.fromEntries(
    practiceSetFixtures.map((set) => [set.id, { ...set.defaultConfiguration }]),
  );
}

function rememberedConfigurations(): Configurations {
  const defaults = defaultConfigurations();
  if (typeof window === "undefined") return defaults;

  try {
    const currentStored = window.localStorage.getItem(storageKey);
    const stored = currentStored ?? window.localStorage.getItem(legacyStorageKey);
    const allowLegacyDifficulty = currentStored === null;
    if (!stored) return defaults;

    const parsedStored = StoredConfigurationsSchema.safeParse(JSON.parse(stored) as unknown);
    if (!parsedStored.success) return defaults;

    return Object.fromEntries(
      practiceSetFixtures.map((set) => {
        const value = parsedStored.data[set.id];
        const current = StoredConfigurationSchema.safeParse(value);
        const legacy = current.success || !allowLegacyDifficulty
          ? null
          : LegacyStoredConfigurationSchema.safeParse(value);
        const configuration = current.success
          ? current.data
          : legacy?.success
            ? {
                activity: legacy.data.activity,
                direction: legacy.data.direction,
                focus: legacy.data.focus,
                shuffle: legacy.data.shuffle,
              }
            : null;
        const activityAvailable = set.activities.some(
          (activity) =>
            activity.status === "available" && activity.id === configuration?.activity,
        );
        const focusAvailable = set.focuses.some(
          (focus) => focus.id === configuration?.focus,
        );

        return [
          set.id,
          configuration && activityAvailable && focusAvailable
            ? configuration
            : { ...set.defaultConfiguration },
        ];
      }),
    );
  } catch {
    return defaults;
  }
}

function persistConfigurations(configurations: Configurations) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(configurations));
    window.localStorage.removeItem(legacyStorageKey);
  } catch {
    // Remembering these display preferences is optional.
  }
}

function filterCollections(filter: CatalogFilter, savedSetIds: string[]) {
  if (filter === "All") return practiceSetFixtures;
  if (filter === "Saved") {
    return practiceSetFixtures.filter((set) => savedSetIds.includes(set.id));
  }
  return practiceSetFixtures.filter((set) => set.facets.includes(filter));
}

const promptRecordByReferenceKey = new Map(
  practiceSetFixtures.flatMap((collection) =>
    collection.prompts.map((prompt) => [
      savedPracticeReferenceKey(savedPracticeReference(collection.id, prompt.id)),
      { collection, prompt },
    ] as const),
  ),
);

function resolveSavedPromptRecords(
  references: readonly SavedPracticeReference[],
): SavedPromptRecord[] {
  return references.flatMap((reference) => {
    const currentRecord = promptRecordByReferenceKey.get(savedPracticeReferenceKey(reference));
    return currentRecord ? [{ ...currentRecord, reference }] : [];
  });
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

function PersonalSavedPromptCard({
  onRemove,
  record,
}: {
  onRemove: () => void;
  record: SavedPromptRecord;
}) {
  return (
    <article className="personal-saved-prompt-card">
      <div className="personal-saved-prompt-copy">
        <span>{record.collection.title}</span>
        <strong>{record.prompt.english}</strong>
        <p lang="es">{record.prompt.spanish}</p>
      </div>
      <Button
        aria-label={`Remove “${record.prompt.english}” from personal saved material`}
        onClick={onRemove}
        variant="quiet"
      >
        Remove
      </Button>
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

function focusedWordDiff(evaluation: PracticeGradedEvaluation) {
  if (evaluation.verdict === "correct") return [];

  const modelAnswer = normalizedFeedbackAnswer(evaluation.modelAnswer);
  return (evaluation.wordDiff ?? []).filter(
    (entry) => {
      if (entry.mark === "correct" || entry.suggestion === undefined) return false;
      const suggestion = normalizedFeedbackAnswer(entry.suggestion);
      return suggestion.length > 0 && suggestion !== modelAnswer;
    },
  );
}

function FeedbackMessage({
  announce,
  evaluation,
  isPromptSaved,
  onTogglePromptSaved,
}: {
  announce: boolean;
  evaluation: PracticeGradedEvaluation;
  isPromptSaved: boolean;
  onTogglePromptSaved: () => void;
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
  const correctionDiff = focusedWordDiff(evaluation);
  const showReferenceAnswer = evaluation.verdict !== "correct" && correctionDiff.length === 0;

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
      {correctionDiff.length > 0 ? <WordDiff entries={correctionDiff} /> : null}
      {showReferenceAnswer ? (
        <p className="feedback-reference-answer">{evaluation.modelAnswer}</p>
      ) : null}
      <button
        aria-label={
          isPromptSaved
            ? "Remove this prompt from personal saved material"
            : "Save this prompt to personal saved material"
        }
        aria-pressed={isPromptSaved}
        className={`feedback-save-action saved-toggle${isPromptSaved ? " is-saved" : ""}`}
        onClick={onTogglePromptSaved}
        type="button"
      >
        <Star aria-hidden="true" />
        {isPromptSaved ? "Saved for this visit" : "Save this prompt"}
      </button>
    </article>
  );
}

async function gradeAnswer(
  prompt: PracticePrompt,
  direction: Exclude<PracticeDirection, "both">,
  userInput: string,
  signal: AbortSignal,
) {
  const response = await fetch("/api/practice/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemRef: prompt.id, direction, userInput }),
    signal,
  });
  let body: unknown;
  try {
    body = (await response.json()) as unknown;
  } catch {
    throw new Error(
      "I couldn’t grade that answer right now. Your response is still here—try again.",
    );
  }
  const parsed = PracticeEvaluationResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error(
      "I couldn’t grade that answer right now. Your response is still here—try again.",
    );
  }
  return parsed.data;
}

export function PracticeWorkspace({
  createSessionSeed = randomSessionOrderSeed,
}: {
  createSessionSeed?: () => number;
} = {}) {
  const [view, setView] = useState<PracticeView>("catalog");
  const [practiceOptionsOpen, setPracticeOptionsOpen] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>("All");
  const [selectedSetId, setSelectedSetId] = useState(practiceSetFixtures[0].id);
  const [savedSetIds, setSavedSetIds] = useState<string[]>([]);
  const [savedPromptReferences, setSavedPromptReferences] = useState<
    SavedPracticeReference[]
  >([]);
  const [latestCollectionSessions, setLatestCollectionSessions] = useState<
    Record<string, CollectionSessionSummary>
  >({});
  const [configurations, setConfigurations] = useState<Configurations>(rememberedConfigurations);
  const [draftConfiguration, setDraftConfiguration] =
    useState<PracticeSetConfiguration | null>(null);
  const [sessionSnapshot, setSessionSnapshot] = useState<SessionSnapshot | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [turns, setTurns] = useState<PracticeTurn[]>([]);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null);
  const [evaluationFailure, setEvaluationFailure] = useState<PracticeEvaluationFailure | null>(
    null,
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [flashcardRevealed, setFlashcardRevealed] = useState(false);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const evaluationAttemptRef = useRef(0);
  const evaluationControllerRef = useRef<AbortController | null>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const lastSessionFirstPromptIdsRef = useRef<Record<string, string>>({});

  useEffect(
    () => () => {
      evaluationAttemptRef.current += 1;
      evaluationControllerRef.current?.abort();
    },
    [],
  );

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
  }, [evaluationFailure, isEvaluating, turns.length, view]);

  const selectedSet =
    practiceSetFixtures.find((set) => set.id === selectedSetId) ?? practiceSetFixtures[0];
  const selectedConfiguration = configurations[selectedSet.id];
  const filteredSets = filterCollections(catalogFilter, savedSetIds);
  const savedPromptRecords = resolveSavedPromptRecords(savedPromptReferences);

  function updateDraftConfiguration(patch: Partial<PracticeSetConfiguration>) {
    setDraftConfiguration((current) => (current ? { ...current, ...patch } : current));
  }

  function openOptions(
    set: PracticeSetFixture,
    configuration = configurations[set.id],
  ) {
    setSelectedSetId(set.id);
    setDraftConfiguration({ ...configuration });
    setPracticeOptionsOpen(true);
  }

  function closeOptions() {
    setDraftConfiguration(null);
    setPracticeOptionsOpen(false);
  }

  function commitConfiguration(setId: string, configuration: PracticeSetConfiguration) {
    const nextConfigurations = {
      ...configurations,
      [setId]: { ...configuration },
    };
    setConfigurations(nextConfigurations);
    persistConfigurations(nextConfigurations);
  }

  function invalidateEvaluation() {
    evaluationAttemptRef.current += 1;
    evaluationControllerRef.current?.abort();
    evaluationControllerRef.current = null;
    setIsEvaluating(false);
  }

  function startPractice(set: PracticeSetFixture, configuration: PracticeSetConfiguration) {
    invalidateEvaluation();
    const orderSeed = createSessionSeed() >>> 0;
    const avoidFirstPromptId = lastSessionFirstPromptIdsRef.current[set.id];
    const matchingPrompts = promptsForConfiguration(set, configuration, learnerStage);
    const firstPromptId = practiceUnitsForSession(
      matchingPrompts,
      configuration,
      orderSeed,
      avoidFirstPromptId,
    )[0]?.prompt.id;

    if (firstPromptId) lastSessionFirstPromptIdsRef.current[set.id] = firstPromptId;
    setSelectedSetId(set.id);
    setSessionSnapshot({
      avoidFirstPromptId,
      configuration: { ...configuration },
      kind: "collection",
      orderSeed,
      setId: set.id,
    });
    setPromptIndex(0);
    setTurns([]);
    setTypedAnswer("");
    setPendingAnswer(null);
    setEvaluationFailure(null);
    setFlashcardRevealed(false);
    setDraftConfiguration(null);
    setPracticeOptionsOpen(false);
    setView("session");
  }

  function startSavedMaterialPractice() {
    const currentRecords = resolveSavedPromptRecords(savedPromptReferences);
    if (currentRecords.length === 0) {
      setCatalogFilter("Saved");
      returnToCatalog();
      return;
    }

    invalidateEvaluation();
    const orderSeed = createSessionSeed() >>> 0;
    const configuration: PracticeSetConfiguration = {
      activity: "type",
      direction: "both",
      focus: "recommended",
      shuffle: true,
    };
    const promptReferences = currentRecords.map((record) => record.reference);
    const firstPromptId = practiceUnitsForSession(
      currentRecords.map((record) => record.prompt),
      configuration,
      orderSeed,
      lastSessionFirstPromptIdsRef.current["personal-saved-material"],
    )[0]?.prompt.id;
    const avoidFirstPromptId = lastSessionFirstPromptIdsRef.current["personal-saved-material"];

    if (firstPromptId) {
      lastSessionFirstPromptIdsRef.current["personal-saved-material"] = firstPromptId;
    }
    setSessionSnapshot({
      avoidFirstPromptId,
      configuration,
      kind: "saved-material",
      orderSeed,
      promptReferences,
    });
    setPromptIndex(0);
    setTurns([]);
    setTypedAnswer("");
    setPendingAnswer(null);
    setEvaluationFailure(null);
    setFlashcardRevealed(false);
    setDraftConfiguration(null);
    setPracticeOptionsOpen(false);
    setView("session");
  }

  function commitAndStartPractice(set: PracticeSetFixture) {
    if (!draftConfiguration) return;
    commitConfiguration(set.id, draftConfiguration);
    startPractice(set, draftConfiguration);
  }

  function toggleSaved(setId: string) {
    setSavedSetIds((current) =>
      current.includes(setId) ? current.filter((id) => id !== setId) : [...current, setId],
    );
  }

  function toggleSavedPrompt(reference: SavedPracticeReference) {
    setSavedPromptReferences((current) =>
      hasSavedPracticeReference(current, reference)
        ? removeSavedPracticeReference(current, reference)
        : addSavedPracticeReference(current, reference),
    );
  }

  function returnToCatalog() {
    invalidateEvaluation();
    setDraftConfiguration(null);
    setPracticeOptionsOpen(false);
    setSessionSnapshot(null);
    setView("catalog");
  }

  function endPractice() {
    invalidateEvaluation();
    setPendingAnswer(null);
    setEvaluationFailure(null);
    setView(turns.length > 0 ? "recap" : "catalog");
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
          {catalogFilter === "Saved" ? (
            <div className="saved-catalog-sections">
              <section aria-labelledby="bookmarked-collections-heading" className="saved-catalog-section">
                <div className="saved-section-heading">
                  <div>
                    <h2 id="bookmarked-collections-heading">Bookmarked collections</h2>
                    <p>Collection shortcuts kept only for this visit.</p>
                  </div>
                </div>
                {filteredSets.length === 0 ? (
                  <Card className="saved-section-empty">
                    <p>No bookmarked collections for this visit.</p>
                  </Card>
                ) : (
                  <div className="practice-set-grid">
                    {filteredSets.map((set) => (
                      <CollectionCard
                        isSaved
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
              </section>
              <section aria-labelledby="personal-saved-heading" className="saved-catalog-section">
                <div className="saved-section-heading">
                  <div>
                    <h2 id="personal-saved-heading">Personal saved material</h2>
                    <p>Individual prompts saved from feedback. They last only for this visit.</p>
                  </div>
                  {savedPromptRecords.length > 0 ? (
                    <Button onClick={startSavedMaterialPractice}>
                      Practice saved material
                    </Button>
                  ) : null}
                </div>
                {savedPromptRecords.length === 0 ? (
                  <Card className="saved-section-empty">
                    <p>
                      No personal saved material yet. Save a prompt after receiving feedback in
                      typed practice.
                    </p>
                  </Card>
                ) : (
                  <div className="personal-saved-prompt-list">
                    {savedPromptRecords.map((record) => (
                      <PersonalSavedPromptCard
                        key={savedPracticeReferenceKey(record.reference)}
                        onRemove={() =>
                          setSavedPromptReferences((current) =>
                            removeSavedPracticeReference(current, record.reference),
                          )
                        }
                        record={record}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : filteredSets.length === 0 ? (
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
            configuration={draftConfiguration ?? selectedConfiguration}
            learnerStage={learnerStage}
            onClose={closeOptions}
            onStart={() => commitAndStartPractice(selectedSet)}
            onUpdate={updateDraftConfiguration}
            set={selectedSet}
            startLabel="Start practice"
          />
        ) : null}
      </div>
    );
  }

  const snapshot = sessionSnapshot ?? {
    configuration: selectedConfiguration,
    kind: "collection" as const,
    orderSeed: 0,
    setId: selectedSet.id,
  };
  const isSavedMaterialSession = snapshot.kind === "saved-material";
  const sessionSet =
    practiceSetFixtures.find(
      (set) => set.id === (snapshot.kind === "collection" ? snapshot.setId : selectedSet.id),
    ) ?? selectedSet;
  const sessionConfiguration = snapshot.configuration;
  const practiceOverrides = isSavedMaterialSession
    ? null
    : describePracticeOverrides(sessionConfiguration, sessionSet);
  const sessionSummary = summarizeSession(turns);
  const savedSessionRecords = isSavedMaterialSession
    ? resolveSavedPromptRecords(snapshot.promptReferences)
    : [];
  const matchingPrompts = isSavedMaterialSession
    ? savedSessionRecords.map((record) => record.prompt)
    : promptsForConfiguration(sessionSet, sessionConfiguration, learnerStage);
  const practiceUnits = practiceUnitsForSession(
    matchingPrompts,
    sessionConfiguration,
    snapshot.orderSeed,
    snapshot.avoidFirstPromptId,
  );
  const practiceUnit = practiceUnits[promptIndex % practiceUnits.length];
  const prompt = practiceUnit.prompt;
  const resolvedDirection = practiceUnit.direction;
  const promptCollectionId = isSavedMaterialSession
    ? savedSessionRecords.find((record) => record.prompt === prompt)?.collection.id ?? sessionSet.id
    : sessionSet.id;
  const sessionTitle = isSavedMaterialSession ? "Saved material" : sessionSet.title;
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
            <h2>{sessionTitle}</h2>
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
            <Button
              disabled={isSavedMaterialSession && savedPromptRecords.length === 0}
              onClick={() =>
                isSavedMaterialSession
                  ? startSavedMaterialPractice()
                  : startPractice(sessionSet, sessionConfiguration)
              }
            >
              {isSavedMaterialSession ? "Practice saved material again" : "Practice again"}
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
    setEvaluationFailure(null);
    setIsEvaluating(true);
    const attempt = evaluationAttemptRef.current + 1;
    evaluationAttemptRef.current = attempt;
    evaluationControllerRef.current?.abort();
    const controller = new AbortController();
    evaluationControllerRef.current = controller;
    try {
      const evaluation = await gradeAnswer(prompt, resolvedDirection, answer, controller.signal);
      if (evaluationAttemptRef.current !== attempt) return;
      if (evaluation.status === "ungraded") {
        setEvaluationFailure({
          message: evaluation.message,
          retryable: evaluation.retryable,
        });
        return;
      }

      setTurns((current) => {
        const nextTurns = [
          ...current,
          {
            answer,
            collectionId: promptCollectionId,
            direction: resolvedDirection,
            evaluation,
            prompt,
          },
        ];
        const nextSummary = summarizeSession(nextTurns);
        if (nextSummary && !isSavedMaterialSession) {
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
      if (evaluationAttemptRef.current !== attempt) return;
      setEvaluationFailure({
        message:
          error instanceof Error
            ? error.message
            : "I couldn’t grade that answer right now. Your response is still here—try again.",
        retryable: true,
      });
    } finally {
      if (evaluationAttemptRef.current === attempt) {
        evaluationControllerRef.current = null;
        setIsEvaluating(false);
        window.requestAnimationFrame(() => answerInputRef.current?.focus());
      }
    }
  }

  return (
    <div className="practice-workspace">
      <PrototypeContextHeader
        backLabel="End practice and review this session"
        onBack={endPractice}
        title={sessionTitle}
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
            {isSavedMaterialSession ? null : (
              <>
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
                  onClick={() => openOptions(sessionSet, sessionConfiguration)}
                >
                  <SlidersHorizontal aria-hidden="true" />
                </IconButton>
              </>
            )}
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
                  isPromptSaved={hasSavedPracticeReference(
                    savedPromptReferences,
                    savedPracticeReference(turn.collectionId, turn.prompt.id),
                  )}
                  onTogglePromptSaved={() =>
                    toggleSavedPrompt(
                      savedPracticeReference(turn.collectionId, turn.prompt.id),
                    )
                  }
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
              {evaluationFailure ? (
                <div aria-live="polite" className="practice-message grading-error" role="alert">
                  <CircleAlert aria-hidden="true" />
                  <span>{evaluationFailure.message}</span>
                  {evaluationFailure.retryable ? (
                    <Button
                      className="grading-retry-button"
                      onClick={() => void submitAnswer()}
                      variant="quiet"
                    >
                      Try grading again
                    </Button>
                  ) : null}
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
            aria-describedby={evaluationFailure ? "practice-evaluation-error" : undefined}
            disabled={isEvaluating}
            id="practice-set-answer"
            onChange={(event) => {
              setTypedAnswer(event.target.value);
              if (evaluationFailure) {
                setEvaluationFailure(null);
                setPendingAnswer(null);
              }
            }}
            placeholder={isEvaluating ? "Checking answer…" : "Type your answer"}
            spellCheck="false"
            type="text"
            value={typedAnswer}
            ref={answerInputRef}
          />
          {evaluationFailure ? (
            <span className="visually-hidden" id="practice-evaluation-error">
              {evaluationFailure.message}
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
      {practiceOptionsOpen && !isSavedMaterialSession ? (
        <PracticeSetOptionsPanel
          configuration={draftConfiguration ?? sessionConfiguration}
          learnerStage={learnerStage}
          onClose={closeOptions}
          onStart={() => commitAndStartPractice(sessionSet)}
          onUpdate={updateDraftConfiguration}
          set={sessionSet}
          startLabel="Start new session"
        />
      ) : null}
    </div>
  );
}
