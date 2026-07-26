/**
 * Public sample report — FCRA credit-reporting vignette (illustrative / anonymized).
 * Section order mirrors the paid U.S. deliverable + BR anatomy
 * (header · panorama · facts · timeline · law · precedents · matrix · transparency).
 */

import { ATRIBUICAO_COURTLISTENER, DISCLAIMER_NAO_ENDORSO } from "@/lib/constants/credits";
import { TITULO_RELATORIO_PDF } from "@/lib/constants/estrutura-relatorio";

export const MODELO_CATEGORIA_ID = "fcra_credit_reporting" as const;

export const MODELO_RELATORIO_META = {
  referencia: "REL-2026-042-PREMIUM",
  dataEmissao: "July 22, 2026",
  area: "FCRA — inaccurate credit reporting / dispute",
  titulo: TITULO_RELATORIO_PDF,
  planoBadge: "PREMIUM",
  planoDescricao: "Expanded analysis · auditable public sources",
  aviso:
    "Illustrative public sample with anonymized facts — not a real client file and not a prediction of your outcome.",
} as const;

export const MODELO_CABECALHO_CLIENTE = {
  solicitante: "Jordan M. (J.M.)",
  contato: "j.***@email.com",
  state: "California / CA",
  protocolo: MODELO_RELATORIO_META.referencia,
  dataPesquisa: MODELO_RELATORIO_META.dataEmissao,
  categoria: MODELO_RELATORIO_META.area,
  plano: MODELO_RELATORIO_META.planoBadge,
  notaModelo:
    "Public sample only — on a paid report these fields come from your real request (name, email, state).",
} as const;

export type SecaoModeloRelatorio = {
  titulo: string;
  corpo: string;
};

/** Landing vignettes — one per product category (outside the report body). */
export const MODELO_EXEMPLOS_POR_CATEGORIA = [
  {
    id: "fcra",
    label: "FCRA — credit reporting",
    resumoFicticio:
      "Consumer disputed a fraudulent account; the bureau left the inaccurate entry on the file after the reinvestigation window.",
    padraoIlustrativo:
      "FCRA requires reasonable reinvestigation. Public opinions discuss statutory damages, actual damages, and bureau liability — outcomes always turn on the record.",
  },
  {
    id: "fdcpa",
    label: "FDCPA — debt collection",
    resumoFicticio:
      "Collector called family members and kept contacting after a written cease request.",
    padraoIlustrativo:
      "FDCPA cases often address harassment, third-party contacts, and statutory damages for abusive practices.",
  },
  {
    id: "tcpa",
    label: "TCPA — robocalls / texts",
    resumoFicticio:
      "Autodialed marketing texts continued after the consumer opted out.",
    padraoIlustrativo:
      "TCPA opinions discuss prior express consent, autodialers, and per-violation statutory damages.",
  },
  {
    id: "lemon",
    label: "Lemon law / warranty",
    resumoFicticio:
      "New vehicle returned repeatedly for the same defect; dealer could not repair within a reasonable number of attempts.",
    padraoIlustrativo:
      "State lemon statutes and Magnuson-Moss warranty claims appear in public refund/replacement decisions.",
  },
  {
    id: "udap",
    label: "UDAP — deceptive practices",
    resumoFicticio:
      "Advertised price did not match checkout; hidden junk fees appeared after signup.",
    padraoIlustrativo:
      "State UDAP / unfair-deceptive statutes and FTC Act §5 concepts frame many consumer restitution cases.",
  },
  {
    id: "dot",
    label: "DOT — flights / baggage",
    resumoFicticio:
      "Airline cancelled a flight and refused a refund; baggage was delayed overnight.",
    padraoIlustrativo:
      "DOT passenger-protection rules and carrier contracts of carriage are common reference points in public materials.",
  },
  {
    id: "health",
    label: "Health plan denial",
    resumoFicticio:
      "Insurer denied prior authorization for treatment the treating physician ordered.",
    padraoIlustrativo:
      "ERISA benefit-denial and bad-faith coverage opinions discuss medical necessity and appeal rights.",
  },
] as const;

export const MODELO_TIMELINE = [
  {
    titulo: "Fraudulent account appears",
    detalhe: "Unknown revolving account posts to the consumer credit file.",
  },
  {
    titulo: "Formal bureau dispute",
    detalhe: "Consumer files a written FCRA dispute with supporting identity-theft materials.",
  },
  {
    titulo: "Reinvestigation window",
    detalhe: "Bureau acknowledges the dispute; consumer awaits completion of reinvestigation.",
  },
  {
    titulo: "Inaccuracy remains",
    detalhe: "Entry remains on the file after the usual reinvestigation period; consumer seeks organized research.",
  },
] as const;

