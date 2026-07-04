/** Public constants — United States (FTC / state UDAP / CCPA where applicable). */

import { z } from "zod";

import { REFERENCIA_CONSULTA_ADVOCATICIA } from "@/lib/constants/fontes-publicas";

export const NOME_SERVICO_PUBLICO = "Documentary Legal Research";
export const NOME_SERVICO_ALTERNATIVO = "Precedent Analysis";

export const AVISO_LEGAL_RELATORIO =
  "This document is a public-source research report. It is not legal advice, an opinion, or legal guidance.";

export const AVISO_LEGAL_TELA =
  "Organization of research from public sources. Does not replace an attorney. Not legal advice.";

export const NOTA_APROVACAO_CLIENTE =
  "Pricing and scope are shown so you can choose the option that fits your case.";

export const AREAS_PROBLEMA = [
  "Unauthorized charges / billing errors",
  "Defective product or non-delivery",
  "Cancellation not honored",
  "Unfair contract terms",
  "Privacy / data misuse",
  "Telecom or subscription dispute",
  "Other",
] as const;

export type AreaProblema = (typeof AREAS_PROBLEMA)[number];

export const FUNDAMENTOS_OPCOES = [
  { id: "ftc_5", label: "FTC Act §5 — unfair or deceptive practices" },
  { id: "ccpa", label: "CCPA — consumer privacy rights (California)" },
  { id: "udap", label: "State UDAP statutes — unfair trade practices" },
  { id: "fcba", label: "FCBA — billing error disputes" },
  { id: "fdcpa", label: "FDCPA — debt collection (where applicable)" },
] as const;

export type FundamentoId = (typeof FUNDAMENTOS_OPCOES)[number]["id"];

export function labelFundamento(id: FundamentoId): string {
  return FUNDAMENTOS_OPCOES.find((f) => f.id === id)?.label ?? id;
}

export const PRECIFICACAO = {
  essencial: { label: "Essential", valor: 29, descricao: "Up to 2 precedents", maxPrecedentes: 2 },
  padrao: { label: "Standard", valor: 39, descricao: "3 to 5 precedents", maxPrecedentes: 5 },
  completo: { label: "Complete", valor: 59, descricao: "6+ references", maxPrecedentes: 99 },
} as const;

export const PRECIFICACAO_TEXTO_COMPARATIVO =
  `Typical attorney consultation: $${REFERENCIA_CONSULTA_ADVOCATICIA.faixaMinima}–${REFERENCIA_CONSULTA_ADVOCATICIA.faixaMaximaComum}. ` +
  "Documentary research from public U.S. sources.";

export function formatarNumeroReferencia(numeroSequencial: number, ano = new Date().getFullYear()) {
  return `US-${ano}-${String(numeroSequencial).padStart(4, "0")}`;
}

export function calcularValorSugerido(qtdPrecedentes: number, fundamentosCount: number): number {
  if (qtdPrecedentes > 5 || fundamentosCount >= 4) return PRECIFICACAO.completo.valor;
  if (qtdPrecedentes > 2) return PRECIFICACAO.padrao.valor;
  return PRECIFICACAO.essencial.valor;
}

export function labelFaixaPreco(valor: number): string {
  if (valor >= PRECIFICACAO.completo.valor) return PRECIFICACAO.completo.label;
  if (valor >= PRECIFICACAO.padrao.valor) return PRECIFICACAO.padrao.label;
  return PRECIFICACAO.essencial.label;
}

export const resultadoTriagemSchema = z.object({
  classificacao_interna: z.object({
    area: z.string(),
    subarea: z.string(),
    grau_urgencia: z.enum(["VERMELHO", "AMARELO", "VERDE"]),
  }),
  analise_fatores: z.object({
    complexidade: z.enum(["simples", "medio", "complexo"]),
    faixa_estimada_causa: z.enum(["BAIXO_VALOR", "MEDIO_VALOR", "ALTO_VALOR", "INDETERMINADO"]),
    via_sugerida_referencia_interna: z.string(),
    risco_prescricao_evidente: z.boolean(),
  }),
  resumo_estruturado_fatos: z.string(),
});

export type ResultadoTriagem = z.infer<typeof resultadoTriagemSchema>;
