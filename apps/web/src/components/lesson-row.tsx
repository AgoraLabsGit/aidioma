import { ChevronRight, LockKeyhole } from "lucide-react";
import Link from "next/link";

import type { CourseLesson } from "@/lib/course";

export function LessonRow({
  compact = false,
  href,
  lesson,
}: {
  compact?: boolean;
  href?: string;
  lesson: CourseLesson;
}) {
  const content = (
    <>
      <span className="lesson-copy">
        <span className="lesson-title">
          {lesson.number} · {lesson.title}
        </span>
        {compact ? null : (
          <span className="lesson-objective">{lesson.objective}</span>
        )}
      </span>
      <span className={`status-tag status-${lesson.status}`}>
        {lesson.status}
      </span>
      {lesson.status === "locked" ? (
        <LockKeyhole aria-hidden="true" className="row-icon" />
      ) : href ? (
        <ChevronRight aria-hidden="true" className="row-icon" />
      ) : null}
    </>
  );

  return (
    <li className={`lesson-row lesson-${lesson.status}`}>
      {lesson.status === "current" && href ? (
        <Link href={href}>{content}</Link>
      ) : (
        <div aria-disabled="true">{content}</div>
      )}
    </li>
  );
}
