/**
 * U.S. consumer-research categories — top-conversion statutes (Etapa 4).
 * Internal IDs are statute-oriented; legacy BR / MVP slugs map via aliases.
 */

export const CATEGORIAS_PIPELINE = [
  "fcra_credit_reporting",
  "fdcpa_debt_collection",
  "tcpa_robocalls",
  "lemon_law_warranty",
  "udap_deceptive_practices",
  "dot_flights_baggage",
  "health_plan_denial",
] as const;

export type CategoriaPipeline = (typeof CATEGORIAS_PIPELINE)[number];

export const CATEGORIA_LABELS: Record<CategoriaPipeline, string> = {
  fcra_credit_reporting: "FCRA — credit reporting / inaccurate file",
  fdcpa_debt_collection: "FDCPA — debt collection / abusive practices",
  tcpa_robocalls: "TCPA — robocalls, spam texts & autodialers",
  lemon_law_warranty: "Lemon Law / Magnuson-Moss — vehicle & product warranty",
  udap_deceptive_practices: "UDAP — unfair & deceptive acts / junk fees",
  dot_flights_baggage: "DOT — flights, delays, baggage",
  health_plan_denial: "Health insurance denial / bad faith coverage",
};

/** Legacy BR pipeline IDs + short marketing slugs → canonical US id. */
export const CATEGORIA_ALIAS_LEGADO: Readonly<Record<string, CategoriaPipeline>> = {
  negativacao_indevida: "fcra_credit_reporting",
  score_credito: "fcra_credit_reporting",
  cobranca_indevida: "fdcpa_debt_collection",
  cancelamento_nao_efetivado: "fdcpa_debt_collection",
  fraude_conta_digital: "fdcpa_debt_collection",
  voo_bagagem: "dot_flights_baggage",
  produto_defeito_atraso: "lemon_law_warranty",
  /** Renamed in Etapa 4 — keep old corpus folder readable. */
  product_warranty: "lemon_law_warranty",
  plano_seguro_negativa: "health_plan_denial",
  /** Short URL / marketing aliases (?category=fcra) */
  fcra: "fcra_credit_reporting",
  fdcpa: "fdcpa_debt_collection",
  tcpa: "tcpa_robocalls",
  lemon_law: "lemon_law_warranty",
  lemon: "lemon_law_warranty",
  udap: "udap_deceptive_practices",
  dot: "dot_flights_baggage",
  health_denial: "health_plan_denial",
  health: "health_plan_denial",
};

/**
 * Banco JSON stem under `pipeline-confiavel/banco/` (legacy filenames).
 * Categories without a mapping have no local bank yet.
 */
export const CATEGORIA_BANCO_ARQUIVO: Partial<Record<CategoriaPipeline, string>> = {
  fcra_credit_reporting: "negativacao_indevida",
  fdcpa_debt_collection: "cobranca_indevida",
};

export function normalizarCategoriaPipeline(
  value: string
): CategoriaPipeline | null {
  const v = value.trim();
  if ((CATEGORIAS_PIPELINE as readonly string[]).includes(v)) {
    return v as CategoriaPipeline;
  }
  return CATEGORIA_ALIAS_LEGADO[v] ?? null;
}

export function isCategoriaPipeline(value: string): value is CategoriaPipeline {
  return normalizarCategoriaPipeline(value) !== null;
}

/**
 * Categories offered on the public /request form (all 7 conversion statutes).
 * Name kept for BR-era imports; bank JSON may still be missing for some.
 */
export const CATEGORIAS_COM_BANCO_MVP = [
  ...CATEGORIAS_PIPELINE,
] as const satisfies readonly CategoriaPipeline[];

export type CategoriaComBancoMvp = (typeof CATEGORIAS_COM_BANCO_MVP)[number];

export function isCategoriaComBancoMvp(
  value: string
): value is CategoriaComBancoMvp {
  const n = normalizarCategoriaPipeline(value);
  return n !== null && (CATEGORIAS_COM_BANCO_MVP as readonly string[]).includes(n);
}

export function stemBancoCategoria(categoria: CategoriaPipeline): string {
  return CATEGORIA_BANCO_ARQUIVO[categoria] ?? categoria;
}
