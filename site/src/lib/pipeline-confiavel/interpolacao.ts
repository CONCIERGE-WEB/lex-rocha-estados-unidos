import {
  ambienteExigeCitacoesConferidas,
  resolverAmbientePipeline,
  type AmbientePipeline,
} from "@/lib/pipeline-confiavel/ambiente";
import type { EntradaBancoPrecedentes } from "@/lib/pipeline-confiavel/banco/schemas";
import { anexarBlocoFontesConferencia } from "@/lib/pipeline-confiavel/blocos-fontes-fixos";
import {
  extrairDadosCobranca,
  extrairDadosNegativacao,
} from "@/lib/pipeline-confiavel/extrator";
import { PROMPT_SISTEMA_MONTAGEM_ROTA_A } from "@/lib/pipeline-confiavel/lexico-rota-a";
import { centavosParaReais } from "@/lib/pipeline-confiavel/validacoes";


export class BancoCitacoesNaoConferidasError extends Error {
  readonly codigo = "BANCO_CITACOES_NAO_CONFERIDAS" as const;
  constructor(categoria: string) {
    super(
      `Categoria "${categoria}" tem citacoes_conferidas=false. Geração de relatório de produção bloqueada.`
    );
    this.name = "BancoCitacoesNaoConferidasError";
  }
}

export function assertBancoPermitidoParaAmbiente(
  entrada: EntradaBancoPrecedentes,
  ambiente: AmbientePipeline = resolverAmbientePipeline()
): void {
  if (ambienteExigeCitacoesConferidas(ambiente) && !entrada.citacoes_conferidas) {
    throw new BancoCitacoesNaoConferidasError(entrada.categoria);
  }
}


export function notaDataCortePesquisa(entrada: EntradaBancoPrecedentes): string {
  return (
    `Pesquisa e fundamentação baseadas na legislação e precedentes vigentes em ${entrada.data_ultima_validacao}. ` +
    `Decisões ou alterações legislativas posteriores a essa data não foram incluídas.`
  );
}


/** @deprecated Preferir PROMPT_SISTEMA_MONTAGEM_ROTA_A */
export const PROMPT_SISTEMA_INTERPOLACAO_RESTRITO = PROMPT_SISTEMA_MONTAGEM_ROTA_A;

export type DadosNegativacaoInterpolacao = {
  nome_cliente: string;
  empresa_reclamada: string;
  data_negativacao: string;
  valor_negativado_centavos: number;
  ja_tentou_resolver_diretamente: boolean;
  canal_tentativa?: string;
  possui_comprovante_quitacao: boolean;
  motivo_alegado_pela_empresa?: string;
};

function preencherPlaceholders(
  molde: string,
  mapa: Record<string, string>
): string {
  return molde.replace(/\{\{(\w+)\}\}/g, (_, chave: string) => {
    if (chave in mapa) return mapa[chave];
    return "[DADO PENDENTE]";
  });
}

function blocoFundamentos(entrada: EntradaBancoPrecedentes): string {
  return entrada.fundamentos_legais
    .map(
      (f) =>
        `- ${f.dispositivo}: ${f.texto_resumido}${
          f.link_oficial ? ` (${f.link_oficial})` : ""
        }`
    )
    .join("\n");
}

function blocoJurisprudencia(entrada: EntradaBancoPrecedentes): string {
  return entrada.jurisprudencia
    .map(
      (j) =>
        `- ${j.tribunal} · ${j.numero_processo}: ${j.resultado_resumido} (${j.link_oficial})`
    )
    .join("\n");
}

function blocoReferencias(entrada: EntradaBancoPrecedentes): string {
  const refs: string[] = [];
  for (const f of entrada.fundamentos_legais) {
    if (f.link_oficial) refs.push(`${f.dispositivo}: ${f.link_oficial}`);
  }
  for (const j of entrada.jurisprudencia) {
    refs.push(`${j.numero_processo} (${j.tribunal}): ${j.link_oficial}`);
  }
  const lista = refs.map((r) => `- ${r}`).join("\n");
  return anexarBlocoFontesConferencia(lista).trimEnd();
}


