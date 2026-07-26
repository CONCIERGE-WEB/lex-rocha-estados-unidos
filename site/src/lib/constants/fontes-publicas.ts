export type FontePublica = {
  nome: string;
  descricao: string;
  url: string;
  tipo: "jurisprudencia" | "legislacao" | "consumidor" | "dados_abertos";
};

export const FONTES_PESQUISA_PUBLICA: FontePublica[] = [
  {
    nome: "CourtListener / Free Law Project",
    descricao: "Case law search, opinions, and court docket metadata.",
    url: "https://www.courtlistener.com/",
    tipo: "jurisprudencia",
  },
  {
    nome: "FTC — Consumer Protection",
    descricao: "Federal Trade Commission guidance and enforcement actions.",
    url: "https://www.ftc.gov/",
    tipo: "consumidor",
  },
  {
    nome: "CFPB — Consumer Financial Protection Bureau",
    descricao: "Public complaints and consumer finance guidance.",
    url: "https://www.consumerfinance.gov/",
    tipo: "consumidor",
  },
  {
    nome: "Better Business Bureau (BBB)",
    descricao: "Business complaints and dispute patterns.",
    url: "https://www.bbb.org/",
    tipo: "consumidor",
  },
  {
    nome: "Cornell LII — U.S. Code",
    descricao: "Federal statutes including consumer protection provisions.",
    url: "https://www.law.cornell.edu/uscode",
    tipo: "legislacao",
  },
  {
    nome: "State Attorney General offices",
    descricao: "State consumer protection divisions (varies by state).",
    url: "https://www.naag.org/",
    tipo: "consumidor",
  },
];

export const NOTA_FONTES_RELATORIO =
  "Case law data sourced via CourtListener / Free Law Project. " +
  "The references below were consulted from public sources at the time of research. " +
  "Verify on official portals before making any decision. " +
  "Citation does not imply endorsement by Free Law Project or any government agency.";

export const REFERENCIA_CONSULTA_ADVOCATICIA = {
  faixaMinima: 150,
  faixaMaximaComum: 400,
  unidade: "USD",
  nota: "Orientation range for attorney consultation in the U.S. (varies by state).",
} as const;
