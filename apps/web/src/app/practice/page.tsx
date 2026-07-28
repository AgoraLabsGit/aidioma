import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Practice" };

export default function PracticePage() {
  return (
    <div className="page-stack narrow-page">
      <header className="page-heading">
        <p className="eyebrow">Practice</p>
        <h1>Make the words yours.</h1>
        <p>Sessions will adapt to your real attempts, not a simulated history.</p>
      </header>
      <section className="paper-card centered-empty" aria-labelledby="practice-empty-heading">
        <span className="large-ornament" aria-hidden="true">
          ¿
        </span>
        <h2 id="practice-empty-heading">Your first session is waiting on Lesson 1</h2>
        <p>
          Once the reviewed lessons are loaded, Continue will begin the Learn,
          Quiz, Words, Sentences, and Story arc here.
        </p>
        <Link className="button button-solid" href="/lessons">
          See lesson path
        </Link>
      </section>
    </div>
  );
}
