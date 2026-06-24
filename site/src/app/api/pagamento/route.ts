import { NextResponse } from "next/server";

import { enviarAlertaTelegram } from "@/lib/telegram";

/** Records approved payment and alerts the operator on Telegram. */

export async function POST(req: Request) {
  const secret = req.headers.get("x-pagamento-secret");
  const expected = process.env.PAGAMENTO_WEBHOOK_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const nome = String(body.nome ?? "").trim();
    const email = String(body.email ?? "").trim();
    const plano = String(body.plano ?? "").trim();
    const valor = Number(body.valor ?? 0);

    if (!nome || !plano) {
      return NextResponse.json({ error: "Name and plan are required." }, { status: 400 });
    }

    const ok = await enviarAlertaTelegram({
      tipo: "pagamento_aprovado",
      nome,
      email: email || undefined,
      plano,
      valor: valor || undefined,
      extra: "Confirm with the client and schedule report delivery.",
    });

    if (!ok) {
      return NextResponse.json({ error: "Telegram alert failed." }, { status: 503 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
