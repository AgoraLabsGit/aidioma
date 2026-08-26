import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LearningWorkspace } from "@/components/learning-workspace";

export const metadata: Metadata = { title: "Lesson 1 · Living here" };

export default async function LessonPracticePage({
  params,
}: {
  params: Promise<{ lesson: string }>;
}) {
  const { lesson } = await params;
  if (lesson !== "1") notFound();

  return <LearningWorkspace />;
}
