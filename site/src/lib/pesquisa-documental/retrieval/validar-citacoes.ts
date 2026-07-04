import {
  normalizarUrlParaComparacao,
  urlPermitidaParaRetrieval,
} from "@/lib/pesquisa-documental/retrieval/allowlist";
import { RetrievalError } from "@/lib/pesquisa-documental/retrieval/errors";
import { extrairUrlsDeTexto } from "@/lib/pesquisa-documental/retrieval/extrair-urls";
import type { ResultadoValidacaoCitacoes } from "@/lib/pesquisa-documental/retrieval/schemas";

function normalizarLista(urls: string[]): Set<string> {
  return new Set(urls.map((u) => normalizarUrlParaComparacao(u)));
}

/**
 * Valida que URLs citadas no relatório gerado pertencem ao pacote de pesquisa.
 * URLs fora do pacote ou de domínio não permitido → status erro explícito.
 */
export function validarCitacoesRelatorio(params: {
  conteudoRelatorio: string;
  urlsAutorizadas: string[];
}): ResultadoValidacaoCitacoes {
  const autorizadas = normalizarLista(params.urlsAutorizadas);
  const citadas = extrairUrlsDeTexto(params.conteudoRelatorio);
  const naoAutorizadas: string[] = [];

  for (const url of citadas) {
    if (!urlPermitidaParaRetrieval(url)) {
      naoAutorizadas.push(url);
      continue;
    }
    const norm = normalizarUrlParaComparacao(url);
    if (!autorizadas.has(norm)) {
      naoAutorizadas.push(url);
    }
  }

  if (naoAutorizadas.length > 0) {
    return {
      status: "erro",
      urlsNaoAutorizadas: Array.from(new Set(naoAutorizadas)),
      mensagem:
        "O relatório citou URL(s) que não constam no pacote de pesquisa validado. Revise o rascunho ou inclua a fonte no pacote antes de enviar.",
    };
  }

  return {
    status: "ok",
    urlsEncontradas: citadas,
  };
}

export function assertCitacoesRelatorioValidas(params: {
  conteudoRelatorio: string;
  urlsAutorizadas: string[];
}): void {
  const resultado = validarCitacoesRelatorio(params);
  if (resultado.status === "erro") {
    throw new RetrievalError(
      "CITACAO_INVALIDA",
      `${resultado.mensagem} URLs: ${resultado.urlsNaoAutorizadas.join(", ")}`
    );
  }
}
