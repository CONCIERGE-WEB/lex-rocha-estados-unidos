/** WhatsApp helpers (wa.me + Meta Cloud API webhook). */

import { EMPRESA } from "@/lib/constants/empresa";

export function numeroWhatsApp(): string | null {
  const n = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  return n && n.length >= 9 ? n : null;
}

export function linkWhatsApp(mensagem?: string): string | null {
  const n = numeroWhatsApp();
  if (!n) return null;
  const base = `https://wa.me/${n}`;
  if (!mensagem?.trim()) return base;
  return `${base}?text=${encodeURIComponent(mensagem.trim())}`;
}

/** Pre-filled message for questions before checkout. */
export function mensagemDuvidas(plano?: string): string {
  const marca = EMPRESA.marca;
  const site = EMPRESA.dominio;
  if (plano?.trim()) {
    return `Hi! I came from ${marca} (${site}). I have a question about the ${plano.trim()} plan before ordering my report. Can you help?`;
  }
  return `Hi! I came from ${marca} (${site}). I have a question before proceeding: I had a problem with a company and want to know if this makes sense for my situation. The analysis is free. Thanks!`;
}

export function mensagemInicial(plano?: string): string {
  return mensagemDuvidas(plano);
}

export function linkWhatsAppDuvidas(plano?: string): string | null {
  return linkWhatsApp(mensagemDuvidas(plano));
}
