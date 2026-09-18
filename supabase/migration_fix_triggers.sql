-- ============================================================
-- Fix Trigger Conflicts & Multi-Tenant Constraint Specifications
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Fix handle_new_message to use (phone_number, org_id) conflict target
CREATE OR REPLACE FUNCTION handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert conversation with org_id
  INSERT INTO conversations (phone_number, org_id, name, last_message, unread_count, updated_at)
  VALUES (
    NEW.phone_number, 
    NEW.org_id, 
    NEW.phone_number, 
    NEW.message, 
    CASE WHEN NEW.direction = 'incoming' THEN 1 ELSE 0 END, 
    NOW()
  )
  ON CONFLICT (phone_number, org_id) DO UPDATE SET
    last_message  = NEW.message,
    updated_at    = NOW();

  -- Ensure lead record exists
  IF NEW.conversation_id IS NOT NULL THEN
    INSERT INTO leads (conversation_id, phone_number, name, org_id)
    VALUES (NEW.conversation_id, NEW.phone_number, NEW.phone_number, NEW.org_id)
    ON CONFLICT (conversation_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-apply trigger to messages
DROP TRIGGER IF EXISTS on_new_message ON messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION handle_new_message();


-- 2. Update protect_sync_data to allow explicit user stage reset to 'new'
CREATE OR REPLACE FUNCTION protect_sync_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Revert background sync overwrites ONLY when NEW.stage is completely NULL or empty string
  -- (allowing explicit 'new' stage assignments)
  IF (NEW.stage IS NULL OR NEW.stage = '') AND
     (NEW.notes IS NULL OR NEW.notes = '') THEN
     
     IF OLD.stage IS NOT NULL AND OLD.stage != '' THEN
       NEW.stage := OLD.stage;
     END IF;
     
     IF OLD.notes IS NOT NULL AND OLD.notes != '' THEN
       NEW.notes := OLD.notes;
     END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
