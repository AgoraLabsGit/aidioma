import type { Metadata } from "next";

import { LessonCatalog } from "@/components/lesson-catalog";

export const metadata: Metadata = { title: "Lessons" };

export default function LessonsPage() {
  return <LessonCatalog />;
}
