import { NextResponse } from "next/server";

import { emailRelatorioPronto, resendConfigurado } from "@/lib/email/resend";
import { adminAutenticado } from "@/lib/security/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params) {
  if (!(await adminAutenticado(request))) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  if (!resendConfigurado()) {
    return NextResponse.json(
      { erro: "Resend não configurado (RESEND_API_KEY / RESEND_FROM_EMAIL)." },
      { status: 500 }
    );
  }

  let body: { email?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const supabase = createAdminClient();
  const { data: rel, error } = await supabase
    .from("relatorios_pesquisa")
    .select("id, nome_cliente, referencia_interna, numero_sequencial, codigo_acompanhamento, solicitacao_id")
    .eq("id", params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  if (!rel) return NextResponse.json({ erro: "Relatório não encontrado." }, { status: 404 });

  let email = body.email?.trim();
  if (!email && rel.solicitacao_id) {
    const { data: sol } = await supabase
      .from("solicitacoes_pesquisa")
      .select("email")
      .eq("id", rel.solicitacao_id)
      .maybeSingle();
    email = sol?.email ?? undefined;
  }

  if (!email) {
    return NextResponse.json(
      { erro: "E-mail do cliente não informado e sem solicitação vinculada." },
      { status: 400 }
    );
  }

  const referencia =
    rel.referencia_interna ?? `Relatório #${rel.numero_sequencial}`;

  const enviado = await emailRelatorioPronto({
    email,
    nome: rel.nome_cliente,
    codigo: rel.codigo_acompanhamento,
    referencia,
  });

  if (!enviado) {
    return NextResponse.json({ erro: "Falha ao enviar e-mail." }, { status: 502 });
  }

  const { data: atualizado, error: errUpd } = await supabase
    .from("relatorios_pesquisa")
    .update({ fila_status: "entregue", updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .select("*")
    .maybeSingle();

  if (errUpd) return NextResponse.json({ erro: errUpd.message }, { status: 500 });

  return NextResponse.json({ relatorio: atualizado, enviado: true });
}
