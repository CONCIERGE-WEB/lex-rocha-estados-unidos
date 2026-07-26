/**
 * U.S. admin financial metrics — USD plans Essential $49 / Standard $79 / Premium $119.
 * One-time research sales: MRR ≈ month revenue run-rate; LTV ≈ average ticket × repeat factor.
 */

import { PLANOS } from "@/lib/constants/empresa";
import { PRECIFICACAO } from "@/lib/constants/pesquisa-documental";

export const PLANOS_USD = {
  essencial: PRECIFICACAO.essencial.valor,
  padrao: PRECIFICACAO.padrao.valor,
  completo: PRECIFICACAO.completo.valor,
} as const;

/** Conservative repeat factor for documentary research (mostly one-shot). */
export const LTV_REPEAT_FACTOR = 1.15;

export type PagamentoMetricas = {
  valor: number;
  status: string;
  plano?: string | null;
};

export type MetricasFinanceirasUs = {
  receitaMes: number;
  ticketMedio: number;
  mrr: number;
  ltv: number;
  pagosCount: number;
  mixPlanos: { essencial: number; padrao: number; completo: number };
  precosBase: typeof PLANOS_USD;
};

function inferirPlano(valor: number): keyof typeof PLANOS_USD {
  if (valor >= PLANOS_USD.completo - 1) return "completo";
  if (valor >= PLANOS_USD.padrao - 1) return "padrao";
  return "essencial";
}

export function calcularMetricasFinanceirasUs(
  pagamentos: PagamentoMetricas[]
): MetricasFinanceirasUs {
  const pagos = pagamentos.filter((p) => p.status === "pago");
  const receitaMes = pagos.reduce((s, p) => s + Number(p.valor ?? 0), 0);
  const pagosCount = pagos.length;
  const ticketMedio = pagosCount > 0 ? receitaMes / pagosCount : PLANOS_USD.padrao;

  const mixPlanos = { essencial: 0, padrao: 0, completo: 0 };
  for (const p of pagos) {
    const id = (p.plano?.toLowerCase() as keyof typeof PLANOS_USD) || inferirPlano(Number(p.valor));
    if (id in mixPlanos) mixPlanos[id] += 1;
    else mixPlanos[inferirPlano(Number(p.valor))] += 1;
  }

  /** Run-rate: current month paid revenue (USD). */
  const mrr = receitaMes;
  const ltv = Math.round(ticketMedio * LTV_REPEAT_FACTOR * 100) / 100;

  return {
    receitaMes,
    ticketMedio: Math.round(ticketMedio * 100) / 100,
    mrr,
    ltv,
    pagosCount,
    mixPlanos,
    precosBase: PLANOS_USD,
  };
}

export function rotulosPlanosUsd(): string {
  return PLANOS.map((p) => `${p.nome} $${p.preco}`).join(" · ");
}
