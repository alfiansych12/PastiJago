-- Migration: add `code` column to `user_progress` to store project code snapshots
-- Run this in Supabase SQL editor or psql connected to your database

ALTER TABLE IF EXISTS public.user_progress
ADD COLUMN IF NOT EXISTS code jsonb;

-- Optional: add index for faster queries on nested keys if needed
-- CREATE INDEX IF NOT EXISTS idx_user_progress_code_gin ON public.user_progress USING gin (code);
