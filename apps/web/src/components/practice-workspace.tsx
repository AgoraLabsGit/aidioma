import { BookOpen, Send, SlidersHorizontal } from "lucide-react";

import { a1Lessons } from "@/lib/course";

import { Card, IconButton } from "./primitives";
import { TopContextBar } from "./top-context-bar";

export function PracticeWorkspace() {
  return (
    <div className="practice-workspace">
      <TopContextBar
        actions={
          <>
            <IconButton aria-label="Open lesson" disabled>
              <BookOpen aria-hidden="true" />
            </IconButton>
            <IconButton aria-label="Practice options" disabled>
              <SlidersHorizontal aria-hidden="true" />
            </IconButton>
          </>
        }
        shortTitle="Lesson 1 · Hola"
        title={`Lesson 1 · ${a1Lessons[0].title}`}
      />

      <div className="practice-feed">
        <Card className="explainer-row">
          <BookOpen aria-hidden="true" />
          <span>
            <strong>{`Lesson 1 · ${a1Lessons[0].title}`}</strong>
            <small>Connects with canonical lesson data in A1-2</small>
          </span>
          <span className="status-tag">Soon</span>
        </Card>

        <div className="phase-divider">Practice</div>

        <Card className="activity-card">
          <div className="activity-label">
            <span>Learn · first session</span>
            <span>Not started</span>
          </div>
          <h1>Your first activity will appear here.</h1>
          <p>
            The practice shell is ready; canonical lesson activities connect in
            A1-2. No sample answer or progress has been invented.
          </p>
        </Card>

        <Card
          aria-label="Upcoming session arc"
          className="activity-card quiet-activity"
          role="region"
        >
          <div className="activity-label">Session arc</div>
          <p>Learn → Quiz → Words → Sentences → Story</p>
        </Card>
      </div>

      <form className="practice-composer">
        <label className="visually-hidden" htmlFor="practice-input">
          Answer or ask anything
        </label>
        <input
          disabled
          id="practice-input"
          placeholder="Answer or ask anything"
          type="text"
        />
        <IconButton aria-label="Send" disabled>
          <Send aria-hidden="true" />
        </IconButton>
      </form>
    </div>
  );
}
