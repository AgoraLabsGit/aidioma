"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { SegmentedControl } from "./primitives";

const options = [
  { label: "Auto", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
] as const;

const subscribeToHydration = () => () => undefined;

export function ThemeControl() {
  const { theme, setTheme } = useTheme();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const selectedTheme = hydrated ? (theme ?? "system") : "system";

  return (
    <SegmentedControl label="Theme">
      {options.map((option) => (
        <button
          aria-pressed={selectedTheme === option.value}
          className={selectedTheme === option.value ? "is-selected" : undefined}
          key={option.value}
          onClick={() => setTheme(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </SegmentedControl>
  );
}
