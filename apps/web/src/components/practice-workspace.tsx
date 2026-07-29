"use client";

import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Layers3,
  RotateCcw,
  Send,
  SlidersHorizontal,
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

type PrototypeView = "entry" | "catalog" | "session";
type CatalogFilter = "All" | PracticeSetFacet;
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

function filterCollections(filter: CatalogFilter) {
  if (filter === "All") return practiceSetFixtures;
  return practiceSetFixtures.filter((set) => set.facets.includes(filter));
}

function PrototypeHeader({
  backLabel,
  onBack,
  title,
  trailing,
}: {
  backLabel?: string;
  onBack?: () => void;
  title: string;
  trailing?: React.ReactNode;
}) {
  return (
    <header className="top-context-bar prototype-context-bar">
      <div className="prototype-context-start">
        {onBack ? (
          <IconButton aria-label={backLabel ?? "Back"} onClick={onBack}>
            <ArrowLeft aria-hidden="true" />
          </IconButton>
        ) : null}
        <div className="context-title">
          <h1>{title}</h1>
        </div>
      </div>
      <div className="context-badges">
        {trailing ?? <span className="prototype-tag">Fixture prototype</span>}
      </div>
    </header>
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

export function PracticeWorkspace() {
  const [view, setView] = useState<PrototypeView>("entry");
  const [practiceOptionsOpen, setPracticeOptionsOpen] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>("All");
  const [selectedSetId, setSelectedSetId] = useState(practiceSetFixtures[0].id);
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
  const filteredSets = filterCollections(catalogFilter);

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

  function startSession(set: PracticeSetFixture, configuration: PracticeSetConfiguration) {
    setSelectedSetId(set.id);
    setSessionSnapshot({ configuration: { ...configuration }, setId: set.id });
    setTypedAnswer("");
    setFeedbackVisible(false);
    setFlashcardRevealed(false);
    setPracticeOptionsOpen(false);
    setView("session");
  }

  if (view === "entry") {
    return (
      <div className="practice-workspace">
        <PrototypeHeader title="Practice" />
        <nav aria-label="Choose a practice source" className="practice-feed practice-source-list">
          <Button aria-disabled="true" className="practice-source-button" disabled variant="quiet">
            <BookOpen aria-hidden="true" />
            <span>Lessons</span>
            <small aria-hidden="true">Coming soon</small>
          </Button>
          <Button className="practice-source-button" onClick={() => setView("catalog")} variant="quiet">
            <Layers3 aria-hidden="true" />
            <span>Collections</span>
            <ChevronRight aria-hidden="true" />
          </Button>
          <Button aria-disabled="true" className="practice-source-button" disabled variant="quiet">
            <SlidersHorizontal aria-hidden="true" />
            <span>Your practice</span>
            <small aria-hidden="true">Coming later</small>
          </Button>
        </nav>
      </div>
    );
  }

  if (view === "catalog") {
    return (
      <div className="practice-workspace">
        <PrototypeHeader backLabel="Back to Practice" onBack={() => setView("entry")} title="Collections" />
        <div className="practice-feed prototype-feed">
          <div aria-label="Filter collections" className="filter-strip">
            {(["All", ...practiceSetFacets] as CatalogFilter[]).map((filter) => (
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

          <div className="practice-set-grid">
            {filteredSets.map((set) => (
              <article className="practice-set-card" key={set.id}>
                <button
                  aria-label={`Start ${set.title}`}
                  className="practice-set-start"
                  onClick={() => startSession(set, configurations[set.id])}
                  type="button"
                >
                  <span className="set-level">{set.level}</span>
                  <strong>{set.title}</strong>
                  <span className="set-description">{set.description}</span>
                  <span className="facet-list">
                    {set.facets.map((facet) => (
                      <span key={facet}>{facet}</span>
                    ))}
                  </span>
                  <span className="set-card-footer">{set.targetCount} targets</span>
                </button>
                <IconButton
                  aria-label={`Customize ${set.title}`}
                  className="set-options-button"
                  onClick={() => openOptions(set)}
                >
                  <SlidersHorizontal aria-hidden="true" />
                </IconButton>
              </article>
            ))}
          </div>
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
      <PrototypeHeader
        backLabel="End preview and return to Collections"
        onBack={() => setView("catalog")}
        title={sessionSet.title}
        trailing={
          <>
            <span className="session-count">1 / {sessionConfiguration.size}</span>
            <IconButton aria-label="Reconfigure session" onClick={() => setPracticeOptionsOpen(true)}>
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
          <Button onClick={() => setPracticeOptionsOpen(true)}>Reconfigure</Button>
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
