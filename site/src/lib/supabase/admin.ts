import { createClient } from "@supabase/supabase-js";

import { fetchWithTimeout } from "@/lib/supabase/http-fetch";
import type { Database } from "@/types/database";

/**
 * Cliente com service role — usar APENAS em API Routes server-side.
 * Nunca importar em componentes client ou expor ao browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias."
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (input, init) =>
        fetchWithTimeout(input, { ...init, timeoutMs: 25_000, retries: 2 }),
    },
  });
}
