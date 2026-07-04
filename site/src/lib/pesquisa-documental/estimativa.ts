import {
  type AreaProblema,
  PRECIFICACAO,
  type ResultadoTriagem,
} from "@/lib/constants/pesquisa-documental";

export const AGRAVANTES_OPCOES = [
  {
    id: "reiterado",
    label: "Comportamento reiterado da empresa",
    multiplicador: 1.2,
  },
  {
    id: "prejuizo_profissional",
    label: "Prejuízo profissional comprovado",
    multiplicador: 1.25,
  },
  {
    id: "empresa_reconheceu",
    label: "Empresa reconheceu o erro",
    multiplicador: 1.15,
  },
  {
    id: "big_tech",
    label: "Big Tech / plataforma digital",
    multiplicador: 1.1,
  },
] as const;

export type AgravanteId = (typeof AGRAVANTES_OPCOES)[number]["id"];

const BASE_CAUSA_POR_AREA: Record<AreaProblema, { min: number; max: number }> = {
  "Bloqueio/suspensão de conta digital": { min: 2000, max: 10000 },
  "Cancelamento indevido de serviço": { min: 2000, max: 8000 },
  "Cobrança indevida/cartão/banco": { min: 1500, max: 8000 },
  "Negativação indevida (SPC/Serasa)": { min: 3000, max: 15000 },
  "Falha em produto ou entrega": { min: 1500, max: 8000 },
  "Plano de saúde negando cobertura": { min: 5000, max: 20000 },
  "Demissão / direitos trabalhistas": { min: 3000, max: 15000 },
  "INSS / benefício negado": { min: 3000, max: 10000 },
  Outro: { min: 1000, max: 5000 },
};

export function calcularEstimativaCausa(
  area: AreaProblema,
  agravantes: AgravanteId[]
): { min: number; max: number; multiplicador: number } {
  const base = BASE_CAUSA_POR_AREA[area] ?? BASE_CAUSA_POR_AREA.Outro;
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
