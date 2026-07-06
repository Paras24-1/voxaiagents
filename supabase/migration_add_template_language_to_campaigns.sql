-- ============================================================
-- WhatsApp Chat Dashboard - Campaigns Language Support Migration
-- ============================================================

-- Add template_language column to campaigns table to persist the language selected by the tenant.
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS template_language TEXT DEFAULT 'en';
