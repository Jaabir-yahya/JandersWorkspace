-- 2026-01-30: This migration is deprecated - use 20260202_fix_create_transaction_phase3.sql instead
-- Keeping this file for historical reference but it should not be applied to new databases

-- Drop the old function signature to avoid conflicts
DROP FUNCTION IF EXISTS create_transaction(uuid, uuid, text, text, jsonb);
