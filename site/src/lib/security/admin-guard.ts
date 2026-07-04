import { adminSecret, emailsAdminPermitidos } from "@/lib/security/config";
import {
  extrairTokenCookie,
  validarTokenSessao,
  type SessionPayload,
} from "@/lib/security/session-token";

/** Verifica se o e-mail está na allowlist (ADMIN_EMAIL). */
export function emailAutorizado(email: string, allowed?: string[]): boolean {
  const permitidos = allowed ?? emailsAdminPermitidos(process.env.ADMIN_EMAIL);
  return permitidos.includes(email.trim().toLowerCase());
}

/** Lê e valida a sessão admin a partir do cookie da request. */
export async function sessaoAdminDeRequest(
  request: Request
): Promise<SessionPayload | null> {
  const secret = adminSecret();
  if (!secret) return null;

  const token = extrairTokenCookie(request.headers.get("cookie"));
  return validarTokenSessao(token, secret);
}

/** Valida sessão (token assinado e não expirado) E allowlist do e-mail. */
export async function adminAutenticado(request: Request): Promise<boolean> {
  const sessao = await sessaoAdminDeRequest(request);
  if (!sessao?.sub) return false;
  return emailAutorizado(sessao.sub);
}

export async function emailAdminDaRequest(request: Request): Promise<string | null> {
  const sessao = await sessaoAdminDeRequest(request);
  if (!sessao?.sub) return null;
  return emailAutorizado(sessao.sub) ? sessao.sub : null;
}
