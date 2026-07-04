import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

import { capacidadeResumo } from "@/lib/pedidos/capacidade";
import { contarFilaAtiva } from "@/lib/pedidos/fila-service";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const WORKSPACE_COOKIE = "lex_workspace";

function autorizado(): boolean {
  const secret = process.env.WORKSPACE_SECRET;
  if (!secret) return true;
  return cookies().get(WORKSPACE_COOKIE)?.value === secret;
}

export async function GET() {
  if (!autorizado()) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const supabase = createAdminClient();

  const [{ data: solicitacoes }, { data: relatorios }] = await Promise.all([
    supabase
      .from("solicitacoes_pesquisa")
      .select(
        "id, nome, email, area, fila_status, previsao_entrega, codigo_acompanhamento, created_at, status"
      )
      .in("fila_status", ["recebido", "orcamento", "aguardando_pagamento", "na_fila", "em_producao", "pronto"])
      .order("previsao_entrega", { ascending: true, nullsFirst: false })
      .limit(50),
    supabase
      .from("relatorios_pesquisa")
      .select(
        "id, numero_sequencial, referencia_interna, area, fila_status, previsao_entrega, codigo_acompanhamento, valor_cobrado, created_at, status"
      )
      .in("fila_status", ["aguardando_pagamento", "na_fila", "em_producao", "pronto"])
      .order("previsao_entrega", { ascending: true, nullsFirst: false })
      .limit(50),
  ]);

  const filaAtiva = await contarFilaAtiva();

  return NextResponse.json({
    capacidade: capacidadeResumo(filaAtiva),
    solicitacoes: solicitacoes ?? [],
    relatorios: relatorios ?? [],
  });
}

const atualizarFilaSchema = z.object({
  tipo: z.enum(["solicitacao", "relatorio"]),
  id: z.string().uuid(),
  filaStatus: z.enum([
    "recebido",
    "orcamento",
    "aguardando_pagamento",
    "na_fila",
    "em_producao",
    "pronto",
    "entregue",
    "arquivada",
    "rascunho",
    "arquivado",
  ]),
});

export async function PATCH(request: Request) {
  if (!autorizado()) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const dados = atualizarFilaSchema.parse(body);
    const supabase = createAdminClient();

    if (dados.tipo === "solicitacao") {
      const statusSolicitacao =
        dados.filaStatus === "entregue"
          ? "convertida"
          : dados.filaStatus === "arquivada"
            ? "arquivada"
            : undefined;

      const { error } = await supabase
        .from("solicitacoes_pesquisa")
        .update({
          fila_status: dados.filaStatus,
          ...(statusSolicitacao ? { status: statusSolicitacao } : {}),
        })
        .eq("id", dados.id);

      if (error) throw error;
    } else {
      const statusRelatorio =
        dados.filaStatus === "entregue"
          ? "entregue"
          : dados.filaStatus === "arquivado"
            ? "arquivado"
            : undefined;

      const { error } = await supabase
        .from("relatorios_pesquisa")
        .update({
          fila_status: dados.filaStatus,
          ...(statusRelatorio ? { status: statusRelatorio } : {}),
        })
        .eq("id", dados.id);

      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
    }
    console.error("[pedidos/fila PATCH]", error);
    return NextResponse.json({ erro: "Erro ao atualizar fila." }, { status: 500 });
  }
}
