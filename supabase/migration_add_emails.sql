-- ============================================================
-- WhatsApp Chat Dashboard - Email AI Agent Ticketing Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS emails (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  message_id       TEXT NOT NULL UNIQUE,
  from_email       TEXT NOT NULL,
  from_name        TEXT,
  to_email         TEXT NOT NULL,
  subject          TEXT NOT NULL,
  body_text        TEXT NOT NULL,
  ai_draft_reply   TEXT,
  status           TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'sent', 'ignored')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for faster queries
CREATE INDEX IF NOT EXISTS idx_emails_org_id ON emails(org_id);
CREATE INDEX IF NOT EXISTS idx_emails_message_id ON emails(message_id);

-- Enable Row Level Security (RLS)
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access bypass for Next.js APIs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'emails' AND policyname = 'Service role full access - emails'
    ) THEN
        CREATE POLICY "Service role full access - emails"
          ON emails FOR ALL USING (true);
    END IF;
END $$;

-- Enable Realtime for live dashboard inbox sync
DO $$
DECLARE
  pub_exists BOOLEAN;
  table_in_pub BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) INTO pub_exists;

  IF pub_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'emails'
    ) INTO table_in_pub;
    
    IF NOT table_in_pub THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE emails;
    END IF;
  END IF;
END $$;
