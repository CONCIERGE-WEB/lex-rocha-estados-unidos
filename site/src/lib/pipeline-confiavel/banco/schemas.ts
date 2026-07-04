import { z } from "zod";

import { CATEGORIAS_PIPELINE } from "@/lib/pipeline-confiavel/categorias";

export const fundamentoLegalSchema = z.object({
  id: z.string().min(1),
  dispositivo: z.string().min(1),
  texto_resumido: z.string().min(1),
  link_oficial: z.string().url().optional(),
});

export const statusVerificacaoPrecedenteSchema = z.enum([
  "PENDENTE_CONFERENCIA_HUMANA",
  "REVISAO_MANUAL_COMPLETA",
  "DESCARTADO",
  "CONFIRMADO",
]);

export const jurisprudenciaCuradaSchema = z.object({
  id: z.string().min(1),
  tribunal: z.string().min(1),
  /** Número de processo ou identificador oficial (ex.: Súmula 548/STJ). Nunca gerado por IA. */
  numero_processo: z.string().min(1),
  resultado_resumido: z.string().min(1),
  link_oficial: z.string().url(),
  data_verificacao_link: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  verificado_por: z.string().min(1),
  /**
   * CONFIRMADO só após humano abrir o link da triagem.
   * Triagem automática no máximo chega a PENDENTE_CONFERENCIA_HUMANA.
   */
  status_verificacao: statusVerificacaoPrecedenteSchema.default(
    "PENDENTE_CONFERENCIA_HUMANA"
  ),
});


export const estatisticasCategoriaSchema = z.object({
  fonte: z.string().min(1),
  percentual_procedencia_estimado: z.string().min(1),
  faixa_indenizacao_observada: z.string().min(1),
  ultima_atualizacao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const entradaBancoPrecedentesSchema = z.object({
  categoria: z.enum(CATEGORIAS_PIPELINE),
  titulo: z.string().min(1),
  versao: z.string().min(1),
  /** Bloqueio técnico: produção só com true (humano conferiu fontes oficiais). */
  citacoes_conferidas: z.boolean().default(false),
  /** Quem conferiu as fontes; null enquanto pendente. */
  conferido_por: z.string().min(1).nullable(),
  data_ultima_validacao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fundamentos_legais: z.array(fundamentoLegalSchema).min(1),
  jurisprudencia: z.array(jurisprudenciaCuradaSchema).min(1),
  /** Panorama da categoria (Rota A) — nunca inventado pela IA. */
  estatisticas: estatisticasCategoriaSchema,
  texto_molde: z.string().min(20),
});


export type EntradaBancoPrecedentes = z.infer<typeof entradaBancoPrecedentesSchema>;
export type JurisprudenciaCurada = z.infer<typeof jurisprudenciaCuradaSchema>;
export type FundamentoLegal = z.infer<typeof fundamentoLegalSchema>;
