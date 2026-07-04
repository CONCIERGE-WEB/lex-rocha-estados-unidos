import Anthropic from "@anthropic-ai/sdk";

import {
  getModeloOrganizacaoInterno,
  getPromptSistemaPesquisa,
} from "@/lib/constants/pesquisa-documental.ip.server";
import {
  AVISO_LEGAL_RELATORIO,
  labelFundamento,
  type ResultadoTriagem,
} from "@/lib/constants/pesquisa-documental";
import { instrucoesPromptSinteseFinal } from "@/lib/constants/estrutura-relatorio";
import {
  assertCitacoesRelatorioValidas,
  montarBlocoPacoteParaClaude,
  prepararPacotePesquisaDocumental,
  type PacotePesquisaDocumental,
} from "@/lib/pesquisa-documental/retrieval";
import type { PesquisaDocumentalInput } from "@/lib/validations/pesquisa-documental";

export type OpcoesGeracaoRelatorio = {
  /** Consulta HTTP às URLs permitidas antes de gerar (falha explícita se indisponível). */
  enriquecerComFetch?: boolean;
};

function montarPromptUsuario(
  dados: PesquisaDocumentalInput,
  pacote: PacotePesquisaDocumental
): string {
  const fundamentosTexto = dados.fundamentos
    .map((id) => labelFundamento(id))
    .join("\n- ");

  const t = dados.triagem;
  const blocoPacote = montarBlocoPacoteParaClaude(pacote);

  return `${getPromptSistemaPesquisa()}

${blocoPacote}

DADOS DO CASO:
Área: ${dados.area}
Resumo dos fatos: ${dados.fatos}
Fundamentos selecionados:
- ${fundamentosTexto}
Triagem interna: área ${t.classificacao_interna.area}, subárea ${t.classificacao_interna.subarea}, urgência ${t.classificacao_interna.grau_urgencia}, complexidade ${t.analise_fatores.complexidade}, faixa da causa ${t.analise_fatores.faixa_estimada_causa}, via interna ${t.analise_fatores.via_sugerida_referencia_interna}, risco prescricional ${t.analise_fatores.risco_prescricao_evidente ? "sim" : "não"}
Observações: ${dados.observacoes ?? "Nenhuma"}

Gere exatamente estas 4 seções:

1. RESUMO DOS FATOS
(3 a 4 parágrafos descrevendo cronologicamente os fatos relatados, linguagem objetiva e formal, sem julgamento)

2. PRECEDENTES JURISPRUDENCIAIS IDENTIFICADOS
(Para cada precedente do PACOTE acima: tribunal, data, valor se houver, resumo do decidido — sem inventar URL nem decisão)

3. FUNDAMENTOS JURÍDICOS APLICÁVEIS
(Para cada fundamento selecionado: artigo, lei e relação com os fatos — sem opinar sobre resultado)

${instrucoesPromptSinteseFinal()}

Termine com exatamente este texto:
---
${AVISO_LEGAL_RELATORIO}`;
}

export async function prepararPacoteParaGeracao(
  dados: PesquisaDocumentalInput,
  opcoes?: OpcoesGeracaoRelatorio
): Promise<PacotePesquisaDocumental> {
  return prepararPacotePesquisaDocumental(
    {
      precedentesTexto: dados.precedentes,
      fundamentosIds: dados.fundamentos,
      enriquecerComFetch: opcoes?.enriquecerComFetch ?? false,
    },
    fetch
  );
}

export type ResultadoGeracaoRelatorio = {
  conteudo: string;
  modelo: string;
  pacote: PacotePesquisaDocumental;
  tokens?: { entrada: number; saida: number };
};

export async function gerarRelatorioPesquisaDocumental(
  dados: PesquisaDocumentalInput,
  opcoes?: OpcoesGeracaoRelatorio
): Promise<ResultadoGeracaoRelatorio> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY não configurada. Adicione em .env.local.");
  }

  const pacote = await prepararPacoteParaGeracao(dados, opcoes);
  const client = new Anthropic({ apiKey });
  const prompt = montarPromptUsuario(dados, pacote);

  const response = await client.messages.create({
    model: getModeloOrganizacaoInterno(),
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const blocoTexto = response.content.find((b) => b.type === "text");
  if (!blocoTexto || blocoTexto.type !== "text") {
    throw new Error("Não foi possível gerar o texto do relatório. Tente novamente.");
  }

  const conteudo = blocoTexto.text.trim();

  assertCitacoesRelatorioValidas({
    conteudoRelatorio: conteudo,
    urlsAutorizadas: pacote.urlsAutorizadas,
  });

  return {
    conteudo,
    modelo: getModeloOrganizacaoInterno(),
    pacote,
    tokens: {
      entrada: response.usage.input_tokens,
      saida: response.usage.output_tokens,
    },
  };
}

export type { ResultadoTriagem };
