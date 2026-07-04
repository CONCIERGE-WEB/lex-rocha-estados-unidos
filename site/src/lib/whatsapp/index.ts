import { SITE } from "@/lib/constants/site";

/** Número no formato internacional sem + (ex.: 5512996887993) */
export function getWhatsAppNumber(): string {
  const raw =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ||
    SITE.whatsapp.replace(/\D/g, "");
  return raw;
}

export function whatsappConfigurado(): boolean {
  return getWhatsAppNumber().length >= 12;
}

export function montarLinkWhatsApp(mensagem: string): string {
  const numero = getWhatsAppNumber();
  if (!numero) return "#";
  const texto = encodeURIComponent(mensagem);
  return `https://wa.me/${numero}?text=${texto}`;
}

export function mensagemNovaSolicitacao(dados: {
  nome: string;
  area: string;
  codigo: string;
  email?: string;
}): string {
  return [
    `Olá, ${SITE.founder.split(" ")[0]}! Nova solicitação Lex-Rocha.`,
    "",
    `Nome: ${dados.nome}`,
    dados.email ? `E-mail: ${dados.email}` : null,
    `Área: ${dados.area}`,
    `Código: ${dados.codigo}`,
    "",
    "Enviado pelo site — favor confirmar orçamento e prazo.",
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
    `Pagamento confirmado — Lex-Rocha`,
    `Ref.: ${dados.referencia}`,
    `Valor: R$ ${dados.valor.toFixed(2)}`,
    dados.codigo ? `Código: ${dados.codigo}` : null,
    "",
    `Verificar e-mail ${SITE.email} para detalhes e próximas ações.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function mensagemClienteAcompanhar(codigo: string): string {
  return [
    `Olá! Acompanho meu pedido na Lex-Rocha.`,
    `Código: ${codigo}`,
    "",
    "Gostaria de um retorno sobre prazo e orçamento.",
  ].join("\n");
}
