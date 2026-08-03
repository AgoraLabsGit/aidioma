"use client";

import { BookOpen, Check, Send } from "lucide-react";
import { useState } from "react";

import { Card, IconButton } from "./primitives";
import { PrototypeContextHeader } from "./prototype-context-header";

export function LessonPracticePreview() {
  const [typedAnswer, setTypedAnswer] = useState("");
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  return (
    <div className="practice-workspace">
      <PrototypeContextHeader
        backHref="/lessons"
        backLabel="End lesson and return to Lessons"
        title="Lesson 1"
        trailing={<span className="session-count">1 / 10</span>}
      />

      <div className="practice-feed">
        <Card className="explainer-row lesson-session-summary">
          <BookOpen aria-hidden="true" />
          <span>
            <strong>Lesson mix</strong>
            <small>Hola: greetings and introducing yourself</small>
          </span>
          <span className="status-tag">Beginner</span>
        </Card>

        <Card className="activity-card prototype-type-card">
          <div className="activity-label">
            <span>Lesson mix · 1 of 10</span>
            <span>EN → ES</span>
          </div>
          <p className="prompt-cue">Greet someone and introduce yourself.</p>
          <h2>Hello, my name is Ana.</h2>
        </Card>

        {feedbackVisible ? (
          <Card aria-live="polite" className="prototype-feedback-card" role="status">
            <div className="feedback-heading">
              <Check aria-hidden="true" />
              <strong>Model answer</strong>
            </div>
            <p>
              <strong>Hola, me llamo Ana.</strong>
            </p>
          </Card>
        ) : null}
      </div>

      <form
        className="practice-composer prototype-composer"
        onSubmit={(event) => {
          event.preventDefault();
          if (typedAnswer.trim()) setFeedbackVisible(true);
        }}
      >
        <label className="visually-hidden" htmlFor="lesson-practice-answer">
          Type your answer
        </label>
        <input
          id="lesson-practice-answer"
          onChange={(event) => {
            setTypedAnswer(event.target.value);
            setFeedbackVisible(false);
          }}
          placeholder="Type your answer"
          type="text"
          value={typedAnswer}
        />
        <IconButton aria-label="Check answer" disabled={!typedAnswer.trim()} type="submit">
          <Send aria-hidden="true" />
        </IconButton>
      </form>
    </div>
  );
}
