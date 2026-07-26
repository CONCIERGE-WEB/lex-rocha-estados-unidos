/**
 * Default CourtListener search queries per US pipeline category.
 * Queries are research seeds only — results must come from the API, never invented.
 */

import type { CategoriaPipeline } from "@/lib/pipeline-confiavel/categorias";

export const COURT_LISTENER_QUERIES: Record<
  CategoriaPipeline,
  { label: string; q: string }
> = {
  fcra_credit_reporting: {
    label: "FCRA credit reporting",
    q: '"Fair Credit Reporting Act" OR FCRA (credit report OR consumer reporting) damages',
  },
  fdcpa_debt_collection: {
    label: "FDCPA debt collection",
    q: '"Fair Debt Collection Practices Act" OR FDCPA (debt collector OR collection) damages',
  },
  tcpa_robocalls: {
    label: "TCPA robocalls / spam",
    q: '"Telephone Consumer Protection Act" OR TCPA (robocall OR autodialer OR "text message") damages',
  },
  lemon_law_warranty: {
    label: "Lemon Law / Magnuson-Moss",
    q: '("lemon law" OR "Magnuson-Moss") (warranty OR defect OR vehicle OR automobile) consumer',
  },
  udap_deceptive_practices: {
    label: "UDAP unfair / deceptive",
    q: '(UDAP OR "unfair and deceptive" OR "unfair or deceptive" OR "junk fee") (consumer OR FTC) damages',
  },
  dot_flights_baggage: {
    label: "DOT flights / baggage",
    q: '(airline OR "air carrier") (baggage OR delay OR cancellation) (DOT OR "Department of Transportation")',
  },
  health_plan_denial: {
    label: "Health plan denial",
    q: '(ERISA OR "health insurance" OR "bad faith") (denial OR "claim denied" OR coverage) benefits',
  },
};

export function queryCourtListenerParaCategoria(
  categoria: CategoriaPipeline
): string {
  return COURT_LISTENER_QUERIES[categoria].q;
}
