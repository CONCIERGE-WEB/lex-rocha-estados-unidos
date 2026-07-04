import type { CategoriaPipeline } from "@/lib/pipeline-confiavel/categorias";
import type { ResultadoVerificacaoDeterministica } from "@/lib/pipeline-confiavel/verificacao";

export type FilaRevisaoTipo = "rapida" | "excecao";

/** Checklist obrigatório de enquadramento (Módulo 6). */
export const CHECKLIST_ENQUADRAMENTO_ITENS = [
  {
    id: "fatos_correspondem_categoria",
    label:
      "Os fatos narrados pelo cliente correspondem à categoria classificada?",
  },
  {
    id: "fundamentos_analogos",
    label:
      "Os fundamentos e precedentes do banco selecionados são de fato análogos ao caso descrito?",
  },
  {
    id: "sem_elemento_omitido",
    label:
      "Confirmei: não há elemento omitido nos campos do formulário que mude a análise (revisei a pergunta de omissão).",
  },
] as const;

export type ChecklistEnquadramentoId =
  (typeof CHECKLIST_ENQUADRAMENTO_ITENS)[number]["id"];

export type ChecklistEnquadramento = Record<ChecklistEnquadramentoId, boolean>;

export function checklistEnquadramentoVazio(): ChecklistEnquadramento {
  return {
    fatos_correspondem_categoria: false,
    fundamentos_analogos: false,
    sem_elemento_omitido: false,
  };
}

/**
 * Aprovação exige os três itens marcados.
 * Nota: o item "sem_elemento_omitido" no formulário é a pergunta
 * "Há algum elemento... que muda a análise?" — marcar true significa
 * "revisado e NÃO há elemento omitido que mude a análise" (revisor confirma ausência de omissão crítica).
 */
export function checklistPermiteAprovacao(
  checklist: ChecklistEnquadramento
): boolean {
  return (
    checklist.fatos_correspondem_categoria === true &&
    checklist.fundamentos_analogos === true &&
    checklist.sem_elemento_omitido === true
  );
}

export type ItemFilaRevisao = {
  id: string;
  categoria: CategoriaPipeline;
  categoriaOrigem: "formulario";
  verificacao: ResultadoVerificacaoDeterministica;
  fila: FilaRevisaoTipo;
  rascunho: string;
  camposCliente: Record<string, unknown>;
  checklist: ChecklistEnquadramento;
  criadoEm: string;
};

export function montarItemFilaRevisao(params: {
  id: string;
  categoria: CategoriaPipeline;
  verificacao: ResultadoVerificacaoDeterministica;
  rascunho: string;
  camposCliente: Record<string, unknown>;
  agora?: Date;
}): ItemFilaRevisao {
  const fila: FilaRevisaoTipo =
    params.verificacao.status === "pass" ? "rapida" : "excecao";

  return {
    id: params.id,
    categoria: params.categoria,
    categoriaOrigem: "formulario",
    verificacao: params.verificacao,
    fila,
    rascunho: params.rascunho,
    camposCliente: params.camposCliente,
    checklist: checklistEnquadramentoVazio(),
    criadoEm: (params.agora ?? new Date()).toISOString(),
  };
}

export function filtrarFilaRapida(itens: ItemFilaRevisao[]): ItemFilaRevisao[] {
  return itens.filter(
    (i) => i.fila === "rapida" && i.verificacao.status === "pass"
  );
}

export function filtrarFilaExcecao(itens: ItemFilaRevisao[]): ItemFilaRevisao[] {
  return itens.filter((i) => i.fila === "excecao");
}

export type AcaoRevisor = "aprovar" | "editar" | "rejeitar_para_excecao";

export class ChecklistIncompletoError extends Error {
  readonly codigo = "CHECKLIST_INCOMPLETO" as const;
  constructor() {
    super(
      "Aprovação bloqueada: marque os três itens do checklist de enquadramento."
    );
    this.name = "ChecklistIncompletoError";
  }
}

export function aplicarAcaoRevisor(
  item: ItemFilaRevisao,
  acao: AcaoRevisor,
  checklist?: ChecklistEnquadramento
): ItemFilaRevisao {
  if (acao === "rejeitar_para_excecao") {
    return { ...item, fila: "excecao" };
  }
  if (acao === "aprovar") {
    const ck = checklist ?? item.checklist;
    if (!checklistPermiteAprovacao(ck)) {
      throw new ChecklistIncompletoError();
    }
    return { ...item, checklist: ck };
  }
  return item;
}
