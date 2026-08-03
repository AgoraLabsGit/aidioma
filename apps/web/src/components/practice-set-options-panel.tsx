import { ChevronRight, X } from "lucide-react";
import { useEffect, useRef } from "react";

import {
  describePracticeConfiguration,
  focusAvailableForStage,
  practiceDifficultyLabels,
  practiceDirectionLabels,
  type PracticeActivity,
  type PracticeDifficulty,
  type PracticeDirection,
  type PracticeSetConfiguration,
  type PracticeSetFixture,
  type PrototypeLearnerStage,
} from "@/lib/practice-sets/prototype-fixtures";

import { Button } from "./primitives";

function ChoiceButton({
  children,
  disabled = false,
  onClick,
  selected,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      aria-pressed={selected}
      className={`choice-button${selected ? " is-selected" : ""}`}
      disabled={disabled}
      onClick={onClick}
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
  learnerStage,
  set,
  startLabel,
}: {
  configuration: PracticeSetConfiguration;
  onClose: () => void;
  onStart: () => void;
  onUpdate: (patch: Partial<PracticeSetConfiguration>) => void;
  learnerStage: PrototypeLearnerStage;
  set: PracticeSetFixture;
  startLabel: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const supportedActivities = set.activities.filter(
    (activity): activity is typeof activity & { id: PracticeActivity } =>
      activity.status === "available" &&
      (activity.id === "type" || activity.id === "flashcards"),
  );
  const directions = Object.keys(practiceDirectionLabels) as PracticeDirection[];
  const difficulties = Object.keys(practiceDifficultyLabels) as PracticeDifficulty[];

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
          <strong id="practice-options-title">Practice settings</strong>
          <span>{set.title}</span>
        </div>
        <button
          aria-label="Close practice settings"
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
        </fieldset>

        <fieldset className="configuration-group">
          <legend>Direction</legend>
          <div className="choice-grid choice-grid-three panel-segmented-control">
            {directions.map((direction) => (
              <ChoiceButton
                key={direction}
                onClick={() => onUpdate({ direction })}
                selected={configuration.direction === direction}
              >
                {practiceDirectionLabels[direction]}
              </ChoiceButton>
            ))}
          </div>
        </fieldset>

        <fieldset className="configuration-group">
          <legend>Focus</legend>
          <div className="choice-grid panel-option-list">
            {set.focuses.map((focus) => (
              <ChoiceButton
                disabled={!focusAvailableForStage(set, focus.id, learnerStage)}
                key={focus.id}
                onClick={() => onUpdate({ focus: focus.id })}
                selected={configuration.focus === focus.id}
              >
                <span>{focus.label}</span>
                <small>{focus.description}</small>
              </ChoiceButton>
            ))}
          </div>
          <p className="control-help">
            A focus changes upcoming practice. It does not change curriculum position or claim mastery.
          </p>
        </fieldset>

        <fieldset className="configuration-group">
          <legend>Support</legend>
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

        <label className="shuffle-control">
          <span>
            <strong>Vary the order</strong>
            <small>Mix matching material while keeping the selected focus.</small>
          </span>
          <input
            checked={configuration.shuffle}
            onChange={(event) => onUpdate({ shuffle: event.target.checked })}
            type="checkbox"
          />
        </label>
      </div>

      <div className="practice-options-panel-footer">
        <p>{describePracticeConfiguration(configuration, set)}</p>
        <Button onClick={onStart}>
          {startLabel}
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </dialog>
  );
}
