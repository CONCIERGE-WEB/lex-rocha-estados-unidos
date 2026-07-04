import { NextResponse } from "next/server";

import { adminSecret, emailsAdminPermitidos, lerGoogleOAuthConfig } from "@/lib/security/config";
import {
  obterInfoIdToken,
  trocarCodigoPorTokens,
  validarIdTokenAdmin,
} from "@/lib/security/google-oauth";
import {
  COOKIE_ADMIN,
  criarTokenSessao,
  opcoesCookieSessao,
} from "@/lib/security/session-token";

export const runtime = "nodejs";

const COOKIE_STATE = "lex_admin_oauth_state";

function redirectLogin(request: Request, erro: string) {
  const url = new URL("/admin/login", request.url);
  url.searchParams.set("erro", erro);
  const res = NextResponse.redirect(url);
  res.cookies.delete(COOKIE_STATE);
  return res;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (searchParams.get("error")) return redirectLogin(request, "google");
  if (!code || !state) return redirectLogin(request, "codigo");

  const cookieState = request.headers
    .get("cookie")
    ?.split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${COOKIE_STATE}=`))
    ?.slice(COOKIE_STATE.length + 1);

  if (!cookieState || cookieState !== state) {
    return redirectLogin(request, "state");
  }

  const cfg = lerGoogleOAuthConfig();
  const secret = adminSecret();
  if (!cfg || !secret) return redirectLogin(request, "config");

  try {
    const { id_token } = await trocarCodigoPorTokens(cfg, code);
    if (!id_token) return redirectLogin(request, "token");

    const info = await obterInfoIdToken(id_token);
    const permitidos = emailsAdminPermitidos(process.env.ADMIN_EMAIL);
    const verificacao = validarIdTokenAdmin(info, cfg.clientId, permitidos);

    if (!verificacao.ok) return redirectLogin(request, "nao_autorizado");

    const token = await criarTokenSessao(verificacao.email, secret);
    const res = NextResponse.redirect(new URL("/admin", request.url));
    res.cookies.set(COOKIE_ADMIN, token, opcoesCookieSessao());
    res.cookies.delete(COOKIE_STATE);
    return res;
  } catch {
    return redirectLogin(request, "falha");
  }
}
