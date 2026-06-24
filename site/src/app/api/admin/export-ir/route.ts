import { NextResponse } from "next/server";

import { adminAutenticado } from "@/lib/admin-auth";
import { getSupabase, type PagamentoRow } from "@/lib/supabase";

export const runtime = "nodejs";

function csvEscape(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export async function GET(request: Request) {
  if (!(await adminAutenticado(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ano = searchParams.get("ano") ?? String(new Date().getFullYear());

  const supabase = getSupabase();
  const inicio = new Date(Number(ano), 0, 1).toISOString();
  const fim = new Date(Number(ano) + 1, 0, 1).toISOString();

  const { data, error } = await supabase
    .from("pagamentos")
    .select("*")
    .gte("created_at", inicio)
    .lt("created_at", fim)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as PagamentoRow[];
  const header = "date,client,zip,amount,currency,plan,email,stripe_id";
  const linhas = rows.map((r) =>
    [
      r.created_at.slice(0, 10),
      csvEscape(r.nome_cliente ?? ""),
      csvEscape(r.nif_cliente ?? ""),
      String(r.valor),
      csvEscape(r.moeda ?? "usd"),
      csvEscape(r.plano ?? ""),
      csvEscape(r.email_cliente ?? ""),
      csvEscape(r.stripe_payment_id ?? ""),
    ].join(",")
  );

  const csv = [header, ...linhas].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="revenue-${ano}.csv"`,
    },
  });
}
