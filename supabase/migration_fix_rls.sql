-- ============================================================
-- WhatsApp Chat Dashboard - Security Fix for RLS
-- ============================================================

-- Fix conversations
DROP POLICY IF EXISTS "Service role full access - conversations" ON conversations;
CREATE POLICY "Service role full access - conversations" ON conversations FOR ALL TO service_role USING (true);

-- Fix messages
DROP POLICY IF EXISTS "Service role full access - messages" ON messages;
CREATE POLICY "Service role full access - messages" ON messages FOR ALL TO service_role USING (true);

-- Fix leads
DROP POLICY IF EXISTS "Service role full access - leads" ON leads;
CREATE POLICY "Service role full access - leads" ON leads FOR ALL TO service_role USING (true);

-- Fix emails
DROP POLICY IF EXISTS "Service role full access - emails" ON emails;
CREATE POLICY "Service role full access - emails" ON emails FOR ALL TO service_role USING (true);

-- Fix orders
DROP POLICY IF EXISTS "Service role full access - orders" ON orders;
CREATE POLICY "Service role full access - orders" ON orders FOR ALL TO service_role USING (true);
