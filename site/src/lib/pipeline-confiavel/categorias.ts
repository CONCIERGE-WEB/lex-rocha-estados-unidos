export const CATEGORIAS_PIPELINE = [
  "negativacao_indevida",
  "cobranca_indevida",
  "score_credito",
  "cancelamento_nao_efetivado",
  "fraude_conta_digital",
  "produto_defeito_atraso",
  "plano_seguro_negativa",
] as const;

export type CategoriaPipeline = (typeof CATEGORIAS_PIPELINE)[number];

export const CATEGORIA_LABELS: Record<CategoriaPipeline, string> = {
  negativacao_indevida: "Improper credit reporting / negative listing",
  cobranca_indevida: "Unauthorized charges on card or loan",
  score_credito: "Unfair credit score impact",
  cancelamento_nao_efetivado: "Cancellation not honored / charges after cancel",
  fraude_conta_digital: "Fraud or wrongful account lock",
  produto_defeito_atraso: "Defective product, delay, or non-delivery",
  plano_seguro_negativa: "Insurance or health plan denial/delay",
};

export function isCategoriaPipeline(value: string): value is CategoriaPipeline {
  return (CATEGORIAS_PIPELINE as readonly string[]).includes(value);
}

export const CATEGORIAS_COM_BANCO_MVP = [
  "negativacao_indevida",
  "cobranca_indevida",
] as const satisfies readonly CategoriaPipeline[];

export type CategoriaComBancoMvp = (typeof CATEGORIAS_COM_BANCO_MVP)[number];

export function isCategoriaComBancoMvp(
  value: string
): value is CategoriaComBancoMvp {
  return (CATEGORIAS_COM_BANCO_MVP as readonly string[]).includes(value);
}
