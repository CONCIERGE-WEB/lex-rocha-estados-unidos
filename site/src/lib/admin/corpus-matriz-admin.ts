/**
 * Admin matrix: CourtListener corpus cells (7 categories × full U.S. jurisdictions).
 * Reads report-models/granted only — no DataJud / SignalHub.
 */

import { CATEGORIA_LABELS } from "@/lib/pipeline-confiavel/categorias";
import {
  carregarCorpusGranted,
  CATEGORIAS_CORPUS_SEED,
  STATES_CORPUS_SEED,
} from "@/lib/fontes-us/corpus-loader";
import type { CorpusGranted } from "@/lib/fontes-us/corpus-types";
import { courtListenerConfigurado } from "@/lib/fontes-us/courtlistener";

export type CelulaCorpusAdmin = {
  categoria: string;
  categoriaLabel: string;
  state: string;
  /** Jurisdiction label for UI (Federal vs state courts). */
  jurisdictionLabel: string;
  status: CorpusGranted["status"] | "ausente";
  total: number;
  pathRelativo: string;
};

export type MatrizCorpusAdmin = {
  cells: CelulaCorpusAdmin[];
  totais: {
    cells: number;
    aguardando: number;
    parcial: number;
    pronto: number;
    ausente: number;
    comItens: number;
  };
  states: readonly string[];
  categorias: readonly string[];
  courtListenerToken: boolean;
  fonte: "report-models/granted";
};

function jurisdictionLabel(state: string): string {
  if (state === "US") return "Federal / nationwide";
  if (state === "DC") return "District of Columbia";
  if (["PR", "GU", "VI", "AS", "MP"].includes(state)) {
    return `U.S. territory · ${state}`;
  }
  return `State · ${state}`;
}

export function carregarMatrizCorpusAdmin(
  cwd = process.cwd()
): MatrizCorpusAdmin {
  const cells: CelulaCorpusAdmin[] = [];
  let aguardando = 0;
  let parcial = 0;
  let pronto = 0;
  let ausente = 0;
  let comItens = 0;

  for (const categoria of CATEGORIAS_CORPUS_SEED) {
    for (const state of STATES_CORPUS_SEED) {
      const corpus = carregarCorpusGranted(categoria, state, cwd);
      const pathRelativo = `report-models/granted/${categoria}/${state}/corpus.json`;
      if (!corpus) {
        ausente += 1;
        cells.push({
          categoria,
          categoriaLabel: CATEGORIA_LABELS[categoria],
          state,
          jurisdictionLabel: jurisdictionLabel(state),
          status: "ausente",
          total: 0,
          pathRelativo,
        });
        continue;
      }
      if (corpus.status === "aguardando_corpus") aguardando += 1;
      else if (corpus.status === "parcial") parcial += 1;
      else if (corpus.status === "pronto") pronto += 1;
      if (corpus.total > 0) comItens += 1;

      cells.push({
        categoria,
        categoriaLabel: CATEGORIA_LABELS[categoria],
        state,
        jurisdictionLabel: jurisdictionLabel(state),
        status: corpus.status,
        total: corpus.total,
        pathRelativo,
      });
    }
  }

  return {
    cells,
    totais: {
      cells: cells.length,
      aguardando,
      parcial,
      pronto,
      ausente,
      comItens,
    },
    states: STATES_CORPUS_SEED,
    categorias: CATEGORIAS_CORPUS_SEED,
    courtListenerToken: courtListenerConfigurado(),
    fonte: "report-models/granted",
  };
}
