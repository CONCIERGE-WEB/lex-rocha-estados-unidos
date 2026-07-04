export type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type SecurityConfigIssue = {
  campo: string;
  mensagem: string;
};

const CLIENT_ID_RE = /^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/i;
const CLIENT_SECRET_RE = /^GOCSPX-[A-Za-z0-9_-]+$/;

export function emailsAdminPermitidos(raw?: string): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function validarFormatoClientId(clientId: string): boolean {
  return CLIENT_ID_RE.test(clientId.trim());
}

export function validarFormatoClientSecret(secret: string): boolean {
  return CLIENT_SECRET_RE.test(secret.trim());
}

export function validarAdminSecret(secret: string): boolean {
  return secret.trim().length >= 16;
}

export function baseUrlApp(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export function redirectUriGoogleOAuth(): string {
  return `${baseUrlApp()}/api/admin/auth/google/callback`;
}

export function lerGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    redirectUri: redirectUriGoogleOAuth(),
  };
}

export function googleOAuthConfigurado(): boolean {
  const cfg = lerGoogleOAuthConfig();
  if (!cfg) return false;
  return (
    validarFormatoClientId(cfg.clientId) && validarFormatoClientSecret(cfg.clientSecret)
  );
}

export function adminSecret(): string | null {
  return process.env.ADMIN_SECRET?.trim() || null;
}

/** Validação de ambiente — útil em arranque e testes. */
export function auditarConfigSeguranca(
  env: Record<string, string | undefined> = process.env
): SecurityConfigIssue[] {
  const issues: SecurityConfigIssue[] = [];

  const secret = env.ADMIN_SECRET?.trim();
  if (!secret) {
    issues.push({ campo: "ADMIN_SECRET", mensagem: "ausente" });
  } else if (!validarAdminSecret(secret)) {
    issues.push({ campo: "ADMIN_SECRET", mensagem: "mínimo 16 caracteres" });
  }

  const emails = emailsAdminPermitidos(env.ADMIN_EMAIL);
  if (emails.length === 0) {
    issues.push({ campo: "ADMIN_EMAIL", mensagem: "ausente — necessário para OAuth Google" });
  }

  const clientId = env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();

  if (clientId || clientSecret) {
    if (!clientId) {
      issues.push({ campo: "GOOGLE_OAUTH_CLIENT_ID", mensagem: "ausente" });
    } else if (!validarFormatoClientId(clientId)) {
      issues.push({ campo: "GOOGLE_OAUTH_CLIENT_ID", mensagem: "formato inválido" });
    }

    if (!clientSecret) {
      issues.push({ campo: "GOOGLE_OAUTH_CLIENT_SECRET", mensagem: "ausente" });
    } else if (!validarFormatoClientSecret(clientSecret)) {
      issues.push({ campo: "GOOGLE_OAUTH_CLIENT_SECRET", mensagem: "formato inválido" });
    }
  }

  return issues;
}
