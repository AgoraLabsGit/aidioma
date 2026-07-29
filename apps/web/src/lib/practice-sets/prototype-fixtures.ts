/**
 * PROTOTYPE ONLY. These records exercise the Practice Sets interaction model.
 * They are not reviewed content and must not be copied into content/practice-sets.
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
export type PracticeDifficulty = "guided" | "standard" | "challenge";
export type VerbTense = "all" | "present" | "preterite" | "imperative";
export type VerbPerson =
  | "all"
  | "first-singular"
  | "second-singular"
  | "third-singular"
  | "first-plural"
  | "third-plural";
export type VerbDrill = "meaning" | "recognize" | "produce" | "context";

export type PracticeSetConfiguration = {
  activity: PracticeActivity;
  difficulty: PracticeDifficulty;
  direction: PracticeDirection;
  drill: VerbDrill;
  person: VerbPerson;
  shuffle: boolean;
  size: 5 | 10 | 15;
  tense: VerbTense;
};

type ActivityCapability = {
  id: "type" | "flashcards" | "quiz" | "sentences" | "story" | "conversation";
  label: string;
  reason?: string;
  status: "available" | "unavailable";
};

export type PracticeSetFixture = {
  activities: ActivityCapability[];
  defaultConfiguration: PracticeSetConfiguration;
  description: string;
  facets: PracticeSetFacet[];
  id: string;
  level: string;
  preview: {
    answer: string;
    cue: string;
    english: string;
    spanish: string;
  };
  slug: string;
  targetCount: number;
  title: string;
};

const defaultConfiguration: PracticeSetConfiguration = {
  activity: "type",
  difficulty: "standard",
  direction: "both",
  drill: "context",
  person: "all",
  shuffle: true,
  size: 10,
  tense: "all",
};

const laterActivity = (
  id: ActivityCapability["id"],
  label: string,
  reason: string,
): ActivityCapability => ({ id, label, reason, status: "unavailable" });

export const practiceSetFixtures: PracticeSetFixture[] = [
  {
    id: "prototype-set-essential-verbs-v1",
    slug: "essential-verbs",
    title: "Essential Verbs",
    description: "High-utility verbs across meaning, form recognition, production, and context.",
    level: "A1–A2",
    facets: ["Verbs", "Vocabulary"],
    targetCount: 36,
    activities: [
      { id: "type", label: "Type", status: "available" },
      { id: "flashcards", label: "Flashcards", status: "available" },
      laterActivity("quiz", "Quiz", "Needs a reviewed distractor set."),
      laterActivity("sentences", "Sentences", "Needs reviewed contextual sentences."),
    ],
    defaultConfiguration,
    preview: {
      english: "I am",
      spanish: "soy",
      cue: "Produce the present first-person form of ser.",
      answer: "soy",
    },
  },
  {
    id: "prototype-set-everyday-phrases-v1",
    slug: "everyday-phrases",
    title: "Everyday Phrases",
    description: "Compact phrases for greetings, politeness, clarification, and small talk.",
    level: "A1",
    facets: ["Phrases", "Situations"],
    targetCount: 24,
    activities: [
      { id: "type", label: "Type", status: "available" },
      { id: "flashcards", label: "Flashcards", status: "available" },
      laterActivity("conversation", "Conversation", "Needs a reviewed branching scenario."),
    ],
    defaultConfiguration,
    preview: {
      english: "Excuse me",
      spanish: "Disculpe",
      cue: "Use the polite phrase you would say to get someone’s attention.",
      answer: "Disculpe",
    },
  },
  {
    id: "prototype-set-core-vocabulary-v1",
    slug: "core-vocabulary",
    title: "Core Vocabulary",
    description: "A compact, frequency-informed mix of common nouns, adjectives, and connectors.",
    level: "A1",
    facets: ["Vocabulary"],
    targetCount: 40,
    activities: [
      { id: "type", label: "Type", status: "available" },
      { id: "flashcards", label: "Flashcards", status: "available" },
      laterActivity("quiz", "Quiz", "Needs reviewed distractors for every target."),
    ],
    defaultConfiguration,
    preview: {
      english: "always",
      spanish: "siempre",
      cue: "Translate the frequency word.",
      answer: "siempre",
    },
  },
  {
    id: "prototype-set-food-v1",
    slug: "food",
    title: "Food",
    description: "Ingredients, meals, preferences, and useful food descriptions.",
    level: "A1–A2",
    facets: ["Topics", "Vocabulary"],
    targetCount: 28,
    activities: [
      { id: "type", label: "Type", status: "available" },
      { id: "flashcards", label: "Flashcards", status: "available" },
      laterActivity("story", "Story", "Needs a reviewed passage and segment answers."),
    ],
    defaultConfiguration,
    preview: {
      english: "bread",
      spanish: "el pan",
      cue: "Include the article.",
      answer: "el pan",
    },
  },
  {
    id: "prototype-set-restaurant-v1",
    slug: "ordering-at-a-restaurant",
    title: "Ordering at a Restaurant",
    description: "Goal-focused language for ordering, changing a dish, and asking for the bill.",
    level: "A1–A2",
    facets: ["Situations", "Topics", "Phrases"],
    targetCount: 18,
    activities: [
      { id: "type", label: "Type", status: "available" },
      laterActivity(
        "flashcards",
        "Flashcards",
        "This prototype set has no reviewed standalone card backs.",
      ),
      laterActivity("conversation", "Conversation", "Needs a reviewed restaurant scenario."),
    ],
    defaultConfiguration: { ...defaultConfiguration, activity: "type" },
    preview: {
      english: "The bill, please.",
      spanish: "La cuenta, por favor.",
      cue: "Ask politely when you are ready to pay.",
      answer: "La cuenta, por favor.",
    },
  },
];

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
  guided: "Guided",
  standard: "Standard",
  challenge: "Challenge",
};

export const verbTenseLabels: Record<VerbTense, string> = {
  all: "All forms",
  present: "Present",
  preterite: "Preterite",
  imperative: "Imperative",
};

export const verbPersonLabels: Record<VerbPerson, string> = {
  all: "All persons",
  "first-singular": "I · yo",
  "second-singular": "You · tú",
  "third-singular": "He/she · él/ella",
  "first-plural": "We · nosotros",
  "third-plural": "They · ellos/ellas",
};

export const verbDrillLabels: Record<VerbDrill, string> = {
  meaning: "Meaning",
  recognize: "Recognize form",
  produce: "Produce form",
  context: "Mixed context",
};

export function describePracticeConfiguration(
  configuration: PracticeSetConfiguration,
  isVerbSet: boolean,
) {
  const parts = [
    practiceActivityLabels[configuration.activity],
    practiceDirectionLabels[configuration.direction],
    `${configuration.size} items`,
    practiceDifficultyLabels[configuration.difficulty],
  ];

  if (isVerbSet) {
    parts.push(
      verbTenseLabels[configuration.tense],
      verbPersonLabels[configuration.person],
      verbDrillLabels[configuration.drill],
    );
  }

  return parts.join(" · ");
}

export function verbPoolCapacity(configuration: PracticeSetConfiguration) {
  const tenseCapacity: Record<VerbTense, number> = {
    all: 36,
    present: 15,
    preterite: 10,
    imperative: 5,
  };
  const personCapacity: Record<VerbPerson, number> = {
    all: 36,
    "first-singular": 5,
    "second-singular": 5,
    "third-singular": 5,
    "first-plural": 5,
    "third-plural": 5,
  };

  if (configuration.tense === "imperative" && configuration.person === "first-singular") {
    return 0;
  }

  return Math.min(tenseCapacity[configuration.tense], personCapacity[configuration.person]);
}

export function validDirectionForVerbDrill(
  direction: PracticeDirection,
  drill: VerbDrill,
) {
  if (drill === "recognize") return direction === "es-en";
  if (drill === "produce") return direction === "en-es";
  return true;
}
