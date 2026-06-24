import { NextResponse } from "next/server";

import { adminAutenticado } from "@/lib/admin-auth";
import { gerarRelatorioPedido } from "@/lib/relatorio/gerar-us";
import { getSupabase, type RelatorioPedidoRow } from "@/lib/supabase";

export const runtime = "nodejs";

type Params = { params: { id: string } };

export async function GET(request: Request, { params }: Params) {
  if (!(await adminAutenticado(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("relatorios_pedido")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json({ relatorio: data as RelatorioPedidoRow });
}

type PatchBody = {
  conteudoEditado?: string;
  acao?: "regenerar";
};

export async function PATCH(request: Request, { params }: Params) {
  if (!(await adminAutenticado(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as PatchBody;
  const supabase = getSupabase();

  if (body.acao === "regenerar") {
    await supabase
      .from("relatorios_pedido")
      .update({ status: "a_gerar", erro_geracao: null, updated_at: new Date().toISOString() })
      .eq("id", params.id);
    try {
      await gerarRelatorioPedido(params.id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Regeneration failed";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    const { data } = await supabase.from("relatorios_pedido").select("*").eq("id", params.id).single();
    return NextResponse.json({ relatorio: data as RelatorioPedidoRow });
  }

  if (typeof body.conteudoEditado !== "string") {
    return NextResponse.json({ error: "conteudoEditado is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("relatorios_pedido")
    .update({
      conteudo_editado: body.conteudoEditado,
      status: "revisao",
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ relatorio: data as RelatorioPedidoRow });
}
