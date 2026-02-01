"use client";

import { createClient } from "@supabase/supabase-js";
// Database types will be generated with Supabase CLI
// For now, using basic types

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
