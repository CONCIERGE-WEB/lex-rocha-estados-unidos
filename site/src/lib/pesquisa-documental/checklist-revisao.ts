export const ITENS_CHECKLIST_REVISAO = [
  {
    id: "precedentes_amostra",
    label:
      "Conferi amostra de precedentes (links do pacote abrem e o resumo bate com a fonte).",
  },
  {
    id: "sintese_tom",
    label:
      "Li a síntese final — linguagem descritiva, sem parecer ou recomendação de ação.",
  },
  {
    id: "plano_valor",
    label: "Plano e valor cobrado conferem com o pacote de pesquisa (qtd. de referências).",
  },
  {
    id: "aviso_legal",
    label: "Aviso legal consta no final do relatório.",
  },
  {
    id: "sem_pii",
    label: "Não há nome, CPF, e-mail ou número de processo no texto entregue.",
  },
] as const;

export type ItemChecklistRevisaoId = (typeof ITENS_CHECKLIST_REVISAO)[number]["id"];

export type EstadoChecklistRevisao = Record<ItemChecklistRevisaoId, boolean>;

export function estadoChecklistRevisaoInicial(): EstadoChecklistRevisao {
  return {
    precedentes_amostra: false,
    sintese_tom: false,
    plano_valor: false,
    aviso_legal: false,
    sem_pii: false,
  };
}

export function checklistRevisaoCompleto(estado: EstadoChecklistRevisao): boolean {
  return ITENS_CHECKLIST_REVISAO.every((item) => estado[item.id] === true);
}

export function itensChecklistPendentes(estado: EstadoChecklistRevisao): ItemChecklistRevisaoId[] {
  return ITENS_CHECKLIST_REVISAO.filter((item) => !estado[item.id]).map((item) => item.id);
}
