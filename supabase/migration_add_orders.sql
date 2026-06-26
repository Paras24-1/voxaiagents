-- ============================================================
-- WhatsApp Chat Dashboard - Order Status Notification Automation
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  reference_number TEXT NOT NULL UNIQUE,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_phone   TEXT,
  items            TEXT NOT NULL,
  total_amount     NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status           TEXT NOT NULL DEFAULT 'placed',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_org_id ON orders(org_id);
CREATE INDEX IF NOT EXISTS idx_orders_reference_number ON orders(reference_number);

-- RLS Configuration
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow service_role bypass for Next.js APIs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' AND policyname = 'Service role full access - orders'
    ) THEN
        CREATE POLICY "Service role full access - orders"
          ON orders FOR ALL USING (true);
    END IF;
END $$;

-- Enable Realtime for live order status boards
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
      WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) INTO table_in_pub;
    
    IF NOT table_in_pub THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE orders;
    END IF;
  END IF;
END $$;
