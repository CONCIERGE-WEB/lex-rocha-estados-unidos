/**
 * U.S. granted-precedent corpus schemas (mirror of BR report-models/deferidos).
 * Empty cells use status `aguardando_corpus` — never invent cases.
 */

export type CorpusItemGranted = {
  state: string;
  court_id: string | null;
  case_name: string;
  cluster_id: number | null;
  absolute_url: string;
  date_filed: string | null;
  snippet: string | null;
  citation: string | null;
  source: "courtlistener";
  fetched_at: string;
};

export type CorpusGranted = {
  categoria: string;
  state: string;
  geradoEm: string;
  total: number;
  status: "aguardando_corpus" | "parcial" | "pronto";
  nota: string;
  itens: CorpusItemGranted[];
};

export const NOTA_CORPUS_VAZIO =
  "Etapa 2 cell — structure only. No invented cases. " +
  "Populate via CourtListener sync when COURTLISTENER_API_TOKEN is set.";

export function corpusVazio(
  categoria: string,
  state: string,
  geradoEm = new Date().toISOString()
): CorpusGranted {
  return {
    categoria,
    state: state.toUpperCase(),
    geradoEm,
    total: 0,
    status: "aguardando_corpus",
    nota: NOTA_CORPUS_VAZIO,
    itens: [],
  };
}
