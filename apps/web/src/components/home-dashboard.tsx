import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { a1Lessons } from "@/lib/course";

import { LessonRow } from "./lesson-row";
import {
  Badge,
  Card,
  EmptyState,
  Progress,
  ScreenContainer,
  SectionHeading,
  StatTile,
} from "./primitives";

const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

export function HomeDashboard() {
  return (
    <ScreenContainer>
      <header className="screen-header">
        <h1>Hola.</h1>
        <p>Your Spanish path starts with one honest step.</p>
      </header>

      <section aria-label="Learning statistics" className="stat-grid">
        <StatTile label="day streak" value="0" />
        <StatTile label="completed" value="0" />
        <StatTile label="review due" value="0" />
      </section>

      <Card className="continue-card">
        <div className="continue-heading">
          <span className="lesson-title">Lesson 1 · {a1Lessons[0].title}</span>
          <Link href="/lessons">
            Start here <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <Progress label="Lesson 1 progress: not started" value={0} />
        <p>Not started · begin with the reviewed A1 foundations.</p>
      </Card>

      <section aria-labelledby="path-heading">
        <SectionHeading
          action={
            <Link className="text-link" href="/lessons">
              All lessons ›
            </Link>
          }
        >
          <span id="path-heading">Your path</span>
        </SectionHeading>
        <Card className="lesson-list-card">
          <ol className="lesson-list">
            {a1Lessons.slice(0, 5).map((lesson) => (
              <LessonRow
                compact
                href={lesson.status === "current" ? "/lessons#lesson-1" : undefined}
                key={lesson.number}
                lesson={lesson}
              />
            ))}
          </ol>
        </Card>
      </section>

      <section aria-labelledby="week-heading">
        <SectionHeading>
          <span id="week-heading">This week</span>
        </SectionHeading>
        <Card className="week-card">
          <div
            aria-label="No exercises completed this week; daily goal is 50"
            className="week-chart"
            role="img"
          >
            <span className="goal-line" />
            {weekDays.map((day, index) => (
              <span className="day-column" key={`${day}-${index}`}>
                <i />
                <b>{day}</b>
              </span>
            ))}
          </div>
          <p>Dashed line = daily goal (50)</p>
        </Card>
      </section>

      <section aria-labelledby="focus-heading">
        <SectionHeading>
          <span id="focus-heading">Focus &amp; review</span>
        </SectionHeading>
        <Card className="focus-card">
          <div className="review-row">
            <div>
              <strong>Review</strong>
              <span>Completed items will return here when they are due.</span>
            </div>
            <Badge>0 due</Badge>
          </div>
          <EmptyState title="No weak areas yet">
            Your focus list will be based only on real practice attempts.
          </EmptyState>
        </Card>
      </section>
    </ScreenContainer>
  );
}
