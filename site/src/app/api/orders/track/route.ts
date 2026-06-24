import { NextResponse } from "next/server";

import { pendingOrderLabel, reportStatusLabel } from "@/lib/orders/track-status";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim().toUpperCase();

  if (!code || code.length < 6) {
    return NextResponse.json({ error: "Enter a valid tracking code." }, { status: 400 });
  }

  try {
    const supabase = getSupabase();

    const { data: relatorio } = await supabase
      .from("relatorios_pedido")
      .select("tracking_code, status, plano, nome_cliente, created_at, enviado_em, pedido_id")
      .eq("tracking_code", code)
      .maybeSingle();

    if (relatorio) {
      let area: string | null = null;
      if (relatorio.pedido_id) {
        const { data: pedido } = await supabase
          .from("pedidos_pendentes")
          .select("area_caso")
          .eq("id", relatorio.pedido_id)
          .maybeSingle();
        area = pedido?.area_caso ?? null;
      }

      return NextResponse.json({
        code,
        status: relatorio.status,
        statusLabel: reportStatusLabel(relatorio.status),
        plan: relatorio.plano,
        name: relatorio.nome_cliente,
        area,
        createdAt: relatorio.created_at,
        sentAt: relatorio.enviado_em,
      });
    }

    const { data: pedido } = await supabase
      .from("pedidos_pendentes")
      .select("tracking_code, plano_nome, area_caso, created_at")
      .eq("tracking_code", code)
      .maybeSingle();

    if (pedido) {
      return NextResponse.json({
        code,
        status: "awaiting_payment",
        statusLabel: pendingOrderLabel(),
        plan: pedido.plano_nome,
        area: pedido.area_caso,
        createdAt: pedido.created_at,
      });
    }

    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lookup failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
