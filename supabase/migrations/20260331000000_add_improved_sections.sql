-- Add improved_sections column to store AI-rewritten resume versions
ALTER TABLE public.analyses ADD COLUMN IF NOT EXISTS improved_sections jsonb;
