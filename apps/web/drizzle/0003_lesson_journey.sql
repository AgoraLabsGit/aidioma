CREATE TABLE IF NOT EXISTS "learner_lesson_progress" (
  "learner_id" text NOT NULL,
  "lesson_id" text NOT NULL,
  "profile" text NOT NULL,
  "status" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "checkpoint" jsonb NOT NULL,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "learner_lesson_progress_profile_check"
    CHECK ("profile" IN ('es-AR', 'es-419', 'es-ES')),
  CONSTRAINT "learner_lesson_progress_status_check"
    CHECK ("status" IN ('active', 'completed')),
  CONSTRAINT "learner_lesson_progress_revision_check" CHECK ("revision" > 0),
  CONSTRAINT "learner_lesson_progress_completion_check" CHECK (
    ("status" = 'active' AND "completed_at" IS NULL)
    OR ("status" = 'completed' AND "completed_at" IS NOT NULL)
  )
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "learner_lesson_progress_identity_unique"
  ON "learner_lesson_progress" ("learner_id", "lesson_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "learner_lesson_progress_learner_status_idx"
  ON "learner_lesson_progress" ("learner_id", "status");
