-- Add display_preferences column to profile table
ALTER TABLE profile ADD COLUMN IF NOT EXISTS display_preferences TEXT;
