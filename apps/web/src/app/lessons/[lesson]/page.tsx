import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LessonPracticePreview } from "@/components/lesson-practice-preview";

export const metadata: Metadata = { title: "Lesson 1 · Practice" };

export default async function LessonPracticePage({
  params,
}: {
  params: Promise<{ lesson: string }>;
}) {
  const { lesson } = await params;
  if (lesson !== "1") notFound();

  return <LessonPracticePreview />;
}
