import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const direitosSchema = z.object({
  tipo: z.enum(["acesso", "correcao", "eliminacao", "portabilidade", "revogacao"]),
  email: z.string().email(),
  descricao: z.string().min(10).max(2000),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const dados = direitosSchema.parse(body);

    const supabase = createAdminClient();
    const prazo = new Date();
    prazo.setDate(prazo.getDate() + 15);

    const { error } = await supabase.from("direitos_lgpd").insert({
      tipo: dados.tipo,
      email_contato: dados.email,
      descricao: dados.descricao,
      status: "pendente",
      prazo_resposta: prazo.toISOString(),
    });

    if (error) {
      console.error("[lgpd/direitos]", error);
      return NextResponse.json(
        { erro: "Não foi possível registrar a solicitação. Tente por e-mail." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }
}
