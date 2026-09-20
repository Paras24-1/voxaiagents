-- ============================================================
-- WhatsApp Chat Dashboard - Feature: Osmo RO Categorization
-- ============================================================

-- Add osmo_category column to leads table
-- Default is 'unfiltered'
ALTER TABLE leads ADD COLUMN IF NOT EXISTS osmo_category TEXT DEFAULT 'unfiltered';
