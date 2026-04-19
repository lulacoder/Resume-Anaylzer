-- Ensure only one chat session exists per (analysis_id, user_id)
-- and harden against concurrent session creation races.

WITH ranked_sessions AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY analysis_id, user_id
      ORDER BY created_at ASC, id ASC
    ) AS row_num
  FROM public.analysis_chat_sessions
)
DELETE FROM public.analysis_chat_sessions AS sessions
USING ranked_sessions
WHERE sessions.id = ranked_sessions.id
  AND ranked_sessions.row_num > 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'analysis_chat_sessions_analysis_user_key'
      AND conrelid = 'public.analysis_chat_sessions'::regclass
  ) THEN
    ALTER TABLE public.analysis_chat_sessions
      ADD CONSTRAINT analysis_chat_sessions_analysis_user_key
      UNIQUE (analysis_id, user_id);
  END IF;
END
$$;
