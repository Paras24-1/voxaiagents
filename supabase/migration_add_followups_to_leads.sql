-- ============================================================
-- WhatsApp Chat Dashboard - Follow-up and Tenant Columns Migration
-- Run this inside your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ybplmzuygurbkqsbqfmn/sql/new
-- ============================================================

-- 1. Add org_id to conversations table if it doesn't exist
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS org_id UUID;

-- 2. Add org_id and follow-up columns to leads table if they don't exist
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS org_id UUID,
ADD COLUMN IF NOT EXISTS followup_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS followup_notes TEXT,
ADD COLUMN IF NOT EXISTS followup_notified BOOLEAN DEFAULT FALSE;

-- 3. Create indexes to speed up queries and ensure security
CREATE INDEX IF NOT EXISTS idx_conversations_org_id ON conversations(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON leads(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_followup_date ON leads(followup_date);
