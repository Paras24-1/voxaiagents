-- ============================================================
-- WhatsApp Chat Dashboard - Auto Follow-up RPC Function Migration
-- Run this inside your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jncmizoejeaclpnfxazg/sql/new
-- ============================================================

-- Create database function to query conversations that need follow-up
CREATE OR REPLACE FUNCTION get_pending_auto_followups(org_uuid UUID)
RETURNS TABLE (
  conversation_id UUID,
  phone_number TEXT,
  name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id AS conversation_id, c.phone_number, c.name
  FROM conversations c
  JOIN LATERAL (
    SELECT m.direction, m.timestamp
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.timestamp DESC
    LIMIT 1
  ) m ON true
  WHERE c.org_id = org_uuid
    AND m.direction = 'outgoing'
    -- Last message was sent > 12 hours ago
    AND m.timestamp < NOW() - INTERVAL '12 hours'
    -- Sanity check: Don't follow up with leads older than 3 days
    AND m.timestamp > NOW() - INTERVAL '72 hours'
    -- Verify the student only sent 1 message (the initial greeting trigger) and never replied since
    AND (
      SELECT COUNT(*)::INTEGER
      FROM messages msg
      WHERE msg.conversation_id = c.id 
        AND msg.direction = 'incoming'
    ) = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
