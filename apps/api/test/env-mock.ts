/**
 * Set Supabase (and other) env vars for tests so CI/deploy and test-all.sh pass
 * without requiring real Supabase credentials.
 */
process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.SUPABASE_URL =
  process.env.SUPABASE_URL || "https://test-project.supabase.co";
process.env.SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || "test-supabase-secret-key";
process.env.SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || "test-supabase-anon-key";
process.env.SUPABASE_JWT_SECRET =
  process.env.SUPABASE_JWT_SECRET || "test-jwt-secret";
