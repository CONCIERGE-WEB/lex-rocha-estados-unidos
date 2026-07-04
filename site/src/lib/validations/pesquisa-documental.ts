import { z } from "zod";

import {
  AREAS_PROBLEMA,
  FUNDAMENTOS_OPCOES,
  resultadoTriagemSchema,
} from "@/lib/constants/pesquisa-documental";

const idsFundamentos = FUNDAMENTOS_OPCOES.map((f) => f.id) as [
  (typeof FUNDAMENTOS_OPCOES)[number]["id"],
  ...(typeof FUNDAMENTOS_OPCOES)[number]["id"][],
];

const padroesPii = [
  /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/,
  /\b\d{11}\b/,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\bprocesso\s*n[º°]?\s*\d+/i,
];

export function contemDadosPessoais(texto: string): boolean {
  return padroesPii.some((re) => re.test(texto));
}

export const triagemInputSchema = z.object({
  area: z.enum(AREAS_PROBLEMA),
  fatos: z
    .string()
    .min(20, "Descreva os fatos com pelo menos 20 caracteres (sem nome ou CPF do cliente)."),
});

export const pesquisaDocumentalSchema = z.object({
  referenciaInterna: z.string().max(80).optional(),
  area: z.enum(AREAS_PROBLEMA),
  fatos: z.string().min(20, "Descreva os fatos com pelo menos 20 caracteres."),
  precedentes: z.string().min(10, "Cole os precedentes pesquisados (links e resumos)."),
  fundamentos: z
    .array(z.enum(idsFundamentos))
    .min(1, "Selecione ao menos um fundamento."),
  observacoes: z.string().max(5000).optional(),
  triagem: resultadoTriagemSchema,
});

export type PesquisaDocumentalInput = z.infer<typeof pesquisaDocumentalSchema>;

export const salvarRelatorioSchema = pesquisaDocumentalSchema.extend({
  conteudoGerado: z.string().min(50),
  modeloIa: z.string(),
  valorCobrado: z.number().positive().optional(),
  formaPagamento: z.enum(["pix", "link", "outro", "pendente"]).optional(),
  status: z.enum(["rascunho", "gerado"]).optional(),
  tokensEntrada: z.number().optional(),
  tokensSaida: z.number().optional(),
});

export type SalvarRelatorioInput = z.infer<typeof salvarRelatorioSchema>;

export const registrarPagamentoSchema = z.object({
  relatorioId: z.string().uuid(),
  valorCobrado: z.number().positive(),
  statusPagamento: z.enum(["pendente", "pago", "cancelado"]),
  formaPagamento: z.enum(["pix", "link", "outro", "pendente"]),
});
