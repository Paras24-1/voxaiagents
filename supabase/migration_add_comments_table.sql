-- ============================================================
-- WhatsApp Chat Dashboard - Social Media Comments Table Migration
-- Run this inside your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jncmizoejeaclpnfxazg/sql/new
-- ============================================================

-- Create social_comments table
CREATE TABLE IF NOT EXISTS social_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  platform VARCHAR(50) DEFAULT 'instagram', -- 'instagram' or 'facebook'
  comment_id VARCHAR(255) UNIQUE, -- Meta's comment ID
  media_id VARCHAR(255), -- Meta's post/media ID
  username VARCHAR(100),
  user_avatar TEXT,
  comment_text TEXT,
  sentiment VARCHAR(20) DEFAULT 'neutral', -- 'positive', 'neutral', 'toxic'
  status VARCHAR(50) DEFAULT 'pending', -- 'replied', 'hidden', 'pending'
  ai_reply TEXT,
  dm_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexing for speed
CREATE INDEX IF NOT EXISTS idx_comments_org_id ON social_comments(org_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON social_comments(status);
