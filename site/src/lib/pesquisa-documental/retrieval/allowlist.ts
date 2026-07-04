import { DOMINIOS_RETRIEVAL_PERMITIDOS } from "@/lib/pesquisa-documental/retrieval/config";
import { RetrievalError } from "@/lib/pesquisa-documental/retrieval/errors";

function hostDeUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    throw new RetrievalError("URL_INVALIDA", `URL inválida para retrieval: "${url}"`);
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new RetrievalError("URL_INVALIDA", `Protocolo não permitido em "${url}"`);
  }

  return parsed.hostname.toLowerCase();
}

/** Normaliza URL para comparação de citações (sem hash, sem barra final). */
export function normalizarUrlParaComparacao(url: string): string {
  const parsed = new URL(url.trim());
  parsed.hash = "";
  let path = parsed.pathname.replace(/\/+$/, "") || "/";
  if (path !== "/" && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  parsed.pathname = path;
  return parsed.toString();
}

export function hostPermitidoParaRetrieval(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return DOMINIOS_RETRIEVAL_PERMITIDOS.some(
    (permitido) => host === permitido || host.endsWith(`.${permitido}`)
  );
}

export function urlPermitidaParaRetrieval(url: string): boolean {
  try {
    return hostPermitidoParaRetrieval(hostDeUrl(url));
  } catch {
    return false;
  }
}

export function assertUrlPermitidaParaRetrieval(url: string): void {
  const host = hostDeUrl(url);
  if (!hostPermitidoParaRetrieval(host)) {
    throw new RetrievalError(
      "URL_NAO_PERMITIDA",
      `Domínio não permitido para retrieval: ${host}. Use apenas fontes públicas cadastradas (tribunais, Planalto, CNJ, Jusbrasil, gov.br).`
    );
  }
}
