import type { ReactNode } from "react";

function RingBadge({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const circumference = 2 * Math.PI * 7.5;

  return (
    <span aria-label={label} className="ring-badge">
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <circle className="ring-track" cx="10" cy="10" r="7.5" />
        <circle
          className="ring-fill"
          cx="10"
          cy="10"
          r="7.5"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <span>{value}</span>
    </span>
  );
}

export function TopContextBar({
  actions,
  shortTitle,
  title,
}: {
  actions?: ReactNode;
  shortTitle?: string;
  title: string;
}) {
  return (
    <header className="top-context-bar">
      <div className="context-title">
        <span className="context-title-long">{title}</span>
        {shortTitle ? (
          <span className="context-title-short">{shortTitle}</span>
        ) : null}
        <span aria-hidden="true">›</span>
      </div>
      <div className="context-badges" aria-label="Session status">
        <RingBadge label="Current proficiency: 0 percent" value="0%" />
        <RingBadge label="Today's exercises: 0 of 50" value="0/50" />
        {actions}
      </div>
    </header>
  );
}
