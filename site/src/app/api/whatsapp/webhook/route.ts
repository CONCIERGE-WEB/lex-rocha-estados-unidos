import { NextResponse } from "next/server";

import { enviarAlertaTelegram } from "@/lib/telegram";

/** Webhook Meta WhatsApp Cloud API — mensagens recebidas → alerta Telegram. */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const verify = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token && verify && token === verify && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed." }, { status: 403 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const entries = body.entry ?? [];

    for (const entry of entries) {
      const changes = entry.changes ?? [];
      for (const change of changes) {
        const messages = change.value?.messages ?? [];
        for (const msg of messages) {
          const telefone = msg.from ?? "";
          const texto =
            msg.text?.body ??
            msg.button?.text ??
            msg.interactive?.button_reply?.title ??
            "[mensagem sem texto]";

          await enviarAlertaTelegram({
            tipo: "whatsapp_mensagem",
            telefone,
            mensagem: texto,
            extra: "Reply in WhatsApp Business / wa.me.",
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[whatsapp/webhook]", e);
    return NextResponse.json({ ok: true });
  }
}
