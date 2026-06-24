/** Company data and privacy disclosures (U.S.) */
export const EMPRESA = {
  marca: "Judicial Intelligence",
  subtitulo: "Clear reports on consumer rights",
  dominio: "judicialintelligence.com",
  url: "https://www.judicialintelligence.com",
  titular: "Tiago Aureliano da Rocha",
  ein: "61-699-939/0001-80",
  forma: "Sole Proprietorship",
  paisSede: "United States",
  atuacao: "Documentary legal research specialist",
  emailContacto: "support@judicialintelligence.com",
  emailPrivacidade: "privacy@judicialintelligence.com",
  autoridadeSupervisao: "Federal Trade Commission (FTC)",
  ftcUrl: "https://www.ftc.gov",
  bbbUrl: "https://www.bbb.org",
  bbbEntidade: "Better Business Bureau (BBB)",
  stateAttorneyGeneral: "Your state Attorney General's consumer protection office",
  moradaSede: "United States",
} as const;

export const PLANOS = [
  {
    id: "essencial",
    nome: "Essential",
    preco: 29,
    descricao:
      "For straightforward situations, without long history or multiple parties.",
    ideal: "One problem, one company",
    inclui: [
      "Case explained in plain language",
      "Up to 2 precedents in similar cases",
      "Estimated timelines and amounts",
    ],
  },
  {
    id: "padrao",
    nome: "Standard",
    preco: 39,
    destaque: true,
    descricao:
      "When there are multiple related issues or the amount at stake warrants more detail.",
    ideal: "Situation with more than one aspect",
    inclui: [
      "In-depth case analysis",
      "3 to 5 precedents in similar cases",
      "Current position and probabilities",
      "Detailed estimates",
    ],
  },
  {
    id: "completo",
    nome: "Complete",
    preco: 59,
    descricao:
      "For disputes that drag on, have a timeline, or involve more than one party.",
    ideal: "Case with history or multiple phases",
    inclui: [
      "Detailed report with timeline",
      "Extended precedent overview",
      "Estimated court and out-of-court timelines",
    ],
  },
] as const;
