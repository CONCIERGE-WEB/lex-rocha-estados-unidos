import {
  CAPACIDADE_OPERACIONAL,
  inferirFaixaPorValor,
  type FaixaRelatorio,
} from "@/lib/pedidos/capacidade";
import { gerarCodigoAcompanhamento } from "@/lib/pedidos/codigo-acompanhamento";
import { calcularPrevisaoEntrega } from "@/lib/pedidos/previsao-entrega";
import { createAdminClient } from "@/lib/supabase/admin";

const STATUS_FILA_ATIVOS = [
  "recebido",
  "orcamento",
  "aguardando_pagamento",
  "na_fila",
  "em_producao",
  "pronto",
] as const;

const STATUS_RELATORIO_FILA_ATIVOS = [
  "aguardando_pagamento",
  "na_fila",
  "em_producao",
  "pronto",
] as const;

export async function contarFilaAtiva(): Promise<number> {
  const supabase = createAdminClient();

  const [{ count: solicitacoes }, { count: relatorios }] = await Promise.all([
    supabase
      .from("solicitacoes_pesquisa")
      .select("id", { count: "exact", head: true })
      .in("fila_status", [...STATUS_FILA_ATIVOS]),
    supabase
      .from("relatorios_pesquisa")
      .select("id", { count: "exact", head: true })
      .in("fila_status", [...STATUS_RELATORIO_FILA_ATIVOS]),
  ]);

  return (solicitacoes ?? 0) + (relatorios ?? 0);
}

export async function proximaPrevisao(faixa: FaixaRelatorio = "padrao"): Promise<Date> {
  const { previsao } = await snapshotFila(faixa);
  return previsao;
}

/** Uma única leitura da fila — evita round-trips duplicados ao Supabase. */
export async function snapshotFila(faixa: FaixaRelatorio = "padrao"): Promise<{
  posicaoFila: number;
  previsao: Date;
}> {
  const ativos = await contarFilaAtiva();
  const posicaoFila = ativos + 1;
  const previsao = calcularPrevisaoEntrega({ posicaoNaFila: posicaoFila, faixa });
  return { posicaoFila, previsao };
}

export async function garantirCodigoUnico(
  tabela: "solicitacoes_pesquisa" | "relatorios_pesquisa"
): Promise<string> {
  const supabase = createAdminClient();
  for (let tentativa = 0; tentativa < 8; tentativa++) {
    const codigo = gerarCodigoAcompanhamento();
    const { data } = await supabase.from(tabela).select("id").eq("codigo_acompanhamento", codigo).maybeSingle();
    if (!data) return codigo;
  }
  throw new Error("Não foi possível gerar código de acompanhamento único.");
}

export async function entrarNaFilaAposPagamento(params: {
  relatorioId: string;
  valor: number;
  emailCliente?: string;
  nomeCliente?: string;
}) {
  const supabase = createAdminClient();
  const faixa = inferirFaixaPorValor(params.valor);
  const posicao = (await contarFilaAtiva()) + 1;
  const previsao = calcularPrevisaoEntrega({ posicaoNaFila: posicao, faixa });

  const { data: atual } = await supabase
    .from("relatorios_pesquisa")
    .select("codigo_acompanhamento, numero_sequencial, referencia_interna, nome_cliente")
    .eq("id", params.relatorioId)
    .single();

  const codigo =
    atual?.codigo_acompanhamento ?? (await garantirCodigoUnico("relatorios_pesquisa"));

  await supabase
    .from("relatorios_pesquisa")
    .update({
      codigo_acompanhamento: codigo,
      previsao_entrega: previsao.toISOString(),
      fila_status: "na_fila",
      status: "gerado",
    })
    .eq("id", params.relatorioId);

  const referencia =
    atual?.referencia_interna ??
    (atual?.numero_sequencial != null ? `REL #${atual.numero_sequencial}` : params.relatorioId);

  return {
    codigo,
    previsao,
    referencia,
    nome: params.nomeCliente ?? atual?.nome_cliente ?? "Cliente",
    email: params.emailCliente,
    faixa,
    posicao,
  };
}

export { CAPACIDADE_OPERACIONAL, inferirFaixaPorValor, type FaixaRelatorio };
