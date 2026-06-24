import { NextResponse } from "next/server";

import { enviarAlertaTelegram } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nome = String(body.nome ?? "").trim();
    const email = String(body.email ?? "").trim();
    const mensagem = String(body.mensagem ?? "").trim();
    const plano = String(body.plano ?? "").trim();

    if (!nome || !email || !mensagem) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    const ok = await enviarAlertaTelegram({
      tipo: "contacto",
      nome,
      email,
      mensagem,
      plano: plano || undefined,
      extra: "Channel: site contact form",
    });

    if (!ok) {
      return NextResponse.json(
        { error: "Alert not sent. Check TELEGRAM_BOT_TOKEN on the server." },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
