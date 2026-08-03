"use client";

import { ArrowRight, BookOpen, Check, Lightbulb, RotateCcw, Send } from "lucide-react";
import { useState } from "react";

import {
  matchesIntermediateLessonAnswer,
  tellWhatHappenedSteps,
} from "@/lib/intermediate-pilot";

import { Button, ButtonLink, Card, IconButton } from "./primitives";
import { PrototypeContextHeader } from "./prototype-context-header";

export function IntermediateLessonPilot() {
  const [stepIndex, setStepIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [answerCorrect, setAnswerCorrect] = useState<boolean | null>(null);
  const [complete, setComplete] = useState(false);

  const step = tellWhatHappenedSteps[stepIndex];

  function restart() {
    setStepIndex(0);
    setTypedAnswer("");
    setAnswerCorrect(null);
    setComplete(false);
  }

  if (complete) {
    return (
      <div className="practice-workspace lesson-pilot-workspace">
        <PrototypeContextHeader
          backHref="/lessons"
          backLabel="Return to Lessons"
          title="Tell what happened"
        />
        <div className="practice-feed prototype-feed lesson-complete-feed">
          <Card className="lesson-complete-card">
            <div className="lesson-complete-icon"><Check aria-hidden="true" /></div>
            <span className="eyebrow">Lesson complete</span>
            <h2>You worked from a form to a real restaurant account.</h2>
            <p>
              You practiced completed events, placed them in past time, and applied them in context.
            </p>
          </Card>
          <Card className="evidence-preview-card">
            <div className="feedback-heading">
              <BookOpen aria-hidden="true" />
              <strong>Capabilities exercised</strong>
            </div>
            <ul>
              {tellWhatHappenedSteps.map((lessonStep) => (
                <li key={lessonStep.id}>{lessonStep.capability}</li>
              ))}
            </ul>
          </Card>
          <div className="recap-actions">
            <ButtonLink href="/practice">
              Use this in Restaurant Spanish <ArrowRight aria-hidden="true" />
            </ButtonLink>
            <Button onClick={restart} variant="quiet">
              <RotateCcw aria-hidden="true" /> Restart lesson
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-workspace lesson-pilot-workspace">
      <PrototypeContextHeader
        backHref="/lessons"
        backLabel="End lesson and return to Lessons"
        title="Tell what happened"
        trailing={<span className="session-count">Step {stepIndex + 1} of {tellWhatHappenedSteps.length}</span>}
      />

      <div aria-label="Lesson content" className="practice-feed" role="region" tabIndex={0}>
        <Card className="explainer-row lesson-session-summary">
          <BookOpen aria-hidden="true" />
          <span>
            <strong>Lesson promise</strong>
            <small>Narrate completed events using the preterite and clear past-time anchors.</small>
          </span>
          <span className="status-tag">Intermediate</span>
        </Card>

        <Card className="lesson-teaching-card">
          <span className="eyebrow">Learn · {step.title}</span>
          <p>{step.explanation}</p>
          <div className="lesson-support-strip">
            <Lightbulb aria-hidden="true" />
            <span>{step.support}</span>
          </div>
        </Card>

        <Card className="activity-card prototype-type-card">
          <div className="activity-label">
            <span>Apply · step {stepIndex + 1}</span>
            <span>EN → ES</span>
          </div>
          <p className="prompt-cue">{step.cue}</p>
          <h2>{step.prompt}</h2>
        </Card>

        {answerCorrect !== null ? (
          <Card
            aria-live="polite"
            className={`prototype-feedback-card ${answerCorrect ? "feedback-achieved" : "feedback-unconfirmed"}`}
            role="status"
          >
            <div className="feedback-heading">
              {answerCorrect ? <Check aria-hidden="true" /> : <Lightbulb aria-hidden="true" />}
              <strong>{answerCorrect ? "Correct" : "Review the model answer"}</strong>
            </div>
            <p>
              Model: <strong>{step.modelAnswer}</strong>
            </p>
            <small>{answerCorrect ? step.capability : "Notice the target form before continuing."}</small>
          </Card>
        ) : null}
      </div>

      {answerCorrect === null ? (
        <form
          className="practice-composer prototype-composer"
          onSubmit={(event) => {
            event.preventDefault();
            if (!typedAnswer.trim()) return;
            setAnswerCorrect(matchesIntermediateLessonAnswer(step, typedAnswer));
          }}
        >
          <label className="visually-hidden" htmlFor="intermediate-lesson-answer">
            Type a lesson answer
          </label>
          <input
            id="intermediate-lesson-answer"
            onChange={(event) => setTypedAnswer(event.target.value)}
            placeholder="Type your answer"
            type="text"
            value={typedAnswer}
          />
          <IconButton aria-label="Check lesson answer" disabled={!typedAnswer.trim()} type="submit">
            <Send aria-hidden="true" />
          </IconButton>
        </form>
      ) : (
        <div className="practice-composer continuous-practice-controls">
          <Button
            onClick={() => {
              if (stepIndex === tellWhatHappenedSteps.length - 1) {
                setComplete(true);
                return;
              }
              setStepIndex((current) => current + 1);
              setTypedAnswer("");
              setAnswerCorrect(null);
            }}
          >
            {stepIndex === tellWhatHappenedSteps.length - 1 ? "Finish lesson" : "Next lesson step"}
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
