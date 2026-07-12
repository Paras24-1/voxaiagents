-- ============================================================
-- WhatsApp Chat Dashboard - Instagram DM Integration Migration
-- Run this inside your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jncmizoejeaclpnfxazg/sql/new
-- ============================================================

-- 1. Add platform column to conversations table if it doesn't exist
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'whatsapp';

-- 2. Add platform column to messages table if it doesn't exist
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'whatsapp';

-- 3. Create indexes to speed up queries
CREATE INDEX IF NOT EXISTS idx_conversations_platform ON conversations(platform);
CREATE INDEX IF NOT EXISTS idx_messages_platform ON messages(platform);
