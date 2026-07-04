export { RetrievalError, type CodigoErroRetrieval } from "@/lib/pesquisa-documental/retrieval/errors";
export {
  DOMINIOS_RETRIEVAL_PERMITIDOS,
  LEGISLACAO_POR_FUNDAMENTO,
  RETRIEVAL_FETCH_TIMEOUT_MS,
} from "@/lib/pesquisa-documental/retrieval/config";
export {
  assertUrlPermitidaParaRetrieval,
  normalizarUrlParaComparacao,
  urlPermitidaParaRetrieval,
} from "@/lib/pesquisa-documental/retrieval/allowlist";
export {
  type PacotePesquisaDocumental,
  type PlanoDocumental,
  type ResultadoValidacaoCitacoes,
  pacotePesquisaDocumentalSchema,
} from "@/lib/pesquisa-documental/retrieval/schemas";
export { resolverPlanoDocumental } from "@/lib/pesquisa-documental/retrieval/plano";
export { extrairUrlsDeTexto } from "@/lib/pesquisa-documental/retrieval/extrair-urls";
export {
  assertCitacoesRelatorioValidas,
  validarCitacoesRelatorio,
} from "@/lib/pesquisa-documental/retrieval/validar-citacoes";
export {
  buscarFontePublica,
  buscarLegislacaoFundamento,
  type FetchFn,
  type ResultadoFetchFonte,
} from "@/lib/pesquisa-documental/retrieval/buscar-fonte";
export {
  montarPacotePesquisaDocumentalBasico,
  enriquecerPacoteComFetch,
  prepararPacotePesquisaDocumental,
} from "@/lib/pesquisa-documental/retrieval/montar-pacote";
export { montarBlocoPacoteParaClaude } from "@/lib/pesquisa-documental/retrieval/contexto-geracao";
