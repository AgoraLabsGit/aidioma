/** Local sample content for the intermediate learner-experience prototype. */

export type IntermediatePilotLesson = {
  capabilities: string[];
  objective: string;
  slug: string;
  status: "available" | "outlined";
  title: string;
};

export type IntermediateLessonStep = {
  accepted: string[];
  capability: string;
  cue: string;
  explanation: string;
  id: string;
  modelAnswer: string;
  prompt: string;
  support: string;
  title: string;
};

export const intermediatePilotLessons: IntermediatePilotLesson[] = [
  {
    slug: "tell-what-happened",
    title: "Tell what happened",
    objective: "Narrate completed events using the preterite and clear past-time anchors.",
    capabilities: ["Completed events", "Preterite", "Past-time anchors"],
    status: "available",
  },
  {
    slug: "place-actions-in-time",
    title: "Place actions in time",
    objective: "Express habits, recent actions, duration, and upcoming actions.",
    capabilities: ["soler", "acabar de", "hace", "ir a"],
    status: "outlined",
  },
  {
    slug: "locate-and-direct",
    title: "Locate things and give directions",
    objective: "Describe position, distance, and movement through space.",
    capabilities: ["aquí/acá", "hacia/hasta", "Spatial relationships"],
    status: "outlined",
  },
  {
    slug: "existence-and-events",
    title: "Say what exists and what occurred",
    objective: "Choose among hay, había, hubo, and habrá for existential meaning.",
    capabilities: ["hay", "había", "hubo", "habrá"],
    status: "outlined",
  },
  {
    slug: "connect-and-qualify",
    title: "Connect and qualify ideas",
    objective: "Express sequence, cause, result, contrast, and concession.",
    capabilities: ["porque/por eso", "aunque", "sin embargo"],
    status: "outlined",
  },
];

export const tellWhatHappenedSteps: IntermediateLessonStep[] = [
  {
    id: "completed-action",
    title: "Mark a completed action",
    explanation: "Use the preterite when the event is presented as finished. A time anchor such as ayer makes the boundary especially clear.",
    support: "pedir → pedí · llegar → llegué · traer → trajeron",
    cue: "Complete the sentence with the preterite of pedir.",
    prompt: "Ayer yo ___ sopa.",
    modelAnswer: "Ayer yo pedí sopa.",
    accepted: ["Ayer yo pedí sopa.", "Ayer pedí sopa.", "pedí"],
    capability: "Use a preterite form for a completed event",
  },
  {
    id: "time-anchor",
    title: "Place the event in time",
    explanation: "Time phrases help the listener locate the event. They can come at the beginning or end without changing the core meaning.",
    support: "ayer · anteayer · la semana pasada · hace dos días",
    cue: "Say that you arrived late yesterday.",
    prompt: "Yesterday I arrived late.",
    modelAnswer: "Ayer llegué tarde.",
    accepted: ["Ayer llegué tarde.", "Llegué tarde ayer."],
    capability: "Anchor a completed event in past time",
  },
  {
    id: "restaurant-transfer",
    title: "Apply it in a restaurant",
    explanation: "A practical account often combines two completed events. The connector pero makes the mismatch clear without adding another grammar objective.",
    support: "pedí = I ordered · me trajeron = they brought me · pero = but",
    cue: "Tell the server what happened earlier.",
    prompt: "Yesterday I ordered soup, but they brought me a salad.",
    modelAnswer: "Ayer pedí sopa, pero me trajeron una ensalada.",
    accepted: [
      "Ayer pedí sopa, pero me trajeron una ensalada.",
      "Pedí sopa ayer, pero me trajeron una ensalada.",
    ],
    capability: "Recount connected completed events in a practical context",
  },
];

function normalizeAnswer(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesIntermediateLessonAnswer(
  step: IntermediateLessonStep,
  input: string,
) {
  const normalized = normalizeAnswer(input);
  return step.accepted.some((answer) => normalizeAnswer(answer) === normalized);
}