/**
 * Narrativa factual apenas (dados do formulário).
 * Sem enquadramento jurídico do relato individual.
 */
export function montarResumoNarrativaNegativacao(
  dados: DadosNegativacaoInterpolacao
): string {
  const estruturado = extrairDadosNegativacao(dados);
  const valor = estruturado.valores[0]?.valorReais ?? "[DADO PENDENTE]";
  const data = estruturado.linha_do_tempo[0]?.valor ?? "[DADO PENDENTE]";
  return (
    `Em ${data}, o solicitante ${estruturado.nome_cliente} informou registro de negativação ` +
    `atribuído a ${estruturado.empresa_envolvida}, no valor de R$ ${valor}. ` +
    `Tentativa de resolução direta: ${estruturado.flags.tentativa_resolucao}. ` +
    `Comprovante de quitação informado: ${estruturado.flags.comprovante_quitacao}. ` +
    `Motivo alegado pela empresa (informado no formulário): ${estruturado.flags.motivo_alegado}.`
  );
}

/**
 * Motor de interpolação determinístico.
 * Claude (opcional, fora desta função) só pode reescrever fluidez do texto já montado.
 */
export function interpolarRelatorioNegativacao(params: {
  entradaBanco: EntradaBancoPrecedentes;
  dados: DadosNegativacaoInterpolacao;
  ambiente?: AmbientePipeline;
}): string {
  const { entradaBanco, dados } = params;
  assertBancoPermitidoParaAmbiente(
    entradaBanco,
    params.ambiente ?? resolverAmbientePipeline()
  );
  if (entradaBanco.categoria !== "fcra_credit_reporting") {
    throw new Error(
      `Banco category (${entradaBanco.categoria}) incompatible with FCRA credit-reporting interpolation.`
    );
  }

  const estruturado = extrairDadosNegativacao(dados);
  const mapa: Record<string, string> = {
    nome_cliente: dados.nome_cliente,
    empresa_reclamada: dados.empresa_reclamada,
    categoria_titulo: entradaBanco.titulo,
    data_negativacao: dados.data_negativacao,
    valor_negativado: centavosParaReais(dados.valor_negativado_centavos),
    tentativa_resolucao: estruturado.flags.tentativa_resolucao,
    comprovante_quitacao: estruturado.flags.comprovante_quitacao,
    resumo_narrativa: montarResumoNarrativaNegativacao(dados),
    bloco_linha_tempo: estruturado.linha_do_tempo
      .map((l) => `- ${l.rotulo}: ${l.valor}`)
      .join("\n"),
    bloco_fundamentos: blocoFundamentos(entradaBanco),
    bloco_jurisprudencia: blocoJurisprudencia(entradaBanco),
    bloco_referencias: blocoReferencias(entradaBanco),
    estat_fonte: entradaBanco.estatisticas.fonte,
    estat_procedencia: entradaBanco.estatisticas.percentual_procedencia_estimado,
    estat_faixa: entradaBanco.estatisticas.faixa_indenizacao_observada,
    estat_atualizacao: entradaBanco.estatisticas.ultima_atualizacao,
    versao_banco: entradaBanco.versao,
    nota_data_corte: notaDataCortePesquisa(entradaBanco),
  };

  return preencherPlaceholders(entradaBanco.texto_molde, mapa);
}

export type DadosCobrancaInterpolacao = {
  nome_cliente: string;
  empresa_reclamada: string;
  data_cobranca: string;
  valor_cobrado_centavos: number;
  tipo_cobranca: string;
  pagou_valor_cobrado: boolean;
  ja_tentou_resolver_diretamente: boolean;
  canal_tentativa?: string;
  outro_detalhe?: string;
};

