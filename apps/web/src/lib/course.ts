export type LessonStatus = "current" | "locked";

export type CourseLesson = {
  number: number;
  objective: string;
  status: LessonStatus;
  title: string;
};

export const a1Lessons: CourseLesson[] = [
  {
    number: 1,
    title: "Hola: greetings and introducing yourself",
    objective: "Greet someone and introduce yourself.",
    status: "current",
  },
  {
    number: 2,
    title: "Soy así: describing people",
    objective: "Describe people with matching adjectives.",
    status: "locked",
  },
  {
    number: 3,
    title: "Qué haces: saying what you do",
    objective: "Talk about everyday actions.",
    status: "locked",
  },
  {
    number: 4,
    title: "¿Dónde está?",
    objective: "Say where things and people are.",
    status: "locked",
  },
  {
    number: 5,
    title: "Being: identity vs. state",
    objective: "Contrast identity with a current state.",
    status: "locked",
  },
  {
    number: 6,
    title: "More actions: eating and living",
    objective: "Talk about eating, drinking, and everyday actions.",
    status: "locked",
  },
  {
    number: 7,
    title: "Family and what you have",
    objective: "Write about family and possessions.",
    status: "locked",
  },
  {
    number: 8,
    title: "Likes and interests",
    objective: "Share likes, dislikes, and interests.",
    status: "locked",
  },
  {
    number: 9,
    title: "Time, days, and the calendar",
    objective: "Tell the time and name days.",
    status: "locked",
  },
  {
    number: 10,
    title: "Daily routine",
    objective: "Describe a daily routine in order.",
    status: "locked",
  },
  {
    number: 11,
    title: "Plans and getting around",
    objective: "Talk about destinations and plans.",
    status: "locked",
  },
  {
    number: 12,
    title: "Wants, needs, and simple requests",
    objective: "Express wants, needs, and simple requests.",
    status: "locked",
  },
];
