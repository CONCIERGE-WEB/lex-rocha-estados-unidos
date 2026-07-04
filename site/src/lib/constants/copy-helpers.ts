import { SITE } from "@/lib/constants/site";

/** Substitui placeholders `{domain}`, `{essencial}`, etc. */
export function aplicarPlaceholders(
  texto: string,
  vars: Record<string, string | number>
): string {
  return Object.entries(vars).reduce(
    (acc, [chave, valor]) => acc.replaceAll(`{${chave}}`, String(valor)),
    texto
  );
}

export function copyComSite(
  texto: string,
  extra?: Record<string, string | number>
): string {
  return aplicarPlaceholders(texto, { domain: SITE.domain, ...extra });
}
