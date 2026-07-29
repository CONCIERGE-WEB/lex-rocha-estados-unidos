/**
 * Local report draft (Etapa 1 layouts + Etapa 2 corpus when present).
 * CourtListener sync is offline here — reads report-models/granted only.
 */
import {
  carregarLayoutRelatorio,
  faixaLayoutDePlano,
} from "@/lib/relatorio-templates/layouts-relatorio";
import {
  NOTA_ORDEM_BLOCOS,
  ROTULO_BLOCO_CONSUMER,
} from "@/lib/relatorio-templates/ordem-blocos-relatorio";
import { formatarPanoramaPraticoMarkdown } from "@/lib/relatorio-templates/panorama-pratico-resultados";
import type { CategoriaPipeline } from "@/lib/pipeline-confiavel/categorias";
import {
  CATEGORIA_LABELS,
  isCategoriaPipeline,
} from "@/lib/pipeline-confiavel/categorias";
import {
  ATRIBUICAO_COURTLISTENER,
  ATRIBUICAO_COURTLISTENER_DETALHE,
  DISCLAIMER_NAO_ENDORSO,
} from "@/lib/constants/credits";
import { SITE } from "@/lib/constants/site";
import {
  formatarCorpusMarkdown,
  resolverCorpusComFallbackFederal,
} from "@/lib/fontes-us/corpus-loader";
import { metaJurisdicaoCategoria } from "@/lib/pipeline-confiavel/jurisdicao-categorias";

export type ElaborarRelatorioInput = {
  plano?: string | null;
  categoria: string;
  nomeCliente?: string;
  empresa?: string;
  state?: string | null;
  resumoNarrativa?: string | null;
  determinacoesCuradas?: string[];
  faixaIndenizacaoObservada?: string | null;
  /** Cap precedents from local corpus (Essential 2 / Standard 5 / Premium 8). */
  maxPrecedentesCorpus?: number;
};

export type ElaborarRelatorioOutput = {
  markdown: string;
  faixa: ReturnType<typeof faixaLayoutDePlano>;
  layoutCarregado: boolean;
  corpusStatus: string | null;
  corpusStateUsado: string | null;
};

function maxPorFaixa(faixa: ReturnType<typeof faixaLayoutDePlano>): number {
  switch (faixa) {
    case "essential":
      return 2;
    case "premium":
      return 8;
    default:
      return 5;
  }
}

export function elaborarRelatorioRascunho(
  input: ElaborarRelatorioInput,
  cwd = process.cwd()
): ElaborarRelatorioOutput {
  const faixa = faixaLayoutDePlano(input.plano);
  const layout = carregarLayoutRelatorio(faixa, cwd);
  const catLabel = isCategoriaPipeline(input.categoria)
    ? CATEGORIA_LABELS[input.categoria as CategoriaPipeline]
    : input.categoria;

  const { corpus, usado, notaFallback } = resolverCorpusComFallbackFederal(
    input.categoria,
    input.state,
    cwd
  );

  const juris = metaJurisdicaoCategoria(input.categoria);

  const max =
    input.maxPrecedentesCorpus ?? maxPorFaixa(faixa);

  const header = [
    "# Consumer Rights Research Report",
    "",
    `- **Platform:** ${SITE.brandFull}`,
    `- **Plan:** ${faixa}`,
    `- **Category:** ${catLabel}`,
    juris
      ? `- **Jurisdiction level:** ${juris.nivel === "federal" ? "Federal" : "State-specific"} (${juris.disponibilidadeLabel})`
      : null,
    juris ? `- **Jurisdiction note:** ${juris.notaJurisdicao}` : null,
    input.nomeCliente ? `- **Requester:** ${input.nomeCliente}` : null,
    input.empresa ? `- **Company:** ${input.empresa}` : null,
    input.state ? `- **State (form):** ${input.state}` : null,
    usado ? `- **Corpus cell:** ${usado}` : null,
    "",
    `_${NOTA_ORDEM_BLOCOS}_`,
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const caso = [
    `## ${ROTULO_BLOCO_CONSUMER.CASE_UNDER_REVIEW}`,
    "",
    input.resumoNarrativa?.trim() ||
      "_Awaiting structured facts from the /request form._",
    "",
  ].join("\n");

  const panorama = formatarPanoramaPraticoMarkdown(
    {
      categoria: input.categoria,
      determinacoesCuradas: input.determinacoesCuradas,
      faixaIndenizacaoObservada: input.faixaIndenizacaoObservada,
      notaAmostra: corpus
        ? `Local corpus: ${corpus.total} item(s), status ${corpus.status}.`
        : null,
    },
    cwd
  );

  const precedentes = corpus
    ? [
        `## ${ROTULO_BLOCO_CONSUMER.PRECEDENTS}`,
        "",
        formatarCorpusMarkdown(corpus, max, notaFallback),
        "",
        `_${ATRIBUICAO_COURTLISTENER}_`,
        "",
      ].join("\n")
    : "";

  const layoutNote = layout
    ? ["## Layout (structure reference)", "", layout, ""].join("\n")
    : "";

  const atribuicao = [
    "## Data sources & attribution",
    "",
    ATRIBUICAO_COURTLISTENER_DETALHE,
    "",
    DISCLAIMER_NAO_ENDORSO,
    "",
    `Full credits: ${SITE.url.replace(/\/$/, "")}/credits`,
    "",
  ].join("\n");

  const markdown = [
    header,
    panorama,
    "",
    caso,
    precedentes,
    layoutNote,
    atribuicao,
  ].join("\n");

  return {
    markdown,
    faixa,
    layoutCarregado: Boolean(layout),
    corpusStatus: corpus?.status ?? null,
    corpusStateUsado: usado,
  };
}