export const MODELO_MATRIZ_TENDENCIA = [
  {
    requisito: "Written dispute to the CRA",
    oQueTribunaisExigem: "Proof the consumer disputed inaccurate information with the bureau.",
    situacaoModelo: "Present in the illustrated facts",
  },
  {
    requisito: "Reasonable reinvestigation",
    oQueTribunaisExigem: "Whether the CRA conducted a reasonable investigation under FCRA.",
    situacaoModelo: "Contested in the illustrated narrative",
  },
  {
    requisito: "Willfulness / actual damages (as pled)",
    oQueTribunaisExigem: "Public opinions discuss statutory vs. actual damages depending on proof.",
    situacaoModelo: "To be evaluated on the real record — not predicted here",
  },
] as const;

export const MODELO_RELATORIO_SECOES: readonly SecaoModeloRelatorio[] = [
  {
    titulo: "1. Recipient and purpose",
    corpo:
      `Documentary research report for the requester internally identified as **${MODELO_CABECALHO_CLIENTE.solicitante}** (${MODELO_CABECALHO_CLIENTE.state}).\n\n` +
      "We organize the narrated facts, legal foundations often seen in similar U.S. disputes, and public precedents with sources for verification. " +
      "This document is informational only: we do not advise whether to hire an attorney, file a claim, or take any other step — that decision is exclusively yours.",
  },
  {
    titulo: "2. Practical results & statutory damages (observed in similar cases)",
    corpo:
      "In curated public opinions involving FCRA reinvestigation failures and inaccurate credit-file entries, courts have discussed:\n\n" +
      "• **Statutory damages** for willful noncompliance (where proven)\n" +
      "• **Actual damages** tied to documented harm from inaccurate reporting\n" +
      "• **Injunctive / corrective** relief directing investigation or correction of the file\n\n" +
      "These are **observed patterns in public cases** — not a forecast of what any court would grant on your facts.",
  },
  {
    titulo: "3. Your case in plain language",
    corpo:
      "A California consumer reports that a fraudulent revolving account remained on their credit file after a formal dispute with a nationwide consumer reporting agency. " +
      "The bureau acknowledged the dispute; the inaccurate entry allegedly remained after the reinvestigation window. " +
      "**Personal identifiers and screenshots stay in the contractual dossier — they are not reproduced in this public sample.**",
  },
  {
    titulo: "4. Timeline of facts",
    corpo: MODELO_TIMELINE.map((t, i) => `${i + 1}. **${t.titulo}** — ${t.detalhe}`).join("\n"),
  },
  {
    titulo: "5. What U.S. law says (reference framing)",
    corpo:
      "• **FCRA (15 U.S.C. § 1681 et seq.)** — duties of consumer reporting agencies, including reasonable reinvestigation after a consumer dispute.\n" +
      "• **Bureau procedures** — dispute channels and investigation timelines commonly discussed in public guidance and opinions.\n" +
      "• **Remedies discussed in case law** — statutory damages, actual damages, and related relief where the statutory elements are met.\n\n" +
      "This section is a research map, not a legal opinion on your specific claim.",
  },
  {
    titulo: "6. Similar cases already decided (sample format of the paid report)",
    corpo:
      "**Illustrative cluster — FCRA reinvestigation / inaccurate file (public sources)**\n\n" +
      "• Opinion discussing **willful FCRA noncompliance** and statutory damages where a CRA failed a reasonable reinvestigation after dispute.\n" +
      "• Opinion addressing **inaccurate tradelines remaining after dispute**, with analysis of bureau procedures.\n" +
      "• Opinion involving **identity-theft / fraudulent account** entries and consumer dispute rights under FCRA.\n\n" +
      `_${ATRIBUICAO_COURTLISTENER}_\n` +
      "On a paid report we select the closest public matches to your facts — with court, date, and a verification path. " +
      "We do not invent cases.",
  },
  {
    titulo: "7. Comparative requirements matrix (Premium sample)",
    corpo: MODELO_MATRIZ_TENDENCIA.map(
      (m) =>
        `• **${m.requisito}**\n  Courts often examine: ${m.oQueTribunaisExigem}\n  In this sample: ${m.situacaoModelo}`
    ).join("\n\n"),
  },
  {
    titulo: "8. Sources consulted & transparency",
    corpo:
      "Public U.S. case law and statutory text consulted for this sample structure (court / body and date on the paid deliverable).\n\n" +
      `${DISCLAIMER_NAO_ENDORSO}\n\n` +
      "**Informational research only.** Judicial Intelligence is not a law firm and does not provide legal advice or representation. " +
      "Every case turns on its own facts; only a licensed attorney can advise on strategy, and only a court decides outcomes.",
  },
] as const;

/** @deprecated alias — prefer MODELO_RELATORIO_SECOES */
export const MODELO_RELATORIO_SECOES_LEGACY = MODELO_RELATORIO_SECOES;
