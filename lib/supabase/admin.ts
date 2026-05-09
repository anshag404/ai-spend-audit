/**
 * lib/supabase/admin.ts
 * Supabase admin client using the service role key.
 *
 * ONLY use this in server-side code (API routes, server actions).
 * This client bypasses Row Level Security — never expose to the browser.
 *
 * Use cases:
 * - Writing audit rows (user is anonymous, RLS would block anon inserts)
 * - Writing lead rows
 * - Incrementing view counts
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Module-level singleton to avoid creating a new client on every request
let _adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function getAdminClient() {
  if (_adminClient) return _adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  _adminClient = createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _adminClient;
}
