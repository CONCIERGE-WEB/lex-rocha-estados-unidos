import { NextResponse } from "next/server";

import { lerGoogleOAuthConfig } from "@/lib/security/config";
import { urlAutorizacaoGoogle } from "@/lib/security/google-oauth";

export const runtime = "nodejs";

const COOKIE_STATE = "lex_admin_oauth_state";

export async function GET(request: Request) {
  const cfg = lerGoogleOAuthConfig();
  const loginUrl = new URL("/admin/login", request.url);

  if (!cfg) {
    loginUrl.searchParams.set("erro", "config");
    return NextResponse.redirect(loginUrl);
  }

  const state = crypto.randomUUID();
  const destino = urlAutorizacaoGoogle(cfg, state);

  const res = NextResponse.redirect(destino);
  res.cookies.set(COOKIE_STATE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
