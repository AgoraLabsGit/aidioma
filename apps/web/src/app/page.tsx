import Link from "next/link";

import { Icon } from "@/components/icon";

export default function HomePage() {
  return (
    <div className="page-stack">
      <section className="hero" aria-labelledby="home-heading">
        <p className="eyebrow">Your Spanish, one honest step at a time</p>
        <div className="hero-heading-row">
          <div>
            <h1 id="home-heading">Buenos días.</h1>
            <p className="hero-copy">
              Begin with the foundations, then build a practice rhythm that
              remembers what needs attention.
            </p>
          </div>
          <span className="level-stamp" aria-label="Current level A1">
            A1
          </span>
        </div>
      </section>

      <div className="home-grid">
        <section className="continue-card" aria-labelledby="continue-heading">
          <div>
            <p className="eyebrow eyebrow-light">Continue</p>
            <h2 id="continue-heading">Start at the beginning</h2>
            <p>
              Your first lesson will appear as soon as the reviewed A1 course is
              loaded. No sample progress has been added for you.
            </p>
          </div>
          <Link className="button button-paper" href="/lessons">
            View lesson path
            <Icon name="arrow" />
          </Link>
        </section>

        <section className="stats-card" aria-labelledby="stats-heading">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Today</p>
              <h2 id="stats-heading">A clean slate</h2>
            </div>
            <span className="quiet-badge">First visit</span>
          </div>
          <dl className="stats-list">
            <div>
              <dt>Practice streak</dt>
              <dd>0 days</dd>
            </div>
            <div>
              <dt>Lessons completed</dt>
              <dd>0</dd>
            </div>
            <div>
              <dt>Review due</dt>
              <dd>0</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="support-grid">
        <section className="paper-card" aria-labelledby="path-heading">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">A1 foundations</p>
              <h2 id="path-heading">Your lesson path</h2>
            </div>
            <span className="status-label">Not started</span>
          </div>
          <div className="empty-state">
            <span className="empty-state-mark" aria-hidden="true">
              01
            </span>
            <div>
              <h3>Lessons are being prepared</h3>
              <p>
                Reviewed course content will replace this message. Your path
                starts at Lesson 1, with no locked detour or demo data.
              </p>
            </div>
          </div>
        </section>

        <section className="paper-card goal-card" aria-labelledby="goal-heading">
          <p className="eyebrow">Weekly rhythm</p>
          <h2 id="goal-heading">0 of 50 points</h2>
          <progress aria-label="Weekly goal: 0 of 50 points" max="50" value="0">
            0 of 50
          </progress>
          <p className="muted-copy">
            Your default goal is ready. Practice points begin only after a real
            session.
          </p>
        </section>
      </div>
    </div>
  );
}
