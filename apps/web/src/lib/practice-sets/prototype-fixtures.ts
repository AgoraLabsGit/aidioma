import {
  PracticePromptSchema,
  type PracticePrompt,
  type PrototypeLearnerStage,
} from "./practice-prompt-contract";
import restaurantPromptsJson from "./prototype-content/restaurant-prompts.json";
import {
  loadPromotedPrototypePrompts,
  mergePromotedPracticePrompts,
} from "./promoted-practice-prompts";

/**
 * PROTOTYPE ONLY. These local records exercise the intermediate learning design.
 * They are original sample content, not reviewed launch content, and must not be
 * copied into canonical lessons or future collection seeds.
 */

export const practiceSetFacets = [
  "Vocabulary",
  "Verbs",
  "Phrases",
  "Topics",
  "Situations",
] as const;

export type PracticeSetFacet = (typeof practiceSetFacets)[number];
export type PracticeActivity = "type" | "flashcards";
export type PracticeDirection = "en-es" | "es-en" | "both";
export type PracticeDifficulty = "guided" | "standard" | "stretch";
export type PracticeFocus =
  | "recommended"
  | "completed-past"
  | "time-phrases"
  | "spatial-language"
  | "haber"
  | "connectors";
export type { PracticePrompt, PrototypeLearnerStage } from "./practice-prompt-contract";

export type PracticeSetConfiguration = {
  activity: PracticeActivity;
  difficulty: PracticeDifficulty;
  direction: PracticeDirection;
  focus: PracticeFocus;
  shuffle: boolean;
};

type ActivityCapability = {
  id: "type" | "flashcards" | "conversation" | "story";
  label: string;
  reason?: string;
  status: "available" | "unavailable";
};

export type PracticeFocusOption = {
  description: string;
  id: PracticeFocus;
  label: string;
};

export type PracticeSetFixture = {
  activities: ActivityCapability[];
  defaultConfiguration: PracticeSetConfiguration;
  description: string;
  facets: PracticeSetFacet[];
  focuses: PracticeFocusOption[];
  id: string;
  level: string;
  prompts: PracticePrompt[];
  slug: string;
  support: string;
  title: string;
};

const defaultConfiguration: PracticeSetConfiguration = {
  activity: "type",
  difficulty: "standard",
  direction: "both",
  focus: "recommended",
  shuffle: true,
};

const recommendedFocus: PracticeFocusOption = {
  id: "recommended",
  label: "Recommended mix",
  description: "AIdioma chooses an appropriate variety for your current level.",
};

const laterActivity = (
  id: ActivityCapability["id"],
  label: string,
  reason: string,
): ActivityCapability => ({ id, label, reason, status: "unavailable" });

