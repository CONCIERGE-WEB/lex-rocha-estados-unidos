import type { GoogleOAuthConfig } from "@/lib/security/config";
import { emailsAdminPermitidos } from "@/lib/security/config";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_TOKENINFO = "https://oauth2.googleapis.com/tokeninfo";

export type GoogleIdTokenInfo = {
  aud: string;
  email?: string;
  email_verified?: string | boolean;
  exp: string;
  sub: string;
};

export function urlAutorizacaoGoogle(cfg: GoogleOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });
  return `${GOOGLE_AUTH}?${params.toString()}`;
}

export async function trocarCodigoPorTokens(
  cfg: GoogleOAuthConfig,
  code: string
): Promise<{ id_token?: string; access_token?: string }> {
  const res = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      redirect_uri: cfg.redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Google token ${res.status}: ${txt.slice(0, 200)}`);
  }

  return (await res.json()) as { id_token?: string; access_token?: string };
}

export async function obterInfoIdToken(idToken: string): Promise<GoogleIdTokenInfo> {
  const res = await fetch(`${GOOGLE_TOKENINFO}?id_token=${encodeURIComponent(idToken)}`);
  if (!res.ok) {
    throw new Error(`tokeninfo ${res.status}`);
  }
  return (await res.json()) as GoogleIdTokenInfo;
}

export function emailVerificado(info: GoogleIdTokenInfo): boolean {
  return info.email_verified === true || info.email_verified === "true";
}

export function validarIdTokenAdmin(
  info: GoogleIdTokenInfo,
  clientId: string,
  allowedEmails: string[]
): { ok: true; email: string } | { ok: false; motivo: string } {
  if (info.aud !== clientId) {
    return { ok: false, motivo: "audience inválida" };
  }

  const exp = Number(info.exp);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) {
    return { ok: false, motivo: "token expirado" };
  }

  if (!info.email?.trim()) {
    return { ok: false, motivo: "email ausente" };
  }

  if (!emailVerificado(info)) {
    return { ok: false, motivo: "email não verificado" };
  }

  const email = info.email.trim().toLowerCase();
  const permitidos = allowedEmails.map((e) => e.toLowerCase());
  if (!permitidos.includes(email)) {
    return { ok: false, motivo: "email não autorizado" };
  }

  return { ok: true, email };
}

export function emailsPermitidosFromEnv(): string[] {
  return emailsAdminPermitidos(process.env.ADMIN_EMAIL);
}
