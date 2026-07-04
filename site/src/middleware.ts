import { NextResponse, type NextRequest } from "next/server";

import { adminSecret, emailsAdminPermitidos } from "@/lib/security/config";
import { COOKIE_ADMIN, validarTokenSessao } from "@/lib/security/session-token";
import { rotaPublicaSemAuth, updateSession } from "@/lib/supabase/middleware";

const WORKSPACE_COOKIE = "lex_workspace";

async function adminAutorizado(request: NextRequest): Promise<boolean> {
  const secret = adminSecret();
  if (!secret) return false;
  const token = request.cookies.get(COOKIE_ADMIN)?.value;
  const sessao = await validarTokenSessao(token, secret);
  if (!sessao?.sub) return false;
  return emailsAdminPermitidos(process.env.ADMIN_EMAIL).includes(
    sessao.sub.trim().toLowerCase()
  );
}

function precisaProtegerAdmin(pathname: string): "pagina" | "api" | null {
  if (pathname === "/admin/login") return null;
  if (pathname.startsWith("/api/admin/auth")) return null;
  if (pathname === "/api/admin/logout") return null;
  if (pathname.startsWith("/api/admin")) return "api";
  if (pathname.startsWith("/admin")) return "pagina";
  return null;
}

function precisaProtegerWorkspace(pathname: string): boolean {
  if (pathname.startsWith("/pesquisa-documental/acesso")) return false;
  if (pathname.startsWith("/acompanhar")) return false;
  if (pathname.startsWith("/api/pedidos/acompanhar")) return false;
  if (pathname === "/api/pesquisa-documental/solicitar") return false;
  if (pathname.startsWith("/pesquisa-documental")) return true;
  if (pathname.startsWith("/api/pesquisa-documental")) return true;
  if (pathname.startsWith("/api/pedidos/fila")) return true;
  if (pathname.startsWith("/api/pedidos/testes")) return true;
  if (pathname.startsWith("/api/workspace")) return false;
  return false;
}

function registrarAcesso(request: NextRequest) {
  const chave =
    process.env.INTERNAL_LOG_SECRET ?? process.env.WORKSPACE_SECRET ?? "";
  if (!chave) return;

  const url = new URL("/api/lgpd/access-log", request.url);
  void fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-log": chave,
    },
    body: JSON.stringify({
      rota: request.nextUrl.pathname,
      metodo: request.method,
    }),
  }).catch(() => undefined);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const tipoAdmin = precisaProtegerAdmin(pathname);
  if (tipoAdmin && !(await adminAutorizado(request))) {
    if (tipoAdmin === "api") {
      return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const secret = process.env.WORKSPACE_SECRET;

  if (secret && precisaProtegerWorkspace(pathname)) {
    const cookie = request.cookies.get(WORKSPACE_COOKIE)?.value;
    if (cookie !== secret) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
      }
      const login = new URL("/pesquisa-documental/acesso", request.url);
      return NextResponse.redirect(login);
    }
  }

  if (!rotaPublicaSemAuth(pathname)) {
    registrarAcesso(request);
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