export const practiceSetFixtures: PracticeSetFixture[] = [
  {
    id: "intermediate-restaurant",
    slug: "restaurant-spanish",
    title: "Restaurant Spanish",
    description: "Order, explain a mistake, discuss a previous visit, and resolve problems politely.",
    level: "Foundation–B1",
    facets: ["Situations", "Topics", "Phrases"],
    activities: [
      { id: "type", label: "Type", status: "available" },
      laterActivity("conversation", "Conversation", "A reviewed branching restaurant scenario is not in this pilot."),
      laterActivity("flashcards", "Flashcards", "This situation collection has no reviewed standalone card backs."),
    ],
    defaultConfiguration,
    focuses: [
      recommendedFocus,
      {
        id: "completed-past",
        label: "Completed past",
        description: "Explain completed restaurant events using the preterite.",
      },
      {
        id: "time-phrases",
        label: "Time phrases",
        description: "Place restaurant actions in time and express recent actions.",
      },
      {
        id: "connectors",
        label: "Connectors",
        description: "Connect and qualify an account of a restaurant experience.",
      },
    ],
    support: "Current intermediate scope: past visits, mistakes, recent actions, and connected complaints. Polite phrases remain available as support.",
    prompts: [
      {
        id: "restaurant-foundation-bill",
        level: "foundation",
        focus: ["time-phrases"],
        difficulty: 1,
        grammarTags: ["formula.courtesy"],
        capability: "Ask for the bill politely",
        cue: "You are ready to leave. Ask the server for the bill politely.",
        english: "The bill, please.",
        spanish: "La cuenta, por favor.",
        answers: {
          spanish: {
            target: ["La cuenta, por favor.", "¿Me trae la cuenta, por favor?"],
            communicative: ["Quiero pagar, por favor."],
          },
          english: {
            target: ["The bill, please.", "Could you bring me the bill, please?"],
            communicative: ["I would like to pay, please."],
          },
        },
      },
      {
        id: "restaurant-past-mistake",
        level: "intermediate",
        focus: ["completed-past"],
        difficulty: 3,
        grammarTags: ["preterite.irregular", "pronoun.io"],
        capability: "Recount a completed restaurant mistake",
        cue: "Tell the server what happened earlier. Make the completed past event explicit.",
        english: "Yesterday I ordered soup, but they brought me a salad.",
        spanish: "Ayer pedí sopa, pero me trajeron una ensalada.",
        answers: {
          spanish: {
            target: [
              "Ayer pedí sopa, pero me trajeron una ensalada.",
              "Pedí sopa ayer, pero me trajeron una ensalada.",
              "Ayer pedí sopa, pero me trajeron ensalada.",
            ],
            communicative: ["Quiero sopa, no ensalada.", "Pedí sopa."],
          },
          english: {
            target: ["Yesterday I ordered soup, but they brought me a salad."],
            communicative: ["I want soup, not salad.", "I ordered soup."],
          },
        },
      },
      {
        id: "restaurant-recent-bill",
        level: "intermediate",
        focus: ["time-phrases"],
        difficulty: 3,
        grammarTags: ["periphrasis.aspectual", "formula.courtesy"],
        capability: "Express a recent action with acabar de",
        cue: "Say that you have just finished, then ask for the bill.",
        english: "I just finished. The bill, please.",
        spanish: "Acabo de terminar. La cuenta, por favor.",
        answers: {
          spanish: {
            target: ["Acabo de terminar. La cuenta, por favor."],
            communicative: ["Terminé. La cuenta, por favor.", "La cuenta, por favor."],
          },
          english: {
            target: ["I just finished. The bill, please.", "I just finished. The check, please."],
            communicative: ["I finished. The bill, please.", "The bill, please."],
          },
        },
      },
      {
        id: "restaurant-connected-review",
        level: "intermediate",
        focus: ["completed-past", "connectors"],
        difficulty: 4,
        grammarTags: ["connector.discourse", "preterite.irregular"],
        capability: "Connect contrasting details in a past account",
        cue: "Give a balanced account of the meal using a connector for contrast.",
        english: "Although the food was good, the service was slow.",
        spanish: "Aunque la comida estuvo buena, el servicio fue lento.",
        answers: {
          spanish: {
            target: [
              "Aunque la comida estuvo buena, el servicio fue lento.",
              "La comida estuvo buena; sin embargo, el servicio fue lento.",
            ],
            communicative: ["La comida estuvo buena, pero el servicio fue lento."],
          },
          english: {
            target: [
              "Although the food was good, the service was slow.",
              "The food was good; however, the service was slow.",
            ],
            communicative: ["The food was good, but the service was slow."],
          },
        },
      },
    ],
  },
  {
    id: "intermediate-getting-around",
    slug: "getting-around",
    title: "Getting Around",
    description: "Locate destinations, understand directions, and explain where something happened.",
    level: "A2–B1",
    facets: ["Situations", "Topics", "Phrases"],
    activities: [
      { id: "type", label: "Type", status: "available" },
      laterActivity("conversation", "Conversation", "A reviewed navigation scenario is not in this pilot."),
    ],
    defaultConfiguration,
    focuses: [
      recommendedFocus,
      {
        id: "spatial-language",
        label: "Location & movement",
        description: "Practice position, distance, and movement through space.",
      },
      {
        id: "completed-past",
        label: "What happened there",
        description: "Explain a completed event at a particular place.",
      },
    ],
    support: "Current scope: aquí/acá, ahí, hacia, hasta, cerca de, lejos de, and practical direction phrases.",
    prompts: [
      {
        id: "around-turn-right",
        level: "foundation",
        focus: ["spatial-language"],
        difficulty: 2,
        grammarTags: ["imperative", "expression.place"],
        capability: "Give a simple direction",
        cue: "Direct someone at the next block.",
        english: "Turn right at the next block.",
        spanish: "Doble a la derecha en la próxima cuadra.",
        answers: {
          spanish: { target: ["Doble a la derecha en la próxima cuadra."], communicative: ["A la derecha en la próxima cuadra."] },
          english: { target: ["Turn right at the next block."], communicative: ["To the right at the next block."] },
        },
      },
      {
        id: "around-walked-toward",
        level: "intermediate",
        focus: ["spatial-language", "completed-past"],
        difficulty: 3,
        grammarTags: ["preterite.regular", "expression.place"],
        capability: "Combine movement and a completed event",
        cue: "Explain the direction you walked and where you stopped.",
        english: "I walked toward the station and stopped across from the bank.",
        spanish: "Caminé hacia la estación y paré enfrente del banco.",
        answers: {
          spanish: { target: ["Caminé hacia la estación y paré enfrente del banco."], communicative: ["Fui hacia la estación y paré frente al banco."] },
          english: { target: ["I walked toward the station and stopped across from the bank."], communicative: ["I went toward the station and stopped in front of the bank."] },
        },
      },
    ],
  },
  {
    id: "intermediate-time-habits-plans",
    slug: "time-habits-plans",
    title: "Time, Habits, and Plans",
    description: "Practice routines, recent actions, duration, deadlines, and near-future plans.",
    level: "A2–B1",
    facets: ["Topics", "Verbs", "Phrases"],
    activities: [
      { id: "type", label: "Type", status: "available" },
      { id: "flashcards", label: "Flashcards", status: "available" },
      laterActivity("story", "Story", "A reviewed time-sequenced passage is not in this pilot."),
    ],
    defaultConfiguration,
    focuses: [
      recommendedFocus,
      {
        id: "time-phrases",
        label: "Time phrases",
        description: "Practice frequency, recency, duration, and upcoming actions.",
      },
      {
        id: "completed-past",
        label: "Completed past",
        description: "Place completed events at a definite time.",
      },
    ],
    support: "Current scope: soler, acabar de, ir a, hace, dentro de, todavía, ya, siempre, and nunca.",
    prompts: [
      {
        id: "time-used-to",
        level: "intermediate",
        focus: ["time-phrases"],
        difficulty: 3,
        grammarTags: ["adverb", "periphrasis.modal-inf"],
        capability: "Express a customary action with soler",
        cue: "Describe something you usually do on Sundays.",
        english: "I usually cook on Sundays.",
        spanish: "Suelo cocinar los domingos.",
        answers: {
          spanish: {
            target: ["Suelo cocinar los domingos."],
            communicative: ["Normalmente cocino los domingos."],
          },
          english: { target: ["I usually cook on Sundays."], communicative: ["I normally cook on Sundays."] },
        },
      },
      {
        id: "time-about-to",
        level: "intermediate",
        focus: ["time-phrases"],
        difficulty: 3,
        grammarTags: ["periphrasis.aspectual"],
        capability: "Express an imminent action",
        cue: "Say that you are about to leave.",
        english: "I am about to leave.",
        spanish: "Estoy por salir.",
        answers: {
          spanish: { target: ["Estoy por salir.", "Estoy a punto de salir."], communicative: ["Voy a salir ahora."] },
          english: { target: ["I am about to leave."], communicative: ["I am going to leave now."] },
        },
      },
    ],
  },
  {
    id: "intermediate-stories-problems",
    slug: "stories-and-problems",
    title: "Stories and Explaining Problems",
    description: "Build connected accounts with time, existence, cause, contrast, and consequence.",
    level: "B1",
    facets: ["Topics", "Phrases", "Verbs"],
    activities: [
      { id: "type", label: "Type", status: "available" },
      laterActivity("story", "Story", "A reviewed connected passage is not in this pilot."),
    ],
    defaultConfiguration,
    focuses: [
      recommendedFocus,
      {
        id: "haber",
        label: "Haber in context",
        description: "Choose an existential form that matches the account.",
      },
      {
        id: "connectors",
        label: "Connectors",
        description: "Express cause, result, contrast, and concession.",
      },
      {
        id: "completed-past",
        label: "Completed past",
        description: "Narrate the events that moved the account forward.",
      },
    ],
    support: "Current scope: hay/había/hubo, completed events, and a small set of functional connectors.",
    prompts: [
      {
        id: "stories-no-trains",
        level: "intermediate",
        focus: ["haber", "connectors"],
        difficulty: 4,
        grammarTags: ["imperfect", "connector"],
        capability: "Explain a situation and its result",
        cue: "Explain why you arrived late using an existential form and a result connector.",
        english: "There were no trains, so I arrived late.",
        spanish: "No había trenes, así que llegué tarde.",
        answers: {
          spanish: { target: ["No había trenes, así que llegué tarde."], communicative: ["Llegué tarde porque no había trenes."] },
          english: { target: ["There were no trains, so I arrived late."], communicative: ["I arrived late because there were no trains."] },
        },
      },
      {
        id: "stories-event",
        level: "intermediate",
        focus: ["haber", "completed-past"],
        difficulty: 3,
        grammarTags: ["preterite.irregular", "verb.hay"],
        capability: "Use hubo for a bounded event",
        cue: "Report a completed event that occurred yesterday.",
        english: "There was an accident yesterday.",
        spanish: "Hubo un accidente ayer.",
        answers: {
          spanish: { target: ["Hubo un accidente ayer."], communicative: ["Ayer ocurrió un accidente."] },
          english: { target: ["There was an accident yesterday."], communicative: ["An accident happened yesterday."] },
        },
      },
    ],
  },
] satisfies PracticeSetFixture[];

