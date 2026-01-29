import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || 'http://localhost:54321';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!key) {
  console.warn('SUPABASE key not set; local integration tests may fail.');
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false }
});
