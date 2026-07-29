"use client";

import {
  Check,
  Layers3,
  RotateCcw,
  Send,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  describePracticeConfiguration,
  practiceActivityLabels,
  practiceDirectionLabels,
  practiceSetFacets,
  practiceSetFixtures,
  type PracticeSetConfiguration,
  type PracticeSetFacet,
  type PracticeSetFixture,
} from "@/lib/practice-sets/prototype-fixtures";

import { PracticeSetOptionsPanel } from "./practice-set-options-panel";
import { Button, Card, IconButton } from "./primitives";
import { PrototypeContextHeader } from "./prototype-context-header";

type PrototypeView = "catalog" | "session";
type CatalogFilter = "All" | "Saved" | PracticeSetFacet;
type Configurations = Record<string, PracticeSetConfiguration>;

const storageKey = "aidioma-practice-set-prototype-configurations:v1";

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
  onOpenOptions,
  onStart,
  onToggleSaved,
  set,
}: {
  isSaved: boolean;
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
        <span className="set-level">{set.level}</span>
        <strong>{set.title}</strong>
        <span className="set-description">{set.description}</span>
        <span className="set-card-footer">
          <span>{set.targetCount} targets</span>
          <span className="set-start-label">Start</span>
        </span>
      </button>
      <div className="set-card-actions">
        <button
          aria-label={isSaved ? `Remove ${set.title} from saved` : `Save ${set.title}`}
          aria-pressed={isSaved}
          className={`set-card-action saved-toggle${isSaved ? " is-saved" : ""}`}
          onClick={onToggleSaved}
          type="button"
        >
          <Star aria-hidden="true" />
          <span>{isSaved ? "Saved" : "Save"}</span>
        </button>
        <button
          aria-label={`Customize ${set.title}`}
          className="set-card-action set-options-button"
          onClick={onOpenOptions}
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" />
          <span>Options</span>
        </button>
      </div>
    </article>
  );
}

