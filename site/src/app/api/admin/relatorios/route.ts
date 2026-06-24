import { NextResponse } from "next/server";

import { adminAutenticado } from "@/lib/admin-auth";
import { getSupabase, type RelatorioPedidoRow } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await adminAutenticado(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const supabase = getSupabase();
  let query = supabase
    .from("relatorios_pedido")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ relatorios: (data ?? []) as RelatorioPedidoRow[] });
}
