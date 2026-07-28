DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'lessons_ordinal_unique'
      AND conrelid = 'lessons'::regclass
      AND contype = 'u'
      AND condeferrable
  ) THEN
    ALTER TABLE "lessons" DROP CONSTRAINT IF EXISTS "lessons_ordinal_unique";
    DROP INDEX IF EXISTS "lessons_ordinal_unique";
    ALTER TABLE "lessons"
      ADD CONSTRAINT "lessons_ordinal_unique"
      UNIQUE ("ordinal") DEFERRABLE INITIALLY DEFERRED;
  END IF;
END;
$$;
