-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR TO FIX THE 400 ERROR
-- This modification allows the 'completed_at' timestamp to be NULL.
-- NULL indicates that a trick is 'In Progress' but not yet 'Completed'.

ALTER TABLE user_tricks ALTER COLUMN completed_at DROP NOT NULL;
