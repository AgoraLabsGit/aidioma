import type { Metadata } from "next";

import { PracticeWorkspace } from "@/components/practice-workspace";

export const metadata: Metadata = { title: "Practice" };

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string | string[] }>;
}) {
  const { lesson } = await searchParams;
  return <PracticeWorkspace initialLesson={lesson === "1"} />;
}
