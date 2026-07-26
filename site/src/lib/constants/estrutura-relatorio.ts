/** Standard report structure delivered (site + PDF) — U.S. EN */

export const TITULO_RELATORIO_PDF = "Consumer Rights Research Report";

export const AVISO_DESTAQUE_PDF =
  "Public-source documentary research. Not legal advice, an opinion, or a petition. " +
  "Process decisions belong exclusively to a licensed attorney.";

export const SECOES_RELATORIO_ORDEM = [
  "RECIPIENT AND PURPOSE",
  "YOUR CASE IN PLAIN LANGUAGE",
  "PRACTICAL RESULTS & STATUTORY DAMAGES",
  "WHAT U.S. LAW SAYS",
  "SIMILAR CASES ALREADY DECIDED",
  "SOURCES CONSULTED",
] as const;

/** Aliases for older section titles (already-generated reports) */
export const ALIASES_SECAO: Record<string, (typeof SECOES_RELATORIO_ORDEM)[number]> = {
  "RESUMO DOS FATOS": "YOUR CASE IN PLAIN LANGUAGE",
  "RESUMO EXECUTIVO DOS FATOS": "YOUR CASE IN PLAIN LANGUAGE",
  "FUNDAMENTOS JURÍDICOS APLICÁVEIS": "WHAT U.S. LAW SAYS",
  "PRECEDENTES JURISPRUDENCIAIS IDENTIFICADOS": "SIMILAR CASES ALREADY DECIDED",
  "CONSIDERAÇÕES FINAIS": "SOURCES CONSULTED",
  "SÍNTESE FINAL": "SOURCES CONSULTED",
  "SÍNTESE PARA REUNIÃO COM ADVOGADO(A)": "SOURCES CONSULTED",
  "DESTINATÁRIO E FINALIDADE": "RECIPIENT AND PURPOSE",
};

/** Closing limit — research only, no representation. */
export const PARAGRAFO_LIMITE_PESQUISA =
  "Every situation is different. Whether these precedents apply to your facts, " +
  "and whether any legal step makes sense, is a question for a licensed attorney. " +
  "This service delivers organized documentary research only — it does not recommend that step or replace that evaluation.";

/** @deprecated Use PARAGRAFO_LIMITE_PESQUISA */
export const PARAGRAFO_LIMITE_OAB_SINTESE = PARAGRAFO_LIMITE_PESQUISA;

export function instrucoesPromptSinteseFinal(): string {
  return `5. PRACTICAL RESULTS & STATUTORY DAMAGES
(Report only catalogued practical relief phrases and statutory/normative ranges from the platform reference. 
Do not invent averages or predict the requester's outcome. Language: clear American English.)

6. SOURCES CONSULTED
(Court/body and date only — no URLs. End here; the platform appends the official footer.)`;
}

export function textoDestinatarioFinalidade(referenciaInterna?: string): string {
  const ref = referenciaInterna?.trim()
    ? `internally identified as "${referenciaInterna.trim()}".`
    : "identified by this report's reference.";

  return (
    `Documentary research report for the requester ${ref}\n\n` +
    "We organize, in plain language, the narrated facts, legal foundations often seen in similar disputes, " +
    "and public precedents with sources for verification. " +
    "This document is informational only: we do not advise whether to hire an attorney, file a claim, or take any other step — that decision is exclusively yours."
  );
}

export function normalizarTituloSecao(titulo: string): string {
  const limpo = titulo
    .replace(/^\d+\.\s*/, "")
    .replace(/\*+/g, "")
    .trim()
    .toUpperCase();
  return ALIASES_SECAO[limpo] ?? limpo;
}

export function parseSecoesRelatorio(conteudo: string): Map<string, string> {
  const mapa = new Map<string, string>();
  const texto = conteudo.replace(/^---[\s\S]*?---\s*/m, "").trim();

  const regex =
    /(?:^|\n)(?:\d+\.\s*)?([A-ZÁÉÍÓÚÃÕÂÊÔÇ][A-ZÁÉÍÓÚÃÕÂÊÔÇ0-9\s()\/\-–—&]+?)\s*\n([\s\S]*?)(?=(?:\n(?:\d+\.\s*)?[A-ZÁÉÍÓÚÃÕÂÊÔÇ][A-ZÁÉÍÓÚÃÕÂÊÔÇ0-9\s()\/\-–—&]{8,}\s*\n)|$)/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(texto)) !== null) {
    const titulo = normalizarTituloSecao(match[1] ?? "");
    const corpo = (match[2] ?? "").trim();
    if (titulo.length >= 8 && corpo.length > 0) {
      mapa.set(titulo, corpo);
    }
  }

  if (mapa.size === 0) {
    mapa.set("RESEARCH CONTENT", texto);
  }

  return mapa;
}

export function limparMarkdownPdf(texto: string): string {
  return texto
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^---$/gm, "")
    .trim();
}
