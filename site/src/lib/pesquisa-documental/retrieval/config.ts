import type { FundamentoId } from "@/lib/constants/pesquisa-documental";

export const DOMINIOS_RETRIEVAL_PERMITIDOS = [
  "ftc.gov",
  "consumerfinance.gov",
  "bbb.org",
  "law.cornell.edu",
  "naag.org",
  "gov",
  "uscourts.gov",
] as const;

export const RETRIEVAL_FETCH_TIMEOUT_MS = 15_000;
export const RETRIEVAL_MAX_CORPO_BYTES = 512_000;

export const LEGISLACAO_POR_FUNDAMENTO: Record<
  FundamentoId,
  { titulo: string; url: string; artigoRef: string }
> = {
  ftc_5: {
    titulo: "FTC Act",
    url: "https://www.ftc.gov/",
    artigoRef: "Section 5",
  },
  ccpa: {
    titulo: "California Consumer Privacy Act",
    url: "https://oag.ca.gov/privacy/ccpa",
    artigoRef: "Consumer rights",
  },
  udap: {
    titulo: "State UDAP statutes",
    url: "https://www.naag.org/",
    artigoRef: "Unfair practices",
  },
  fcba: {
    titulo: "Fair Credit Billing Act",
    url: "https://www.consumerfinance.gov/",
    artigoRef: "Billing errors",
  },
  fdcpa: {
    titulo: "Fair Debt Collection Practices Act",
    url: "https://www.consumerfinance.gov/",
    artigoRef: "Debt collection",
  },
};
