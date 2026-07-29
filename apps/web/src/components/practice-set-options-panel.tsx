import { ChevronRight, X } from "lucide-react";
import { useEffect, useRef } from "react";

import {
  describePracticeConfiguration,
  practiceDifficultyLabels,
  practiceDirectionLabels,
  validDirectionForVerbDrill,
  verbDrillLabels,
  verbPersonLabels,
  verbPoolCapacity,
  verbTenseLabels,
  type PracticeActivity,
  type PracticeDifficulty,
  type PracticeDirection,
  type PracticeSetConfiguration,
  type PracticeSetFixture,
  type VerbDrill,
  type VerbPerson,
  type VerbTense,
} from "@/lib/practice-sets/prototype-fixtures";

import { Button } from "./primitives";

function ChoiceButton({
  children,
  disabled = false,
  onClick,
  selected,
  title,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  selected: boolean;
  title?: string;
}) {
  return (
    <button
      aria-pressed={selected}
      className={`choice-button${selected ? " is-selected" : ""}`}
      disabled={disabled}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

export function PracticeSetOptionsPanel({
  configuration,
  onClose,
  onStart,
  onUpdate,
  set,
  startLabel,
}: {
  configuration: PracticeSetConfiguration;
  onClose: () => void;
  onStart: () => void;
  onUpdate: (patch: Partial<PracticeSetConfiguration>) => void;
  set: PracticeSetFixture;
  startLabel: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isVerbSet = set.facets.includes("Verbs");
  const supportedActivities = set.activities.filter(
    (activity): activity is typeof activity & { id: PracticeActivity } =>
      activity.status === "available" &&
      (activity.id === "type" || activity.id === "flashcards"),
  );
  const unsupportedActivities = set.activities.filter(
    (activity) => activity.status === "unavailable",
  );
  const directions = Object.keys(practiceDirectionLabels) as PracticeDirection[];
  const difficulties = Object.keys(practiceDifficultyLabels) as PracticeDifficulty[];
  const tenses = Object.keys(verbTenseLabels) as VerbTense[];
  const people = Object.keys(verbPersonLabels) as VerbPerson[];
  const drills = Object.keys(verbDrillLabels) as VerbDrill[];
  const capacity = isVerbSet ? verbPoolCapacity(configuration) : set.targetCount;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");

    return () => {
      if (typeof dialog.close === "function" && dialog.open) dialog.close();
    };
  }, []);

  return (
      <dialog
        aria-labelledby="practice-options-title"
        className="practice-options-panel"
        onCancel={(event) => {
          event.preventDefault();
          onClose();
        }}
        ref={dialogRef}
      >
        <div className="practice-options-panel-head">
          <div>
            <strong id="practice-options-title">Practice options</strong>
            <span>{set.title}</span>
          </div>
          <button
            aria-label="Close practice options"
            autoFocus
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="practice-options-panel-body">
          <fieldset className="configuration-group">
            <legend>How to practice</legend>
            <div className="choice-grid panel-option-list">
              {supportedActivities.map((activity) => (
                <ChoiceButton
                  key={activity.id}
                  onClick={() => onUpdate({ activity: activity.id })}
                  selected={configuration.activity === activity.id}
                >
                  <span>{activity.label}</span>
                  <small aria-hidden="true">
                    {activity.id === "type" ? "write the answer" : "reveal and recall"}
                  </small>
                </ChoiceButton>
              ))}
            </div>
            {unsupportedActivities.length > 0 ? (
              <p className="control-help">
                {unsupportedActivities
                  .map((activity) => `${activity.label}: ${activity.reason}`)
                  .join(" ")}
              </p>
            ) : null}
          </fieldset>

          <fieldset className="configuration-group">
            <legend>Direction</legend>
            <div className="choice-grid choice-grid-three panel-segmented-control">
              {directions.map((direction) => {
                const disabled =
                  isVerbSet && !validDirectionForVerbDrill(direction, configuration.drill);
                return (
                  <ChoiceButton
                    disabled={disabled}
                    key={direction}
                    onClick={() => onUpdate({ direction })}
                    selected={configuration.direction === direction}
                    title={
                      disabled ? "This direction does not match the selected verb drill." : undefined
                    }
                  >
                    {practiceDirectionLabels[direction]}
                  </ChoiceButton>
                );
              })}
            </div>
            {isVerbSet ? (
              <p className="control-help">
                Recognize form uses ES → EN. Produce form uses EN → ES.
              </p>
            ) : null}
          </fieldset>

          <fieldset className="configuration-group">
            <legend>Session size</legend>
            <div className="choice-grid choice-grid-three panel-segmented-control">
              {([5, 10, 15] as const).map((size) => {
                const disabled = size > capacity;
                return (
                  <ChoiceButton
                    disabled={disabled}
                    key={size}
                    onClick={() => onUpdate({ size })}
                    selected={configuration.size === size}
                    title={disabled ? `Only ${capacity} matching targets are available.` : undefined}
                  >
                    {size}
                  </ChoiceButton>
                );
              })}
            </div>
            <p className="control-help">{capacity} targets match the current controls.</p>
          </fieldset>

          <fieldset className="configuration-group">
            <legend>Difficulty</legend>
            <div className="choice-grid panel-option-list">
              {difficulties.map((difficulty) => (
                <ChoiceButton
                  key={difficulty}
                  onClick={() => onUpdate({ difficulty })}
                  selected={configuration.difficulty === difficulty}
                >
                  {practiceDifficultyLabels[difficulty]}
                </ChoiceButton>
              ))}
            </div>
          </fieldset>

          {isVerbSet ? (
            <>
              <fieldset className="configuration-group">
                <legend>Tense / form</legend>
                <div className="choice-grid panel-option-list">
                  {tenses.map((tense) => {
                    const next = { ...configuration, tense };
                    const disabled = configuration.size > verbPoolCapacity(next);
                    return (
                      <ChoiceButton
                        disabled={disabled}
                        key={tense}
                        onClick={() => onUpdate({ tense })}
                        selected={configuration.tense === tense}
                        title={
                          disabled ? "Choose a smaller session or a compatible person first." : undefined
                        }
                      >
                        {verbTenseLabels[tense]}
                      </ChoiceButton>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="configuration-group">
                <legend>Person</legend>
                <div className="choice-grid panel-option-list">
                  {people.map((person) => {
                    const next = { ...configuration, person };
                    const disabled = configuration.size > verbPoolCapacity(next);
                    const imperativeConflict =
                      configuration.tense === "imperative" && person === "first-singular";
                    return (
                      <ChoiceButton
                        disabled={disabled}
                        key={person}
                        onClick={() => onUpdate({ person })}
                        selected={configuration.person === person}
                        title={
                          imperativeConflict
                            ? "First-person singular imperative is not a valid target."
                            : disabled
                              ? "Choose a 5-item session before narrowing to one person."
                              : undefined
                        }
                      >
                        {verbPersonLabels[person]}
                      </ChoiceButton>
                    );
                  })}
                </div>
                <p className="control-help">
                  Imperative + first-person singular is always unavailable.
                </p>
              </fieldset>

              <fieldset className="configuration-group">
                <legend>Drill type</legend>
                <div className="choice-grid panel-option-list">
                  {drills.map((drill) => {
                    const disabled = !validDirectionForVerbDrill(configuration.direction, drill);
                    return (
                      <ChoiceButton
                        disabled={disabled}
                        key={drill}
                        onClick={() => onUpdate({ drill })}
                        selected={configuration.drill === drill}
                        title={disabled ? "Change direction to make this drill available." : undefined}
                      >
                        {verbDrillLabels[drill]}
                      </ChoiceButton>
                    );
                  })}
                </div>
              </fieldset>
            </>
          ) : null}

          <label className="shuffle-control">
            <span>
              <strong>Shuffle items</strong>
              <small>Deal a fresh order for the new session.</small>
            </span>
            <input
              checked={configuration.shuffle}
              onChange={(event) => onUpdate({ shuffle: event.target.checked })}
              type="checkbox"
            />
          </label>
        </div>

        <div className="practice-options-panel-footer">
          <p>{describePracticeConfiguration(configuration, isVerbSet)}</p>
          <Button onClick={onStart}>
            {startLabel}
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </dialog>
  );
}
