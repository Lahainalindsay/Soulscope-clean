import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createAuthFetch } from "./auth-fetch";
let client: SupabaseClient | null = null;
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return (client ??= createClient(url, key, { global: { fetch: createAuthFetch() } }));
}
export async function accessToken() {
  const db = getSupabase();
  if (!db)
    throw new Error(
      "Account connection is not configured yet. You can still explore the design preview.",
    );
  const { data, error } = await db.auth.getSession();
  if (error || !data.session)
    throw new Error("Please sign in before starting a scan.");
  return data.session.access_token;
}
