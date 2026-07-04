/**
 * Capacidade operacional — referências de mercado (pesquisa manual tradicional:
 * 30–60 min só na busca; 2–4 h na análise — Thomson Reuters / Inspira, 2025).
 *
 * Fluxo Lex-Rocha (pesquisa manual em portais + triagem IA + relatório Claude + revisão humana):
 * estimamos 1–2,5 h por relatório conforme faixa.
 */

export type FaixaRelatorio = "essencial" | "padrao" | "completo";

export const CAPACIDADE_OPERACIONAL = {
  /** Horas úteis de produção por dia (fundador solo, conservador) */
  horasUteisPorDia: 6,
  /** Máximo sustentável de relatórios/dia sem atrasar fila (híbrido Groq + Claude + revisão) */
  maxRelatoriosPorDia: 5,
  /** Aviso quando fila passar deste número */
  maxNaFilaAntesAviso: 5,
  horasPorRelatorio: {
    essencial: 0.75,
    padrao: 1.0,
    completo: 1.75,
  } satisfies Record<FaixaRelatorio, number>,
  /** Referência externa (só documentação) */
  referenciaMercado: {
    pesquisaManualMin: 30,
    pesquisaManualMax: 60,
    analiseManualMin: 120,
    analiseManualMax: 240,
    fonte: "Thomson Reuters / Inspira (2025) — pesquisa jurisprudencial tradicional",
  },
} as const;

export function inferirFaixaPorValor(valor: number): FaixaRelatorio {
  if (valor <= 49) return "essencial";
  if (valor <= 79) return "padrao";
  return "completo";
}

export function capacidadeResumo(filaAtiva: number) {
  const { maxRelatoriosPorDia, maxNaFilaAntesAviso, horasUteisPorDia } =
    CAPACIDADE_OPERACIONAL;
  const diasParaEsvaziar =
    filaAtiva > 0 ? Math.ceil(filaAtiva / maxRelatoriosPorDia) : 0;

  return {
    filaAtiva,
    maxRelatoriosPorDia,
    horasUteisPorDia,
    diasParaEsvaziarFila: diasParaEsvaziar,
    filaAlta: filaAtiva >= maxNaFilaAntesAviso,
    mensagemCapacidade:
      filaAtiva >= maxNaFilaAntesAviso
        ? `Fila alta (${filaAtiva} pedidos). Considere pausar novas vendas ou estender prazo.`
        : `Capacidade confortável: até ${maxRelatoriosPorDia} relatórios/dia úteis.`,
  };
}
