import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lessons" };

export default function LessonsPage() {
  return (
    <div className="page-stack narrow-page">
      <header className="page-heading">
        <p className="eyebrow">Course</p>
        <h1>Lessons</h1>
        <p>
          A clear A1 path, built from reviewed content rather than placeholder
          exercises.
        </p>
      </header>
      <section className="paper-card" aria-labelledby="a1-heading">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">You are here</p>
            <h2 id="a1-heading">A1 Foundations</h2>
          </div>
          <span className="status-label">Current</span>
        </div>
        <div className="empty-state roomy-empty-state">
          <span className="empty-state-mark" aria-hidden="true">
            A1
          </span>
          <div>
            <h3>No lessons loaded yet</h3>
            <p>
              The course catalog will fill from canonical lesson data in the next
              scaffold slice. Nothing here is a fabricated preview.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
