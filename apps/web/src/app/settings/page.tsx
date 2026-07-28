import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="page-stack narrow-page">
      <header className="page-heading">
        <p className="eyebrow">Your space</p>
        <h1>Settings</h1>
        <p>Preferences will be saved to your learner account.</p>
      </header>
      <section className="paper-card" aria-labelledby="preferences-heading">
        <p className="eyebrow">Coming with learner profiles</p>
        <h2 id="preferences-heading">Preferences are not connected yet</h2>
        <p className="muted-copy settings-copy">
          Daily goal and Auto, Light, or Dark theme controls will become
          interactive when account persistence lands. The shell already follows
          your device theme and reduced-motion preference.
        </p>
      </section>
    </div>
  );
}
