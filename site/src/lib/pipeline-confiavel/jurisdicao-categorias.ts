/**
 * Federal vs state jurisdiction for U.S. consumer categories.
 * Drives fallback rules and honest site labeling — never mix statutes silently.
 */
import {
  CATEGORIAS_PIPELINE,
  type CategoriaPipeline,
} from "@/lib/pipeline-confiavel/categorias";

export type NivelJurisdicao = "federal" | "estadual";

export type DisponibilidadeCategoria = "live" | "extended";

export type MetaJurisdicaoCategoria = {
  category: CategoriaPipeline;
  nivel: NivelJurisdicao;
  /** Site badge: Live = pool pronto; Extended = indexing + federated fallback. */
  disponibilidade: DisponibilidadeCategoria;
  /** Short EN label for UI. */
  disponibilidadeLabel: string;
  /** One-line EN note for report / request form. */
  notaJurisdicao: string;
};

const LIVE: CategoriaPipeline[] = [
  "dot_flights_baggage",
  "health_plan_denial",
];

/** Federal statutes / ERISA-style coverage — same material law nationwide. */
const FEDERAL: CategoriaPipeline[] = [
  "dot_flights_baggage",
  "fcra_credit_reporting",
  "fdcpa_debt_collection",
  "tcpa_robocalls",
  "health_plan_denial",
];

/** State-specific statutes — neighbor-state law must not be applied as local rule. */
const ESTADUAL: CategoriaPipeline[] = [
  "lemon_law_warranty",
  "udap_deceptive_practices",
];

const NOTAS: Record<CategoriaPipeline, string> = {
  dot_flights_baggage:
    "Federal DOT / aviation consumer rules apply nationwide; federal circuit opinions may supplement a thin state cell.",
  fcra_credit_reporting:
    "FCRA is federal; other federal districts/circuits are coherent when the local cell is thin.",
  fdcpa_debt_collection:
    "FDCPA is federal; federated federal opinions are coherent when the local cell is thin.",
  tcpa_robocalls:
    "TCPA is federal; federated federal opinions are coherent when the local cell is thin.",
  health_plan_denial:
    "Most employer plans are ERISA (federal). State insurance labels are shown only when the corpus cell is state-sourced.",
  lemon_law_warranty:
    "Lemon Law / warranty remedies vary by state. Reports prefer the exact state cell; any federal/UCC note is labeled and is not the neighbor state's statute.",
  udap_deceptive_practices:
    "UDAP / UCL-style unfair-deceptive statutes are state-specific (e.g. CA UCL §17200 vs NY). Neighbor-state law is not applied as local rule.",
};

export function nivelJurisdicaoCategoria(
  categoria: string
): NivelJurisdicao | null {
  const c = CATEGORIAS_PIPELINE.find((x) => x === categoria);
  if (!c) return null;
  if ((FEDERAL as readonly string[]).includes(c)) return "federal";
  if ((ESTADUAL as readonly string[]).includes(c)) return "estadual";
  return null;
}

export function disponibilidadeCategoria(
  categoria: string
): DisponibilidadeCategoria | null {
  const c = CATEGORIAS_PIPELINE.find((x) => x === categoria);
  if (!c) return null;
  return (LIVE as readonly string[]).includes(c) ? "live" : "extended";
}

export function metaJurisdicaoCategoria(
  categoria: string
): MetaJurisdicaoCategoria | null {
  const c = CATEGORIAS_PIPELINE.find((x) => x === categoria);
  if (!c) return null;
  const nivel = nivelJurisdicaoCategoria(c)!;
  const disponibilidade = disponibilidadeCategoria(c)!;
  return {
    category: c,
    nivel,
    disponibilidade,
    disponibilidadeLabel:
      disponibilidade === "live"
        ? "Live / Instantly Available"
        : "Available / Extended Federal Indexing",
    notaJurisdicao: NOTAS[c],
  };
}

export function listarMetasJurisdicao(): MetaJurisdicaoCategoria[] {
  return CATEGORIAS_PIPELINE.map((c) => metaJurisdicaoCategoria(c)!);
}

export const CATEGORIAS_FEDERAIS = FEDERAL;
export const CATEGORIAS_ESTADUAIS = ESTADUAL;
export const CATEGORIAS_LIVE = LIVE;
