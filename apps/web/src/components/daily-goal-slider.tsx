"use client";

import { useState } from "react";

export function DailyGoalSlider() {
  const [goal, setGoal] = useState(50);

  return (
    <div className="goal-slider">
      <output htmlFor="daily-goal">{goal} exercises</output>
      <input
        aria-label="Daily Practice Goal"
        aria-describedby="daily-goal-description"
        id="daily-goal"
        max="150"
        min="5"
        onChange={(event) => setGoal(Number(event.currentTarget.value))}
        step="5"
        type="range"
        value={goal}
      />
      <div aria-hidden="true" className="range-labels">
        <span>5</span>
        <span>150</span>
      </div>
    </div>
  );
}
