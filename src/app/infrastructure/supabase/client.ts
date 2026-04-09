import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseRpcClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url) {
    throw new Error("Missing SUPABASE_URL environment variable");
  }

  if (!secretKey) {
    throw new Error("Missing SUPABASE_SECRET_KEY environment variable");
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
