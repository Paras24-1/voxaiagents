-- ============================================================
-- WhatsApp Chat Dashboard - Duplicate Conversations Cleanup
-- ============================================================
-- IMPORTANT: DO NOT RUN THIS WITHOUT A BACKUP!
-- How to backup: 
-- 1. Go to Supabase Dashboard -> Database -> Backups.
-- 2. Take a manual backup or ensure Point in Time Recovery (PITR) is active.
-- ============================================================

DO $$
DECLARE
    dup_record RECORD;
    primary_id UUID;
    dup_id UUID;
BEGIN
    -- Group conversations by org_id and the last 10 digits of the phone number
    FOR dup_record IN 
        SELECT org_id, RIGHT(REGEXP_REPLACE(phone_number, '\D', '', 'g'), 10) as clean_phone, array_agg(id ORDER BY created_at ASC) as conv_ids
        FROM conversations
        WHERE phone_number IS NOT NULL
        GROUP BY org_id, RIGHT(REGEXP_REPLACE(phone_number, '\D', '', 'g'), 10)
        HAVING COUNT(id) > 1
    LOOP
        -- The first ID in the array is the oldest (primary) conversation
        primary_id := dup_record.conv_ids[1];
        
        -- Loop through the rest of the IDs and merge their messages to the primary conversation
        FOR i IN 2 .. array_length(dup_record.conv_ids, 1) LOOP
            dup_id := dup_record.conv_ids[i];
            
            -- Re-assign messages
            UPDATE messages SET conversation_id = primary_id WHERE conversation_id = dup_id;
            
            -- Delete the duplicate conversation record
            DELETE FROM conversations WHERE id = dup_id;
        END LOOP;
    END LOOP;
END $$;

-- Optional: Create a unique index on the cleaned phone numbers to prevent future duplicates.
-- CREATE UNIQUE INDEX idx_unique_org_phone ON conversations (org_id, RIGHT(REGEXP_REPLACE(phone_number, '\D', '', 'g'), 10));
