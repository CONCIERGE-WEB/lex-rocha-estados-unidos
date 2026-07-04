/**
 * U.S.: prefer official .gov / uscourts over legal aggregators.
 */

const AGREGADORES = [
  "justia.com",
  "casetext.com",
  "findlaw.com",
  "leagle.com",
  "law.cornell.edu",
  "jusbrasil.com.br",
] as const;

const SUFIXOS_PRIMARIOS = [
  "uscourts.gov",
  "ftc.gov",
  "consumerfinance.gov",
  "justice.gov",
  "supremecourt.gov",
] as const;

export function hostnameDeUrl(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function isAgregadorJurisprudencia(url: string): boolean {
  const host = hostnameDeUrl(url);
  if (!host) return false;
  return AGREGADORES.some((a) => host === a || host.endsWith(`.${a}`));
}

/** Official court or federal/state .gov — not aggregators. */
export function isFontePrimariaOficial(url: string): boolean {
  const host = hostnameDeUrl(url);
  if (!host) return false;
  if (isAgregadorJurisprudencia(url)) return false;
  if (SUFIXOS_PRIMARIOS.some((s) => host === s || host.endsWith(`.${s}`))) {
    return true;
  }
  return host.endsWith(".gov") && !host.includes("blog");
}

export function priorizarLinkOficial(params: {
  preferido: string;
  candidatoOficial?: string | null;
}): string {
  const { preferido, candidatoOficial } = params;
  if (!candidatoOficial?.trim()) return preferido;
  if (
    isFontePrimariaOficial(candidatoOficial) &&
    !isFontePrimariaOficial(preferido)
  ) {
    return candidatoOficial.trim();
  }
  if (
    isFontePrimariaOficial(candidatoOficial) &&
    isAgregadorJurisprudencia(preferido)
  ) {
    return candidatoOficial.trim();
  }
  return preferido;
}

export function resolverLinkOficialPreferido(
  linkAtual: string,
  alternativasOficiais: string[] = []
): { link: string; trocouPorOficial: boolean } {
  if (isFontePrimariaOficial(linkAtual) && !isAgregadorJurisprudencia(linkAtual)) {
    return { link: linkAtual, trocouPorOficial: false };
  }
  for (const alt of alternativasOficiais) {
    const escolhido = priorizarLinkOficial({
      preferido: linkAtual,
      candidatoOficial: alt,
    });
    if (escolhido !== linkAtual && isFontePrimariaOficial(escolhido)) {
      return { link: escolhido, trocouPorOficial: true };
    }
  }
  return { link: linkAtual, trocouPorOficial: false };
}
