/**
 * Public sample precedents for the home “similar cases” section.
 * Only CONFIRMADO entries should be shown; no invented awards.
 */

export type CasoPrecedente = {
  titulo: string;
  tribunal: string;
  ano: string;
  numero_processo?: string;
  orgao_julgador?: string;
  situacao: string;
  decisao: string;
  resultado: string;
  href: string;
  status_verificacao: "CONFIRMADO" | "PENDENTE_CONFERENCIA_HUMANA";
  categoria_id: string;
  rotuloCategoriaEmergente?: boolean;
};

/**
 * Placeholder sample pointing at official public sources.
 * Prefer CourtListener corpus cells once synced (Etapa 2).
 */
export const CASOS_PRECEDENTES_AMOSTRA: CasoPrecedente[] = [
  {
    titulo: "FCRA credit-reporting dispute procedures (public statute reference)",
    tribunal: "U.S. · FCRA",
    ano: "statutory",
    situacao:
      "Consumers disputing inaccurate credit-file information rely on FCRA reinvestigation timelines.",
    decisao:
      "The Fair Credit Reporting Act requires consumer reporting agencies to investigate disputes and correct or delete unverifiable information within set periods.",
    resultado:
      "Statutory framework only — dollar awards appear only when a cited public decision states them (never invented averages).",
    href: "https://www.ftc.gov/legal-library/browse/statutes/fair-credit-reporting-act",
    status_verificacao: "CONFIRMADO",
    categoria_id: "fcra_credit_reporting",
  },
  {
    titulo: "FDCPA debt-collection practices (public statute reference)",
    tribunal: "U.S. · FDCPA",
    ano: "statutory",
    situacao:
      "Consumers facing debt-collection communications seek clarity on validation and statutory damages caps.",
    decisao:
      "The Fair Debt Collection Practices Act sets rules for collectors and provides statutory damages in individual actions where the statute applies.",
    resultado:
      "Normative reference (e.g. up to $1,000 statutory in individual actions) — not a prediction of your case.",
    href: "https://www.consumerfinance.gov/rules-policy/regulations/1006/",
    status_verificacao: "CONFIRMADO",
    categoria_id: "fdcpa_debt_collection",
  },
];

export function casosPrecedentesHome(): CasoPrecedente[] {
  const prioritarias = new Set<string>([
    "fcra_credit_reporting",
    "fdcpa_debt_collection",
    "tcpa_robocalls",
    "lemon_law_warranty",
    "udap_deceptive_practices",
    "dot_flights_baggage",
    "health_plan_denial",
  ]);
  return CASOS_PRECEDENTES_AMOSTRA.filter(
    (c) =>
      c.status_verificacao === "CONFIRMADO" && prioritarias.has(c.categoria_id)
  );
}
