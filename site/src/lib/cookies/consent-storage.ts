import {
  CONSENT_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  VERSAO_POLITICA_PRIVACIDADE,
} from "@/lib/constants/lgpd";

export type ConsentPreferences = {
  necessary: true;
  analytics: boolean;
  version: string;
  decidedAt: string;
};

const STORAGE_KEY = "ji_us_consent";

export function getSessionId(): string {
  if (typeof document === "undefined") return "";

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (match) return match.split("=")[1] ?? "";

  const id = crypto.randomUUID();
  document.cookie = `${SESSION_COOKIE_NAME}=${id}; path=/; max-age=31536000; SameSite=Lax`;
  return id;
}

export function readConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentPreferences;
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean): ConsentPreferences {
  const prefs: ConsentPreferences = {
    necessary: true,
    analytics,
    version: VERSAO_POLITICA_PRIVACIDADE,
    decidedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage may be blocked; cookie still set below.
  }

  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(prefs))}; path=/; max-age=63072000; SameSite=Lax`;

  return prefs;
}

export async function syncConsentToServer(
  analytics: boolean,
  origem: "banner" | "configuracoes" = "banner",
  revogacao = false
): Promise<void> {
  const sessionId = getSessionId();
  if (!sessionId) return;

  try {
    await fetch("/api/lgpd/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        cookiesAnaliticos: analytics,
        origem,
        revogacao,
      }),
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    // Silent — local preferences remain valid
  }
}

export function hasConsentDecision(): boolean {
  const c = readConsent();
  return c?.version === VERSAO_POLITICA_PRIVACIDADE;
}
