-- ============================================================
-- WhatsApp Chat Dashboard - Tenant Feature Access Migration
-- Run this inside your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jncmizoejeaclpnfxazg/sql/new
-- ============================================================

-- Add access columns to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS has_orders_crm BOOLEAN DEFAULT FALSE;

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS has_comments_crm BOOLEAN DEFAULT FALSE;

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS has_emails_crm BOOLEAN DEFAULT FALSE;
