import type { FundamentoId } from "@/lib/constants/pesquisa-documental";

import { assertUrlPermitidaParaRetrieval } from "@/lib/pesquisa-documental/retrieval/allowlist";
import {
  type FetchFn,
  buscarFontePublica,
  buscarLegislacaoFundamento,
} from "@/lib/pesquisa-documental/retrieval/buscar-fonte";
import { LEGISLACAO_POR_FUNDAMENTO } from "@/lib/pesquisa-documental/retrieval/config";
import { RetrievalError } from "@/lib/pesquisa-documental/retrieval/errors";
import { extrairUrlsDeTexto } from "@/lib/pesquisa-documental/retrieval/extrair-urls";
import { resolverPlanoDocumental } from "@/lib/pesquisa-documental/retrieval/plano";
import {
  type ItemLegislacaoPacote,
  type ItemPrecedentePacote,
  type PacotePesquisaDocumental,
  pacotePesquisaDocumentalSchema,
} from "@/lib/pesquisa-documental/retrieval/schemas";

function resumoPorUrl(texto: string, url: string): string {
  const linhas = texto.split(/\n+/);
  for (const linha of linhas) {
    if (linha.includes(url)) {
      const semUrl = linha.replace(url, "").replace(/^[\s\-•*]+/, "").trim();
      if (semUrl.length >= 10) return semUrl;
    }
  }
  return "Resumo do precedente conforme pesquisa do operador (conferir fonte na URL).";
}

function montarItensPrecedentes(texto: string): ItemPrecedentePacote[] {
  const urls = extrairUrlsDeTexto(texto);
  if (urls.length === 0) {
    return [];
  }

  return urls.map((url) => {
    assertUrlPermitidaParaRetrieval(url);
    return {
      url,
      resumoOperador: resumoPorUrl(texto, url),
    };
  });
}

function montarItensLegislacao(fundamentosIds: FundamentoId[]): ItemLegislacaoPacote[] {
  const vistos = new Set<string>();
  const itens: ItemLegislacaoPacote[] = [];

  for (const id of fundamentosIds) {
    const meta = LEGISLACAO_POR_FUNDAMENTO[id];
    if (vistos.has(meta.url)) continue;
    vistos.add(meta.url);
    assertUrlPermitidaParaRetrieval(meta.url);
    itens.push({
      fundamentoId: id,
      titulo: meta.titulo,
      url: meta.url,
      artigoRef: meta.artigoRef,
    });
  }

  return itens;
}

export type EntradaMontarPacote = {
  precedentesTexto: string;
  fundamentosIds: FundamentoId[];
  /** Default true quando há ao menos 1 precedente com URL permitida. */
  temPrecedenteComparavel?: boolean;
};

export function montarPacotePesquisaDocumentalBasico(
  entrada: EntradaMontarPacote
): PacotePesquisaDocumental {
  const precedentes = montarItensPrecedentes(entrada.precedentesTexto);
  const legislacao = montarItensLegislacao(entrada.fundamentosIds);

  const temComparavel =
    entrada.temPrecedenteComparavel ?? precedentes.length > 0;

  const plano = resolverPlanoDocumental({
    qtdPrecedentes: precedentes.length,
    qtdFundamentos: entrada.fundamentosIds.length,
    temPrecedenteComparavel: temComparavel,
  });

  const urlsAutorizadas = Array.from(
    new Set([
      ...precedentes.map((p) => p.url),
      ...legislacao.map((l) => l.url),
    ])
  );

  if (urlsAutorizadas.length === 0) {
    throw new RetrievalError(
      "PACOTE_INVALIDO",
      "Pacote de pesquisa exige ao menos uma URL de fonte pública permitida (precedente ou legislação)."
    );
  }

  const pacote: PacotePesquisaDocumental = {
    montadoEm: new Date().toISOString(),
    precedentes,
    legislacao,
    plano,
    urlsAutorizadas,
  };

  return pacotePesquisaDocumentalSchema.parse(pacote);
}

export async function enriquecerPacoteComFetch(
  pacote: PacotePesquisaDocumental,
  fetchImpl?: FetchFn
): Promise<PacotePesquisaDocumental> {
  const precedentes: ItemPrecedentePacote[] = [];
  for (const item of pacote.precedentes) {
    const fetch = await buscarFontePublica(item.url, fetchImpl);
    precedentes.push({
      ...item,
      consultadoEm: fetch.consultadoEm,
      trechoFonte: fetch.trechoFonte,
    });
  }

  const legislacao: ItemLegislacaoPacote[] = [];
  for (const item of pacote.legislacao) {
    const fetch = await buscarLegislacaoFundamento(item.fundamentoId, fetchImpl);
    legislacao.push({
      ...item,
      consultadoEm: fetch.consultadoEm,
      trechoFonte: fetch.trechoFonte,
    });
  }

  const enriquecido: PacotePesquisaDocumental = {
    ...pacote,
    precedentes,
    legislacao,
  };

  return pacotePesquisaDocumentalSchema.parse(enriquecido);
}

export async function prepararPacotePesquisaDocumental(
  entrada: EntradaMontarPacote & { enriquecerComFetch?: boolean },
  fetchImpl?: FetchFn
): Promise<PacotePesquisaDocumental> {
  const basico = montarPacotePesquisaDocumentalBasico(entrada);
  if (!entrada.enriquecerComFetch) {
    return basico;
  }
  return enriquecerPacoteComFetch(basico, fetchImpl);
}
