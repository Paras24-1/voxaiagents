-- ============================================================
-- WhatsApp Chat Dashboard - Feature Integration Migration
-- ============================================================
-- NOTE: We checked your current database schema. You already have
-- the assignment tables, columns for media, and assignment fields.
-- 
-- This script safely applies ONLY the missing parts:
-- 1. Adds the missing 'notes' column to the 'conversations' table.
-- 2. Adds the missing 'is_active' column to the 'users' table.
-- 3. Ensures 'conversation_id' in 'conversation_assignments' has a UNIQUE constraint
--    (required for the round-robin upsert on conflict).
-- ============================================================


-- 1. Add 'notes' column to 'conversations' table if it doesn't exist
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Add 'is_active' column to 'users' table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;


-- 2. Ensure 'conversation_id' in 'conversation_assignments' is UNIQUE
-- We do this safely by first checking if the constraint already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'conversation_assignments_conversation_id_key'
    ) THEN
        ALTER TABLE conversation_assignments 
        ADD CONSTRAINT conversation_assignments_conversation_id_key UNIQUE (conversation_id);
    END IF;
END $$;

-- 3. Enable Realtime publication for the tables if not already present
-- (Safe to run multiple times, handles duplicate checks internally)
DO $$
DECLARE
  pub_exists BOOLEAN;
  table_in_pub BOOLEAN;
BEGIN
  -- Check if supabase_realtime publication exists
  SELECT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) INTO pub_exists;

  IF pub_exists THEN
    -- Add conversation_assignments if not in publication
    SELECT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_assignments'
    ) INTO table_in_pub;
    
    IF NOT table_in_pub THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE conversation_assignments;
    END IF;

    -- Add assignment_logs if not in publication
    SELECT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'assignment_logs'
    ) INTO table_in_pub;
    
    IF NOT table_in_pub THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE assignment_logs;
    END IF;
  END IF;
END $$;
