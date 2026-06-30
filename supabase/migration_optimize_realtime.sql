-- ============================================================
-- WhatsApp Chat Dashboard - Realtime Sync Performance Optimization
-- ============================================================

-- Alter conversations table to write full rows to Write-Ahead Log (WAL) on updates.
-- This ensures Supabase Realtime always streams the complete updated object.
ALTER TABLE conversations REPLICA IDENTITY FULL;
