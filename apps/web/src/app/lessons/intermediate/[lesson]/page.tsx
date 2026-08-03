import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IntermediateLessonPilot } from "@/components/intermediate-lesson-pilot";

export const metadata: Metadata = { title: "Tell what happened · Intermediate pilot" };

export default async function IntermediateLessonPage({
  params,
}: {
  params: Promise<{ lesson: string }>;
}) {
  const { lesson } = await params;
  if (lesson !== "tell-what-happened") notFound();

  return <IntermediateLessonPilot />;
}
