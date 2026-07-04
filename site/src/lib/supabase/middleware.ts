import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicEnv, isSupabaseConfigured } from "@/lib/supabase/config";
import { fetchWithTimeout } from "@/lib/supabase/http-fetch";
import type { Database } from "@/types/database";

/** Rotas B2C públicas — sem sessão Supabase Auth (evita round-trip em cada page view). */
export function rotaPublicaSemAuth(pathname: string): boolean {
  const publicExact = new Set([
    "/",
    "/solicitar",
    "/modelo-relatorio",
    "/parceiro",
    "/privacidade",
    "/termos",
    "/cookies",
    "/robots.txt",
    "/sitemap.xml",
  ]);
  if (publicExact.has(pathname)) return true;
  if (pathname.startsWith("/acompanhar")) return true;
  if (pathname === "/api/pesquisa-documental/solicitar") return true;
  if (pathname === "/api/lgpd/consent") return true;
  if (pathname.startsWith("/api/pedidos/acompanhar")) return true;
  if (pathname === "/api/stripe/webhook") return true;
  return false;
}

export async function updateSession(request: NextRequest) {
  if (rotaPublicaSemAuth(request.nextUrl.pathname)) {
    return NextResponse.next({ request });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  const { url, anonKey } = getSupabasePublicEnv();

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
    global: {
      fetch: (input, init) => fetchWithTimeout(input, { ...init, timeoutMs: 8_000 }),
    },
  });

  try {
    await supabase.auth.getUser();
  } catch {
    // Não bloquear navegação se o refresh de sessão falhar (rede/timeout).
  }

  return supabaseResponse;
}
