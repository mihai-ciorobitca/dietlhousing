-- Store call_date as London wall-clock time (no timezone column).
-- Existing timestamptz values are converted to the local Europe/London clock time that instant represents.
ALTER TABLE "Contacts"
  ALTER COLUMN call_date TYPE timestamp without time zone
  USING (
    CASE
      WHEN call_date IS NULL THEN NULL
      ELSE timezone('Europe/London', call_date)
    END
  );

COMMENT ON COLUMN "Contacts".call_date IS 'Europe/London wall clock (YYYY-MM-DD HH:mm:ss). Not UTC.';
