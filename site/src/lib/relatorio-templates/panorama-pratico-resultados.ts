/**
 * Final "Practical Results & Statutory Damages" block (EN).
 * Uses only catalogued sample notes + statutory reference — no prognosis.
 */
import { formatarBlocoStatutoryDamagesMarkdown } from "@/lib/relatorio-templates/statutory-damages";
import type { CategoriaPipeline } from "@/lib/pipeline-confiavel/categorias";

export type EntradaPanoramaPratico = {
  categoria: CategoriaPipeline | string;
  /** Observed relief phrases already curated (max 4). Never invent. */
  determinacoesCuradas?: string[];
  /** Bank field `faixa_indenizacao_observada` — never invent. */
  faixaIndenizacaoObservada?: string | null;
  /** Optional sample-size note already computed elsewhere. */
  notaAmostra?: string | null;
};

export function faixaIndenizacaoAusente(faixa: string | null | undefined): boolean {
  const t = (faixa ?? "").trim().toLowerCase();
  if (!t) return true;
  return (
    t.includes("not catalog") ||
    t.includes("não catalog") ||
    t.includes("nao catalog") ||
    t.includes("n/d") ||
    t === "—" ||
    t === "-"
  );
}

export function textoFaixaIndenizacaoHonesta(
  faixa: string | null | undefined
): string {
  if (faixaIndenizacaoAusente(faixa)) {
    return (
      "This bank version **has no catalogued average damages range in USD**. " +
      "When a public decision states an amount granted, it appears next to that case — " +
      "**without inventing an average**."
    );
  }
  return (
    `Observed range in the curated bank for this category: **${(faixa ?? "").trim()}**. ` +
    "Figures come from catalogued public materials — not a prediction of your case."
  );
}

function blocoDeterminacoes(itens: string[] | undefined): string[] {
  const limpos = (itens ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 4);
  if (limpos.length === 0) {
    return [
      "_No curated practical-relief phrases are attached for this sample yet._",
    ];
  }
  return limpos.map((s) => `- ${s}`);
}

/**
 * Markdown section for the end (or executive) block of the report.
 */
export function formatarPanoramaPraticoMarkdown(
  entrada: EntradaPanoramaPratico,
  cwd = process.cwd()
): string {
  const parts = [
    "## Practical Results & Statutory Damages",
    "",
    "Informational research only. This section reports **catalogued** ranges and " +
      "observed relief phrases — it does **not** predict your outcome.",
    "",
    "### Practical results observed in similar curated materials",
    "",
    ...blocoDeterminacoes(entrada.determinacoesCuradas),
    "",
    "### Observed damages range (bank)",
    "",
    textoFaixaIndenizacaoHonesta(entrada.faixaIndenizacaoObservada),
    "",
  ];

  if (entrada.notaAmostra?.trim()) {
    parts.push("### Sample note", "", entrada.notaAmostra.trim(), "");
  }

  parts.push(formatarBlocoStatutoryDamagesMarkdown(entrada.categoria, cwd));
  return parts.join("\n");
}
