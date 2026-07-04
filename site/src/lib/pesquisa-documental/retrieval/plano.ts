import {
  PRECIFICACAO,
  calcularValorSugerido,
  labelFaixaPreco,
} from "@/lib/constants/pesquisa-documental";

import type { PlanoDocumental } from "@/lib/pesquisa-documental/retrieval/schemas";

export type EntradaPlanoDocumental = {
  qtdPrecedentes: number;
  qtdFundamentos: number;
  /** Quando false, aplica política sem cobrança (Termos). */
  temPrecedenteComparavel: boolean;
};

function inferirFaixa(
  qtdPrecedentes: number,
  qtdFundamentos: number
): "essencial" | "padrao" | "completo" {
  const valor = calcularValorSugerido(qtdPrecedentes, qtdFundamentos);
  if (valor >= PRECIFICACAO.completo.valor) return "completo";
  if (valor >= PRECIFICACAO.padrao.valor) return "padrao";
  return "essencial";
}

export function resolverPlanoDocumental(entrada: EntradaPlanoDocumental): PlanoDocumental {
  if (!entrada.temPrecedenteComparavel || entrada.qtdPrecedentes === 0) {
    return {
      tipo: "sem_cobranca",
      motivo: "sem_precedente_comparavel",
      valor: 0,
      label: "Sem cobrança",
    };
  }

  const valor = calcularValorSugerido(entrada.qtdPrecedentes, entrada.qtdFundamentos);
  const faixa = inferirFaixa(entrada.qtdPrecedentes, entrada.qtdFundamentos);

  return {
    tipo: "cobranca",
    faixa,
    valor,
    label: labelFaixaPreco(valor),
    qtdPrecedentes: entrada.qtdPrecedentes,
    qtdFundamentos: entrada.qtdFundamentos,
  };
}
