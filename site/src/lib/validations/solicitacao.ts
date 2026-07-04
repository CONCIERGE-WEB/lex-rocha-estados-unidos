import { z } from "zod";

import { AREAS_PROBLEMA } from "@/lib/constants/pesquisa-documental";

export const solicitacaoPesquisaSchema = z.object({
  nome: z.string().min(2, "Informe seu nome.").max(120),
  email: z.string().email("E-mail inválido."),
  telefone: z.string().max(20).optional(),
  area: z.enum(AREAS_PROBLEMA),
  descricao: z
    .string()
    .min(30, "Descreva o caso com pelo menos 30 caracteres.")
    .max(5000),
  consentimento: z.literal(true, {
    error: "É necessário aceitar o tratamento dos dados conforme a Política de Privacidade.",
  }),
});

export type SolicitacaoPesquisaInput = z.infer<typeof solicitacaoPesquisaSchema>;

export const stripeCheckoutSchema = z.object({
  relatorioId: z.string().uuid(),
  valorCobrado: z.number().positive(),
  emailCliente: z.string().email().optional(),
});
