import { NextResponse } from "next/server";

import { enviarAlertaTelegram } from "@/lib/telegram";
import { linkWhatsApp, mensagemInicial } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nome = String(body.nome ?? "").trim();
    const plano = String(body.plano ?? "").trim();
    const mensagem = String(body.mensagem ?? "").trim();

    const waUrl = linkWhatsApp(mensagem || mensagemInicial(plano || undefined));
    if (!waUrl) {
      return NextResponse.json(
        { error: "WhatsApp not configured (NEXT_PUBLIC_WHATSAPP_NUMBER)." },
        { status: 503 }
      );
    }

    await enviarAlertaTelegram({
      tipo: "whatsapp_intent",
      nome: nome || undefined,
      plano: plano || undefined,
      mensagem: mensagem || mensagemInicial(plano || undefined),
      extra: "Client is being redirected to WhatsApp.",
    });

    return NextResponse.json({ ok: true, waUrl });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
