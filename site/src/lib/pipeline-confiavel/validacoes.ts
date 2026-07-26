/** Validações determinísticas de formulário (client e server). */

export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** CPF com dígitos verificadores (não confiar só em máscara). */
export function cpfValido(cpfBruto: string): boolean {
  const cpf = apenasDigitos(cpfBruto);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
  let d1 = (soma * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== Number(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
  let d2 = (soma * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === Number(cpf[10]);
}

export function nomeCompletoValido(nome: string): boolean {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  return partes.length >= 2 && nome.trim().length >= 5 && nome.trim().length <= 120;
}

/** Data ISO YYYY-MM-DD, não futura (quando aplicável). */
export function dataNaoFutura(iso: string, agora = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const data = new Date(y, m - 1, d);
  if (
    data.getFullYear() !== y ||
    data.getMonth() !== m - 1 ||
    data.getDate() !== d
  ) {
    return false;
  }
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  return data.getTime() <= hoje.getTime();
}

/**
 * Valor monetário em centavos (inteiro). Evita float.
 * Aceita string "123,45" / "123.45" / número positivo.
 */
export function moedaParaCentavos(valor: string | number): number | null {
  if (typeof valor === "number") {
    if (!Number.isFinite(valor) || valor <= 0) return null;
    return Math.round(valor * 100);
  }
  const limpo = valor.trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return null;
  const n = Number(limpo);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

export function centavosParaReais(centavos: number): string {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

/** USD display — e.g. 12345 → "123.45". */
export function centavosParaUsd(centavos: number): string {
  return (centavos / 100).toFixed(2);
}

/**
 * U.S. dollar amount → cents.
 * Accepts number or string "123.45" / "123" (no BR thousand-separator stripping).
 */
export function moedaUsdParaCentavos(valor: string | number): number | null {
  if (typeof valor === "number") {
    if (!Number.isFinite(valor) || valor <= 0) return null;
    return Math.round(valor * 100);
  }
  const limpo = valor.trim().replace(/\s/g, "").replace(/\$/g, "").replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return null;
  const n = Number(limpo);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

/**
 * Sinaliza (não bloqueia) se o intervalo desde a data informada
 * ultrapassa prazo prescricional típico de consumo (5 anos — art. 27 CDC).
 * Prescrição é questão jurídica; só alerta.
 */
export function alertaPrescricaoConsumo(
  dataIso: string,
  agora = new Date()
): { alerta: boolean; mensagem?: string } {
  if (!dataNaoFutura(dataIso, agora)) {
    return { alerta: false };
  }
  const [y, m, d] = dataIso.split("-").map(Number);
  const data = new Date(y, m - 1, d);
  const limite = new Date(data);
  limite.setFullYear(limite.getFullYear() + 5);
  if (agora.getTime() > limite.getTime()) {
    return {
      alerta: true,
      mensagem:
        "A data informada pode estar fora do prazo prescricional típico de 5 anos (CDC). Isso não impede o pedido — será analisado na pesquisa.",
    };
  }
  return { alerta: false };
}
