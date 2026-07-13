-- ============================================================
-- WhatsApp Chat Dashboard - Gemini API Key Customization Migration
-- Run this inside your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jncmizoejeaclpnfxazg/sql/new
-- ============================================================

-- Add gemini_api_key column to organization_settings table if it doesn't exist
ALTER TABLE organization_settings 
ADD COLUMN IF NOT EXISTS gemini_api_key TEXT DEFAULT NULL;
