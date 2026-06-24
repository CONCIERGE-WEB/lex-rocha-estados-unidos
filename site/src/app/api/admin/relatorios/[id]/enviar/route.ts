import { NextResponse } from "next/server";

import { adminAutenticado } from "@/lib/admin-auth";
import { enviarRelatorioCliente, resendConfigurado } from "@/lib/email/resend";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params) {
  if (!(await adminAutenticado(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!resendConfigurado()) {
    return NextResponse.json(
      { error: "Resend not configured (RESEND_API_KEY / RESEND_FROM_EMAIL)" },
      { status: 500 }
    );
  }

  const supabase = getSupabase();
  const { data: rel, error: fetchErr } = await supabase
    .from("relatorios_pedido")
    .select("*")
    .eq("id", params.id)
    .single();

  if (fetchErr || !rel) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  if (!rel.email_cliente) {
    return NextResponse.json({ error: "Client email missing" }, { status: 400 });
  }

  const conteudo = rel.conteudo_editado?.trim() || rel.conteudo_rascunho?.trim();
  if (!conteudo) {
    return NextResponse.json({ error: "Report has no content to send" }, { status: 400 });
  }

  if (rel.status === "enviado") {
    return NextResponse.json({ error: "This report was already sent" }, { status: 400 });
  }

  try {
    await enviarRelatorioCliente({
      email: rel.email_cliente,
      nome: rel.nome_cliente ?? "",
      plano: rel.plano ?? "Documentary research",
      conteudo,
    });

    const agora = new Date().toISOString();
    const { data, error } = await supabase
      .from("relatorios_pedido")
      .update({
        status: "enviado",
        conteudo_editado: conteudo,
        enviado_em: agora,
        erro_envio: null,
        updated_at: agora,
      })
      .eq("id", params.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ relatorio: data, enviado: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Send failed";
    await supabase
      .from("relatorios_pedido")
      .update({ erro_envio: msg, updated_at: new Date().toISOString() })
      .eq("id", params.id);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
