import { NextResponse } from "next/server";

import { definirAgendaDisponivel, obterAgendaStatus } from "@/lib/agenda";

export async function GET() {
  const status = await obterAgendaStatus();
  return NextResponse.json(status);
}

export async function PATCH(req: Request) {
  const secret = req.headers.get("x-agenda-secret");
  const expected = process.env.PAGAMENTO_WEBHOOK_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json();
  const disponivel = Boolean(body.disponivel);
  const ok = await definirAgendaDisponivel(disponivel);
  if (!ok) {
    return NextResponse.json(
      { error: "Could not update (Supabase not configured?)." },
      { status: 503 }
    );
  }

  const status = await obterAgendaStatus();
  return NextResponse.json(status);
}
