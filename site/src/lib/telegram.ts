/** Operational alerts to Telegram (server-side only). */

type AlertaTipo =
  | "contacto"
  | "whatsapp_intent"
  | "whatsapp_mensagem"
  | "pagamento_aprovado";

type AlertaPayload = {
  tipo: AlertaTipo;
  nome?: string;
  email?: string;
  telefone?: string;
  mensagem?: string;
  plano?: string;
  valor?: number;
  extra?: string;
};

function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function titulo(tipo: AlertaTipo): string {
  const map: Record<AlertaTipo, string> = {
    contacto: "📩 New site contact",
    whatsapp_intent: "💬 Client opening WhatsApp",
    whatsapp_mensagem: "📱 WhatsApp message received",
    pagamento_aprovado: "✅ Payment approved",
  };
  return map[tipo];
}

export function montarAlerta(payload: AlertaPayload): string {
  const linhas = [`<b>${titulo(payload.tipo)}</b>`, ""];
  if (payload.nome) linhas.push(`👤 <b>Name:</b> ${esc(payload.nome)}`);
  if (payload.email) linhas.push(`📧 <b>Email:</b> ${esc(payload.email)}`);
  if (payload.telefone) linhas.push(`📞 <b>Phone:</b> ${esc(payload.telefone)}`);
  if (payload.plano) linhas.push(`📋 <b>Plan:</b> ${esc(payload.plano)}`);
  if (payload.valor != null) linhas.push(`💵 <b>Amount:</b> $${payload.valor}`);
  if (payload.mensagem) {
    linhas.push("", "<b>Message:</b>", esc(payload.mensagem.slice(0, 1200)));
  }
  if (payload.extra) linhas.push("", `<i>${esc(payload.extra)}</i>`);
  linhas.push("", "<i>Reply via WhatsApp or email as soon as possible.</i>");
  return linhas.join("\n");
}

export async function enviarAlertaTelegram(payload: AlertaPayload): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing");
    return false;
  }

  const kb =
    payload.tipo === "whatsapp_intent" || payload.tipo === "whatsapp_mensagem"
      ? {
          inline_keyboard: [[{ text: "Open WhatsApp Web", url: "https://web.whatsapp.com" }]],
        }
      : undefined;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: montarAlerta(payload),
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: kb,
    }),
  });

  if (!res.ok) {
    console.error("[telegram] failed:", res.status, await res.text());
    return false;
  }
  return true;
}
