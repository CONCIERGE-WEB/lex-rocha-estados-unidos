/** Stripe Payment Links, Checkout API e WhatsApp — variáveis em .env.local */

import { linkWhatsApp, mensagemInicial } from "@/lib/whatsapp";

const STRIPE_LINKS: Record<string, string | undefined> = {
  essencial: process.env.STRIPE_LINK_ESSENCIAL,
  padrao: process.env.STRIPE_LINK_PADRAO,
  completo: process.env.STRIPE_LINK_COMPLETO,
};

export function stripeLinkPlano(planoId: string): string | null {
  const url = STRIPE_LINKS[planoId]?.trim();
  return url || null;
}

/** Link wa.me para redirecionamento (client-safe: NEXT_PUBLIC_* ou URL explícita). */
export function whatsappUrl(): string | null {
  const explicit =
    process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() || process.env.WHATSAPP_URL?.trim();
  if (explicit) return explicit;
  return linkWhatsApp(mensagemInicial()) ?? null;
}
