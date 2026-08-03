import type {
  PracticeDirection,
  PracticePrompt,
  PracticeSetConfiguration,
} from "./prototype-fixtures";

export type PracticeUnit = {
  direction: Exclude<PracticeDirection, "both">;
  prompt: PracticePrompt;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 0x1_0000_0000;
  };
}

function shuffledPrompts(prompts: PracticePrompt[], seed: number) {
  const shuffled = [...prompts];
  const random = seededRandom(seed);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function avoidRepeatedFirstPrompt(
  prompts: PracticePrompt[],
  avoidFirstPromptId?: string,
) {
  if (prompts.length <= 1 || prompts[0]?.id !== avoidFirstPromptId) return prompts;

  const nextFirstIndex = prompts.findIndex((prompt) => prompt.id !== avoidFirstPromptId);
  if (nextFirstIndex <= 0) return prompts;

  return [...prompts.slice(nextFirstIndex), ...prompts.slice(0, nextFirstIndex)];
}

export function practiceUnitsForSession(
  prompts: PracticePrompt[],
  configuration: PracticeSetConfiguration,
  sessionOrderSeed: number,
  avoidFirstPromptId?: string,
): PracticeUnit[] {
  const orderedPrompts = configuration.shuffle
    ? avoidRepeatedFirstPrompt(
        shuffledPrompts(prompts, sessionOrderSeed),
        avoidFirstPromptId,
      )
    : [...prompts];

  if (configuration.direction !== "both") {
    const direction: Exclude<PracticeDirection, "both"> = configuration.direction;
    return orderedPrompts.map((prompt) => ({ prompt, direction }));
  }

  const firstPass = orderedPrompts.map((prompt, promptPosition): PracticeUnit => ({
    prompt,
    direction: promptPosition % 2 === 0 ? "en-es" : "es-en",
  }));
  const secondPass = firstPass.map((unit): PracticeUnit => ({
    prompt: unit.prompt,
    direction: unit.direction === "en-es" ? "es-en" : "en-es",
  }));

  return [...firstPass, ...secondPass];
}

export function randomSessionOrderSeed() {
  const value = new Uint32Array(1);
  globalThis.crypto.getRandomValues(value);
  return value[0];
}