const restaurantPromotion = loadPromotedPrototypePrompts(restaurantPromptsJson);
const restaurantFixture = practiceSetFixtures.find(
  (set) => set.id === "intermediate-restaurant",
);
if (!restaurantFixture || restaurantPromotion.collectionId !== restaurantFixture.id) {
  throw new Error("Restaurant prototype promotion does not match its collection");
}
restaurantFixture.prompts = mergePromotedPracticePrompts(
  restaurantFixture.prompts,
  restaurantPromotion,
  50,
);

for (const set of practiceSetFixtures) {
  set.prompts.forEach((prompt) => PracticePromptSchema.parse(prompt));
}
const allPromptIds = practiceSetFixtures.flatMap((set) => set.prompts.map((prompt) => prompt.id));
if (new Set(allPromptIds).size !== allPromptIds.length) {
  throw new Error("Prototype prompt IDs must be globally unique");
}

export const practiceDirectionLabels: Record<PracticeDirection, string> = {
  "en-es": "EN → ES",
  "es-en": "ES → EN",
  both: "Both",
};

export const practiceActivityLabels: Record<PracticeActivity, string> = {
  type: "Type",
  flashcards: "Flashcards",
};

export const practiceDifficultyLabels: Record<PracticeDifficulty, string> = {
  guided: "More support",
  standard: "Standard",
  stretch: "Less support",
};

