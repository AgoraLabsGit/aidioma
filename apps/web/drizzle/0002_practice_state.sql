CREATE TABLE IF NOT EXISTS "practice_sessions" (
  "id" text PRIMARY KEY NOT NULL,
  "learner_id" text NOT NULL,
  "source_kind" text NOT NULL,
  "source_id" text NOT NULL,
  "source_version" text NOT NULL,
  "profile" text NOT NULL,
  "policy_version" text NOT NULL,
  "status" text NOT NULL,
  "revision" integer DEFAULT 1 NOT NULL,
  "checkpoint" jsonb NOT NULL,
  "paused_at" timestamp with time zone,
  "ended_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "practice_sessions_source_kind_check" CHECK ("source_kind" IN ('collection', 'lesson', 'saved')),
  CONSTRAINT "practice_sessions_profile_check" CHECK ("profile" IN ('es-AR', 'es-419', 'es-ES')),
  CONSTRAINT "practice_sessions_status_check" CHECK ("status" IN ('active', 'paused', 'ended')),
  CONSTRAINT "practice_sessions_revision_check" CHECK ("revision" > 0)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "practice_sessions_learner_status_idx"
  ON "practice_sessions" ("learner_id", "status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "practice_sessions_one_resumable_unique"
  ON "practice_sessions" ("learner_id") WHERE "status" IN ('active', 'paused');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "practice_attempts" (
  "id" text PRIMARY KEY NOT NULL,
  "session_id" text NOT NULL,
  "learner_id" text NOT NULL,
  "offer_ordinal" integer NOT NULL,
  "item_id" text NOT NULL,
  "content_version" integer NOT NULL,
  "concept_ids" jsonb NOT NULL,
  "activity" text NOT NULL,
  "answer" text NOT NULL,
  "verdict" text NOT NULL,
  "score" integer NOT NULL,
  "feedback" text NOT NULL,
  "eval_source" text NOT NULL,
  "model_used" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "practice_attempts_session_fk" FOREIGN KEY ("session_id")
    REFERENCES "practice_sessions" ("id") ON DELETE restrict,
  CONSTRAINT "practice_attempts_activity_check" CHECK ("activity" = 'typed-production'),
  CONSTRAINT "practice_attempts_verdict_check" CHECK ("verdict" IN ('correct', 'close', 'wrong')),
  CONSTRAINT "practice_attempts_eval_source_check" CHECK ("eval_source" IN ('comparison', 'ai')),
  CONSTRAINT "practice_attempts_score_check" CHECK ("score" BETWEEN 10 AND 100),
  CONSTRAINT "practice_attempts_offer_check" CHECK ("offer_ordinal" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "practice_attempts_session_offer_unique"
  ON "practice_attempts" ("session_id", "offer_ordinal");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "practice_attempts_learner_item_idx"
  ON "practice_attempts" ("learner_id", "item_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "learner_item_states" (
  "learner_id" text NOT NULL,
  "item_id" text NOT NULL,
  "confidence" integer DEFAULT 0 NOT NULL,
  "unresolved_misses" integer DEFAULT 0 NOT NULL,
  "seen_count" integer DEFAULT 0 NOT NULL,
  "due_at" timestamp with time zone,
  "last_attempt_at" timestamp with time zone,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "learner_item_states_confidence_check" CHECK ("confidence" BETWEEN 0 AND 1000),
  CONSTRAINT "learner_item_states_misses_check" CHECK ("unresolved_misses" >= 0),
  CONSTRAINT "learner_item_states_seen_check" CHECK ("seen_count" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "learner_item_states_identity_unique"
  ON "learner_item_states" ("learner_id", "item_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "learner_item_states_due_idx"
  ON "learner_item_states" ("learner_id", "due_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "saved_practice_items" (
  "learner_id" text NOT NULL,
  "item_id" text NOT NULL,
  "content_version" integer NOT NULL,
  "meaning_id" text NOT NULL,
  "source_kind" text NOT NULL,
  "source_id" text NOT NULL,
  "saved_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "saved_practice_items_source_kind_check" CHECK ("source_kind" IN ('collection', 'lesson', 'saved'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "saved_practice_items_identity_unique"
  ON "saved_practice_items" ("learner_id", "item_id");
