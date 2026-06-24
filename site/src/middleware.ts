import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAIL ?? "").split(",").map((e) => e.trim());

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Só protege rotas /admin — tudo o resto passa livre
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Página de login é pública
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return response;
  } catch {
    // Em caso de erro não bloqueia o site
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = {
  // IMPORTANTE: só activa nas rotas /admin
  matcher: ["/admin/:path*"],
};
