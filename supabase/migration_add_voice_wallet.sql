-- ============================================================
-- WhatsApp Chat Dashboard - Voice AI Wallet Integration
-- ============================================================
-- Safely add voice_wallet_credits to organizations table.
-- Credits are denominated in INR (Rupees).
-- ============================================================

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS voice_wallet_credits NUMERIC(10, 2) DEFAULT 0.00;

-- Optional helper to credit an organization (for manual billing admin reference)
-- Example usage: SELECT credit_voice_wallet('org-uuid-here', 500.00);
CREATE OR REPLACE FUNCTION credit_voice_wallet(
  p_org_id UUID,
  p_amount NUMERIC(10, 2)
)
RETURNS VOID AS $$
BEGIN
  UPDATE organizations
  SET voice_wallet_credits = COALESCE(voice_wallet_credits, 0.00) + p_amount
  WHERE id = p_org_id;
END;
$$ LANGUAGE plpgsql;
