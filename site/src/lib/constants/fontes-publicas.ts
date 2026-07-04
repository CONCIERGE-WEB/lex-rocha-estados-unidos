export type FontePublica = {
  nome: string;
  descricao: string;
  url: string;
  tipo: "jurisprudencia" | "legislacao" | "consumidor" | "dados_abertos";
};

export const FONTES_PESQUISA_PUBLICA: FontePublica[] = [
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
  "The references below were consulted from public sources at the time of research. " +
  "Verify on official portals before making any decision.";

export const REFERENCIA_CONSULTA_ADVOCATICIA = {
  faixaMinima: 150,
  faixaMaximaComum: 400,
  unidade: "USD",
  nota: "Orientation range for attorney consultation in the U.S. (varies by state).",
} as const;
