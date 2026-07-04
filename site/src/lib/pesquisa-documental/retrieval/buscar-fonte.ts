import {
  LEGISLACAO_POR_FUNDAMENTO,
  RETRIEVAL_MAX_CORPO_BYTES,
  RETRIEVAL_FETCH_TIMEOUT_MS,
} from "@/lib/pesquisa-documental/retrieval/config";
import { assertUrlPermitidaParaRetrieval } from "@/lib/pesquisa-documental/retrieval/allowlist";
import { RetrievalError } from "@/lib/pesquisa-documental/retrieval/errors";

export type ResultadoFetchFonte = {
  url: string;
  consultadoEm: string;
  trechoFonte: string;
  statusHttp: number;
};

function htmlParaTexto(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

export async function buscarFontePublica(
  url: string,
  fetchImpl: FetchFn = fetch
): Promise<ResultadoFetchFonte> {
  assertUrlPermitidaParaRetrieval(url);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RETRIEVAL_FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetchImpl(url, {
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9",
        "User-Agent": "LexRocha-Retrieval/1.0 (pesquisa documental; +https://lexrocha.com.br)",
      },
      redirect: "follow",
    });
  } catch (e) {
    clearTimeout(timeout);
    if (e instanceof Error && e.name === "AbortError") {
      throw new RetrievalError("TIMEOUT", `Timeout ao consultar ${url}`);
    }
    throw new RetrievalError(
      "HTTP_ERRO",
      `Falha de rede ao consultar ${url}: ${e instanceof Error ? e.message : String(e)}`
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new RetrievalError(
      "HTTP_ERRO",
      `HTTP ${response.status} ao consultar ${url}`
    );
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength === 0) {
    throw new RetrievalError("CORPO_VAZIO", `Resposta vazia de ${url}`);
  }
  if (buffer.byteLength > RETRIEVAL_MAX_CORPO_BYTES) {
    throw new RetrievalError(
      "CORPO_EXCESSIVO",
      `Resposta de ${url} excede ${RETRIEVAL_MAX_CORPO_BYTES} bytes`
    );
  }

  const raw = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  const trechoFonte = htmlParaTexto(raw).slice(0, 12_000);

  if (trechoFonte.length < 40) {
    throw new RetrievalError(
      "CORPO_VAZIO",
      `Conteúdo útil insuficiente após parse de ${url}`
    );
  }

  return {
    url,
    consultadoEm: new Date().toISOString(),
    trechoFonte,
    statusHttp: response.status,
  };
}

export async function buscarLegislacaoFundamento(
  fundamentoId: keyof typeof LEGISLACAO_POR_FUNDAMENTO,
  fetchImpl?: FetchFn
): Promise<ResultadoFetchFonte> {
  const meta = LEGISLACAO_POR_FUNDAMENTO[fundamentoId];
  return buscarFontePublica(meta.url, fetchImpl);
}