export function montarResumoNarrativaCobranca(
  dados: DadosCobrancaInterpolacao
): string {
  const estruturado = extrairDadosCobranca(dados);
  const valor = estruturado.valores[0]?.valorReais ?? "[DADO PENDENTE]";
  const data = estruturado.linha_do_tempo[0]?.valor ?? "[DADO PENDENTE]";
  return (
    `On ${data}, requester ${estruturado.nome_cliente} reported a charge ` +
    `attributed to ${estruturado.empresa_envolvida}, type ${estruturado.flags.tipo_cobranca}, ` +
    `amount $${valor}. Paid disputed amount: ${estruturado.flags.pagou_valor_cobrado}. ` +
    `Tried to resolve directly: ${estruturado.flags.tentativa_resolucao}. ` +
    `Additional detail (up to 120 chars): ${estruturado.flags.outro_detalhe}.`
  );
}

export function interpolarRelatorioCobranca(params: {
  entradaBanco: EntradaBancoPrecedentes;
  dados: DadosCobrancaInterpolacao;
  ambiente?: AmbientePipeline;
}): string {
  const { entradaBanco, dados } = params;
  assertBancoPermitidoParaAmbiente(
    entradaBanco,
    params.ambiente ?? resolverAmbientePipeline()
  );
  if (entradaBanco.categoria !== "fdcpa_debt_collection") {
    throw new Error(
      `Banco category (${entradaBanco.categoria}) incompatible with FDCPA debt-collection interpolation.`
    );
  }

  const estruturado = extrairDadosCobranca(dados);
  const mapa: Record<string, string> = {
    nome_cliente: dados.nome_cliente,
    empresa_reclamada: dados.empresa_reclamada,
    categoria_titulo: entradaBanco.titulo,
    resumo_narrativa: montarResumoNarrativaCobranca(dados),
    bloco_linha_tempo: estruturado.linha_do_tempo
      .map((l) => `- ${l.rotulo}: ${l.valor}`)
      .join("\n"),
    bloco_fundamentos: blocoFundamentos(entradaBanco),
    bloco_jurisprudencia: blocoJurisprudencia(entradaBanco),
    bloco_referencias: blocoReferencias(entradaBanco),
    estat_fonte: entradaBanco.estatisticas.fonte,
    estat_procedencia: entradaBanco.estatisticas.percentual_procedencia_estimado,
    estat_faixa: entradaBanco.estatisticas.faixa_indenizacao_observada,
    estat_atualizacao: entradaBanco.estatisticas.ultima_atualizacao,
    versao_banco: entradaBanco.versao,
    nota_data_corte: notaDataCortePesquisa(entradaBanco),
  };

  return preencherPlaceholders(entradaBanco.texto_molde, mapa);
}

/**
 * Valida que um texto "reescrito" pela IA não introduziu citações novas.
 * Usado antes de aceitar saída de Claude no Módulo 3.
 */
export function textoReescritoRespeitaFonte(
  textoOriginal: string,
  textoReescrito: string
): { ok: boolean; motivo?: string } {
  const extrair = (t: string): { urls: string[]; processos: string[] } => ({
    urls: t.match(/https?:\/\/[^\s)]+/g) ?? [],
    processos:
      t.match(
        /\bSúmula\s+\d+\/STJ\b|\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/gi
      ) ?? [],
  });
  const o = extrair(textoOriginal);
  const r = extrair(textoReescrito);

  for (const url of r.urls) {
    if (!o.urls.includes(url)) {
      return { ok: false, motivo: `URL não autorizada no reescrito: ${url}` };
    }
  }
  for (const p of r.processos) {
    if (!o.processos.some((x) => x.toLowerCase() === p.toLowerCase())) {
      return {
        ok: false,
        motivo: `Identificador processual não autorizado no reescrito: ${p}`,
      };
    }
  }
  return { ok: true };
}
