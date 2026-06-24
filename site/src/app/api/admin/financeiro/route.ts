import { NextResponse } from "next/server";

import { adminAutenticado } from "@/lib/admin-auth";
import { getSupabase, type PagamentoRow } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await adminAutenticado(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mes = searchParams.get("mes");
  const ano = searchParams.get("ano");

  const supabase = getSupabase();
  let query = supabase.from("pagamentos").select("*").order("created_at", { ascending: false });

  if (ano) {
    const y = Number(ano);
    const inicio = mes
      ? new Date(y, Number(mes) - 1, 1).toISOString()
      : new Date(y, 0, 1).toISOString();
    const fim = mes
      ? new Date(y, Number(mes), 1).toISOString()
      : new Date(y + 1, 0, 1).toISOString();
    query = query.gte("created_at", inicio).lt("created_at", fim);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as PagamentoRow[];
  const totalMes = rows.reduce((s, r) => s + Number(r.valor), 0);

  return NextResponse.json({
    pagamentos: rows,
    totais: {
      registos: rows.length,
      valor: totalMes,
    },
  });
}