export function PracticeWorkspace() {
  const [view, setView] = useState<PrototypeView>("catalog");
  const [practiceOptionsOpen, setPracticeOptionsOpen] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>("All");
  const [selectedSetId, setSelectedSetId] = useState(practiceSetFixtures[0].id);
  const [savedSetIds, setSavedSetIds] = useState<string[]>([]);
  const [configurations, setConfigurations] = useState<Configurations>(rememberedConfigurations);
  const [sessionSnapshot, setSessionSnapshot] = useState<{
    configuration: PracticeSetConfiguration;
    setId: string;
  } | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [flashcardRevealed, setFlashcardRevealed] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(configurations));
    } catch {
      // Remembered prototype defaults are optional when storage is unavailable.
    }
  }, [configurations]);

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

  function startSession(
    set: PracticeSetFixture,
    configuration: PracticeSetConfiguration,
  ) {
    setSelectedSetId(set.id);
    setSessionSnapshot({ configuration: { ...configuration }, setId: set.id });
    setTypedAnswer("");
    setFeedbackVisible(false);
    setFlashcardRevealed(false);
    setPracticeOptionsOpen(false);
    setView("session");
  }

  function toggleSaved(setId: string) {
    setSavedSetIds((current) =>
      current.includes(setId) ? current.filter((id) => id !== setId) : [...current, setId],
    );
  }

  if (view === "catalog") {
    return (
      <div className="practice-workspace">
        <PrototypeContextHeader title="Practice" />
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
              <h2>No saved collections</h2>
              <p>Save a collection to find it here.</p>
              <Button onClick={() => setCatalogFilter("All")} variant="quiet">
                Browse all collections
              </Button>
            </Card>
          ) : (
            <div className="practice-set-grid">
              {filteredSets.map((set) => (
                <CollectionCard
                  isSaved={savedSetIds.includes(set.id)}
                  key={set.id}
                  onOpenOptions={() => openOptions(set)}
                  onStart={() => startSession(set, configurations[set.id])}
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
            onClose={() => setPracticeOptionsOpen(false)}
            onStart={() => startSession(selectedSet, selectedConfiguration)}
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
  const promptIsSpanish = sessionConfiguration.direction === "es-en";
  const prompt = promptIsSpanish ? sessionSet.preview.spanish : sessionSet.preview.english;
  const reverse = promptIsSpanish ? sessionSet.preview.english : sessionSet.preview.spanish;

  return (
    <div className="practice-workspace">
      <PrototypeContextHeader
        backLabel="End preview and return to Practice"
        onBack={() => setView("catalog")}
        title={sessionSet.title}
        trailing={
          <>
            <span className="session-count">1 / {sessionConfiguration.size}</span>
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
              aria-label="Reconfigure session"
              onClick={() => {
                setPracticeOptionsOpen(true);
              }}
            >
              <SlidersHorizontal aria-hidden="true" />
            </IconButton>
          </>
        }
      />

      <div className="practice-feed">
        <Card className="explainer-row set-session-summary">
          <Layers3 aria-hidden="true" />
          <span>
            <strong>{sessionSet.title}</strong>
            <small>
              {describePracticeConfiguration(
                sessionConfiguration,
                sessionSet.facets.includes("Verbs"),
              )}
            </small>
          </span>
          <span className="status-tag">Preview</span>
        </Card>

        {sessionConfiguration.activity === "type" ? (
          <>
            <Card className="activity-card prototype-type-card">
              <div className="activity-label">
                <span>{practiceActivityLabels.type} · 1 of {sessionConfiguration.size}</span>
                <span>{practiceDirectionLabels[sessionConfiguration.direction]}</span>
              </div>
              <p className="prompt-cue">{sessionSet.preview.cue}</p>
              <h2>{prompt}</h2>
            </Card>

            {feedbackVisible ? (
              <Card aria-live="polite" className="prototype-feedback-card" role="status">
                <div className="feedback-heading">
                  <Check aria-hidden="true" />
                  <strong>Representative feedback state</strong>
                </div>
                <p>
                  Fixture answer: <strong>{reverse}</strong>
                </p>
                <small>No answer was evaluated or saved in this prototype.</small>
              </Card>
            ) : null}
          </>
        ) : (
          <Card className="activity-card flashcard-preview-card">
            <div className="activity-label">
              <span>Flashcard · 1 of {sessionConfiguration.size}</span>
              <span>{flashcardRevealed ? "Back" : "Front"}</span>
            </div>
            <button
              aria-label={flashcardRevealed ? "Hide flashcard answer" : "Reveal flashcard answer"}
              aria-pressed={flashcardRevealed}
              className="flashcard-face"
              onClick={() => setFlashcardRevealed((revealed) => !revealed)}
              type="button"
            >
              <span>{flashcardRevealed ? reverse : prompt}</span>
              <small>{flashcardRevealed ? "Tap to show the prompt" : "Tap to reveal"}</small>
            </button>
          </Card>
        )}

        <Card className="prototype-boundary-note">
          <strong>Design proof only</strong>
          <span>This preview creates no session, evaluation, proficiency, or lesson-progress record.</span>
        </Card>
      </div>

      {sessionConfiguration.activity === "type" ? (
        <form
          className="practice-composer prototype-composer"
          onSubmit={(event) => {
            event.preventDefault();
            if (typedAnswer.trim()) setFeedbackVisible(true);
          }}
        >
          <label className="visually-hidden" htmlFor="practice-set-answer">
            Type a prototype answer
          </label>
          <input
            id="practice-set-answer"
            onChange={(event) => {
              setTypedAnswer(event.target.value);
              setFeedbackVisible(false);
            }}
            placeholder="Type a prototype answer"
            type="text"
            value={typedAnswer}
          />
          <IconButton aria-label="Preview feedback" disabled={!typedAnswer.trim()} type="submit">
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
              setPracticeOptionsOpen(true);
            }}
          >
            Reconfigure
          </Button>
        </div>
      )}
      {practiceOptionsOpen ? (
        <PracticeSetOptionsPanel
          configuration={selectedConfiguration}
          onClose={() => setPracticeOptionsOpen(false)}
          onStart={() => startSession(selectedSet, selectedConfiguration)}
          onUpdate={updateConfiguration}
          set={selectedSet}
          startLabel="Start new practice"
        />
      ) : null}
    </div>
  );
}