export const prototypeLearnerStageLabels: Record<PrototypeLearnerStage, string> = {
  foundation: "Foundation",
  intermediate: "Intermediate",
};

export function describePracticeConfiguration(
  configuration: PracticeSetConfiguration,
  set: PracticeSetFixture,
) {
  const focus = set.focuses.find((option) => option.id === configuration.focus);
  return [
    practiceActivityLabels[configuration.activity],
    practiceDirectionLabels[configuration.direction],
    focus?.label ?? "Recommended mix",
    practiceDifficultyLabels[configuration.difficulty],
  ].join(" · ");
}

export function describePracticeOverrides(
  configuration: PracticeSetConfiguration,
  set: PracticeSetFixture,
) {
  const overrides: string[] = [];

  if (configuration.activity !== set.defaultConfiguration.activity) {
    overrides.push(practiceActivityLabels[configuration.activity]);
  }
  if (configuration.direction !== set.defaultConfiguration.direction) {
    overrides.push(`${practiceDirectionLabels[configuration.direction]} only`);
  }
  if (configuration.focus !== set.defaultConfiguration.focus) {
    const focus = set.focuses.find((option) => option.id === configuration.focus);
    if (focus) overrides.push(focus.label);
  }
  if (configuration.difficulty !== set.defaultConfiguration.difficulty) {
    overrides.push(practiceDifficultyLabels[configuration.difficulty]);
  }
  if (configuration.shuffle !== set.defaultConfiguration.shuffle) {
    overrides.push(configuration.shuffle ? "Varied order" : "Fixed order");
  }

  return overrides.length > 0 ? overrides.join(" · ") : null;
}

export function promptsForConfiguration(
  set: PracticeSetFixture,
  configuration: PracticeSetConfiguration,
  stage: PrototypeLearnerStage,
) {
  const stagePrompts =
    stage === "intermediate"
      ? [
          ...set.prompts.filter((prompt) => prompt.level === "intermediate"),
          ...set.prompts.filter((prompt) => prompt.level === "foundation"),
        ]
      : set.prompts.filter((prompt) => prompt.level === "foundation");
  const requestedFocus = configuration.focus;
  const focusedPrompts =
    requestedFocus === "recommended"
      ? stagePrompts
      : stagePrompts.filter((prompt) => prompt.focus.includes(requestedFocus));

  return focusedPrompts.length > 0 ? focusedPrompts : stagePrompts;
}

export function focusAvailableForStage(
  set: PracticeSetFixture,
  focus: PracticeFocus,
  stage: PrototypeLearnerStage,
) {
  if (focus === "recommended") return true;
  return set.prompts.some(
    (prompt) =>
      (stage === "intermediate" || prompt.level === "foundation") &&
      prompt.focus.includes(focus),
  );
}
