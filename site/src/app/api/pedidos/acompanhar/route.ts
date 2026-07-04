import { NextResponse } from "next/server";

import { formatarDataPrevisao } from "@/lib/pedidos/previsao-entrega";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const LABELS_STATUS: Record<string, string> = {
  recebido: "Solicitação recebida",
  orcamento: "Orçamento em preparação",
  aguardando_pagamento: "Aguardando pagamento",
  na_fila: "Na fila de produção",
  em_producao: "Em produção",
  pronto: "Relatório pronto",
  entregue: "Entregue",
  arquivada: "Arquivada",
  rascunho: "Em preparação interna",
  arquivado: "Arquivado",
};

export async function GET(request: Request) {
  const codigo = new URL(request.url).searchParams.get("codigo")?.trim().toUpperCase();

  if (!codigo || codigo.length < 6) {
    return NextResponse.json({ erro: "Informe um código válido." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: solicitacao } = await supabase
    .from("solicitacoes_pesquisa")
    .select("id, nome, area, fila_status, previsao_entrega, created_at, status")
    .eq("codigo_acompanhamento", codigo)
    .maybeSingle();

  if (solicitacao) {
    const previsao = solicitacao.previsao_entrega
      ? new Date(solicitacao.previsao_entrega)
      : null;

    return NextResponse.json({
      tipo: "solicitacao",
      codigo,
      nome: solicitacao.nome,
      area: solicitacao.area,
      status: solicitacao.fila_status ?? solicitacao.status,
      statusLabel: LABELS_STATUS[solicitacao.fila_status ?? solicitacao.status] ?? "Em andamento",
      previsaoEntrega: previsao?.toISOString() ?? null,
      previsaoFormatada: previsao ? formatarDataPrevisao(previsao) : null,
      criadoEm: solicitacao.created_at,
    });
  }

  const { data: relatorio } = await supabase
    .from("relatorios_pesquisa")
    .select(
      "id, numero_sequencial, referencia_interna, area, fila_status, previsao_entrega, status, created_at"
    )
    .eq("codigo_acompanhamento", codigo)
    .maybeSingle();

  if (relatorio) {
    const previsao = relatorio.previsao_entrega
      ? new Date(relatorio.previsao_entrega)
      : null;
    const filaStatus = relatorio.fila_status ?? relatorio.status;

    return NextResponse.json({
      tipo: "relatorio",
      codigo,
      referencia:
        relatorio.referencia_interna ??
        `REL-${new Date(relatorio.created_at).getFullYear()}-${String(relatorio.numero_sequencial).padStart(3, "0")}`,
      area: relatorio.area,
      status: filaStatus,
      statusLabel: LABELS_STATUS[filaStatus] ?? "Em andamento",
      previsaoEntrega: previsao?.toISOString() ?? null,
      previsaoFormatada: previsao ? formatarDataPrevisao(previsao) : null,
      criadoEm: relatorio.created_at,
    });
  }

  return NextResponse.json({ erro: "Código não encontrado." }, { status: 404 });
}
