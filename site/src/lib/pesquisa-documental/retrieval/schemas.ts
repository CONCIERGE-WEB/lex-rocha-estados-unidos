import { z } from "zod";

import type { FundamentoId } from "@/lib/constants/pesquisa-documental";

export const itemPrecedentePacoteSchema = z.object({
  url: z.string().url(),
  resumoOperador: z.string().min(10),
  tribunal: z.string().optional(),
  consultadoEm: z.string().datetime().optional(),
  trechoFonte: z.string().optional(),
});

export type ItemPrecedentePacote = z.infer<typeof itemPrecedentePacoteSchema>;

export const itemLegislacaoPacoteSchema = z.object({
  fundamentoId: z.custom<FundamentoId>(),
  titulo: z.string().min(3),
  url: z.string().url(),
  artigoRef: z.string().min(2),
  consultadoEm: z.string().datetime().optional(),
  trechoFonte: z.string().optional(),
});

export type ItemLegislacaoPacote = z.infer<typeof itemLegislacaoPacoteSchema>;

export const planoDocumentalSchema = z.discriminatedUnion("tipo", [
  z.object({
    tipo: z.literal("sem_cobranca"),
    motivo: z.literal("sem_precedente_comparavel"),
    valor: z.literal(0),
    label: z.literal("Sem cobrança"),
  }),
  z.object({
    tipo: z.literal("cobranca"),
    faixa: z.enum(["essencial", "padrao", "completo"]),
    valor: z.number().positive(),
    label: z.string().min(3),
    qtdPrecedentes: z.number().int().nonnegative(),
    qtdFundamentos: z.number().int().positive(),
  }),
]);

export type PlanoDocumental = z.infer<typeof planoDocumentalSchema>;

export const pacotePesquisaDocumentalSchema = z.object({
  montadoEm: z.string().datetime(),
  precedentes: z.array(itemPrecedentePacoteSchema),
  legislacao: z.array(itemLegislacaoPacoteSchema),
  plano: planoDocumentalSchema,
  urlsAutorizadas: z.array(z.string().url()).min(1),
});

export type PacotePesquisaDocumental = z.infer<typeof pacotePesquisaDocumentalSchema>;

export const resultadoValidacaoCitacoesSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("ok"),
    urlsEncontradas: z.array(z.string()),
  }),
  z.object({
    status: z.literal("erro"),
    urlsNaoAutorizadas: z.array(z.string()),
    mensagem: z.string(),
  }),
]);

export type ResultadoValidacaoCitacoes = z.infer<typeof resultadoValidacaoCitacoesSchema>;
