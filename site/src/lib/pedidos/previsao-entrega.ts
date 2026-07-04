import {
  CAPACIDADE_OPERACIONAL,
  type FaixaRelatorio,
} from "@/lib/pedidos/capacidade";

/** Adiciona dias úteis (seg–sex) */
export function adicionarDiasUteis(inicio: Date, diasUteis: number): Date {
  const data = new Date(inicio);
  let restantes = diasUteis;

  while (restantes > 0) {
    data.setDate(data.getDate() + 1);
    const dia = data.getDay();
    if (dia !== 0 && dia !== 6) restantes -= 1;
  }

  return data;
}

export function calcularPrevisaoEntrega(params: {
  posicaoNaFila: number;
  faixa: FaixaRelatorio;
  aPartirDe?: Date;
}): Date {
  const { horasPorRelatorio, horasUteisPorDia, maxRelatoriosPorDia } =
    CAPACIDADE_OPERACIONAL;
  const horasTotais =
    Math.max(1, params.posicaoNaFila) * horasPorRelatorio[params.faixa];
  const diasProducao = Math.ceil(horasTotais / horasUteisPorDia);
  const diasFila = Math.max(diasProducao, Math.ceil(params.posicaoNaFila / maxRelatoriosPorDia));
  const bufferDias = 1;

  return adicionarDiasUteis(params.aPartirDe ?? new Date(), diasFila + bufferDias);
}

export function formatarDataPrevisao(data: Date): string {
  return data.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
