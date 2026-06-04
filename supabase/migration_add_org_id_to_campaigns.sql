-- ============================================================
-- WhatsApp Chat Dashboard - Campaigns Multi-Tenant Migration
-- Run this inside your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ybplmzuygurbkqsbqfmn/sql/new
-- ============================================================

-- 1. Add org_id to campaigns table if it doesn't exist
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS org_id UUID;

-- 2. Add org_id to campaign_contacts table if it doesn't exist
ALTER TABLE campaign_contacts 
ADD COLUMN IF NOT EXISTS org_id UUID;

-- 3. Create indexes to speed up multi-tenant queries and ensure security
CREATE INDEX IF NOT EXISTS idx_campaigns_org_id ON campaigns(org_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_org_id ON campaign_contacts(org_id);
