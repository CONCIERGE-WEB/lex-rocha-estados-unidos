/**
 * Regra geral: link_oficial prefere fonte primária do tribunal/Planalto
 * sobre agregadores (Jusbrasil, etc.). O usuário abre esse link para o inteiro teor.
 */

const AGREGADORES = [
  "jusbrasil.com.br",
  "escavador.com",
  "juit.io",
  "projuris.com.br",
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
  return AGREGADORES.some(
    (a) => host === a || host.endsWith(`.${a}`)
  );
}

/** Tribunal (.jus.br), Planalto e gov.br oficiais — não agregador. */
export function isFontePrimariaOficial(url: string): boolean {
  const host = hostnameDeUrl(url);
  if (!host) return false;
  if (isAgregadorJurisprudencia(url)) return false;
  return (
    host.endsWith(".jus.br") ||
    host === "planalto.gov.br" ||
    host.endsWith(".planalto.gov.br") ||
    host.endsWith(".gov.br")
  );
}

/**
 * Entre dois links candidatos, escolhe o oficial do tribunal/Planalto.
 * Se só um for primário, esse vence. Se ambos ou nenhum, mantém o preferido.
 */
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

/**
 * Normaliza link_oficial de uma ficha: se o atual for agregador e houver
 * alternativa oficial, troca. Caso contrário mantém.
 */
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
