import { getWhatsAppNumber, mensagemPagamentoConfirmado, whatsappConfigurado } from "@/lib/whatsapp";

type AvisoPagamentoWhatsAppInput = {
  referencia: string;
  valor: number;
  codigo?: string;
};

function whatsappApiConfigurada(): boolean {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_TO_NUMBER
  );
}

export function diagnosticoWhatsAppCheckout(): { ok: boolean; detalhe: string } {
  if (!whatsappConfigurado()) {
    return { ok: false, detalhe: "NEXT_PUBLIC_WHATSAPP_NUMBER ausente/inválido" };
  }
  if (!whatsappApiConfigurada()) {
    return {
      ok: true,
      detalhe:
        "Modo link ativo (sem API): gera redirecionamento WhatsApp para aviso de checkout e orientação para conferir o e-mail de contato.",
    };
  }
  return { ok: true, detalhe: "WhatsApp API configurada para alerta ativo de checkout" };
}

/**
 * Envia aviso ativo via WhatsApp Cloud API para o fundador.
 * Se a API não estiver configurada, retorna false sem quebrar o fluxo.
 */
export async function avisarPagamentoCheckoutWhatsApp(
  dados: AvisoPagamentoWhatsAppInput
): Promise<boolean> {
  if (!whatsappApiConfigurada()) return false;

  const token = process.env.WHATSAPP_ACCESS_TOKEN as string;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID as string;
  const to = (process.env.WHATSAPP_TO_NUMBER as string).replace(/\D/g, "");
  if (!to) return false;

  const texto = mensagemPagamentoConfirmado({
    referencia: dados.referencia,
    valor: dados.valor,
    codigo: dados.codigo,
  });

  try {
    const res = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: {
          preview_url: false,
          body: texto,
        },
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[whatsapp] falha ao enviar aviso de pagamento", res.status, err);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[whatsapp] erro de rede/timeout no aviso de pagamento", error);
    return false;
  }
}

export function linkFallbackWhatsAppPagamento(dados: AvisoPagamentoWhatsAppInput): string {
  const numero = getWhatsAppNumber();
  if (!numero) return "#";
  const texto = encodeURIComponent(
    mensagemPagamentoConfirmado({
      referencia: dados.referencia,
      valor: dados.valor,
      codigo: dados.codigo,
    })
  );
  return `https://wa.me/${numero}?text=${texto}`;
}
