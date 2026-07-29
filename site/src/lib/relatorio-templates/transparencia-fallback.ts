/**
 * Irrevocable transparency protocol when local State/District corpus is thin
 * and the report uses federated / supporting case law (BFS-style fallback).
 *
 * Brand: Judicial Intelligence | Tiago A. Rocha
 * Never invent precedents — only label real CourtListener-backed cells.
 */

export const MARCA_JUDICIAL_INTELLIGENCE =
  "Judicial Intelligence | Tiago A. Rocha" as const;

/** Highlight label for non-local supporting opinions. */
export function rotuloSupportingCaseLaw(stateOrDistrict: string): string {
  const s = stateOrDistrict.trim().toUpperCase() || "N/A";
  return `**Supporting Case Law - State/District ${s}**`;
}

/**
 * Institutional note when the local cell is empty and fallback corpus is used.
 */
export function notaTransparenciaFallbackUs(params: {
  stateCliente: string;
  stateUsado: string;
  nivel?: "federal" | "estadual" | null;
  notaJurisdicao?: string | null;
}): string {
  const local = params.stateCliente.trim().toUpperCase() || "THIS STATE/DISTRICT";
  const apoio = params.stateUsado.trim().toUpperCase() || "US";
  const marca = MARCA_JUDICIAL_INTELLIGENCE;
  const jurisExtra = params.notaJurisdicao?.trim()
    ? ` ${params.notaJurisdicao.trim()}`
    : "";

  return (
    `**${marca}** informs that no identical public precedents were index-matched ` +
    `in the official repository of this State/District (**${local}**) up to the present date. ` +
    `A thin local cell may reflect a high volume of confidential out-of-court settlements, ` +
    `court docket indexing latency, or specific factual search parameters — without disparaging ` +
    `the local courts. ` +
    `To keep a grounded legal substrate for the client, this report includes ` +
    `${rotuloSupportingCaseLaw(apoio)} as a regional orientation signal (not a substitute for ` +
    `binding local precedent).` +
    jurisExtra
  );
}
