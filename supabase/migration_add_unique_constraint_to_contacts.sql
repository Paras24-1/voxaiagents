-- ============================================================
-- WhatsApp Chat Dashboard - Campaign Contacts Unique Constraint Migration
-- Run this inside your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jncmizoejeaclpnfxazg/sql/new
-- ============================================================

-- 1. Clean up duplicate campaign contacts (keep the latest one) to prevent constraint failure
DELETE FROM campaign_contacts a USING (
  SELECT MIN(ctid) as ctid, campaign_id, phone
  FROM campaign_contacts 
  GROUP BY campaign_id, phone HAVING COUNT(*) > 1
) b
WHERE a.campaign_id = b.campaign_id 
  AND a.phone = b.phone 
  AND a.ctid <> b.ctid;

-- 2. Add unique constraint on (campaign_id, phone) to campaign_contacts if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'campaign_contacts_campaign_id_phone_key'
    ) THEN
        ALTER TABLE campaign_contacts 
        ADD CONSTRAINT campaign_contacts_campaign_id_phone_key UNIQUE (campaign_id, phone);
    END IF;
END $$;
