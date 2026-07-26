/**
 * Load local CourtListener-backed corpus under report-models/granted/<cat>/<STATE>/.
 * Does not invent coverage — missing or empty cells are explicit.
 */
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

import type { CategoriaPipeline } from "@/lib/pipeline-confiavel/categorias";
import {
  CATEGORIAS_PIPELINE,
  normalizarCategoriaPipeline,
} from "@/lib/pipeline-confiavel/categorias";
import {
  corpusVazio,
  type CorpusGranted,
  type CorpusItemGranted,
} from "@/lib/fontes-us/corpus-types";
import type { CourtListenerSearchHit } from "@/lib/fontes-us/courtlistener";

export function raizCorpusGranted(cwd = process.cwd()): string {
  return join(cwd, "report-models", "granted");
}

export function caminhoCorpusGranted(
  categoria: string,
  state: string,
  cwd = process.cwd()
): string {
  const cat = normalizarCategoriaPipeline(categoria) ?? categoria;
  return join(
    raizCorpusGranted(cwd),
    cat,
    state.toUpperCase(),
    "corpus.json"
  );
}

export function carregarCorpusGranted(
  categoria: string,
  state: string,
  cwd = process.cwd()
): CorpusGranted | null {
  const path = caminhoCorpusGranted(categoria, state, cwd);
  if (!existsSync(path)) {
    // Etapa 4 rename: lemon_law_warranty ← product_warranty (legacy folder)
    const canon = normalizarCategoriaPipeline(categoria);
    if (canon === "lemon_law_warranty") {
      const legacy = join(
        raizCorpusGranted(cwd),
        "product_warranty",
        state.toUpperCase(),
        "corpus.json"
      );
      if (existsSync(legacy)) {
        try {
          const raw = JSON.parse(readFileSync(legacy, "utf8")) as CorpusGranted;
          if (!raw || typeof raw !== "object") return null;
          return {
            ...raw,
            categoria: "lemon_law_warranty",
            total: Array.isArray(raw.itens) ? raw.itens.length : 0,
          };
        } catch {
          return null;
        }
      }
    }
    return null;
  }
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as CorpusGranted;
    if (!raw || typeof raw !== "object") return null;
    return {
      ...raw,
      total: Array.isArray(raw.itens) ? raw.itens.length : 0,

      itens: Array.isArray(raw.itens) ? raw.itens : [],
    };
  } catch {
    return null;
  }
}

/**
 * Prefer the requested state; if empty/missing, try Federal (`US`) with an explicit note.
 * Never silently copies another state's cases without labeling.
 */
export function resolverCorpusComFallbackFederal(
  categoria: string,
  state: string | null | undefined,
  cwd = process.cwd()
): {
  corpus: CorpusGranted | null;
  usado: string | null;
  notaFallback: string | null;
} {
  const st = (state || "US").toUpperCase();
  const local = carregarCorpusGranted(categoria, st, cwd);
  if (local && local.itens.length > 0) {
    return { corpus: local, usado: st, notaFallback: null };
  }
  if (st !== "US") {
    const fed = carregarCorpusGranted(categoria, "US", cwd);
    if (fed && fed.itens.length > 0) {
      return {
        corpus: fed,
        usado: "US",
        notaFallback: `Local cell ${st} empty or awaiting corpus — showing Federal (US) curated hits only, labeled as federal.`,
      };
    }
  }
  return {
    corpus: local ?? corpusVazio(categoria, st),
    usado: st,
    notaFallback:
      local?.status === "aguardando_corpus"
        ? `Cell ${st} is awaiting CourtListener sync (no invented cases).`
        : null,
  };
}

export function estadosComCorpus(
  categoria: string,
  cwd = process.cwd()
): string[] {
  const cat = normalizarCategoriaPipeline(categoria) ?? categoria;
  const dir = join(raizCorpusGranted(cwd), cat);
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name.toUpperCase())
    .filter((code) => {
      const c = carregarCorpusGranted(cat, code, cwd);
      return Boolean(c && c.itens.length > 0);
    })
    .sort();
}

export function hitsParaItensCorpus(
  hits: CourtListenerSearchHit[],
  state: string,
  fetchedAt = new Date().toISOString()
): CorpusItemGranted[] {
  return hits.map((h) => ({
    state: state.toUpperCase(),
    court_id: h.court_id,
    case_name: h.case_name,
    cluster_id: h.cluster_id,
    absolute_url: h.absolute_url,
    date_filed: h.date_filed,
    snippet: h.snippet,
    citation: h.citation,
    source: "courtlistener" as const,
    fetched_at: fetchedAt,
  }));
}

export function formatarCorpusMarkdown(
  corpus: CorpusGranted,
  maxItens = 5,
  notaFallback?: string | null
): string {
  const lines = [
    "### Public precedents (local corpus)",
    "",
    `Category \`${corpus.categoria}\` · State \`${corpus.state}\` · ${corpus.total} item(s) · status: **${corpus.status}**`,
    "",
  ];
  if (notaFallback) {
    lines.push(`_${notaFallback}_`, "");
  }
  if (corpus.itens.length === 0) {
    lines.push(`_${corpus.nota}_`);
    return lines.join("\n");
  }
  for (const item of corpus.itens.slice(0, maxItens)) {
    const when = item.date_filed ? ` (${item.date_filed})` : "";
    lines.push(`- **${item.case_name}**${when}`);
    if (item.citation) lines.push(`  - Citation: ${item.citation}`);
    if (item.snippet) lines.push(`  - Snippet: ${item.snippet.slice(0, 280)}`);
    lines.push(`  - Source: ${item.absolute_url}`);
  }
  if (corpus.itens.length > maxItens) {
    lines.push(`- _…and ${corpus.itens.length - maxItens} more in the local corpus._`);
  }
  return lines.join("\n");
}

/** Categories expected to have seeded (possibly empty) cells. */
export const CATEGORIAS_CORPUS_SEED: readonly CategoriaPipeline[] =
  CATEGORIAS_PIPELINE;

/** Launch jurisdictions for corpus cells (50 states + DC + territories + Federal). */
export const STATES_CORPUS_SEED = [
  "US",
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
  "PR",
  "GU",
  "VI",
  "AS",
  "MP",
] as const;
