import { ChevronDown } from "lucide-react";

import { a1Lessons } from "@/lib/course";

import { LessonRow } from "./lesson-row";
import { Badge, Card, ScreenContainer } from "./primitives";

export function LessonCatalog() {
  return (
    <ScreenContainer>
      <header className="screen-header">
        <h1>Lessons</h1>
        <p>Your road, level by level. Lesson 1 is the place to begin.</p>
      </header>

      <section aria-label="Course levels" className="level-groups">
        <details className="level-group current-level" open>
          <summary>
            <span>
              <strong>A1 · Foundations</strong>
              <small>Lessons 1–12</small>
            </span>
            <span className="level-summary-meta">
              <Badge className="level-status">You are here</Badge>
              <ChevronDown aria-hidden="true" className="level-caret" />
            </span>
          </summary>
          <Card className="level-body" id="lesson-1">
            <ol className="lesson-list">
              {a1Lessons.map((lesson) => (
                <LessonRow key={lesson.number} lesson={lesson} />
              ))}
            </ol>
          </Card>
        </details>

        <details className="level-group locked-level">
          <summary>
            <span>
              <strong>A2 · Building blocks</strong>
              <small>Opens after the A1 path</small>
            </span>
            <span className="level-summary-meta">
              <Badge className="level-status">Locked</Badge>
              <ChevronDown aria-hidden="true" className="level-caret" />
            </span>
          </summary>
        </details>
      </section>
    </ScreenContainer>
  );
}
