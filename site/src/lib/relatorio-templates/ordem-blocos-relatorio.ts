/**
 * Canonical block order — consumer executive report (U.S.).
 * Practical results first; no prognosis.
 */
export const ORDEM_BLOCOS_RELATORIO = [
  "HEADER",
  "PRACTICAL_RESULTS",
  "CASE_UNDER_REVIEW",
  "TIMELINE",
  "LEGAL_FRAMEWORK",
  "PRECEDENTS",
  "SAMPLE_COUNT",
  "PREMIUM_MATRIX",
  "SOURCES",
  "TRANSPARENCY",
] as const;

export type BlocoRelatorioId = (typeof ORDEM_BLOCOS_RELATORIO)[number];

export const ROTULO_BLOCO_CONSUMER: Record<BlocoRelatorioId, string> = {
  HEADER: "0. Request header",
  PRACTICAL_RESULTS: "1. Practical results & statutory damages",
  CASE_UNDER_REVIEW: "2. Case under review — facts from the form",
  TIMELINE: "3. Factual timeline of cited precedents",
  LEGAL_FRAMEWORK: "4. What U.S. law says",
  PRECEDENTS: "5. Similar cases already decided",
  SAMPLE_COUNT: "6. Sample count (when available)",
  PREMIUM_MATRIX: "7. Comparative notes (Premium)",
  SOURCES: "8. Sources consulted",
  TRANSPARENCY: "9. Transparency note",
};

export const NOTA_ORDEM_BLOCOS =
  "Executive report order: practical results and catalogued statutory ranges first, " +
  "then facts, legal framework, precedents, and sources. Informational only — no prognosis.";
