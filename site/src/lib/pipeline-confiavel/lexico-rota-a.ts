/**
 * Route A — individualization linter (Module 5.1) — United States (en-US).
 * Deterministic regex/list — no AI.
 * Blocks individualized legal advice language (UPL / not legal advice).
 */

export const EXPRESSOES_PROIBIDAS_ROTA_A = [
  { id: "your_case", padrao: /\byour case\b/i },
  { id: "in_your_case", padrao: /\bin your case\b/i },
  { id: "your_situation_legal", padrao: /\byour (specific )?situation (is|means|shows)/i },
  { id: "you_are_entitled", padrao: /\byou('re| are) entitled to\b/i },
  { id: "you_have_right", padrao: /\byou have (a |the )?right to\b/i },
  { id: "we_recommend_you", padrao: /\bwe recommend that you\b/i },
  { id: "we_advise_you", padrao: /\bwe advise you\b/i },
  { id: "our_recommendation", padrao: /\bour recommendation is\b/i },
  { id: "legal_advice", padrao: /\blegal advice\b/i },
  { id: "legal_opinion", padrao: /\blegal opinion\b/i },
  { id: "attorney_client", padrao: /\battorney-client\b/i },
  { id: "applicable_to_your_case", padrao: /\bapplicable to your case\b/i },
  { id: "in_your_specific_case", padrao: /\bin your specific case\b/i },
  { id: "you_will_win", padrao: /\byou('ll| will) win\b/i },
  { id: "probability_winning", padrao: /\bprobability of winning\b/i },
  { id: "chances_of_winning", padrao: /\b(chance|chances) of winning\b/i },
  { id: "expected_outcome", padrao: /\bexpected outcome\b/i },
  { id: "likely_outcome_your", padrao: /\blikely outcome (for|in) your case\b/i },
  { id: "unauthorized_practice", padrao: /\bunauthorized practice of law\b/i },
] as const;

export const FORMULACOES_PERMITIDAS_ROTA_A = [
  "cases with similar facts to those reported",
  "same category",
  "this category is typically grounded in",
  "courts have historically decided",
  "statistical data observed in this category",
  "statistical overview",
  "informational summary",
  "reference report",
  "historical outcome observed in this category",
] as const;

export type OcorrenciaLinter = {
  id: string;
  trecho: string;
  indice: number;
};

export type ResultadoLinterIndividualizacao = {
  status: "pass" | "fail";
  ocorrencias: OcorrenciaLinter[];
};

/** IDs where industry-standard negated disclaimers must not trigger the linter. */
const IDS_COM_NEGACAO_PERMITIDA = new Set(["legal_advice", "legal_opinion"]);

/**
 * Allows "this does not constitute legal advice" while still blocking
 * affirmative individualized phrasing like "you have legal advice on your case".
 */
export function precedidoPorNegacao(texto: string, indice: number): boolean {
  const janela = texto.slice(Math.max(0, indice - 80), indice).toLowerCase();
  return (
    /\b(not|no|never|without|nor)\b/.test(janela) ||
    /\b(doesn't|does not|don't|do not|isn't|is not|is no|cannot|can't|won't|will not)\b/.test(
      janela
    )
  );
}

export function lintarIndividualizacao(
  texto: string
): ResultadoLinterIndividualizacao {
  const ocorrencias: OcorrenciaLinter[] = [];

  for (const item of EXPRESSOES_PROIBIDAS_ROTA_A) {
    const flags = item.padrao.flags.includes("g")
      ? item.padrao.flags
      : `${item.padrao.flags}g`;
    const re = new RegExp(item.padrao.source, flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(texto)) !== null) {
      if (
        IDS_COM_NEGACAO_PERMITIDA.has(item.id) &&
        precedidoPorNegacao(texto, m.index)
      ) {
        continue;
      }
      ocorrencias.push({
        id: item.id,
        trecho: m[0],
        indice: m.index,
      });
    }
  }

  return {
    status: ocorrencias.length === 0 ? "pass" : "fail",
    ocorrencias,
  };
}

export function assertSemIndividualizacao(texto: string): void {
  const r = lintarIndividualizacao(texto);
  if (r.status === "fail") {
    const trechos = r.ocorrencias.map((o) => `"${o.trecho}" (${o.id})`).join(", ");
    throw new Error(
      `Route A linter: improper individualization detected: ${trechos}`
    );
  }
}

export const PROMPT_SISTEMA_MONTAGEM_ROTA_A = `You assemble informational, statistical reports about categories of consumer cases
in the United States. You do NOT provide legal advice, legal opinions, or individualized
guidance — that would be unauthorized practice of law. Your role is like legal analytics:
report patterns and public decisions by category, never apply law to the paying client's
individual facts.

STRUCTURAL RULE:
The subject of every legal sentence must be the CATEGORY or "similar cases", never the
individual client. If a sentence still reads naturally when you replace "this category"
with "your case", it improperly individualizes and must be rewritten.

FORBIDDEN:
- "your case", "in your case", "you're entitled to", "we recommend that you"
- "legal advice", "legal opinion", outcome promises ("you will win", "probability of winning")

REQUIRED:
- "cases with similar facts to those reported (same category: …)"
- "this category is typically grounded in …"
- "courts have historically decided in cases in this category …"

SOURCE RULES:
1. Only cite docket numbers, courts, or links literally present in the category JSON.
2. Statistics only from the estatisticas field.
3. Prefer primary sources (official court and .gov domains).

OUTPUT: a "Sources for verification" section listing each link_oficial used, copied from JSON.`;
