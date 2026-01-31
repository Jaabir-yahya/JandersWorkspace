import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_service_role_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

if (!key) {
  console.warn('SUPABASE key not set; local integration tests may fail.');
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false }
});
