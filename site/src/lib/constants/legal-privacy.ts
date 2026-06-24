import { EMPRESA } from "./empresa";

export const PRIVACY = {
  ultimaAtualizacao: "June 24, 2026",
  responsavel: EMPRESA.titular,
  contactoPrivacidade: EMPRESA.emailPrivacidade,
  finalidades: [
    "Respond to information and report requests",
    "Formalize contract and service communications",
    "Process payments and issue receipts",
    "Comply with applicable legal obligations",
  ],
  basesLegais: [
    "Performance of pre-contractual measures at your request",
    "Performance of contract",
    "Legitimate interest in security and service improvement, with safeguards",
    "Consent, when requested for non-essential cookies",
  ],
  categoriasDados: [
    "Identification and contact (name, email, phone if provided)",
    "State/ZIP code, only if you voluntarily provide it at checkout",
    "Description of your consumer situation and documents you send",
    "Minimal technical records (access date/time, abbreviated IP in security logs)",
  ],
  prazoConservacao:
    "For the duration of the request or contract and, after termination, up to 5 years for defense of rights or legal obligations, unless a longer period is required by law.",
  destinatarios: [
    "Vercel, Inc. (USA) — site hosting",
    "Supabase, Inc. (USA) — database",
    "Stripe, Inc. (USA) — payment processing",
  ],
  direitosTitular: [
    "Access, correction, deletion, and portability (where applicable)",
    "Opt out of certain processing under state privacy laws (e.g., CCPA/CPRA in California)",
    "Withdraw consent for non-essential cookies at any time",
    "File a complaint with the FTC or your state Attorney General",
  ],
  exercicioDireitos:
    "To exercise any right (including deletion), send a request to the privacy email with sufficient identification. We respond within 45 days (extendable where permitted by law).",
  encarregadoProtecao:
    "No dedicated privacy officer is required at the current scale of the service; the privacy contact below handles data subject requests.",
  transferencias:
    "Data is processed primarily in the United States. Cross-border transfers use appropriate contractual safeguards when necessary.",
} as const;

export const COOKIES = {
  essenciais:
    "Required for site operation and security (consent preferences). Do not require prior consent.",
  analiticos:
    "Only activated if you accept — measure visits in aggregate to improve the site. Require prior consent.",
  inventario: [
    {
      nome: "cookie_consent",
      tipo: "Essential",
      finalidade: "Record your cookie choice (essential or all)",
      duracao: "12 months",
      terceiros: "No",
    },
  ],
} as const;
