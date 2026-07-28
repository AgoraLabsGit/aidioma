CREATE TABLE IF NOT EXISTS "lessons" (
  "id" text PRIMARY KEY NOT NULL,
  "slug" text NOT NULL,
  "ordinal" integer NOT NULL,
  "level" text NOT NULL,
  "title" text NOT NULL,
  "objective" text NOT NULL,
  "grammar_focus" jsonb NOT NULL,
  "content_version" integer NOT NULL,
  "content_hash" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lessons_slug_unique" ON "lessons" USING btree ("slug");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lessons_ordinal_unique" ON "lessons" USING btree ("ordinal");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lesson_items" (
  "id" text PRIMARY KEY NOT NULL,
  "lesson_id" text NOT NULL,
  "kind" text NOT NULL,
  "payload" jsonb NOT NULL,
  "grammar_tags" jsonb NOT NULL,
  "difficulty" integer,
  "content_version" integer NOT NULL,
  "deprecated" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "lesson_items_lesson_id_lessons_id_fk"
    FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id")
    ON DELETE restrict ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lesson_items_lesson_id_idx" ON "lesson_items" USING btree ("lesson_id");
--> statement-breakpoint
CREATE OR REPLACE FUNCTION "prevent_lesson_item_reparenting"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."lesson_id" IS DISTINCT FROM OLD."lesson_id" THEN
    RAISE EXCEPTION 'authored item % cannot move from lesson % to lesson %',
      OLD."id", OLD."lesson_id", NEW."lesson_id";
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
DROP TRIGGER IF EXISTS "lesson_items_prevent_reparenting" ON "lesson_items";
--> statement-breakpoint
CREATE TRIGGER "lesson_items_prevent_reparenting"
BEFORE UPDATE ON "lesson_items"
FOR EACH ROW EXECUTE FUNCTION "prevent_lesson_item_reparenting"();
