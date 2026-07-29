/**
 * Contadores reais do corpus CourtListener (report-models/granted).
 * Usa cluster_id único — não soma células que repetem a mesma opinião seed.
 */
import { existsSync, readdirSync } from "fs";
import { join } from "path";

import {
  carregarCorpusGranted,
  raizCorpusGranted,
} from "@/lib/fontes-us/corpus-loader";
import {
  CATEGORIA_LABELS,
  normalizarCategoriaPipeline,
  type CategoriaPipeline,
} from "@/lib/pipeline-confiavel/categorias";

/** Categorias com tração suficiente para destaque de volume no request/checkout. */
export const CATEGORIAS_VOLUME_DESTAQUE = [
  "dot_flights_baggage",
  "health_plan_denial",
] as const satisfies readonly CategoriaPipeline[];

export type CorpusVolumeStats = {
  category: CategoriaPipeline;
  label: string;
  /** Opiniões únicas (cluster_id) — métrica honestá para selo. */
  uniqueOpinions: number;
  /** Jurisdições com pelo menos 1 item no corpus local. */
  jurisdictionsWithItems: number;
  /** Soma bruta de `total` por célula (pode repetir a mesma opinião). Só auditoria. */
  cellTotalSum: number;
  fonte: "report-models/granted";
  geradoEm: string;
};

export function contarVolumeCorpusCategoria(
  categoria: string,
  cwd = process.cwd()
): CorpusVolumeStats | null {
  const cat = normalizarCategoriaPipeline(categoria);
  if (!cat) return null;

  const dir = join(raizCorpusGranted(cwd), cat);
  if (!existsSync(dir)) {
    return {
      category: cat,
      label: CATEGORIA_LABELS[cat],
      uniqueOpinions: 0,
      jurisdictionsWithItems: 0,
      cellTotalSum: 0,
      fonte: "report-models/granted",
      geradoEm: new Date().toISOString(),
    };
  }

  const ids = new Set<number | string>();
  let jurisdictionsWithItems = 0;
  let cellTotalSum = 0;

  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const corpus = carregarCorpusGranted(cat, ent.name, cwd);
    if (!corpus || corpus.itens.length === 0) continue;
    jurisdictionsWithItems += 1;
    cellTotalSum += corpus.total;
    for (const item of corpus.itens) {
      if (item.cluster_id != null) ids.add(item.cluster_id);
    }
  }

  return {
    category: cat,
    label: CATEGORIA_LABELS[cat],
    uniqueOpinions: ids.size,
    jurisdictionsWithItems,
    cellTotalSum,
    fonte: "report-models/granted",
    geradoEm: new Date().toISOString(),
  };
}

export function textoSeloVolume(stats: CorpusVolumeStats): string {
  if (stats.uniqueOpinions <= 0) {
    return "Corpus awaiting CourtListener sync — no invented cases.";
  }
  const n = stats.uniqueOpinions.toLocaleString("en-US");
  const j = stats.jurisdictionsWithItems.toLocaleString("en-US");
  return `${n} public CourtListener opinion${stats.uniqueOpinions === 1 ? "" : "s"} indexed · ${j} jurisdiction${stats.jurisdictionsWithItems === 1 ? "" : "s"}`;
}
