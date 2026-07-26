import {
  type AreaProblema,
  PRECIFICACAO,
  type ResultadoTriagem,
} from "@/lib/constants/pesquisa-documental";

export const AGRAVANTES_OPCOES = [
  {
    id: "reiterado",
    label: "Repeated company conduct",
    multiplicador: 1.2,
  },
  {
    id: "prejuizo_profissional",
    label: "Documented professional harm",
    multiplicador: 1.25,
  },
  {
    id: "empresa_reconheceu",
    label: "Company acknowledged the error",
    multiplicador: 1.15,
  },
  {
    id: "big_tech",
    label: "Large platform / Big Tech",
    multiplicador: 1.1,
  },
] as const;

export type AgravanteId = (typeof AGRAVANTES_OPCOES)[number]["id"];

const BASE_CAUSA_POR_AREA: Record<AreaProblema, { min: number; max: number }> = {
  "FCRA — credit reporting / inaccurate file": { min: 3000, max: 15000 },
  "FDCPA — debt collection / abusive practices": { min: 1500, max: 8000 },
  "TCPA — robocalls, spam texts & autodialers": { min: 500, max: 1500 },
  "Lemon Law / Magnuson-Moss — vehicle & product warranty": {
    min: 1500,
    max: 8000,
  },
  "UDAP — unfair & deceptive acts / junk fees": { min: 1000, max: 10000 },
  "DOT — flights, delays, baggage": { min: 500, max: 5000 },
  "Health insurance denial / bad faith coverage": { min: 5000, max: 20000 },
  Other: { min: 1000, max: 5000 },
};

export function calcularEstimativaCausa(
  area: AreaProblema,
  agravantes: AgravanteId[]
): { min: number; max: number; multiplicador: number } {
  const base = BASE_CAUSA_POR_AREA[area] ?? BASE_CAUSA_POR_AREA.Other;
  const multiplicador = agravantes.reduce((acc, id) => {
    const item = AGRAVANTES_OPCOES.find((a) => a.id === id);
    return item ? acc * item.multiplicador : acc;
  }, 1);

  return {
    min: Math.round(base.min * multiplicador),
    max: Math.round(base.max * multiplicador),
    multiplicador,
  };
}

export function sugerirValorRelatorioCompleto(input: {
  precedentes: string;
  fundamentosCount: number;
  triagem?: ResultadoTriagem | null;
}): { valor: number; faixa: string } {
  const qtd = input.precedentes
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean).length;

  let valor: number = PRECIFICACAO.essencial.valor;
  let faixa: string = PRECIFICACAO.essencial.label;

  if (qtd > 5 || input.fundamentosCount >= 6) {
    valor = PRECIFICACAO.completo.valor;
    faixa = PRECIFICACAO.completo.label;
  } else if (qtd > 2) {
    valor = PRECIFICACAO.padrao.valor;
    faixa = PRECIFICACAO.padrao.label;
  }

  const urgencia = input.triagem?.classificacao_interna.grau_urgencia;
  if (urgencia === "VERMELHO" && valor < PRECIFICACAO.completo.valor) {
    valor = PRECIFICACAO.completo.valor;
    faixa = PRECIFICACAO.completo.label;
  } else if (urgencia === "AMARELO" && valor < PRECIFICACAO.padrao.valor) {
    valor = PRECIFICACAO.padrao.valor;
    faixa = PRECIFICACAO.padrao.label;
  }

  return { valor, faixa };
}
