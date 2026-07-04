import { NextResponse } from "next/server";

import { adminAutenticado } from "@/lib/security/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

export const runtime = "nodejs";

type Params = { params: { id: string } };
type RelatorioUpdate = Database["public"]["Tables"]["relatorios_pesquisa"]["Update"];

const FILA_STATUS_VALIDOS = new Set([
  "rascunho",
  "recebido",
  "orcamento",
  "aguardando_pagamento",
  "na_fila",
  "em_producao",
  "pronto",
  "entregue",
]);

export async function GET(request: Request, { params }: Params) {
  if (!(await adminAutenticado(request))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("relatorios_pesquisa")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ erro: "Relatório não encontrado." }, { status: 404 });

  return NextResponse.json({ relatorio: data });
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await adminAutenticado(request))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  let body: { fila_status?: string; valor_cobrado?: number | null; status?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const update: RelatorioUpdate = {};

  if (body.fila_status !== undefined) {
    if (!FILA_STATUS_VALIDOS.has(body.fila_status)) {
      return NextResponse.json({ erro: "Status de fila inválido." }, { status: 400 });
    }
    update.fila_status = body.fila_status;
  }

  if (body.valor_cobrado !== undefined) {
    if (body.valor_cobrado !== null && (!Number.isFinite(body.valor_cobrado) || body.valor_cobrado < 0)) {
      return NextResponse.json({ erro: "Valor inválido." }, { status: 400 });
    }
    update.valor_cobrado = body.valor_cobrado;
  }

  if (body.status !== undefined) {
    update.status = body.status;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ erro: "Nada para atualizar." }, { status: 400 });
  }

  update.updated_at = new Date().toISOString();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("relatorios_pesquisa")
    .update(update)
    .eq("id", params.id)
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ erro: "Relatório não encontrado." }, { status: 404 });

  return NextResponse.json({ relatorio: data });
}
