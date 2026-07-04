export const COOKIE_ADMIN = "lex_admin_session";
export const SESSAO_MAX_MS = 12 * 60 * 60 * 1000;

export type SessionPayload = {
  sub: string;
  exp: number;
  iat: number;
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): string {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function assinar(secret: string, mensagem: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(mensagem));
  return toBase64Url(new Uint8Array(sig));
}

function assinaturasIguais(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function criarTokenSessao(sub: string, secret: string): Promise<string> {
  const iat = Date.now();
  const payload: SessionPayload = { sub, iat, exp: iat + SESSAO_MAX_MS };
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await assinar(secret, body);
  return `${body}.${sig}`;
}

export function extrairTokenCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const partes = cookieHeader.split(";").map((p) => p.trim());
  for (const parte of partes) {
    if (parte.startsWith(`${COOKIE_ADMIN}=`)) {
      return decodeURIComponent(parte.slice(COOKIE_ADMIN.length + 1));
    }
  }
  return null;
}

export async function validarTokenSessao(
  token: string | null | undefined,
  secret: string
): Promise<SessionPayload | null> {
  if (!token?.includes(".")) return null;

  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const esperado = await assinar(secret, body);
  if (!assinaturasIguais(sig, esperado)) return null;

  try {
    const payload = JSON.parse(fromBase64Url(body)) as SessionPayload;
    if (!payload.sub || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function opcoesCookieSessao(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSAO_MAX_MS / 1000),
  };
}
