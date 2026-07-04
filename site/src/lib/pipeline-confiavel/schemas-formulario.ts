import { z } from "zod";

import {
  CATEGORIAS_PIPELINE,
  type CategoriaPipeline,
} from "@/lib/pipeline-confiavel/categorias";
import {
  cpfValido,
  dataNaoFutura,
  moedaParaCentavos,
  nomeCompletoValido,
} from "@/lib/pipeline-confiavel/validacoes";

const canalTentativa = z.enum([
  "procon",
  "consumidor.gov",
  "sac_empresa",
  "nenhum",
]);

const nomeCliente = z
  .string()
  .min(5)
  .max(120)
  .refine(nomeCompletoValido, "Informe nome e sobrenome.");

const cpfCliente = z
  .string()
  .min(11)
  .max(14)
  .refine(cpfValido, "CPF inválido.");

const dataEvento = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD).")
  .refine(dataNaoFutura, "Data não pode ser futura.");

const valorCentavos = z
  .union([z.string(), z.number()])
  .transform((v, ctx) => {
    const c = moedaParaCentavos(v);
    if (c === null) {
      ctx.addIssue({
        code: "custom",
        message: "Valor deve ser positivo (use reais, ex.: 150,00).",
      });
      return z.NEVER;
    }
    return c;
  });

const textoCurto = z.string().max(200).optional();
const textoOutro = z.string().max(120).optional();

/** Base comum a todas as categorias (contato + confirmação). */
export const camposContatoSchema = z.object({
  nome_cliente: nomeCliente,
  cpf_cliente: cpfCliente,
  email_cliente: z.string().email("E-mail inválido."),
  telefone_cliente: z.string().max(20).optional(),
  consentimento_lgpd: z.literal(true, {
    error: "É necessário aceitar o tratamento dos dados.",
  }),
});

export const negativacaoIndevidaCamposSchema = z
  .object({
    empresa_reclamada: z.string().min(2).max(200),
    data_negativacao: dataEvento,
    valor_negativado_centavos: valorCentavos,
    motivo_alegado_pela_empresa: textoCurto,
    ja_tentou_resolver_diretamente: z.boolean(),
    canal_tentativa: canalTentativa.optional(),
    possui_comprovante_quitacao: z.boolean(),
    outro_detalhe: textoOutro,
  })
  .superRefine((data, ctx) => {
    if (data.ja_tentou_resolver_diretamente && !data.canal_tentativa) {
      ctx.addIssue({
        code: "custom",
        message: "Informe o canal da tentativa de resolução.",
        path: ["canal_tentativa"],
      });
    }
  });

export const cobrancaIndevidaCamposSchema = z
  .object({
    empresa_reclamada: z.string().min(2).max(200),
    data_cobranca: dataEvento,
    valor_cobrado_centavos: valorCentavos,
    tipo_cobranca: z.enum([
      "cartao",
      "emprestimo",
      "assinatura",
      "boleto",
      "outro",
    ]),
    pagou_valor_cobrado: z.boolean(),
    ja_tentou_resolver_diretamente: z.boolean(),
    canal_tentativa: canalTentativa.optional(),
    outro_detalhe: textoOutro,
  })
  .superRefine((data, ctx) => {
    if (data.ja_tentou_resolver_diretamente && !data.canal_tentativa) {
      ctx.addIssue({
        code: "custom",
        message: "Informe o canal da tentativa de resolução.",
        path: ["canal_tentativa"],
      });
    }
  });


export const scoreCreditoCamposSchema = z.object({
  empresa_reclamada: z.string().min(2).max(200),
  data_evento: dataEvento,
  ja_tentou_resolver_diretamente: z.boolean(),
  canal_tentativa: canalTentativa.optional(),
  outro_detalhe: textoOutro,
});

export const cancelamentoNaoEfetivadoCamposSchema = z.object({
  empresa_reclamada: z.string().min(2).max(200),
  data_pedido_cancelamento: dataEvento,
  valor_cobrado_apos_centavos: valorCentavos.optional(),
  ja_tentou_resolver_diretamente: z.boolean(),
  canal_tentativa: canalTentativa.optional(),
  outro_detalhe: textoOutro,
});

export const fraudeContaDigitalCamposSchema = z.object({
  empresa_reclamada: z.string().min(2).max(200),
  data_evento: dataEvento,
  valor_envolvido_centavos: valorCentavos.optional(),
  tipo_conta: z.enum(["banco", "rede_social", "app", "outro"]),
  ja_tentou_resolver_diretamente: z.boolean(),
  canal_tentativa: canalTentativa.optional(),
  outro_detalhe: textoOutro,
});

export const produtoDefeitoAtrasoCamposSchema = z.object({
  empresa_reclamada: z.string().min(2).max(200),
  data_compra: dataEvento,
  valor_produto_centavos: valorCentavos,
  problema: z.enum(["defeito", "atraso", "nao_entrega"]),
  ja_tentou_resolver_diretamente: z.boolean(),
  canal_tentativa: canalTentativa.optional(),
  outro_detalhe: textoOutro,
});

export const planoSeguroNegativaCamposSchema = z.object({
  empresa_reclamada: z.string().min(2).max(200),
  data_negativa: dataEvento,
  tipo: z.enum(["plano_saude", "seguro"]),
  ja_tentou_resolver_diretamente: z.boolean(),
  canal_tentativa: canalTentativa.optional(),
  outro_detalhe: textoOutro,
});

const CAMPOS_POR_CATEGORIA = {
  negativacao_indevida: negativacaoIndevidaCamposSchema,
  cobranca_indevida: cobrancaIndevidaCamposSchema,
  score_credito: scoreCreditoCamposSchema,
  cancelamento_nao_efetivado: cancelamentoNaoEfetivadoCamposSchema,
  fraude_conta_digital: fraudeContaDigitalCamposSchema,
  produto_defeito_atraso: produtoDefeitoAtrasoCamposSchema,
  plano_seguro_negativa: planoSeguroNegativaCamposSchema,
} as const;

export function schemaCamposCategoria(categoria: CategoriaPipeline) {
  return CAMPOS_POR_CATEGORIA[categoria];
}

export function parseWizardSolicitacao(input: unknown) {
  const base = z
    .object({
      categoria: z.enum(CATEGORIAS_PIPELINE),
    })
    .and(camposContatoSchema)
    .safeParse(input);

  if (!base.success) return base;

  const camposSchema = schemaCamposCategoria(base.data.categoria);
  const campos = camposSchema.safeParse(input);
  if (!campos.success) return campos;

  return {
    success: true as const,
    data: {
      ...base.data,
      ...campos.data,
    },
  };
}

export type WizardSolicitacaoValido = Extract<
  ReturnType<typeof parseWizardSolicitacao>,
  { success: true }
>["data"];
