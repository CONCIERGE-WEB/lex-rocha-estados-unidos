import { EMPRESA } from "@/lib/constants/empresa";
import { SITE } from "@/lib/constants/site";

/** International number without + (e.g. 15551234567) */
export function getWhatsAppNumber(): string {
  const raw =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ||
    SITE.whatsapp.replace(/\D/g, "") ||
    "";
  return raw;
}

export function numeroWhatsApp(): string | null {
  const n = getWhatsAppNumber();
  return n && n.length >= 9 ? n : null;
}

export function whatsappConfigurado(): boolean {
  return getWhatsAppNumber().length >= 10;
}

export function montarLinkWhatsApp(mensagem: string): string {
  const numero = getWhatsAppNumber();
  if (!numero) return "#";
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

export function linkWhatsApp(mensagem?: string): string | null {
  const n = numeroWhatsApp();
  if (!n) return null;
  const base = `https://wa.me/${n}`;
  if (!mensagem?.trim()) return base;
  return `${base}?text=${encodeURIComponent(mensagem.trim())}`;
}

export function mensagemDuvidas(plano?: string): string {
  const marca = EMPRESA.marca;
  const site = EMPRESA.dominio;
  if (plano?.trim()) {
    return `Hi! I came from ${marca} (${site}). I have a question about the ${plano.trim()} plan before ordering my report. Can you help?`;
  }
  return `Hi! I came from ${marca} (${site}). I have a question before proceeding with a consumer-rights research report. Thanks!`;
}

export function mensagemInicial(plano?: string): string {
  return mensagemDuvidas(plano);
}

export function linkWhatsAppDuvidas(plano?: string): string | null {
  return linkWhatsApp(mensagemDuvidas(plano));
}

export function mensagemNovaSolicitacao(dados: {
  nome: string;
  area: string;
  codigo: string;
  email?: string;
}): string {
  return [
    `New request — ${EMPRESA.marca}`,
    "",
    `Name: ${dados.nome}`,
    dados.email ? `Email: ${dados.email}` : null,
    `Area: ${dados.area}`,
    `Code: ${dados.codigo}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function mensagemPagamentoConfirmado(dados: {
  referencia: string;
  valor: number;
  codigo?: string;
}): string {
  return [
    `Payment confirmed — ${EMPRESA.marca}`,
    `Ref.: ${dados.referencia}`,
    `Amount: $${dados.valor.toFixed(2)}`,
    dados.codigo ? `Code: ${dados.codigo}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function mensagemClienteAcompanhar(codigo: string): string {
  return [
    `Hi! I'm tracking my ${EMPRESA.marca} request.`,
    `Code: ${codigo}`,
    "",
    "Could you update me on timing?",
  ].join("\n");
}
