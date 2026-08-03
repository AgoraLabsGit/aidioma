import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";

import { a1Lessons } from "@/lib/course";
import { intermediatePilotLessons } from "@/lib/intermediate-pilot";

import { LessonRow } from "./lesson-row";
import { Badge, Card, ScreenContainer } from "./primitives";

export function LessonCatalog() {
  return (
    <ScreenContainer>
      <header className="screen-header">
        <h1>Lessons</h1>
        <p>Learn one capability at a time, then use it across real situations.</p>
      </header>

      <section aria-label="Course levels" className="level-groups">
        <details className="level-group current-level intermediate-pilot-level" open>
          <summary>
            <span>
              <strong>Intermediate</strong>
              <small>Build connected, practical Spanish</small>
            </span>
            <span className="level-summary-meta">
              <Badge className="level-status">Current level</Badge>
              <ChevronDown aria-hidden="true" className="level-caret" />
            </span>
          </summary>
          <div className="intermediate-lesson-grid">
            {intermediatePilotLessons.map((lesson, index) => (
              <Card className="intermediate-lesson-card" key={lesson.slug}>
                <div className="intermediate-lesson-heading">
                  <span className="set-level">Lesson {index + 1}</span>
                  <Badge>{lesson.status === "available" ? "Try now" : "Outlined"}</Badge>
                </div>
                <h2>{lesson.title}</h2>
                <p>{lesson.objective}</p>
                <ul aria-label={`${lesson.title} capabilities`} className="capability-chip-list">
                  {lesson.capabilities.map((capability) => (
                    <li key={capability}>{capability}</li>
                  ))}
                </ul>
                {lesson.status === "available" ? (
                  <Link
                    className="intermediate-lesson-action"
                    href={`/lessons/intermediate/${lesson.slug}`}
                  >
                    Start lesson <ArrowRight aria-hidden="true" />
                  </Link>
                ) : (
                  <span className="intermediate-lesson-action is-muted">Coming soon</span>
                )}
              </Card>
            ))}
          </div>
        </details>

        <details className="level-group current-level" open>
          <summary>
            <span>
              <strong>Beginner</strong>
              <small>Build a strong foundation</small>
            </span>
            <span className="level-summary-meta">
              <Badge className="level-status">A1</Badge>
              <ChevronDown aria-hidden="true" className="level-caret" />
            </span>
          </summary>
          <Card className="level-body" id="lesson-1">
            <ol className="lesson-list">
              {a1Lessons.map((lesson) => (
                <LessonRow
                  href={lesson.status === "current" ? `/lessons/${lesson.number}` : undefined}
                  key={lesson.number}
                  lesson={lesson}
                />
              ))}
            </ol>
          </Card>
        </details>

      </section>
    </ScreenContainer>
  );
}
