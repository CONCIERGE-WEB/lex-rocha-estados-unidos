/**
 * Fixed system blocks (not AI-generated per report).
 */

/** Appears below the link list in every report. */
export const BLOCO_FONTES_CONFERENCIA_CURTO = `**About the sources above:** the cited precedents were selected because they address the same category and type of situation described in this report. We encourage reading the full text of each decision at the official link before taking any step, because the complete opinion may contain factual details and reasoning that a summary cannot reproduce. This report is informational and statistical about patterns in court decisions; it does not constitute legal advice and does not guarantee outcomes.`;

export const BLOCO_FONTES_POLITICA_ESTENDIDO = `Lex Rocha organizes and presents public information about court decisions and legal foundations associated with recurring consumer case categories. Cited decisions are selected based on thematic and situational similarity, and access links point to official court sources or public repositories.

Because this is informational content — not legal advice — we recommend reading the full text of each decision before relying on this report. Lex Rocha commits to keeping cited sources updated and reviewed periodically, but does not guarantee that the precedents shown automatically apply to any individual situation or ensure a specific judicial outcome.`;

export function anexarBlocoFontesConferencia(listaLinks: string): string {
  return `${listaLinks}\n\n${BLOCO_FONTES_CONFERENCIA_CURTO}\n`;
}
