export type FilaStatus =
  | "rascunho"
  | "recebido"
  | "orcamento"
  | "aguardando_pagamento"
  | "na_fila"
  | "em_producao"
  | "pronto"
  | "entregue";

type StatusInfo = { label: string; cls: string };

const FILA_STATUS: Record<string, StatusInfo> = {
  rascunho: { label: "Rascunho", cls: "bg-slate-100 text-slate-700" },
  recebido: { label: "Recebido", cls: "bg-slate-100 text-slate-700" },
  orcamento: { label: "Orçamento", cls: "bg-amber-100 text-amber-900" },
  aguardando_pagamento: {
    label: "Aguardando pagamento",
    cls: "bg-amber-100 text-amber-900",
  },
  na_fila: { label: "Na fila", cls: "bg-blue-100 text-blue-900" },
  em_producao: { label: "Em produção", cls: "bg-indigo-100 text-indigo-900" },
  pronto: { label: "Pronto", cls: "bg-emerald-100 text-emerald-900" },
  entregue: { label: "Entregue", cls: "bg-green-100 text-green-900" },
};

export const FILA_STATUS_OPCOES: FilaStatus[] = [
  "rascunho",
  "recebido",
  "orcamento",
  "aguardando_pagamento",
  "na_fila",
  "em_producao",
  "pronto",
  "entregue",
];

export function infoFilaStatus(status: string): StatusInfo {
  return FILA_STATUS[status] ?? { label: status, cls: "bg-slate-100 text-slate-700" };
}

const PAGAMENTO_STATUS: Record<string, StatusInfo> = {
  pendente: { label: "Pendente", cls: "bg-amber-100 text-amber-900" },
  pago: { label: "Pago", cls: "bg-green-100 text-green-900" },
  cancelado: { label: "Cancelado", cls: "bg-red-100 text-red-900" },
};

export function infoPagamentoStatus(status: string): StatusInfo {
  return (
    PAGAMENTO_STATUS[status] ?? { label: status, cls: "bg-slate-100 text-slate-700" }
  );
}
